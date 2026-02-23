import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const OrganizerDashboard = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Hits the 'getOrganizerEvents' endpoint in your controller
        const { data } = await axios.get('http://localhost:5001/api/events/my-events', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setEvents(data);
      } catch (err) {
        setError('Could not load your events. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchDashboardData();
  }, [token]);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      try {
        await axios.delete(`http://localhost:5001/api/events/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setEvents(events.filter(e => e._id !== id)); // Remove from UI immediately
      } catch (err) {
        alert('Failed to delete event.');
      }
    }
  };

  if (loading) return <div style={{ textAlign: 'center', marginTop: '50px' }}>Loading Felicity Dashboard...</div>;

  return (
    <div style={{ maxWidth: '1100px', margin: '40px auto', padding: '0 20px', fontFamily: 'sans-serif' }}>
      
      {/* HEADER SECTION */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', borderBottom: '2px solid #eee', paddingBottom: '20px' }}>
        <div>
          <h1 style={{ margin: 0, color: '#333' }}>Organizer Dashboard</h1>
          <p style={{ margin: '5px 0 0 0', color: '#666' }}>Manage your events and track registrations</p>
        </div>
        <Link to="/create-event" style={{ padding: '12px 24px', backgroundColor: '#28a745', color: 'white', textDecoration: 'none', borderRadius: '6px', fontWeight: 'bold', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          + Create New Event
        </Link>
      </div>

      {error && <div style={{ color: 'red', padding: '15px', backgroundColor: '#ffe6e6', borderRadius: '4px', marginBottom: '20px' }}>{error}</div>}

      {/* STATS OVERVIEW */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '40px' }}>
        <div style={{ padding: '20px', backgroundColor: '#f8f9fa', border: '1px solid #ddd', borderRadius: '8px', textAlign: 'center' }}>
          <h3 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#888', textTransform: 'uppercase' }}>Total Events</h3>
          <span style={{ fontSize: '28px', fontWeight: 'bold', color: '#333' }}>{events.length}</span>
        </div>
        <div style={{ padding: '20px', backgroundColor: '#f8f9fa', border: '1px solid #ddd', borderRadius: '8px', textAlign: 'center' }}>
          <h3 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#888', textTransform: 'uppercase' }}>Active Registrations</h3>
          <span style={{ fontSize: '28px', fontWeight: 'bold', color: '#007bff' }}>
            {events.reduce((sum, e) => sum + (e.registrationCount || 0), 0)}
          </span>
        </div>
      </div>

      {/* EVENT MANAGEMENT TABLE */}
      <div style={{ backgroundColor: 'white', border: '1px solid #ddd', borderRadius: '8px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ backgroundColor: '#f4f4f4' }}>
            <tr>
              <th style={{ padding: '15px', borderBottom: '2px solid #ddd' }}>Event Name</th>
              <th style={{ padding: '15px', borderBottom: '2px solid #ddd' }}>Type</th>
              <th style={{ padding: '15px', borderBottom: '2px solid #ddd' }}>Status</th>
              <th style={{ padding: '15px', borderBottom: '2px solid #ddd' }}>Reg. Count</th>
              <th style={{ padding: '15px', borderBottom: '2px solid #ddd', textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {events.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: '#999' }}>
                  No events found. Start by creating your first event!
                </td>
              </tr>
            ) : (
              events.map((event) => (
                <tr key={event._id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '15px' }}>
                    <div style={{ fontWeight: 'bold', color: '#333' }}>{event.name}</div>
                    <div style={{ fontSize: '12px', color: '#888' }}>{new Date(event.startDate).toLocaleDateString()}</div>
                  </td>
                  <td style={{ padding: '15px' }}>
                    <span style={{ fontSize: '13px', color: '#555' }}>{event.type}</span>
                  </td>
                  <td style={{ padding: '15px' }}>
                    <span style={{ 
                      padding: '4px 10px', borderRadius: '15px', fontSize: '12px', fontWeight: 'bold',
                      backgroundColor: event.status === 'Published' ? '#e6ffe6' : '#fff3cd',
                      color: event.status === 'Published' ? '#1e7e34' : '#856404'
                    }}>
                      {event.status}
                    </span>
                  </td>
                  <td style={{ padding: '15px', fontWeight: 'bold' }}>{event.registrationCount || 0}</td>
                  <td style={{ padding: '15px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                      <button 
                        onClick={() => navigate(`/event-participants/${event._id}`)}
                        style={{ padding: '6px 12px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '13px' }}
                      >
                        Participants
                      </button>
                      <button 
                        onClick={() => navigate(`/edit-event/${event._id}`)}
                        style={{ padding: '6px 12px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '13px' }}
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDelete(event._id)}
                        style={{ padding: '6px 12px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '13px' }}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OrganizerDashboard;