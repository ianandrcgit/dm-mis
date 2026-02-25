import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import CreateUserForm from '../components/CreateUserForm';
import UserList from '../components/UserList';
import EditUserModal from '../components/EditUserModal';
import './Dashboard.css';

const DashboardPage = () => {
  const { user, token, logout } = useAuth();
  const [userListKey, setUserListKey] = useState(0); // State to trigger user list refresh
  const [editingUser, setEditingUser] = useState(null); // State for the user being edited

  const handleUserChange = () => {
    // This single handler will refresh the list for any change (create, update, delete)
    setUserListKey(prevKey => prevKey + 1);
  };

  const handleEditClick = (userToEdit) => {
    setEditingUser(userToEdit);
  };

  const handleCloseModal = () => {
    setEditingUser(null);
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div>
          <h1>Admin Dashboard</h1>
          <p className="welcome-text">Welcome, {user?.name} ({user?.email})</p>
        </div>
        <button onClick={logout} className="logout-button">Logout</button>
      </header>
      <main className="dashboard-content">
        <CreateUserForm authToken={token} onUserCreated={handleUserChange} />
        <UserList authToken={token} refreshKey={userListKey} onUserDeleted={handleUserChange} onEditUser={handleEditClick} />
      </main>
      {editingUser && (
        <EditUserModal user={editingUser} authToken={token} onClose={handleCloseModal} onUserUpdated={handleUserChange} />
      )}
    </div>
  );
};

export default DashboardPage;