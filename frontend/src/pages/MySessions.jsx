import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';
import { getTeacherToken, getTeacherInfo, logoutTeacher } from '../utils/auth';
import ThemeToggle from '../components/ThemeToggle';
import { Loader2, ArrowLeft, Plus, BookOpen, AlertTriangle, LogOut } from 'lucide-react';

function MySessions() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!getTeacherToken()) {
      navigate('/teacher-login');
      return;
    }
    const info = getTeacherInfo();
    if (info?.isVerified) {
      localStorage.removeItem('show_verify_warning');
    }
    api.get('/sessions')
      .then(res => setSessions(res.data))
      .catch(err => setError(err.response?.data?.error || 'Failed to load sessions'))
      .finally(() => setLoading(false));
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-slate-400">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mb-4" />
        <p className="text-sm font-medium">Retrieving your lectures...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 p-4 text-center">
        <AlertTriangle className="w-12 h-12 text-rose-500 mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">Error Loading Sessions</h2>
        <p className="text-slate-400 text-sm max-w-sm mb-6">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition"
        >
          Retry
        </button>
      </div>
    );
  }

  const teacher = getTeacherInfo();

  const handleSignOut = () => {
    logoutTeacher();
    navigate('/teacher-login');
  };

  return (
    <div className="relative min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-4 md:p-6 overflow-x-hidden transition-colors duration-300">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full bg-indigo-500/5 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[350px] h-[350px] rounded-full bg-violet-500/5 blur-[90px] pointer-events-none" />

      {/* Verify warning banner */}
      {localStorage.getItem('show_verify_warning') === 'true' && (
        <div className="max-w-3xl mx-auto mb-4 bg-amber-500/10 border border-amber-500/25 text-amber-500 text-xs md:text-sm p-4 rounded-2xl flex justify-between items-center gap-3">
          <span className="font-semibold leading-snug">⚠️ Please verify your email address — check your inbox.</span>
          <button 
            className="text-slate-400 hover:text-white font-bold text-lg"
            onClick={() => { 
              localStorage.removeItem('show_verify_warning'); 
              window.location.reload(); 
            }}
          >
            ✕
          </button>
        </div>
      )}

      <div className="max-w-3xl mx-auto relative z-10 animate-fade-in">
        {/* Back navigation */}
        <div className="mb-4">
          <Link to="/" className="flex items-center gap-2 text-xs text-slate-400 hover:text-slate-200 transition-colors group">
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
            Sign Out / Home
          </Link>
        </div>

        {/* Dashboard Profile panel */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800/80 mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">My Sessions</h1>
            <p className="text-slate-450 text-sm mt-1">Logged in as <span className="font-semibold text-indigo-400">{teacher?.name}</span></p>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <button
              onClick={handleSignOut}
              className="flex items-center justify-center gap-1 bg-slate-900/60 border border-slate-800 text-slate-300 hover:text-rose-400 hover:border-rose-500/30 px-4 py-2.5 rounded-xl text-sm font-bold hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
            >
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
            <Link
              to="/create"
              className="group flex items-center justify-center gap-1 bg-gradient-to-r from-indigo-600 to-violet-600 text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:scale-[1.02] active:scale-[0.98] transition-all shadow-md shadow-indigo-650/15"
            >
              <Plus className="w-4 h-4" /> New Session
            </Link>
          </div>
        </div>

        {sessions.length === 0 && (
          <div className="text-center py-16 glass-panel border border-slate-900 rounded-3xl">
            <BookOpen className="w-10 h-10 text-slate-700 mx-auto mb-3" />
            <p className="text-slate-400 text-sm mb-4">No sessions created yet. Kickstart your first active lecture!</p>
            <Link
              to="/create"
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition"
            >
              + Create Session
            </Link>
          </div>
        )}

        <div className="flex flex-col gap-3">
          {sessions.map(session => (
            <div
              key={session._id}
              className="glass-panel p-5 rounded-2xl border border-slate-800/80 flex justify-between items-start gap-4 hover:border-slate-750 transition-colors"
            >
              <div>
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                  <h2 className="font-semibold text-white text-base leading-tight">{session.title}</h2>
                  {session.isActive ? (
                    <span className="text-[10px] font-bold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse">
                      Active
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full uppercase tracking-wider">
                      Ended
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400">
                  Code: <span className="font-mono font-bold text-indigo-400 uppercase tracking-widest">{session.sessionCode}</span>
                  {' · '}
                  {new Date(session.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
                {session.topics?.length > 0 && (
                  <div className="flex gap-1.5 flex-wrap mt-3">
                    {session.topics.map(t => (
                      <span key={t} className="text-[10px] font-semibold bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded-full">
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <Link
                to={`/dashboard/${session.sessionCode}`}
                className="text-xs bg-slate-900 border border-slate-850 hover:border-slate-800 text-slate-300 hover:text-white px-3.5 py-2 rounded-xl transition-all cursor-pointer font-bold shrink-0"
              >
                View
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default MySessions;
