import React, { useState, useEffect } from 'react';
import { buildApiUrl } from '../config/api';

const roleHierarchyRequirements = {
  ADMIN: [],
  STATE_ADMIN: [],
  DISTRICT_OFFICER: ['district_id'],
  TALUKA_OFFICER: ['district_id', 'taluka_id'],
  VILLAGE_OFFICER: ['district_id', 'taluka_id', 'village_id'],
};

const normalizeRole = (value) => {
  return (value || '').toString().trim().toUpperCase();
};

const EditUserModal = ({ user, authToken, onClose, onUserUpdated }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'VILLAGE_OFFICER',
    hierarchy: { district_id: '', taluka_id: '', village_id: '' },
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        role: normalizeRole(user.role),
        hierarchy: {
          district_id: user.hierarchy?.district_id || '',
          taluka_id: user.hierarchy?.taluka_id || '',
          village_id: user.hierarchy?.village_id || '',
        },
      });
    }
  }, [user]);

  if (!user) return null;

  const { name, email, role, hierarchy } = formData;

  const onChange = (e) => {
    const { name, value } = e.target;
    if (['district_id', 'taluka_id', 'village_id'].includes(name)) {
      setFormData((prev) => ({ ...prev, hierarchy: { ...prev.hierarchy, [name]: value } }));
    } else if (name === 'role') {
      setFormData((prev) => ({
        ...prev,
        role: value,
        hierarchy: { district_id: '', taluka_id: '', village_id: '' },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (!authToken) {
        throw new Error('Authentication token is missing.');
      }

      const response = await fetch(buildApiUrl(`/api/users/${user._id}`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify(formData),
      });

      let data = {};
      try {
        data = await response.json();
      } catch (parseError) {
        data = {};
      }

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update user.');
      }
      onUserUpdated();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const requiredHierarchyFields = roleHierarchyRequirements[role] || [];

  return (
    <div className="modal-overlay" onClick={() => !loading && onClose()}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <form onSubmit={onSubmit}>
          <h2>Edit User: {user.name}</h2>
          {error && <div className="form-message error">{error}</div>}
          
          <input type="text" placeholder="Name" name="name" value={name} onChange={onChange} required disabled={loading} />
          <input type="email" placeholder="Email" name="email" value={email} onChange={onChange} required disabled={loading} />

          <select name="role" value={role} onChange={onChange} disabled={loading}>
            <option value="ADMIN">Admin</option>
            <option value="STATE_ADMIN">State Admin</option>
            <option value="DISTRICT_OFFICER">District Officer</option>
            <option value="TALUKA_OFFICER">Taluka Officer</option>
            <option value="VILLAGE_OFFICER">Village Officer</option>
          </select>

          {requiredHierarchyFields.length > 0 && <h4>Hierarchy</h4>}
          {requiredHierarchyFields.includes('district_id') && (
            <input type="text" placeholder="District ID" name="district_id" value={hierarchy.district_id} onChange={onChange} required disabled={loading} />
          )}
          {requiredHierarchyFields.includes('taluka_id') && (
            <input type="text" placeholder="Taluka ID" name="taluka_id" value={hierarchy.taluka_id} onChange={onChange} required disabled={loading} />
          )}
          {requiredHierarchyFields.includes('village_id') && (
            <input type="text" placeholder="Village ID" name="village_id" value={hierarchy.village_id} onChange={onChange} required disabled={loading} />
          )}

          <div className="button-group">
            <button type="submit" disabled={loading}>{loading ? 'Updating...' : 'Update User'}</button>
            <button type="button" onClick={onClose} disabled={loading} className="cancel-button">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditUserModal;
