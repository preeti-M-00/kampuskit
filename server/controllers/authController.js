import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import userModel from '../models/userModel.js';
import transporter from '../config/nodemailer.js';

export const register = async (req,res) =>{
    const{name,email,password} = req.body;

    const generateToken = (id)=>{
        return jwt.sign(
            { id },
            process.env.JWT_SECRET,
            { expiresIn:"7d"},
        );
    }

    if(!name || !email || !password){
        return res.json({success:false, message:'Missing Details'})
    }

    try {

        const existingUser = await userModel.findOne({email})
        if(existingUser){
            return res.json({success:false, message: "User already exists"});
        }
        const hashedPassword = await bcrypt.hash(password,10);

        const user = new userModel({name, email, password:hashedPassword})
        await user.save(); //to save the new user in the database

        //generate token with jwt
        const token = jwt.sign({id: user._id}, process.env.JWT_SECRET, {expiresIn: '10d'});

        res.cookie('token',token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            maxAge: 10 * 24 * 60 * 60 * 1000
        });

        //sending otp first
        const otp = String(Math.floor(100000 + Math.random() * 900000));
        user.verifyOtp = otp;
        user.verifyOtpExpireAt = Date.now() + 24 * 60 * 60 * 1000;
        await user.save();

        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: user.email,
            subject: "Verify your KampusKIT account",
            text: `Your OTP is ${otp}. Verify your account using this OTP.`
        }

        await transporter.sendMail(mailOptions);

        return res.json({
            success:true,
            message: "Account created. OTP sent to email",
            redirectTo: "/email-verify",
        });
        //sending welcome email
        // const mailOptions ={
        //     from: process.env.SENDER_EMAIL,
        //     to: email,
        //     subject: 'Welcome to KampusKIT',
        //     text: `Welcome to KampusKIT 🎉
        //     Your productivity and AI workspace starts now!

        //     Your account has been successfully created using the email:
        //     ${email}

        //     Here's what you can now access:
        //     • Notes App - Organize, edit, and manage your ideas
        //     • Resume Builder - Create ATS-friendly resumes instantly
        //     • PDF Summarizer - Understand long documents in seconds
        //     • Video Summarizer - Get key insights from YouTube videos
        //     • AI Chatbot - Ask anything, anytime
        //     • AI Interview Prep - Practice personalized interview questions

        //     We're excited to help you stay organized, learn faster, and boost your productivity everyday.

        //     Let's get started!🚀`
        // }

        // //sending the mail
        // await transporter.sendMail(mailOptions);

        // return res.json({success:true});
    } catch (error) {
        res.json({success:false, message: error.message})
    }
}

export const login = async (req,res) =>{
    const {email,password} = req.body;

    if(!email || !password){
        return res.json({success:false, message:"Email and password are required"})
    }

    try {
        const user = await userModel.findOne({email});
        if(!user){
            return res.json({success:false, message:"Invalid email"})
        }

        const isMatch = await bcrypt.compare(password,user.password);
        if(!isMatch){
            return res.json({success:false, message:"Invalid password"});
        }

        //generate token - user will be authenticated and logged in
        const token = jwt.sign({id: user._id}, process.env.JWT_SECRET, {expiresIn: '10d'});

        res.cookie('token',token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            maxAge: 10 * 24 * 60 * 60 * 1000
        });

        return res.json({success:true});

    } catch (error) {
        return res.json({success:false, message: error.message});
    } 
}

export const logout = async (req,res) =>{
    try {
        //clear cookie
        res.clearCookie('token',{
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
        })

        return res.json({success:true, message:"Logged out"})

    } catch (error) {
        return res.json({success:false, message: error.message});
    }
}

//send verification OTP to the User's email
export const sendVerifyOtp = async (req,res)=>{
    try {
        const userId = req.userId; //userid found through the cookie token
        const user = await userModel.findById(userId);
        if(user.isAccountVerified){
            return res.json({success:false,message:"Account Already Verified"})
        }

        //generate 6-digit random number
        const otp = String(Math.floor(100000 + Math.random() * 900000)); //to remove the decimal points we use math.floor

        user.verifyOtp = otp;
        user.verifyOtpExpireAt = Date.now() + 24 * 60 * 60 * 1000 // expiry date is 1 day

        await user.save();

        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: user.email,
            subject: 'Account Verification OTP',
            text: `Your OTP is ${otp}. Verify your account using this OTP.`
        }

        await transporter.sendMail(mailOptions);

        res.json({success:true, message:"Verification OTP sent to the Email"});

    } catch (error) {
        res.json({success:false,message:error.message});
    }
}

//verify email using otp
export const verifyEmail = async (req, res) => {
  const userId = req.userId;
  const { otp } = req.body;

  if (!userId || !otp) {
    return res.json({ success: false, message: "Missing Details" });
  }

  try {
    const user = await userModel.findById(userId);

    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    if (user.verifyOtp === "" || user.verifyOtp !== otp) {
      return res.json({ success: false, message: "Invalid OTP" });
    }

    if (user.verifyOtpExpireAt < Date.now()) {
      return res.json({ success: false, message: "OTP Expired" });
    }

    // ✅ mark verified
    user.isAccountVerified = true;
    user.verifyOtp = "";
    user.verifyOtpExpireAt = 0;

    await user.save();

    // ✅ send welcome email AFTER verification
    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: user.email, // ✅ FIXED
      subject: "Welcome to KampusKIT 🎉",
      text: `Welcome to KampusKIT 🎉
Your productivity and AI workspace starts now!

Your account has been successfully verified using the email:
${user.email}

Here's what you can now access:
• Notes App - Organize, edit, and manage your ideas
• AI Resume Builder - Create ATS-friendly resumes instantly
• PDF Summarizer - Understand long documents in seconds
• Video Summarizer - Get key insights from YouTube videos
• Grade Calculator - Track your GPA and academic performance effortlessly
• AI Learning Assistant - Upload documents, generate quizzes, flashcards and summaries

We're excited to help you stay organized, learn faster, and boost your productivity everyday.

Let's get started! 🚀`,
    };

    await transporter.sendMail(mailOptions);

    return res.json({
      success: true,
      message: "Email verified successfully",
    });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};


//check if user is authenticated
export const isAuthenticated = async (req,res) => {
    try {
        return res.json({success:true});
    } catch (error) {
        return res.json({success:false, message:error.message});
    }
}

//send password reset otp
export const sendResetOtp = async (req,res)=>{
    const {email} = req.body;
    if(!email){
        return res.json({success:false, message:"Email is required"})
    }

    try {
        const user = await userModel.findOne({email});
        if(!user){
            return res.json({success:false, message:"User not found"});
        }

        const otp = String(Math.floor(100000 + Math.random() * 900000));

        user.resetOtp = otp;
        user.resetOtpExpireAt = Date.now() + 15 * 60 * 1000

        await user.save();

        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: user.email,
            subject: "Password Reset OTP",
            text: `Your OTP for resetting your password is ${otp}. Use this OTP to proceed with resetting your password.`
        };

        await transporter.sendMail(mailOptions)

        return res.json({success:true, message:"OTP sent to your email"})
    } catch (error) {
        return res.json({success:false, message: error.message})
    }
}

//reset user password
export const resetPassword = async (req,res)=>{
    const {email,otp,newPassword} = req.body;

    if(!email || !otp || !newPassword){
        return res.json({success:false, message:"Email, OTP, and new password are required"});
    }

    try {
        const user = await userModel.findOne({email});
        if(!user){
            return res.json({success:false, message:"User not found"});
        }

        if(user.resetOtp === "" || user.resetOtp !== otp){
            return res.json({success:false, message:"Invalid OTP"});
        }

        if(user.resetOtpExpireAt < Date.now()){
            return res.json({success:false, message:"OTP Expired"});
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        user.password = hashedPassword;
        user.resetOtp = '';
        user.resetOtpExpireAt = 0;

        await user.save();

        return res.json({success:true, message:"Password has been reset successfully"})
    } catch (error) {
        return res.json({success:false, message: error.message});
    }
}