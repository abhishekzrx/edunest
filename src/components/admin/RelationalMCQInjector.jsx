import React from 'react';
import { DatabaseZap, Link2, PlusCircle, FileText } from 'lucide-react';

export default function RelationalMCQInjector() {
  return (
    <div className="admin-card glass-card premium-border hover-glow" style={{ padding: '24px', backgroundColor: 'var(--bg-color)', flex: 1, minWidth: '320px', display: 'flex', flexDirection: 'column' }}>
      <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#8b5cf6', marginBottom: '15px', margin: 0 }}>
        <DatabaseZap size={24} /> Relational MCQ Injector
      </h3>
      
      <p style={{ fontSize: '0.85rem', opacity: 0.8, color: 'var(--text-color)', marginBottom: '20px' }}>
        Advanced UI placeholder for injecting contextual, cross-chapter relationship MCQs into the dynamic content network.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', flex: 1 }}>
        <div style={{ padding: '15px', backgroundColor: 'rgba(139, 92, 246, 0.05)', borderRadius: '8px', border: '1px dashed rgba(139, 92, 246, 0.3)' }}>
          <label style={{ fontSize: '0.8rem', color: '#8b5cf6', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '8px' }}>
            <Link2 size={14} /> Establish Data Relationship
          </label>
          <div style={{ display: 'flex', gap: '10px' }}>
             <select disabled style={{ flex: 1, padding: '8px', borderRadius: '6px', background: 'var(--bg-color)', border: '1px solid var(--border-color)', color: 'var(--text-color)', opacity: 0.7 }}>
               <option>Select Parent Chapter</option>
             </select>
             <select disabled style={{ flex: 1, padding: '8px', borderRadius: '6px', background: 'var(--bg-color)', border: '1px solid var(--border-color)', color: 'var(--text-color)', opacity: 0.7 }}>
               <option>Select Child Concept</option>
             </select>
          </div>
        </div>

        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', minHeight: '120px' }}>
           <div style={{ textAlign: 'center', opacity: 0.5 }}>
             <FileText size={32} style={{ margin: '0 auto 10px', display: 'block' }} />
             <span style={{ fontSize: '0.8rem' }}>Awaiting JSON Payload Mapping...</span>
           </div>
        </div>

        <button disabled className="auth-btn" style={{ width: '100%', padding: '12px 20px', background: 'transparent', border: '1px solid #8b5cf6', color: '#8b5cf6', margin: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', opacity: 0.6, cursor: 'not-allowed' }}>
          <PlusCircle size={18} /> Inject Relational Node
        </button>
      </div>
    </div>
  );
}
