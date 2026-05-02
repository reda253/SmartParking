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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all required fields');
      return;
    }
    if (mode === 'signup' && !name) {
      setError('Please enter your full name');
      return;
    }

    try {
      const endpoint = mode === 'signup' ? 'register' : 'login';
      const bodyPayload = mode === 'signup' ? { email, password, name, role } : { email, password };
      
      const res = await fetch(`http://127.0.0.1:8000/api/auth/${endpoint}/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyPayload)
      });
      
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Erreur serveur');
        return;
      }
      
      // Pass the real DB user back
      onLogin({
        id: data.id,
        name: data.name,
        email: data.email,
        role: data.role,
        plate: plate || 'XX-0000'
      });
    } catch (err) {
      setError('Erreur de connexion au serveur');
    }
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

        <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid var(--ink-200)' }}>
          <div style={{ fontSize: 13, color: 'var(--ink-500)', textAlign: 'center', marginBottom: 12, fontWeight: 700 }}>Test Rapide (1-Click Login)</div>
          <div className="row" style={{ gap: 8 }}>
            <button className="btn" style={{ flex: 1, background: 'var(--ink-100)', color: 'var(--ink-900)', fontSize: 13, padding: 8 }} onClick={(e) => { e.preventDefault(); onLogin({id: 1, name: 'Admin Testing', email: 'admin@demo.com', role: 'admin', plate: 'AD-1111'}); }}>
              Login Admin
            </button>
            <button className="btn" style={{ flex: 1, background: 'var(--ink-100)', color: 'var(--ink-900)', fontSize: 13, padding: 8 }} onClick={(e) => { e.preventDefault(); onLogin({id: 2, name: 'Client Testing', email: 'client@demo.com', role: 'user', plate: 'CL-9999'}); }}>
              Login Client
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
