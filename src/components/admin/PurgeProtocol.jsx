import React, { useState, useEffect } from 'react';
import { fetchAllChapters, purgeChapterAndMCQs } from '../../utils/supabaseHelpers';
import { AlertTriangle, Trash2, ShieldAlert } from 'lucide-react';

export default function PurgeProtocol() {
  const [chapters, setChapters] = useState([]);
  const [className, setClassName] = useState('class10');
  const [subject, setSubject] = useState('science');
  const [selectedChapter, setSelectedChapter] = useState('');
  
  const [isArmed, setIsArmed] = useState(false);
  const [confirmationCode, setConfirmationCode] = useState('');
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadChapters();
    // Reset inputs on change
    setIsArmed(false);
    setConfirmationCode('');
    setSelectedChapter('');
    setStatus(null);
  }, [className, subject]);

  const loadChapters = async () => {
    setLoading(true);
    const res = await fetchAllChapters(className, subject);
    if (res.success) {
      setChapters(res.data);
    }
    setLoading(false);
  };

  const handleArm = () => {
    if (!selectedChapter) {
      setStatus({ type: 'error', msg: 'Please select a chapter to purge.' });
      return;
    }
    setIsArmed(true);
    setStatus({ type: 'warning', msg: 'WARNING: This action is irreversible. Type "DELETE" below to confirm.' });
  };

  const executePurge = async () => {
    if (confirmationCode !== 'DELETE') {
      setStatus({ type: 'error', msg: 'Confirmation code incorrect. Type "DELETE".' });
      return;
    }

    setLoading(true);
    setStatus(null);
    const res = await purgeChapterAndMCQs(selectedChapter);
    if (res.success) {
      setStatus({ type: 'success', msg: 'PROTOCOL EXECUTED: Chapter and all associated MCQs have been permanently removed.' });
      setIsArmed(false);
      setConfirmationCode('');
      setSelectedChapter('');
      loadChapters();
    } else {
      setStatus({ type: 'error', msg: `Purge Failed: ${res.error}` });
    }
    setLoading(false);
  };

  return (
    <div className="admin-card glass-card premium-border" style={{ padding: '24px', backgroundColor: 'var(--bg-color)', borderLeft: '4px solid #ef4444', height: '100%' }}>
      <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ef4444', marginBottom: '20px', margin: 0, textTransform: 'uppercase', letterSpacing: '1px' }}>
        <ShieldAlert size={24} /> Omega Purge Protocol
      </h3>
      
      <p style={{ fontSize: '0.9rem', color: 'var(--text-color)', opacity: 0.8, marginBottom: '20px' }}>
        Select a chapter to completely eradicate from the target class. This will execute a cascading delete, dropping the chapter and <strong>all linked MCQs</strong> permanently from the cloud database.
      </p>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
        <select disabled={isArmed} value={className} onChange={(e) => setClassName(e.target.value)} style={{ flex: 1, padding: '10px', borderRadius: '8px', background: 'var(--bg-color)', border: '1px solid var(--border-color)', color: 'var(--text-color)' }}>
          <option value="class9">Class 9</option>
          <option value="class10">Class 10</option>
          <option value="class11">Class 11</option>
          <option value="class12">Class 12</option>
        </select>
        <select disabled={isArmed} value={subject} onChange={(e) => setSubject(e.target.value)} style={{ flex: 1, padding: '10px', borderRadius: '8px', background: 'var(--bg-color)', border: '1px solid var(--border-color)', color: 'var(--text-color)' }}>
          <option value="science">Science</option>
          <option value="maths">Mathematics</option>
        </select>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <select 
          disabled={isArmed || loading} 
          value={selectedChapter} 
          onChange={(e) => { setSelectedChapter(e.target.value); setStatus(null); }} 
          style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'var(--bg-color)', border: '1px solid #ef444450', color: 'var(--text-color)' }}
        >
          <option value="">-- Select Target Chapter to Purge --</option>
          {chapters.map(ch => (
            <option key={ch.id} value={ch.id}>Ch {ch.chapter_no}: {ch.name}</option>
          ))}
        </select>
        {chapters.length === 0 && !loading && (
          <div style={{ fontSize: '0.8rem', opacity: 0.6, marginTop: '8px' }}>No chapters found to target.</div>
        )}
      </div>

      {status && (
        <div style={{ 
          padding: '12px', 
          marginBottom: '20px', 
          borderRadius: '8px', 
          fontSize: '0.9rem', 
          backgroundColor: status.type === 'success' ? '#10b98120' : status.type === 'warning' ? '#f59e0b20' : '#ef444420', 
          color: status.type === 'success' ? '#10b981' : status.type === 'warning' ? '#f59e0b' : '#ef4444',
          display: 'flex',
          gap: '8px',
          alignItems: 'flex-start'
        }}>
          <AlertTriangle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
          <span>{status.msg}</span>
        </div>
      )}

      {!isArmed ? (
        <button 
          className="auth-btn hover-glow" 
          onClick={handleArm} 
          disabled={loading || !selectedChapter}
          style={{ width: '100%', padding: '12px 20px', background: 'transparent', border: '2px solid #ef4444', color: '#ef4444', margin: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', transition: 'all 0.3s ease' }}
        >
          <Trash2 size={18} /> Initiate Purge Sequence
        </button>
      ) : (
        <div className="fade-in-up" style={{ display: 'flex', flexDirection: 'column', gap: '10px', backgroundColor: 'rgba(239, 68, 68, 0.05)', padding: '15px', borderRadius: '8px', border: '1px dashed #ef4444' }}>
          <label style={{ fontSize: '0.8rem', color: '#ef4444', fontWeight: 'bold' }}>SECONDARY CONFIRMATION REQUIRED</label>
          <input 
            type="text" 
            placeholder='Type "DELETE" here...' 
            value={confirmationCode}
            onChange={(e) => setConfirmationCode(e.target.value)}
            style={{ padding: '12px', borderRadius: '8px', background: 'var(--bg-color)', border: '2px solid #ef4444', color: '#ef4444', fontWeight: 'bold', textTransform: 'uppercase' }}
          />
          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              onClick={() => { setIsArmed(false); setConfirmationCode(''); setStatus(null); }}
              style={{ flex: 1, padding: '10px', background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-color)', borderRadius: '8px', cursor: 'pointer' }}
            >
              Abort
            </button>
            <button 
              className="auth-btn hover-glow" 
              onClick={executePurge} 
              disabled={loading}
              style={{ flex: 2, padding: '10px', background: '#ef4444', margin: 0, border: 'none', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '5px' }}
            >
              {loading ? 'PURGING...' : 'EXECUTE PURGE'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
