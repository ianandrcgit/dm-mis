import React, { useState, useEffect } from 'react';

const UserList = ({ authToken, refreshKey, onUserDeleted, onEditUser }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
        setUsers(data);
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
                  {user.hierarchy?.hobli_id && <div>H: {user.hierarchy.hobli_id}</div>}
                  {user.hierarchy?.village_id && <div>V: {user.hierarchy.village_id}</div>}
                  {(user.role === 'ADMIN' || user.role === 'STATE_OFFICER') && 'State Level'}
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