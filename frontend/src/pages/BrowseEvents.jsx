import { useState, useEffect } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';

const BrowseEvents = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filter States
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');
  const [eligibility, setEligibility] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [trending, setTrending] = useState(false);
  
  // Note: For 'Followed Clubs', you would typically fetch the user's followed clubs from their profile
  // and pass those IDs here. We'll leave the state ready for it.
  const [showFollowedOnly, setShowFollowedOnly] = useState(false);

  // Fetch events whenever filters change
  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        // Build the query string dynamically based on active filters
        const params = new URLSearchParams();
        if (search) params.append('search', search);
        if (type) params.append('type', type);
        if (eligibility) params.append('eligibility', eligibility);
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        if (trending) params.append('trending', 'true');
        
        // If showFollowedOnly is true, you would append the comma-separated IDs here
        // if (showFollowedOnly) params.append('followedOrganizers', 'id1,id2');
        if (showFollowedOnly && followedIds.length > 0) params.append('followedOrganizers', followedIds.join(','));

        const { data } = await api.get(`/events?${params.toString()}`);
        setEvents(data);
      } catch (err) {
        setError('Failed to fetch events.');
      } finally {
        setLoading(false);
      }
    };

    // Add a slight delay (debounce) to prevent spamming the API while typing
    const delayDebounceFn = setTimeout(() => {
      fetchEvents();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [search, type, eligibility, startDate, endDate, trending, showFollowedOnly]);

  const clearFilters = () => {
    setSearch(''); setType(''); setEligibility('');
    setStartDate(''); setEndDate(''); setTrending(false); setShowFollowedOnly(false);
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '40px auto', padding: '0 20px', fontFamily: 'sans-serif', display: 'flex', gap: '30px' }}>
      
      {/* --- SIDEBAR: FILTERS --- */}
      <div style={{ width: '280px', flexShrink: 0, padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px', border: '1px solid #ddd', height: 'fit-content' }}>
        <h3 style={{ marginTop: 0, borderBottom: '2px solid #ccc', paddingBottom: '10px' }}>Filters</h3>
        
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Event Type</label>
          <select value={type} onChange={(e) => setType(e.target.value)} style={{ width: '100%', padding: '8px' }}>
            <option value="">All Events</option>
            <option value="Normal">Normal</option>
            <option value="Merchandise">Merchandise</option>
          </select>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Eligibility</label>
          <select value={eligibility} onChange={(e) => setEligibility(e.target.value)} style={{ width: '100%', padding: '8px' }}>
            <option value="">All Students</option>
            <option value="IIIT Only">IIIT Only</option>
            <option value="Non-IIIT Only">Non-IIIT Only</option>
          </select>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Date Range</label>
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} style={{ width: '100%', padding: '8px', marginBottom: '5px', boxSizing: 'border-box' }} />
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
            <input type="checkbox" checked={showFollowedOnly} onChange={(e) => setShowFollowedOnly(e.target.checked)} />
            Followed Clubs Only
          </label>
        </div>

        <button onClick={clearFilters} style={{ width: '100%', padding: '10px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Clear All Filters
        </button>
      </div>

      {/* --- MAIN CONTENT: SEARCH & FEED --- */}
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
          <input 
            type="text" 
            placeholder="Search events or organizers..." 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
            style={{ flex: 1, padding: '12px', fontSize: '16px', borderRadius: '4px', border: '1px solid #ccc' }} 
          />
          <button 
            onClick={() => setTrending(!trending)}
            style={{ padding: '0 20px', backgroundColor: trending ? '#dc3545' : '#f8f9fa', color: trending ? 'white' : 'black', border: '1px solid #ccc', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
          >
          {trending ? 'Showing Trending' : 'Trending (24h)'}
          </button>
        </div>

        {error && <div style={{ color: 'red', padding: '10px', backgroundColor: '#ffe6e6', marginBottom: '15px' }}>{error}</div>}

        {loading ? (
          <p>Loading events...</p>
        ) : events.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', backgroundColor: '#f8f9fa', borderRadius: '8px', border: '1px dashed #ccc' }}>
            <h3>No events found</h3>
            <p>Try adjusting your search or filters.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
            {events.map((event) => (
              <div key={event._id} style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '20px', backgroundColor: 'white', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                    <h3 style={{ margin: 0, fontSize: '1.2rem' }}>{event.name}</h3>
                    <span style={{ fontSize: '0.8rem', padding: '3px 8px', backgroundColor: event.type === 'Normal' ? '#e0f0ff' : '#e6ffe6', color: event.type === 'Normal' ? '#0056b3' : '#1e7e34', borderRadius: '12px', fontWeight: 'bold' }}>
                      {event.type}
                    </span>
                  </div>
                  <p style={{ margin: '0 0 10px 0', fontSize: '0.9rem', color: '#555' }}>By: <strong>{event.organizerId?.name || 'Unknown Organizer'}</strong></p>
                  
                  <div style={{ fontSize: '0.9rem', marginBottom: '15px', color: '#444' }}>
                    <p style={{ margin: '5px 0' }}>Date: {new Date(event.startDate).toLocaleDateString()}</p>
                    <p style={{ margin: '5px 0' }}>Eligibility: {event.eligibility}</p>
                    {event.type === 'Normal' && <p style={{ margin: '5px 0' }}>Fee: {event.registrationFee === 0 ? 'Free' : `₹${event.registrationFee}`}</p>}
                  </div>
                </div>
                
                <button 
                  onClick={() => navigate(`/event/${event._id}`)} 
                  style={{ width: '100%', padding: '10px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', marginTop: '10px' }}
                >
                  View Details
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BrowseEvents;