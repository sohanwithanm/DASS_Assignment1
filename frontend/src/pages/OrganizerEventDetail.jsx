import { useEffect, useState } from 'react';
import api from '../api';
import { useParams, useNavigate } from 'react-router-dom';

const OrganizerEventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [event, setEvent] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [error, setError] = useState('');
  
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('userRole');

  useEffect(() => {
    if (!token || role !== 'Organizer') {
      navigate('/dashboard');
      return;
    }

    const fetchDetails = async () => {
      try {
        const eventRes = await api.get(`/events/${id}`);
        setEvent(eventRes.data);

        if (eventRes.data.status !== 'Draft') {
          const partRes = await api.get(`/events/${id}/participants`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setParticipants(partRes.data);
        }
      } catch (err) {
        setError('Failed to fetch event details.');
      }
    };

    fetchDetails();
  }, [id, navigate, token, role]);

  const handlePublish = async () => {
    try {
      const { data } = await api.put(`/events/${id}`, { status: 'Published' }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEvent(data);
      
      const partRes = await api.get(`/events/${id}/participants`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setParticipants(partRes.data);
    } catch (err) {
      setError('Failed to publish event.');
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this draft? This cannot be undone.')) {
      try {
        await api.delete(`/events/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        navigate('/dashboard');
      } catch (err) {
        setError('Failed to delete event.');
      }
    }
  };

  const downloadCSV = () => {
    const headers = ['Name', 'Email', 'Contact Number', 'College', 'Registration Date'];
    const rows = participants.map(p => {
      const user = p.participant || {};
      return [
        `"${user.name || 'N/A'}"`,
        `"${user.email || 'N/A'}"`,
        `"${user.contactNumber || 'N/A'}"`,
        `"${user.collegeName || 'N/A'}"`,
        `"${new Date(p.createdAt).toLocaleDateString()}"`
      ];
    });

    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${event.name.replace(/\s+/g, '_')}_Participants.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (error) return <div style={{ color: 'red', padding: '20px', textAlign: 'center' }}>{error}</div>;
  if (!event) return <div style={{ padding: '20px', textAlign: 'center' }}>Loading event details...</div>;

  const totalRegistrations = participants.length;
  const totalRevenue = event.type === 'Normal' ? totalRegistrations * (event.registrationFee || 0) : 0;

  return (
    <div style={{ maxWidth: '1000px', margin: '40px auto', fontFamily: 'sans-serif', padding: '0 20px' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #eee', paddingBottom: '20px' }}>
        <div>
          <h2 style={{ margin: '0 0 10px 0' }}>{event.name}</h2>
          <span style={{ padding: '5px 10px', backgroundColor: event.status === 'Draft' ? '#ffc107' : '#28a745', color: event.status === 'Draft' ? 'black' : 'white', borderRadius: '4px', fontWeight: 'bold' }}>
            Status: {event.status}
          </span>
        </div>
        
        <div style={{ display: 'flex', gap: '10px' }}>
          {/* edit is allowed for all events right now */}
          {['Draft', 'Published', 'Ongoing'].includes(event.status) && (
            <button onClick={() => navigate(`/edit-event/${event._id}`)} style={{ padding: '10px 15px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Edit</button>
          )}
          
          {/* delete and publish are for drafts */}
          {event.status === 'Draft' && (
            <>
              <button onClick={handleDelete} style={{ padding: '10px 15px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Delete</button>
              <button onClick={handlePublish} style={{ padding: '10px 15px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Publish Event</button>
            </>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '20px', marginTop: '30px' }}>
        
        {/* overview */}
        <div style={{ flex: 1, padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px', border: '1px solid #ddd' }}>
          <h3 style={{ marginTop: 0 }}>Overview</h3>
          <p><strong>Type:</strong> {event.type}</p>
          <p><strong>Eligibility:</strong> {event.eligibility}</p>
          <p><strong>Deadline:</strong> {new Date(event.registrationDeadline).toLocaleString()}</p>
          <p><strong>Dates:</strong> {new Date(event.startDate).toLocaleDateString()} to {new Date(event.endDate).toLocaleDateString()}</p>
          {event.type === 'Normal' && <p><strong>Fee:</strong> ₹{event.registrationFee}</p>}
        </div>

        {/* analytics (not there for drafts) */}
        <div style={{ flex: 1, padding: '20px', backgroundColor: event.status === 'Draft' ? '#fff3cd' : '#e9ecef', borderRadius: '8px', border: '1px solid #ccc', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ marginTop: 0 }}>Live Analytics</h3>
          
          {event.status === 'Draft' ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#856404', textAlign: 'center', fontStyle: 'italic' }}>
              Publish this event to begin tracking registrations and revenue.
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '20px', marginTop: '10px' }}>
              <div style={{ flex: 1, textAlign: 'center', padding: '15px', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                <span style={{ fontSize: '2rem', fontWeight: 'bold', color: '#007bff' }}>{totalRegistrations}</span>
                <p style={{ margin: '5px 0 0 0', color: '#555' }}>Registrations <br/> (Max: {event.registrationLimit})</p>
              </div>
              
              {event.type === 'Normal' && (
                <div style={{ flex: 1, textAlign: 'center', padding: '15px', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                  <span style={{ fontSize: '2rem', fontWeight: 'bold', color: '#28a745' }}>₹{totalRevenue}</span>
                  <p style={{ margin: '5px 0 0 0', color: '#555' }}>Estimated <br/> Revenue</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* participation list (hidden for drafts) */}
      <div style={{ marginTop: '40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <h3 style={{ margin: 0 }}>Participant Roster</h3>
          <button 
            onClick={downloadCSV}
            disabled={participants.length === 0 || event.status === 'Draft'}
            style={{ padding: '8px 16px', backgroundColor: (participants.length === 0 || event.status === 'Draft') ? '#ccc' : '#17a2b8', color: 'white', border: 'none', borderRadius: '4px', cursor: (participants.length === 0 || event.status === 'Draft') ? 'not-allowed' : 'pointer', fontWeight: 'bold' }}
          >
            &#x2193; Download CSV
          </button>
        </div>

        {event.status === 'Draft' ? (
          <div style={{ padding: '30px', textAlign: 'center', backgroundColor: '#fff3cd', border: '1px dashed #ffeeba', color: '#856404', borderRadius: '8px' }}>
            Participant tracking is not available for draft events.
          </div>
        ) : participants.length === 0 ? (
          <div style={{ padding: '30px', textAlign: 'center', backgroundColor: '#f8f9fa', border: '1px dashed #ccc', borderRadius: '8px' }}>
            No participants have registered for this event yet.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #ddd' }}>
              <thead>
                <tr style={{ backgroundColor: '#f4f4f4', textAlign: 'left' }}>
                  <th style={{ padding: '12px', borderBottom: '2px solid #ddd' }}>Name</th>
                  <th style={{ padding: '12px', borderBottom: '2px solid #ddd' }}>Email</th>
                  <th style={{ padding: '12px', borderBottom: '2px solid #ddd' }}>Contact</th>
                  <th style={{ padding: '12px', borderBottom: '2px solid #ddd' }}>College</th>
                  <th style={{ padding: '12px', borderBottom: '2px solid #ddd' }}>Reg. Date</th>
                </tr>
              </thead>
              <tbody>
                {participants.map((p, index) => (
                  <tr key={p._id} style={{ borderBottom: '1px solid #eee', backgroundColor: index % 2 === 0 ? 'white' : '#fcfcfc' }}>
                    <td style={{ padding: '12px' }}>{p.participant?.name || 'Unknown'}</td>
                    <td style={{ padding: '12px' }}>{p.participant?.email || 'N/A'}</td>
                    <td style={{ padding: '12px' }}>{p.participant?.contactNumber || 'N/A'}</td>
                    <td style={{ padding: '12px' }}>{p.participant?.collegeName || 'N/A'}</td>
                    <td style={{ padding: '12px' }}>{new Date(p.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrganizerEventDetail;