import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { BrainCircuit, CheckCircle2, XCircle, Home, RotateCcw } from 'lucide-react';

const PublicQuizResultPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Retrieve the results passed from the Take Page
  const resultsData = location.state?.results;
  const quizTitle = location.state?.quizTitle || 'Public Quiz';

  if (!resultsData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-6">
        <BrainCircuit className="w-16 h-16 text-slate-300 mb-4" />
        <h1 className="text-2xl font-bold text-slate-800">Results Unavailable</h1>
        <p className="text-slate-500 mt-2 mb-6">You need to take the quiz first to see results.</p>
        <button
          onClick={() => navigate('/')}
          className="px-6 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white font-semibold rounded-xl text-sm transition-colors"
        >
          Go Home
        </button>
      </div>
    );
  }

  const { score, correctAnswers, totalQuestions, detailedResults } = resultsData;

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto">
        
        {/* Header styling for public page */}
        <div className="flex items-center justify-center gap-3 mb-8">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-500 shadow-md shadow-indigo-500/20">
              <BrainCircuit className="w-6 h-6 text-white" strokeWidth={2} />
            </div>
            <span className="text-xl font-bold text-slate-800 tracking-tight">
              AI Learning Assistant
            </span>
        </div>

        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/40 border border-slate-200 p-6 sm:p-10 mb-8">
          
          <div className="text-center mb-10">
            <h1 className="text-2xl font-bold text-slate-900 mb-2">{quizTitle} - Results</h1>
            <p className="text-slate-500 text-sm">You completed this public quiz!</p>
          </div>

          {/* Score Circle */}
          <div className="flex flex-col items-center justify-center mb-10">
            <div className="relative w-40 h-40 flex items-center justify-center mb-6">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50" cy="50" r="45"
                  className="fill-none stroke-slate-100" strokeWidth="10"
                />
                <circle
                  cx="50" cy="50" r="45"
                  className={`fill-none ${score >= 70 ? 'stroke-emerald-500' : score >= 40 ? 'stroke-yellow-500' : 'stroke-red-500'}`}
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray={`${(score / 100) * 283} 283`}
                  style={{ transition: 'stroke-dasharray 1s ease-out' }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-bold text-slate-800">{score}%</span>
                <span className="text-xs font-semibold text-slate-400 mt-1 uppercase tracking-wide">Score</span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-4 sm:gap-8 w-full max-w-md">
              <div className="flex flex-col items-center bg-slate-50 px-6 py-3 rounded-2xl w-full">
                <span className="text-xl font-bold text-slate-800">{totalQuestions}</span>
                <span className="text-xs font-semibold text-slate-500 uppercase">Total</span>
              </div>
              <div className="flex flex-col items-center bg-emerald-50 px-6 py-3 rounded-2xl w-full border border-emerald-100">
                <span className="text-xl font-bold text-emerald-600">{correctAnswers}</span>
                <span className="text-xs font-semibold text-emerald-600 uppercase">Correct</span>
              </div>
              <div className="flex flex-col items-center bg-red-50 px-6 py-3 rounded-2xl w-full border border-red-100">
                <span className="text-xl font-bold text-red-600">{totalQuestions - correctAnswers}</span>
                <span className="text-xs font-semibold text-red-600 uppercase">Incorrect</span>
              </div>
            </div>
          </div>

        </div>

        {/* Detailed Review */}
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/40 border border-slate-200 p-6 sm:p-10 mb-8">
          <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
            <BookOpenIcon className="w-5 h-5 text-indigo-500" />
            Detailed Review
          </h2>
          
          <div className="space-y-6">
            {detailedResults.map((result, index) => (
              <div
                key={result.questionId}
                className={`p-6 rounded-2xl border-2 transition-colors ${
                  result.isCorrect 
                    ? 'border-emerald-100 bg-emerald-50/30' 
                    : 'border-red-100 bg-red-50/30'
                }`}
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full shrink-0 mt-0.5 ${
                    result.isCorrect ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'
                  }`}>
                    {result.isCorrect ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                  </div>
                  <div>
                    <span className="inline-block px-2.5 py-1 bg-white border border-slate-200 text-slate-600 text-[10px] font-bold uppercase tracking-wider rounded-md mb-3">
                      Question {index + 1}
                    </span>
                    <p className="font-semibold text-slate-800 text-lg leading-relaxed">
                      {result.question}
                    </p>
                  </div>
                </div>

                <div className="ml-12 space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-white border border-slate-200">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Your Answer</p>
                      <p className={`font-medium ${result.isCorrect ? 'text-emerald-600' : 'text-red-500'}`}>
                        {result.selectedAnswer || 'Not answered'}
                      </p>
                    </div>
                    {!result.isCorrect && (
                      <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100">
                        <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-2">Correct Answer</p>
                        <p className="font-medium text-emerald-700">{result.correctAnswer}</p>
                      </div>
                    )}
                  </div>

                  {result.explanation && (
                    <div className="mt-4 p-4 rounded-xl bg-indigo-50 border border-indigo-100 flex items-start gap-3">
                      <div className="shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
                        💡
                      </div>
                      <div>
                        <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-1">Explanation</p>
                        <p className="text-sm text-indigo-900 leading-relaxed">{result.explanation}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Create Your Own CTA */}
        <div className="bg-indigo-500 rounded-3xl shadow-xl shadow-indigo-200 p-8 text-center text-white mb-8">
          <BrainCircuit className="w-12 h-12 text-indigo-200 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-3">Want to make your own quizzes?</h2>
          <p className="text-indigo-100 mb-6 max-w-md mx-auto">
            Upload any PDF and our AI will automatically generate flashcards and quizzes for you in seconds.
          </p>
          <button
            onClick={() => navigate('/')}
            className="flex items-center justify-center gap-2 px-8 py-3.5 bg-white text-indigo-600 font-bold rounded-xl hover:bg-slate-50 transition-colors mx-auto"
          >
            <Home className="w-5 h-5" />
            Get Started for Free
          </button>
        </div>

      </div>
    </div>
  );
};

// SVG Icon for inline use
function BookOpenIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  );
}

export default PublicQuizResultPage;
