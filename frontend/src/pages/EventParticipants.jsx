import { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';

const EventParticipants = () => {
  const { id } = useParams();
  const [participants, setParticipants] = useState([]);
  const [eventName, setEventName] = useState('');
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`http://localhost:5001/api/events/${id}/participants`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setParticipants(res.data);
        
        // Also fetch event name for the title
        const eventRes = await axios.get(`http://localhost:5001/api/events/${id}`);
        setEventName(eventRes.data.name);
      } catch (err) {
        console.error("Error fetching participants", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, token]);

  const exportToCSV = () => {
    if (participants.length === 0) return alert("No participants to export.");

    // Define headers
    const headers = ["Name", "Email", "Contact", "College", "IIIT Student"];
    
    // Map data to rows
    const rows = participants.map(p => [
      p.participant.name,
      p.participant.email,
      p.participant.contactNumber || 'N/A',
      p.participant.collegeName || 'N/A',
      p.participant.isIIITStudent ? "Yes" : "No"
    ]);

    // Create CSV string
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${eventName}_participants.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) return <div style={{ textAlign: 'center', marginTop: '50px' }}>Loading list...</div>;

  return (
    <div style={{ maxWidth: '900px', margin: '40px auto', padding: '0 20px', fontFamily: 'sans-serif' }}>
      <Link to="/organizer-dashboard" style={{ textDecoration: 'none', color: '#007bff' }}>&larr; Back to Dashboard</Link>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', marginBottom: '30px' }}>
        <h2>Participants for: {eventName}</h2>
        <button 
          onClick={exportToCSV}
          style={{ padding: '10px 20px', backgroundColor: '#17a2b8', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          📥 Export CSV
        </button>
      </div>

      <div style={{ backgroundColor: 'white', border: '1px solid #ddd', borderRadius: '8px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ backgroundColor: '#f4f4f4' }}>
            <tr>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Name</th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Email</th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>College</th>
            </tr>
          </thead>
          <tbody>
            {participants.length === 0 ? (
              <tr><td colSpan="3" style={{ padding: '20px', textAlign: 'center' }}>No registrations yet.</td></tr>
            ) : (
              participants.map((p, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '12px' }}>{p.participant.name}</td>
                  <td style={{ padding: '12px' }}>{p.participant.email}</td>
                  <td style={{ padding: '12px' }}>{p.participant.collegeName}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EventParticipants;