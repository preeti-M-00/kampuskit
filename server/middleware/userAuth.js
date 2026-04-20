import jwt from "jsonwebtoken";
// import userModel from "../models/userModel";

const userAuth = async (req, res, next) => {
  try {
    // ✅ token can come from cookie OR header
    const token = req.cookies?.token || req.header("token");

    if (!token) {
      return res.json({ success: false, message: "Not Authorized. Login Again" });
    }

    const tokenDecode = jwt.verify(token, process.env.JWT_SECRET);

    // ✅ best practice: attach to req.userId (NOT req.body)
    req.userId = tokenDecode.id;

    next();
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

export default userAuth;
