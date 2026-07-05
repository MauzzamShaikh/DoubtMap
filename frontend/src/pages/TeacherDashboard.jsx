import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api';
import socket from '../socket';
import SessionSummary from '../../components/SessionSummary';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Radio, Users, Check, Loader2, ArrowLeft, BarChart2, MessageSquare, Flame, HelpCircle, Power, Play } from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';

function TeacherDashboard() {
  const { code } = useParams();
  const [session, setSession] = useState(null);
  const [doubts, setDoubts] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState([]);
  const [poll, setPoll] = useState(null);
  const [pollQuestion, setPollQuestion] = useState('');
  const [summary, setSummary] = useState(null);
  const [ending, setEnding] = useState(false);

  const fetchData = async () => {
    try {
      const sessionRes = await api.get(`/sessions/${code}`);
      setSession(sessionRes.data);

      const doubtsRes = await api.get(`/sessions/${code}/doubts`);
      setDoubts(doubtsRes.data);

      const analyticsRes = await api.get(`/sessions/${code}/analytics`);
      setAnalytics(analyticsRes.data);

      const pollRes = await api.get(`/polls/${code}/active`);
      setPoll(pollRes.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load session');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    socket.emit('join_session', code.toUpperCase());

    socket.on('new_doubt', (doubt) => {
      setDoubts((prev) => [doubt, ...prev]);
      refreshAnalytics();
    });

    socket.on('doubt_updated', (updatedDoubt) => {
      setDoubts((prev) =>
        prev.map((d) => (d._id === updatedDoubt._id ? updatedDoubt : d))
      );
      refreshAnalytics();
    });

    socket.on('poll_launched', (newPoll) => {
      setPoll(newPoll);
    });

    socket.on('poll_updated', (updatedPoll) => {
      setPoll(updatedPoll);
    });

    socket.on('session_ended', (endedSession) => {
      setSession(endedSession);
      setPoll(null);
    });

    return () => {
      socket.off('new_doubt');
      socket.off('doubt_updated');
      socket.off('poll_launched');
      socket.off('poll_updated');
      socket.off('session_ended');
    };
  }, [code]);

  const refreshAnalytics = async () => {
    try {
      const res = await api.get(`/sessions/${code}/analytics`);
      setAnalytics(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleResolve = async (doubtId) => {
    try {
      await api.patch(`/sessions/doubts/${doubtId}/resolve`);
    } catch (err) {
      console.error(err);
    }
  };

  const handleEndSession = async () => {
    if (!window.confirm('End this session? Students will no longer be able to submit doubts.')) return;
    setEnding(true);
    try {
      const endRes = await api.patch(`/sessions/${code}/end`);
      setSession(endRes.data);
      setPoll(null);
      const summaryRes = await api.get(`/sessions/${code}/summary`);
      setSummary(summaryRes.data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Failed to end session');
    } finally {
      setEnding(false);
    }
  };

  const handleLaunchPoll = async () => {
    try {
      await api.post(`/polls/${code}/launch`, {
        question: pollQuestion || 'How confident do you feel about this topic?'
      });
      setPollQuestion('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleEndPoll = async () => {
    if (!poll) return;
    try {
      await api.patch(`/polls/${poll._id}/end`);
    } catch (err) {
      console.error(err);
    }
  };

  const getPollPercentage = (val) => {
    if (!poll) return 0;
    const total = (poll.responses.confused || 0) + (poll.responses.okay || 0) + (poll.responses.confident || 0);
    if (total === 0) return 0;
    return Math.round((val / total) * 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-slate-400">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mb-4" />
        <p className="text-sm font-medium">Loading session dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 p-4 text-center">
        <h2 className="text-xl font-bold text-white mb-2">Error Loading Dashboard</h2>
        <p className="text-rose-400 text-sm max-w-sm mb-6">{error}</p>
        <Link to="/create" className="flex items-center gap-2 text-sm text-indigo-400 font-semibold hover:text-indigo-350 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Creation Portal
        </Link>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-4 md:p-6 overflow-x-hidden transition-colors duration-300">
      {/* Background Decorative Glow Elements */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-indigo-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-violet-500/5 blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10 animate-fade-in">
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 border-b border-slate-900 pb-5">
          <div>
            <div className="flex items-center gap-2.5">
                <Link to="/my-sessions" className="text-slate-450 hover:text-slate-200 transition-colors">
                  <ArrowLeft className="w-5 h-5" />
                </Link>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">{session.title}</h1>
              {session.isActive ? (
                <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-wider">
                  <Radio className="w-3 h-3 animate-pulse" /> Active
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                  Ended
                </span>
              )}
            </div>
            <p className="text-sm text-slate-400 mt-1 pl-7.5">
              Session Code: <span className="font-bold text-indigo-400 uppercase tracking-widest">{session.sessionCode}</span>
            </p>
          </div>

          <div className="flex items-center gap-3 pl-7.5 sm:pl-0 animate-fade-in">
            <ThemeToggle />
            {session.isActive && (
              <button
                onClick={handleEndSession}
                disabled={ending}
                className="flex items-center gap-2 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 hover:border-rose-500/40 text-rose-400 px-4 py-2 rounded-xl text-sm font-semibold hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer"
              >
                {ending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Power className="w-4 h-4" /> End Session
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Dashboard Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT COLUMN: Analytics & Polls (lg:span-7) */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            
            {/* Heatmap Section */}
            <div className="glass-panel p-6 rounded-2xl border border-slate-800/80">
              <div className="flex items-center gap-2 mb-6">
                <BarChart2 className="w-5 h-5 text-indigo-400" />
                <h2 className="text-lg font-bold text-white">🔥 Topic Heatmap</h2>
              </div>

              {analytics.length > 0 ? (
                <div className="w-full bg-slate-900/20 rounded-xl p-3 border border-slate-850">
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={analytics} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" vertical={false} />
                      <XAxis dataKey="_id" stroke="rgba(255, 255, 255, 0.4)" fontSize={11} tickLine={false} />
                      <YAxis allowDecimals={false} stroke="rgba(255, 255, 255, 0.4)" fontSize={11} tickLine={false} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'rgba(15, 23, 42, 0.9)', 
                          borderColor: 'rgba(255, 255, 255, 0.08)',
                          borderRadius: '12px',
                          color: '#fff',
                          fontSize: '12px'
                        }} 
                      />
                      <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={45}>
                        {analytics.map((entry, index) => {
                          let color = 'rgb(99, 102, 241)'; // slate indigo
                          if (entry.count >= 4) {
                            color = 'rgb(239, 68, 68)'; // red (hot)
                          } else if (entry.count >= 2) {
                            color = 'rgb(249, 115, 22)'; // orange (warm)
                          } else if (entry.count === 1) {
                            color = 'rgb(168, 85, 247)'; // purple (cool)
                          }
                          return <Cell key={index} fill={color} className="transition-all duration-300 hover:opacity-80" />;
                        })}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="text-center py-12 bg-slate-900/10 border border-dashed border-slate-850 rounded-xl">
                  <Flame className="w-10 h-10 text-slate-700 mx-auto mb-3" />
                  <p className="text-slate-400 text-sm">Heatmap will render once doubts are submitted.</p>
                </div>
              )}
            </div>

            {/* Confidence Poll Section */}
            <div className="glass-panel p-6 rounded-2xl border border-slate-800/80">
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-5 h-5 text-indigo-400" />
                <h2 className="text-lg font-bold text-white">📊 Confidence Poll</h2>
              </div>

              {poll && poll.isActive ? (
                <div className="flex flex-col gap-4">
                  <div className="bg-slate-900/40 border border-slate-850 rounded-xl p-4">
                    <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Active Poll Question</p>
                    <p className="text-slate-200 font-bold text-base mt-1 leading-snug">{poll.question}</p>
                  </div>

                  <div className="flex flex-col gap-3">
                    {/* Confused ProgressBar */}
                    <div className="flex flex-col gap-1.5">
                      <div className="flex justify-between text-xs font-semibold text-rose-400 pl-1">
                        <span>😕 Confused ({poll.responses.confused})</span>
                        <span>{getPollPercentage(poll.responses.confused)}%</span>
                      </div>
                      <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-rose-500 rounded-full transition-all duration-500" 
                          style={{ width: `${getPollPercentage(poll.responses.confused)}%` }} 
                        />
                      </div>
                    </div>

                    {/* Okay ProgressBar */}
                    <div className="flex flex-col gap-1.5">
                      <div className="flex justify-between text-xs font-semibold text-amber-400 pl-1">
                        <span>😐 Okay ({poll.responses.okay})</span>
                        <span>{getPollPercentage(poll.responses.okay)}%</span>
                      </div>
                      <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-amber-500 rounded-full transition-all duration-500" 
                          style={{ width: `${getPollPercentage(poll.responses.okay)}%` }} 
                        />
                      </div>
                    </div>

                    {/* Confident ProgressBar */}
                    <div className="flex flex-col gap-1.5">
                      <div className="flex justify-between text-xs font-semibold text-emerald-400 pl-1">
                        <span>😊 Confident ({poll.responses.confident})</span>
                        <span>{getPollPercentage(poll.responses.confident)}%</span>
                      </div>
                      <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-emerald-500 rounded-full transition-all duration-500" 
                          style={{ width: `${getPollPercentage(poll.responses.confident)}%` }} 
                        />
                      </div>
                    </div>
                  </div>

                  {session.isActive && (
                    <button
                      onClick={handleEndPoll}
                      className="w-full bg-slate-900 border border-slate-800 text-slate-350 py-3 rounded-xl font-semibold hover:border-slate-700 hover:text-white transition-all cursor-pointer text-sm"
                    >
                      End Active Poll
                    </button>
                  )}
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  <p className="text-xs text-slate-400 mb-1 leading-snug">
                    Launch a live poll to measure student confidence on a topic in real time.
                  </p>
                  
                  {session.isActive ? (
                    <div className="flex flex-col sm:flex-row gap-3">
                      <input
                        type="text"
                        value={pollQuestion}
                        onChange={(e) => setPollQuestion(e.target.value)}
                        placeholder="e.g., Do you understand 3NF normalization?"
                        className="flex-1 glass-input px-4 py-3 rounded-2xl text-sm placeholder:text-slate-650"
                      />
                      <button
                        onClick={handleLaunchPoll}
                        className="group flex items-center justify-center gap-1.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white px-5 py-3 rounded-2xl text-sm font-semibold hover:scale-[1.02] active:scale-[0.98] transition-all whitespace-nowrap cursor-pointer"
                      >
                        <Play className="w-4 h-4 fill-white" /> Launch Poll
                      </button>
                    </div>
                  ) : (
                    <div className="text-center py-4 bg-slate-900/10 border border-slate-850 rounded-xl text-xs text-slate-500">
                      Polls are unavailable because this session has ended.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: Live Doubt Feed (lg:span-5) */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            <div className="glass-panel p-6 rounded-2xl border border-slate-800/80 flex flex-col max-h-[620px]">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-900">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-indigo-400" />
                  <h2 className="text-lg font-bold text-white">
                    {session.isActive ? 'Live Doubts Feed' : 'Doubts Feed'}
                  </h2>
                </div>
                <span className="bg-slate-900 border border-slate-850 text-[11px] text-indigo-300 font-bold px-3 py-1 rounded-full">
                  Total: {doubts.length}
                </span>
              </div>

              <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-4">
                {doubts.length === 0 && (
                  <div className="text-center py-16">
                    <HelpCircle className="w-10 h-10 text-slate-700 mx-auto mb-3" />
                    <p className="text-slate-400 text-sm">No doubts submitted by students yet.</p>
                  </div>
                )}

                {doubts.map((doubt) => (
                  <div
                    key={doubt._id}
                    className={`relative p-4 rounded-xl border transition-all duration-300 flex justify-between items-start gap-3 ${
                      doubt.resolved 
                        ? 'opacity-40 border-slate-900 bg-slate-900/10' 
                        : doubt.upvotes >= 4
                          ? 'border-indigo-500/40 bg-indigo-500/5 shadow-md shadow-indigo-500/5'
                          : 'border-slate-850 bg-slate-900/35 hover:border-slate-800'
                    }`}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1.5">
                        <span className="text-[10px] font-semibold bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded-full">
                          {doubt.topic}
                        </span>
                        {doubt.upvotes >= 4 && !doubt.resolved && (
                          <span className="text-[9px] font-bold bg-amber-500/10 border border-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded-full tracking-wider animate-pulse">
                            🔥 Hot ({doubt.upvotes})
                          </span>
                        )}
                        {!doubt.resolved && doubt.upvotes > 0 && doubt.upvotes < 4 && (
                          <span className="text-[9px] font-semibold text-slate-450 bg-slate-800 border border-slate-750 px-1.5 py-0.5 rounded-full">
                            👍 {doubt.upvotes} Upvotes
                          </span>
                        )}
                      </div>
                      <p className="text-slate-200 text-sm leading-snug">{doubt.text}</p>
                    </div>

                    {session.isActive && !doubt.resolved && (
                      <button
                        onClick={() => handleResolve(doubt._id)}
                        className="group flex items-center justify-center p-2 rounded-xl bg-slate-950 hover:bg-emerald-500 border border-slate-850 hover:border-emerald-400 text-slate-400 hover:text-slate-950 transition-all hover:scale-105 active:scale-95 cursor-pointer shrink-0"
                        title="Mark as resolved"
                      >
                        <Check className="w-4 h-4 group-hover:stroke-[3px]" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>

        {summary && (
          <SessionSummary summary={summary} onClose={() => setSummary(null)} />
        )}
      </div>
    </div>
  );
}

export default TeacherDashboard;
