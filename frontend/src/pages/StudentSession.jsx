import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api';
import socket from '../socket';
import { getFingerprint } from '../utils/fingerprint';
import { getStudentToken, getStudentInfo } from '../utils/studentAuth';
import { Sparkles, MessageSquare, ThumbsUp, LogIn, CheckCircle2, History, AlertCircle, Loader2, ArrowLeft, Send } from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';

function StudentSession() {
  const { code } = useParams();
  const [session, setSession] = useState(null);
  const [doubts, setDoubts] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const [text, setText] = useState('');
  const [topic, setTopic] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [poll, setPoll] = useState(null);
  const [hasVoted, setHasVoted] = useState(false);

  const [askedAI, setAskedAI] = useState(false);

  // AI widget state
  const [aiOpen, setAiOpen] = useState(false);
  const [aiQuestion, setAiQuestion] = useState('');
  const [aiAnswer, setAiAnswer] = useState('');
  const [postError, setPostError] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  const fingerprint = getFingerprint();

  const fetchData = async () => {
    try {
      const sessionRes = await api.get(`/sessions/${code}`);
      setSession(sessionRes.data);

      const doubtsRes = await api.get(`/sessions/${code}/doubts`);
      setDoubts(doubtsRes.data);

      const pollRes = await api.get(`/polls/${code}/active`);
      setPoll(pollRes.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Session not found');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    localStorage.setItem('last_student_page', `/session/${code.toUpperCase()}`);

    socket.emit('join_session', code.toUpperCase());

    socket.on('new_doubt', (doubt) => {
      setDoubts((prev) => [doubt, ...prev]);
    });

    socket.on('doubt_updated', (updatedDoubt) => {
      setDoubts((prev) =>
        prev.map((d) => (d._id === updatedDoubt._id ? updatedDoubt : d))
      );
    });

    socket.on('poll_launched', (newPoll) => {
      setPoll(newPoll);
      setHasVoted(false);
    });

    socket.on('poll_updated', (updatedPoll) => {
      setPoll(updatedPoll);
    });

    socket.on('session_ended', (endedSession) => {
      setSession(endedSession);
      setPoll(null);
      setPostError('This session has ended. New doubts can no longer be posted.');
    });

    return () => {
      socket.off('new_doubt');
      socket.off('doubt_updated');
      socket.off('poll_launched');
      socket.off('poll_updated');
      socket.off('session_ended');
    };
  }, [code]);

  const handleSubmitDoubt = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    if (!session?.isActive) {
      setPostError('This session has ended. New doubts can no longer be posted.');
      return;
    }

    setPostError('');

    try {
      setSubmitting(true);
      await api.post(`/sessions/${code}/doubts`, {
        text,
        topic: topic || 'General',
        aiAttempted: askedAI,
        fingerprint
      });
      setText('');
      setTopic('');
      setAskedAI(false);
      setAiAnswer('');
      setAiOpen(false);
    } catch (err) {
      setPostError(err.response?.data?.error || 'Failed to post doubt');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpvote = async (doubtId) => {
    try {
      await api.patch(`/sessions/doubts/${doubtId}/upvote`, { fingerprint });
    } catch (err) {
      console.error(err.response?.data?.error || 'Upvote failed');
    }
  };

  const handleVote = async (choice) => {
    if (!poll) return;
    if (!session?.isActive) return;
    try {
      await api.patch(`/polls/${poll._id}/vote`, { choice, fingerprint });
      setHasVoted(true);
    } catch (err) {
      setHasVoted(true); // already voted, just lock UI
      console.error(err.response?.data?.error);
    }
  };

  const handleAskAI = async () => {
    if (!text.trim()) return;
    if (!session?.isActive) {
      setPostError('This session has ended. New questions can no longer be sent.');
      return;
    }
    try {
      setAiLoading(true);
      setAiOpen(true);
      setAiQuestion(text);
      const res = await api.post('/ai/ask', { question: text, topic, sessionCode: code });
      setAiAnswer(res.data.answer);
      setAskedAI(true);
    } catch (err) {
      setAiAnswer('Sorry, AI could not answer right now. Try posting to your teacher instead.');
    } finally {
      setAiLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-slate-400">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mb-4" />
        <p className="text-sm font-medium">Entering classroom...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 p-4 text-center">
        <AlertCircle className="w-12 h-12 text-rose-500 mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">Access Denied</h2>
        <p className="text-slate-400 text-sm max-w-sm mb-6">{error}</p>
        <Link to="/join" className="flex items-center gap-2 text-sm text-indigo-400 font-semibold hover:text-indigo-350 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Join Page
        </Link>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-32 overflow-x-hidden transition-colors duration-300">
      {/* Background radial glows */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full bg-indigo-500/5 blur-[100px] pointer-events-none" />
      <div className="absolute top-1/2 left-0 w-[300px] h-[300px] rounded-full bg-cyan-500/5 blur-[80px] pointer-events-none" />

      <div className="max-w-2xl mx-auto p-4 md:p-6 relative z-10 animate-fade-in">
        {/* Navigation / Header */}
        <div className="flex items-center justify-between mb-6 animate-fade-in">
          <Link to="/" className="flex items-center gap-2 text-xs text-slate-400 hover:text-slate-200 transition-colors group">
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
            Home
          </Link>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            {session.isActive ? (
              <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live Feed
              </div>
            ) : (
              <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                Ended
              </div>
            )}
          </div>
        </div>

        {/* Session Card */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800/80 mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight leading-tight">{session.title}</h1>
            <p className="text-slate-400 text-sm mt-1">
              Class Code: <span className="font-semibold text-indigo-400 uppercase tracking-widest">{session.sessionCode}</span>
            </p>
          </div>
        </div>

        {/* Auth Notice Banner */}
        {!getStudentToken() ? (
          <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-4 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
              <p className="text-xs text-slate-350 text-center sm:text-left">
                📌 Log in to save your doubts & AI conversations in your personal history dashboard.
              </p>
            </div>
            <Link
              to="/student-login"
              className="flex items-center gap-1.5 text-xs bg-amber-500 text-slate-950 font-bold px-4 py-2 rounded-xl hover:bg-amber-400 transition hover:scale-[1.02] shrink-0"
            >
              <LogIn className="w-4 h-4" /> Log In
            </Link>
          </div>
        ) : (
          <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-4 mb-6 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Logged in as <strong className="text-white">{getStudentInfo()?.name}</strong>. Doubts saved.</span>
            </div>
            <Link to="/history" className="flex items-center gap-1 font-bold text-emerald-400 hover:text-emerald-350 underline underline-offset-4">
              <History className="w-3.5 h-3.5" /> History
            </Link>
          </div>
        )}

        {/* Active Confidence Poll Panel */}
        {poll && poll.isActive && (
          <div className="glass-panel p-6 rounded-2xl border border-slate-800/80 mb-6">
            <p className="text-slate-300 text-xs font-semibold uppercase tracking-wider pl-1 mb-2">Confidence Poll</p>
            <p className="text-white font-bold text-base leading-snug mb-4">{poll.question}</p>

            {!hasVoted ? (
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => handleVote('confused')}
                  className="group flex flex-col items-center justify-center bg-rose-500/5 hover:bg-rose-500/10 border border-rose-500/10 hover:border-rose-500/30 rounded-2xl p-4 text-center transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                >
                  <p className="text-3xl mb-1 group-hover:scale-110 transition-transform">😕</p>
                  <p className="text-xs text-rose-400 font-semibold">Confused</p>
                </button>
                
                <button
                  onClick={() => handleVote('okay')}
                  className="group flex flex-col items-center justify-center bg-amber-500/5 hover:bg-amber-500/10 border border-amber-500/10 hover:border-amber-500/30 rounded-2xl p-4 text-center transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                >
                  <p className="text-3xl mb-1 group-hover:scale-110 transition-transform">😐</p>
                  <p className="text-xs text-amber-400 font-semibold">Okay</p>
                </button>
                
                <button
                  onClick={() => handleVote('confident')}
                  className="group flex flex-col items-center justify-center bg-emerald-500/5 hover:bg-emerald-500/10 border border-emerald-500/10 hover:border-emerald-500/30 rounded-2xl p-4 text-center transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                >
                  <p className="text-3xl mb-1 group-hover:scale-110 transition-transform">😊</p>
                  <p className="text-xs text-emerald-400 font-semibold">Confident</p>
                </button>
              </div>
            ) : (
              <div className="bg-indigo-500/5 border border-indigo-500/10 text-slate-350 text-xs font-semibold rounded-xl py-3 text-center">
                ✓ Thanks for voting! Your feedback has been registered.
              </div>
            )}
          </div>
        )}

        {/* Doubt Submission Form */}
        <form onSubmit={handleSubmitDoubt} className="glass-panel p-6 rounded-3xl border border-slate-800/80 mb-6 flex flex-col gap-4">
          {!session.isActive && (
            <div className="bg-slate-900/10 border border-slate-850 text-slate-400 text-xs font-semibold rounded-xl py-3 text-center">
              This session has ended. You can still review submitted doubts below.
            </div>
          )}

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider pl-1">
              Ask a Question
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="What doesn't make sense? Type your question..."
              className="w-full glass-input px-4 py-3 rounded-2xl resize-none text-sm placeholder:text-slate-600 focus:border-indigo-500/50"
              rows={3}
              disabled={!session.isActive}
              required
            />
          </div>

          {session.topics?.length > 0 && (
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider pl-1">
                Select Lecture Topic
              </label>
              <select
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full glass-input px-4 py-3 rounded-2xl text-sm"
                disabled={!session.isActive}
              >
                <option value="" className="bg-slate-950 text-slate-400">General Doubt</option>
                {session.topics.map((t) => (
                  <option key={t} value={t} className="bg-slate-950 text-white">{t}</option>
                ))}
              </select>
            </div>
          )}

          <div className="flex gap-4">
            <button
              type="button"
              onClick={handleAskAI}
              disabled={!session.isActive || !text.trim() || aiLoading}
              className="flex-1 group flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-orange-600 text-slate-950 py-3.5 rounded-2xl font-bold hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
            >
              {aiLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Sparkles className="w-4 h-4 fill-slate-950" /> Ask AI Assistant
                </>
              )}
            </button>

            <button
              type="submit"
              disabled={!session.isActive || !text.trim() || submitting}
              className="flex-1 group flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white py-3.5 rounded-2xl font-bold hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
            >
              {submitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Post to Teacher <Send className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </>
              )}
            </button>
          </div>

          {postError && (
            <div className="bg-rose-500/10 border border-rose-500/20 text-rose-450 text-xs rounded-xl p-3.5 text-center font-medium animate-fade-in">
              {postError}
            </div>
          )}

          {/* AI Response Block */}
          {aiOpen && (
            <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/5 border border-amber-500/20 rounded-2xl p-5 mt-2 animate-slide-up">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4.5 h-4.5 text-amber-400 fill-amber-400/20 animate-pulse" />
                <span className="text-sm font-bold text-amber-400">AI Assistant Response</span>
              </div>
              
              {aiLoading ? (
                <div className="flex items-center gap-2 text-slate-400 text-xs py-2">
                  <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                  <span>Generating explanation...</span>
                </div>
              ) : (
                <>
                  <p className="text-slate-200 text-sm leading-relaxed whitespace-pre-wrap font-sans">{aiAnswer}</p>
                  <p className="text-xs text-slate-500 mt-4 border-t border-amber-500/10 pt-3">
                    💡 Not satisfied? You can still submit this question directly to the teacher using the button above.
                  </p>
                </>
              )}
            </div>
          )}
        </form>

        {/* Live Doubt Feed Section */}
        <h2 className="text-lg font-bold text-white mb-4 pl-1">Submitted Doubts ({doubts.length})</h2>
        
        <div className="flex flex-col gap-4">
          {doubts.length === 0 && (
            <div className="text-center py-12 glass-panel border border-slate-900 rounded-3xl">
              <MessageSquare className="w-10 h-10 text-slate-700 mx-auto mb-3" />
              <p className="text-slate-400 text-sm">No doubts posted yet. Be the first to ask!</p>
            </div>
          )}

          {doubts.map((doubt) => (
            <div
              key={doubt._id}
              className={`glass-panel p-5 rounded-2xl border transition-all duration-300 flex justify-between items-start gap-4 animate-slide-up ${
                doubt.resolved 
                  ? 'opacity-40 border-slate-900 bg-slate-900/10' 
                  : doubt.upvotes >= 4
                    ? 'border-indigo-500/40 bg-indigo-500/5 shadow-lg shadow-indigo-500/5'
                    : 'border-slate-800/80 hover:border-slate-700'
              }`}
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap mb-2">
                  <span className="text-xs font-semibold bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 px-2.5 py-0.5 rounded-full">
                    {doubt.topic}
                  </span>
                  {doubt.resolved && (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
                      ✓ Resolved
                    </span>
                  )}
                  {doubt.upvotes >= 4 && !doubt.resolved && (
                    <span className="text-[10px] font-bold bg-amber-500/10 border border-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse">
                      🔥 Trending
                    </span>
                  )}
                </div>
                <p className="text-slate-200 text-sm leading-relaxed">{doubt.text}</p>
              </div>

              <button
                onClick={() => handleUpvote(doubt._id)}
                className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl transition-all hover:scale-[1.03] active:scale-[0.97] cursor-pointer ${
                  doubt.resolved
                    ? 'bg-slate-900 text-slate-500 border border-slate-850 pointer-events-none'
                    : 'bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
                }`}
                disabled={doubt.resolved}
              >
                <ThumbsUp className="w-3.5 h-3.5" />
                <span>{doubt.upvotes}</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default StudentSession;
