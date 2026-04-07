import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchFullDashboardData } from '../utils/dashboardCore';
import { updateDailyLogin } from '../utils/gamificationSystem';
import { authService } from '../services/auth';
import { 
  BookOpen, Target, Zap, Search, Flame, Beaker,
  Dna, Calculator, Trophy, Activity
} from 'lucide-react';
import './Dashboard.css';

const TRANSLATIONS = {
  science: { hi: 'विज्ञान', en: 'Science' },
  mathematics: { hi: 'गणित', en: 'Mathematics' },
  physics: { hi: 'भौतिक विज्ञान', en: 'Physics' },
  chemistry: { hi: 'रसायन विज्ञान', en: 'Chemistry' },
  biology: { hi: 'जीव विज्ञान', en: 'Biology' },
  overall: { hi: 'समग्र प्रगति', en: 'Overall Progress' }
};

export default function StudentDashboard() {
  const { user, profile, languagePreference } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const assignedClass = profile?.class || user?.user_metadata?.class_name || 'class10';
  const name = profile?.name || user?.user_metadata?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || "Abhi";
  
  const [activeClass, setActiveClass] = useState(String(assignedClass).replace('class',''));

  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  useEffect(() => {
    async function loadData() {
      if (!user?.id) return;
      
      setLoading(true);
      if (user?.id) {
         // Auto track daily login streak (if they just opened the app)
         await updateDailyLogin(user.id);
         const data = await fetchFullDashboardData(user.id, assignedClass);
         if (data?.success) {
            setDashboardData(data);
         }
      }
      setLoading(false);
    }
    loadData();
  }, [user, assignedClass]);

  const getInitials = (n) => n ? n.substring(0, 1).toUpperCase() : 'A';

  let statsRender = [];
  let subjectsRender = [];
  let activitiesRender = [];
  let leaderboardRender = [];

  if (dashboardData) {
    const s = dashboardData.stats;
    statsRender = [
      { title: 'Chapters Completed', value: s.chaptersCompleted, trend: '↑ This week', trendColor: '#10b981', icon: <BookOpen size={28} color="#000" />, iconBg: '#FFF3CD' },
      { title: 'MCQs Attempted', value: s.mcqsAttempted, trend: `↑ ${s.accuracy}% accuracy`, trendColor: '#10b981', icon: <Target size={28} color="#ef4444" />, iconBg: '#e0f2fe' },
      { title: 'Flashcards Reviewed', value: 0, trend: 'Recent activity', trendColor: '#94a3b8', icon: <Zap size={28} color="#8b5cf6" />, iconBg: '#ede9fe' }, // Mock since it's not fully tracked yet
      { title: 'Day Streak', value: s.streak, trend: 'Personal best!', trendColor: '#10b981', icon: <Flame size={28} color="#f97316" />, iconBg: '#ffedd5' },
    ];

    // Build dynamic subject list
    const predefinedKeys = (activeClass === '11' || activeClass === '12') 
      ? ['physics', 'chemistry', 'biology', 'mathematics'] 
      : ['science', 'mathematics'];
    
    subjectsRender = predefinedKeys.map(k => {
       const progressNode = dashboardData.subjectProgress[k];
       const name = TRANSLATIONS[k] ? (languagePreference === 'hindi' ? TRANSLATIONS[k].hi : TRANSLATIONS[k].en) : k.charAt(0).toUpperCase() + k.slice(1);
       
       let progPct = 0;
       if(progressNode) {
         progPct = Math.min(100, Math.round((progressNode.sumAccuracy / Math.max(progressNode.attempts, 1))));
       }

       let icon = <Beaker size={24} color="#000"/>;
       let iconBg = '#FFF3CD';
       let color = '#f59e0b';
       if(k === 'physics') { icon = <span style={{fontSize: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>🔭</span>; iconBg = '#e0f2fe'; color = '#3b82f6'; }
       if(k === 'biology') { icon = <Dna size={24} color="#000"/>; iconBg = '#d1fae5'; color = '#10b981'; }
       if(k === 'mathematics') { icon = <Calculator size={24} color="#000"/>; iconBg = '#ede9fe'; color = '#8b5cf6'; }
       if(k === 'science') { icon = <Zap size={24} color="#000"/>; iconBg = '#dcfce7'; color = '#22c55e'; }

       return {
         name,
         subtitle: progressNode ? `Completed ${progressNode.chapters.size} Chapters` : 'Start Learning',
         progress: progPct,
         color, icon, iconBg
       };
    });

    activitiesRender = dashboardData.recentActivities.map(act => {
      let icon = <Activity size={16} color="#000"/>;
      let iconBg = '#f1f5f9';
      if(act.type === 'mcq') { icon = <Target size={16} color="#ef4444"/>; iconBg = '#fee2e2'; }
      if(act.type === 'notes') { icon = <BookOpen size={16} color="#000"/>; iconBg = '#FFF3CD'; }
      if(act.type === 'flashcard') { icon = <Zap size={16} color="#8b5cf6"/>; iconBg = '#ede9fe'; }
      if(act.type === 'achievement') { icon = <Trophy size={16} color="#f59e0b"/>; iconBg = '#ffedd5'; }
      
      const timeStr = new Date(act.created_at).toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', month: 'short', day: 'numeric' });
      return { title: act.title, time: timeStr, icon, iconBg };
    });

    leaderboardRender = dashboardData.leaderboard;
  }

  return (
    <>
      {/* HEADER */}
        <header className="d-header">
          <div className="d-header-greetings">
            <h1>Good Morning, <span>{name}</span> 👋</h1>
            <p>You have 3 chapters pending this week. Keep going!</p>
          </div>
          <div className="d-search-bar">
            <Search size={18} color="#9ca3af" className="d-search-icon" style={{ outline: 'none' }} />
            <input type="text" placeholder="Search notes, MCQs, flashcards..." style={{ outline: 'none', boxShadow: 'none' }} />
          </div>
        </header>

        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748B' }}>
             <h3>Aggregating Your Stats...</h3>
          </div>
        ) : (
          <>
          {/* STATS ROW */}
          <section className="d-stats-row fade-in-up">
            {statsRender.map((stat, i) => (
              <div key={i} className="d-stat-card card-lift">
                <div className="d-stat-icon" style={{ backgroundColor: stat.iconBg }}>
                  {stat.icon}
                </div>
                <h2>{stat.value}</h2>
                <p className="d-stat-title">{stat.title}</p>
                <div className="d-stat-trend" style={{ color: stat.trendColor || '#10b981' }}>
                  {stat.trend}
                </div>
              </div>
            ))}
          </section>

          <div className="d-grid-content-wrapper fade-in-up" style={{ animationDelay: '0.1s' }}>
            
            {/* COLUMN 1: SUBJECTS */}
            <div className="d-col d-subjects">
              <div className="d-section-header">
                <h3>Continue Learning</h3>
                <a href="#" className="d-see-all">See all <span style={{fontSize: '14px', marginLeft: '4px'}}>→</span></a>
              </div>
              <div className="d-subjects-list">
                {subjectsRender.map((sub, i) => (
                  <div key={i} className="d-subject-card card-lift" onClick={() => navigate(`/class${activeClass}/subject/${sub.name.toLowerCase()}`)}>
                    <div className="d-subject-card-left">
                      <div className="d-sub-icon" style={{ backgroundColor: sub.iconBg }}>
                        {sub.icon}
                      </div>
                      <div className="d-sub-info">
                        <h4>{sub.name}</h4>
                        <p>{sub.subtitle}</p>
                      </div>
                    </div>
                    <div className="d-subject-card-right">
                      <span className="d-sub-progress">{sub.progress}%</span>
                      <div className="d-progress-bar">
                        <div className="d-progress-fill" style={{ width: `${sub.progress}%`, backgroundColor: sub.color }}></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* COLUMN 2: RECENT ACTIVITY */}
            <div className="d-col d-activity">
              <div className="d-section-header">
                <h3>Recent Activity</h3>
                <a href="#" className="d-see-all">View all <span style={{fontSize: '14px', marginLeft: '4px'}}>→</span></a>
              </div>
              <div className="d-activity-card">
                {activitiesRender.length === 0 ? (
                  <div style={{ padding: '40px 0', textAlign: 'center', color: '#9CA3AF', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>No recent activities.</div>
                ) : (
                  activitiesRender.map((act, i) => (
                    <div key={i} className="d-activity-item smooth-hover">
                      <div className="d-act-icon" style={{ backgroundColor: act.iconBg, borderRadius: '8px', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {act.icon}
                      </div>
                      <div className="d-act-info">
                        <h4>{act.title}</h4>
                        <p>{act.time}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* COLUMN 3: LEADERBOARD */}
            <div className="d-col d-leaderboard">
              <div className="d-section-header d-leader-header">
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Trophy size={18} color="#f59e0b" style={{ marginTop: '-2px' }}/> Weekly Rank
                </h3>
              </div>
              <div className="d-leaderboard-card">
                <div className="d-leaderboard-header">
                  <h4>Leaderboard</h4>
                  <p>Top students this week</p>
                </div>
                <div className="d-leaderboard-list">
                  {leaderboardRender.length === 0 ? (
                    <div style={{ textAlign: 'center', color: '#6B7280', marginTop: '40px', fontSize: '13px' }}>Loading network...</div>
                  ) : (
                    leaderboardRender.map((row, i) => (
                      <div key={i} className={`d-lb-row card-lift ${row.isCurrent ? 'd-lb-current' : ''}`} style={i > 2 && i === leaderboardRender.length - 1 && !row.isCurrent ? {marginTop: '10px'} : {}}>
                        <div className="d-lb-left">
                          <span className="d-lb-rank">{row.rank}</span>
                          <div className="d-lb-avatar" style={{ backgroundColor: row.color, opacity: row.isCurrent ? 1 : 0.8 }}>{row.initial}</div>
                          <span className="d-lb-name">{row.name}</span>
                        </div>
                        <span className={`d-lb-points ${row.isCurrent ? 'd-current-points' : ''}`}>{row.points}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

          </div>
          </>
        )}
    </>
  );
}
