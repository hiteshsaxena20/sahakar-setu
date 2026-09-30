import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Programmes } from './pages/Programmes';
import { Nominations } from './pages/Nominations';
import { Trainees } from './pages/Trainees';
import { Courses } from './pages/Courses';
import { Assessments } from './pages/Assessments';
import { Certificates } from './pages/Certificates';
import { Attendance } from './pages/Attendance';
import { Jobs } from './pages/Jobs';
import { Applications } from './pages/Applications';
import { Employers } from './pages/Employers';
import { Chatbot } from './pages/Chatbot';
import { Analytics } from './pages/Analytics';
import { Settings } from './pages/Settings';

function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode; allowedRoles?: string[] }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.some(role => user.roles.includes(role))) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="programmes" element={<Programmes />} />
        <Route path="nominations" element={<Nominations />} />
        <Route path="trainees" element={<Trainees />} />
        <Route path="courses" element={<Courses />} />
        <Route path="assessments" element={<Assessments />} />
        <Route path="certificates" element={<Certificates />} />
        <Route path="attendance" element={<Attendance />} />
        <Route path="jobs" element={<Jobs />} />
        <Route path="applications" element={<Applications />} />
        <Route path="employers" element={<Employers />} />
        <Route path="chatbot" element={<Chatbot />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  );
}