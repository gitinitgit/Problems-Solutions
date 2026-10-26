import React, { useEffect, useRef, useState } from 'react'
import { Link, navigate } from 'gatsby'
import { config } from '../config'
import ThemeToggle from './ThemeToggle'

export default function Layout({ location, wide, children }) {
  const p = (location && location.pathname) || (typeof window !== 'undefined' ? window.location.pathname : '/')
  const isForwardPage = p !== '/' && p !== ''
  const [hidden, setHidden] = useState(false)
  const lastY = useRef(0)

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
            <ThemeToggle />
          </div>
        </div>
      </nav>
      <main className={wide ? 'wide' : ''}>{children}</main>
    </>
  )
}

