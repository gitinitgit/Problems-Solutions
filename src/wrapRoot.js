import React from 'react'
import { AuthProvider } from './context/AuthContext'
import { TrackerProvider } from './hooks/useTracker'

export const wrapRootElement = ({ element }) => (
  <AuthProvider>
    <TrackerProvider>{element}</TrackerProvider>
  </AuthProvider>
)
