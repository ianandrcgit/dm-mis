import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import DisasterEntryForm from '../components/DisasterEntryForm';
import DisasterList from '../components/DisasterList';
import './Dashboard.css'; // Reusing the same professional styles

const VillageOfficerDashboard = () => {
  const { user, token, logout } = useAuth();
  const [disasterListKey, setDisasterListKey] = useState(0);

  const handleDisasterReported = () => {
    // This will refresh the list of disasters
    setDisasterListKey(prevKey => prevKey + 1);
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div>
          <h1>Village Officer Dashboard</h1>
          <p className="welcome-text">
            Welcome, {user?.name} | District: {user?.hierarchy?.district_id}, Taluka: {user?.hierarchy?.taluka_id}, Hobli: {user?.hierarchy?.hobli_id}, Village: {user?.hierarchy?.village_id}
          </p>
        </div>
        <button onClick={logout} className="logout-button">Logout</button>
      </header>
      <main className="dashboard-content">
        <DisasterEntryForm authToken={token} onDisasterReported={handleDisasterReported} />
        <DisasterList authToken={token} refreshKey={disasterListKey} userRole={user?.role} />
      </main>
    </div>
  );
};

export default VillageOfficerDashboard;
