import React, { useEffect, useRef, useState } from 'react'
import { Link, navigate } from 'gatsby'
import { config } from '../config'
import ThemeToggle from './ThemeToggle'
import { useAuth } from '../context/AuthContext'
import { useTracker } from '../hooks/useTracker'

export default function Layout({ location, wide, children }) {
  const p = (location && location.pathname) || (typeof window !== 'undefined' ? window.location.pathname : '/')
  const isForwardPage = p !== '/' && p !== ''
  const [hidden, setHidden] = useState(false)
  const lastY = useRef(0)
  const auth = useAuth()
  const tracker = useTracker()

  useEffect(() => {
    let ticking = false
    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const y = Math.max(0, window.scrollY || window.pageYOffset || 0)
          if (y <= 20) {
            setHidden(false)
          } else if (y > lastY.current + 6 && y > 60) {
            setHidden(true)
          } else if (y < lastY.current - 6) {
            setHidden(false)
          }
          lastY.current = y
          ticking = false
        })
        ticking = true
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const goBack = (e) => {
    e.preventDefault()
    if (typeof window !== 'undefined' && window.history.length > 1) {
      window.history.back()
    } else {
      navigate('/')
    }
  }

  return (
    <>
      <nav className={hidden ? 'nav-hidden' : ''}>
        <div className={`nav-inner ${wide ? 'wide' : ''}`}>
          {isForwardPage && (
            <button className="nav-back" onClick={goBack} title="Go back" aria-label="Go back">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
            </button>
          )}
          <Link to="/" className="nav-brand">⏱ {config.title}</Link>
          <div className="nav-links">
            {config.nav.map(([to, label, m]) => (
              <Link key={to} to={to} className={(m === '/' ? p === '/' : p.startsWith(m)) ? 'on' : ''}>{label}</Link>
            ))}
          </div>
          <div className="nav-right">
            {tracker?.syncing && (
              <span className="sync-indicator" title="Syncing to cloud…">
                <svg className="sync-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="23 4 23 10 17 10" />
                  <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                </svg>
              </span>
            )}
            {auth?.user ? (
              <div className="nav-user">
                <span className="nav-user-name" title={auth.user.email}>
                  {auth.user.name?.charAt(0).toUpperCase()}
                </span>
                <button className="nav-logout" onClick={auth.logout} title="Log out" aria-label="Log out">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
                  </svg>
                </button>
              </div>
            ) : auth?.isGuest ? (
              <Link to="/landing/" className="nav-guest-pill" title="Guest Mode: progress saved locally. Click to log in for cloud sync">
                <span className="hide-s">Guest · </span>Log In
              </Link>
            ) : null}
            <ThemeToggle />
          </div>
        </div>
      </nav>
      <main className={wide ? 'wide' : ''}>{children}</main>
    </>
  )
}
