import React, { useState } from 'react';
import axios from 'axios';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', { email, password });
      alert('Login Successful! Welcome ' + res.data.user.name);
      localStorage.setItem('token', res.data.token);
      // window.location.href = '/dashboard'; 
    } catch (err) {
      // show server error if provided, otherwise generic message
      const msg = err.response && err.response.data && err.response.data.message
        ? err.response.data.message
        : 'Login failed. Check if backend is running on port 5000.';
      setError(msg);
    }
  };

  return (
    <div style={{ padding: '50px' }}>
      <h2>Karnataka DM-MIS Login</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleLogin}>
        <input type="email" placeholder="Email" onChange={(e) => setEmail(e.target.value)} /><br/>
        <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} /><br/>
        <button type="submit">Sign in</button>
      </form>
    </div>
  );
};

export default Login;