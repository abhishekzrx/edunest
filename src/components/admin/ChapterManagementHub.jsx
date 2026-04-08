import React, { useState, useEffect } from 'react';
import { addChapter, fetchAllChapters, purgeChapterAndMCQs } from '../../utils/supabaseHelpers';
import './ChapterManagementHub.css';

export default function ChapterManagementHub({ onClose }) {
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [className, setClassName] = useState('class10');
  const [subject, setSubject] = useState('science');
  const [chapterNo, setChapterNo] = useState('');
  const [name, setName] = useState('');
  const [status, setStatus] = useState(null);

  useEffect(() => {
    loadChapters();
  }, [className, subject]);

  const loadChapters = async () => {
    setLoading(true);
    const res = await fetchAllChapters(className, subject);
    if (res.success) {
      setChapters(res.data || []);
    }
    setLoading(false);
  };

  const handleAdd = async () => {
    if (!name.trim()) return setStatus({ type: 'error', msg: 'Chapter name required' });
    if (!chapterNo) return setStatus({ type: 'error', msg: 'Chapter number required' });

    setStatus(null);
    const parsedNo = parseInt(chapterNo, 10);
    const res = await addChapter(name, subject, className, parsedNo);
    if (res.success) {
      setName('');
      setChapterNo('');
      setStatus({ type: 'success', msg: 'Chapter Added!' });
      setTimeout(() => setStatus(null), 2000);
      loadChapters();
    } else {
      setStatus({ type: 'error', msg: res.error });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this chapter? This will also remove any linked MCQs.")) return;
    
    // Upgraded logic: Delete chapter and its associated contents completely from the Database
    const res = await purgeChapterAndMCQs(id); 
    if (res.success) {
      setStatus({ type: 'success', msg: 'Chapter completely deleted from DB!' });
      setTimeout(() => setStatus(null), 2000);
      loadChapters();
    } else {
      setStatus({ type: 'error', msg: res.error });
    }
  };

  return (
    <div className="cmh-overlay" onClick={onClose}>
      <div className="cmh-container" onClick={e => e.stopPropagation()}>
        <button className="cmh-close" onClick={onClose}>&times;</button>
        
        <div className="cmh-header">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
            <polyline points="2 12 12 17 22 12"></polyline>
            <polyline points="2 17 12 22 22 17"></polyline>
          </svg>
          Chapter Management Hub
        </div>

        <div className="cmh-row-2">
          <select className="cmh-select" value={className} onChange={(e) => setClassName(e.target.value)}>
            <option value="class9">Class 9</option>
            <option value="class10">Class 10</option>
            <option value="class11">Class 11</option>
            <option value="class12">Class 12</option>
          </select>
          <select className="cmh-select" value={subject} onChange={(e) => setSubject(e.target.value)}>
            <option value="science">Science</option>
            <option value="maths">Mathematics</option>
            <option value="physics">Physics</option>
            <option value="chemistry">Chemistry</option>
          </select>
        </div>

        <div className="cmh-row-input">
          <input 
            className="cmh-input-ch" 
            placeholder="Ch No" 
            type="number" 
            value={chapterNo}
            onChange={(e) => setChapterNo(e.target.value)}
          />
          <input 
            className="cmh-input-name" 
            placeholder="New Chapter Name..." 
            type="text" 
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <button className="cmh-btn-add" onClick={handleAdd}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          Add Chapter to DB ⚡
        </button>

        {status && (
          <div className={`cmh-status ${status.type}`}>
            {status.msg}
          </div>
        )}

        <div className="cmh-list-container">
          {loading ? (
            <p style={{textAlign: 'center', opacity: 0.6}}>Loading Dashboard...</p>
          ) : chapters.length === 0 ? (
            <p style={{textAlign: 'center', opacity: 0.6, marginTop: '20px'}}>No chapters found.</p>
          ) : (
            chapters.map(ch => (
              <div className="cmh-list-item" key={ch.id}>
                <span className="cmh-list-item-ch">Ch {ch.chapter_no}:</span>
                <span className="cmh-list-item-title">{ch.name}</span>
                <button className="cmh-list-item-del" onClick={() => handleDelete(ch.id)} title="Delete completely">
                   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
