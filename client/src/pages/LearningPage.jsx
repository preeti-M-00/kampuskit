// import React, { useEffect, useState, useContext } from 'react';
// import { AppContext } from '../context/AppContext';

// const LearningPage = () => {
//   const [status, setStatus] = useState('Connecting...');
//   const { userData } = useContext(AppContext);

//   useEffect(() => {
//     autoLoginOrRegister();
//   }, []);

//   const autoLoginOrRegister = async () => {
//     try {
//       const email = userData?.email || 'guest@kampuskit.com';
//       const password = userData?._id ? `kampus_${userData._id}` : 'kampuskit123';
//       const name = userData?.name || 'KampusKit';

//       // First try to login
//       const loginRes = await fetch('http://localhost:8002/api/auth/login', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ email, password })
//       });

//       const loginData = await loginRes.json();

//       if (loginData.token) {
//         localStorage.setItem('token', loginData.token);
//         localStorage.setItem('user', JSON.stringify(loginData.user));
//         window.open('http://localhost:5174/dashboard', '_blank');
//         return;
//       }

//       // If login failed try register
//       setStatus('Setting up your account...');
//       const registerRes = await fetch('http://localhost:8002/api/auth/register', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ name, email, password })
//       });

//       const registerData = await registerRes.json();

//       if (registerData.token) {
//         localStorage.setItem('token', registerData.token);
//         localStorage.setItem('user', JSON.stringify(registerData.user));
//         window.open('http://localhost:5174/dashboard', '_blank');
//       } else {
//         setStatus('Failed to connect. Please try again.');
//       }
//     } catch (err) {
//       setStatus('Connection failed. Make sure the Interview Prep server is running.');
//     }
//   };

//   return (
//     <div style={{ minHeight: '100vh', background: 'linear-gradient(to bottom, #2a1b5e, #140a30)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
//       <div style={{ textAlign: 'center' }}>
//         <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎤</div>
//         <p style={{ color: '#d1c8ff', fontSize: '16px' }}>{status}</p>
//       </div>
//     </div>
//   );
// };

// export default LearningPage;