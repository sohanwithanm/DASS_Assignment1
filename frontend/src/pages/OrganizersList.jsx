import { useState, useEffect } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';

const OrganizersList = () => {
  const [organizers, setOrganizers] = useState([]);
  const [followedIds, setFollowedIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const token = localStorage.getItem('token');
  const role = localStorage.getItem('userRole');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const orgRes = await api.get('/users/organizers', {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        setOrganizers(orgRes.data);

        if (token && role === 'Participant') {
          const profileRes = await api.get('/users/profile', {
            headers: { Authorization: `Bearer ${token}` }
          });
          setFollowedIds(profileRes.data.followedOrganizers || []);
        }
      } catch (err) {
        setError('Failed to load organizers.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token, role]);

  const handleFollowToggle = async (organizerId) => {
    if (!token || role !== 'Participant') {
      alert("Please log in as a Participant to follow clubs.");
      return;
    }

    try {
      const isCurrentlyFollowing = followedIds.includes(organizerId);
      
      let updatedFollowedIds;
      if (isCurrentlyFollowing) {
        updatedFollowedIds = followedIds.filter(id => id !== organizerId); 
      } else {
        updatedFollowedIds = [...followedIds, organizerId]; // add id
      }

      // update ui?
      setFollowedIds(updatedFollowedIds);

      // Send the updated array to the profile endpoint
      await api.put('/users/profile', 
        { followedOrganizers: updatedFollowedIds },
        { headers: { Authorization: `Bearer ${token}` } }
      );

    } catch (err) {
      alert("An error occurred while updating your follow preferences.");
    }
  };

  if (loading) return <div style={{ textAlign: 'center', marginTop: '50px' }}>Loading Clubs & Organizers...</div>;

  return (
    <div style={{ maxWidth: '1000px', margin: '40px auto', padding: '0 20px', fontFamily: 'sans-serif' }}>
      <h1 style={{ borderBottom: '2px solid #eee', paddingBottom: '10px', marginBottom: '20px' }}>
        Clubs & Organizers
      </h1>
      
      {error && <div style={{ color: 'red', marginBottom: '20px' }}>{error}</div>}

      {organizers.length === 0 ? (
        <p style={{ color: '#666', fontStyle: 'italic' }}>No organizers found on the platform yet.</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {organizers.map(org => {
            const isFollowing = followedIds.includes(org._id);
            
            return (
              <div key={org._id} style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '20px', backgroundColor: '#fff', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <h3 style={{ margin: '0 0 10px 0' }}>{org.name}</h3>
                    <span style={{ fontSize: '0.8rem', padding: '3px 8px', backgroundColor: '#e9ecef', borderRadius: '12px', fontWeight: 'bold' }}>
                      {org.category || 'General'}
                    </span>
                  </div>
                  <p style={{ color: '#555', fontSize: '0.95rem', marginBottom: '20px', lineHeight: '1.5' }}>
                    {org.description || 'No description provided.'}
                  </p>
                </div>

                {role === 'Participant' && (
                  <button 
                    onClick={() => handleFollowToggle(org._id)}
                    style={{ 
                      width: '100%', padding: '10px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', border: 'none',
                      backgroundColor: isFollowing ? '#f8f9fa' : '#007bff',
                      color: isFollowing ? '#dc3545' : 'white'
                    
                    }}
                  >
                    {isFollowing ? 'Unfollow' : 'Follow'}
                  </button>
                )}
                
                {role === 'Organizer' && (
                  <p style={{ fontSize: '0.85rem', color: '#888', textAlign: 'center', margin: 0 }}>
                    Log in as a participant to follow.
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default OrganizersList;