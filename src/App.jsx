import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Signup from './pages/Signup';
import StudentDashboard from './pages/StudentDashboard';
import AdminDashboard from './pages/AdminDashboard';
import SystemConfig from './pages/SystemConfig';
import SubjectPage from './pages/SubjectPage';
import UnifiedStudy from './pages/UnifiedStudy';
import ClassesPage from './pages/ClassesPage';
import ClientSection from './pages/ClientSection';
import MCQDashboard from './pages/MCQDashboard';
import DailyPractice from './pages/DailyPractice';
import DashboardLayout from './layouts/DashboardLayout';
import { Outlet } from 'react-router-dom';
import './App.css';

// Root redirector based on auth profile
function RootRedirect() {
  const { user, profile, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" />;
  if (profile?.role === 'admin') return <Navigate to="/admin-dashboard" />;
  return <Navigate to="/student-dashboard" />;
}

function ThemeInitializer() {
  useEffect(() => {
    const savedTheme = localStorage.getItem("appTheme") || "default";
    document.body.setAttribute("data-theme", savedTheme);

    const savedFont = localStorage.getItem("appFont") || "Lexend";
    document.body.style.fontFamily = savedFont;
    document.documentElement.style.setProperty('--font-family', `"${savedFont}", sans-serif`);
  }, []);
  return null;
}

function BaseLayout() {
  return (
    <div className="app-container">
      <Navbar />
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <ThemeInitializer />
      <Router>
        <Routes>
            {/* --- DASHBOARD LAYOUT (Student Portal) --- */}
            <Route element={<DashboardLayout />}>
              <Route path="/student-dashboard" element={
                <ProtectedRoute allowedRoles={['student']}>
                  <StudentDashboard />
                </ProtectedRoute>
              } />
              <Route path="/:classId/subject/:subjectId" element={
                <ProtectedRoute>
                  <SubjectPage />
                </ProtectedRoute>
              } />
              <Route path="/study/:classId/:subjectId/:chapterId/:mode" element={
                <ProtectedRoute>
                  <UnifiedStudy />
                </ProtectedRoute>
              } />
              <Route path="/practice" element={
                <ProtectedRoute>
                  <DailyPractice />
                </ProtectedRoute>
              } />
            </Route>

            {/* --- BASE LAYOUT (Auth, Admin, Configuration) --- */}
            <Route element={<BaseLayout />}>
              <Route path="/" element={<RootRedirect />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />

              <Route path="/admin-dashboard" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              } />

              <Route path="/system-config" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <SystemConfig />
                </ProtectedRoute>
              } />

              <Route path="/classes" element={
                <ProtectedRoute>
                  <ClassesPage />
                </ProtectedRoute>
              } />
              <Route path="/client" element={
                <ProtectedRoute>
                  <ClientSection />
                </ProtectedRoute>
              } />
              <Route path="/mcqs" element={
                <ProtectedRoute>
                  <MCQDashboard />
                </ProtectedRoute>
              } />
            </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;