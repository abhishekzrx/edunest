import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchContentAccessForChapter, fetchDynamicMCQs, fetchDynamicFlashcards } from '../utils/supabaseHelpers';
import FlashcardViewer from '../components/FlashcardViewer';
import { ArrowLeft, ArrowRight, BookOpen, Clock, Activity, Lock, Target, FileText, Zap } from 'lucide-react';
import { authService } from '../services/auth';
import './UnifiedStudy.css';

export default function UnifiedStudy() {
  const { classId, subjectId, chapterId, mode } = useParams();
  const navigate = useNavigate();
  const { user, languagePreference } = useAuth();
  
  const [access, setAccess] = useState(null);
  const [data, setData] = useState({ mcqs: [], notes: null, flashcards: [], chapterTitle: 'Loading...' });
  const [loading, setLoading] = useState(true);
  
  // NEW Test Config State
  const [testConfig, setTestConfig] = useState(null); 
  const [testModeSelection, setTestModeSelection] = useState('free');
  const [isTestSubmitted, setIsTestSubmitted] = useState(false);
  const [isReviewMode, setIsReviewMode] = useState(false);
  const [reviewIndex, setReviewIndex] = useState(0);

  // MCQ State Navigation
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [answeredMap, setAnsweredMap] = useState({});
  const [visitedMap, setVisitedMap] = useState({});
  const [score, setScore] = useState(0);
  const [timer, setTimer] = useState(0);

  useEffect(() => {
     if (mode === 'mcq' && testConfig && !isTestSubmitted) {
        setVisitedMap(prev => ({ ...prev, [currentIndex]: true }));
     }
  }, [currentIndex, mode, testConfig, isTestSubmitted]);

  useEffect(() => {
    let interval;
    if (mode === 'mcq' && testConfig && testConfig.mode === 'timer' && !loading && !isTestSubmitted) {
      interval = setInterval(() => {
        setTimer(p => {
           if (p === 1) setIsTestSubmitted(true);
           return p > 0 ? p - 1 : 0;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [mode, loading, testConfig, isTestSubmitted]);

  useEffect(() => {
    async function init() {
      setLoading(true);
      
      // 1. Check Access
      const accessRes = await fetchContentAccessForChapter(chapterId);
      if (accessRes.success) {
         setAccess(accessRes.data);
      } else {
         setAccess({ show_notes: false, show_mcqs: false, show_flashcards: false });
      }

      // Format title
      const titleStr = chapterId.replace(/-/g, ' ');

      let packageData = { mcqs: [], notes: null, flashcards: [], chapterTitle: titleStr };

      // 2. Conditional Fetching based on MODE (Optimized)
      try {
        if (mode === 'mcq') {
          const res = await fetchDynamicMCQs(chapterId);
          if (res.success) packageData.mcqs = res.data;
        } 
        else if (mode === 'notes') {
          const mod = await import(`../data/${classId}/${subjectId}/${chapterId}.json`);
          packageData.notes = mod.default || mod;
          packageData.chapterTitle = packageData.notes.title || titleStr;
        }
        else if (mode === 'flashcard') {
          const res = await fetchDynamicFlashcards(chapterId);
          if (res.success) packageData.flashcards = res.data;
        }
      } catch (err) {
        console.warn('Dataset load failed:', err);
      }

      setData(packageData);
      setLoading(false);
    }
    init();
  }, [classId, subjectId, chapterId, mode]);

  const renderTransl = (enText, hiText, fallback) => {
    const finalEn = enText || fallback;
    const finalHi = hiText || fallback;
    if (languagePreference === 'english') return finalEn;
    if (languagePreference === 'hindi') return finalHi;
    if (finalEn === finalHi) return finalEn;
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <div>{finalEn}</div>
        <div style={{ color: '#f59e0b', fontSize: '0.9em', fontWeight: 500 }}>{finalHi}</div>
      </div>
    );
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const isAccessGranted = () => {
    if (!access) return false;
    if (mode === 'notes') return access.show_notes;
    if (mode === 'mcq') return access.show_mcqs;
    if (mode === 'flashcard') return access.show_flashcards;
    return false;
  };

  const handleSelectOption = (qIdx, optIdx) => {
    if (isTestSubmitted) return;
    setSelectedAnswers(p => ({ ...p, [qIdx]: optIdx }));
  };

  const handleSubmitTest = () => {
    let finalScore = 0;
    const finalAnsweredMap = {};
    const testList = testConfig ? testConfig.slicedData : [];
    
    testList.forEach((q, idx) => {
      const userAns = selectedAnswers[idx];
      if (userAns !== undefined) {
        finalAnsweredMap[idx] = true;
        
        let correctIdx = q.answer !== undefined ? q.answer : q.correct_answer;
        if (typeof correctIdx === 'string' && /^[a-zA-Z]$/.test(correctIdx.trim())) {
          correctIdx = correctIdx.trim().toUpperCase().charCodeAt(0) - 65;
        } else if (typeof correctIdx === 'string') {
          correctIdx = parseInt(correctIdx, 10);
        }

        if (correctIdx === userAns) {
          finalScore += 1;
        }
      }
    });

    setScore(finalScore);
    setAnsweredMap(finalAnsweredMap);
    setIsTestSubmitted(true);
  };

  const getSetOptions = () => {
    const total = data.mcqs || [];
    return [
      { id: 'set1', name: 'Set 1', desc: 'Questions 1-20', data: total.slice(0, 20) },
      { id: 'set2', name: 'Set 2', desc: 'Questions 21-40', data: total.slice(20, 40) },
      { id: 'set3', name: 'Set 3', desc: 'Questions 41-60', data: total.slice(40, 60) },
      { id: 'set4', name: 'Set 4', desc: 'Questions 61-80', data: total.slice(60, 80) },
      { id: 'set5', name: 'Set 5', desc: 'Questions 81-100', data: total.slice(80, 100) },
      { id: 'omega', name: 'Titan Challenge', desc: 'Advanced Level — 50 Qs', data: total.slice(100, 150), isSpecial: true }
    ];
  };

  const startSet = (setObj) => {
    if (setObj.data.length === 0) return; // Prevent starting empty sets
    setTestConfig({ id: setObj.id, name: setObj.name, mode: testModeSelection, slicedData: setObj.data });
    setCurrentIndex(0);
    setSelectedAnswers({});
    setAnsweredMap({});
    setVisitedMap({ 0: true });
    setScore(0);
    setIsTestSubmitted(false);
    if (testModeSelection === 'timer') {
      setTimer(setObj.data.length * 60); // 1 minute per question
    } else {
      setTimer(0);
    }
  };

  const activeMCQs = testConfig ? testConfig.slicedData : [];

  const handleLogout = async () => {
    try {
      await authService.logout();
      navigate('/login');
    } catch(e) {}
  };

  if (loading) {
    return <div className="unified-study-layout" style={{justifyContent: 'center', alignItems: 'center'}}>Initializing System...</div>;
  }

  if (!isAccessGranted()) {
    return (
      <div className="unified-study-layout" style={{justifyContent: 'center', alignItems: 'center', flexDirection: 'column'}}>
        <Lock size={48} color="#ef4444" style={{marginBottom: '20px'}}/>
        <h2>Content Locked</h2>
        <p>The administrator has restricted access to this {mode} module.</p>
        <button className="btn-nav-us secondary" style={{marginTop: '20px'}} onClick={() => navigate(-1)}>Go Back</button>
      </div>
    );
  }

  // Derived Properties
  const totalMCQs = activeMCQs.length;
  const currentQ = activeMCQs[currentIndex];
  const progressPct = mode === 'mcq' && totalMCQs > 0
    ? ((currentIndex + 1) / totalMCQs) * 100
    : 100;

  // Render Set Selection Screen if MCQ mode but no active set
  if (mode === 'mcq' && !testConfig) {
    const sets = getSetOptions();
    
    // UI Mock Stats (matching design)
    const stats = [
      { id: 'attempted', icon: '🎯', label: 'Questions Attempted', value: '342', color: '#f59e0b', bg: '#FEF3DC' },
      { id: 'accuracy', icon: '✅', label: 'Accuracy Rate', value: '78%', color: '#22c55e', bg: '#DCFCE7' },
      { id: 'completed', icon: '📋', label: 'Sets Completed', value: '3/6', color: '#8b5cf6', bg: '#F3E8FF' },
      { id: 'streak', icon: '🔥', label: 'Day Streak', value: '14', color: '#ef4444', bg: '#FEE2E2' },
    ];

    return (
      <div className="unified-study-layout" style={{ width: '100%', position: 'relative' }}>
        <button className="btn-nav-us secondary" onClick={() => navigate(-1)} style={{ position: 'absolute', top: '0px', left: '0px', zIndex: 10, padding: '8px 16px', fontSize: '12px' }}>
             <ArrowLeft size={16} /> Back
        </button>
        <div style={{ maxWidth: '100%', margin: '0', padding: '20px 40px', width: '100%' }}>
          
          <header style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div className="us-hero-badge">
              <Zap size={14} color="#f59e0b" fill="#f59e0b" /> MCQ Practice
            </div>
            <h1 className="us-hero-title">Choose Your <span className="us-hero-highlight">Challenge</span></h1>
            <p className="us-hero-subtitle">Select an MCQ set to test your knowledge. Pick a mode and go!</p>
            
            {/* Mode Toggle */}
            <div className="us-premium-toggle">
              <button 
                className={`us-pt-btn ${testModeSelection === 'free' ? 'active' : ''}`} 
                onClick={() => setTestModeSelection('free')}
              >
                🧠 Practice Mode
              </button>
              <button 
                className={`us-pt-btn ${testModeSelection === 'timer' ? 'active' : ''}`} 
                onClick={() => setTestModeSelection('timer')}
              >
                ⏱️ Timer Mode
              </button>
            </div>
            
            <div style={{ height: '24px', marginTop: '12px' }}>
                <div style={{
                     fontSize: '13px', 
                     color: '#f59e0b', 
                     fontWeight: 600, 
                     opacity: testModeSelection === 'timer' ? 1 : 0,
                     transform: testModeSelection === 'timer' ? 'translateY(0)' : 'translateY(-4px)',
                     transition: 'all 0.3s ease',
                     pointerEvents: 'none'
                }}>
                     ⏱️ Strict 1-minute per question limit applied!
                </div>
            </div>
          </header>

          <div className="us-stats-row">
            {stats.map(s => (
              <div key={s.id} className="us-stat-card">
                 <div className="us-stat-icon" style={{ background: s.bg }}>{s.icon}</div>
                 <div className="us-stat-info">
                   <div className="us-stat-val">{s.value}</div>
                   <div className="us-stat-lbl">{s.label}</div>
                 </div>
              </div>
            ))}
          </div>

          <div className="us-premium-grid">
            {sets.map((s, idx) => {
              const isEmpty = s.data.length === 0;
              // Mock progress (as per the design reference)
              let prog = 0;
              let isDone = false;
              if (idx === 0) { prog = 20; isDone = true; }
              else if (idx === 1) { prog = 14; }
              const total = 20;
              
              if (s.isSpecial) {
                return (
                  <div key={s.id} className={`us-pc-card dark ${isEmpty ? 'locked-titan' : ''}`} onClick={() => !isEmpty && startSet(s)}>
                     <div className="us-pc-top">
                        <div className="us-pc-icon-wrap">
                          <div className="us-pc-icon dark-icon" style={{ fontSize: '24px' }}>⚡</div>
                          <div className="us-pc-badge dark-badge">T</div>
                        </div>
                        <div className="us-pc-status dark-status">
                          {isEmpty ? '🔒 Locked' : '👑 Titan'}
                        </div>
                     </div>
                     <div className="us-pc-mid">
                        <h3>Titan Challenge</h3>
                        <p>{isEmpty ? 'No Questions Available' : s.desc}</p>
                     </div>
                  </div>
                );
              }

              // Color accents per design
              const accents = [
                 { hex: '#f59e0b', bg: '#fef3c7', light: '#fef3c7' }, // yellow (set 1)
                 { hex: '#2dd4bf', bg: '#ccfbf1', light: '#ccfbf1' }, // teal (set 2)
                 { hex: '#a855f7', bg: '#f3e8ff', light: '#f3e8ff' }, // purple (set 3)
                 { hex: '#94a3b8', bg: '#f1f5f9', light: '#f1f5f9' }, // gray (set 4)
                 { hex: '#94a3b8', bg: '#f1f5f9', light: '#f1f5f9' }  // gray (set 5)
              ];
              const accent = accents[idx] || accents[0];

              return (
                <div key={s.id} className={`us-pc-card ${isEmpty ? 'locked' : ''}`} onClick={() => !isEmpty && startSet(s)}>
                   <div className="us-pc-top">
                      <div className="us-pc-icon-wrap" style={{ background: accent.light }}>
                        <FileText size={28} color="#1e293b" style={{ strokeWidth: 1.5 }} />
                        <div className="us-pc-badge" style={{ background: '#1e293b' }}>{idx + 1}</div>
                      </div>
                      <div className={`us-pc-status ${isEmpty ? 'locked' : 'avail'}`}>
                        {isEmpty ? '🔒 Locked' : '✦ Available'}
                      </div>
                   </div>
                   <div className="us-pc-mid">
                      <h3>{s.name}</h3>
                      <p>{isEmpty ? 'No Questions Available' : s.desc}</p>
                   </div>
                   {!isEmpty && (
                     <div className="us-pc-progress">
                       <div className="us-pc-prog-labels">
                         <span>Progress</span>
                         <span><strong>{prog}/{total}</strong>{isDone ? ' ✓' : ''}</span>
                       </div>
                       <div className="us-pc-prog-bar">
                         <div className="us-pc-prog-fill" style={{ width: `${(prog/total)*100}%`, background: accent.hex }}></div>
                       </div>
                     </div>
                   )}
                   <div className="us-pc-bot">
                     <div className="us-pc-qcount">
                       <FileText size={14} color="#64748b" /> {total} Questions
                     </div>
                     <div className="us-pc-arrow" style={{ background: accent.light, color: accent.hex }}>
                       <ArrowRight size={14} />
                     </div>
                   </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="unified-study-layout" style={{ display: 'flex', width: '100%', minHeight: '100vh' }}>
      <main className="us-main" style={{ display: 'flex', flexDirection: 'row', gap: '24px', marginLeft: '0', flex: 1, padding: '24px' }}>
        
        {/* INNER LEFT PANE: MCQ Question Grid & Timer */}
        {mode === 'mcq' && testConfig && !isReviewMode && (
          <div className="us-left-pane" style={{ 
              width: '280px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '20px',
              background: 'var(--us-card-bg)', borderRadius: '24px', padding: '24px', border: '1px solid var(--us-border)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
          }}>
             <button className="btn-nav-us secondary" onClick={() => setTestConfig(null)} style={{ padding: '10px 16px', fontSize: '13px', width: 'fit-content' }}>
                <ArrowLeft size={16} /> Back to Sets
             </button>
             
             <div className="ns-classes-label" style={{padding: '12px 4px 0', fontSize: '11px', fontWeight: 800, color: 'var(--us-text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em'}}>
               {testConfig.name} Map
             </div>
             <div className="us-q-grid" style={{ padding: '0', background: 'transparent', border: 'none' }}>
               {Array.from({ length: totalMCQs }, (_, i) => {
                 let cls = "us-q-btn ";
                 const hasAnswer = selectedAnswers[i] !== undefined;
                 const isVisited = visitedMap[i];
                 
                 if (hasAnswer) cls += "answered-green ";
                 else if (isVisited) cls += "skipped-yellow ";
                 else cls += "unanswered-red ";
                 
                 if (i === currentIndex) cls += "current ";
                 
                 return (
                     <button key={i} className={cls} onClick={() => setCurrentIndex(i)} style={{height: '36px', fontSize: '13px'}}>
                       {i + 1}
                     </button>
                 );
               })}
             </div>
             
             {/* Map Status Legend Guide */}
             <div className="us-map-legend" style={{marginTop: 'auto', padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '16px', border: '1px solid var(--us-border)'}}>
                 <div style={{display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', fontWeight: 700, color: 'var(--us-text-main)', marginBottom: '10px'}}>
                    <div style={{width: '12px', height: '12px', background: '#22c55e', borderRadius: '4px'}}></div> Answered
                 </div>
                 <div style={{display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', fontWeight: 700, color: 'var(--us-text-main)', marginBottom: '10px'}}>
                    <div style={{width: '12px', height: '12px', background: '#eab308', borderRadius: '4px'}}></div> Skipped
                 </div>
                 <div style={{display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', fontWeight: 700, color: 'var(--us-text-main)'}}>
                    <div style={{width: '12px', height: '12px', background: '#ef4444', borderRadius: '4px'}}></div> Unanswered
                 </div>
             </div>
             
             {testConfig.mode === 'timer' && !isTestSubmitted && (
               <div className="us-timer" style={{ marginTop: '16px' }}>
                 <div>
                   <h5 style={{fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--us-text-muted)', margin: '0 0 6px 0'}}>Time Remaining</h5>
                   <p className="time" style={{fontSize: '1.6rem', fontWeight: 800, margin: 0, color: timer <= 120 ? '#ef4444' : 'var(--us-text-main)'}}>
                     {formatTime(timer)}
                   </p>
                 </div>
                 <Clock size={28} color={timer <= 120 ? '#ef4444' : 'var(--us-text-muted)'} opacity={0.5} />
               </div>
             )}
          </div>
        )}

        {/* CORE CONTENT PANE */}
        <div className="us-core-pane" style={{ flex: 1, display: 'flex', flexDirection: 'column', maxWidth: '800px', margin: '0 auto' }}>
          {/* HEADER */}
          <header className="us-header" style={{ marginBottom: '24px' }}>
           <div className="us-progress-bar-wrapper">
              <div className="us-progress-text">
                {mode === 'mcq' ? <>{currentIndex + 1} <span>/ {totalMCQs}</span></> : <span style={{color: 'var(--d-text-main)', textTransform: 'capitalize'}}>{mode} View</span>}
              </div>
              <div className="us-progress-track">
                <div className="us-progress-fill" style={{ width: `${progressPct}%` }}></div>
              </div>
           </div>
           
           <div className="us-header-tools">
             <button className="us-tool-btn"><BookOpen size={18} /></button>
             <button className="us-tool-btn"><Target size={18} /></button>
           </div>
         </header>

         {/* DYNAMIC SCROLL CONTENT */}
         <div className="us-content">
            {/* --- MCQ MODE UI --- */}
            {mode === 'mcq' && currentQ && !isTestSubmitted && (
              <div className="us-mcq-container" key={`q-${currentIndex}`} style={{
                 background: 'var(--us-card-bg)', 
                 borderRadius: '24px', 
                 padding: '48px', 
                 border: '1px solid var(--us-border)',
                 boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
                 minHeight: '400px',
                 display: 'flex',
                 flexDirection: 'column'
              }}>
                <div className="us-pill" style={{
                   display: 'inline-flex', padding: '6px 14px', borderRadius: '100px',
                   background: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', marginBottom: '32px',
                   fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em',
                   alignSelf: 'flex-start', border: '1px solid rgba(56, 189, 248, 0.2)'
                }}>
                  {subjectId.toUpperCase()} • QUESTION {currentIndex + 1}
                </div>
                
                <h2 className="us-question-text" style={{ fontSize: '26px', lineHeight: 1.5, color: 'var(--us-text-main)', marginBottom: '40px', fontWeight: 700 }}>
                  {renderTransl(currentQ.question_en, currentQ.question_hi, currentQ.question)}
                </h2>

                <div className="us-options-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                  {(currentQ.options_en || currentQ.options || []).map((opt, oIdx) => {
                     let cls = "us-opt-btn ";
                     const isSelected = selectedAnswers[currentIndex] === oIdx;
                     
                     if (isSelected) {
                       cls += "selected ";
                     }

                     return (
                       <button 
                         key={oIdx} 
                         className={cls}
                         onClick={() => handleSelectOption(currentIndex, oIdx)}
                       >
                         <div className="us-opt-letter">{String.fromCharCode(65 + oIdx)}</div>
                         <div style={{ flex: 1, paddingRight: '12px' }}>
                            {renderTransl(currentQ.options_en?.[oIdx] || opt, currentQ.options_hi?.[oIdx], opt)}
                         </div>
                       </button>
                     );
                  })}
                </div>
                
                {/* Navigation and Submit Actions Footer */}
                <div style={{ marginTop: 'auto', paddingTop: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                     <button className="btn-nav-us secondary" onClick={() => setCurrentIndex(p => Math.max(0, p-1))} disabled={currentIndex===0} style={{visibility: currentIndex===0?'hidden':'visible', padding: '12px 24px'}}>
                        <ArrowLeft size={18}/> Previous
                     </button>
                     
                     <button className="us-submit-test-btn" onClick={handleSubmitTest}>
                       Save & Submit {testConfig.name}
                     </button>
                     
                     <button className="btn-nav-us secondary" onClick={() => setCurrentIndex(p => Math.min(totalMCQs-1, p+1))} disabled={currentIndex===totalMCQs-1} style={{visibility: currentIndex===totalMCQs-1?'hidden':'visible', padding: '12px 24px'}}>
                        Next <ArrowRight size={18}/>
                     </button>
                </div>
              </div>
            )}
            
            {/* SUBMITTED TEST SCORECARD */}
            {mode === 'mcq' && isTestSubmitted && !isReviewMode && (
               <div className="us-scorecard-container fade-in-up">
                  <div className="us-sc-icon">🏆</div>
                  <h1>Test Completed!</h1>
                  <p>You have successfully submitted {testConfig.name}.</p>
                  <div className="us-sc-metrics">
                    <div className="us-scm">
                      <span className="num">{score}</span>
                      <span className="lbl">Correct</span>
                    </div>
                    <div className="us-scm">
                      <span className="num">{Object.keys(answeredMap).length - score}</span>
                      <span className="lbl">Incorrect</span>
                    </div>
                    <div className="us-scm highlight">
                      <span className="num">{totalMCQs > 0 ? Math.round((score / totalMCQs) * 100) : 0}%</span>
                      <span className="lbl">Accuracy</span>
                    </div>
                  </div>
                  <div style={{ marginTop: '40px', display: 'flex', gap: '16px', justifyContent: 'center' }}>
                     <button className="btn-nav-us secondary" onClick={() => navigate('/dashboard')} style={{ padding: '16px 32px' }}>Back to Dashboard</button>
                     <button className="us-submit-test-btn" onClick={() => { setIsReviewMode(true); setReviewIndex(0); }}>Review Answers</button>
                  </div>
               </div>
             )}

             {/* REVIEW MODE UI */}
             {mode === 'mcq' && isTestSubmitted && isReviewMode && (
               <div style={{ display: 'flex', gap: '24px', width: '100%', minHeight: '600px', flex: 1 }}>
                 {/* LEFT PANE: Question List */}
                 <div className="us-rv-sidebar">
                    <div className="us-rv-header">
                      <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 800, color: 'var(--us-text-main)' }}>QUESTIONS ({totalMCQs})</h3>
                    </div>
                    <div className="us-rv-list">
                      {activeMCQs.map((q, idx) => {
                         const userAnsIdx = selectedAnswers[idx];
                         const isAnswered = answeredMap[idx];
                         let status = 'unanswered';
                         if (isAnswered) {
                            if (q.answer === userAnsIdx || q.correct_answer === userAnsIdx) status = 'correct';
                            else status = 'incorrect';
                         }
                         
                         return (
                           <button 
                             key={idx} 
                             className={`us-rv-list-item ${reviewIndex === idx ? 'active' : ''}`}
                             onClick={() => setReviewIndex(idx)}
                           >
                             <div className="us-rvi-left">
                               <span className="us-rvi-num">{idx + 1}</span>
                               <span className="us-rvi-text">{(q.question_en || q.question).substring(0, 32)}...</span>
                             </div>
                             <div className={`us-rvi-badge ${status}`}>
                                {status === 'correct' ? '✅ Correct' : status === 'incorrect' ? '❌ Incorrect' : '⚪ Skipped'}
                             </div>
                           </button>
                         );
                      })}
                    </div>
                 </div>

                 {/* RIGHT PANE: Detailed View */}
                 {activeMCQs[reviewIndex] && (() => {
                     const revQ = activeMCQs[reviewIndex];
                     const userAnsIdx = selectedAnswers[reviewIndex];
                     const isAnswered = answeredMap[reviewIndex];
                     
                     let correctIdx = revQ.answer !== undefined ? revQ.answer : revQ.correct_answer;
                     if (typeof correctIdx === 'string' && /^[a-zA-Z]$/.test(correctIdx.trim())) {
                        correctIdx = correctIdx.trim().toUpperCase().charCodeAt(0) - 65;
                     } else if (typeof correctIdx === 'string') {
                        correctIdx = parseInt(correctIdx, 10);
                     }
                     
                     return (
                       <div className="us-mcq-container" style={{
                          background: 'var(--us-card-bg)', borderRadius: '24px', padding: '48px', 
                          border: '1px solid var(--us-border)', boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
                          display: 'flex', flexDirection: 'column', flex: 1
                       }}>
                         <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px'}}>
                             <div className="us-pill" style={{
                                display: 'inline-flex', padding: '6px 14px', borderRadius: '100px',
                                background: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8',
                                fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em',
                                border: '1px solid rgba(56, 189, 248, 0.2)'
                             }}>
                               {subjectId.toUpperCase()} • QUESTION {reviewIndex + 1}
                             </div>
                             
                             <div style={{
                                fontSize: '12px', fontWeight: 800, padding: '6px 14px', borderRadius: '100px', border: '1px solid',
                                background: isAnswered ? (userAnsIdx === correctIdx ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)') : 'rgba(148, 163, 184, 0.1)',
                                color: isAnswered ? (userAnsIdx === correctIdx ? '#22c55e' : '#ef4444') : '#94a3b8',
                                borderColor: isAnswered ? (userAnsIdx === correctIdx ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)') : 'rgba(148, 163, 184, 0.3)'
                             }}>
                                {isAnswered ? (userAnsIdx === correctIdx ? '✅ Correct' : '❌ Incorrect') : '⚪ Skipped'}
                             </div>
                         </div>
                         
                         <h2 className="us-question-text" style={{ fontSize: '26px', lineHeight: 1.5, color: 'var(--us-text-main)', marginBottom: '40px', fontWeight: 700 }}>
                           {renderTransl(revQ.question_en, revQ.question_hi, revQ.question)}
                         </h2>

                         <div className="us-options-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                           {(revQ.options_en || revQ.options || []).map((opt, oIdx) => {
                              let cls = "us-opt-btn review-mode ";
                              const isSelected = userAnsIdx === oIdx;
                              const isCorrect = correctIdx === oIdx;
                              
                              if (isCorrect) {
                                  cls += "correct-ans ";
                              } else if (isSelected && !isCorrect) {
                                  cls += "wrong-ans ";
                              }

                              return (
                                <div key={oIdx} className={cls}>
                                  <div className="us-opt-letter" style={{
                                      background: cls.includes('correct-ans') ? '#22c55e' : (cls.includes('wrong-ans') ? '#ef4444' : 'var(--us-card-bg)'),
                                      color: (cls.includes('correct-ans') || cls.includes('wrong-ans')) ? '#fff' : 'var(--us-text-muted)'
                                  }}>
                                      {String.fromCharCode(65 + oIdx)}
                                  </div>
                                  <div style={{ flex: 1, paddingRight: '12px' }}>
                                     {renderTransl(revQ.options_en?.[oIdx] || opt, revQ.options_hi?.[oIdx], opt)}
                                  </div>
                                  {isCorrect && <div style={{background: '#22c55e', color: '#fff', borderRadius: '100px', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', flexShrink: 0}}>✓</div>}
                                  {(isSelected && !isCorrect) && <div style={{background: '#ef4444', color: '#fff', borderRadius: '100px', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', flexShrink: 0}}>✖</div>}
                                </div>
                              );
                           })}
                         </div>
                         
                         {/* Navigation and Actions */}
                         <div style={{ marginTop: 'auto', paddingTop: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <button className="btn-nav-us secondary" onClick={() => setReviewIndex(p => Math.max(0, p-1))} disabled={reviewIndex===0} style={{visibility: reviewIndex===0?'hidden':'visible', padding: '12px 24px'}}>
                                 <ArrowLeft size={18}/> Previous
                              </button>
                              
                              <div style={{display: 'flex', gap: '16px'}}>
                                  <button className="btn-nav-us secondary" onClick={() => setIsReviewMode(false)} style={{padding: '12px 24px'}}>Back to Scorecard</button>
                                  <button className="btn-nav-us" onClick={() => navigate('/dashboard')} style={{padding: '12px 24px', background: 'var(--us-text-main)', color: 'var(--us-bg)'}}>Dashboard <ArrowRight size={18} style={{marginLeft: '8px'}}/></button>
                              </div>
                              
                              <button className="btn-nav-us secondary" onClick={() => setReviewIndex(p => Math.min(totalMCQs-1, p+1))} disabled={reviewIndex===totalMCQs-1} style={{visibility: reviewIndex===totalMCQs-1?'hidden':'visible', padding: '12px 24px'}}>
                                 Next <ArrowRight size={18}/>
                              </button>
                         </div>
                       </div>
                     );
                 })()}
               </div>
             )}
            
            {/* --- NOTES MODE UI --- */}
            {mode === 'notes' && data.notes && (
              <div className="us-notes-container fade-in-up">
                 <h2>Theory Repository</h2>
                 <p>{data.notes.theory || "No textual theory found for this module."}</p>
                 
                 {data.notes.key_points && data.notes.key_points.length > 0 && (
                   <>
                     <h2>Critical Checkpoints</h2>
                     <ul style={{paddingLeft: '20px'}}>
                       {data.notes.key_points.map((pt, i) => (
                         <li key={i} style={{marginBottom: '10px'}}>{pt}</li>
                       ))}
                     </ul>
                   </>
                 )}
              </div>
            )}

            {/* --- FLASHCARD MODE UI --- */}
            {mode === 'flashcard' && (
              <div className="fade-in-up" style={{display: 'flex', justifyContent: 'center'}}>
                {data.flashcards.length > 0 ? (
                  <FlashcardViewer flashcards={data.flashcards} />
                ) : (
                  <p>No flashcards mapped natively to this sector.</p>
                )}
              </div>
            )}
         </div>

         {/* 3. BOTTOM NAVIGATION AREA */}
         {!isTestSubmitted && (
          <footer className="us-bottom-nav">
            <button 
              className="btn-nav-us secondary" 
              onClick={() => {
                if (mode === 'mcq') setCurrentIndex(p => Math.max(0, p - 1));
                else navigate(-1);
              }}
              disabled={mode === 'mcq' && currentIndex === 0}
            >
              <ArrowLeft size={18} /> {mode === 'mcq' ? 'Previous' : 'Back'}
            </button>
            
            <button className="btn-nav-us" style={{background: 'transparent', color: '#94a3b8'}}>
              {mode === 'mcq' ? '' : ''}
            </button>
            
            {mode === 'mcq' && (
              <button 
                className="btn-nav-us primary"
                onClick={() => {
                  if (currentIndex < totalMCQs - 1) setCurrentIndex(p => p + 1);
                }}
                disabled={currentIndex === totalMCQs - 1}
              >
                Next Question <ArrowRight size={18} />
              </button>
            )}
          </footer>
         )}
        </div>
      </main>
    </div>
  );
}
