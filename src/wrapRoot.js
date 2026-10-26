import React from 'react'
import { TrackerProvider } from './hooks/useTracker'

export const wrapRootElement = ({ element }) => <TrackerProvider>{element}</TrackerProvider>
