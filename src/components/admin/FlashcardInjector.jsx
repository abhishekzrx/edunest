import React, { useState, useEffect } from 'react';
import { fetchAllChapters, saveDynamicFlashcards } from '../../utils/supabaseHelpers';
import { Layers, FileJson, AlignLeft, RefreshCw } from 'lucide-react';

export default function FlashcardInjector() {
  const [chapters, setChapters] = useState([]);
  const [selectedChapterId, setSelectedChapterId] = useState('');
  const [textMode, setTextMode] = useState(true);
  const [adminJson, setAdminJson] = useState('');
  const [status, setStatus] = useState(null);
  
  const [filterClass, setFilterClass] = useState('all');
  const [filterSubject, setFilterSubject] = useState('all');

  useEffect(() => {
    loadDropdownChapters();
  }, [filterClass, filterSubject]);

  const loadDropdownChapters = async () => {
    const cls = filterClass === 'all' ? null : filterClass;
    const subj = filterSubject === 'all' ? null : filterSubject;
    const res = await fetchAllChapters(cls, subj);
    if (res.success) {
       setChapters(res.data);
       if (res.data.length > 0) {
         setSelectedChapterId(res.data[0].id);
       } else {
         setSelectedChapterId('');
       }
    }
  };

  const parseTextToFlashcards = (text) => {
    const blocks = text.split(/\n\s*\n/);
    return blocks.map(block => {
      const lines = block.split('\n').map(l => l.trim()).filter(Boolean);
      let data = {
         front_en: '', front_hi: '',
         back_en: '', back_hi: ''
      };
      
      lines.forEach(line => {
        if (/^Front:|F:/i.test(line)) {
            data.front_en += (data.front_en ? ' ' : '') + line.replace(/^Front:|F:/i, '').trim();
            return;
        }
        if (/^Front_HI:|F_HI:/i.test(line)) {
            data.front_hi += (data.front_hi ? ' ' : '') + line.replace(/^Front_HI:|F_HI:/i, '').trim();
            return;
        }
        if (/^Back:|B:/i.test(line)) {
            data.back_en += (data.back_en ? ' ' : '') + line.replace(/^Back:|B:/i, '').trim();
            return;
        }
        if (/^Back_HI:|B_HI:/i.test(line)) {
            data.back_hi += (data.back_hi ? ' ' : '') + line.replace(/^Back_HI:|B_HI:/i, '').trim();
            return;
        }
        
        // Fallback if no prefix
        if (!data.front_en) {
           data.front_en += (data.front_en ? ' ' : '') + line;
        }
      });
      
      if (!data.front_hi) delete data.front_hi;
      if (!data.back_hi) delete data.back_hi;

      // Card must have a front and back
      if (!data.front_en || !data.back_en) return null;
      
      return data;
    }).filter(Boolean);
  };

  const handleSave = async () => {
    try {
      if (!selectedChapterId) return setStatus({ type: 'error', msg: 'A Chapter MUST be selected.' });
      
      let parsed = [];
      if (textMode) {
         parsed = parseTextToFlashcards(adminJson);
         if (parsed.length === 0) return setStatus({ type: 'error', msg: 'Could not parse text. Check syntax.' });
      } else {
         parsed = JSON.parse(adminJson);
         if (!Array.isArray(parsed)) return setStatus({ type: 'error', msg: 'JSON must be a valid array.' });
      }
      
      const res = await saveDynamicFlashcards(selectedChapterId, parsed);
      if (res.success) {
        setStatus({ type: 'success', msg: `Injected ${parsed.length} Flashcards successfully!` });
        setAdminJson('');
      } else {
        setStatus({ type: 'error', msg: res.error });
      }
    } catch (e) {
      setStatus({ type: 'error', msg: 'Parsing Error. Please check format.' });
    }
  };

  return (
    <div className="admin-card glass-card premium-border hover-glow" style={{ padding: '24px', backgroundColor: 'var(--bg-color)', flex: 2, minWidth: '400px', display: 'flex', flexDirection: 'column' }}>
      <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ec4899', marginBottom: '10px', margin: 0 }}>
        <RefreshCw size={24} /> Dynamic Flashcard Injector
      </h3>
      <p style={{ margin: '8px 0 20px', color: 'var(--text-color)', opacity: 0.8, fontSize: '0.9rem' }}>
        Inject multilingual Flashcards into the database for active recall learning.
      </p>

      <div style={{ display: 'flex', gap: '15px', marginBottom: '15px', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '5px' }}>
           <label style={{ fontSize: '0.8rem', opacity: 0.7, marginLeft: '5px' }}>Filter Target Context</label>
           <div style={{ display: 'flex', gap: '10px' }}>
             <select value={filterClass} onChange={e => setFilterClass(e.target.value)} style={{flex: 1, padding: '10px', borderRadius: '8px', background: 'var(--bg-color)', border: '1px solid var(--border-color)', color: 'var(--text-color)'}}>
                <option value="all">All Classes</option>
                <option value="class9">Class 9</option>
                <option value="class10">Class 10</option>
                <option value="class11">Class 11</option>
                <option value="class12">Class 12</option>
             </select>
             <select value={filterSubject} onChange={e => setFilterSubject(e.target.value)} style={{flex: 1, padding: '10px', borderRadius: '8px', background: 'var(--bg-color)', border: '1px solid var(--border-color)', color: 'var(--text-color)'}}>
                <option value="all">All Subjects</option>
                <option value="science">Science</option>
                <option value="maths">Mathematics</option>
             </select>
           </div>
        </div>

        <div style={{ flex: 1.5, display: 'flex', flexDirection: 'column', gap: '5px' }}>
           <label style={{ fontSize: '0.8rem', color: '#ec4899', fontWeight: 600, marginLeft: '5px' }}>Database Bind Target (Chapter)</label>
           <select 
             value={selectedChapterId} 
             onChange={e => setSelectedChapterId(e.target.value)} 
             style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'rgba(236, 72, 153, 0.1)', border: '1px solid rgba(236, 72, 153, 0.3)', color: 'var(--text-color)', fontWeight: 'bold' }}
             disabled={chapters.length === 0}
           >
             {chapters.length === 0 && <option value="">No valid chapters mapped...</option>}
             {chapters.map(ch => (
               <option key={ch.id} value={ch.id}>{ch.name} ({ch.class_name || 'N/A'} - {ch.subject})</option>
             ))}
           </select>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '15px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            onClick={() => {
              const prompt = `Generate 5 bilingual Flashcards in the following format:\n\nFront: [English Word/Concept]\nFront_HI: [Hindi Translation]\nBack: [English Definition]\nBack_HI: [Hindi Definition]\n\n(Leave one empty line between each block).`;
              navigator.clipboard.writeText(prompt);
              setStatus({ type: 'success', msg: 'Prompt copied!' });
              setTimeout(() => setStatus(null), 3000);
            }}
            style={{ padding: '6px 12px', borderRadius: '6px', fontSize: '0.85rem', background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', border: '1px solid rgba(59, 130, 246, 0.2)', cursor: 'pointer' }}
          >✨ Copy AI Prompt</button>
          
          <button 
            onClick={() => {
              const example = `Front: Photosynthesis\nFront_HI: प्रकाश संश्लेषण\nBack: Process by which plants make food using sunlight.\nBack_HI: वह प्रक्रिया जिसके द्वारा पौधे सूर्य के प्रकाश का उपयोग करके भोजन बनाते हैं।`;
              setAdminJson(example);
              setStatus({ type: 'success', msg: 'Ex loaded!' });
              setTimeout(() => setStatus(null), 3000);
            }}
            style={{ padding: '6px 12px', borderRadius: '6px', fontSize: '0.85rem', background: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-color)', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer' }}
          >📝 Example</button>
        </div>

        <div style={{display: 'flex', gap: '10px'}}>
          <button 
            onClick={() => {setTextMode(true); setAdminJson('');}}
            style={{padding: '6px 14px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', background: textMode ? '#ec4899' : 'transparent', color: textMode ? 'white' : 'var(--text-color)', border: '1px solid #ec4899', transition: 'all 0.2s'}}
          ><AlignLeft size={16} /> Text Parse</button>
          <button 
            onClick={() => {setTextMode(false); setAdminJson('');}}
            style={{padding: '6px 14px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', background: !textMode ? '#ec4899' : 'transparent', color: !textMode ? 'white' : 'var(--text-color)', border: '1px solid #ec4899', transition: 'all 0.2s'}}
          ><FileJson size={16} /> JSON</button>
        </div>
      </div>
      
      <textarea 
        placeholder={textMode 
          ? "Front: Oxygen\nFront_HI: ऑक्सीजन\nBack: A gas required for respiration.\nBack_HI: श्वसन के लिए आवश्यक गैस।" 
          : '[\n  {\n    "front_en": "Text",\n    "front_hi": "पाठ",\n    "back_en": "Def",\n    "back_hi": "परिभाषा"\n  }\n]'}
        value={adminJson}
        onChange={e => setAdminJson(e.target.value)}
        style={{ flex: 1, minHeight: '180px', marginBottom: '15px', padding: '16px', borderRadius: '12px', background: 'rgba(0,0,0,0.15)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-color)', fontFamily: 'monospace', fontSize: '0.9rem', resize: 'vertical', minHeight: '120px' }}
      />

      <div style={{ display: 'flex', gap: '15px', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ flex: 1 }}>
           {status && (
             <div style={{ padding: '10px 15px', borderRadius: '8px', fontSize: '0.9rem', backgroundColor: status.type === 'success' ? '#10b98120' : '#ef444420', color: status.type === 'success' ? '#10b981' : '#ef4444' }}>
               {status.type === 'success' ? '✅' : '❌'} {status.msg}
             </div>
           )}
        </div>
        <button className="auth-btn hover-glow" onClick={handleSave} style={{ width: 'auto', padding: '12px 32px', backgroundColor: '#ec4899', color: 'white', borderRadius: '10px', fontWeight: 'bold' }}>
          Inject Flashcards ⚡
        </button>
      </div>
    </div>
  );
}
