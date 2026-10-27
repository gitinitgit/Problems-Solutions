import React, { useState } from 'react'

export default function AuthForms({ onLogin, onRegister, onGuest, error }) {
  const [mode, setMode] = useState('login') // 'login' or 'signup'
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [localError, setLocalError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [showPw, setShowPw] = useState(false)

  const validate = () => {
    if (mode === 'signup' && !name.trim()) { setLocalError('Callsign name is required'); return false }
    if (!email.trim()) { setLocalError('Email is required'); return false }
    if (!/^\S+@\S+\.\S+$/.test(email)) { setLocalError('Please enter a valid email'); return false }
    if (password.length < 6) { setLocalError('Password must be at least 6 characters'); return false }
    if (mode === 'signup' && password !== confirm) { setLocalError('Passwords do not match'); return false }
    setLocalError('')
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setSubmitting(true)
    if (mode === 'login') {
      await onLogin(email.trim(), password)
    } else {
      await onRegister(name.trim(), email.trim(), password)
    }
    setSubmitting(false)
  }

  const displayError = localError || error

  return (
    <div className="auth-forms">
      <div className="auth-tabs">
        <button
          className={`auth-tab ${mode === 'login' ? 'active' : ''}`}
          onClick={() => { setMode('login'); setLocalError('') }}
          type="button"
        >
          Log In
        </button>
        <button
          className={`auth-tab ${mode === 'signup' ? 'active' : ''}`}
          onClick={() => { setMode('signup'); setLocalError('') }}
          type="button"
        >
          Sign Up
        </button>
      </div>

      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        {mode === 'signup' && (
          <div className="auth-field">
            <label htmlFor="auth-name">Callsign Name</label>
            <input
              id="auth-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. MAVERICK"
              autoComplete="nickname"
              maxLength={50}
            />
          </div>
        )}

        <div className="auth-field">
          <label htmlFor="auth-email">Email</label>
          <input
            id="auth-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
          />
        </div>

        <div className="auth-field">
          <label htmlFor="auth-password">Password</label>
          <div className="auth-pw-wrap">
            <input
              id="auth-password"
              type={showPw ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              minLength={6}
            />
            <button
              type="button"
              className="auth-pw-toggle"
              onClick={() => setShowPw(!showPw)}
              aria-label={showPw ? 'Hide password' : 'Show password'}
              tabIndex={-1}
            >
              {showPw ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/>
                  <line x1="1" y1="1" x2="23" y2="23"/>
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
              )}
            </button>
          </div>
        </div>

        {mode === 'signup' && (
          <div className="auth-field">
            <label htmlFor="auth-confirm">Confirm Password</label>
            <input
              id="auth-confirm"
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="••••••••"
              autoComplete="new-password"
            />
          </div>
        )}

        {displayError && <div className="auth-error">{displayError}</div>}

        <button className="auth-submit" type="submit" disabled={submitting}>
          {submitting ? (
            <><span className="auth-btn-spinner" /> {mode === 'login' ? 'Logging in…' : 'Creating account…'}</>
          ) : (
            mode === 'login' ? 'Log In' : 'Create Account'
          )}
        </button>
      </form>

      <p className="auth-switch">
        {mode === 'login' ? (
          <>Don't have an account? <button type="button" className="auth-switch-btn" onClick={() => { setMode('signup'); setLocalError('') }}>Sign up</button></>
        ) : (
          <>Already have an account? <button type="button" className="auth-switch-btn" onClick={() => { setMode('login'); setLocalError('') }}>Log in</button></>
        )}
      </p>

      {onGuest && (
        <div className="auth-guest-section">
          <div className="auth-divider">
            <span>OR</span>
          </div>
          <button
            type="button"
            className="auth-guest-btn"
            onClick={onGuest}
          >
            <span className="auth-guest-icon">⚡</span>
            <span>Continue without logging in</span>
            <span className="auth-guest-arrow">→</span>
          </button>
          <span className="auth-guest-note">
            Full access to all 630 problems · Saves locally in browser
          </span>
        </div>
      )}
    </div>
  )
}
