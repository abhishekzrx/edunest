import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, profile, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', width: '100vw' }}>Loading Session...</div>;
  }

  // Not logged in -> Redirect to login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check roles if required
  if (allowedRoles && profile && profile.role) {
    const userRole = profile.role.toLowerCase();
    
    // Convert all allowed roles to lowercase for safe comparison
    const safeAllowedRoles = allowedRoles.map(r => r.toLowerCase());
    
    if (!safeAllowedRoles.includes(userRole)) {
      // Role not allowed -> Redirect to appropriate dashboard safely
      return <Navigate to={userRole === 'admin' ? '/admin-dashboard' : '/student-dashboard'} replace />;
    }
  }

  // If no role specified, or role matches -> Render child
  return children;
}
