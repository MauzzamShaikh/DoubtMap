import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStudentToken, getStudentInfo, logoutStudent } from '../utils/studentAuth';
import { getTeacherToken } from '../utils/auth';
import { GraduationCap, Sparkles, BookOpen, LogOut, ArrowRight, UserPlus, LogIn, ChevronLeft } from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';
import logoImg from '../assets/logo.jpg';

function Home() {
  const navigate = useNavigate();
  const [showStudentOptions, setShowStudentOptions] = useState(false);

  const studentLoggedIn = !!getStudentToken();
  const teacherLoggedIn = !!getTeacherToken();
  const studentInfo = getStudentInfo();

  const handleLogout = () => {
    logoutStudent();
    setShowStudentOptions(false);
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
        {/* Logo and Brand */}
        <div className="flex flex-col items-center mb-10 text-center">
          <div className="w-20 h-20 rounded-2xl overflow-hidden shadow-md shadow-indigo-500/10 dark:shadow-none mb-4 hover:scale-105 transition-transform duration-300 bg-white p-1 border border-slate-200 dark:border-slate-800">
            <img src={logoImg} alt="DoubtMap Logo" className="w-full h-full object-contain rounded-xl" />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:via-slate-200 dark:to-slate-400">
            DoubtMap
          </h1>
          <p className="text-indigo-600 dark:text-indigo-400 font-semibold tracking-wider text-xs uppercase mt-1">
            Classroom Doubt Heatmap
          </p>
          <p className="text-slate-600 dark:text-slate-400 text-sm mt-3 max-w-xs leading-relaxed">
            Ask doubts live, get instant AI-guided explanations, and align classroom confidence.
          </p>
        </div>

        {/* Options Panel */}
        <div className="glass-panel p-8 rounded-3xl shadow-2xl border border-slate-800/80">
          {!showStudentOptions ? (
            <div className="flex flex-col gap-4">
              <h2 className="text-lg font-semibold text-slate-300 mb-2 text-center">Choose your role</h2>
              
              <button
                onClick={() => navigate(teacherLoggedIn ? '/my-sessions' : '/teacher-login')}
                className="group relative flex items-center justify-between bg-gradient-to-r from-indigo-600 to-violet-600 text-white py-4 px-6 rounded-2xl font-semibold shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-white/10 p-2 rounded-xl">
                    <GraduationCap className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold">I'm a Teacher</p>
                    <p className="text-xs text-indigo-200 font-normal">Create sessions & view heatmap</p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-indigo-100 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => setShowStudentOptions(true)}
                className="group relative flex items-center justify-between bg-slate-900/60 border border-slate-800 hover:border-slate-700/80 text-white py-4 px-6 rounded-2xl font-semibold hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-slate-800 p-2 rounded-xl">
                    <Sparkles className="w-6 h-6 text-indigo-400" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-slate-200">I'm a Student</p>
                    <p className="text-xs text-slate-400 font-normal">Join sessions & ask AI/Teacher</p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-slate-400 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          ) : studentLoggedIn ? (
            <div className="flex flex-col gap-4">
              <div className="bg-indigo-500/5 border border-indigo-500/20 rounded-2xl p-4 text-center mb-2">
                <p className="text-xs text-indigo-300 uppercase tracking-wider font-semibold">Welcome back</p>
                <p className="text-lg font-bold text-white mt-0.5">{studentInfo?.name} 👋</p>
              </div>

              <button
                onClick={() => navigate('/join')}
                className="group flex items-center justify-between bg-gradient-to-r from-indigo-600 to-violet-600 text-white py-3.5 px-5 rounded-2xl font-semibold shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/40 hover:scale-[1.02] transition-all duration-200"
              >
                <span className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5" /> Join a Live Session
                </span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => navigate('/history')}
                className="group flex items-center justify-between bg-slate-900/60 border border-slate-800 hover:border-slate-700/80 text-slate-300 py-3.5 px-5 rounded-2xl font-semibold hover:scale-[1.02] transition-all duration-200"
              >
                <span className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-indigo-400" /> Review My History
                </span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-800">
                <button
                  onClick={() => setShowStudentOptions(false)}
                  className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" /> Change Role
                </button>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 text-xs text-rose-500 hover:text-rose-400 font-medium transition-colors"
                >
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <p className="text-xs text-slate-400 text-center mb-2 px-1">
                Logging in saves your doubts & AI conversations in your personal history for later review.
              </p>

              <button
                onClick={() => navigate('/student-login')}
                className="group flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white py-3.5 rounded-2xl font-semibold shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/40 hover:scale-[1.02] transition-all duration-200"
              >
                <LogIn className="w-5 h-5" /> Log In
              </button>

              <button
                onClick={() => navigate('/student-signup')}
                className="group flex items-center justify-center gap-2 bg-slate-900/60 border border-slate-800 hover:border-slate-700/80 text-slate-200 py-3.5 rounded-2xl font-semibold hover:scale-[1.02] transition-all duration-200"
              >
                <UserPlus className="w-5 h-5 text-indigo-400" /> Sign Up
              </button>

              <div className="flex items-center gap-3 my-2">
                <div className="flex-1 h-px bg-slate-800/80" />
                <span className="text-slate-500 text-xs font-medium uppercase tracking-wider">or</span>
                <div className="flex-1 h-px bg-slate-800/80" />
              </div>

              <button
                onClick={() => navigate('/join')}
                className="py-3.5 rounded-2xl font-semibold border border-dashed border-slate-800 hover:border-indigo-500/30 hover:bg-slate-900/20 text-slate-400 hover:text-indigo-400 transition-all duration-200"
              >
                Continue Anonymous
              </button>

              <button
                onClick={() => setShowStudentOptions(false)}
                className="flex items-center justify-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors mt-2"
              >
                <ChevronLeft className="w-4 h-4" /> Back to roles
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Home;
