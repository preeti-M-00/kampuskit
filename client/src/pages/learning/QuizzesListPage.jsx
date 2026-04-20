import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import quizService from '../../services/learning/quizService';
import toast from 'react-hot-toast';
import {
  BrainCircuit, Trash2, Play, BarChart2, X, FileText, Plus, Share2,
} from 'lucide-react';

const QuizzesListPage = () => {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteQuizId, setDeleteQuizId] = useState(null);
  const [deletingQuiz, setDeletingQuiz] = useState(false);

  useEffect(() => { fetchAllQuizzes(); }, []);

  const fetchAllQuizzes = async () => {
    try {
      const response = await quizService.getAllQuizzes();
      const data = response?.data || response || [];
      setQuizzes(Array.isArray(data) ? data : []);
    } catch {
      setQuizzes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteQuiz = async () => {
    if (!deleteQuizId) return;
    setDeletingQuiz(true);
    try {
      await quizService.deleteQuiz(deleteQuizId);
      toast.success('Quiz deleted');
      setQuizzes(prev => prev.filter(q => q._id !== deleteQuizId));
    } catch {
      toast.error('Failed to delete quiz');
    } finally {
      setDeletingQuiz(false);
      setDeleteQuizId(null);
    }
  };

  const handleShareQuiz = async (e, quizId) => {
    e.stopPropagation();
    try {
      const res = await quizService.toggleShareQuiz(quizId);
      
      setQuizzes(prev => prev.map(q => 
        q._id === quizId ? { ...q, isPublic: res.data.isPublic } : q
      ));

      if (res.data.isPublic) {
        const link = `${window.location.origin}/public/quizzes/${quizId}`;
        await navigator.clipboard.writeText(link);
        toast.success('Link copied to clipboard!');
      } else {
        toast.success('Quiz is now private');
      }
    } catch (error) {
      toast.error('Failed to update sharing settings');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">All Quizzes</h1>
          <p className="text-slate-500 text-sm mt-1">
            {quizzes.length} quiz{quizzes.length !== 1 ? 'zes' : ''} across all documents
          </p>
        </div>
        <button
          onClick={() => navigate('/interview/documents')}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white font-semibold rounded-xl transition-colors text-sm"
        >
          <Plus className="w-4 h-4" strokeWidth={2} />
          New Quiz
        </button>
      </div>

      {quizzes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24">
          <div className="w-20 h-20 rounded-2xl bg-indigo-100 flex items-center justify-center mb-5">
            <BrainCircuit className="w-10 h-10 text-indigo-500" strokeWidth={1.5} />
          </div>
          <p className="text-slate-800 font-bold text-xl mb-2">No Quizzes Yet</p>
          <p className="text-slate-400 text-sm text-center max-w-xs mb-8">
            Open a document and generate a quiz to test your knowledge.
          </p>
          <button
            onClick={() => navigate('/interview/documents')}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-500 hover:bg-indigo-600 text-white font-semibold rounded-xl transition-colors"
          >
            <Plus className="w-4 h-4" strokeWidth={2} />
            Go to Documents
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {quizzes.map((quiz) => {
            const hasResults = !!quiz.completedAt;
            const scorePercent = Math.round(quiz.score || 0);
            const docTitle = quiz.documentId?.title || 'Unknown Document';

            return (
              <div
                key={quiz._id}
                className="relative bg-white border-2 border-indigo-200 hover:border-indigo-400 rounded-2xl p-5 transition-all hover:shadow-md group"
              >
                {/* Top Action Buttons */}
                <div className="absolute top-3 right-3 flex gap-2 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => handleShareQuiz(e, quiz._id)}
                    className={`w-7 h-7 flex items-center justify-center rounded-lg transition-colors ${
                      quiz.isPublic 
                        ? 'text-emerald-500 bg-emerald-50 hover:bg-emerald-100' 
                        : 'text-slate-400 hover:text-indigo-500 hover:bg-indigo-50'
                    }`}
                    title={quiz.isPublic ? "Unshare (Currently Public)" : "Share Quiz"}
                  >
                    <Share2 className="w-4 h-4" strokeWidth={2} />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); setDeleteQuizId(quiz._id); }}
                    className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                    title="Delete Quiz"
                  >
                    <Trash2 className="w-4 h-4" strokeWidth={2} />
                  </button>
                </div>

                {/* Score badge */}
                <div className="flex items-center gap-2 mb-3">
                  {hasResults ? (
                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-lg flex items-center gap-1 ${
                      scorePercent >= 70
                        ? 'bg-emerald-50 text-emerald-600'
                        : scorePercent >= 40
                        ? 'bg-yellow-50 text-yellow-600'
                        : 'bg-red-50 text-red-600'
                    }`}>
                      <BarChart2 className="w-3 h-3" strokeWidth={2} />
                      {scorePercent}%
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 bg-slate-100 text-slate-500 text-xs font-semibold rounded-lg">
                      Not taken
                    </span>
                  )}
                </div>

                {/* Title */}
                <h3 className="font-semibold text-slate-900 mb-1 pr-7 line-clamp-2">
                  {quiz.title || `${docTitle} — Quiz`}
                </h3>

                {/* Source document */}
                <div className="flex items-center gap-1.5 mb-2">
                  <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" strokeWidth={2} />
                  <p className="text-xs text-slate-400 truncate">{docTitle}</p>
                </div>

                <p className="text-xs text-slate-400 uppercase tracking-wide mb-3">
                  {new Date(quiz.createdAt).toLocaleDateString('en-US', {
                    month: 'short', day: 'numeric', year: 'numeric'
                  }).toUpperCase()}
                </p>

                <span className="inline-block px-3 py-1 bg-slate-50 text-slate-600 text-xs font-semibold rounded-lg mb-4">
                  {quiz.questions?.length || 0} Questions
                </span>

                {/* Action button */}
                <button
                  onClick={() => navigate(hasResults ? `/interview/quizzes/${quiz._id}/results` : `/interview/quizzes/${quiz._id}`)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-indigo-50 hover:bg-indigo-500 text-indigo-600 hover:text-white font-semibold rounded-xl transition-colors text-sm"
                >
                  {hasResults ? (
                    <><BarChart2 className="w-4 h-4" strokeWidth={2} />View Results</>
                  ) : (
                    <><Play className="w-4 h-4" strokeWidth={2} />Start Quiz</>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete confirm modal */}
      {deleteQuizId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900">Delete Quiz?</h2>
              <button onClick={() => setDeleteQuizId(null)} className="p-1 hover:bg-slate-100 rounded-lg">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <p className="text-sm text-slate-600 mb-6">
              This will permanently delete the quiz and all results. This cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteQuizId(null)}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl">
                Cancel
              </button>
              <button onClick={handleDeleteQuiz} disabled={deletingQuiz}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold rounded-xl flex items-center gap-2 disabled:opacity-50">
                {deletingQuiz
                  ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Deleting...</>
                  : 'Delete Quiz'
                }
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizzesListPage;
