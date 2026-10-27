import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { navigate } from 'gatsby'

const API = process.env.GATSBY_API_URL || 'http://localhost:5000'
const AuthCtx = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [isGuest, setIsGuest] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Clear error after 5s
  useEffect(() => {
    if (!error) return
    const t = setTimeout(() => setError(''), 5000)
    return () => clearTimeout(t)
  }, [error])

  // Check session on mount
  useEffect(() => {
    ;(async () => {
      try {
        const guestSaved = typeof window !== 'undefined' && localStorage.getItem('dsa-guest-mode') === 'true'
        if (guestSaved) {
          setIsGuest(true)
        }
        const res = await fetch(`${API}/api/auth/me`, { credentials: 'include' })
        if (res.ok) {
          const { user: u } = await res.json()
          setUser(u)
          setIsGuest(false)
        }
      } catch (e) {
        // Not authenticated, that's fine
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const continueAsGuest = useCallback(() => {
    try {
      localStorage.setItem('dsa-guest-mode', 'true')
    } catch (e) {}
    setIsGuest(true)
    navigate('/')
  }, [])

  const register = useCallback(async (name, email, password) => {
    setError('')
    try {
      const res = await fetch(`${API}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name, email, password }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Registration failed')
        return false
      }
      try { localStorage.removeItem('dsa-guest-mode') } catch (e) {}
      setIsGuest(false)
      setUser(data.user)
      return true
    } catch (e) {
      setError('Network error. Please check your connection.')
      return false
    }
  }, [])

  const login = useCallback(async (email, password) => {
    setError('')
    try {
      const res = await fetch(`${API}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Login failed')
        return false
      }
      try { localStorage.removeItem('dsa-guest-mode') } catch (e) {}
      setIsGuest(false)
      setUser(data.user)
      return true
    } catch (e) {
      setError('Network error. Please check your connection.')
      return false
    }
  }, [])

  const logout = useCallback(async () => {
    try {
      await fetch(`${API}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      })
    } catch (e) {
      // Logout even if request fails
    }
    setUser(null)
    setIsGuest(false)
    try { localStorage.removeItem('dsa-guest-mode') } catch (e) {}
    navigate('/landing/')
  }, [])

  const value = { user, isGuest, loading, error, setError, login, register, logout, continueAsGuest, API }

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>
}

export const useAuth = () => useContext(AuthCtx)
export { API }
