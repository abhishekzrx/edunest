import { useState, useEffect } from 'react';
import { testSupabaseConnection, saveCustomMCQs, fetchCustomMCQs } from '../utils/supabaseHelpers';
import { Palette, Book, Database, Server, Cloud, Settings } from 'lucide-react';
import './Dashboard.css';

export default function SystemConfig() {
  const [dbStatus, setDbStatus] = useState(null);
  const [dbError, setDbError] = useState('');
  
  // Admin Font Manager State
  const [globalFont, setGlobalFont] = useState('Lexend');
  const [fontStatus, setFontStatus] = useState(null);
  const topFonts = ['Lexend', 'Inter', 'Roboto', 'Open Sans', 'Montserrat', 'Lato', 'Poppins', 'Nunito', 'Raleway', 'Ubuntu'];

  // Admin Theme Manager State
  const [appTheme, setAppTheme] = useState(localStorage.getItem('appTheme') || 'default');
  const [themeStatus, setThemeStatus] = useState(null);

  useEffect(() => {
    fetchCustomMCQs('all', 'settings', 'global_font').then(data => {
      if (data && data.length > 0 && data[0].fontFamily) {
        setGlobalFont(data[0].fontFamily);
      }
    });
  }, []);

  const handleTestConnection = async () => {
    setDbStatus('loading');
    const res = await testSupabaseConnection();
    if (res.success) {
      setDbStatus('success');
    } else {
      setDbStatus('error');
      setDbError(res.error);
    }
  };

  const handleSaveFont = async () => {
    try {
      const res = await saveCustomMCQs('all', 'settings', 'global_font', [{ fontFamily: globalFont }]);
      if (res.success) {
        setFontStatus({ type: 'success', msg: `Font set to ${globalFont}` });
      } else {
        setFontStatus({ type: 'error', msg: res.error });
      }
    } catch (e) {
      setFontStatus({ type: 'error', msg: 'Failed to save font.' });
    }
  };

  const handleSaveTheme = () => {
    localStorage.setItem("appTheme", appTheme);
    document.body.setAttribute("data-theme", appTheme);
    setThemeStatus({ type: 'success', msg: `Theme updated globally!` });
  };

  return (
    <div className="dashboard" style={{ padding: '20px' }}>
      <header className="dashboard-header glass">
        <div className="welcome-section">
          <h1 style={{display: 'flex', alignItems: 'center', gap: '8px'}}><Settings size={28} /> System Configuration</h1>
          <p style={{marginTop: '5px'}}>Advanced application settings and database diagnostics.</p>
        </div>
      </header>

      <section className="admin-tools mt-8 fade-in-up">
        <div className="admin-card glass-card premium-border" style={{ marginTop: '15px', padding: '25px', backgroundColor: 'var(--bg-color)' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Palette size={24} color={'#10b981'} />
            Global Theme Control
          </h3>
          <p style={{ marginTop: '10px', marginBottom: '20px', color: 'var(--text-color)', opacity: 0.8 }}>
            Change the application theme (Admin Only override).
          </p>
          <div style={{ display: 'flex', gap: '15px', marginBottom: '15px', flexWrap: 'wrap', alignItems: 'center' }}>
            <select value={appTheme} onChange={e => setAppTheme(e.target.value)} style={{flex: 1, minWidth: '150px', padding: '10px', borderRadius: '8px', background: 'var(--bg-color)', border: '1px solid var(--border-color)', color: 'var(--text-color)'}}>
              <option value="default">🌿 Green Premium</option>
              <option value="dark">🌙 Dark Mode</option>
              <option value="light">☀️ Light Minimal</option>
            </select>
            <button className="auth-btn hover-glow" onClick={handleSaveTheme} style={{ padding: '10px 24px', backgroundColor: '#10b981', width: 'auto' }}>
              Apply Theme
            </button>
          </div>
          {themeStatus && (
            <div style={{ padding: '12px', backgroundColor: themeStatus.type === 'success' ? '#10b98120' : '#ef444420', color: themeStatus.type === 'success' ? '#10b981' : '#ef4444', borderRadius: '8px', fontWeight: '500' }}>
              {themeStatus.type === 'success' ? '✅' : '❌'} {themeStatus.msg}
            </div>
          )}
        </div>
        
        <div className="admin-card glass-card premium-border" style={{ marginTop: '25px', padding: '25px', backgroundColor: 'var(--bg-color)' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#3b82f6' }}>
            <Book size={24} color={'#3b82f6'} />
            Global MCQ Font Setting
          </h3>
          <p style={{ marginTop: '10px', marginBottom: '20px', color: 'var(--text-color)', opacity: 0.8 }}>
            Change the font family used exclusively for all user MCQs. This applies globally.
          </p>
          <div style={{ display: 'flex', gap: '15px', marginBottom: '15px', flexWrap: 'wrap', alignItems: 'center' }}>
            <select value={globalFont} onChange={e => setGlobalFont(e.target.value)} style={{flex: 1, minWidth: '150px', padding: '10px', borderRadius: '8px', background: 'var(--bg-color)', border: '1px solid var(--border-color)', color: 'var(--text-color)', fontFamily: globalFont}}>
              {topFonts.map(font => (
                <option key={font} value={font} style={{fontFamily: font}}>{font}</option>
              ))}
            </select>
            <button className="auth-btn hover-glow" onClick={handleSaveFont} style={{ padding: '10px 24px', backgroundColor: '#3b82f6', width: 'auto' }}>
              Apply Font
            </button>
          </div>
          {fontStatus && (
            <div style={{ padding: '12px', backgroundColor: fontStatus.type === 'success' ? '#10b98120' : '#ef444420', color: fontStatus.type === 'success' ? '#10b981' : '#ef4444', borderRadius: '8px', fontWeight: '500' }}>
              {fontStatus.type === 'success' ? '✅' : '❌'} {fontStatus.msg}
            </div>
          )}
        </div>

        <div className="admin-card glass-card premium-border" style={{ marginTop: '25px', padding: '25px', backgroundColor: 'var(--bg-color)' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Database size={24} color={'#8b5cf6'} />
            System Connectivity Diagnostics
          </h3>
          <p style={{ marginTop: '10px', marginBottom: '10px', color: 'var(--text-color)', opacity: 0.8 }}>
            Real-time optical fiber sync status with Supabase Cloud.
          </p>

          <div className={`fiber-container fiber-${dbStatus || 'idle'}`}>
            <Server className="fiber-icon" size={32} />
            <div className="fiber-track"></div>
            <div className="fiber-left"></div>
            <div className="fiber-right"></div>
            <div className="fiber-node"></div>
            <Cloud className="fiber-icon" size={32} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
             <button 
               onClick={handleTestConnection} 
               disabled={dbStatus === 'loading'}
               className="auth-btn hover-glow" style={{ width: 'auto', padding: '10px 24px', backgroundColor: '#8b5cf6', margin: 0 }}
             >
               {dbStatus === 'loading' ? 'Syncing...' : 'Initiate Phase-Link ⚡'}
             </button>

             {dbStatus === 'success' && (
               <span style={{ color: '#10b981', fontWeight: 'bold', fontSize: '0.9rem' }}>
                 ✅ LINK ESTABLISHED: OPTICAL SYNC ACTIVE
               </span>
             )}
             
             {dbStatus === 'error' && (
               <span style={{ color: '#ef4444', fontWeight: 'bold', fontSize: '0.9rem', cursor: 'help' }} title={dbError}>
                 ❌ LINK SEVERED: DATA SYNC FAILURE
               </span>
             )}
          </div>
        </div>
      </section>
    </div>
  );
}
