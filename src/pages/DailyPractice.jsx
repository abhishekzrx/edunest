import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, CheckCircle, XCircle, Flame, Trophy } from 'lucide-react';
import confetti from 'canvas-confetti';
import { updateDailyLogin, awardTestPoints, getMistakes, removeMistake } from '../utils/gamificationSystem';
import { useSearchParams } from 'react-router-dom';
import './TestPage.css';

const getSmartTestMix = (className, userId, limit) => {
  const db = [
    { question: 'What is the powerhouse of the cell?', options: ['Nucleus','Mitochondria','Ribosome','ER'], answer: 1, explanation: 'Mitochondria generate most of the chemical energy.' },
    { question: 'Solve: 5x = 25', options: ['x=1','x=5','x=10','x=2'], answer: 1, explanation: 'Divide both sides by 5. 25/5 = 5.' },
    { question: 'What is the chemical symbol for Gold?', options: ['Ag','Au','Fe','Hg'], answer: 1, explanation: 'Au comes from the Latin aurum.' },
    { question: 'Which planet is known as the Red Planet?', options: ['Venus','Mars','Jupiter','Saturn'], answer: 1, explanation: 'Mars appears red because of iron oxide (rust) on its surface.' },
    { question: 'What is the largest organ in the human body?', options: ['Heart','Liver','Skin','Brain'], answer: 2, explanation: 'The skin is the body\'s largest organ.' },
    { question: 'Who wrote Hamlet?', options: ['Dickens','Shakespeare','Austen','Tolkien'], answer: 1, explanation: 'William Shakespeare wrote Hamlet.' },
    { question: 'What is the speed of light?', options: ['300,000 km/s','150,000 km/s','1,000,000 km/s','None'], answer: 0, explanation: 'Light travels at approx 300k km per second.' }
  ];

  const mistakes = getMistakes(userId);
  
  // 40% from Mistakes, 60% from normal DB logic
  let weakPool = [...mistakes].sort(() => 0.5 - Math.random());
  let normalPool = [...db].sort(() => 0.5 - Math.random());

  const weakLimit = Math.min(Math.floor(limit * 0.4), weakPool.length);
  const selectedWeak = weakPool.slice(0, weakLimit);
  
  const selectedNormal = normalPool
    .filter(q => !selectedWeak.find(w => w.question === q.question)) // Prevent dupes
    .slice(0, limit - weakLimit);

  return [...selectedWeak, ...selectedNormal].sort(() => 0.5 - Math.random());
};

