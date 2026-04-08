import { useState, useMemo } from 'react';
import { Filter, CheckCircle } from 'lucide-react';
import './Dashboard.css';

// Mocked MCQ Database
const mockAllMCQs = [
  { id: 1, class: 'class10', subject: 'science', chapter: 'Chem Reactions', question: 'What is the chemical formula of water?', options: ['H2O', 'CO2', 'O2', 'H2O2'], answer: 'H2O' },
  { id: 2, class: 'class10', subject: 'science', chapter: 'Chem Reactions', question: 'Which of the following is a balanced equation?', options: ['H2+O2=H2O', '2H2+O2=2H2O', 'H2+2O2=H2O', 'none'], answer: '2H2+O2=2H2O' },
  { id: 3, class: 'class10', subject: 'maths', chapter: 'Polynomials', question: 'Degree of a zero polynomial is:', options: ['0', '1', 'Any natural number', 'Not defined'], answer: 'Not defined' },
  { id: 4, class: 'class9', subject: 'science', chapter: 'Matter', question: 'The physical state of water at 25°C is?', options: ['Solid', 'Liquid', 'Gas', 'Plasma'], answer: 'Liquid' },
  { id: 5, class: 'class12', subject: 'science', chapter: 'Electrostatics', question: 'Unit of electric charge is:', options: ['Volt', 'Ampere', 'Coulomb', 'Ohm'], answer: 'Coulomb' },
];

export default function MCQDashboard() {
  const [selectedClass, setSelectedClass] = useState('All');
  const [selectedSubject, setSelectedSubject] = useState('All');

  const filteredMCQs = useMemo(() => {
    return mockAllMCQs.filter(mcq => {
      const classMatch = selectedClass === 'All' || mcq.class === selectedClass;
      const subjectMatch = selectedSubject === 'All' || mcq.subject === selectedSubject;
      return classMatch && subjectMatch;
    });
  }, [selectedClass, selectedSubject]);

  return (
    <div className="dashboard fade-in-up">
      <header className="dashboard-header glass" style={{ marginBottom: '30px' }}>
        <div className="welcome-section">
          <h1>StudyNotes / <span className="highlight-emerald">MCQs</span> 📝</h1>
          <p>Filter and browse through the entire question repository dynamically.</p>
        </div>
      </header>

      <section className="admin-tools mt-8">
        <div className="admin-card glass-card premium-border" style={{ padding: '20px', marginBottom: '25px', display: 'flex', gap: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Filter size={20} color="var(--primary-color)" />
            <h3 style={{ margin: 0, color: 'var(--text-color)' }}>Filters:</h3>
          </div>

          <div style={{ display: 'flex', gap: '10px', flex: 1, minWidth: '300px' }}>
            <select
              value={selectedClass}
              onChange={e => setSelectedClass(e.target.value)}
              style={{ flex: 1, padding: '10px', borderRadius: '8px', background: 'var(--bg-color)', border: '1px solid var(--border-color)', color: 'var(--text-color)' }}
            >
              <option value="All">All Classes</option>
              <option value="class9">Class 9</option>
              <option value="class10">Class 10</option>
              <option value="class11">Class 11</option>
              <option value="class12">Class 12</option>
            </select>

            <select
              value={selectedSubject}
              onChange={e => setSelectedSubject(e.target.value)}
              style={{ flex: 1, padding: '10px', borderRadius: '8px', background: 'var(--bg-color)', border: '1px solid var(--border-color)', color: 'var(--text-color)' }}
            >
              <option value="All">All Subjects</option>
              <option value="science">Science</option>
              <option value="maths">Mathematics</option>
              <option value="english">English</option>
            </select>
          </div>
        </div>

        <div className="mcq-results" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <h3 style={{ color: 'var(--text-color)' }}>Results ({filteredMCQs.length})</h3>
          {filteredMCQs.map((mcq, idx) => (
            <div key={mcq.id} className="admin-card glass-card premium-border hover-glow" style={{ padding: '20px', backgroundColor: 'var(--bg-color)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                <h4 style={{ color: 'var(--text-color)', margin: 0, fontSize: '1.1rem' }}>
                  <span style={{ color: 'var(--primary-color)', marginRight: '8px' }}>Q{idx + 1}.</span>
                  {mcq.question}
                </h4>
                <span style={{ fontSize: '0.8rem', padding: '4px 8px', background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', borderRadius: '4px' }}>
                  {mcq.class.toUpperCase()} - {mcq.subject.toUpperCase()}
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '15px' }}>
                {mcq.options.map((opt, i) => (
                  <div key={i} style={{
                    padding: '10px',
                    borderRadius: '8px',
                    border: opt === mcq.answer ? '1px solid var(--primary-color)' : '1px solid var(--border-color)',
                    background: opt === mcq.answer ? 'var(--bg-color)' : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    color: 'var(--text-color)'
                  }}>
                    {opt === mcq.answer && <CheckCircle size={16} color="var(--primary-color)" />}
                    <span style={{ opacity: opt === mcq.answer ? 1 : 0.8 }}>{opt}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
          {filteredMCQs.length === 0 && (
            <div className="admin-card glass-card premium-border" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-color)', opacity: 0.7 }}>
              No MCQs found matching these filters. Try adjusting your selection.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
