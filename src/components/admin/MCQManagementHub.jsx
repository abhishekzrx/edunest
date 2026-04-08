import React, { useState, useEffect } from 'react';
import { fetchAllChapters, saveDynamicMCQs } from '../../utils/supabaseHelpers';
import './MCQManagementHub.css';

export default function MCQManagementHub({ onClose }) {
  const [chapters, setChapters] = useState([]);
  const [selectedChapterId, setSelectedChapterId] = useState('');
  const [mcqTextMode, setMcqTextMode] = useState(true);
  const [adminMcqJson, setAdminMcqJson] = useState('');
  const [status, setStatus] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  
  const [filterClass, setFilterClass] = useState('class10');
  const [filterSubject, setFilterSubject] = useState('science');

  useEffect(() => {
    loadDropdownChapters();
  }, [filterClass, filterSubject]);

  const loadDropdownChapters = async () => {
    const res = await fetchAllChapters(filterClass, filterSubject);
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

  const copyAIPrompt = () => {
    let chapterName = "the selected topic/chapter";
    const ch = chapters.find(c => c.id === selectedChapterId);
    if (ch) chapterName = ch.name;

    const prompt = `Generate 10 bilingual MCQs for ${filterClass}, Subject: ${filterSubject}, Topic/Chapter: "${chapterName}". Provide EXACTLY in the following format for a neural deep parser:\n\nQ: [Question in English]\nQH: [Question in Hindi]\nA. [Option A En]\nA_HI. [Option A Hi]\nB. [Option B En]\nB_HI. [Option B Hi]\nC. [Option C En]\nC_HI. [Option C Hi]\nD. [Option D En]\nD_HI. [Option D Hi]\nAnswer: [Letter A-D]\nExp: [Short English Explanation]\nExp_HI: [हिंदी में छोटा स्पष्टीकरण]\n\n(Ensure one empty line between each block).`;
    
    navigator.clipboard.writeText(prompt);
    setStatus({ type: 'success', msg: 'AI Prompt copied to clipboard!' });
    setTimeout(() => setStatus(null), 3000);
  };

  const loadExample = () => {
    const example = `Q: Which planet is known as the Red Planet?\nQH: किस ग्रह को लाल ग्रह के नाम से जाना जाता है?\nA. Venus\nA_HI. शुक्र\nB. Mars\nB_HI. मंगल\nC. Jupiter\nC_HI. बृहस्पति\nD. Saturn\nD_HI. शनि\nAnswer: B\nExp: Mars appears red due to iron oxide on its surface.\nExp_HI: इसकी सतह पर आयरन ऑक्साइड के कारण मंगल लाल दिखाई देता है।`;
    setAdminMcqJson(example);
    setMcqTextMode(true);
    setStatus({ type: 'success', msg: 'Format example loaded into editor!' });
    setTimeout(() => setStatus(null), 3000);
  };

  const handleSaveMCQs = async () => {
    if (!selectedChapterId) return setStatus({ type: 'error', msg: 'A Chapter MUST be selected. Please map a chapter first.' });
    if (!adminMcqJson.trim()) return setStatus({ type: 'error', msg: 'Content cannot be empty.' });
    
    setIsSaving(true);
    try {
      let parsed = [];
      if (mcqTextMode) {
         parsed = parseTextToMCQs(adminMcqJson);
         if (parsed.length === 0) throw new Error('Could not parse text. Check your syntax mapping.');
      } else {
         parsed = JSON.parse(adminMcqJson);
         if (!Array.isArray(parsed)) throw new Error('JSON must be a valid array of MCQ objects.');
      }
      
      const res = await saveDynamicMCQs(selectedChapterId, parsed);
      if (res.success) {
        setStatus({ type: 'success', msg: `Successfully injected ${parsed.length} MCQs to DB!` });
        setAdminMcqJson('');
        setTimeout(() => setStatus(null), 3500);
      } else {
        setStatus({ type: 'error', msg: res.error });
      }
    } catch (e) {
      setStatus({ type: 'error', msg: a=>e.message || 'Parsing Error. Please check your data format.' });
    }
    setIsSaving(false);
  };

  const textPlaceholder = "PASTE BILINGUAL MCQS HERE...\n\nQ: English Question?\nQH: हिंदी प्रश्न?\nA. Option A\nA_HI. विकल्प ए\nB. Option B\nB_HI. विकल्प बी\nC. Option C\nC_HI. विकल्प सी\nD. Option D\nD_HI. विकल्प डी\nAnswer: B\nExp: Why B is correct...\nExp_HI: बी क्यों सही है...\n\n(Leave one empty line before next question)";
  
  const jsonPlaceholder = 'JSON ARRAY FORMAT...\n[\n  {\n    "question": "English?",\n    "question_hi": "हिंदी?",\n    "options": ["A", "B", "C", "D"],\n    "options_hi": ["ए", "बी", "सी", "डी"],\n    "explanation_en": "Reason...",\n    "explanation_hi": "कारण...",\n    "answer": 1 \n  }\n]';

  return (
    <div className="mmh-overlay" onClick={onClose}>
      <div className="mmh-container" onClick={e => e.stopPropagation()}>
        <button className="mmh-close" onClick={onClose}>&times;</button>
        
        <div className="mmh-header">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <circle cx="12" cy="12" r="6"></circle>
            <circle cx="12" cy="12" r="2"></circle>
          </svg>
          MCQ Management Hub
        </div>

        <div className="mmh-row">
          <div className="mmh-col">
             <label className="mmh-label">Class</label>
             <select className="mmh-select" value={filterClass} onChange={(e) => setFilterClass(e.target.value)}>
               <option value="class9">Class 9</option>
               <option value="class10">Class 10</option>
               <option value="class11">Class 11</option>
               <option value="class12">Class 12</option>
             </select>
          </div>
          <div className="mmh-col">
             <label className="mmh-label">Subject</label>
             <select className="mmh-select" value={filterSubject} onChange={(e) => setFilterSubject(e.target.value)}>
               <option value="science">Science</option>
               <option value="maths">Mathematics</option>
               <option value="physics">Physics</option>
               <option value="chemistry">Chemistry</option>
             </select>
          </div>
        </div>

        <div className="mmh-row" style={{marginBottom: '20px'}}>
          <div className="mmh-col">
             <label className="mmh-label" style={{color: '#f59e0b'}}>Bind Target (Chapter)</label>
             <select 
               className={`mmh-select ${chapters.length === 0 ? 'highlight' : ''}`}
               value={selectedChapterId} 
               onChange={e => setSelectedChapterId(e.target.value)} 
               disabled={chapters.length === 0}
               style={{borderColor: 'rgba(245, 158, 11, 0.4)', backgroundColor: 'rgba(245, 158, 11, 0.05)'}}
             >
               {chapters.length === 0 && <option value="">No chapters exist... Add one first!</option>}
               {chapters.map(ch => (
                 <option key={ch.id} value={ch.id}>Ch {ch.chapter_no}: {ch.name}</option>
               ))}
             </select>
          </div>
        </div>

        <div className="mmh-actions-row">
          <div className="mmh-btn-group">
            <button className="mmh-btn-outline" onClick={copyAIPrompt} style={{color: '#3b82f6', borderColor: '#bfdbfe', backgroundColor: '#eff6ff'}}>
              ✨ Copy AI Prompt
            </button>
            <button className="mmh-btn-outline" onClick={loadExample}>
              📝 Load Example
            </button>
          </div>
          <div className="mmh-btn-group">
            <button className={`mmh-toggle-btn ${mcqTextMode ? 'active' : ''}`} onClick={() => setMcqTextMode(true)}>
              Text Parse
            </button>
            <button className={`mmh-toggle-btn ${!mcqTextMode ? 'active' : ''}`} onClick={() => setMcqTextMode(false)}>
              JSON Engine
            </button>
          </div>
        </div>

        <div className="mmh-textarea-container">
          <textarea 
            className="mmh-textarea"
            placeholder={mcqTextMode ? textPlaceholder : jsonPlaceholder}
            value={adminMcqJson}
            onChange={e => setAdminMcqJson(e.target.value)}
          />
        </div>

        <div className={`mmh-status ${status ? 'show ' + status.type : ''}`}>
          {status ? status.msg : ''}
        </div>

        <button className="mmh-btn-add" onClick={handleSaveMCQs} disabled={isSaving}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
          {isSaving ? 'Processing...' : 'Upload & Bind MCQs ⚡'}
        </button>

      </div>
    </div>
  );
}
