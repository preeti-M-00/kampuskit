import React, { useContext, useEffect, useState } from 'react'
import Navbar from '../components/Navbar.jsx'
import { FiArrowRight, FiBookOpen, FiClipboard, FiFileText, FiMessageSquare, FiMic, FiYoutube } from 'react-icons/fi'
import "./Home.css"
import { AppContext } from '../context/AppContext.jsx';
import { useNavigate } from 'react-router-dom';
import ChatbotWidget from '../components/ChatbotWidget';

const Home = () => {
  const [showFeatures, setShowFeatures] = useState(false);
  const { userData, isLoggedin } = useContext(AppContext);
  console.log('userData:', userData);
  const navigate = useNavigate();

  useEffect(()=>{
    if (isLoggedin && userData?.isAccountVerified === false){
      navigate("/email-verify");
    }
  },[isLoggedin,userData]);

  // features list
  const features = [
  {
    title:"Notes App",
    desc:"Write, save and organise your study notes.",
    icon:<FiBookOpen/>,
    path:"/notes"
  },
  {
    title:"AI Resume Builder",
    desc:"Create clean ATS-friendly resumes in minutes.",
    icon:<FiFileText/>,
    path:"/app"
  },
  {
    title:"PDF Summarizer",
    desc:"Upload PDFs and get instant summaries.",
    icon:<FiClipboard/>,
    path: `${import.meta.env.VITE_PDF_SUMMARIZER_URL || 'http://localhost:3000'}?userId=${userData?._id}`
  },
  {
    title:"Video Summarizer",
    desc:"Paste a link and get key takeaways fast.",
    icon:<FiYoutube/>,
    path:"/video"
  },
  {
    title:"Grade Calculator",
    desc:"Calculate your GPA and track your academic performance.",
    icon:<FiBookOpen/>,
    path:"/Grade Calculation/index.html"
  },
  {
    title:"AI Learning Assistant",
    desc:"Upload documents, generate flashcards, quizzes and chat with your study material.",
    icon:<FiMic/>,
    path:"/interview"
  }
];

// handle click feature
const handleFeatureClick = (path) => {
  if(!isLoggedin){
    navigate("/login");
  }
  else if(path.endsWith('.html') || path.startsWith('http')){
    window.open(path, '_blank');
  }
  else{
    navigate(path);
  }
};

  return (
    <div className='home-page'>
        <Navbar/>

      <div className='hero'>
        <h1>Welcome to KampusKIT ✨</h1>
        <p>
          Your complete productivity suite for college - notes, summaries, resume & AI-powered learning.
        </p>

        {!showFeatures && (
          <button className='get-started-btn' onClick={()=>setShowFeatures(true)}>
          Get Started <FiArrowRight/>
        </button>
        )}
      </div>

        {showFeatures && (
          <div className='features-section'>
            <h2 className='features-title'>Explore Features</h2>
            <div className='features-grid'>
              {features.map((feature,idx)=>(
                <div className='feature-card' key={idx}>
                  <div className='feature-icon'>
                    {feature.icon}
                  </div>
                  <h3>{feature.title}</h3>
                  <p>{feature.desc}</p>

                  <button className='feature-open-btn' onClick={()=>handleFeatureClick(feature.path)}>Open <FiArrowRight/></button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/*---floating chatbot button--- */}
        {/* <a href="/chat" className='floating-chat-btn' onMouseEnter={e => e.currentTarget.style.transform='scale(1.1)'}
        onMouseLeave={e => e.currentTarget.style.transform='scale(1)'}
        >
          <FiMessageSquare size={24} color="white"/>
        </a> */}
        <ChatbotWidget />
    </div>
  );
};

export default Home
