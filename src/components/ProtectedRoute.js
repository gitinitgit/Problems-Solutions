import React, { useEffect } from 'react'
import { navigate } from 'gatsby'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ children }) {
  const { user, isGuest, loading } = useAuth()

  useEffect(() => {
    if (!loading && !user && !isGuest) {
      navigate('/landing/')
    }
  }, [user, isGuest, loading])

  if (loading) {
    return (
      <div className="auth-loading">
        <div className="auth-spinner" />
        <span>Loading…</span>
      </div>
    )
  }

  if (!user && !isGuest) return null

  return <>{children}</>
}
