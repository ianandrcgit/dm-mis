import React, { useState } from 'react';

// A helper to define which fields are required for each role, making the rendering logic cleaner.
const roleHierarchyRequirements = {
  ADMIN: [],
  STATE_OFFICER: [],
  DISTRICT_OFFICER: ['district_id'],
  TALUKA_OFFICER: ['district_id', 'taluka_id'],
  VILLAGE_OFFICER: ['district_id', 'taluka_id', 'hobli_id', 'village_id'],
};

const CreateUserForm = ({ authToken, onUserCreated }) => { // Accept authToken and a callback
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'VILLAGE_OFFICER',
    hierarchy: {
      district_id: '',
      taluka_id: '',
      hobli_id: '',
      village_id: '',
    },
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false); // Add loading state for better UX

  const { name, email, password, role, hierarchy } = formData;

  // A single, more robust change handler for all form fields
  const onChange = (e) => {
    const { name, value } = e.target;

    if (['district_id', 'taluka_id', 'hobli_id', 'village_id'].includes(name)) {
      setFormData((prev) => ({
        ...prev,
        hierarchy: { ...prev.hierarchy, [name]: value },
      }));
    } else if (name === 'role') {
      // When role changes, reset hierarchy to avoid sending stale data
      setFormData((prev) => ({
        ...prev,
        role: value,
        hierarchy: { district_id: '', taluka_id: '', hobli_id: '', village_id: '' },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true); // Set loading to true

    try {
      // Use the authToken from props
      if (!authToken) {
        throw new Error('Authentication token is missing.');
      }

      const response = await fetch('http://localhost:5000/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create user.');
      }

      setSuccess(`User "${data.data.name}" created successfully!`);
      // Optionally, reset the form
      setFormData({
        name: '', email: '', password: '', role: 'VILLAGE_OFFICER',
        hierarchy: { district_id: '', taluka_id: '', hobli_id: '', village_id: '' }
      });
      if (onUserCreated) onUserCreated(); // Notify parent component

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false); // Reset loading state regardless of outcome
    }
  };

  // Determine which hierarchy fields to show based on the selected role
  const requiredHierarchyFields = roleHierarchyRequirements[role] || [];

  return (
    <div className="form-container">
      <form onSubmit={onSubmit}>
      <h2>Create New User</h2>
        {error && <div className="form-message error">{error}</div>}
        {success && <div className="form-message success">{success}</div>}
      
      <input type="text" placeholder="Name" name="name" value={name} onChange={onChange} required disabled={loading} />
      <input type="email" placeholder="Email" name="email" value={email} onChange={onChange} required disabled={loading} />
      <input type="password" placeholder="Password" name="password" value={password} onChange={onChange} required minLength="6" disabled={loading} />

      <select name="role" value={role} onChange={onChange} disabled={loading}>
        <option value="ADMIN">Admin</option>
        <option value="STATE_OFFICER">State Officer</option>
        <option value="DISTRICT_OFFICER">District Officer</option>
        <option value="TALUKA_OFFICER">Taluka Officer</option>
        <option value="VILLAGE_OFFICER">Village Officer</option>
      </select>

      {requiredHierarchyFields.length > 0 && <h4>Hierarchy</h4>}
      
      {requiredHierarchyFields.includes('district_id') && (
        <input
          type="text"
          placeholder="District ID"
          name="district_id"
          value={hierarchy.district_id}
          onChange={onChange}
          required
          disabled={loading}
        />
      )}
      {requiredHierarchyFields.includes('taluka_id') && (
        <input
          type="text"
          placeholder="Taluka ID"
          name="taluka_id"
          value={hierarchy.taluka_id}
          onChange={onChange}
          required
          disabled={loading}
        />
      )}
      {requiredHierarchyFields.includes('hobli_id') && (
        <input
          type="text"
          placeholder="Hobli ID"
          name="hobli_id"
          value={hierarchy.hobli_id}
          onChange={onChange}
          required
          disabled={loading}
        />
      )}
      {requiredHierarchyFields.includes('village_id') && (
        <input
          type="text"
          placeholder="Village ID"
          name="village_id"
          value={hierarchy.village_id}
          onChange={onChange}
          required
          disabled={loading}
        />
      )}

      <button type="submit" disabled={loading}>
        {loading ? 'Creating User...' : 'Create User'}
      </button>
      </form>
    </div>
  );
};

export default CreateUserForm;
