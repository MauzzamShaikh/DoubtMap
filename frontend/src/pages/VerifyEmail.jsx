import { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api';
import ThemeToggle from '../components/ThemeToggle';
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

function VerifyEmail() {
  const { role, token } = useParams();
  const [status, setStatus] = useState('loading');
  const hasCalled = useRef(false);

  useEffect(() => {
    if (hasCalled.current) return;
    hasCalled.current = true;

    api.get(`/verify-email/${role}/${token}`)
    .then(() => {
      setStatus('success');
      // Update stored info to reflect verified status
      const key = role === 'teacher' ? 'teacher_info' : 'student_info';
      const info = JSON.parse(localStorage.getItem(key) || '{}');
      info.isVerified = true;
      localStorage.setItem(key, JSON.stringify(info));
      // Clear warning banners
      localStorage.removeItem('show_verify_warning');
      localStorage.removeItem('show_student_verify_warning');
    })
    .catch(() => setStatus('error'));
  }, [role, token]);

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
        <div className="glass-panel p-8 rounded-3xl shadow-2xl border border-slate-800/80 text-center">
          {status === 'loading' && (
            <div className="flex flex-col items-center py-8">
              <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mb-4" />
              <p className="text-slate-400 text-sm font-medium">Verifying your email address...</p>
            </div>
          )}

          {status === 'success' && (
            <div className="py-4">
              <div className="inline-flex p-3 rounded-2xl bg-emerald-500/10 mb-4 text-emerald-400">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-white mb-2">Email Verified!</h1>
              <p className="text-slate-400 text-sm mb-8 leading-relaxed">
                Your account is now fully verified. You can log in and access DoubtMap.
              </p>
              <Link
                to={`/${role}-login`}
                className="inline-block bg-gradient-to-r from-indigo-600 to-violet-600 text-white px-8 py-3.5 rounded-2xl font-bold hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer shadow-lg shadow-indigo-650/15"
              >
                Go to Login
              </Link>
            </div>
          )}

          {status === 'error' && (
            <div className="py-4">
              <div className="inline-flex p-3 rounded-2xl bg-rose-500/10 mb-4 text-rose-455">
                <AlertCircle className="w-8 h-8" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-white mb-2">Verification Failed</h1>
              <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                This verification link is invalid, expired, or has already been used.
              </p>
              <Link
                to="/"
                className="inline-block bg-slate-900 border border-slate-800 text-slate-350 px-6 py-3 rounded-xl text-sm font-semibold hover:border-slate-700 hover:text-white transition-all cursor-pointer"
              >
                Return to Home
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default VerifyEmail;