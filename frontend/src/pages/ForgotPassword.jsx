import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import ThemeToggle from '../components/ThemeToggle';
import { ArrowLeft, Mail, Sparkles, AlertCircle } from 'lucide-react';

function ForgotPassword({ role = 'teacher' }) {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      setLoading(true);
      await api.post(`/forgot-password/${role}`, { email });
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 overflow-hidden text-slate-900 dark:text-slate-100 p-4 transition-colors duration-300">
      {/* Theme Toggle Button */}
      <div className="absolute top-6 right-6 z-50">
        <ThemeToggle />
      </div>

      {/* Background Decorative Glow Elements */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full bg-indigo-500/10 dark:bg-indigo-500/5 blur-[100px] animate-pulse-glow" style={{ animationDelay: '0s' }}></div>
      <div className="absolute bottom-0 left-0 w-[450px] h-[450px] rounded-full bg-violet-600/10 dark:bg-violet-600/5 blur-[120px] animate-pulse-glow" style={{ animationDelay: '2s' }}></div>

      <div className="relative z-10 w-full max-w-md animate-slide-up">
        {/* Back Link */}
        <button
          onClick={() => navigate(role === 'teacher' ? '/teacher-login' : '/student-login')}
          className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200 transition-colors mb-6 group cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Login
        </button>

        <div className="glass-panel p-8 rounded-3xl shadow-2xl border border-slate-800/80">
          <div className="mb-6 text-center">
            <div className="inline-flex p-3 rounded-2xl bg-indigo-500/10 mb-3 text-indigo-500">
              <Mail className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">Forgot Password</h1>
            <p className="text-sm text-slate-400 mt-1">
              Enter your email and we'll send you a reset link
            </p>
          </div>

          {submitted ? (
            <div className="text-center py-4">
              <div className="bg-emerald-500/10 border border-emerald-500/25 rounded-2xl p-4 mb-4">
                <p className="text-emerald-400 font-semibold text-sm leading-snug">
                  ✓ Reset link has been sent if this email is registered.
                </p>
              </div>
              <p className="text-slate-450 text-xs leading-relaxed">
                Check your inbox (and spam folder) for further instructions.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider pl-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Your registered email"
                    className="w-full glass-input pl-12 pr-4 py-3.5 rounded-2xl text-sm"
                    required
                  />
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 bg-rose-500/10 border border-rose-500/20 text-rose-450 text-xs rounded-xl p-3.5 font-medium animate-fade-in">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white py-3.5 rounded-2xl font-bold hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer shadow-lg shadow-indigo-650/15 disabled:opacity-50"
              >
                {loading ? 'Sending link...' : 'Send Reset Link'}
              </button>
            </form>
          )}

          <p className="text-center text-xs text-slate-400 mt-6 pt-6 border-t border-slate-900">
            Remember your password?{' '}
            <Link
              to={role === 'teacher' ? '/teacher-login' : '/student-login'}
              className="text-indigo-500 dark:text-indigo-400 font-bold hover:underline"
            >
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;