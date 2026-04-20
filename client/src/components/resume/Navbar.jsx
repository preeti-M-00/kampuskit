import { UserRoundSearchIcon } from 'lucide-react'
import React from 'react'
// import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate, useLocation } from 'react-router-dom'
// import { logout } from '../app/features/authSlice'
import { useContext } from "react";
import { AppContext } from '../../context/AppContext';
const Navbar = () => {
  const { userData , logout } = useContext(AppContext);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isBuilderPage = location.pathname.includes("/app") || location.pathname==="/app";

  return (
  <div style={{ background: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', borderBottom: '1px solid #e2e8f0' }}>
    <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', maxWidth: '80rem', margin: '0 auto', padding: '12px 16px' }}>
      <Link to='/'>
        <img src="/logo.svg" alt="logo" style={{ height: '44px', width: 'auto' }} />
      </Link>
      {!isBuilderPage && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '14px' }}>
          <p>Hi, {userData?.name}</p>
          <button onClick={handleLogout} style={{ background: 'white', border: '1px solid #d1d5db', padding: '6px 28px', borderRadius: '9999px' }}>Logout</button>
        </div>
      )}
    </nav>
  </div>
)
}

export default Navbar