export default function DailyPractice() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isReviseMode = searchParams.get('mode') === 'revise';
  
  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  
  useEffect(() => {
    if (user?.id) updateDailyLogin(user.id);
    
    let qList = [];
    if (isReviseMode && user) {
       qList = getMistakes(user.id).slice(0, 10);
       if (qList.length === 0) {
         // Fallback if no mistakes
         qList = getSmartTestMix(profile?.class || 'class10', user?.id, 5);
       }
    } else {
       qList = getSmartTestMix(profile?.class || 'class10', user?.id, 5);
    }
    setQuestions(qList);
  }, [user, profile, isReviseMode]);

  const handleSelect = (idx) => {
    if (isAnswered) return;
    setSelectedOpt(idx);
    setIsAnswered(true);
    
    if (idx === questions[currentIdx].answer) {
      setScore(prev => prev + 1);
      // If we got it right, remove from mistake bank!
      if (user?.id) {
        removeMistake(user.id, questions[currentIdx].question);
      }
    } else {
      // If we got it wrong, ensure it stays or gets added
      import('../utils/gamificationSystem').then(({ saveMistake }) => {
        if(user) saveMistake(user.id, questions[currentIdx]);
      });
    }
  };

  const handleNext = () => {
    if (currentIdx + 1 < questions.length) {
      setCurrentIdx(prev => prev + 1);
      setSelectedOpt(null);
      setIsAnswered(false);
    } else {
      handleComplete();
    }
  };

  const handleComplete = () => {
    setIsComplete(true);
    // Award points
    if (user?.id) {
       awardTestPoints(user.id, score, questions.length);
    }
    // Confetti trigger
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#10b981', '#3b82f6', '#f59e0b']
    });
  };

  if (questions.length === 0) return <div className="loading">Initializing Neural Matrix...</div>;

  if (isComplete) {
    return (
      <div className="test-page-vertical fade-in-up">
        <div className="test-results-banner" style={{ textAlign: 'center', padding: '50px 20px' }}>
          <Trophy size={64} color="#f59e0b" style={{ margin: '0 auto 20px' }} />
          <h2 style={{ fontSize: '2.5rem', marginBottom: '10px' }}>Practice Complete!</h2>
          <p style={{ fontSize: '1.2rem', opacity: 0.8 }}>Daily limit reached. Neural pathways strengthened.</p>
          
          <div style={{ display: 'flex', justifyContent: 'center', gap: '30px', margin: '30px 0' }}>
            <div className="stat-card glass-card" style={{ padding: '20px', minWidth: '150px' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#10b981' }}>{score}/{questions.length}</div>
              <div style={{ opacity: 0.8 }}>Score</div>
            </div>
            <div className="stat-card glass-card" style={{ padding: '20px', minWidth: '150px' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#3b82f6' }}>+{score * 5 + 10}</div>
              <div style={{ opacity: 0.8 }}>XP Gained</div>
            </div>
          </div>
          
          <button className="btn-dashboard hover-glow" onClick={() => navigate('/student-dashboard')} style={{ padding: '15px 40px', fontSize: '1.1rem' }}>Return to Dashboard</button>
        </div>
      </div>
    );
  }

  const q = questions[currentIdx];

  return (
    <div className="test-page-vertical fade-in-up">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <button className="back-btn" onClick={() => navigate('/student-dashboard')}>
          <ArrowLeft size={20} /> Abort
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: isReviseMode ? 'rgba(239, 68, 68, 0.1)' : 'rgba(245, 158, 11, 0.1)', padding: '8px 16px', borderRadius: '20px', color: isReviseMode ? '#ef4444' : '#f59e0b', fontWeight: 'bold' }}>
          <Flame size={20} /> {isReviseMode ? 'Revision Protocol' : 'Daily Habit Engine'}
        </div>
        <div style={{ fontWeight: 'bold', color: 'var(--text-color)' }}>
          System: {currentIdx + 1} / {questions.length}
        </div>
      </header>

      <div className="progress-bar-bg" style={{ height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', marginBottom: '40px', overflow: 'hidden' }}>
        <div style={{ height: '100%', background: '#10b981', width: `${((currentIdx) / questions.length) * 100}%`, transition: 'width 0.3s ease' }}></div>
      </div>

      <div className="question-card-vertical glass" style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
        <h3 style={{ fontSize: '1.4rem', marginBottom: '25px', lineHeight: '1.4', color: 'var(--text-color)' }}>
          {q.question}
        </h3>
        
        <div className="options-grid-vertical">
          {q.options.map((opt, oIdx) => {
            let optClass = "option-btn-vertical hover-glow";
            let showIcon = null;

            if (isAnswered) {
              if (oIdx === q.answer) {
                 optClass += " correct-opt";
                 showIcon = <CheckCircle size={18} color="#22c55e" className="icon-right" />;
              } else if (selectedOpt === oIdx) {
                 optClass += " incorrect-opt";
                 showIcon = <XCircle size={18} color="#ef4444" className="icon-right" />;
              }
            } else if (selectedOpt === oIdx) {
              optClass += " selected";
            }

            return (
              <button 
                key={oIdx}
                className={optClass}
                onClick={() => handleSelect(oIdx)}
                disabled={isAnswered}
                style={{ padding: '16px', fontSize: '1.1rem', transition: 'all 0.2s', position: 'relative' }}
              >
                <span className="opt-letter-v">{String.fromCharCode(65 + oIdx)}</span>
                <div className="opt-text">{opt}</div>
                {showIcon}
              </button>
            )
          })}
        </div>
        
        {isAnswered && (
          <div className="explanation-vertical fade-in-up" style={{ marginTop: '30px', padding: '20px', background: 'rgba(59, 130, 246, 0.1)', borderLeft: '4px solid #3b82f6', borderRadius: '0 8px 8px 0' }}>
            <strong style={{ color: '#3b82f6' }}>Neural Feedback:</strong> 
            <p style={{ marginTop: '8px', color: 'var(--text-color)', opacity: 0.9 }}>{q.explanation}</p>
          </div>
        )}
      </div>

      {isAnswered && (
        <div className="submit-section-vertical fade-in-up" style={{ marginTop: '30px' }}>
          <button className="auth-btn hover-glow" onClick={handleNext} style={{ width: '100%', padding: '16px', fontSize: '1.2rem', backgroundColor: '#3b82f6' }}>
            {currentIdx + 1 === questions.length ? 'Complete Protocol' : 'Engage Next ->'}
          </button>
        </div>
      )}
    </div>
  );
}
