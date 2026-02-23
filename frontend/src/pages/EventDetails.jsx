import { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate, Link } from 'react-router-dom';

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isRegistered, setIsRegistered] = useState(false);
  
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // States for dynamic registration inputs
  const [formResponses, setFormResponses] = useState({});
  const [selectedVariant, setSelectedVariant] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const token = localStorage.getItem('token');
  const role = localStorage.getItem('userRole');

  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        const { data } = await axios.get(`http://localhost:5001/api/events/${id}`);
        setEvent(data);
        
        // Initialize custom form responses if applicable
        if (data.type === 'Normal' && data.customFormFields) {
          const initialResponses = {};
          data.customFormFields.forEach(field => {
            initialResponses[field.label] = '';
          });
          setFormResponses(initialResponses);
        }
        //Checking if already registered, by logged in user.
        if (token && role === 'Participant') {
        const regRes = await axios.get(`http://localhost:5001/api/events/my-registrations`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        // Check if this event ID exists in their registrations
        const alreadyIn = regRes.data.some(reg => reg.event._id === id);
        setIsRegistered(alreadyIn);
      }
      } catch (err) {
        setError('Failed to load event details.');
      } finally {
        setLoading(false);
      }
    };

    fetchEventDetails();
  }, [id, token, role]);

  const handleFormChange = (label, value) => {
    setFormResponses(prev => ({ ...prev, [label]: value }));
  };

  const handleRegister = async () => {
    if (!token) {
      navigate('/login');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      // For now, hitting the basic registration endpoint. 
      // If you update your backend Participation model later, you can pass formResponses/selectedVariant here.
      const payload = {
        formResponses,
        variant: selectedVariant,
        quantity: quantity
      };

      await axios.post(`http://localhost:5001/api/events/${id}/register`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setSuccess('Successfully registered for the event!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to register.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div style={{ textAlign: 'center', marginTop: '50px' }}>Loading...</div>;
  if (error && !event) return <div style={{ color: 'red', textAlign: 'center', marginTop: '50px' }}>{error}</div>;
  if (!event) return null;

  const isPastDeadline = new Date() > new Date(event.registrationDeadline);
  
  // Disable button if past deadline, or if it's a participant but they haven't selected required fields
  const isButtonDisabled = 
    isPastDeadline || 
    isSubmitting || 
    (event.type === 'Merchandise' && !selectedVariant) ||
    (role && role !== 'Participant'); // Only participants can register

  const validateForm = () => {
    if (event.type === 'Normal' && event.customFormFields) {
      for (let field of event.customFormFields) {
        if (field.isRequired && !formResponses[field.label]) {
          return false;
        }
      }
    }
    if (event.type === 'Merchandise' && !selectedVariant) return false;
      return true;
  };
  
  return (
    <div style={{ maxWidth: '800px', margin: '40px auto', fontFamily: 'sans-serif', padding: '0 20px' }}>
      
      <Link to="/browse" style={{ textDecoration: 'none', color: '#007bff', marginBottom: '20px', display: 'inline-block' }}>
        &larr; Back to Browse
      </Link>

      <div style={{ padding: '30px', border: '1px solid #e0e0e0', borderRadius: '12px', backgroundColor: '#fff', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
        
        {/* HEADER */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #f0f0f0', paddingBottom: '20px', marginBottom: '20px' }}>
          <div>
            <h1 style={{ margin: '0 0 10px 0', fontSize: '2rem' }}>{event.name}</h1>
            <p style={{ margin: 0, color: '#555', fontSize: '1.1rem' }}>Organized by <strong>{event.organizerId?.name || 'Unknown Organizer'}</strong></p>
          </div>
          <span style={{ padding: '6px 12px', backgroundColor: event.type === 'Normal' ? '#e0f0ff' : '#e6ffe6', color: event.type === 'Normal' ? '#0056b3' : '#1e7e34', borderRadius: '20px', fontWeight: 'bold', fontSize: '0.9rem' }}>
            {event.type} Event
          </span>
        </div>

        {/* DETAILS GRID */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px', backgroundColor: '#f9f9f9', padding: '20px', borderRadius: '8px' }}>
          <div>
            <p style={{ margin: '5px 0' }}><strong>Eligibility:</strong> {event.eligibility}</p>
            <p style={{ margin: '5px 0' }}><strong>Start Date:</strong> {new Date(event.startDate).toLocaleString()}</p>
            <p style={{ margin: '5px 0' }}><strong>End Date:</strong> {new Date(event.endDate).toLocaleString()}</p>
          </div>
          <div>
            <p style={{ margin: '5px 0', color: isPastDeadline ? 'red' : 'inherit' }}>
              <strong>Registration Deadline:</strong> {new Date(event.registrationDeadline).toLocaleString()}
            </p>
            <p style={{ margin: '5px 0' }}><strong>Capacity:</strong> {event.registrationLimit}</p>
            {event.type === 'Normal' && (
              <p style={{ margin: '5px 0' }}><strong>Fee:</strong> {event.registrationFee === 0 ? 'Free' : `₹${event.registrationFee}`}</p>
            )}
          </div>
        </div>

        <div style={{ marginBottom: '30px' }}>
          <h3>About This Event</h3>
          <p style={{ lineHeight: '1.6', color: '#444', whiteSpace: 'pre-wrap' }}>{event.description}</p>
        </div>

        {/* REGISTRATION SECTION */}
        <div style={{ borderTop: '2px solid #f0f0f0', paddingTop: '20px' }}>
          <h3>Registration</h3>
          
          {error && <div style={{ color: 'red', padding: '10px', backgroundColor: '#ffe6e6', borderRadius: '4px', marginBottom: '15px' }}>{error}</div>}
          {success && <div style={{ color: 'green', padding: '10px', backgroundColor: '#e6ffe6', borderRadius: '4px', marginBottom: '15px' }}>{success}</div>}
          
          {role === 'Organizer' ? (
            <p style={{ color: '#856404', backgroundColor: '#fff3cd', padding: '10px', borderRadius: '4px' }}>
              Organizers cannot register for events. Please log in as a Participant to test registration.
            </p>
          ) : isPastDeadline ? (
            <p style={{ color: '#721c24', backgroundColor: '#f8d7da', padding: '10px', borderRadius: '4px' }}>
              Registration for this event is closed (Deadline passed).
            </p>
          ) : (
            <div style={{ backgroundColor: '#f8f9fa', padding: '20px', borderRadius: '8px', border: '1px solid #ddd' }}>
              
              {/* Dynamic Forms for Normal Events */}
              {event.type === 'Normal' && event.customFormFields && event.customFormFields.length > 0 && (
                <div style={{ marginBottom: '20px' }}>
                  <h4 style={{ marginTop: 0 }}>Required Information</h4>
                  {event.customFormFields.map((field, idx) => (
                    <div key={idx} style={{ marginBottom: '10px' }}>
                      <label style={{ display: 'block', marginBottom: '5px' }}>
                        {field.label} {field.isRequired && <span style={{ color: 'red' }}>*</span>}
                      </label>
                      
                      {field.fieldType === 'text' && (
                        <input type="text" value={formResponses[field.label] || ''} onChange={(e) => handleFormChange(field.label, e.target.value)} required={field.isRequired} style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
                      )}
                      
                      {field.fieldType === 'dropdown' && (
                        <select value={formResponses[field.label] || ''} onChange={(e) => handleFormChange(field.label, e.target.value)} required={field.isRequired} style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}>
                          <option value="">Select an option</option>
                          {field.options?.map((opt, i) => <option key={i} value={opt}>{opt}</option>)}
                        </select>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Variant selection for Merchandise */}
              {event.type === 'Merchandise' && event.merchandiseDetails && event.merchandiseDetails.variants?.length > 0 && (
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Select Variant/Size: <span style={{ color: 'red' }}>*</span></label>
                  <select value={selectedVariant} onChange={(e) => setSelectedVariant(e.target.value)} style={{ width: '100%', padding: '10px', marginBottom: '10px', boxSizing: 'border-box' }}>
                    <option value="">-- Choose a variant --</option>
                    {event.merchandiseDetails.variants.map((v, i) => (
                      <option key={i} value={v}>{v}</option>
                    ))}
                  </select>
                  
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Quantity (Max: {event.merchandiseDetails.purchaseLimitPerParticipant}):</label>
                  <input type="number" min="1" max={event.merchandiseDetails.purchaseLimitPerParticipant} value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} style={{ width: '100%', padding: '10px', boxSizing: 'border-box' }} />
                </div>
              )}

              <button 
                onClick={handleRegister} 
                disabled={isButtonDisabled || isRegistered || !validateForm()}
                style={{ 
                  width: '100%', padding: '15px', fontSize: '1.1rem', fontWeight: 'bold', border: 'none', borderRadius: '4px',
                  backgroundColor: (isButtonDisabled || isRegistered || !validateForm()) ? '#ccc' : (event.type === 'Merchandise' ? '#28a745' : '#007bff'),
                  color: (isButtonDisabled || isRegistered || !validateForm()) ? '#666' : 'white',
                  cursor: (isButtonDisabled || isRegistered || !validateForm()) ? 'not-allowed' : 'pointer'
                }}
              >
                {!token ? 'Log in to Register' : 
                isRegistered ? 'Already Registered' :
                isSubmitting ? 'Processing...' : 
                !validateForm() ? 'Fill Required Fields' :
                (event.type === 'Merchandise' ? 'Purchase Merchandise' : 'Register Now')}
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default EventDetails;