// import React from "react";

import { Outlet, useLocation } from "react-router-dom";
import Navbar from "../components/resume/Navbar";
import { useContext } from "react";
import { AppContext } from "../context/AppContext";
import Loader from "../components/resume/Loader";
import Login from "./Login";
import { useEffect } from "react";    

const Layout = () => {
  const { userData: user } = useContext(AppContext);
  const loading = false; // Assuming AppContext doesn't have a loading state or it's handled differently
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);                  // ← reset scroll on route change
  }, [pathname]);

  // Hide the global Navbar on the ResumeBuilder page
  const hideNavbar = pathname.startsWith("/app/builder");

  if (loading) {
    return <Loader />;
  }

  return (
    <div>
      {user ? (
        <div className="min-h-screen" style={{ background: '#f3f4f6' }}>
          {!hideNavbar && <Navbar />}
          <Outlet />
        </div>
      ) : (
        <Login />
      )}
    </div>
  );
};

export default Layout;