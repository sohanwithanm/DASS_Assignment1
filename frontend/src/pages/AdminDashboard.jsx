import { useEffect, useState } from 'react';
import api from '../api';
import { useNavigate, Link} from 'react-router-dom';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('manage');
  const [organizers, setOrganizers] = useState([]);
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', category: '', description: '', contactNumber: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('userRole');

  // Security Check & Data Fetching
  useEffect(() => {
    if (!token || role !== 'Admin') {
      navigate('/login');
      return;
    }
    fetchOrganizers();
  }, [navigate, token, role]);

  const fetchOrganizers = async () => {
    try {
      const { data } = await api.get('/admin/organizers', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrganizers(data);
    } catch (err) {
      setError('Failed to fetch organizers.');
    }
  };

  const generatePassword = () => {
    const randomPass = Math.random().toString(36).slice(-10);
    setFormData({ ...formData, password: randomPass });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCreateOrganizer = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    try {
      await api.post('/admin/organizers', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess('Organizer created successfully! Share the credentials with them.');
      setFormData({ name: '', email: '', password: '', category: '', description: '', contactNumber: '' });
      fetchOrganizers(); // Refresh the list
    } catch (err) {
      setError(err.response?.data?.message || 'Error creating organizer');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to completely remove this organizer?')) {
      try {
        await api.delete(`/admin/organizers/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchOrganizers(); // Refresh the list
      } catch (err) {
        setError('Failed to delete organizer.');
      }
    }
  };

  const handleManualReset = async (id) => {
    const newPass = window.prompt("Enter new temporary password for this Organizer:");
    if (!newPass) return;
    try {
      await api.put(`/admin/organizers/${id}/reset-password`, 
        { password: newPass }, { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess('Password updated successfully.');
    } catch (err) {
      setError('Failed to reset password.');
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
      <h2>Admin Control Panel</h2>
      
      {/* Navigation requirement specific to Admin */}
      <nav style={{ display: 'flex', gap: '20px', borderBottom: '2px solid #ddd', marginBottom: '30px', paddingBottom: '10px' }}>
        <button 
          onClick={() => setActiveTab('manage')} 
          style={{ border: 'none', background: 'none', fontWeight: activeTab === 'manage' ? 'bold' : 'normal', cursor: 'pointer', fontSize: '16px' }}
        >
          Manage Clubs/Organizers
        </button>
        <button 
          onClick={() => setActiveTab('resets')} 
          style={{ border: 'none', background: 'none', fontWeight: activeTab === 'resets' ? 'bold' : 'normal', cursor: 'pointer', fontSize: '16px' }}
        >
          Password Reset Requests
        </button>
      </nav>

      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>{success}</p>}

      {activeTab === 'manage' ? (
        <div style={{ display: 'flex', gap: '40px' }}>
          {/* CREATE ORGANIZER FORM (Requirement 11.2) */}
          <div style={{ flex: '1', padding: '20px', border: '1px solid #ccc', borderRadius: '8px', backgroundColor: '#fff' }}>
            <h3>Add New Organizer</h3>
            <form onSubmit={handleCreateOrganizer} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <input type="text" name="name" placeholder="Club/Organizer Name" value={formData.name} onChange={handleChange} required style={{ padding: '8px' }} />
              <input type="email" name="email" placeholder="Login Email" value={formData.email} onChange={handleChange} required style={{ padding: '8px' }} />
              
              <div style={{ display: 'flex', gap: '5px' }}>
                <input type="text" name="password" placeholder="Password" value={formData.password} onChange={handleChange} required style={{ flex: 1, padding: '8px' }} />
                <button type="button" onClick={generatePassword} style={{ padding: '8px', cursor: 'pointer' }}>Auto-Gen</button>
              </div>

              <input type="text" name="category" placeholder="Category (e.g., Technical)" value={formData.category} onChange={handleChange} required style={{ padding: '8px' }} />
              <textarea name="description" placeholder="Brief Description" value={formData.description} onChange={handleChange} required style={{ padding: '8px', minHeight: '60px' }} />
              <button type="submit" style={{ padding: '10px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                Create Account
              </button>
            </form>
          </div>

          {/* ORGANIZER LIST (Requirement 11.2) */}
          <div style={{ flex: '1' }}>
            <h3>Current Organizers</h3>
            {organizers.length === 0 ? <p>No organizers found.</p> : (
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {organizers.map(org => (
                  <li key={org._id} style={{ padding: '15px', border: '1px solid #eee', marginBottom: '10px', display: 'flex', justifyContent: 'space-between', borderRadius: '8px', backgroundColor: '#f9fafb' }}>
                    <div>
                      <strong>{org.name}</strong><br/>
                      <small style={{ color: '#666' }}>{org.email}</small>
                    </div>
                    <button onClick={() => handleDelete(org._id)} style={{ backgroundColor: '#dc3545', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}>
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      ) : (
        /* PASSWORD RESET TAB (Requirement 11.2) */
        <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
          <h3>Organizer Password Resets</h3>
          <p style={{ color: '#666', marginBottom: '20px' }}>Admin manually handles reset requests for club accounts.</p>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '2px solid #eee' }}>
                <th style={{ padding: '10px' }}>Name</th>
                <th style={{ padding: '10px' }}>Email</th>
                <th style={{ padding: '10px' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {organizers.map(org => (
                <tr key={org._id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '10px' }}>{org.name}</td>
                  <td style={{ padding: '10px' }}>{org.email}</td>
                  <td style={{ padding: '10px' }}>
                    <button onClick={() => handleManualReset(org._id)} style={{ padding: '5px 10px', cursor: 'pointer' }}>
                      Reset Password
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;