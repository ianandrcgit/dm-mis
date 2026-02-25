import React, { useState } from 'react';
import { createDisasterReport } from './disasterService';

const DisasterEntryForm = ({ authToken, onDisasterReported }) => {
  const [formData, setFormData] = useState({
    type: 'FLOOD',
    loss_type: 'CROP_LOSS',
    description: '',
    beneficiary: {
      name: '',
      aadhaar_number: '',
      date_of_loss: '',
    },
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const { type, loss_type, description, beneficiary } = formData;

  const onChange = (e) => {
    const { name, value } = e.target;
    if (['name', 'aadhaar_number', 'date_of_loss'].includes(name)) {
      setFormData({ ...formData, beneficiary: { ...formData.beneficiary, [name]: value } });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const data = await createDisasterReport(authToken, formData);

      setSuccess(`Disaster reported successfully! (ID: ${data.data._id})`);
      // Reset form
      setFormData({
        type: 'FLOOD',
        loss_type: 'CROP_LOSS',
        description: '',
        beneficiary: { name: '', aadhaar_number: '', date_of_loss: '' },
      });
      if (onDisasterReported) onDisasterReported();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <form onSubmit={onSubmit}>
        <h2>Report New Disaster</h2>
        {error && <div className="form-message error">{error}</div>}
        {success && <div className="form-message success">{success}</div>}

        <label htmlFor="type">Disaster Type</label>
        <select id="type" name="type" value={type} onChange={onChange} disabled={loading}>
          <option value="FLOOD">Flood</option>
          <option value="FIRE">Fire</option>
          <option value="EARTHQUAKE">Earthquake</option>
          <option value="CYCLONE">Cyclone</option>
          <option value="DROUGHT">Drought</option>
        </select>

        <label htmlFor="loss_type">Loss/Damage Type</label>
        <select id="loss_type" name="loss_type" value={loss_type} onChange={onChange} disabled={loading}>
          <option value="HUMAN_LOSS">Human Loss</option>
          <option value="ANIMAL_LOSS">Animal Loss</option>
          <option value="CROP_LOSS">Crop Loss</option>
          <option value="HOUSE_DAMAGE">House Damage</option>
        </select>

        <h4>Beneficiary Details</h4>
        <label htmlFor="beneficiary_name">Name</label>
        <input id="beneficiary_name" type="text" placeholder="Beneficiary Name" name="name" value={beneficiary.name} onChange={onChange} required disabled={loading} />

        <label htmlFor="aadhaar_number">Aadhaar Number</label>
        <input id="aadhaar_number" type="text" placeholder="Aadhaar Number" name="aadhaar_number" value={beneficiary.aadhaar_number} onChange={onChange} required disabled={loading} />

        <label htmlFor="date_of_loss">Date of Loss/Damage</label>
        <input id="date_of_loss" type="date" name="date_of_loss" value={beneficiary.date_of_loss} onChange={onChange} required disabled={loading} />

        <label htmlFor="description">Description</label>
        <textarea id="description" placeholder="Provide details about the incident..." name="description" value={description} onChange={onChange} required disabled={loading} rows="4" />

        <button type="submit" disabled={loading}>
          {loading ? 'Submitting...' : 'Submit Report'}
        </button>
      </form>
    </div>
  );
};

export default DisasterEntryForm;