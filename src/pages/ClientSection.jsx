import { ExternalLink, Users, Phone, Layout } from 'lucide-react';
import './Dashboard.css';

export default function ClientSection() {
  return (
    <div className="dashboard fade-in-up">
      <header className="dashboard-header glass" style={{ marginBottom: '30px' }}>
        <div className="welcome-section">
          <h1>Client <span className="highlight-emerald">Section</span> 🤝</h1>
          <p>Access external resources, portals, and support gateways.</p>
        </div>
      </header>
      
      <div className="admin-tools mt-8">
        <div className="stats-cards" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
          
          <div className="admin-card glass-card premium-border" style={{ padding: '25px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <Users size={32} color="#3b82f6" />
            <h3 style={{ fontSize: '1.2rem', color: 'var(--text-color)' }}>Student Portal Connect</h3>
            <p style={{ opacity: 0.8, fontSize: '0.9rem', color: 'var(--text-color)', flex: 1 }}>
              Access the external student services portal for fee management and admissions.
            </p>
            <button className="auth-btn hover-glow" style={{ width: '100%', display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <ExternalLink size={18} /> Open Portal
            </button>
          </div>

          <div className="admin-card glass-card premium-border" style={{ padding: '25px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <Layout size={32} color="#10b981" />
            <h3 style={{ fontSize: '1.2rem', color: 'var(--text-color)' }}>Resource Library</h3>
            <p style={{ opacity: 0.8, fontSize: '0.9rem', color: 'var(--text-color)', flex: 1 }}>
              Official templates, PDF guides, and downloadable content repository.
            </p>
            <button className="auth-btn hover-glow" style={{ width: '100%', background: '#10b981', display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <ExternalLink size={18} /> Browse Resources
            </button>
          </div>

          <div className="admin-card glass-card premium-border" style={{ padding: '25px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <Phone size={32} color="#ec4899" />
            <h3 style={{ fontSize: '1.2rem', color: 'var(--text-color)' }}>Direct Support</h3>
            <p style={{ opacity: 0.8, fontSize: '0.9rem', color: 'var(--text-color)', flex: 1 }}>
              Raise an IT ticket or connect directly with the administrative support team.
            </p>
            <button className="auth-btn hover-glow" style={{ width: '100%', background: '#ec4899', display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <ExternalLink size={18} /> Contact Support
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
