import { Link } from 'react-router-dom';
import { BookOpen, ChevronRight } from 'lucide-react';
import './Dashboard.css'; // Utilizing existing CSS styles for cards

export default function ClassesPage() {
  const classes = [
    { id: 'class9', name: 'Class 9', description: 'Foundation chapters and introductory sciences.', color: '#10b981' },
    { id: 'class10', name: 'Class 10', description: 'Board exam preparation, advanced sciences.', color: '#3b82f6' },
    { id: 'class11', name: 'Class 11', description: 'Core specializations and fundamental theories.', color: '#f59e0b' },
    { id: 'class12', name: 'Class 12', description: 'Advanced board prep and collegiate readiness.', color: '#8b5cf6' }
  ];

  return (
    <div className="dashboard fade-in-up">
      <header className="dashboard-header glass" style={{ marginBottom: '30px' }}>
        <div className="welcome-section">
          <h1>Explore <span className="highlight-emerald">Classes</span> 📚</h1>
          <p>Select your class below to browse subjects and curated notes.</p>
        </div>
      </header>
      
      <div className="cards-container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
        {classes.map(cls => (
          <Link to={`/${cls.id}/subject/science`} key={cls.id} className="subject-card premium-hover" style={{ '--accent-color': cls.color, display: 'block', textDecoration: 'none' }}>
            <div className="subject-icon" style={{ backgroundColor: `${cls.color}20`, color: cls.color }}>
              <BookOpen size={32} />
            </div>
            <div className="subject-info">
              <h3 style={{color: 'var(--text-color)'}}>{cls.name}</h3>
              <p style={{color: 'var(--text-color)', opacity: 0.8, fontSize: '0.9rem'}}>{cls.description}</p>
            </div>
            <ChevronRight size={20} color={cls.color} style={{ position: 'absolute', right: '20px', top: '50%', transform: 'translateY(-50%)' }} />
          </Link>
        ))}
      </div>
    </div>
  );
}
