import React, { createContext, useContext, useEffect, useState } from 'react'
import data from '../../content/questions.json'
import { config } from '../config'
import { today } from '../utils'

export const total = data.weeks.reduce((s, w) => s + w.length, 0)
const blank = { done: {}, solutions: {}, drafts: {}, revised: {}, revisions: {}, weekAwarded: {}, sessions: [], start: '', history: [] }
const Ctx = createContext(null)

export const TrackerProvider = ({ children }) => {
  const [S, setS] = useState(blank)
  const [ready, setReady] = useState(false)
  const [lastK, setLastK] = useState('')
  const [toast, setToast] = useState('')

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(config.storageKey) || '{}')
      setS((s) => ({
        ...s,
        ...saved,
        revisions: saved.revisions || {},
        weekAwarded: saved.weekAwarded || {},
      }))
    } catch (e) {}
    setReady(true)
  }, [])
  useEffect(() => {
    if (ready) try { localStorage.setItem(config.storageKey, JSON.stringify(S)) } catch (e) {}
  }, [S, ready])

  // auto-award revision 1 for any week already 100% completed
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

  const value = {
    S, ready, set, toggleDone, repracticeWeek, lastK, wDone, tStat, solved, curWeek, solCount,
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
