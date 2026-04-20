import React, { useState } from 'react'
import LiquidEther from './LiquidEther'
import RotatingText from './RotatingText'
import './IntroPage.css'
import AuthModal from '../../components/AuthModal.jsx'

const IntroPage = () => {
  const[modalType,setModalType] = useState(null);
  return (
    <div style={{ width: '100%', height: '100vh', position: 'relative', overflow: 'hidden', backgroundColor: '#1A103F' }}>

      <LiquidEther
        colors={['#7F5AF0', '#C4A8FF', '#FFE5FF']}
        mouseForce={20}
        cursorSize={100}
        isViscous={false}
        viscous={30}
        iterationsViscous={32}
        iterationsPoisson={32}
        resolution={0.5}
        isBounce={false}
        autoDemo={true}
        autoSpeed={0.5}
        autoIntensity={2.2}
        takeoverDuration={0.25}
        autoResumeDelay={3000}
        autoRampDuration={0.6}
      />

      {/* Centered Main Text */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
        fontSize: "3rem",
        fontWeight: "700",
        position: 'absolute',
        top: '35%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 10
      }}>
        {/* Static text */}
        <span style={{ color: "#FFE5FF" }}>Productive</span>

        {/* Rotating capsule text */}
        <span
          style={{
            backgroundColor: "#5227FF",
            padding: "6px 18px",
            borderRadius: "12px",
            color: "white",
            display: "inline-flex",
            overflow: "hidden",
            whiteSpace: "nowrap",
            lineHeight: 1,
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          <RotatingText
            texts={['thinking', 'ideas', 'focus', 'solutions']}
            mainClassName="overflow-hidden"
            staggerFrom={"last"}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "-120%" }}
            staggerDuration={0.03}
            splitLevelClassName="overflow-hidden pb-0.5"
            transition={{ type: "spring", damping: 30, stiffness: 400 }}
            rotationInterval={2000}
          />
        </span>
      </div>

      {/* Login Button */}
      <div className='button-container'>
        <button className='glass-btn' onClick={()=>setModalType("login")}>Already have an account? Login</button>
        <button className='glass-btn' onClick={()=>setModalType("signup")}>New here? Sign Up</button>
      </div>

      {/*---Modal--- */}
      {modalType && (<AuthModal type={modalType} onClose={()=>setModalType(null)} onSwitch={(type)=>setModalType(type)} />
    )}

    </div>
  )
}

export default IntroPage