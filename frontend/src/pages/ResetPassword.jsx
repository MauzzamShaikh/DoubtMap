import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api';
import ThemeToggle from '../components/ThemeToggle';
import { ArrowLeft, Lock, CheckCircle2, AlertCircle } from 'lucide-react';

function ResetPassword() {
  const { role, token } = useParams();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    try {
      setLoading(true);
      await api.post(`/forgot-password/reset/${role}`, { token, password });
      setSuccess(true);
      setTimeout(() => navigate(`/${role}-login`), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to reset password');
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
              <Lock className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">Reset Password</h1>
            <p className="text-sm text-slate-400 mt-1">
              Enter your new password below
            </p>
          </div>

          {success ? (
            <div className="text-center py-4">
              <div className="bg-emerald-500/10 border border-emerald-500/25 rounded-2xl p-4 mb-4">
                <p className="text-emerald-400 font-semibold text-sm leading-snug flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-5 h-5 shrink-0" />
                  Password reset successfully!
                </p>
              </div>
              <p className="text-slate-450 text-xs">Redirecting to login portal...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider pl-1">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full glass-input pl-12 pr-4 py-3.5 rounded-2xl text-sm"
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider pl-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input
                    type="password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    placeholder="Confirm new password"
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
                className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white py-3.5 rounded-2xl font-bold hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer shadow-lg shadow-indigo-655/15 disabled:opacity-50"
              >
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;