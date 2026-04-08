import React, { useState, useEffect } from 'react';
import ChapterManagementHub from '../components/admin/ChapterManagementHub';
import MCQManagementHub from '../components/admin/MCQManagementHub';
import './SuperAdminDashboard.css';

const SuperAdminDashboard = () => {
  const [toastMsg, setToastMsg] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [activeNav, setActiveNav] = useState('Dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isChapterModalOpen, setChapterModalOpen] = useState(false);
  const [isMcqModalOpen, setMcqModalOpen] = useState(false);

  const triggerToast = (msg) => {
    setToastMsg(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2500);
  };

  const chartData = [62, 45, 88, 73, 91, 55, 78];

  const topPerformers = [
    { name: 'Priya Sharma', score: 92 },
    { name: 'Arjun Mehta', score: 88 },
    { name: 'Sneha Patel', score: 85 }
  ];

  const classData = [
    { name: 'Class 9', mcqs: '2,840', students: '612', tagColor: 'teal' },
    { name: 'Class 10', mcqs: '3,920', students: '834', tagColor: 'gold' }
  ];

  // Close sidebar on exterior click (simplified version, mobile ux improvement)
  const handleContentClick = () => {
    if (sidebarOpen) setSidebarOpen(false);
  };

  return (
    <div className="sa-container">
      {/* ─── SIDEBAR NAV ─── */}
      <aside className={`sa-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sa-sidebar-logo">
          <div className="sa-sidebar-logo-icon">📚</div>
          <div>
            <div className="sa-sidebar-logo-text">StudyPeak</div>
            <div className="sa-sidebar-logo-sub">Admin Console</div>
          </div>
        </div>
        
        <div className="sa-sidebar-admin">
          <div className="sa-admin-avatar">A</div>
          <div className="sa-admin-info">
            <div className="sa-admin-name">Super Admin</div>
            <div className="sa-admin-role">● ONLINE</div>
          </div>
        </div>

        <nav className="sa-nav-menu">
          <div className="sa-nav-section">Overview</div>
          <a 
            className={`sa-nav-link ${activeNav === 'Dashboard' ? 'active' : ''}`}
            onClick={() => { setActiveNav('Dashboard'); setSidebarOpen(false); }}
          >
            <span className="sa-nav-icon">📊</span> Dashboard
          </a>
          <a 
            className={`sa-nav-link ${activeNav === 'Analytics' ? 'active' : ''}`}
            onClick={() => { setActiveNav('Analytics'); setSidebarOpen(false); }}
          >
            <span className="sa-nav-icon">📈</span> Analytics
          </a>
          
          <div className="sa-nav-section">Content</div>
          <a className="sa-nav-link" onClick={() => setSidebarOpen(false)}>
            <span className="sa-nav-icon">📖</span> Chapters
          </a>
          <a className="sa-nav-link" onClick={() => setSidebarOpen(false)}>
            <span className="sa-nav-icon">🎯</span> MCQs
          </a>
          <a className="sa-nav-link" onClick={() => setSidebarOpen(false)}>
            <span className="sa-nav-icon">⚡</span> Flash Cards
          </a>
        </nav>
      </aside>

      {/* ─── MAIN CONTENT ─── */}
      <main className="sa-main" onClick={handleContentClick}>
        <header className="sa-topbar">
          <div className="sa-topbar-left">
            <button 
              className="sa-mobile-toggle" 
              onClick={(e) => { e.stopPropagation(); setSidebarOpen(!sidebarOpen); }}
            >
              ☰
            </button>
            <div>
              <h1 className="sa-page-title">Dashboard</h1>
              <div className="sa-breadcrumb">StudyPeak Admin › Overview</div>
            </div>
          </div>
          <div className="sa-topbar-right">
            <button className="sa-tb-btn" onClick={() => triggerToast('🔄 Data refreshed successfully!')}>
              🔄 Refresh
            </button>
          </div>
        </header>

        <div className="sa-content-scroll">
          <div className="sa-stats-grid">
            <div className="sa-stat-card sa-teal">
              <div className="sa-stat-top">
                <div className="sa-stat-icon sa-teal-icon">🎓</div>
              </div>
              <div className="sa-stat-val">2,847</div>
              <div className="sa-stat-label">Total Students</div>
            </div>
            
            <div className="sa-stat-card sa-gold">
              <div className="sa-stat-top">
                <div className="sa-stat-icon sa-gold-icon">📖</div>
              </div>
              <div className="sa-stat-val">156</div>
              <div className="sa-stat-label">Total Chapters</div>
            </div>
            
            <div className="sa-stat-card sa-coral">
              <div className="sa-stat-top">
                <div className="sa-stat-icon sa-coral-icon">🎯</div>
              </div>
              <div className="sa-stat-val">12,480</div>
              <div className="sa-stat-label">MCQs in DB</div>
            </div>
            
            <div className="sa-stat-card sa-lavender">
              <div className="sa-stat-top">
                <div className="sa-stat-icon sa-lavender-icon">⚡</div>
              </div>
              <div className="sa-stat-val">3,204</div>
              <div className="sa-stat-label">Flash Cards</div>
            </div>
          </div>

          <div className="sa-two-col">
            <div className="sa-card">
              <div className="sa-card-hdr">
                <h2 className="sa-card-title">Class Breakdown</h2>
              </div>
              <div className="sa-table-container">
                <table className="sa-table">
                  <thead>
                    <tr>
                      <th>Class</th>
                      <th>MCQs</th>
                      <th>Students</th>
                    </tr>
                  </thead>
                  <tbody>
                    {classData.map((cls, idx) => (
                      <tr key={idx}>
                        <td><span className={`sa-tag sa-tag-${cls.tagColor}`}>{cls.name}</span></td>
                        <td>{cls.mcqs}</td>
                        <td>{cls.students}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            
            <div className="sa-card">
              <div className="sa-card-hdr">
                <h2 className="sa-card-title">Weekly Activity</h2>
              </div>
              <div className="sa-bar-chart">
                {chartData.map((val, idx) => (
                  <div 
                    key={idx} 
                    className="sa-bar" 
                    style={{ height: `${val}%`, animationDelay: `${idx * 0.1}s` }} 
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="sa-two-col">
            <div className="sa-card">
              <div className="sa-card-hdr">
                <h2 className="sa-card-title">🏆 Top Performers</h2>
              </div>
              <div className="sa-top-performers">
                {topPerformers.map((student, idx) => (
                  <div className="sa-stu-item" key={idx}>
                    <div className="sa-stu-avatar">
                      {student.name.charAt(0)}
                    </div>
                    <div className="sa-stu-info">
                      <div className="sa-stu-name">{student.name}</div>
                    </div>
                    <div className="sa-stu-score">{student.score}%</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="sa-card">
              <div className="sa-card-hdr">
                <h2 className="sa-card-title">⚡ Quick Actions</h2>
              </div>
              <div className="sa-quick-actions">
                <button className="sa-btn sa-btn-teal" onClick={() => setChapterModalOpen(true)}>📖 Add Chapter</button>
                <button className="sa-btn sa-btn-gold" onClick={() => setMcqModalOpen(true)}>🎯 Add MCQ</button>
                <button className="sa-btn sa-btn-ghost">⚡ Add Card</button>
                <button className="sa-btn sa-btn-danger">⚙️ Settings</button>
              </div>

              <h3 className="sa-card-subtitle">Recent Alerts</h3>
              <div className="sa-alerts-list">
                <div className="sa-alert-item sa-alert-coral">
                  <span className="sa-alert-icon">⚠️</span>
                  <div className="sa-alert-content">
                    <div className="sa-alert-title">3 chapters locked in Cl.12</div>
                    <div className="sa-alert-desc">Review pending content</div>
                  </div>
                </div>
                <div className="sa-alert-item sa-alert-teal">
                  <span className="sa-alert-icon">✅</span>
                  <div className="sa-alert-content">
                    <div className="sa-alert-title">MCQ Set 3 published — Cl.10 Science</div>
                    <div className="sa-alert-desc">2 hours ago</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ─── TOAST NOTIFICATION ─── */}
      <div className={`sa-toast ${showToast ? 'show' : ''}`}>
        ✅ <span>{toastMsg}</span>
      </div>

      {/* ─── MODALS ─── */}
      {isChapterModalOpen && <ChapterManagementHub onClose={() => setChapterModalOpen(false)} />}
      {isMcqModalOpen && <MCQManagementHub onClose={() => setMcqModalOpen(false)} />}
    </div>
  );
};

export default SuperAdminDashboard;
