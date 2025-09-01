import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';

function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Error message mapping
  const getErrorMessage = (errorCode, defaultMessage) => {
    const errorMessages = {
      'MISSING_FIELDS': 'Please enter username and password',
      'INVALID_USERNAME': 'Username must be at least 3 characters',
      'INVALID_PASSWORD': 'Password must be at least 6 characters',
      'USERNAME_EXISTS': 'Username already exists, please choose another username',
      'SERVER_ERROR': 'Server error, please try again later',
      'NETWORK_ERROR': 'Network connection error, please check your connection',
      'TIMEOUT_ERROR': 'Request timeout, please check if backend server is running',
      'UNKNOWN_ERROR': 'Unknown error, please try again later'
    };
    
    return errorMessages[errorCode] || defaultMessage;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);
    
    try {
      const response = await api.post('/api/auth/register', { username, password });
      const data = response.data;
      if (response.status === 200) {
        setSuccess('Registration successful, redirecting to login...');
        setTimeout(() => navigate('/login'), 1500);
      } else {
        setError(data.message || 'Registration failed');
      }
    } catch (err) {
      console.error('Registration error:', err);
      
      // Handle different types of errors
      if (err.response && err.response.data) {
        const { error: errorCode, message } = err.response.data;
        setError(getErrorMessage(errorCode, message));
      } else if (err.code === 'ECONNABORTED') {
        setError(getErrorMessage('TIMEOUT_ERROR', 'Request timeout, please check if backend server is running'));
      } else if (err.code === 'ERR_NETWORK' || err.message === 'Network Error') {
        setError(getErrorMessage('NETWORK_ERROR', 'Network connection error, please check your connection'));
      } else if (err.message.includes('timeout')) {
        setError(getErrorMessage('TIMEOUT_ERROR', 'Connection timeout, server may be down or overloaded'));
      } else {
        setError(getErrorMessage('UNKNOWN_ERROR', `An unknown error occurred: ${err.message}`));
      }
    } finally {
      setIsLoading(false);
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
          disabled={isLoading}
          minLength={3}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          disabled={isLoading}
          minLength={6}
        />
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Registering...' : 'Register'}
        </button>
      </form>
      {error && (
        <div className="error-container">
          <p className="error">{error}</p>
          {error.includes('Network') || error.includes('timeout') || error.includes('server') ? (
            <p className="error-help">
              If the problem persists, please check:
              <br />• Backend server is running on port 5000
              <br />• Network connection is stable
              <br />• Try refreshing the page
            </p>
          ) : null}
        </div>
      )}
      {success && <p className="success">{success}</p>}
      <p>Already have an account? <Link to="/login">Login</Link></p>
    </div>
  );
}

export default Register; 