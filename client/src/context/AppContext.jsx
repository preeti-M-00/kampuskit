import React, { createContext, useState, useEffect } from "react";
import { toast } from "react-toastify";
import axios from "axios";

export const AppContext = createContext();

export const AppContextProvider = (props) => {
  axios.defaults.withCredentials = true;
  
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const [isLoggedin, setIsLoggedin] = useState(
    localStorage.getItem("isLoggedin") === "true"
  );

  const [userData, setUserData] = useState(null);

  // ✅ Fetch user data
  const getUserData = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/user/data`, {
        withCredentials: true,
      });

      if (data.success) {
        setUserData(data.userData);
      } else {
        setUserData(null);
      }
    } catch (error) {
      setUserData(null);
      toast.error(error.message);
    }
  };

  // ✅ Check auth
  const getAuthState = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/auth/is-auth`, {
        withCredentials: true,
      });

      if (data.success) {
        setIsLoggedin(true);
        localStorage.setItem("isLoggedin", "true");
        getUserData(); // ✅ Call here
      } else {
        setIsLoggedin(false);
        localStorage.setItem("isLoggedin", "false");
        setUserData(null);
      }
    } catch (error) {
      setIsLoggedin(false);
      localStorage.setItem("isLoggedin", "false");
      setUserData(null);
    }
  };

  useEffect(() => {
    getAuthState();
  }, []);

  const value = {
    backendUrl,
    isLoggedin,
    setIsLoggedin,
    userData,
    setUserData,
    getUserData,
  };

  return (
    <AppContext.Provider value={value}>
      {props.children}
    </AppContext.Provider>
  );
};
