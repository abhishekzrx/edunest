import React, { useState, useEffect } from 'react';
import { addChapter, fetchAllChapters, deleteChapter } from '../../utils/supabaseHelpers';
import { Book, Plus, Trash2, Tag, Layers } from 'lucide-react';

export default function ChapterManager() {
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [chapterNo, setChapterNo] = useState('');
  const [subject, setSubject] = useState('science');
  const [className, setClassName] = useState('class10'); // Used to isolate query scope
  const [status, setStatus] = useState(null);

  useEffect(() => {
    loadChapters();
  }, [subject, className]);

  const loadChapters = async () => {
    setLoading(true);
    const res = await fetchAllChapters(className, subject);
    if (res.success) {
      setChapters(res.data);
    }
    setLoading(false);
  };

  const handleAdd = async () => {
    if (!name.trim()) return setStatus({ type: 'error', msg: 'Chapter name is required' });
    if (!chapterNo) return setStatus({ type: 'error', msg: 'Chapter number is strictly required for ordering' });

    setStatus(null);
    const parsedNo = parseInt(chapterNo, 10);
    const res = await addChapter(name, subject, className, parsedNo);
    if (res.success) {
      setName('');
      setChapterNo('');
      setStatus({ type: 'success', msg: 'Chapter Added!' });
      loadChapters();
    } else {
      setStatus({ type: 'error', msg: res.error });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure? This will delete all linked MCQs as well!")) return;
    const res = await deleteChapter(id);
    if (res.success) {
      setStatus({ type: 'success', msg: 'Chapter Deleted!' });
      loadChapters();
    } else {
      setStatus({ type: 'error', msg: res.error });
    }
  };

  return (
    <div className="admin-card glass-card premium-border hover-glow" style={{ padding: '24px', backgroundColor: 'var(--bg-color)', flex: 1, minWidth: '320px', display: 'flex', flexDirection: 'column' }}>
      <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10b981', marginBottom: '20px', margin: 0 }}>
        <Layers size={24} /> Chapter Management Hub
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

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '10px' }}>
          <input 
            type="number" 
            placeholder="Ch No." 
            value={chapterNo}
            onChange={(e) => setChapterNo(e.target.value)}
            style={{ width: '80px', padding: '12px', borderRadius: '8px', background: 'var(--bg-color)', border: '1px solid var(--border-color)', color: 'var(--text-color)' }}
          />
          <div style={{ position: 'relative', flex: 1 }}>
            <input 
              type="text" 
              placeholder="New Chapter Name..." 
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{ width: '100%', padding: '12px 12px 12px 35px', borderRadius: '8px', background: 'var(--bg-color)', border: '1px solid var(--border-color)', color: 'var(--text-color)' }}
            />
            <Tag size={16} color="#94a3b8" style={{ position: 'absolute', left: '10px', top: '14px' }} />
          </div>
        </div>
        <button className="auth-btn hover-glow" onClick={handleAdd} style={{ width: '100%', padding: '12px 20px', background: '#10b981', margin: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
          <Plus size={18} /> Add Chapter to DB ⚡
        </button>
      </div>

      {status && (
        <div style={{ padding: '10px', marginBottom: '15px', borderRadius: '8px', fontSize: '0.9rem', backgroundColor: status.type === 'success' ? '#10b98120' : '#ef444420', color: status.type === 'success' ? '#10b981' : '#ef4444' }}>
          {status.msg}
        </div>
      )}

      <div style={{ flex: 1, overflowY: 'auto', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', padding: '15px', border: '1px solid rgba(255,255,255,0.05)', maxHeight: '300px' }}>
        {loading ? (
          <div style={{ opacity: 0.6, textAlign: 'center', padding: '20px' }}>Loading Database...</div>
        ) : chapters.length === 0 ? (
          <div style={{ opacity: 0.6, textAlign: 'center', padding: '20px' }}>No chapters exist logically yet. Proceed to create one.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {chapters.map(ch => (
              <div key={ch.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.05)', padding: '12px 16px', borderRadius: '8px', borderLeft: '3px solid #10b981' }}>
                <span style={{ color: 'var(--text-color)', fontWeight: 500 }}>
                  <span style={{opacity: 0.6, marginRight: '8px'}}>Ch {ch.chapter_no}:</span>
                  {ch.name}
                </span>
                <button onClick={() => handleDelete(ch.id)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', opacity: 0.6, padding: '5px', display: 'flex', alignItems: 'center' }} title="Delete Chapter">
                  <Trash2 size={18} color="#ef4444" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
