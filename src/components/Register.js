import React, { useState } from 'react';
import { useHistory, Link } from 'react-router-dom';

function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const history = useHistory();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!username || !password) {
      setError('Username and password cannot be empty');
      return;
    }
    try {
      const res = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Registration failed');
      } else {
        setSuccess('Registration successful, redirecting to login...');
        setTimeout(() => history.push('/login'), 1500);
      }
    } catch (err) {
      // Check if it's a network error or other type of error
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        setError('Network error - Please check your connection');
      } else {
        setError('An unexpected error occurred');
      }
    }
  };
  return (
    <div className="auth-container">
      <div className="welcome-banner">Welcome to the RCTlab</div>
      <h2>Register</h2>
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
        <button type="submit">Register</button>
      </form>
      {error && <p className="error">{error}</p>}
      {success && <p className="success">{success}</p>}
      <p>Already have an account? <Link to="/login">Login</Link></p>
    </div>
  );
}

export default Register; 