import React, { useState } from 'react';
import { useHistory, Link } from 'react-router-dom';
import api from '../utils/api';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const history = useHistory();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await api.post('/api/auth/login', { username, password });
      const data = response.data;
      if (response.status === 200) {
        // Save token and user info to localStorage
        localStorage.setItem('token', data.token);
        localStorage.setItem('currentUser', JSON.stringify({ username: data.username }));
        history.push('/');
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      // Check if it's a response error with specific error message
      if (err.response && err.response.data && err.response.data.error) {
        setError(err.response.data.error);
      } else if (err.message === 'Network Error') {
        setError('Network error - Please check your connection');
      } else {
        setError('An unexpected error occurred');
      }
    }
  };
  return (
    <div className="auth-container">
      <div className="welcome-banner">Welcome to the RCTlab</div>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={e => setUsername(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        <button type="submit">Login</button>
      </form>
      {error && <p className="error">{error}</p>}
      <p>Don't have an account? <Link to="/register">Register</Link></p>
    </div>
  );
}

export default Login; 