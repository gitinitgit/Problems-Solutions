import React, { useEffect } from 'react'
import { navigate } from 'gatsby'
import { useAuth } from '../context/AuthContext'
import AuthForms from '../components/AuthForms'

export default function Landing() {
  const { user, loading, login, register, continueAsGuest, error } = useAuth()

  // If already authenticated, redirect to home
  useEffect(() => {
    if (!loading && user) {
      navigate('/')
    }
  }, [user, loading])

  if (loading) {
    return (
      <div className="auth-loading">
        <div className="auth-spinner" />
      </div>
    )
  }

  if (user) return null

  const handleLogin = async (email, password) => {
    const ok = await login(email, password)
    if (ok) navigate('/')
  }

  const handleRegister = async (name, email, password) => {
    const ok = await register(name, email, password)
    if (ok) navigate('/')
  }

  return (
    <div className="landing">
      {/* Background particles */}
      <div className="landing-particles">
        {Array.from({ length: 20 }).map((_, i) => (
          <div key={i} className="particle" style={{ '--i': i }} />
        ))}
      </div>

      <div className="landing-inner">
        {/* Hero section */}
        <div className="landing-hero">
          <div className="landing-hero-img-wrap">
            <img
              src="/hero.jpg"
              alt="DSA Tracker – Master algorithms like a Top Gun"
              className="landing-hero-img"
            />
            <div className="landing-hero-overlay" />
          </div>
          <div className="landing-hero-content">
            <div className="landing-badge">⏱ DSA TRACKER</div>
            <h1 className="landing-title">
              Master <span className="landing-grad">Algorithms</span>
              <br />Like a Top Gun
            </h1>
            <p className="landing-desc">
              630 curated LeetCode problems. Weekly study plans. Track your progress,
              write solutions, crush interviews. Your data syncs to the cloud.
            </p>
            <div className="landing-stats-row">
              <div className="landing-stat">
                <span className="landing-stat-n">630</span>
                <span className="landing-stat-l">Problems</span>
              </div>
              <div className="landing-stat">
                <span className="landing-stat-n">21</span>
                <span className="landing-stat-l">Weeks</span>
              </div>
              <div className="landing-stat">
                <span className="landing-stat-n">15</span>
                <span className="landing-stat-l">Topics</span>
              </div>
              <div className="landing-stat">
                <span className="landing-stat-n">☁️</span>
                <span className="landing-stat-l">Cloud Sync</span>
              </div>
            </div>
          </div>
        </div>

        {/* Auth section */}
        <div className="landing-auth">
          <AuthForms
            onLogin={handleLogin}
            onRegister={handleRegister}
            onGuest={continueAsGuest}
            error={error}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="landing-footer">
        Built for serious problem solvers · Secure authentication · Cloud-synced progress
      </div>
    </div>
  )
}

export const Head = () => (
  <>
    <title>DSA Tracker – Master Algorithms Like a Top Gun</title>
    <meta name="description" content="630-question LeetCode study tracker with weekly plans, solution notes, and cloud sync. Track your DSA journey." />
  </>
)
