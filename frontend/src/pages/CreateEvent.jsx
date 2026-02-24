import { useState } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';

const CreateEvent = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('userRole');

  if (!token || role !== 'Organizer') {
    navigate('/dashboard');
    return null;
  }

  const [formData, setFormData] = useState({
    name: '', description: '', type: 'Normal', eligibility: 'All',
    registrationDeadline: '', startDate: '', endDate: '',
    registrationLimit: '', registrationFee: '', eventTags: '', 
    variants: '', stockQuantity: '', purchaseLimitPerParticipant: 1
  });

  // Dynamic form builder
  const [customFields, setCustomFields] = useState([]);
  const [error, setError] = useState('');

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  // dynamic form handler
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

    const payload = {
      name: formData.name, description: formData.description, type: formData.type,
      eligibility: formData.eligibility, registrationDeadline: formData.registrationDeadline,
      startDate: formData.startDate, endDate: formData.endDate, registrationLimit: Number(formData.registrationLimit)
    };

    if (formData.type === 'Normal') {
      payload.registrationFee = Number(formData.registrationFee);
      payload.eventTags = formData.eventTags.split(',').map(t => t.trim()).filter(Boolean);
      
      payload.customFormFields = customFields.map(field => ({
        label: field.label,
        fieldType: field.fieldType,
        isRequired: field.isRequired,
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
      await api.post('/events', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create event.');
    }
  };

  return (
    <div style={{ maxWidth: '750px', margin: '40px auto', padding: '20px', fontFamily: 'sans-serif' }}>
      <h2>Create a New Event (Draft)</h2>
      {error && <div style={{ color: 'red', marginBottom: '15px' }}>{error}</div>}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <input type="text" name="name" placeholder="Event Name" value={formData.name} onChange={handleChange} required style={{ padding: '10px' }} />
        <textarea name="description" placeholder="Description" value={formData.description} onChange={handleChange} required style={{ padding: '10px', minHeight: '80px' }} />
        <select name="type" value={formData.type} onChange={handleChange} style={{ padding: '10px', fontWeight: 'bold' }}>
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
          <div style={{ flex: 1 }}><label>Reg Deadline:</label><input type="datetime-local" name="registrationDeadline" value={formData.registrationDeadline} onChange={handleChange} required style={{ padding: '10px', width: '100%' }} /></div>
          <div style={{ flex: 1 }}><label>Start Date:</label><input type="datetime-local" name="startDate" value={formData.startDate} onChange={handleChange} required style={{ padding: '10px', width: '100%' }} /></div>
          <div style={{ flex: 1 }}><label>End Date:</label><input type="datetime-local" name="endDate" value={formData.endDate} onChange={handleChange} required style={{ padding: '10px', width: '100%' }} /></div>
        </div>
        <input type="number" name="registrationLimit" placeholder="Registration Limit" value={formData.registrationLimit} onChange={handleChange} required style={{ padding: '10px' }} />

        {formData.type === 'Normal' && (
          <div style={{ padding: '15px', borderRadius: '5px'}}>
            <h4 style={{ margin: '0 0 10px 0' }}>Normal Event Details</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <input type="number" name="registrationFee" placeholder="Fee (₹)" value={formData.registrationFee} onChange={handleChange} required style={{ padding: '10px' }} />
              <input type="text" name="eventTags" placeholder="Tags (comma separated)" value={formData.eventTags} onChange={handleChange} style={{ padding: '10px' }} />
            </div>

            <h5 style={{ marginTop: '20px', marginBottom: '10px' }}>Custom Registration Form</h5>
            {customFields.map((field, index) => (
              <div key={index} style={{ display: 'flex', gap: '10px', marginBottom: '10px', alignItems: 'center', backgroundColor: 'white', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}>
                <input type="text" placeholder="Field Label (e.g., T-Shirt Size)" value={field.label} onChange={(e) => updateCustomField(index, 'label', e.target.value)} required style={{ padding: '8px', flex: 2 }} />
                <select value={field.fieldType} onChange={(e) => updateCustomField(index, 'fieldType', e.target.value)} style={{ padding: '8px', flex: 1 }}>
                  <option value="text">Text Input</option>
                  <option value="dropdown">Dropdown</option>
                  <option value="checkbox">Checkbox</option>
                  <option value="file">File Upload</option>
                </select>
                <label style={{ flex: 1, fontSize: '14px' }}><input type="checkbox" checked={field.isRequired} onChange={(e) => updateCustomField(index, 'isRequired', e.target.checked)} /> Required</label>
                {field.fieldType === 'dropdown' && (
                  <input type="text" placeholder="Options (comma separated)" value={field.options} onChange={(e) => updateCustomField(index, 'options', e.target.value)} required style={{ padding: '8px', flex: 2 }} />
                )}
                <button type="button" onClick={() => removeCustomField(index)} style={{ padding: '8px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px' }}>X</button>
              </div>
            ))}
            <button type="button" onClick={addCustomField} style={{ padding: '8px 12px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginTop: '5px' }}>
              + Add Custom Field
            </button>
          </div>
        )}

        {formData.type === 'Merchandise' && (
          <div style={{ padding: '15px', borderRadius: '5px'}}>
            <h4 style={{ margin: '0 0 10px 0' }}>Merchandise Details</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <input type="text" name="variants" placeholder="Variants (comma separated)" value={formData.variants} onChange={handleChange} style={{ padding: '10px' }} />
              <input type="number" name="stockQuantity" placeholder="Stock Quantity" value={formData.stockQuantity} onChange={handleChange} required style={{ padding: '10px' }} />
              <input type="number" name="purchaseLimitPerParticipant" placeholder="Limit Per Participant" value={formData.purchaseLimitPerParticipant} onChange={handleChange} required style={{ padding: '10px' }} />
            </div>
          </div>
        )}

        <button type="submit" style={{ padding: '12px', backgroundColor: '#343a40', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '16px', marginTop: '10px' }}>
          Save Event as Draft
        </button>
      </form>
    </div>
  );
};

export default CreateEvent;