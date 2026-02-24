import { useState, useEffect } from 'react';
import api from '../api';
import { Link } from 'react-router-dom';

const Profile = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '', 
    contactNumber: '', 
    collegeName: '',
    isIIITStudent: false,
    organizationName: '', 
    description: '', 
    areasOfInterest: []
  });
  const [interestInput, setInterestInput] = useState('');
  const [followedClubs, setFollowedClubs] = useState([]);
  const [message, setMessage] = useState('');
  
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('userRole');

  const isIIITStudent = (email) => {
    return email.endsWith('@students.iiit.ac.in') || email.endsWith('@research.iiit.ac.in');
  };

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const profileRes = await api.get('/users/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const profileData = profileRes.data;

        setFormData({
          name: profileData.name,
          email: profileData.email,
          contactNumber: profileData.contactNumber || '',
          collegeName: profileData.collegeName || '',
          isIIITStudent: profileData.isIIITStudent || false,
          organizationName: profileData.organizationName || '',
          description: profileData.description || '',
          areasOfInterest: profileData.areasOfInterest || []
        });

        if (role === 'Participant') {
          const orgsRes = await api.get('/users/organizers');
          const followedIds = profileData.followedOrganizers || [];
          const myClubs = orgsRes.data.filter(org => followedIds.includes(org._id));
          setFollowedClubs(myClubs);
        }

      } catch (err) {
        console.error("Error loading profile data", err);
      }
    };
    
    fetchProfileData();
  }, [token, role]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await api.put('/users/profile', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage('Profile updated successfully!');
      localStorage.setItem('userName', formData.name); 
    } catch (err) {
      setMessage('Failed to update profile.');
    }
  };

  const addInterest = () => {
    if (interestInput && !formData.areasOfInterest.includes(interestInput)) {
      setFormData({ ...formData, areasOfInterest: [...formData.areasOfInterest, interestInput] });
      setInterestInput('');
    }
  };

  const removeInterest = (interest) => {
    setFormData({ ...formData, areasOfInterest: formData.areasOfInterest.filter(i => i !== interest) });
  };

  return (
    <div style={{ maxWidth: '700px', margin: '40px auto', padding: '30px', border: '1px solid #ddd', borderRadius: '8px', fontFamily: 'sans-serif', backgroundColor: '#fff' }}>
      <h2 style={{ textAlign: 'center', color: '#333' }}>Edit Profile</h2>
      {message && <p style={{ color: message.includes('success') ? 'green' : 'red', padding: '10px', backgroundColor: message.includes('success') ? '#e6ffe6' : '#ffe6e6', borderRadius: '4px', textAlign: 'center' }}>{message}</p>}
      
      <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        <div style={{ display: 'flex', gap: '15px' }}>
          <div style={{ flex: 1 }}>
            <label style={{ fontWeight: 'bold', fontSize: '14px' }}>Email Address:</label>
            <input type="email" value={formData.email} disabled style={{ width: '100%', padding: '10px', marginTop: '5px', backgroundColor: '#f8f9fa', border: '1px solid #ddd', cursor: 'not-allowed', borderRadius: '4px' }} />
          </div>
          {role === 'Participant' && (
            <div style={{ flex: 1 }}>
              <label style={{ fontWeight: 'bold', fontSize: '14px' }}>Participant Type:</label>
              <input 
                type="text" 
                value={isIIITStudent(formData.email) ? 'IIIT Student' : 'Non-IIIT Participant'} 
                disabled 
                style={{ width: '100%', padding: '10px', marginTop: '5px', backgroundColor: '#f8f9fa', border: '1px solid #ddd', borderRadius: '4px' }} 
              />
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: '15px' }}>
          <div style={{ flex: 1 }}>
            <label style={{ fontWeight: 'bold', fontSize: '14px' }}>Full Name:</label>
            <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '4px', border: '1px solid #ccc' }} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ fontWeight: 'bold', fontSize: '14px' }}>Contact Number:</label>
            <input type="text" value={formData.contactNumber} onChange={(e) => setFormData({...formData, contactNumber: e.target.value})} style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '4px', border: '1px solid #ccc' }} />
          </div>
        </div>

        <div>
          <label style={{ fontWeight: 'bold', fontSize: '14px' }}>College / Organization Name:</label>
          <input type="text" value={formData.collegeName} onChange={(e) => setFormData({...formData, collegeName: e.target.value})} style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '4px', border: '1px solid #ccc' }} />
        </div>

        {role === 'Organizer' && (
          <>
            <label style={{ fontWeight: 'bold', fontSize: '14px' }}>Organization Display Name:</label>
            <input type="text" value={formData.organizationName} onChange={(e) => setFormData({...formData, organizationName: e.target.value})} style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '4px', border: '1px solid #ccc' }} />
            
            <label style={{ fontWeight: 'bold', fontSize: '14px' }}>Bio/Description:</label>
            <textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} style={{ width: '100%', padding: '10px', marginTop: '5px', minHeight: '80px', borderRadius: '4px', border: '1px solid #ccc' }} />
          </>
        )}

        {role === 'Participant' && (
          <div style={{ borderTop: '1px solid #eee', paddingTop: '15px' }}>
            <label style={{ fontWeight: 'bold' }}>Areas of Interest:</label>
            <div style={{ display: 'flex', gap: '5px', marginTop: '8px' }}>
              <input type="text" value={interestInput} onChange={(e) => setInterestInput(e.target.value)} placeholder="Add interest..." style={{ flex: 1, padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }} />
              <button type="button" onClick={addInterest} style={{ padding: '10px 20px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Add</button>
            </div>
            <div style={{ marginTop: '10px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {formData.areasOfInterest.map(i => (
                <span key={i} style={{ backgroundColor: '#007bff', color: 'white', padding: '6px 14px', borderRadius: '20px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {i} 
                  <button type="button" onClick={() => removeInterest(i)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontWeight: 'bold', padding: 0 }}>&times;</button>
                </span>
              ))}
            </div>

            <div style={{ marginTop: '25px', padding: '15px', backgroundColor: '#fdfdfd', borderRadius: '8px', border: '1px solid #efefef' }}>
              <h3 style={{ margin: '0 0 12px 0', fontSize: '1rem', color: '#444' }}>Clubs You Follow</h3>
              {followedClubs.length === 0 ? (
                <p style={{ margin: 0, color: '#888', fontSize: '0.9rem' }}>You haven't followed any clubs yet.</p>
              ) : (
                <ul style={{ margin: 0, paddingLeft: '20px', color: '#333' }}>
                  {followedClubs.map(club => (
                    <li key={club._id} style={{ marginBottom: '6px' }}>
                      <strong>{club.name}</strong> <span style={{ color: '#888', fontSize: '0.85em' }}>({club.category || 'General'})</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

        <button type="submit" style={{ padding: '14px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginTop: '10px', fontSize: '16px', fontWeight: 'bold' }}>
          Save Changes
        </button>
      </form>
    </div>
  );
};

export default Profile;