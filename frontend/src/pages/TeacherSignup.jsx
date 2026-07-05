import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';
import { saveTeacherAuth } from '../utils/auth';
import { User, Mail, Lock, ShieldAlert, Award, Briefcase, GraduationCap, ArrowRight, ArrowLeft, Loader2 } from 'lucide-react';

function TeacherSignup() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    employeeId: '',
    department: '',
    subjectsTaught: '',
    designation: ''
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

    if (!form.name || !form.email || !form.password || !form.employeeId || !form.department) {
      setError('Please fill in all required fields');
      return;
    }

    if (form.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    try {
      setLoading(true);

      const subjectsTaught = form.subjectsTaught
         .split(',')
         .map((s) => s.trim())
         .filter((s) => s.length > 0);

      await api.post('/auth/register', {
        name: form.name,
        email: form.email,
        password: form.password,
        employeeId: form.employeeId,
        department: form.department,
        subjectsTaught,
        designation: form.designation || 'Lecturer'
      });

      // Auto-login right after successful registration
      const loginRes = await api.post('/auth/login', {
        email: form.email,
        password: form.password
      });

      saveTeacherAuth(loginRes.data.token, loginRes.data.teacher);
      navigate('/create');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 overflow-hidden text-slate-900 dark:text-slate-100 p-4 py-12 transition-colors duration-300">
      {/* Background Decorative Glow Elements */}
      <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-violet-600/10 dark:bg-violet-600/5 blur-[120px] animate-pulse-glow" style={{ animationDelay: '1.5s' }}></div>

      <div className="relative z-10 w-full max-w-2xl animate-slide-up">
        {/* Back Link */}
        <button
          onClick={() => navigate('/teacher-login')}
          className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200 transition-colors mb-6 group cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Login
        </button>

        <div className="glass-panel p-8 md:p-10 rounded-3xl shadow-2xl border border-slate-800/80">
          <div className="mb-8 text-center md:text-left">
            <h1 className="text-3xl font-bold tracking-tight text-white">Create Teacher Account</h1>
            <p className="text-sm text-slate-400 mt-1">Register to start interactive live sessions with your classrooms</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Full Name */}
              <div className="flex flex-col gap-1.5">
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
                    placeholder="Prof. John Doe"
                    className="w-full glass-input pl-12 pr-4 py-3 rounded-2xl text-sm"
                    required
                  />
                </div>
              </div>

              {/* Email Address */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider pl-1">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="johndoe@university.edu"
                    className="w-full glass-input pl-12 pr-4 py-3 rounded-2xl text-sm"
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
                    className="w-full glass-input pl-12 pr-4 py-3 rounded-2xl text-sm"
                    required
                  />
                </div>
              </div>

              {/* Employee ID */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider pl-1">
                  Employee / Teacher ID *
                </label>
                <div className="relative">
                  <Award className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input
                    type="text"
                    name="employeeId"
                    value={form.employeeId}
                    onChange={handleChange}
                    placeholder="EMP-12345"
                    className="w-full glass-input pl-12 pr-4 py-3 rounded-2xl text-sm"
                    required
                  />
                </div>
              </div>

              {/* Department */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider pl-1">
                  Department *
                </label>
                <div className="relative">
                  <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input
                    type="text"
                    name="department"
                    value={form.department}
                    onChange={handleChange}
                    placeholder="Computer Science"
                    className="w-full glass-input pl-12 pr-4 py-3 rounded-2xl text-sm"
                    required
                  />
                </div>
              </div>

              {/* Designation */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider pl-1">
                  Designation
                </label>
                <div className="relative">
                  <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input
                    type="text"
                    name="designation"
                    value={form.designation}
                    onChange={handleChange}
                    placeholder="Assistant Professor (optional)"
                    className="w-full glass-input pl-12 pr-4 py-3 rounded-2xl text-sm"
                  />
                </div>
              </div>

              {/* Subjects Taught */}
              <div className="md:col-span-2 flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider pl-1">
                  Subjects Taught (comma separated)
                </label>
                <div className="relative">
                  <Award className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input
                    type="text"
                    name="subjectsTaught"
                    value={form.subjectsTaught}
                    onChange={handleChange}
                    placeholder="DBMS, Data Structures, Operating Systems"
                    className="w-full glass-input pl-12 pr-4 py-3 rounded-2xl text-sm"
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
              className="group relative flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white py-4 rounded-2xl font-semibold shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/40 hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 disabled:opacity-50 disabled:pointer-events-none cursor-pointer mt-2 w-full"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Register & Create Account <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <p className="text-sm text-slate-400 text-center mt-6">
            Already have an account?{' '}
            <Link to="/teacher-login" className="text-indigo-400 font-semibold hover:text-indigo-350 transition-colors underline underline-offset-4">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default TeacherSignup;