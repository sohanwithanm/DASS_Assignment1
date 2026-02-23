import { useState } from 'react';
import api from '../api';
import { useNavigate , Link} from 'react-router-dom';

const Register = () => {
  // 1. Setup State for our form fields
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Participant' // Default to Participant
  });
  
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // 2. Handle input changes dynamically
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 3. Submit the data to the backend
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevents page reload
    setError(''); // Clear any previous errors

    try {
      // Make the POST request to port 5001
      const response = await api.post('/auth/register', formData);
      
      // If successful, save the token to the browser's local storage
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('userRole', response.data.role || 'Participant'); // Handy for routing later
      localStorage.setItem('userName', data.name);
      
      console.log('Success:', response.data);
      
      // Redirect the user to the dashboard
      navigate('/dashboard');
    } catch (err) {
      // If the backend sends an error (e.g., "User already exists"), display it
      setError(err.response?.data?.message || 'An error occurred during registration');
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', fontFamily: 'sans-serif' }}>
      <h2>Create an Account</h2>
      
      {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        
        <input 
          type="text" 
          name="name" 
          placeholder="Full Name" 
          value={formData.name} 
          onChange={handleChange} 
          required 
          style={{ padding: '10px' }}
        />

        <input 
          type="email" 
          name="email" 
          placeholder="Email Address" 
          value={formData.email} 
          onChange={handleChange} 
          required 
          style={{ padding: '10px' }}
        />

        <input 
          type="password" 
          name="password" 
          placeholder="Password" 
          value={formData.password} 
          onChange={handleChange} 
          required 
          style={{ padding: '10px' }}
        />

        <button type="submit" style={{ padding: '10px', backgroundColor: '#007bff', color: 'white', border: 'none', cursor: 'pointer' }}>
          Register
        </button>
      </form>
      <p style={{ marginTop: '20px' }}>
        Already have an account? <Link to="/login">Login here</Link>
      </p>
    </div>
  );
};

export default Register;