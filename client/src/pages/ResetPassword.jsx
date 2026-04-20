import React, { useContext, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";
import "./ResetPassword.css"

const ResetPassword = () => {
  const { backendUrl } = useContext(AppContext);
  axios.defaults.withCredentials = true;
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [isOtpSubmited, setIsOtpSubmited] = useState(false);

  const inputRefs = useRef([]);

  const handleInput = (e, index) => {
    if (e.target.value && index < inputRefs.current.length - 1) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !e.target.value && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    const paste = e.clipboardData.getData("text").slice(0, 6);
    paste.split("").forEach((char, index) => {
      if (inputRefs.current[index]) {
        inputRefs.current[index].value = char;
      }
    });
  };

  // STEP 1: Send OTP
  const onSubmitEmail = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/auth/send-reset-otp`,
        { email }
      );

      if (data.success) {
        toast.success(data.message);
        setIsEmailSent(true);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // STEP 2: Submit OTP
  const onSubmitOtp = (e) => {
    e.preventDefault();
    const otpValue = inputRefs.current.map((e) => e.value).join("");

    if (otpValue.length !== 6) {
      return toast.error("Enter valid 6-digit OTP");
    }

    setOtp(otpValue);
    setIsOtpSubmited(true);
  };

  // STEP 3: Reset password
  const onSubmitNewPassword = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/auth/reset-password`,
        { email, otp, newPassword }
      );

      if (data.success) {
        toast.success(data.message);
        navigate("/");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="reset-page">
      <div className="reset-card">
        {/* EMAIL */}
      {!isEmailSent && (
        <form onSubmit={onSubmitEmail}>
          <h1>Reset Password</h1>
          <p>Enter your registered email address</p>
          <input
            type="email"
            placeholder="Email id"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button>Submit</button>
        </form>
      )}

      {/* OTP */}
      {!isOtpSubmited && isEmailSent && (
        <form onSubmit={onSubmitOtp}>
          <h1>Reset Password OTP</h1>
          <p>Enter the 6-digit code sent to your email</p>

          <div className="otp-box" onPaste={handlePaste}>
            {Array(6)
              .fill(0)
              .map((_, index) => (
                <input
                  key={index}
                  maxLength="1"
                  ref={(e) => (inputRefs.current[index] = e)}
                  onInput={(e) => handleInput(e, index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  required
                />
              ))}
          </div>
          <button>Submit</button>
        </form>
      )}

      {/* NEW PASSWORD */}
      {isOtpSubmited && isEmailSent && (
        <form onSubmit={onSubmitNewPassword}>
          <h1>New Password</h1>
          <p>Enter your new password</p>
          <input
            type="password"
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
          <button>Submit</button>
        </form>
      )}
      </div>
    </div>
  );
};

export default ResetPassword;
