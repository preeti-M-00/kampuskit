import React, { useContext } from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'
import Login from './pages/Login'
import EmailVerify from './pages/EmailVerify'
import ResetPassword from './pages/ResetPassword'
import IntroPage from './pages/IntroPage/IntroPage'
import { ToastContainer } from 'react-toastify';
import Home from './pages/Home'
import { AppContext } from './context/AppContext'
import NotesPage from './pages/NotesPage'
import ResumeBuilder from './pages/ResumeBuilder'
import ResumeDashboard from './pages/ResumeDashboard'
import Layout from "./pages/Layout";
import { Toaster } from 'react-hot-toast';
import PdfSummarizerPage from './pages/PdfSummarizerPage';
import VideoSummarizerPage from './pages/VideoSummarizerPage';

// Learning Assistant imports
import LearningLayout from './components/LearningLayout';
import LearningDashboard from './pages/learning/DashboardPage';
import DocumentListPage from './pages/learning/DocumentListPage';
import DocumentDetailPage from './pages/learning/DocumentDetailPage';
import FlashcardsListPage from './pages/learning/FlashcardsListPage';
import FlashcardPage from './pages/learning/FlashcardPage';
import QuizzesListPage from './pages/learning/QuizzesListPage';
import QuizTakePage from './pages/learning/QuizTakePage';
import QuizResultPage from './pages/learning/QuizResultPage';
// import ChatbotWidget from './components/ChatbotWidget'
// import PublicQuizTakePage from './pages/learning/PublicQuizTakePage';
// import PublicQuizResultPage from './pages/learning/PublicQuizResultPage';

const App = () => {
  const { isLoggedin } = useContext(AppContext);

  return (
    <div>
      <ToastContainer />
      <Toaster position="top-center" /> 
      <Routes>
        <Route path='/' element={<IntroPage />} />
        <Route path='/home' element={<Home />} />
        <Route path='/login' element={<Login />} />
        <Route path='/email-verify' element={<EmailVerify />} />
        <Route path='/reset-password' element={<ResetPassword />} />
        <Route path='/verify-account' element={<EmailVerify />} />
        <Route path='/notes' element={<NotesPage />} />
        <Route path="/app" element={<Layout />}>
          <Route index element={<ResumeDashboard />} />
          <Route path="builder/:resumeId" element={<ResumeBuilder />} />
        </Route>
        <Route path="/resume" element={<ResumeDashboard />} />
        <Route path='/pdf' element={<PdfSummarizerPage/>}/>
        <Route path='/video' element={<VideoSummarizerPage/>}/>

        {/* AI Learning Assistant - nested routes */}
        <Route path='/interview' element={<LearningLayout />}>
  <Route index element={<LearningDashboard />} />
  <Route path='documents' element={<DocumentListPage />} />
  <Route path='documents/:id' element={<DocumentDetailPage />} />
  <Route path='flashcards' element={<FlashcardsListPage />} />
  <Route path='documents/:id/flashcards' element={<FlashcardPage />} />
  <Route path='quizzes' element={<QuizzesListPage />} />
  <Route path='quizzes/:quizId' element={<QuizTakePage />} />
  <Route path='quizzes/:quizId/results' element={<QuizResultPage />} />
  {/* <Route path='/public/quizzes/:quizId' element={<PublicQuizTakePage />} />
<Route path='/public/quizzes/:quizId/results' element={<PublicQuizResultPage />} /> */}
</Route>
      </Routes>
      {/* <ChatbotWidget/> */}
    </div>
  )
}

export default App