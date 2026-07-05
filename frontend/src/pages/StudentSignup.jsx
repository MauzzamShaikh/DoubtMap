import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';
import { saveStudentAuth } from '../utils/studentAuth';
import { User, Mail, Lock, ShieldAlert, Award, Briefcase, ArrowRight, ArrowLeft, Loader2 } from 'lucide-react';

function StudentSignup() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    rollNumber: '',
    department: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.name || !form.email || !form.password) {
      setError('Name, email, and password are required');
      return;
    }

    if (form.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    try {
      setLoading(true);

      await api.post('/student-auth/register', form);

      const loginRes = await api.post('/student-auth/login', {
        email: form.email,
        password: form.password
      });

      saveStudentAuth(res.data.token, res.data.student);
      if (!res.data.student.isVerified) {
        localStorage.setItem('show_student_verify_warning', 'true');
      }
      navigate('/join');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 overflow-hidden text-slate-900 dark:text-slate-100 p-4 py-12 transition-colors duration-300">
      {/* Background Decorative Glow Elements */}
      <div className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] rounded-full bg-cyan-600/10 dark:bg-cyan-600/5 blur-[120px] animate-pulse-glow" style={{ animationDelay: '1.5s' }}></div>

      <div className="relative z-10 w-full max-w-xl animate-slide-up">
        {/* Back Link */}
        <button
          onClick={() => navigate('/student-login')}
          className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200 transition-colors mb-6 group cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Login
        </button>

        <div className="glass-panel p-8 md:p-10 rounded-3xl shadow-2xl border border-slate-800/80">
          <div className="mb-8 text-center md:text-left">
            <h1 className="text-3xl font-bold tracking-tight text-white">Student Registration</h1>
            <p className="text-sm text-slate-400 mt-1">Create an account to save session questions & review history later</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Full Name */}
              <div className="md:col-span-2 flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider pl-1">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Jane Doe"
                    className="w-full glass-input pl-12 pr-4 py-3 rounded-2xl text-sm focus:border-cyan-500/50 focus:ring-cyan-500/10"
                    required
                  />
                </div>
              </div>

              {/* Email Address */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider pl-1">
                  Student Email *
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="janedoe@student.edu"
                    className="w-full glass-input pl-12 pr-4 py-3 rounded-2xl text-sm focus:border-cyan-500/50 focus:ring-cyan-500/10"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider pl-1">
                  Password *
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Min. 6 characters"
                    className="w-full glass-input pl-12 pr-4 py-3 rounded-2xl text-sm focus:border-cyan-500/50 focus:ring-cyan-500/10"
                    required
                  />
                </div>
              </div>

              {/* Roll Number */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider pl-1">
                  Roll Number
                </label>
                <div className="relative">
                  <Award className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input
                    type="text"
                    name="rollNumber"
                    value={form.rollNumber}
                    onChange={handleChange}
                    placeholder="CS-2026-08 (optional)"
                    className="w-full glass-input pl-12 pr-4 py-3 rounded-2xl text-sm focus:border-cyan-500/50 focus:ring-cyan-500/10"
                  />
                </div>
              </div>

              {/* Department */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider pl-1">
                  Department
                </label>
                <div className="relative">
                  <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input
                    type="text"
                    name="department"
                    value={form.department}
                    onChange={handleChange}
                    placeholder="Computer Science (optional)"
                    className="w-full glass-input pl-12 pr-4 py-3 rounded-2xl text-sm focus:border-cyan-500/50 focus:ring-cyan-500/10"
                  />
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-rose-500/10 border border-rose-500/20 text-rose-450 text-xs rounded-xl p-3.5 text-center font-medium animate-fade-in flex items-center justify-center gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="group relative flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-600 to-indigo-600 text-white py-4 rounded-2xl font-semibold shadow-lg shadow-cyan-600/20 hover:shadow-cyan-600/40 hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 disabled:opacity-50 disabled:pointer-events-none cursor-pointer mt-2 w-full"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Register & Continue <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <p className="text-sm text-slate-400 text-center mt-6">
            Already have an account?{' '}
            <Link to="/student-login" className="text-cyan-400 font-semibold hover:text-cyan-350 transition-colors underline underline-offset-4">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default StudentSignup;