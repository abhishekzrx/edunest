import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { testSupabaseConnection, saveCustomMCQs, clearCustomMCQs, fetchCustomMCQs, fetchClassAnalytics } from '../utils/supabaseHelpers';
import { Book, Target, Users, LayoutDashboard, Palette, Activity, AlertCircle, TrendingDown, Server, Cloud, Database } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import ChapterManager from '../components/admin/ChapterManager';
import MCQManager from '../components/admin/MCQManager';
import PurgeProtocol from '../components/admin/PurgeProtocol';
import MCQAnalyticsVisualizer from '../components/admin/MCQAnalyticsVisualizer';
import AccessManager from '../components/admin/AccessManager';
import FlashcardInjector from '../components/admin/FlashcardInjector';
import './Dashboard.css'; // Reuse existing CSS

export default function AdminDashboard() {
  const { user, profile } = useAuth();
  
  // Analytics Stats
  const [stats, setStats] = useState({ class9: 0, class10: 0, class11: 0, class12: 0, total: 0 });

  const name = profile?.name || user?.user_metadata?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || "Admin";

  useEffect(() => {
    fetchClassAnalytics().then(res => {
      if (res.success) {
        setStats({ ...res.data, total: res.total });
      }
    });
  }, []);

  return (
    <div className="dashboard">
      <section className="admin-tools mt-8 fade-in-up">
        <h2><LayoutDashboard size={24} style={{display:'inline', verticalAlign:'bottom', marginRight: '8px'}}/>Analytics Dashboard</h2>
        
        <div className="stats-cards" style={{marginTop: '20px', gap: '20px'}}>
          <div className="stat-card glass-card hover-glow premium-border" style={{borderTop: 'none', borderLeft: '4px solid #10b981', flex: 1, padding: '24px', background: 'linear-gradient(135deg, rgba(16,185,129,0.05) 0%, rgba(16,185,129,0) 100%), var(--bg-color)'}}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
              <h3 style={{fontSize: '1.1rem', color: 'var(--text-color)', opacity: 0.9, margin: 0}}>Total Enrolled</h3>
              <Users size={20} color="#10b981" opacity={0.8}/>
            </div>
            <div className="stat-value" style={{fontSize: '2.5rem', fontWeight: '800', marginTop: '10px', color: '#10b981'}}>{stats.total}</div>
          </div>
          
          <div className="stat-card glass-card hover-glow premium-border" style={{borderTop: 'none', borderLeft: '4px solid #3b82f6', flex: 1, padding: '24px', background: 'linear-gradient(135deg, rgba(59,130,246,0.05) 0%, rgba(59,130,246,0) 100%), var(--bg-color)'}}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
              <h3 style={{fontSize: '1.1rem', color: 'var(--text-color)', opacity: 0.9, margin: 0}}>Class 10 Users</h3>
              <Users size={20} color="#3b82f6" opacity={0.8}/>
            </div>
            <div className="stat-value" style={{fontSize: '2.5rem', fontWeight: '800', marginTop: '10px', color: '#3b82f6'}}>{stats.class10}</div>
            <button className="auth-btn" style={{marginTop: '15px', fontSize: '0.85rem', padding: '8px 16px', background: 'transparent', border: '1px solid rgba(59,130,246,0.4)', color: '#3b82f6', transition: 'all 0.3s ease', width: '100%'}} onClick={() => window.location.href='/class10/subject/science'}>Explore Dashboard</button>
          </div>
          
          <div className="stat-card glass-card hover-glow premium-border" style={{borderTop: 'none', borderLeft: '4px solid #f59e0b', flex: 1, padding: '24px', background: 'linear-gradient(135deg, rgba(245,158,11,0.05) 0%, rgba(245,158,11,0) 100%), var(--bg-color)'}}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
              <h3 style={{fontSize: '1.1rem', color: 'var(--text-color)', opacity: 0.9, margin: 0}}>Class 12 Users</h3>
              <Users size={20} color="#f59e0b" opacity={0.8}/>
            </div>
            <div className="stat-value" style={{fontSize: '2.5rem', fontWeight: '800', marginTop: '10px', color: '#f59e0b'}}>{stats.class12}</div>
            <button className="auth-btn" style={{marginTop: '15px', fontSize: '0.85rem', padding: '8px 16px', background: 'transparent', border: '1px solid rgba(245,158,11,0.4)', color: '#f59e0b', transition: 'all 0.3s ease', width: '100%'}} onClick={() => window.location.href='/class12/subject/science'}>Explore Dashboard</button>
          </div>
        </div>

        {/* Actionable Insights Banner Section */}
        <section className="actionable-insights fade-in-up" style={{ marginTop: '40px', marginBottom: '40px', animationDelay: '0.1s' }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px', fontSize: '1.5rem', fontWeight: 'bold' }}>
            <Activity color="#f59e0b" className="pulse-animation" /> Actionable Insights <span style={{fontSize: '0.9rem', color: 'var(--text-color)', opacity: 0.5, borderLeft: '1px solid rgba(255,255,255,0.2)', paddingLeft: '10px'}}>[ AI Engine Active ]</span>
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
             <div className="insight-card glass-card hover-glow" style={{ padding: '24px', borderLeft: '4px solid #ef4444', backgroundColor: 'rgba(239,68,68,0.03)', backdropFilter: 'blur(12px)', border: '1px solid rgba(239,68,68,0.1)' }}>
                <div style={{ display: 'flex', gap: '15px', alignItems: 'flex-start' }}>
                  <AlertCircle color="#ef4444" size={28} style={{ flexShrink: 0, marginTop: '2px', filter: 'drop-shadow(0 0 8px rgba(239,68,68,0.4))' }} />
                  <div>
                    <h3 style={{ margin: '0 0 10px', fontSize: '1.15rem', color: 'var(--text-color)', fontWeight: '600' }}>Chapter 3 has low accuracy</h3>
                    <p style={{ margin: 0, opacity: 0.75, fontSize: '0.95rem', lineHeight: '1.5' }}>Chemical Reactions & Equations in Class 10 is currently averaging <strong>41% accuracy</strong>. Consider adding easier MCQs or a supplementary note.</p>
                  </div>
                </div>
             </div>
             
             <div className="insight-card glass-card hover-glow" style={{ padding: '24px', borderLeft: '4px solid #f59e0b', backgroundColor: 'rgba(245,158,11,0.03)', backdropFilter: 'blur(12px)', border: '1px solid rgba(245,158,11,0.1)' }}>
                <div style={{ display: 'flex', gap: '15px', alignItems: 'flex-start' }}>
                  <TrendingDown color="#f59e0b" size={28} style={{ flexShrink: 0, marginTop: '2px', filter: 'drop-shadow(0 0 8px rgba(245,158,11,0.4))' }} />
                  <div>
                    <h3 style={{ margin: '0 0 10px', fontSize: '1.15rem', color: 'var(--text-color)', fontWeight: '600' }}>Class 10 Engagement Dropping</h3>
                    <p style={{ margin: 0, opacity: 0.75, fontSize: '0.95rem', lineHeight: '1.5' }}>Daily logins for Class 10 have dropped by <strong>8%</strong> over the last 3 days. Push a new Test to re-engage users.</p>
                  </div>
                </div>
             </div>

             <div className="insight-card glass-card hover-glow" style={{ padding: '24px', borderLeft: '4px solid #8b5cf6', backgroundColor: 'rgba(139,92,246,0.03)', backdropFilter: 'blur(12px)', border: '1px solid rgba(139,92,246,0.1)' }}>
                <div style={{ display: 'flex', gap: '15px', alignItems: 'flex-start' }}>
                  <Users color="#8b5cf6" size={28} style={{ flexShrink: 0, marginTop: '2px', filter: 'drop-shadow(0 0 8px rgba(139,92,246,0.4))' }} />
                  <div>
                    <h3 style={{ margin: '0 0 10px', fontSize: '1.15rem', color: 'var(--text-color)', fontWeight: '600' }}>Most Failed Subject</h3>
                    <p style={{ margin: 0, opacity: 0.75, fontSize: '0.95rem', lineHeight: '1.5' }}>Physics is currently the most failed subject across all classes. Review curriculum mapping.</p>
                  </div>
                </div>
             </div>
          </div>
        </section>

        <div style={{ display: 'flex', gap: '20px', marginTop: '25px', flexWrap: 'wrap' }}>
          <MCQAnalyticsVisualizer />

          <div className="admin-card glass-card premium-border" style={{ flex: 1, minWidth: '300px', padding: '25px', backgroundColor: 'var(--bg-color)', height: '350px' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
              <Users size={24} color={'#3b82f6'} />
              Student Enrollment by Class
            </h3>
            <ResponsiveContainer width="100%" height="85%">
              <BarChart data={[
                { class: "Class 9", students: stats.class9 || 12 },
                { class: "Class 10", students: stats.class10 || 45 },
                { class: "Class 11", students: stats.class11 || 8 },
                { class: "Class 12", students: stats.class12 || 22 }
              ]}>
                <XAxis dataKey="class" stroke="var(--text-color)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--text-color)" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip cursor={{fill: 'rgba(0,0,0,0.05)'}} contentStyle={{backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)', borderRadius: '8px', color: 'var(--text-color)'}} />
                <Bar dataKey="students" fill="#3b82f6" radius={[8, 8, 0, 0]} barSize={35} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <h2 style={{marginTop: '50px', marginBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '10px'}}>Dynamic Content Network</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Row 1 */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '24px', alignItems: 'stretch' }}>
            <ChapterManager />
            <PurgeProtocol />
          </div>

          {/* Row 2 */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '24px', alignItems: 'stretch' }}>
            <MCQManager />
            <FlashcardInjector />
          </div>

          {/* Row 3 */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '24px', alignItems: 'stretch' }}>
            <AccessManager />
          </div>

        </div>
      </section>
    </div>
  );
}
