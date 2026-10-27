import React, { createContext, useContext, useCallback, useEffect, useRef, useState } from 'react'
import data from '../../content/questions.json'
import { config } from '../config'
import { today } from '../utils'
import { useAuth } from '../context/AuthContext'

export const total = data.weeks.reduce((s, w) => s + w.length, 0)
const blank = { done: {}, solutions: {}, drafts: {}, revised: {}, revisions: {}, weekAwarded: {}, sessions: [], start: '', history: [] }
const Ctx = createContext(null)

const API = typeof window !== 'undefined'
  ? (process.env.GATSBY_API_URL || 'http://localhost:5000')
  : ''

export const TrackerProvider = ({ children }) => {
  const { user, loading: authLoading } = useAuth() || {}
  const [S, setS] = useState(blank)
  const [ready, setReady] = useState(false)
  const [lastK, setLastK] = useState('')
  const [toast, setToast] = useState('')
  const [syncing, setSyncing] = useState(false)
  const [syncError, setSyncError] = useState('')
  const syncTimer = useRef(null)
  const skipNextSync = useRef(false)
  const prevUserRef = useRef(null)

  // ── Debounced cloud sync — pushes to server 1.5s after last change ──
  const syncToCloud = useCallback(async (state) => {
    try {
      setSyncing(true)
      setSyncError('')
      const res = await fetch(`${API}/api/data`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ data: state }),
      })
      if (!res.ok) {
        const err = await res.json()
        if (res.status !== 401) {
          setSyncError(err.error || 'Sync failed')
        }
      }
    } catch (e) {
      // Silently fail — offline mode
    } finally {
      setSyncing(false)
    }
  }, [])

  // ── Auth & cloud sync lifecycle ──
  useEffect(() => {
    if (authLoading) return

    ;(async () => {
      if (user) {
        // User is logged in — pull from cloud
        try {
          const res = await fetch(`${API}/api/data`, { credentials: 'include' })
          if (res.ok) {
            const { data: cloudData } = await res.json()
            if (cloudData && typeof cloudData === 'object' && Object.keys(cloudData).length > 0) {
              const merged = {
                ...blank,
                ...cloudData,
                revisions: cloudData.revisions || {},
                weekAwarded: cloudData.weekAwarded || {},
              }
              setS(merged)
              skipNextSync.current = true
              try { localStorage.setItem(config.storageKey, JSON.stringify(merged)) } catch (e) {}
            } else {
              // Cloud is empty — check if local data has content to migrate
              let localData = blank
              try {
                const saved = JSON.parse(localStorage.getItem(config.storageKey) || '{}')
                if (saved && Object.keys(saved.done || {}).length > 0 || Object.keys(saved.solutions || {}).length > 0) {
                  localData = { ...blank, ...saved, revisions: saved.revisions || {}, weekAwarded: saved.weekAwarded || {} }
                  setS(localData)
                  // Push local data to cloud for new user
                  syncToCloud(localData)
                }
              } catch (e) {}
            }
          }
        } catch (e) {
          // Offline mode — load local data
          try {
            const saved = JSON.parse(localStorage.getItem(config.storageKey) || '{}')
            setS({ ...blank, ...saved, revisions: saved?.revisions || {}, weekAwarded: saved?.weekAwarded || {} })
          } catch (err) {}
        }
      } else {
        // User logged out
        if (prevUserRef.current) {
          setS(blank)
          try { localStorage.removeItem(config.storageKey) } catch (e) {}
        } else {
          // Initial unauthenticated visitor
          try {
            const saved = JSON.parse(localStorage.getItem(config.storageKey) || '{}')
            setS({ ...blank, ...saved, revisions: saved?.revisions || {}, weekAwarded: saved?.weekAwarded || {} })
          } catch (e) {}
        }
      }

      prevUserRef.current = user
      setReady(true)
    })()
  }, [user, authLoading, syncToCloud])

  // ── Persist to localStorage on every change ───────────────────
  useEffect(() => {
    if (ready) {
      try { localStorage.setItem(config.storageKey, JSON.stringify(S)) } catch (e) {}
    }
  }, [S, ready])

  // ── Debounced auto-sync to cloud on state changes ──
  useEffect(() => {
    if (!ready || !user) return
    if (skipNextSync.current) {
      skipNextSync.current = false
      return
    }
    if (syncTimer.current) clearTimeout(syncTimer.current)
    syncTimer.current = setTimeout(() => {
      syncToCloud(S)
    }, 1500)
    return () => { if (syncTimer.current) clearTimeout(syncTimer.current) }
  }, [S, ready, user, syncToCloud])

  // ── Auto-award revision 1 for any week already 100% completed ──
  useEffect(() => {
    if (!ready) return
    let updated = false
    const revs = { ...(S.revisions || {}) }
    const awd = { ...(S.weekAwarded || {}) }
    data.weeks.forEach((w, wi) => {
      const doneCount = w.filter((_, i) => S.done[wi + '-' + i]).length
      if (doneCount === w.length && w.length > 0) {
        if (!revs[wi]) {
          revs[wi] = 1
          awd[wi] = true
          updated = true
        }
      }
    })
    if (updated) {
      setS((s) => ({ ...s, revisions: revs, weekAwarded: awd }))
    }
  }, [ready])

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(''), 3500)
    return () => clearTimeout(t)
  }, [toast])

  // set one key inside a map field; empty value deletes it
  const set = (field, k, v) =>
    setS((s) => {
      const o = { ...s[field] }
      if (v === undefined || v === '') delete o[k]
      else o[k] = v
      return { ...s, [field]: o }
    })

  const wDone = (wi) => data.weeks[wi].filter((_, i) => S.done[wi + '-' + i]).length
  const tStat = (ti) => {
    let a = 0, b = 0
    data.weeks.forEach((w, wi) => w.forEach((q, i) => { if (q.topic === ti) { b++; if (S.done[wi + '-' + i]) a++ } }))
    return [a, b]
  }
  const solCount = (ti) => Object.keys(S.solutions).filter((k) => { const [w, i] = k.split('-'); return data.weeks[w][i].topic === ti }).length
  const solved = Object.keys(S.done).length
  const curWeek = S.start
    ? Math.min(data.weeks.length - 1, Math.max(0, Math.floor((new Date(today()) - new Date(S.start)) / 6048e5)))
    : 0

  const toggleDone = (k) => {
    setLastK(k)
    if (S.done[k]) return set('done', k)
    const wi = +k.split('-')[0]
    const weekTotal = data.weeks[wi].length
    const inWeek = data.weeks[wi].filter((_, i) => S.done[wi + '-' + i] || wi + '-' + i === k).length

    if (inWeek === weekTotal) {
      if (!S.weekAwarded?.[wi]) {
        const nextRev = ((S.revisions && S.revisions[wi]) || 0) + 1
        setS((s) => ({
          ...s,
          done: { ...s.done, [k]: today() },
          revisions: { ...(s.revisions || {}), [wi]: nextRev },
          weekAwarded: { ...(s.weekAwarded || {}), [wi]: true },
        }))
        if (solved + 1 === total) setToast('Plan complete! 🏆')
        else setToast(`Week ${wi + 1} complete 🎉 · Revision ${nextRev} achieved!`)
        return
      }
    }

    set('done', k, today())
    if (solved + 1 === total) setToast('Plan complete! 🏆')
    else if (inWeek === weekTotal) setToast(`Week ${wi + 1} complete 🎉`)
  }

  // unticks all questions for this week so user can practice again.
  // Revisions count, saved solutions, and drafts are 100% kept safe!
  const repracticeWeek = (wi) => {
    setS((s) => {
      const nextDone = { ...s.done }
      data.weeks[wi].forEach((_, i) => {
        delete nextDone[wi + '-' + i]
      })
      return {
        ...s,
        done: nextDone,
        weekAwarded: { ...(s.weekAwarded || {}), [wi]: false },
      }
    })
    setToast(`Week ${wi + 1} refreshed for repractice! Solutions preserved.`)
  }

  // Save solution & notes with immediate cloud sync
  const saveSolution = useCallback(async (k, solData) => {
    let nextState
    setS((s) => {
      const nextDrafts = { ...(s.drafts || {}) }
      delete nextDrafts[k]
      nextState = {
        ...s,
        solutions: { ...(s.solutions || {}), [k]: solData },
        drafts: nextDrafts,
      }
      return nextState
    })
    try {
      if (nextState) localStorage.setItem(config.storageKey, JSON.stringify(nextState))
    } catch (e) {}
    setToast('Solution & notes saved to cloud ☁️')
    if (nextState && user) {
      await syncToCloud(nextState)
    }
  }, [user, syncToCloud])

  // Delete solution and sync to cloud
  const deleteSolution = useCallback(async (k) => {
    let nextState
    setS((s) => {
      const nextSol = { ...(s.solutions || {}) }
      delete nextSol[k]
      nextState = { ...s, solutions: nextSol }
      return nextState
    })
    try {
      if (nextState) localStorage.setItem(config.storageKey, JSON.stringify(nextState))
    } catch (e) {}
    setToast('Solution deleted')
    if (nextState && user) {
      await syncToCloud(nextState)
    }
  }, [user, syncToCloud])

  // Force sync now (useful after import or reset)
  const forceSync = useCallback(() => {
    syncToCloud(S)
  }, [S, syncToCloud])

  const value = {
    S, ready, set, toggleDone, repracticeWeek, lastK, wDone, tStat, solved, curWeek, solCount,
    syncing, syncError, forceSync, saveSolution, deleteSolution,
    setStart: (start) => setS((s) => ({ ...s, start })),
    addSession: (x) => setS((s) => ({ ...s, sessions: [...s.sessions, x] })),
    importData: (o) => setS((s) => ({ ...s, ...o })),
    // archive current tracking into history, then clear it. Solutions + drafts are untouched.
    restart: () => setS((s) => {
      const ds = Object.values(s.done).sort()
      if (!ds.length && !s.sessions.length) return { ...s, start: '' }
      const run = { id: Date.now(), from: ds[0] || today(), to: today(), start: s.start, solved: ds.length, done: s.done, sessions: s.sessions, revised: s.revised, revisions: s.revisions }
      return { ...s, history: [...(s.history || []), run], done: {}, sessions: [], revised: {}, revisions: {}, weekAwarded: {}, start: '' }
    }),
    reset: () => { try { localStorage.removeItem(config.storageKey) } catch (e) {} setS(blank) },
  }
  return (
    <Ctx.Provider value={value}>
      {children}
      {toast && <div className="toast">{toast}</div>}
    </Ctx.Provider>
  )
}
export const useTracker = () => useContext(Ctx)
