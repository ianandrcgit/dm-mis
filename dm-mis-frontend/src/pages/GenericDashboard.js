import React from 'react';
import { useAuth } from '../context/AuthContext';
import DisasterList from '../components/DisasterList';
import './Dashboard.css';

const GenericDashboard = () => {
  const { user, token, logout } = useAuth();

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div>
          <h1>{user?.role.replace(/_/g, ' ')} Dashboard</h1>
          <p className="welcome-text">
            Welcome, {user?.name} | District: {user?.hierarchy?.district_id || 'N/A'}, Taluka: {user?.hierarchy?.taluka_id || 'N/A'}
          </p>
        </div>
        <button onClick={logout} className="logout-button">Logout</button>
      </header>
      <main>
        <DisasterList authToken={token} />
      </main>
    </div>
  );
};

export default GenericDashboard;