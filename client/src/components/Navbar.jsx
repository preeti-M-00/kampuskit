import React, { useContext, useState, useRef, useEffect } from "react";
import { FiLogOut } from "react-icons/fi";
import "./Navbar.css";
import { assets } from "../assets/assets";
import { AppContext } from "../context/AppContext";
import { toast } from "react-toastify";
import axios from "axios";
import {useNavigate} from 'react-router-dom'

const Navbar = () => {
  const navigate = useNavigate();
  const { userData, setUserData, setIsLoggedin, backendUrl } = useContext(AppContext);

  const [openDropdown, setOpenDropdown] = useState(false);
  const dropdownRef = useRef(null);

//   const handleLogout = () => {
//   setUserData(null);
//   setIsLoggedin(false);

//   localStorage.removeItem("token");
//   localStorage.setItem("isLoggedin", "false");
// };


  // const handleVerifyEmail = () => {
  //   alert("Verification email sent!");
  //   setOpenDropdown(false);
  // };

  // ✅ Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpenDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const sendVerificationOtp = async ()=>{
    try {
      axios.defaults.withCredentials = true; //sending cookies

      const {data} = await axios.post(backendUrl + '/api/auth/send-verify-otp')

      if(data.success){
        navigate('/email-verify')
        toast.success(data.message)
      }
      else{
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  const logout = async () =>{
    try {
      axios.defaults.withCredentials = true
      const { data } = await axios.post(backendUrl + '/api/auth/logout')
      data.success && setIsLoggedin(false)
      data.success && setUserData(false)
      navigate('/')
    } catch (error) {
      toast.error(error.message)
    }
  }

  return (
    <nav className="navbar">
      {/* Left */}
      <div className="nav-left">
        <img
          src={assets.logo_icon_2}
          alt="KampusKit Logo"
          className="nav-logo"
        />
      </div>

      {/* Right */}
      <div className="nav-right">
        {userData ? (
          <>
            <div className="profile">
              <div
                className="avatar-wrapper"
                ref={dropdownRef}
                onClick={() => setOpenDropdown((prev) => !prev)}
              >
                <div className="avatar">
                  {userData?.name?.[0]?.toUpperCase() || "U"}
                </div>

                {/* ✅ Dropdown */}
                <ul className={`avatar-dropdown ${openDropdown ? "show" : ""}`}>
                  {userData?.isAccountVerified === false && (
                    <li onClick={sendVerificationOtp}>Verify email</li>
                  )}
                  <li onClick={logout}>Logout</li>
                </ul>
              </div>

              <p className="username">{userData?.name || "User"}</p>
            </div>

            {/* ✅ Logout Button */}
            {/* <button className="logoutBtn" onClick={handleLogout}>
              <FiLogOut />
              Logout
            </button> */}
          </>
        ) : (
          <div className="profile">
            <div className="avatar">P</div>
            <p className="username">Preeti</p>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
