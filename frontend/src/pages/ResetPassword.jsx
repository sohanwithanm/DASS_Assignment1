import { useState } from 'react';
import api from '../api';
import { useParams, useNavigate, Link } from 'react-router-dom';

const ResetPassword = () => {
  const { resettoken } = useParams(); // Grabs the token from the URL
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage('');
    setError('');

    if (password !== confirmPassword) {
      setError("Passwords do not match!");
      setIsSubmitting(false);
      return;
    }

    try {
      const { data } = await api.put(`/auth/resetpassword/${resettoken}`, { password });
      setMessage(data.message || 'Password reset successful!');
      
      // Give them a moment to read the success message, then route to login
      setTimeout(() => {
        navigate('/login');
      }, 3000);
      
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired token. Please try requesting a new link.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '100px auto', padding: '30px', border: '1px solid #ddd', borderRadius: '8px', fontFamily: 'sans-serif', backgroundColor: '#fff', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Set New Password</h2>
      
      {message ? (
        <div style={{ textAlign: 'center' }}>
          <div style={{ color: 'green', backgroundColor: '#e6ffe6', padding: '15px', borderRadius: '4px', marginBottom: '20px' }}>{message}</div>
          <p>Redirecting to login...</p>
        </div>
      ) : (
        <>
          {error && <div style={{ color: 'red', backgroundColor: '#ffe6e6', padding: '10px', borderRadius: '4px', marginBottom: '15px', textAlign: 'center' }}>{error}</div>}
          
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>New Password</label>
              <input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
                minLength="6"
                style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }} 
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Confirm New Password</label>
              <input 
                type="password" 
                value={confirmPassword} 
                onChange={(e) => setConfirmPassword(e.target.value)} 
                required 
                minLength="6"
                style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }} 
              />
            </div>
            <button 
              type="submit" 
              disabled={isSubmitting}
              style={{ padding: '12px', backgroundColor: isSubmitting ? '#6c757d' : '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: isSubmitting ? 'not-allowed' : 'pointer', fontWeight: 'bold', fontSize: '1rem', marginTop: '10px' }}
            >
              {isSubmitting ? 'Saving...' : 'Reset Password'}
            </button>
          </form>
        </>
      )}
      
      <div style={{ textAlign: 'center', marginTop: '20px' }}>
        <Link to="/login" style={{ color: '#007bff', textDecoration: 'none' }}>Back to Login</Link>
      </div>
    </div>
  );
};

export default ResetPassword;