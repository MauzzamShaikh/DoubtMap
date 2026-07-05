import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';
import { getStudentToken, saveStudentAuth } from '../utils/studentAuth';
import { Mail, Lock, ArrowRight, ArrowLeft, Loader2, Sparkles } from 'lucide-react';

function StudentLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (getStudentToken()) {
      navigate('/join');
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please enter email and password');
      return;
    }

    try {
      setLoading(true);
      const res = await api.post('/student-auth/login', { email, password });
      saveStudentAuth(res.data.token, res.data.student);
      if (!res.data.student.isVerified) {
        localStorage.setItem('show_student_verify_warning', 'true');
      }
      navigate('/join');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 overflow-hidden text-slate-900 dark:text-slate-100 p-4 transition-colors duration-300">
      {/* Glow Effects */}
      <div className="absolute bottom-1/4 right-1/4 w-[350px] h-[350px] rounded-full bg-cyan-500/10 dark:bg-cyan-500/5 blur-[100px] animate-pulse-glow" style={{ animationDelay: '1s' }}></div>
      
      <div className="relative z-10 w-full max-w-md animate-slide-up">
        {/* Back Link */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200 transition-colors mb-6 group cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to roles
        </button>

        <div className="glass-panel p-8 rounded-3xl shadow-2xl border border-slate-800/80">
          <div className="mb-8 text-center">
            <div className="inline-flex p-3 rounded-2xl bg-cyan-500/10 mb-3">
              <Sparkles className="w-6 h-6 text-cyan-400" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">Student Portal</h1>
            <p className="text-sm text-slate-400 mt-1">Sign in to submit doubts and query the classroom AI</p>
          </div>

          <form onSubmit={handleLogin} className="flex flex-col gap-5">
            {/* Email Field */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider pl-1">
                Student Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="yourname@student.edu"
                  className="w-full glass-input pl-12 pr-4 py-3.5 rounded-2xl text-sm focus:border-cyan-500/50 focus:ring-cyan-500/10"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider pl-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full glass-input pl-12 pr-4 py-3.5 rounded-2xl text-sm focus:border-cyan-500/50 focus:ring-cyan-500/10"
                  required
                />
              </div>
            </div>
            <div className="text-right">
              <Link
                to="/forgot-password/student"
                className="text-sm text-indigo-600 hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            {error && (
              <div className="bg-rose-500/10 border border-rose-500/20 text-rose-450 text-xs rounded-xl p-3.5 text-center font-medium animate-fade-in">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="group relative flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-600 to-indigo-600 text-white py-4 rounded-2xl font-semibold shadow-lg shadow-cyan-600/20 hover:shadow-cyan-600/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:pointer-events-none cursor-pointer mt-2"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Log In <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <p className="text-sm text-slate-400 text-center mt-6">
            Don't have an account?{' '}
            <Link to="/student-signup" className="text-cyan-400 font-semibold hover:text-cyan-350 transition-colors underline underline-offset-4">
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default StudentLogin;
