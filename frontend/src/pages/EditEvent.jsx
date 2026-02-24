import { useState, useEffect } from 'react';
import api from '../api';
import { useNavigate, useParams } from 'react-router-dom';

const EditEvent = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('userRole');

  const [formData, setFormData] = useState({
    name: '', description: '', type: 'Normal', eligibility: 'All',
    registrationDeadline: '', startDate: '', endDate: '',
    registrationLimit: '', registrationFee: 0, eventTags: '', 
    variants: '', stockQuantity: '', purchaseLimitPerParticipant: 1
  });

  const [customFields, setCustomFields] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  // strict editing
  const [eventStatus, setEventStatus] = useState('Draft');
  const [originalData, setOriginalData] = useState({ deadline: null, limit: null });

  useEffect(() => {
    if (!token || role !== 'Organizer') return navigate('/dashboard');

    const fetchEvent = async () => {
      try {
        const { data } = await api.get(`/events/${id}`);
        const formatForInput = (dateString) => new Date(dateString).toISOString().slice(0, 16);

        // Store the status and original constraints
        setEventStatus(data.status);
        setOriginalData({
          deadline: new Date(data.registrationDeadline),
          limit: data.registrationLimit
        });

        setFormData({
          name: data.name, description: data.description, type: data.type,
          eligibility: data.eligibility || 'All',
          registrationDeadline: formatForInput(data.registrationDeadline),
          startDate: formatForInput(data.startDate),
          endDate: formatForInput(data.endDate),
          registrationLimit: data.registrationLimit,
          registrationFee: data.registrationFee || 0,
          eventTags: data.eventTags ? data.eventTags.join(', ') : '',
          variants: data.merchandiseDetails?.variants ? data.merchandiseDetails.variants.join(', ') : '',
          stockQuantity: data.merchandiseDetails?.stockQuantity || '',
          purchaseLimitPerParticipant: data.merchandiseDetails?.purchaseLimitPerParticipant || 1
        });

        if (data.customFormFields) {
          const loadedFields = data.customFormFields.map(field => ({
            ...field,
            options: field.options ? field.options.join(', ') : ''
          }));
          setCustomFields(loadedFields);
        }
      } catch (err) {
        setError('Failed to load event details.');
      }
    };
    fetchEvent();
  }, [id, navigate, token, role]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const addCustomField = () => setCustomFields([...customFields, { label: '', fieldType: 'text', isRequired: false, options: '' }]);
  const removeCustomField = (index) => setCustomFields(customFields.filter((_, i) => i !== index));
  const updateCustomField = (index, key, value) => {
    const updated = [...customFields];
    updated[index][key] = value;
    setCustomFields(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // editing validation
    if (eventStatus !== 'Draft') {
      const newDeadline = new Date(formData.registrationDeadline);
      const newLimit = Number(formData.registrationLimit);

      if (newDeadline < originalData.deadline) {
        return setError('Error: You can only EXTEND the registration deadline. You cannot make it earlier.');
      }
      if (newLimit < originalData.limit) {
        return setError('Error: You can only INCREASE the registration limit. You cannot decrease it.');
      }
    }

    const payload = {
      name: formData.name, description: formData.description, type: formData.type,
      eligibility: formData.eligibility, registrationDeadline: formData.registrationDeadline,
      startDate: formData.startDate, endDate: formData.endDate, registrationLimit: Number(formData.registrationLimit)
    };

    if (formData.type === 'Normal') {
      payload.registrationFee = Number(formData.registrationFee);
      payload.eventTags = formData.eventTags.split(',').map(t => t.trim()).filter(Boolean);
      payload.customFormFields = customFields.map(field => ({
        label: field.label, fieldType: field.fieldType, isRequired: field.isRequired,
        options: field.fieldType === 'dropdown' ? field.options.split(',').map(o => o.trim()).filter(Boolean) : []
      }));
    } else if (formData.type === 'Merchandise') {
      payload.merchandiseDetails = {
        variants: formData.variants.split(',').map(v => v.trim()).filter(Boolean),
        stockQuantity: Number(formData.stockQuantity),
        purchaseLimitPerParticipant: Number(formData.purchaseLimitPerParticipant)
      };
    }

    try {
      await api.put(`/events/${id}`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      navigate(`/organizer/event/${id}`); 
    } catch (err) {
      setError('Failed to update event.');
    }
  };

  // close registrations
  const handleCloseRegistrations = async () => {
    if (window.confirm("Are you sure you want to close registrations early? This cannot be undone.")) {
      try {
        await api.put(`/events/${id}`, { status: 'Closed' }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        navigate(`/organizer/event/${id}`);
      } catch (err) {
        setError('Failed to close registrations.');
      }
    }
  };

  // locked fields
  const isLocked = eventStatus !== 'Draft';
  const lockedInputStyle = { padding: '10px', backgroundColor: '#e9ecef', cursor: 'not-allowed', color: '#6c757d', border: '1px solid #ccc' };
  const openInputStyle = { padding: '10px', backgroundColor: 'white', border: '1px solid #ccc' };
  const highlightStyle = { padding: '10px', border: '2px solid #80bdff', backgroundColor: 'white' };

  return (
    <div style={{ maxWidth: '750px', margin: '40px auto', padding: '20px', fontFamily: 'sans-serif' }}>
      <h2>{isLocked ? 'Manage Published Event' : 'Edit Draft Event'}</h2>
      
      {isLocked && (
        <div style={{ padding: '15px', backgroundColor: '#fff3cd', color: '#856404', borderRadius: '5px', marginBottom: '20px' }}>
          <strong>Strict Editing Enabled:</strong> Because this event is no longer a draft, you can only update the description, extend the registration deadline, or increase the capacity. All other fields are locked.
        </div>
      )}

      {error && <div style={{ color: 'red', marginBottom: '15px', fontWeight: 'bold' }}>{error}</div>}
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <input type="text" name="name" value={formData.name} onChange={handleChange} disabled={isLocked} required style={isLocked ? lockedInputStyle : openInputStyle} />
        
        <textarea name="description" value={formData.description} onChange={handleChange} required style={{ minHeight: '80px', ...(isLocked ? highlightStyle : openInputStyle) }} />
        
        <select name="type" value={formData.type} onChange={handleChange} disabled={isLocked} style={{ ...(isLocked ? lockedInputStyle : openInputStyle), fontWeight: 'bold' }}>
          <option value="Normal">Normal Event</option>
          <option value="Merchandise">Merchandise Event</option>
        </select>
        
        <label style={{ flex: 1 }}>
          Eligibility   :      
          <select 
            name="eligibility" 
            value={formData.eligibility} 
            onChange={handleChange}
          >
            <option value="All">All Students</option>
            <option value="IIIT Only">IIIT Students Only</option>
            <option value="Non-IIIT Only">Non-IIIT Only</option>
          </select>
        </label>
        
        <div style={{ display: 'flex', gap: '10px' }}>
          <div style={{ flex: 1 }}><label>Reg Deadline:</label><input type="datetime-local" name="registrationDeadline" value={formData.registrationDeadline} onChange={handleChange} required style={{ width: '100%', boxSizing: 'border-box', ...(isLocked ? highlightStyle : openInputStyle) }} /></div>
          
          <div style={{ flex: 1 }}><label>Start Date:</label><input type="datetime-local" name="startDate" value={formData.startDate} onChange={handleChange} disabled={isLocked} required style={{ width: '100%', boxSizing: 'border-box', ...(isLocked ? lockedInputStyle : openInputStyle) }} /></div>
          <div style={{ flex: 1 }}><label>End Date:</label><input type="datetime-local" name="endDate" value={formData.endDate} onChange={handleChange} disabled={isLocked} required style={{ width: '100%', boxSizing: 'border-box', ...(isLocked ? lockedInputStyle : openInputStyle) }} /></div>
        </div>
        
        <label>Registration Capacity:</label>
        <input type="number" name="registrationLimit" value={formData.registrationLimit} onChange={handleChange} required style={{ ...(isLocked ? highlightStyle : openInputStyle) }} />

        {formData.type === 'Normal' && (
          <div style={{ padding: '15px', border: '1px solid #ccc', borderRadius: '5px'}}>
            <h4 style={{ margin: '0 0 10px 0' }}>Normal Event Details</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <input type="number" name="registrationFee" value={formData.registrationFee} onChange={handleChange} disabled={isLocked} required style={isLocked ? lockedInputStyle : openInputStyle} />
              <input type="text" name="eventTags" value={formData.eventTags} onChange={handleChange} disabled={isLocked} style={isLocked ? lockedInputStyle : openInputStyle} />
            </div>

            <h5 style={{ marginTop: '20px', marginBottom: '10px', color: isLocked ? '#6c757d' : '#333' }}>Custom Registration Form</h5>
            {customFields.map((field, index) => (
              <div key={index} style={{ display: 'flex', gap: '10px', marginBottom: '10px', alignItems: 'center', backgroundColor: isLocked ? '#e9ecef' : 'white', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}>
                <input type="text" value={field.label} onChange={(e) => updateCustomField(index, 'label', e.target.value)} disabled={isLocked} required style={{ flex: 2, ...(isLocked ? lockedInputStyle : openInputStyle) }} />
                <select value={field.fieldType} onChange={(e) => updateCustomField(index, 'fieldType', e.target.value)} disabled={isLocked} style={{ flex: 1, ...(isLocked ? lockedInputStyle : openInputStyle) }}>
                  <option value="text">Text Input</option>
                  <option value="dropdown">Dropdown</option>
                  <option value="checkbox">Checkbox</option>
                  <option value="file">File Upload</option>
                </select>
                <label style={{ flex: 1, fontSize: '14px', color: isLocked ? '#6c757d' : 'black' }}><input type="checkbox" checked={field.isRequired} onChange={(e) => updateCustomField(index, 'isRequired', e.target.checked)} disabled={isLocked} /> Required</label>
                {field.fieldType === 'dropdown' && (
                  <input type="text" value={field.options} onChange={(e) => updateCustomField(index, 'options', e.target.value)} disabled={isLocked} required style={{ flex: 2, ...(isLocked ? lockedInputStyle : openInputStyle) }} />
                )}
                {!isLocked && <button type="button" onClick={() => removeCustomField(index)} style={{ padding: '8px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px' }}>X</button>}
              </div>
            ))}
            {!isLocked && (
              <button type="button" onClick={addCustomField} style={{ padding: '8px 12px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginTop: '5px' }}>
                + Add Custom Field
              </button>
            )}
          </div>
        )}

        {formData.type === 'Merchandise' && (
          <div style={{ padding: '15px', border: '1px solid #ccc', borderRadius: '5px' }}>
            <h4 style={{ margin: '0 0 10px 0' }}>Merchandise Details</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <input type="text" name="variants" placeholder="Variants" value={formData.variants} onChange={handleChange} disabled={isLocked} style={isLocked ? lockedInputStyle : openInputStyle} />
              <input type="number" name="stockQuantity" placeholder='Stock Quantity' value={formData.stockQuantity} onChange={handleChange} disabled={isLocked} required style={isLocked ? lockedInputStyle : openInputStyle} />
              <input type="number" name="purchaseLimitPerParticipant" placeholder='Purchase Limit per Participant' value={formData.purchaseLimitPerParticipant} onChange={handleChange} disabled={isLocked} required style={isLocked ? lockedInputStyle : openInputStyle} />
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: '15px', marginTop: '10px' }}>
          <button type="submit" style={{ flex: 2, padding: '12px', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold', backgroundColor: 'blue' }}>
            Save Changes
          </button>
          
          {['Published', 'Ongoing'].includes(eventStatus) && (
            <button type="button" onClick={handleCloseRegistrations} style={{ flex: 1, padding: '12px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold' }}>
              Close Registrations
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default EditEvent;