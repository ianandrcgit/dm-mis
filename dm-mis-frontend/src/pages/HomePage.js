import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './HomePage.css';
import { loginUser } from '../context/authService';
import './LoginPage.css'; // Reuse login form styles

const HomePage = () => {
  const [role, setRole] = useState('ADMIN');
  const [email, setEmail] = useState('admin@karnataka.gov.in');
  const [password, setPassword] = useState('admin_password_123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const normalizeRole = (value) => (value || '').toString().trim().toUpperCase();

  const getRedirectPath = (userRole) => {
    switch (userRole) {
      case 'ADMIN':
        return '/dashboard';
      case 'STATE_ADMIN':
        return '/generic-dashboard';
      case 'DISTRICT_OFFICER':
      case 'TALUKA_OFFICER':
        return '/generic-dashboard';
      case 'VILLAGE_OFFICER':
        return '/village-dashboard';
      default:
        return '/';
    }
  };

  const handleRoleChange = (e) => {
    const newRole = e.target.value;
    setRole(newRole);
    // Pre-fill credentials for Admin for convenience
    if (newRole === 'ADMIN') {
      setEmail('admin@karnataka.gov.in');
      setPassword('admin_password_123');
    } else {
      setEmail('');
      setPassword('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await loginUser(email, password);

      const selectedRole = normalizeRole(role);
      const actualRole = normalizeRole(data?.user?.role);

      if (actualRole !== selectedRole) {
        throw new Error(`Access Denied: selected "${selectedRole}" but account is "${actualRole}".`);
      }

      login({ ...data.user, role: actualRole }, data.token);
      navigate(getRedirectPath(actualRole));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home-page">
      <div className="home-layout">
        <div className="title-card">
          <p className="subtitle">Government of Karnataka</p>
          <h1>Disaster Management MIS</h1>
          <p className="description">
            A centralized Management Information System to streamline communication,
            resource allocation, and response efforts during critical events across the state.
          </p>
        </div>
        <div className="login-section">
          <div className="login-container">
            <h2>DM-MIS Login</h2>
            {error && <p className="error-message">{error}</p>}
            <form onSubmit={handleSubmit}>
              <label htmlFor="user-type" style={{ textAlign: 'left', display: 'block', marginBottom: '5px' }}>User Type</label>
              <select id="user-type" value={role} onChange={handleRoleChange} disabled={loading} style={{ marginBottom: '1rem' }}>
                <option value="ADMIN">Admin</option>
                <option value="STATE_ADMIN">State Admin</option>
                <option value="DISTRICT_OFFICER">District Officer</option>
                <option value="TALUKA_OFFICER">Taluka Officer</option>
                <option value="VILLAGE_OFFICER">Village Officer (VAO)</option>
              </select>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required disabled={loading} />
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required disabled={loading} />
              <button type="submit" disabled={loading}>
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
