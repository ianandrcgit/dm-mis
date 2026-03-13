import React, { useEffect, useState } from 'react';
import { updateDisasterStatus } from './disasterService';
import { buildApiUrl, buildAssetUrl } from '../config/api';

const ROLE_WORKFLOW = {
  VILLAGE_OFFICER: {
    title: 'Beneficiary Reports',
    action: { from: 'DRAFT', to: 'REPORTED', label: 'Submit Draft' },
  },
  TALUKA_OFFICER: {
    title: 'Beneficiary Reports',
    action: { from: 'REPORTED', to: 'ACKNOWLEDGED', label: 'Approve' },
  },
  DISTRICT_OFFICER: {
    title: 'Beneficiary Reports',
    action: { from: 'ACKNOWLEDGED', to: 'IN_PROGRESS', label: 'Forward' },
  },
  STATE_ADMIN: {
    title: 'Beneficiary Reports',
    action: { from: 'IN_PROGRESS', to: 'RESOLVED', label: 'Resolve' },
  },
};

const formatLoginLabel = (value) => {
  if (!value) return 'N/A';
  return value.replace(/_/g, ' ');
};

const DisasterList = ({ authToken, refreshKey, userRole }) => {
  const [disasters, setDisasters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [actionError, setActionError] = useState('');
  const [internalRefreshKey, setInternalRefreshKey] = useState(0);

  const roleConfig = ROLE_WORKFLOW[userRole] || { title: 'Disaster Reports', action: null };

  useEffect(() => {
    const fetchDisasters = async () => {
      setLoading(true);
      setError('');
      try {
        if (!authToken) {
          throw new Error('Authentication token is missing.');
        }

        const response = await fetch(buildApiUrl('/api/disasters'), {
          headers: { Authorization: `Bearer ${authToken}` },
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || 'Failed to fetch disasters.');
        }

        setDisasters(data.data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDisasters();
  }, [authToken, refreshKey, internalRefreshKey]);

  const handleStatusAction = async (disasterId, targetStatus) => {
    setActionError('');
    setActionLoadingId(disasterId);
    try {
      await updateDisasterStatus(authToken, disasterId, targetStatus);
      setInternalRefreshKey((prev) => prev + 1);
    } catch (err) {
      setActionError(err.message || 'Failed to update status.');
    } finally {
      setActionLoadingId(null);
    }
  };

  if (loading) return <p>Loading disaster reports...</p>;
  if (error) return <div className="form-message error">{error}</div>;

  return (
    <div className="user-list-container">
      <h2>{roleConfig.title}</h2>
      {actionError && <div className="form-message error">{actionError}</div>}
      {disasters.length === 0 ? (
        <p>No reports found for this login.</p>
      ) : (
        <table className="user-table">
          <thead>
            <tr>
              <th>Type</th>
              <th>Loss Type</th>
              <th>Beneficiary</th>
              <th>Status</th>
              <th>Present In Login</th>
              <th>Submitted By</th>
              <th>Reported On</th>
              <th>Photo</th>
              {roleConfig.action && <th>Action</th>}
            </tr>
          </thead>
          <tbody>
            {disasters.map((disaster) => {
              const canAct = roleConfig.action && disaster.status === roleConfig.action.from;
              return (
                <tr key={disaster._id}>
                  <td>{disaster.type}</td>
                  <td>{disaster.loss_type}</td>
                  <td>{disaster.beneficiary?.name || 'N/A'}</td>
                  <td>{disaster.status}</td>
                  <td>{formatLoginLabel(disaster.current_login)}</td>
                  <td>{disaster.reported_by?.name || disaster.reported_by?.email || 'N/A'}</td>
                  <td>{new Date(disaster.createdAt).toLocaleDateString()}</td>
                  <td>
                    {disaster.photo_url ? (
                      <a href={buildAssetUrl(disaster.photo_url)} target="_blank" rel="noopener noreferrer">
                        <img src={buildAssetUrl(disaster.photo_url)} alt="Disaster" style={{ width: '50px', height: '50px', objectFit: 'cover' }} />
                      </a>
                    ) : 'No Photo'}
                  </td>
                  {roleConfig.action && (
                    <td>
                      <button
                        disabled={!canAct || actionLoadingId === disaster._id}
                        onClick={() => handleStatusAction(disaster._id, roleConfig.action.to)}
                      >
                        {actionLoadingId === disaster._id ? 'Processing...' : roleConfig.action.label}
                      </button>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default DisasterList;
