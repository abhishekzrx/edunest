import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/auth';
import { LogOut, User as UserIcon, Moon, Sun, BookOpen, Menu, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import LanguageToggle from './LanguageToggle';
import './Navbar.css';

export default function Navbar() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const handleLogout = async () => {
    await authService.logout();
    navigate('/login');
  };

  const dashboardLink = profile?.role === 'admin' ? '/admin-dashboard' : '/student-dashboard';

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-left">
          <Link to={user ? dashboardLink : "/login"} className="navbar-logo">
            <BookOpen className="logo-icon" />
            <span>StudyNest</span>
          </Link>
          
          {user && (
            <div className={`nav-links ${mobileMenuOpen ? 'active' : ''}`}>
               <NavLink to="/" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>Home</NavLink>
               <NavLink to={dashboardLink} className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>Dashboard</NavLink>
               
               {/* Student Specific Links */}
               {profile?.role !== 'admin' && (
                 <>
                   <NavLink to="/class10/subject/science" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>Notes</NavLink>
                   <NavLink to="/practice" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>MCQs</NavLink>
                   <NavLink to="/flashcards" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>Flashcards</NavLink>
                 </>
               )}
               
               {/* Admin Specific Links */}
               {profile?.role === 'admin' && (
                 <>
                   <NavLink to="/classes" className={({isActive}) => isActive ? "nav-item active admin-link" : "nav-item admin-link"}>Classes DB</NavLink>
                   <NavLink to="/admin-dashboard" className={({isActive}) => isActive ? "nav-item active admin-link" : "nav-item admin-link"}>C-Panel</NavLink>
                 </>
               )}
               
               <NavLink to="/contact" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>Contact</NavLink>
               <NavLink to="/help" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>Help</NavLink>
            </div>
          )}
        </div>

        <div className="navbar-menu">
          {user && profile?.role !== 'admin' && <LanguageToggle />}
          
          <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle dark mode">
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>
          
          {user ? (
            <div className="user-menu">
              <span className="user-name">
                <UserIcon size={16} /> 
                {profile?.name || user.user_metadata?.full_name || user.email?.split('@')[0]}
              </span>
              <button className="logout-btn" onClick={handleLogout}>
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="login-link">Login</Link>
              <Link to="/signup" className="signup-link">Sign Up</Link>
            </div>
          )}

          {user && (
            <button className="mobile-menu-btn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
               {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
