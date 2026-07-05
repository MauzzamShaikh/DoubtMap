import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import { getStudentToken, getStudentInfo, logoutStudent } from '../utils/studentAuth';
import { ArrowLeft, LogOut, MessageSquare, Sparkles, BookOpen, Clock, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';

function StudentHistory() {
  const [doubts, setDoubts] = useState([]);
  const [aiQueries, setAiQueries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('doubts'); // 'doubts' | 'ai'
  const navigate = useNavigate();

  useEffect(() => {
    if (!getStudentToken()) {
      navigate('/student-login');
      return;
    }

    localStorage.setItem('last_student_page', '/history');

    const fetchHistory = async () => {
      try {
        const res = await api.get('/history');
        setDoubts(res.data.doubts);
        setAiQueries(res.data.aiQueries);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to load history');
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [navigate]);

  const handleLogout = () => {
    logoutStudent();
    localStorage.removeItem('last_student_page');
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-slate-400">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mb-4" />
        <p className="text-sm font-medium">Retrieving your history...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 p-4 text-center">
        <AlertCircle className="w-12 h-12 text-rose-500 mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">Failed to Load History</h2>
        <p className="text-slate-400 text-sm max-w-sm mb-6">{error}</p>
        <Link to="/" className="flex items-center gap-2 text-sm text-indigo-400 font-semibold hover:text-indigo-350 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>
      </div>
    );
  }

  const studentInfo = getStudentInfo();

  return (
    <div className="relative min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-4 md:p-6 overflow-x-hidden transition-colors duration-300">
      {localStorage.getItem('show_student_verify_warning') === 'true' && (
        <div className="max-w-2xl mx-auto mb-4 bg-amber-50 border border-amber-200 text-amber-700 text-sm p-3 rounded-xl flex justify-between items-center">
          <span>⚠️ Please verify your email address — check your inbox.</span>
          <button onClick={() => {
            localStorage.removeItem('show_student_verify_warning');
            window.location.reload();
          }}>✕</button>
        </div>
      )}
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full bg-indigo-500/5 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[350px] h-[350px] rounded-full bg-cyan-500/5 blur-[90px] pointer-events-none" />

      <div className="max-w-2xl mx-auto relative z-10 animate-fade-in">
        
        {/* Navigation & Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate('/join')}
            className="flex items-center gap-2 text-xs text-slate-400 hover:text-slate-200 transition-colors group cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
            Join Classroom
          </button>
        </div>

        {/* Profile Card */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800/80 mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight leading-tight">My History</h1>
            <p className="text-sm text-slate-400 mt-1">
              Logged in as <span className="font-semibold text-indigo-400">{studentInfo?.name}</span>
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-xs bg-slate-900 border border-slate-800 text-slate-400 px-3.5 py-2 rounded-xl hover:text-rose-400 hover:border-rose-500/20 active:scale-95 transition-all cursor-pointer font-semibold"
          >
            <LogOut className="w-3.5 h-3.5" /> Logout
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={() => setTab('doubts')}
            className={`flex-grow group flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl font-bold transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer ${
              tab === 'doubts'
                ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-600/10'
                : 'bg-slate-900/60 border border-slate-850 hover:border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>My Doubts ({doubts.length})</span>
          </button>
          
          <button
            onClick={() => setTab('ai')}
            className={`flex-grow group flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl font-bold transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer ${
              tab === 'ai'
                ? 'bg-gradient-to-r from-amber-550 to-orange-600 text-slate-950 shadow-lg shadow-amber-550/10'
                : 'bg-slate-900/60 border border-slate-850 hover:border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-4 h-4 fill-current opacity-70" />
            <span>AI Questions ({aiQueries.length})</span>
          </button>
        </div>

        {/* Tab Doubts Content */}
        {tab === 'doubts' && (
          <div className="flex flex-col gap-4">
            {doubts.length === 0 && (
              <div className="text-center py-16 glass-panel border border-slate-900 rounded-3xl">
                <BookOpen className="w-10 h-10 text-slate-700 mx-auto mb-3" />
                <p className="text-slate-400 text-sm">No doubts submitted yet.</p>
              </div>
            )}
            {doubts.map((doubt) => (
              <div key={doubt._id} className="glass-panel p-5 rounded-2xl border border-slate-800/80 hover:border-slate-700/50 transition-all duration-300 animate-slide-up">
                <div className="flex justify-between items-start gap-2 mb-3">
                  <span className="text-[10px] font-semibold bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 px-2.5 py-0.5 rounded-full">
                    {doubt.topic}
                  </span>
                  <span className="flex items-center gap-1 text-[10px] text-slate-500 font-medium">
                    <Clock className="w-3.5 h-3.5" />
                    {new Date(doubt.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
                <p className="text-slate-200 text-sm leading-relaxed mb-3.5">{doubt.text}</p>
                <div className="flex justify-between items-center gap-2 pt-3 border-t border-slate-900">
                  <p className="text-xs text-slate-450 truncate max-w-[200px]">
                    Session: <strong className="text-slate-400 font-medium">{doubt.sessionId?.title || 'Unknown session'}</strong>
                  </p>
                  {doubt.resolved ? (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-450 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
                      <CheckCircle2 className="w-3 h-3" /> Resolved
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-slate-500 bg-slate-900 border border-slate-850 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                      Pending
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab AI Content */}
        {tab === 'ai' && (
          <div className="flex flex-col gap-4">
            {aiQueries.length === 0 && (
              <div className="text-center py-16 glass-panel border border-slate-900 rounded-3xl">
                <Sparkles className="w-10 h-10 text-slate-700 mx-auto mb-3" />
                <p className="text-slate-400 text-sm">No AI conversations logged.</p>
              </div>
            )}
            {aiQueries.map((q) => (
              <div key={q._id} className="glass-panel p-5 rounded-2xl border border-slate-800/80 hover:border-slate-700/50 transition-all duration-300 animate-slide-up">
                <div className="flex justify-between items-start gap-2 mb-3.5">
                  <span className="text-[10px] font-semibold bg-amber-500/10 border border-amber-500/20 text-amber-450 px-2.5 py-0.5 rounded-full">
                    {q.topic}
                  </span>
                  <span className="flex items-center gap-1 text-[10px] text-slate-500 font-medium">
                    <Clock className="w-3.5 h-3.5" />
                    {new Date(q.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
                
                {/* Conversation Layout */}
                <div className="flex flex-col gap-3 mb-3.5 pl-1.5">
                  <div className="flex gap-2">
                    <span className="text-xs font-bold text-slate-450 shrink-0 mt-0.5">Q:</span>
                    <p className="text-slate-200 text-sm leading-snug">{q.question}</p>
                  </div>
                  <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/5 border border-amber-500/20 rounded-xl p-4 flex flex-col gap-2">
                    <div className="flex items-center gap-1.5 text-amber-400 font-bold text-xs">
                      <Sparkles className="w-3.5 h-3.5 fill-amber-400/20 animate-pulse" />
                      <span>AI Answer</span>
                    </div>
                    <p className="text-slate-350 text-sm leading-relaxed whitespace-pre-wrap">{q.answer}</p>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-900 text-xs text-slate-450">
                  Session: <strong className="text-slate-400 font-medium">{q.sessionId?.title || 'Unknown session'}</strong>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}

export default StudentHistory;