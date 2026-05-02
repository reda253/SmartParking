import React, { useState } from 'react';
import { ICar, IUser, IMail, ILock, IChev, IAlertTriangle } from '../../utils/icons.jsx';
import '../../styles/Auth.css';

export default function AuthPage({ onLogin }) {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [plate, setPlate] = useState('');
  const [role, setRole] = useState('user');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all required fields');
      return;
    }
    if (mode === 'signup' && !name) {
      setError('Please enter your full name');
      return;
    }

    // Simulate login
    onLogin({
      name: name || email.split('@')[0],
      email: email,
      role: role,
      plate: plate || 'XX-0000'
    });
  };

  return (
    <div className="auth-container">
      <div className="auth-glass-card">
        <div className="auth-header">
          <div className="auth-logo">
            <ICar size={32} stroke="white" sw={2} />
          </div>
          <h1 className="auth-title">ParkSense</h1>
          <p className="auth-subtitle">
            {mode === 'login' ? 'Welcome back. Sign in to your account.' : 'Join ParkSense and park smarter.'}
          </p>
        </div>

        <div className="auth-tabs">
          <button
            className={`auth-tab ${mode === 'login' ? 'active' : ''}`}
            onClick={() => { setMode('login'); setError(''); }}
          >
            Sign In
          </button>
          <button
            className={`auth-tab ${mode === 'signup' ? 'active' : ''}`}
            onClick={() => { setMode('signup'); setError(''); }}
          >
            Create Account
          </button>
        </div>

        {error && (
          <div className="auth-error">
            <IAlertTriangle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {mode === 'signup' && (
            <>
              <div className="auth-field">
                <label className="auth-label">Full Name</label>
                <div className="auth-input-wrapper">
                  <div className="auth-icon"><IUser size={18} /></div>
                  <input
                    className="auth-input"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="John Doe"
                  />
                </div>
              </div>
              <div className="auth-field">
                <label className="auth-label">License Plate (Optional)</label>
                <div className="auth-input-wrapper">
                  <div className="auth-icon"><ICar size={18} /></div>
                  <input
                    className="auth-input"
                    value={plate}
                    onChange={e => setPlate(e.target.value.toUpperCase())}
                    placeholder="XX-0000"
                  />
                </div>
              </div>
              <div className="auth-field">
                <label className="auth-label">Role</label>
                <div className="auth-input-wrapper">
                  <select
                    className="auth-input auth-select no-icon"
                    value={role}
                    onChange={e => setRole(e.target.value)}
                  >
                    <option value="user" style={{ color: 'black' }}>User</option>
                    <option value="admin" style={{ color: 'black' }}>Administrator</option>
                  </select>
                </div>
              </div>
            </>
          )}

          <div className="auth-field">
            <label className="auth-label">Email Address</label>
            <div className="auth-input-wrapper">
              <div className="auth-icon"><IMail size={18} /></div>
              <input
                className="auth-input"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="hello@example.com"
              />
            </div>
          </div>

          <div className="auth-field">
            <label className="auth-label">Password</label>
            <div className="auth-input-wrapper">
              <div className="auth-icon"><ILock size={18} /></div>
              <input
                className="auth-input"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
          </div>

          <button type="submit" className="auth-btn">
            {mode === 'login' ? 'Sign In' : 'Create Account'}
            <IChev size={20} sw={2.5} />
          </button>
        </form>
      </div>
    </div>
  );
}
