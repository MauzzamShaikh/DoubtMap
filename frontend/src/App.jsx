import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import CreateSession from './pages/CreateSession';
import TeacherDashboard from './pages/TeacherDashboard';
import StudentJoin from './pages/StudentJoin';
import StudentSession from './pages/StudentSession';
import TeacherLogin from './pages/TeacherLogin';
import TeacherSignup from './pages/TeacherSignup';
import StudentLogin from './pages/StudentLogin';
import StudentSignup from './pages/StudentSignup';
import StudentHistory from './pages/StudentHistory';
import MySessions from './pages/MySessions';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import VerifyEmail from './pages/VerifyEmail';
function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/create" element={<CreateSession />} />
      <Route path="/dashboard/:code" element={<TeacherDashboard />} />
      <Route path="/join" element={<StudentJoin />} />
      <Route path="/session/:code" element={<StudentSession />} />
      <Route path="/teacher-login" element={<TeacherLogin />} />
      <Route path="/teacher-signup" element={<TeacherSignup />} />
      <Route path="/student-login" element={<StudentLogin />} />
      <Route path="/student-signup" element={<StudentSignup />} />
      <Route path="/history" element={<StudentHistory />} />
      <Route path="/my-sessions" element={<MySessions />} />
      <Route path="/forgot-password/teacher" element={<ForgotPassword role="teacher" />} />
      <Route path="/forgot-password/student" element={<ForgotPassword role="student" />} />
      <Route path="/reset-password/:role/:token" element={<ResetPassword />} />
      <Route path="/verify-email/:role/:token" element={<VerifyEmail />} />
    </Routes>
  );
}

export default App;