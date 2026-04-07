import React, { useState, useEffect } from 'react';
import { fetchAllChapters, fetchContentAccessForChapter, saveContentAccess } from '../../utils/supabaseHelpers';
import { Lock, Eye, EyeOff, Save, ShieldCheck } from 'lucide-react';

export default function AccessManager() {
  const [chapters, setChapters] = useState([]);
  const [selectedChapter, setSelectedChapter] = useState('');
  const [className, setClassName] = useState('class10');
  const [subject, setSubject] = useState('science');
  
  const [accessConfig, setAccessConfig] = useState({
    show_notes: true,
    show_mcqs: true,
    show_flashcards: true
  });
  
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadChapters();
  }, [className, subject]);

  useEffect(() => {
    if (selectedChapter) {
      loadAccessConfig(selectedChapter);
    } else {
      setAccessConfig({ show_notes: true, show_mcqs: true, show_flashcards: true });
    }
  }, [selectedChapter]);

  const loadChapters = async () => {
    const res = await fetchAllChapters(className, subject);
    if (res.success) {
      setChapters(res.data);
      if (res.data.length > 0) {
        setSelectedChapter(res.data[0].id);
      } else {
        setSelectedChapter('');
      }
    }
  };

  const loadAccessConfig = async (chapterId) => {
    setLoading(true);
    const res = await fetchContentAccessForChapter(chapterId);
    if (res.success) {
      setAccessConfig(res.data);
    }
    setLoading(false);
  };

  const handleToggle = (key) => {
    setAccessConfig(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async () => {
    if (!selectedChapter) return setStatus({ type: 'error', msg: 'Select a chapter first' });
    setStatus(null);
    setLoading(true);
    const res = await saveContentAccess(selectedChapter, accessConfig);
    if (res.success) {
      setStatus({ type: 'success', msg: 'Access protocols updated successfully' });
    } else {
      setStatus({ type: 'error', msg: res.error });
    }
    setLoading(false);
    setTimeout(() => setStatus(null), 3000);
  };

  return (
    <div className="admin-card glass-card premium-border hover-glow" style={{ padding: '24px', backgroundColor: 'var(--bg-color)', flex: 1, minWidth: '320px', display: 'flex', flexDirection: 'column' }}>
      <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#8b5cf6', marginBottom: '20px', margin: 0 }}>
        <ShieldCheck size={24} /> Content Access Control
      </h3>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
        <select value={className} onChange={(e) => setClassName(e.target.value)} style={{ flex: 1, padding: '10px', borderRadius: '8px', background: 'var(--bg-color)', border: '1px solid var(--border-color)', color: 'var(--text-color)' }}>
          <option value="class9">Class 9</option>
          <option value="class10">Class 10</option>
          <option value="class11">Class 11</option>
          <option value="class12">Class 12</option>
        </select>
        <select value={subject} onChange={(e) => setSubject(e.target.value)} style={{ flex: 1, padding: '10px', borderRadius: '8px', background: 'var(--bg-color)', border: '1px solid var(--border-color)', color: 'var(--text-color)' }}>
          <option value="science">Science</option>
          <option value="maths">Mathematics</option>
        </select>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <select 
          value={selectedChapter} 
          onChange={(e) => setSelectedChapter(e.target.value)}
          style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'var(--bg-color)', border: '1px solid var(--border-color)', color: 'var(--text-color)' }}
        >
          {chapters.length === 0 ? <option value="">No chapters available</option> : null}
          {chapters.map(ch => (
            <option key={ch.id} value={ch.id}>Ch {ch.chapter_no}: {ch.name}</option>
          ))}
        </select>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', padding: '15px', border: '1px solid rgba(255,255,255,0.05)' }}>
        {loading ? (
          <div style={{ opacity: 0.6, textAlign: 'center', padding: '20px' }}>Fetching configuration...</div>
        ) : (
          <>
            <div style={{ opacity: 0.6, fontSize: '0.9rem', marginBottom: '8px' }}>Toggle visibility for students:</div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: accessConfig.show_notes ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', borderRadius: '8px', borderLeft: `3px solid ${accessConfig.show_notes ? '#10b981' : '#ef4444'}` }}>
              <span style={{ color: 'var(--text-color)', fontWeight: 500, opacity: accessConfig.show_notes ? 1 : 0.6 }}>Notes</span>
              <button onClick={() => handleToggle('show_notes')} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: accessConfig.show_notes ? '#10b981' : '#ef4444' }}>
                {accessConfig.show_notes ? <Eye size={20} /> : <EyeOff size={20} />}
              </button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: accessConfig.show_mcqs ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', borderRadius: '8px', borderLeft: `3px solid ${accessConfig.show_mcqs ? '#10b981' : '#ef4444'}` }}>
              <span style={{ color: 'var(--text-color)', fontWeight: 500, opacity: accessConfig.show_mcqs ? 1 : 0.6 }}>MCQs</span>
              <button onClick={() => handleToggle('show_mcqs')} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: accessConfig.show_mcqs ? '#10b981' : '#ef4444' }}>
                {accessConfig.show_mcqs ? <Eye size={20} /> : <EyeOff size={20} />}
              </button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: accessConfig.show_flashcards ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', borderRadius: '8px', borderLeft: `3px solid ${accessConfig.show_flashcards ? '#10b981' : '#ef4444'}` }}>
              <span style={{ color: 'var(--text-color)', fontWeight: 500, opacity: accessConfig.show_flashcards ? 1 : 0.6 }}>Flashcards</span>
              <button onClick={() => handleToggle('show_flashcards')} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: accessConfig.show_flashcards ? '#10b981' : '#ef4444' }}>
                {accessConfig.show_flashcards ? <Eye size={20} /> : <EyeOff size={20} />}
              </button>
            </div>
          </>
        )}
      </div>

      {status && (
        <div style={{ padding: '10px', marginTop: '15px', borderRadius: '8px', fontSize: '0.9rem', backgroundColor: status.type === 'success' ? '#10b98120' : '#ef444420', color: status.type === 'success' ? '#10b981' : '#ef4444' }}>
          {status.msg}
        </div>
      )}

      <button className="auth-btn hover-glow" onClick={handleSave} disabled={loading || !selectedChapter} style={{ width: '100%', padding: '12px 20px', background: '#8b5cf6', marginTop: '15px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
        <Save size={18} /> Apply Changes Mode ⚡
      </button>

    </div>
  );
}
