import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/auth';
import { Mail, Lock } from 'lucide-react';
import './Auth.css';

export default function Login() {
  const { user, profile } = useAuth();
  const [role, setRole] = useState('student');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // ✅ Protect login route & auto redirect
  useEffect(() => {
    if (user && profile) {
      if (profile.role === 'admin') {
        navigate('/admin-dashboard');
      } else {
        navigate('/student-dashboard');
      }
    }
  }, [user, profile, navigate]);

  const MASTER_ADMIN = {
    email: "admin@studynest.com",
    password: "Admin@123",
    role: "admin"
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // 🔥 Master Admin Override
    if (identifier === MASTER_ADMIN.email && password === MASTER_ADMIN.password) {
      console.log('Using Temporary Master Admin Login');
      localStorage.setItem("masterAdmin", "true");
      window.location.href = "/admin-dashboard"; // Force reload to init simulated session
      return;
    }

    // 🔥 Mock Student Override
    const studentMatch = identifier.match(/^class(9|10|11|12)@studynest\.com$/i);
    if (studentMatch && password.toLowerCase() === identifier.split('@')[0].toLowerCase() + '@123') {
       const className = `class${studentMatch[1]}`;
       localStorage.setItem("mockStudent", className);
       window.location.href = "/student-dashboard";
       return;
    }

    try {
      const { user, profile } = await authService.login(identifier, password);
      
      if (profile?.role === 'admin') {
         navigate('/admin-dashboard');
      } else {
         navigate('/student-dashboard');
      }
    } catch (err) {
      if (err.message.includes('Email not confirmed')) {
        setError('Please verify your email before logging in. Check your inbox.');
      } else {
        setError(err.message || 'An error occurred during login.');
      }
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      await authService.signInWithGoogle();
    } catch (err) {
      setError(err.message || 'Google Auth Error');
      setLoading(false);
    }
  };

  // ✅ Loading state while session validates
  if (user || loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', width: '100vw', background: 'var(--bg-color)', color: '#10b981' }}>
        <div className="pulse" style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#10b981', marginBottom: '20px' }}></div>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 300, letterSpacing: '2px' }}>INITIALIZING SESSION...</h2>
      </div>
    );
  }

  return (
    <div className="login-split-page">
      {/* LEFT PANE: BRAND HOOK */}
      <div className="login-hero-pane">
        <div className="hero-content fade-in-up">
          <h1 style={{ fontSize: '3.5rem', marginBottom: '24px', letterSpacing: '-1px' }}>StudyNest<span style={{color: '#10b981'}}>.</span></h1>
          <p style={{ fontSize: '1.25rem', opacity: 0.9, lineHeight: 1.6, maxWidth: '400px' }}>
            Enter the ultimate neuro-engine for habit-forming education. Master your weak areas, conquer leaderboards, and build a daily rhythm.
          </p>
          
          <div className="hero-stats" style={{ display: 'flex', gap: '24px', marginTop: '48px' }}>
             <div>
               <h3 style={{ fontSize: '2rem', color: '#10b981', margin: 0 }}>40%</h3>
               <p style={{ opacity: 0.7, margin: 0 }}>Higher Retention</p>
             </div>
             <div>
               <h3 style={{ fontSize: '2rem', color: '#3b82f6', margin: 0 }}>10x</h3>
               <p style={{ opacity: 0.7, margin: 0 }}>More Addictive</p>
             </div>
          </div>
        </div>
        {/* Animated Geometry Background */}
        <div className="hero-bg-shapes">
          <div className="shape circle-1"></div>
          <div className="shape circle-2"></div>
        </div>
      </div>

      {/* RIGHT PANE: GATEWAY FORM */}
      <div className="login-form-pane">
        <div className="auth-card fade-in-up">
          <h2>Welcome Back</h2>
          <p>Login to your account</p>
          
          {error && <div className="auth-error">{error}</div>}

        <div className="role-switcher">
          <button 
            type="button"
            className={role === 'student' ? 'active' : ''} 
            onClick={() => { setRole('student'); setIdentifier(''); setPassword(''); setError(null); }}
          >
            👨🎓 Student
          </button>
          <button 
            type="button"
            className={role === 'admin' ? 'active' : ''} 
            onClick={() => { setRole('admin'); setIdentifier(''); setPassword(''); setError(null); }}
          >
            👨💼 Admin
          </button>
        </div>
        
        <form onSubmit={handleLogin}>
          <div className="form-group floating-label-group">
            <Mail size={20} className="field-icon" />
            <input 
              type="email" 
              id="email"
              value={identifier} 
              onChange={(e) => setIdentifier(e.target.value)} 
              required 
              placeholder=" "
            />
            <label htmlFor="email">Email Address</label>
          </div>
          <div className="form-group floating-label-group">
            <Lock size={20} className="field-icon" />
            <input 
              type="password" 
              id="password"
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
              placeholder=" "
            />
            <label htmlFor="password">Password</label>
          </div>
          <button type="submit" disabled={loading} className="auth-btn hover-glow" style={{marginTop: '8px', marginBottom: '24px'}}>
            {loading ? 'Initializing...' : 'Enter Platform'}
          </button>
        </form>

        {role === 'student' && (
          <>
            <div className="divider" style={{textAlign:'center', margin:'10px 0', opacity: 0.5}}>Or</div>
            <button onClick={handleGoogleSignIn} disabled={loading} className="auth-btn google-btn hover-glow" style={{backgroundColor: 'white', color: '#333', border: '1px solid #ddd'}}>
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" style={{width: '20px', verticalAlign: 'middle', marginRight: '8px'}}/> 
              Sign in with Google
            </button>
          </>
        )}
        
          <div className="auth-links" style={{marginTop: '24px'}}>
            Need an account? <Link to="/signup">Sign Up</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
