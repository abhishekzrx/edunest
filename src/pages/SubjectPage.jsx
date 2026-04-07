import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BookOpen, Search, Beaker, CheckCircle, ChevronDown, Check, ChevronUp, FileText, Zap, Target } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { fetchAllChapters } from '../utils/supabaseHelpers';
import './SubjectPage.css';

export default function SubjectPage() {
  const { classId, subjectId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedSection, setExpandedSection] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    // Scroll to top
    window.scrollTo(0, 0);

    fetchAllChapters(classId, subjectId).then(res => {
      if (res.success) {
        // Map dynamic chapters, fake some states if not present
        const mapped = res.data.map((c, i) => {
           // Provide basic mocked progress tracking for demonstration
           let status = 'notstarted';
           if (i === 0) status = 'done';
           else if (i === 1) status = 'inprogress';
           
           return {
             ...c,
             status,
             progress: status === 'done' ? 100 : (status === 'inprogress' ? 60 : 0)
           };
        });
        setChapters(mapped);
      }
      setLoading(false);
    });
  }, [classId, subjectId]);

  const toggleChapter = (id) => {
    setExpandedSection(prev => prev === id ? null : id);
  };

  const filteredChapters = chapters.filter(c => filter === 'all' || c.status === filter);

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#F5F3EE' }}>Loading modules...</div>;
  }

  // Calculate overall progress visually
  const overallProg = chapters.length > 0 ? Math.round(chapters.reduce((acc, c) => acc + c.progress, 0) / chapters.length) : 0;

  return (
    <div className="new-subject-layout" style={{ background: 'transparent' }}>
      {/* ── MAIN CONTENT ── */}
      <main className="ns-main">
        {/* Top bar */}
        <div className="ns-topbar" style={{ marginTop: '0' }}>
          <div className="ns-topbar-left">
             <button className="ns-back-btn" onClick={() => navigate(-1)}>← Back</button>
             <div className="ns-breadcrumb">
               <span>Dashboard</span> › <span>{classId.toUpperCase()}</span> › <strong>⚗️ {subjectId.toUpperCase()}</strong>
             </div>
          </div>
          <div className="ns-search-bar">
             <Search size={16} color="var(--muted2)" style={{ outline: 'none' }} />
             <input type="text" placeholder="Search notes, MCQs, flashcards..." style={{ outline: 'none', boxShadow: 'none' }} />
          </div>
        </div>

        {/* Subject Hero */}
        <div className="ns-subject-hero">
          <div className="ns-sh-left">
            <div className="ns-sh-icon">⚗️</div>
            <div>
              <div className="ns-sh-name">{subjectId.charAt(0).toUpperCase() + subjectId.slice(1)}</div>
              <div className="ns-sh-meta">{classId.toUpperCase()} · CBSE &nbsp;·&nbsp; <strong>{chapters.length} Chapters</strong> &nbsp;·&nbsp; Premium</div>
            </div>
          </div>
          <div className="ns-sh-stats">
            <div className="ns-sh-stat">
              <div className="ns-sh-stat-num">{Math.round((chapters.filter(c => c.status === 'done').length / (chapters.length || 1)) * 100)}<span>%</span></div>
              <div className="ns-sh-stat-label">Chapters Done</div>
            </div>
            <div className="ns-sh-stat">
              <div className="ns-sh-stat-num">--</div>
              <div className="ns-sh-stat-label">MCQs Done</div>
            </div>
          </div>
        </div>

        {/* Overall Progress */}
        <div className="ns-overall-progress">
          <div className="ns-op-label">📈 Overall Progress</div>
          <div className="ns-op-bar">
            <div className="ns-op-fill" style={{width: `${overallProg}%`}}></div>
          </div>
          <div className="ns-op-pct">{overallProg}%</div>
          <div style={{fontSize: '12px', color: 'var(--muted)', paddingLeft: '12px', borderLeft: '1px solid var(--border)'}}>
            🎯 Start reading to unlock your streak!
          </div>
        </div>

        {/* Filter row */}
        <div className="ns-filter-row">
           <div className="ns-filter-tabs">
             <button className={`ns-f-tab ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>All Chapters</button>
             <button className={`ns-f-tab ${filter === 'inprogress' ? 'active' : ''}`} onClick={() => setFilter('inprogress')}>In Progress</button>
             <button className={`ns-f-tab ${filter === 'done' ? 'active' : ''}`} onClick={() => setFilter('done')}>Completed</button>
             <button className={`ns-f-tab ${filter === 'notstarted' ? 'active' : ''}`} onClick={() => setFilter('notstarted')}>Not Started</button>
           </div>
           <div className="ns-chapters-count">Showing <strong>{filteredChapters.length}</strong> modules</div>
        </div>

        {/* Chapters List */}
        <div className="ns-chapters-list">
          {filteredChapters.map((ch, i) => {
             const isExpanded = expandedSection === ch.id;
             return (
              <div key={ch.id} className={`ns-chapter-card ${ch.status === 'done' ? 'done' : ''} ${isExpanded ? 'expanded' : ''}`} style={{ animationDelay: `${0.1 + (i*0.04)}s` }}>
                
                <div className="ns-chapter-main" onClick={() => toggleChapter(ch.id)}>
                   <div className="ns-ch-num-badge">
                     {ch.status === 'done' ? '✓' : ch.chapter_no}
                   </div>
                   
                   <div className="ns-ch-info">
                     <div className="ns-ch-name">Chapter {ch.chapter_no} — {ch.name}</div>
                     <div className="ns-ch-desc">Dynamic Appending Engine • Theory Notes</div>
                     <div className="ns-ch-tags">
                       {ch.status === 'done' && <span className="ns-ch-tag" style={{background: 'var(--green-bg)', color: 'var(--green)'}}>Completed</span>}
                       {ch.status === 'inprogress' && <span className="ns-ch-tag" style={{background: '#FFF4E5', color: 'var(--amber-dark)'}}>In Progress</span>}
                       {ch.status === 'notstarted' && <span className="ns-ch-tag" style={{background: '#F3F4F8', color: 'var(--muted)'}}>Not Started</span>}
                       <span className="ns-ch-tag" style={{background: 'var(--blue-bg)', color: 'var(--blue)'}}>Flashcards Ready</span>
                     </div>
                   </div>

                   <div className="ns-ch-progress-wrap">
                      <div className="ns-ch-prog-bar">
                        <div className="ns-ch-prog-fill" style={{width: `${ch.progress}%`, background: ch.status === 'done' ? 'var(--green)' : 'var(--amber)'}}></div>
                      </div>
                      <div className="ns-ch-pct" style={{color: ch.status === 'done' ? 'var(--green)' : ''}}>{ch.progress}%</div>
                   </div>

                   <div className="ns-ch-expand">{isExpanded ? '▴' : '▾'}</div>
                </div>

                {isExpanded && (
                  <div className="ns-chapter-actions">
                    <div className="ns-actions-label">Study Options</div>
                    <div className="ns-actions-grid">
                       {/* Notes Node */}
                       <div className="ns-action-tile ns-notes-tile" onClick={() => navigate(`/study/${classId}/${subjectId}/${ch.id}/notes`)}>
                         <div className="ns-at-icon-wrap">📄</div>
                         <div className="ns-at-title">Notes</div>
                         <div className="ns-at-sub">Full chapter notes with key concepts</div>
                         <div className="ns-at-cta"><span className="ns-at-cta-text">Read Notes</span><span className="ns-at-cta-arrow">→</span></div>
                       </div>
                       
                       {/* Flashcards Node */}
                       <div className="ns-action-tile ns-flash-tile" onClick={() => navigate(`/study/${classId}/${subjectId}/${ch.id}/flashcard`)}>
                         <div className="ns-at-icon-wrap">⚡</div>
                         <div className="ns-at-title">Flashcards</div>
                         <div className="ns-at-sub">Spaced memory review</div>
                         <div className="ns-at-cta"><span className="ns-at-cta-text">Review Cards</span><span className="ns-at-cta-arrow">→</span></div>
                       </div>
                       
                       {/* MCQ Node */}
                       <div className="ns-action-tile ns-mcq-tile" onClick={() => navigate(`/study/${classId}/${subjectId}/${ch.id}/mcq`)}>
                         <div className="ns-at-icon-wrap">🎯</div>
                         <div className="ns-at-title">MCQ Practice</div>
                         <div className="ns-at-sub">Dynamic timed mode</div>
                         <div className="ns-at-cta"><span className="ns-at-cta-text">Start Quiz</span><span className="ns-at-cta-arrow">→</span></div>
                       </div>
                    </div>
                  </div>
                )}
              </div>
             )
          })}
        </div>
      </main>
    </div>
  );
}
