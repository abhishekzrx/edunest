import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';
import './FlashcardViewer.css';

export default function FlashcardViewer({ flashcards }) {
  const { languagePreference } = useAuth();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  if (!flashcards || flashcards.length === 0) {
    return <div className="flashcard-empty">No flashcards available for this chapter.</div>;
  }

  const currentCard = flashcards[currentIndex];

  const handleNext = () => {
    if (currentIndex < flashcards.length - 1) {
      setIsFlipped(false);
      setTimeout(() => setCurrentIndex(prev => prev + 1), 150);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setIsFlipped(false);
      setTimeout(() => setCurrentIndex(prev => prev - 1), 150);
    }
  };

  const flipCard = () => {
    setIsFlipped(!isFlipped);
  };

  const renderContent = (enText, hiText) => {
    if (languagePreference === 'hindi' && hiText) return hiText;
    if (languagePreference === 'bilingual' && hiText) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span>{enText}</span>
          <span style={{ fontSize: '0.9em', opacity: 0.8, color: '#f59e0b' }}>{hiText}</span>
        </div>
      );
    }
    return enText || 'Content missing';
  };

  return (
    <div className="flashcard-viewer-container">
      <div className="flashcard-progress">
        <span>Card {currentIndex + 1} of {flashcards.length}</span>
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${((currentIndex + 1) / flashcards.length) * 100}%` }}
          />
        </div>
      </div>

      <div className={`flashcard-scene ${isFlipped ? 'flipped' : ''}`} onClick={flipCard}>
        <div className="flashcard-inner">
          <div className="flashcard-front">
            <div className="flashcard-content">
              {renderContent(currentCard.front_en, currentCard.front_hi)}
            </div>
            <div className="flashcard-hint">
              <RotateCcw size={16} /> Tap to flip
            </div>
          </div>
          <div className="flashcard-back">
            <div className="flashcard-content">
              {renderContent(currentCard.back_en, currentCard.back_hi)}
            </div>
            <div className="flashcard-hint">
              <RotateCcw size={16} /> Tap to flip back
            </div>
          </div>
        </div>
      </div>

      <div className="flashcard-controls">
        <button 
          className="flashcard-btn" 
          onClick={handlePrev} 
          disabled={currentIndex === 0}
        >
          <ChevronLeft size={24} /> Prev
        </button>
        <button 
          className="flashcard-btn" 
          onClick={handleNext} 
          disabled={currentIndex === flashcards.length - 1}
        >
          Next <ChevronRight size={24} />
        </button>
      </div>
    </div>
  );
}
