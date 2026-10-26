import React, { useEffect, useRef, useState } from 'react'
import data from '../../content/questions.json'
import { useTracker } from '../hooks/useTracker'
import { today } from '../utils'

export default function Timer() {
  const { S, addSession } = useTracker()
  const [tot, setTot] = useState(1500)
  const [left, setLeft] = useState(1500)
  const [run, setRun] = useState(false)
  const [label, setLabel] = useState('')
  const end = useRef(0)

  useEffect(() => {
    if (!run) return
    end.current = Date.now() + left * 1000
    const id = setInterval(() => {
      const l = Math.round((end.current - Date.now()) / 1000)
      if (l <= 0) {
        clearInterval(id)
        setRun(false)
        addSession({ date: today(), min: Math.round(tot / 60), label })
        setLeft(tot)
      } else setLeft(l)
    }, 500)
    return () => clearInterval(id)
    // eslint-disable-next-line
  }, [run])

  const pick = (m) => { if (!run) { setTot(m * 60); setLeft(m * 60) } }
  const mm = String(Math.floor(left / 60)).padStart(2, '0'), ss = String(left % 60).padStart(2, '0')
  return (
    <div className="card">
      <div className="pre">{[10, 25, 40, 60].map((m) => <button key={m} className="dim" onClick={() => pick(m)}>{m} min</button>)}</div>
      <div className={`tmr ${run ? 'run' : ''}`}>{mm}:{ss}</div>
      <div className="pre">
        <button className="go" onClick={() => setRun(!run)}>{run ? 'Pause' : 'Start session'}</button>
        <button className="dim" onClick={() => { setRun(false); setLeft(tot) }}>Reset</button>
      </div>
      <select value={label} onChange={(e) => setLabel(e.target.value)} aria-label="Session topic">
        <option value="">General</option>
        {data.topics.map((t) => <option key={t}>{t}</option>)}
      </select>
      {S.sessions.slice(-4).reverse().map((x, i) => (
        <div key={i} className="sm" style={{ marginTop: 6 }}>{x.date} · {x.min} min · {x.label || 'General'}</div>
      ))}
    </div>
  )
}
