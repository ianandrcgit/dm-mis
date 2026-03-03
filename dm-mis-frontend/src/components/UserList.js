import React, { useState, useEffect } from 'react';

const UserList = ({ authToken, refreshKey, onUserDeleted, onEditUser }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [passwordInputs, setPasswordInputs] = useState({});
  const [passwordLoadingByUser, setPasswordLoadingByUser] = useState({});

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError('');
      try {
        if (!authToken) {
          throw new Error('Authentication token is missing.');
        }
        const response = await fetch('http://localhost:5000/api/users', {
          headers: {
            'Authorization': `Bearer ${authToken}`,
          },
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || 'Failed to fetch users.');
        }
        setUsers(Array.isArray(data) ? data : (data.data || []));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [authToken, refreshKey]); // Re-fetch when authToken or refreshKey changes

  const handleDelete = async (userId, userName) => {
    if (!window.confirm(`Are you sure you want to delete the user "${userName}"?`)) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to delete user.');
      }

      if (onUserDeleted) onUserDeleted(); // Notify parent to refresh list
    } catch (err) {
      setError(`Failed to delete user: ${err.message}`);
    }
  };

  const handlePasswordInputChange = (userId, value) => {
    setPasswordInputs((prev) => ({ ...prev, [userId]: value }));
  };

  const handlePasswordUpdate = async (userId) => {
    const nextPassword = (passwordInputs[userId] || '').trim();
    if (!nextPassword || nextPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setError('');
    setPasswordLoadingByUser((prev) => ({ ...prev, [userId]: true }));
    try {
      const response = await fetch(`http://localhost:5000/api/users/${userId}/password`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({ password: nextPassword }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update password.');
      }

      setPasswordInputs((prev) => ({ ...prev, [userId]: '' }));
    } catch (err) {
      setError(`Failed to update password: ${err.message}`);
    } finally {
      setPasswordLoadingByUser((prev) => ({ ...prev, [userId]: false }));
    }
  };

  if (loading) return <p>Loading users...</p>;
  if (error) return <div className="form-message error">{error}</div>;

  return (
    <div className="user-list-container">
      <h2>User List</h2>
      {users.length === 0 ? (
        <p>No users found.</p>
      ) : (
        <table className="user-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Hierarchy</th>
              <th>Set Password</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.role}</td>
                <td>
                  {user.hierarchy?.district_id && <div>D: {user.hierarchy.district_id}</div>}
                  {user.hierarchy?.taluka_id && <div>T: {user.hierarchy.taluka_id}</div>}
                  {user.hierarchy?.village_id && <div>V: {user.hierarchy.village_id}</div>}
                  {user.role === 'STATE_ADMIN' && 'State Level'}
                  {user.role === 'ADMIN' && 'System Admin'}
                </td>
                <td>
                  <input
                    type="password"
                    placeholder="New password"
                    value={passwordInputs[user._id] || ''}
                    onChange={(e) => handlePasswordInputChange(user._id, e.target.value)}
                    minLength={6}
                    style={{ marginBottom: '0.5rem' }}
                  />
                  <button
                    onClick={() => handlePasswordUpdate(user._id)}
                    disabled={!!passwordLoadingByUser[user._id]}
                    className="edit-button"
                  >
                    {passwordLoadingByUser[user._id] ? 'Saving...' : 'Update Password'}
                  </button>
                </td>
                <td>
                  <button onClick={() => onEditUser(user)} className="edit-button">
                    Edit
                  </button>
                  <button onClick={() => handleDelete(user._id, user.name)} className="delete-button">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default UserList;
