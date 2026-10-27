import React, { useState } from 'react'
import { Link } from 'gatsby'
import Layout from '../components/Layout'
import ProtectedRoute from '../components/ProtectedRoute'
import data from '../../content/questions.json'
import { useTracker } from '../hooks/useTracker'
import { md, langLabel, onCopyClick } from '../components/Markdown'

export default function Solutions({ location }) {
  const { S, set, deleteSolution } = useTracker()
  const [f, setF] = useState('')
  const items = Object.entries(S.solutions)
    .map(([k, s]) => { const [w, i] = k.split('-'); return { k, s, q: data.weeks[w][i] } })
    .filter(({ s, q }) => (s.title + q.title + q.n + s.tags.join(' ') + langLabel(s.lang)).toLowerCase().includes(f.toLowerCase()))
    .sort((a, b) => b.s.date.localeCompare(a.s.date))
  return (
    <ProtectedRoute><Layout location={location}>
      <h1>My Solutions</h1>
      <div className="tools"><input type="text" value={f} onChange={(e) => setF(e.target.value)} placeholder="Search title, tag, language…" aria-label="Search" /><span className="hint">{items.length} saved · write one from the document icon in the Weekly Tracker.</span></div>
      {!items.length && <div className="card hint">No solutions yet.</div>}
      {items.map(({ k, s, q }) => (
        <details className="card sc" key={k}>
          <summary><b>{s.title}</b> <span className="sm">LC {q.n} · {q.title} · {langLabel(s.lang)} · {s.date}</span><div className="wk">{s.tags.map((t) => <span className="pill" key={t}>{t}</span>)}</div></summary>
          <div className="prev" onClick={onCopyClick} dangerouslySetInnerHTML={{ __html: md(s.body) }} />
          <div className="pre">
            <Link className="chip" to={`/solution/?k=${k}`}>Edit</Link>
            <button className="dim" onClick={() => navigator.clipboard && navigator.clipboard.writeText(s.body)}>Copy markdown</button>
            <button className="dim" onClick={() => window.confirm('Delete this solution?') && (deleteSolution ? deleteSolution(k) : set('solutions', k))}>Delete</button>
          </div>
        </details>
      ))}
    </Layout></ProtectedRoute>
  )
}
