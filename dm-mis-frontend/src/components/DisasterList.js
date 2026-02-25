import React, { useState, useEffect } from 'react';

const DisasterList = ({ authToken, refreshKey }) => {
  const [disasters, setDisasters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDisasters = async () => {
      setLoading(true);
      setError('');
      try {
        if (!authToken) {
          throw new Error('Authentication token is missing.');
        }
        const response = await fetch('http://localhost:5000/api/disasters', {
          headers: {
            'Authorization': `Bearer ${authToken}`,
          },
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || 'Failed to fetch disasters.');
        }
        setDisasters(data.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDisasters();
  }, [authToken, refreshKey]);

  if (loading) return <p>Loading disaster reports...</p>;
  if (error) return <div className="form-message error">{error}</div>;

  return (
    <div className="user-list-container">
      <h2>My Reported Disasters</h2>
      {disasters.length === 0 ? (
        <p>No disasters reported yet.</p>
      ) : (
        <table className="user-table">
          <thead>
            <tr>
              <th>Type</th>
              <th>Loss Type</th>
              <th>Beneficiary</th>
              <th>Status</th>
              <th>Reported On</th>
              <th>Photo</th>
            </tr>
          </thead>
          <tbody>
            {disasters.map((disaster) => (
              <tr key={disaster._id}>
                <td>{disaster.type}</td>
                <td>{disaster.loss_type}</td>
                <td>{disaster.beneficiary?.name || 'N/A'}</td>
                <td>{disaster.status}</td>
                <td>{new Date(disaster.createdAt).toLocaleDateString()}</td>
                <td>
                  {disaster.photo_url ? (
                    <a href={`http://localhost:5000${disaster.photo_url}`} target="_blank" rel="noopener noreferrer">
                      <img src={`http://localhost:5000${disaster.photo_url}`} alt="Disaster" style={{ width: '50px', height: '50px', objectFit: 'cover' }} />
                    </a>
                  ) : 'No Photo'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default DisasterList;