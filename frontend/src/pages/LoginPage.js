import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate   = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(username, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: 'linear-gradient(135deg, #0b1220 0%, #0f1e36 100%)', fontFamily: "'Inter',system-ui,sans-serif" }}>
      <div style={{ background: '#111827', border: '1px solid rgba(148,163,184,.18)', borderRadius: '1.25rem', padding: '2.5rem 2rem', width: '100%', maxWidth: 420, boxShadow: '0 24px 64px rgba(0,0,0,.45)' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
            <rect width="44" height="44" rx="13" fill="rgba(56,189,248,.12)" stroke="rgba(56,189,248,.3)" strokeWidth="1"/>
            <path d="M8 32L16 22L22 28L32 16" stroke="#38bdf8" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <h1 style={{ color: '#e5eefb', fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-.03em', textAlign: 'center', marginBottom: '.25rem' }}>Client Dashboard</h1>
        <p style={{ color: '#64748b', fontSize: '.875rem', textAlign: 'center', marginBottom: '1.75rem' }}>Sign in to view your project data.</p>
        {error && (
          <div style={{ background: 'rgba(239,68,68,.12)', border: '1px solid rgba(239,68,68,.3)', borderRadius: '.625rem', padding: '.75rem 1rem', color: '#fca5a5', fontSize: '.875rem', marginBottom: '1rem' }}>
            ⚠ {error}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <label style={{ display: 'block', color: '#94a3b8', fontSize: '.78rem', fontWeight: 600, marginBottom: '.4rem', textTransform: 'uppercase', letterSpacing: '.07em' }}>Client Name</label>
          <input
            style={{ width: '100%', background: '#0b1220', border: '1px solid rgba(148,163,184,.2)', borderRadius: '.625rem', padding: '.75rem 1rem', color: '#e2e8f0', fontSize: '1rem', marginBottom: '1rem', boxSizing: 'border-box', outline: 'none' }}
            value={username} onChange={e => setUsername(e.target.value)}
            placeholder="e.g. clientalpha" autoComplete="username" required
          />
          <label style={{ display: 'block', color: '#94a3b8', fontSize: '.78rem', fontWeight: 600, marginBottom: '.4rem', textTransform: 'uppercase', letterSpacing: '.07em' }}>Password</label>
          <input
            style={{ width: '100%', background: '#0b1220', border: '1px solid rgba(148,163,184,.2)', borderRadius: '.625rem', padding: '.75rem 1rem', color: '#e2e8f0', fontSize: '1rem', marginBottom: '1rem', boxSizing: 'border-box', outline: 'none' }}
            type="password" value={password} onChange={e => setPassword(e.target.value)}
            placeholder="same as client name" autoComplete="current-password" required
          />
          <button
            style={{ width: '100%', padding: '.85rem', background: '#0ea5e9', color: '#fff', border: 'none', borderRadius: '.75rem', fontSize: '1rem', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', marginTop: '.5rem', opacity: loading ? 0.7 : 1 }}
            type="submit" disabled={loading}
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
        <p style={{ color: '#334155', fontSize: '.78rem', textAlign: 'center', marginTop: '1.25rem' }}>Username and password are both your client name.</p>
      </div>
    </div>
  );
}
