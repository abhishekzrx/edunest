import { useAuth } from '../context/AuthContext';
import { Languages } from 'lucide-react';
import './LanguageToggle.css';

export default function LanguageToggle() {
  const { languagePreference, updateLanguagePreference } = useAuth();

  const handleToggle = (lang) => {
    updateLanguagePreference(lang);
  };

  return (
    <div className="lang-toggle-wrapper">
      <div className="lang-toggle-icon">
        <Languages size={18} />
      </div>
      <div className="lang-toggle-group">
        <button 
          className={`lang-btn ${languagePreference === 'english' ? 'active' : ''}`}
          onClick={() => handleToggle('english')}
          disabled={languagePreference === 'english'}
        >
          EN
        </button>
        <button 
          className={`lang-btn ${languagePreference === 'hindi' ? 'active' : ''}`}
          onClick={() => handleToggle('hindi')}
          disabled={languagePreference === 'hindi'}
        >
          HI
        </button>
        <button 
          className={`lang-btn ${languagePreference === 'bilingual' ? 'active' : ''}`}
          onClick={() => handleToggle('bilingual')}
          disabled={languagePreference === 'bilingual'}
        >
          A/अ
        </button>
      </div>
    </div>
  );
}
