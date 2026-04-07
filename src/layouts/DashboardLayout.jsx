import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/auth';
import { 
  Home, BookOpen, Target, Zap, BarChart2, Hexagon, LogOut
} from 'lucide-react';
import '../pages/Dashboard.css';

export default function DashboardLayout() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const assignedClass = profile?.class || user?.user_metadata?.class_name || 'class10';
  const name = profile?.name || user?.user_metadata?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || "Abhi";
  
  const [activeClass, setActiveClass] = useState(String(assignedClass).replace('class',''));

  const getInitials = (n) => n ? n.substring(0, 1).toUpperCase() : 'A';

  const handleLogout = async () => {
    try {
      await authService.logout();
      navigate('/login');
    } catch (err) {
      console.error('Logout failed', err);
    }
  };

  // Determine active tab by looking at the current path
  const path = location.pathname;
  let activeTab = 'dashboard';
  if (path.includes('/practice')) activeTab = 'mcq';
  else if (path.includes('/flashcards')) activeTab = 'flashcards';
  else if (path.includes('/study') || path.includes('/subject')) {
    // If it's a specific mode or subject, we can map it to 'notes' or 'mcq'
    if (path.includes('/mcq')) activeTab = 'mcq';
    else if (path.includes('/flashcard')) activeTab = 'flashcards';
    else activeTab = 'notes';
  }

  const [notesExpanded, setNotesExpanded] = useState(false);

  const subjects11_12 = ['Physics', 'Chemistry', 'Biology', 'Mathematics'];
  const subjects9_10 = ['Science', 'Mathematics'];
  const currentSubjects = (activeClass === '11' || activeClass === '12') ? subjects11_12 : subjects9_10;

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <Home size={18} />, path: '/student-dashboard', badge: null },
    { id: 'notes', label: 'My Notes', icon: <BookOpen size={18} />, path: '#', badge: null }, // Path is '#' so it toggles instead
    { id: 'mcq', label: 'MCQ Practice', icon: <Target size={18} />, path: '/practice', badge: null },
    { id: 'flashcards', label: 'Flashcards', icon: <Zap size={18} />, path: '/flashcards', badge: null },
    { id: 'progress', label: 'Progress', icon: <BarChart2 size={18} />, path: '#', badge: null },
  ];

  const classes = ['9', '10', '11', '12'];

  return (
    <div className="new-dashboard-layout">
      {/* ── LEFT SIDEBAR (STABLE) ── */}
      <aside className="d-sidebar">
        <div className="d-logo">
          <div className="d-logo-icon">
            <BookOpen size={20} color="#0f172a" strokeWidth={2.5} />
          </div>
          <h2>StudyPeak</h2>
        </div>

        <div className="d-menu-section">
          <h4 className="d-menu-title">MAIN MENU</h4>
          <nav className="d-nav">
            {menuItems.map(item => (
              <React.Fragment key={item.id}>
                <div 
                  className={`d-nav-item ${activeTab === item.id ? 'active' : ''}`}
                  onClick={() => {
                    if (item.id === 'notes') {
                      setNotesExpanded(!notesExpanded);
                    } else if(item.path !== '#') {
                      navigate(item.path);
                    }
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span className="d-nav-icon">{item.icon}</span>
                    <span className="d-nav-label">{item.label}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {item.badge && <span className="d-nav-badge">{item.badge}</span>}
                    {item.id === 'notes' && (
                      <span style={{ fontSize: '10px', opacity: 0.6 }}>{notesExpanded ? '▲' : '▼'}</span>
                    )}
                  </div>
                </div>
                {item.id === 'notes' && notesExpanded && (
                  <div style={{ paddingLeft: '32px', display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '4px', marginBottom: '8px' }}>
                    {currentSubjects.map(sub => (
                      <div 
                        key={sub}
                        className="d-nav-item"
                        style={{ padding: '6px 12px', fontSize: '0.85rem' }}
                        onClick={() => navigate(`/class${activeClass}/subject/${sub.toLowerCase()}`)}
                      >
                        {sub}
                      </div>
                    ))}
                  </div>
                )}
              </React.Fragment>
            ))}
          </nav>
        </div>

        <div className="d-menu-section" style={{ marginTop: '30px' }}>
          <h4 className="d-menu-title">CLASSES</h4>
          <div className="d-classes-list">
            {classes.map(c => (
              <div 
                key={c} 
                className={`d-class-item ${activeClass === c ? 'active' : ''}`}
                onClick={() => setActiveClass(c)}
              >
                <div className={`d-class-badge ${activeClass === c ? 'active-badge' : ''}`}>{c}</div>
                <span>Class {c}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="d-menu-section" style={{ marginTop: 'auto', marginBottom: '16px' }}>
          <div 
            className="d-nav-item" 
            onClick={handleLogout}
            style={{ color: '#ef4444' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span className="d-nav-icon"><LogOut size={18} color="#ef4444" /></span>
              <span className="d-nav-label">Log Out</span>
            </div>
          </div>
        </div>

        <div className="d-user-profile">
          <div className="d-user-avatar">{getInitials(name)}</div>
          <div className="d-user-info">
            <h4>{name} Kumar</h4>
            <p>Class {activeClass} · Premium</p>
          </div>
          <div className="d-user-settings">
            <Hexagon size={16} color="#64748b" style={{ transform: 'rotate(90deg)' }} />
          </div>
        </div>
      </aside>

      {/* ── RIGHT MAIN CONTENT PANE (DYNAMIC) ── */}
      <main className="d-main">
        <Outlet />
      </main>
    </div>
  );
}
