import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/auth';
import './Auth.css'; 

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [className, setClassName] = useState('class10');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [city, setCity] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await authService.signup(email, password, name, className, dateOfBirth, city);
      setSuccess(true);
      setLoading(false);
      
      // Delay navigation a bit for user to read
      setTimeout(() => {
        navigate('/login');
      }, 5000);
      
    } catch (err) {
      setError(err.message || 'An error occurred during sign up.');
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

  if (success) {
    return (
      <div className="auth-container">
        <div className="auth-card" style={{ textAlign: 'center' }}>
          <h2>📬 Check your email!</h2>
          <p style={{ margin: '20px 0' }}>We sent a verification link to <strong>{email}</strong>. You must verify your email before you can login.</p>
          <button className="auth-btn" onClick={() => navigate('/login')}>Go to Login</button>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Create Account</h2>
        <p>Join StudyNest today</p>
        
        {error && <div className="auth-error">{error}</div>}
        
        <form onSubmit={handleSignup}>
          <div className="form-group">
             <label>Name</label>
             <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div style={{display:'flex', gap:'10px'}}>
            <div className="form-group" style={{flex: 1}}>
              <label>Date of Birth</label>
              <input type="date" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} required />
            </div>
            <div className="form-group" style={{flex: 1}}>
              <label>City</label>
              <input type="text" value={city} onChange={(e) => setCity(e.target.value)} placeholder="E.g. New Delhi" required />
            </div>
          </div>
          <div className="form-group">
            <label>Class</label>
            <select value={className} onChange={(e) => setClassName(e.target.value)} required>
              <option value="class9">Class 9</option>
              <option value="class10">Class 10</option>
              <option value="class11">Class 11</option>
              <option value="class12">Class 12</option>
            </select>
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
          </div>
          <button type="submit" disabled={loading} className="auth-btn" style={{marginBottom: '15px'}}>
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>

        <div className="divider" style={{textAlign:'center', margin:'10px 0', opacity: 0.5}}>Or</div>

        <button onClick={handleGoogleSignIn} disabled={loading} className="auth-btn google-btn" style={{backgroundColor: 'white', color: '#333', border: '1px solid #ddd'}}>
          <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" style={{width: '20px', verticalAlign: 'middle', marginRight: '8px'}}/> 
          Sign up with Google
        </button>
        
        <div className="auth-links" style={{marginTop: '15px'}}>
          Already have an account? <Link to="/login">Login</Link>
        </div>
      </div>
    </div>
  );
}
