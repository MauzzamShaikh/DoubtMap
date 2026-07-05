import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import api from '../api';
import { getTeacherToken } from '../utils/auth';
import { BookOpen, Tag, Check, Copy, ArrowRight, Loader2, ArrowLeft, Radio } from 'lucide-react';

function CreateSession() {
  const [title, setTitle] = useState('');
  const [topicsInput, setTopicsInput] = useState('');
  const [session, setSession] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!getTeacherToken()) {
      navigate('/teacher-login');
    }
  }, [navigate]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('Please enter a lecture title');
      return;
    }

    const topics = topicsInput
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    try {
      setLoading(true);
      const res = await api.post('/sessions', { title, topics });
      setSession(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create session');
    } finally {
      setLoading(false);
    }
  };

  const joinUrl = session
    ? `${window.location.origin}/session/${session.sessionCode}`
    : '';

  const handleCopyCode = () => {
    if (!session) return;
    navigator.clipboard.writeText(session.sessionCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    
    <div className="relative min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 overflow-hidden text-slate-900 dark:text-slate-100 p-4 transition-colors duration-300">
      {/* Background Glows */}
      <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] rounded-full bg-indigo-500/10 dark:bg-indigo-500/5 blur-[110px] animate-pulse-glow" style={{ animationDelay: '0.5s' }}></div>

      <div className="relative z-10 w-full max-w-md animate-slide-up">
        {/* Back Link */}
        {!session && (
          <button
            onClick={() => navigate('/my-sessions')}
            className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200 transition-colors mb-6 group cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            My Sessions
          </button>
        )}

        <div className="glass-panel p-8 rounded-3xl shadow-2xl border border-slate-800/80">
          {!session ? (
            <>
              <div className="mb-6 text-center">
                <h1 className="text-2xl font-bold tracking-tight text-white">Create a Session</h1>
                <p className="text-sm text-slate-400 mt-1">Configure active topics for your live session</p>
              </div>

              <form onSubmit={handleCreate} className="flex flex-col gap-5">
                {/* Lecture Title */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider pl-1">
                    Lecture Title *
                  </label>
                  <div className="relative">
                    <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g., DBMS Lecture 5: Normalization"
                      className="w-full glass-input pl-12 pr-4 py-3.5 rounded-2xl text-sm"
                      required
                    />
                  </div>
                </div>

                {/* Topics */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider pl-1">
                    Topics (comma separated, optional)
                  </label>
                  <div className="relative">
                    <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input
                      type="text"
                      value={topicsInput}
                      onChange={(e) => setTopicsInput(e.target.value)}
                      placeholder="e.g., 1NF, 2NF, 3NF, BCNF"
                      className="w-full glass-input pl-12 pr-4 py-3.5 rounded-2xl text-sm"
                    />
                  </div>
                </div>

                {error && (
                  <div className="bg-rose-500/10 border border-rose-500/20 text-rose-450 text-xs rounded-xl p-3.5 text-center font-medium animate-fade-in">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="group relative flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white py-4 rounded-2xl font-semibold shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:pointer-events-none cursor-pointer mt-2"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      Create Live Session <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-4">
                <Radio className="w-3.5 h-3.5 animate-pulse" /> Live Now
              </div>

              <h2 className="text-2xl font-bold text-white leading-tight mb-2">
                {session.title}
              </h2>
              <p className="text-slate-400 text-sm mb-6">Students can join using the code or QR below</p>

              {/* QR Container Frame */}
              <div className="inline-block p-4 bg-white rounded-3xl shadow-lg border border-slate-700/20 mb-6">
                <QRCodeSVG value={joinUrl} size={180} />
              </div>

              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 mb-6 relative">
                <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1">Session Code</p>
                <div className="flex items-center justify-center gap-3">
                  <p className="text-3xl font-extrabold text-indigo-400 tracking-wider">
                    {session.sessionCode}
                  </p>
                  <button
                    onClick={handleCopyCode}
                    className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-750 active:scale-95 transition-all cursor-pointer"
                    title="Copy code"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                onClick={() => navigate(`/dashboard/${session.sessionCode}`)}
                className="group flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white py-4 rounded-2xl font-semibold shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 w-full cursor-pointer"
              >
                Go to Teacher Dashboard <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CreateSession;