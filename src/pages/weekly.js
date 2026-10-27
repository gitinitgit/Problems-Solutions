import React, { useEffect } from 'react'
import { navigate } from 'gatsby'
import { useTracker } from '../hooks/useTracker'
import ProtectedRoute from '../components/ProtectedRoute'

// /weekly/ jumps to your current week
export default function Weekly() {
  const { ready, curWeek } = useTracker()
  useEffect(() => { if (ready) navigate(`/week/${curWeek + 1}/`, { replace: true }) }, [ready, curWeek])
  return (
    <ProtectedRoute>
      <div className="auth-loading">
        <div className="auth-spinner" />
      </div>
    </ProtectedRoute>
  )
}

