import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const Dashboard = () => {
  const [userData, setUserData] = useState(null);
  const [organizerEvents, setOrganizerEvents] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [participations, setParticipations] = useState([]);
  const [activeTab, setActiveTab] = useState('Upcoming');
  
  const navigate = useNavigate();
  
  // Retrieve credentials from Local Storage
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('userRole');
  const userName = localStorage.getItem('userName');

  useEffect(() => {
    // redirect to login if no token is found
    if (!token) {
      navigate('/login');
      return;
    }

    // 2. Fetch Data based on Role
    const fetchDashboardData = async () => {
      try {
        if (role === 'Organizer') {
          const { data } = await axios.get('http://localhost:5001/api/events/my-events', {
            headers: { Authorization: `Bearer ${token}` }
          });
          setOrganizerEvents(data);
        } else if (role === 'Participant') {
          const { data } = await axios.get('http://localhost:5001/api/events/my-registrations', {
            headers: { Authorization: `Bearer ${token}` }
          });
          setParticipations(data);
        }
      } catch (err) {
        console.error(err);
        setError('Failed to load dashboard data.');
      }
    };

    fetchDashboardData();
  }, [navigate, token, role]);

  const filterParticipations = () => {
    const now = new Date();
    return participations.filter(p => {
      if (!p.event) return false; // Safety check in case an event was deleted
      
      const eventDate = new Date(p.event.startDate);
      const isUpcoming = eventDate > now && p.event.status !== 'Completed' && p.event.status !== 'Cancelled';

      switch (activeTab) {
        case 'Upcoming': return isUpcoming;
        case 'Normal': return p.event.type === 'Normal' && !isUpcoming && p.event.status !== 'Completed';
        case 'Merchandise': return p.event.type === 'Merchandise' && !isUpcoming && p.event.status !== 'Completed';
        case 'Completed': return p.event.status === 'Completed';
        case 'Cancelled': return p.event.status === 'Cancelled' || p.status === 'Rejected';
        default: return true;
      }
    });
  };

  const displayedParticipations = filterParticipations();

  const handleLogout = () => {
    localStorage.clear(); // Wipe the token and user data
    navigate('/login');   // Send them to login
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '40px auto', fontFamily: 'sans-serif', padding: '0 20px' }}>
      <h1 style={{ borderBottom: '2px solid #eee', paddingBottom: '10px' }}>Welcome, {userName}!</h1>
      {error && <div style={{ color: 'red', marginBottom: '15px' }}>{error}</div>}

      {/* --- PARTICIPANT VIEW --- */}
      {role === 'Participant' && (
        <div>
          <h2>My Events Dashboard</h2>
          
          {/* Tabs */}
          <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: '1px solid #ccc', paddingBottom: '10px' }}>
            {['Upcoming', 'Normal', 'Merchandise', 'Completed', 'Cancelled'].map(tab => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{ 
                  padding: '8px 16px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold',
                  backgroundColor: activeTab === tab ? '#007bff' : '#f8f9fa',
                  color: activeTab === tab ? 'white' : '#333'
                }}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Records List */}
          {displayedParticipations.length === 0 ? (
            <p style={{ color: '#666', fontStyle: 'italic' }}>No records found for '{activeTab}'.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {displayedParticipations.map(record => (
                <div key={record._id} style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '20px', backgroundColor: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h3 style={{ margin: '0 0 5px 0' }}>{record.event.name}</h3>
                    <p style={{ margin: '0 0 5px 0', fontSize: '0.9rem', color: '#555' }}>
                      <strong>Organizer:</strong> {record.event.organizerId?.name || 'Unknown'} | <strong>Type:</strong> {record.event.type}
                    </p>
                    <p style={{ margin: '0', fontSize: '0.9rem', color: '#555' }}>
                      <strong>Date:</strong> {new Date(record.event.startDate).toLocaleDateString()}
                    </p>
                  </div>
                  
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ display: 'inline-block', marginBottom: '10px', padding: '5px 10px', backgroundColor: '#e9ecef', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 'bold' }}>
                      Ticket ID: {record._id.substring(0, 8).toUpperCase()}
                    </span>
                    <br/>
                    <button 
                      onClick={() => navigate(`/event/${record.event._id}`)}
                      style={{ padding: '8px 15px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                    >
                      View Event
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* --- ORGANIZER VIEW (Keep your existing Organizer code here) --- */}
      {role === 'Organizer' && (
        <div>
           {/* Your existing Organizer Dashboard UI goes here */}
           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3>Events You Manage</h3>
            <button 
              onClick={() => navigate('/create-event')} 
              style={{ padding: '8px 16px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
              + Create New Event
            </button>
          </div>
          
          {organizerEvents.length === 0 ? (
            <p>You haven't created any events yet.</p>
          ) : (
            <ul style={{ listStyleType: 'none', padding: 0 }}>
              {organizerEvents.map((event) => (
                <li 
                  key={event._id} 
                  onClick={() => navigate(`/organizer/event/${event._id}`)} 
                  style={{ padding: '15px', border: '1px solid #ddd', marginBottom: '10px', borderRadius: '5px', cursor: 'pointer' }}
                >
                  <strong>{event.name}</strong> ({event.type} Event) - Status: {event.status}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default Dashboard;