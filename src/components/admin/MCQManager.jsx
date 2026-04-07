import React, { useState, useEffect } from 'react';
import { fetchAllChapters, saveDynamicMCQs } from '../../utils/supabaseHelpers';
import { Book, Cpu, FileJson, AlignLeft } from 'lucide-react';

export default function MCQManager() {
  const [chapters, setChapters] = useState([]);
  const [selectedChapterId, setSelectedChapterId] = useState('');
  const [mcqTextMode, setMcqTextMode] = useState(true);
  const [adminMcqJson, setAdminMcqJson] = useState('');
  const [status, setStatus] = useState(null);
  
  // Filters to narrow down dropdown scope (optional but useful)
  const [filterClass, setFilterClass] = useState('all');
  const [filterSubject, setFilterSubject] = useState('all');

  useEffect(() => {
    loadDropdownChapters();
  }, [filterClass, filterSubject]);

  const loadDropdownChapters = async () => {
    // If filter is all, we pass null to not filter. 
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

  const parseTextToMCQs = (text) => {
    const blocks = text.split(/\n\s*\n/);
    return blocks.map(block => {
      const lines = block.split('\n').map(l => l.trim()).filter(Boolean);
      let data = {
         question: '', question_hi: '',
         options: [], options_hi: [],
         explanation_en: '', explanation_hi: '',
         answer: 0
      };
      
      let optEnObj = {};
      let optHiObj = {};
      
      lines.forEach(line => {
        // Options English
        let matchEn = line.match(/^([A-D])\.\s*(.+)/i);
        if (matchEn) {
            optEnObj[matchEn[1].toUpperCase()] = matchEn[2].trim();
            return;
        }
        
        // Options Hindi
        let matchHi = line.match(/^([A-D])_HI\.\s*(.+)/i);
        if (matchHi) {
            optHiObj[matchHi[1].toUpperCase()] = matchHi[2].trim();
            return;
        }

        // Answer Parsing
        if (/^Answer:/i.test(line)) {
           const ansChar = line.toUpperCase();
           if(ansChar.includes('A')) data.answer = 0;
           else if(ansChar.includes('B')) data.answer = 1;
           else if(ansChar.includes('C')) data.answer = 2;
           else if(ansChar.includes('D')) data.answer = 3;
           return;
        }
        
        // Question Hindi Prefix
        if (/^Q_HI:|QH:/i.test(line)) {
            data.question_hi += (data.question_hi ? ' ' : '') + line.replace(/^Q_HI:|QH:/i, '').trim();
            return;
        }

        // Explicit Question English Prefix
        if (/^Q:/i.test(line)) {
            data.question += (data.question ? ' ' : '') + line.replace(/^Q:/i, '').trim();
            return;
        }

        // Explanations
        if (/^Exp:/i.test(line) || /^Explanation:/i.test(line)) {
            data.explanation_en += (data.explanation_en ? ' ' : '') + line.replace(/^Exp:|Explanation:/i, '').trim();
            return;
        }
        if (/^Exp_HI:/i.test(line) || /^Explanation_HI:/i.test(line)) {
            data.explanation_hi += (data.explanation_hi ? ' ' : '') + line.replace(/^Exp_HI:|Explanation_HI:/i, '').trim();
            return;
        }

        // Implicit Question Base Fallback
        if (Object.keys(optEnObj).length === 0 && !/^Answer:/i.test(line)) {
           data.question += (data.question ? ' ' : '') + line;
        }
      });
      
      data.options = [optEnObj['A']||'', optEnObj['B']||'', optEnObj['C']||'', optEnObj['D']||''];
      if (Object.keys(optHiObj).length > 0) {
        data.options_hi = [optHiObj['A']||'', optHiObj['B']||'', optHiObj['C']||'', optHiObj['D']||''];
      } else {
        data.options_hi = null;
      }
      
      if (!data.question_hi) delete data.question_hi;
      if (!data.explanation_en) delete data.explanation_en;
      if (!data.explanation_hi) delete data.explanation_hi;

      // Ensure valid standard object
      if (data.options.every(o => !o) || !data.question) return null;
      
      return data;
    }).filter(Boolean);
  };

  const handleSaveMCQs = async () => {
    try {
      if (!selectedChapterId) return setStatus({ type: 'error', msg: 'A Chapter MUST be selected. If none exist, create one first.' });
      
      let parsed = [];
      if (mcqTextMode) {
         parsed = parseTextToMCQs(adminMcqJson);
         if (parsed.length === 0) return setStatus({ type: 'error', msg: 'Could not parse text. Check your syntax mapping.' });
      } else {
         parsed = JSON.parse(adminMcqJson);
         if (!Array.isArray(parsed)) return setStatus({ type: 'error', msg: 'JSON must be a valid array of MCQ objects.' });
      }
      
      const res = await saveDynamicMCQs(selectedChapterId, parsed);
      if (res.success) {
        setStatus({ type: 'success', msg: `Successfully linked and injected ${parsed.length} MCQs to DB!` });
        setAdminMcqJson('');
      } else {
        setStatus({ type: 'error', msg: res.error });
      }
    } catch (e) {
      setStatus({ type: 'error', msg: 'Parsing Error. Please check your data format.' });
    }
  };

  return (
    <div className="admin-card glass-card premium-border hover-glow" style={{ padding: '24px', backgroundColor: 'var(--bg-color)', flex: 2, minWidth: '400px', display: 'flex', flexDirection: 'column' }}>
      <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f59e0b', marginBottom: '10px', margin: 0 }}>
        <Cpu size={24} /> Relational MCQ Injector
      </h3>
      <p style={{ margin: '8px 0 20px', color: 'var(--text-color)', opacity: 0.8, fontSize: '0.9rem' }}>
        Inject MCQs natively bound to the active chapters in the overarching Supabase architecture.
      </p>

      {/* Target Routing Dropdowns */}
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
           <label style={{ fontSize: '0.8rem', color: '#f59e0b', fontWeight: 600, marginLeft: '5px' }}>Database Bind Target (Chapter)</label>
           <select 
             value={selectedChapterId} 
             onChange={e => setSelectedChapterId(e.target.value)} 
             style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', color: 'var(--text-color)', fontWeight: 'bold' }}
             disabled={chapters.length === 0}
           >
             {chapters.length === 0 && <option value="">No valid chapters mapped in DB...</option>}
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
              const prompt = `Generate 10 bilingual MCQs for ${filterSubject !== 'all' ? filterSubject : 'Science'} in the following EXACT format for a neural deep parser:\n\nQ: [Question in English]\nQH: [Question in Hindi]\nA. [Option A En]\nA_HI. [Option A Hi]\nB. [Option B En]\nB_HI. [Option B Hi]\nC. [Option C En]\nC_HI. [Option C Hi]\nD. [Option D En]\nD_HI. [Option D Hi]\nAnswer: [Letter A-D]\nExp: [Short English Explanation]\nExp_HI: [हिंदी में छोटा स्पष्टीकरण]\n\n(Ensure one empty line between each block).`;
              navigator.clipboard.writeText(prompt);
              setStatus({ type: 'success', msg: 'AI Prompt copied to clipboard!' });
              setTimeout(() => setStatus(null), 3000);
            }}
            style={{ padding: '6px 12px', borderRadius: '6px', fontSize: '0.85rem', background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', border: '1px solid rgba(59, 130, 246, 0.2)', cursor: 'pointer' }}
          >✨ Copy AI Prompt</button>
          
          <button 
            onClick={() => {
              const example = `Q: Which planet is known as the Red Planet?\nQH: किस ग्रह को लाल ग्रह के नाम से जाना जाता है?\nA. Venus\nA_HI. शुक्र\nB. Mars\nB_HI. मंगल\nC. Jupiter\nC_HI. बृहस्पति\nD. Saturn\nD_HI. शनि\nAnswer: B\nExp: Mars appears red due to iron oxide on its surface.\nExp_HI: इसकी सतह पर आयरन ऑक्साइड के कारण मंगल लाल दिखाई देता है।`;
              setAdminMcqJson(example);
              setStatus({ type: 'success', msg: 'Format example loaded into editor!' });
              setTimeout(() => setStatus(null), 3000);
            }}
            style={{ padding: '6px 12px', borderRadius: '6px', fontSize: '0.85rem', background: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-color)', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer' }}
          >📝 Load Example</button>
        </div>

        <div style={{display: 'flex', gap: '10px'}}>
          <button 
            onClick={() => {setMcqTextMode(true); setAdminMcqJson('');}}
            style={{padding: '6px 14px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', background: mcqTextMode ? 'var(--primary-color)' : 'transparent', color: mcqTextMode ? 'white' : 'var(--text-color)', border: '1px solid var(--primary-color)', transition: 'all 0.2s'}}
          ><AlignLeft size={16} /> Text Deep Parse</button>
          <button 
            onClick={() => {setMcqTextMode(false); setAdminMcqJson('');}}
            style={{padding: '6px 14px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', background: !mcqTextMode ? 'var(--primary-color)' : 'transparent', color: !mcqTextMode ? 'white' : 'var(--text-color)', border: '1px solid var(--primary-color)', transition: 'all 0.2s'}}
          ><FileJson size={16} /> JSON Engine</button>
        </div>
      </div>
      
      <textarea 
        placeholder={mcqTextMode 
          ? "PASTE BILINGUAL MCQS HERE...\n\nQ: English Question?\nQH: हिंदी प्रश्न?\nA. Option A\nA_HI. विकल्प ए\nB. Option B\nB_HI. विकल्प बी\nC. Option C\nC_HI. विकल्प सी\nD. Option D\nD_HI. विकल्प डी\nAnswer: B\nExp: Why B is correct...\nExp_HI: बी क्यों सही है...\n\n(Leave one empty line before next question)" 
          : 'JSON ARRAY FORMAT...\n[\n  {\n    "question": "English?",\n    "question_hi": "हिंदी?",\n    "options": ["A", "B", "C", "D"],\n    "options_hi": ["ए", "बी", "सी", "डी"],\n    "explanation_en": "Reason...",\n    "explanation_hi": "कारण...",\n    "answer": 1 \n  }\n]'}
        value={adminMcqJson}
        onChange={e => setAdminMcqJson(e.target.value)}
        style={{ flex: 1, minHeight: '180px', marginBottom: '15px', padding: '16px', borderRadius: '12px', background: 'rgba(0,0,0,0.15)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-color)', fontFamily: 'monospace', fontSize: '0.9rem', resize: 'vertical' }}
      />

      <div style={{ display: 'flex', gap: '15px', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ flex: 1 }}>
           {status && (
             <div style={{ padding: '10px 15px', borderRadius: '8px', fontSize: '0.9rem', backgroundColor: status.type === 'success' ? '#10b98120' : '#ef444420', color: status.type === 'success' ? '#10b981' : '#ef4444' }}>
               {status.type === 'success' ? '✅' : '❌'} {status.msg}
             </div>
           )}
        </div>
        <button className="auth-btn hover-glow" onClick={handleSaveMCQs} style={{ width: 'auto', padding: '12px 32px', backgroundColor: '#f59e0b', color: 'white', borderRadius: '10px', fontWeight: 'bold' }}>
          Upload & Bind MCQs ⚡
        </button>
      </div>
    </div>
  );
}
