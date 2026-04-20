import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import progressService from '../../services/learning/progressService';
import quizService from '../../services/learning/quizService';
import toast from 'react-hot-toast';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import {
  FileText,
  BookOpen,
  BrainCircuit,
  Clock,
  ArrowRight,
} from 'lucide-react';

const DashboardPage = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [dashRes, quizzesRes] = await Promise.all([
        progressService.getDashboardData(),
        quizService.getAllQuizzes()
      ]);
      
      const data = dashRes?.data || dashRes;
      setDashboardData(data);

      // Process quiz data for charts
      const allQuizzes = quizzesRes?.data || quizzesRes || [];
      
      // Sort quizzes chronologically (oldest to newest) to show progress over time
      const sortedQuizzes = [...allQuizzes]
        .filter(q => q.completedAt) // Only show completed quizzes
        .sort((a, b) => new Date(a.completedAt) - new Date(b.completedAt))
        .slice(-10); // Take the last 10 quizzes

      const formattedChartData = sortedQuizzes.map((quiz, index) => ({
        name: `Quiz ${index + 1}`,
        score: quiz.score || 0,
        date: new Date(quiz.completedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        title: quiz.title || 'Untitled Quiz'
      }));

      setChartData(formattedChartData);
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      label: 'TOTAL DOCUMENTS',
      value: dashboardData?.overview?.totalDocuments ?? 0,
      icon: FileText,
      iconBg: 'bg-sky-500',
      path: '/interview/documents',
    },
    {
      label: 'FLASHCARD SETS',
      value: dashboardData?.overview?.totalFlashcardSets ?? 0,
      icon: BookOpen,
      iconBg: 'bg-pink-500',
      path: '/interview/flashcards',
    },
    {
      label: 'TOTAL QUIZZES',
      value: dashboardData?.overview?.totalQuizzes ?? 0,
      icon: BrainCircuit,
      iconBg: 'bg-indigo-500',
      path: '/interview/quizzes',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">

      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
        <p className="text-slate-500 text-sm mt-1">Track your learning progress and activity</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statCards.map((card) => (
          <div
            key={card.label}
            onClick={() => navigate(card.path)}
            className="bg-white rounded-2xl border border-slate-200 p-6 flex items-center justify-between shadow-sm cursor-pointer hover:border-indigo-300 hover:shadow-md transition-all"
          >
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                {card.label}
              </p>
              <p className="text-4xl font-bold text-slate-800">{card.value}</p>
            </div>
            <div className={`flex items-center justify-center w-14 h-14 rounded-2xl ${card.iconBg}`}>
              <card.icon className="w-7 h-7 text-white" strokeWidth={2} />
            </div>
          </div>
        ))}
      </div>

      {/* Quiz Performance Chart */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <div className="mb-6">
          <h2 className="text-lg font-bold text-slate-800">Recent Quiz Performance</h2>
          <p className="text-slate-500 text-sm">Your scores across the last 10 completed quizzes</p>
        </div>
        
        {chartData.length > 0 ? (
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 12 }} 
                  dy={10}
                />
                <YAxis 
                  domain={[0, 100]} 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 12 }}
                  dx={-10}
                />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  labelStyle={{ fontWeight: 'bold', color: '#1e293b', marginBottom: '4px' }}
                  formatter={(value) => [`${value}%`, 'Score']}
                />
                <Line 
                  type="monotone" 
                  dataKey="score" 
                  stroke="#6366f1" 
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#6366f1', strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-72 w-full flex flex-col items-center justify-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
            <BrainCircuit className="w-10 h-10 text-slate-300 mb-3" />
            <p className="text-slate-500 font-medium">No quiz data available yet</p>
            <p className="text-slate-400 text-sm mt-1">Complete some quizzes to see your progress chart!</p>
          </div>
        )}
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-100">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100">
            <Clock className="w-4 h-4 text-slate-500" strokeWidth={2} />
          </div>
          <h2 className="text-base font-semibold text-slate-800">Recent Activity</h2>
        </div>

        <div className="divide-y divide-slate-100">
          {dashboardData?.recentActivity?.documents?.length > 0 ? (
            dashboardData.recentActivity.documents.map((activity, index) => (
              <div
                key={activity._id}
                className="flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0" />
                  <div>
                    <p className="text-sm text-slate-700">
                      <span className="font-semibold">Accessed Document:</span>{' '}
                      {activity.title}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {new Date(activity.lastAccessed).toLocaleString()}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => navigate(`/interview/documents/${activity._id}`)}
                  className="text-s font-semibold text-indigo-500 hover:text-indigo-700 flex items-center gap-1 cursor-pointer"
                >
                  View
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            ))
          ) : (
            <div className="px-6 py-12 text-center">
              <FileText className="w-10 h-10 text-slate-300 mx-auto mb-3" strokeWidth={1.5} />
              <p className="text-slate-500 text-sm font-medium">No recent activity yet</p>
              <p className="text-slate-400 text-xs mt-1">Upload a document to get started</p>
              <button
                onClick={() => navigate('/interview/documents')}
                className="mt-4 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white text-sm cursor-pointer font-semibold rounded-xl transition-colors"
              >
                Upload Document
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
