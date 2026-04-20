import React, { useContext, useState } from "react";
import "./AuthModal.css";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";

const AuthModal = ({ type, onClose, onSwitch }) => {
  const navigate = useNavigate();
  const { backendUrl, setIsLoggedin, getUserData } = useContext(AppContext);

  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    try {
      axios.defaults.withCredentials = true;

      if (type === "signup") {
        const { data } = await axios.post(`${backendUrl}/api/auth/register`, {
          name,
          email,
          password,
        });

        if (data.success) {
          localStorage.setItem("isLoggedin", "true");
          setIsLoggedin(true);
          await getUserData();
          // ✅ FIX: Use navigate instead of window.location.href
          navigate("/email-verify"); 
        } else {
          toast.error(data.message);
        }
      }

      if (type === "login") {
        const { data } = await axios.post(`${backendUrl}/api/auth/login`, {
          email,
          password,
        });

        if (data.success) {
          localStorage.setItem("isLoggedin", "true");
          setIsLoggedin(true);
          await getUserData();
          navigate("/home"); 
        } else {
          toast.error(data.message);
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div className="modal">
      <div className="modal-content auth-box" onClick={(e) => e.stopPropagation()}>
        <h2 className="auth-title">{type === "login" ? "Welcome Back" : "Create Account"}</h2>
        <p className="auth-subtitle">{type === "login" ? "Login to your account!" : "Create your account!"}</p>

        <form onSubmit={onSubmitHandler}>
          {type === "signup" && (
            <div className="input-wrapper">
              <span className="input-icon">👤</span>
              <input type="text" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
          )}

          <div className="input-wrapper">
            <span className="input-icon">📧</span>
            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>

          <div className="input-wrapper">
            <span className="input-icon">🔒</span>
            <input type={showPassword ? "text" : "password"} placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            <span className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? <FiEyeOff /> : <FiEye />}
            </span>
          </div>

          <p className="forgot" onClick={() => navigate("/reset-password")}>Forgot password?</p>

          <button className="modal-btn" type="submit">
            {type === "login" ? "Login" : "Sign Up"}
          </button>
        </form>

        <p className="switch-text">
          {type === "login" ? "Don't have an account? " : "Already have an account? "}
          <span className="switch-link" onClick={() => onSwitch(type === "login" ? "signup" : "login")}>
            {type === "login" ? "Sign up" : "Login here"}
          </span>
        </p>

        <p className="close-btn" onClick={onClose}>×</p>
      </div>
    </div>
  );
};

export default AuthModal;