import React, { useState } from 'react'
import { Link } from 'gatsby'
import Layout from '../components/Layout'
import Bar from '../components/Bar'
import QuestionRow from '../components/QuestionRow'
import data from '../../content/questions.json'
import { useTracker } from '../hooks/useTracker'

export default function WeekTemplate({ pageContext, location }) {
  const wi = pageContext.week
  const { S, wDone, repracticeWeek } = useTracker()
  const [topic, setTopic] = useState('')
  const [hide, setHide] = useState(false)
  const [star, setStar] = useState(false)
  const qs = data.weeks[wi]
  const rows = qs.map((q, i) => [i, q]).filter(([i, q]) => {
    const k = wi + '-' + i
    return (!topic || data.topics[q.topic] === topic) && !(hide && S.done[k]) && (!star || S.solutions[k])
  })
  const doneCount = wDone(wi)
  const allDone = doneCount === qs.length && qs.length > 0
  const revCount = (S.revisions && S.revisions[wi]) || 0

  const handleRepractice = () => {
    const msg = allDone
      ? `Repractice Week ${wi + 1}?\n\n✓ All ${qs.length} question checkboxes will be unticked for a fresh practice round.\n✓ Revision count (${revCount}) is preserved.\n✓ All saved solutions and notes are 100% kept safe.`
      : `Untick all completed questions in Week ${wi + 1} to restart practice?\n\n✓ Revision count (${revCount}) is preserved.\n✓ All saved solutions and notes are 100% kept safe.`
    if (typeof window !== 'undefined' && window.confirm(msg)) {
      repracticeWeek(wi)
    }
  }

  let range = ''
  if (S.start) {
    const a = new Date(S.start), b = new Date(S.start)
    a.setUTCDate(a.getUTCDate() + wi * 7)
    b.setUTCDate(b.getUTCDate() + wi * 7 + 6)
    const f = (d) => d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' })
    range = ` · ${f(a)} – ${f(b)}`
  }
  const tps = [...new Set(qs.map((q) => q.topic))]
  return (
    <Layout location={location}>
      <h1>Weekly Tracker</h1>
      <div className="chips" style={{ marginTop: 14 }}>
        {data.weeks.map((w, i) => {
          const rev = (S.revisions && S.revisions[i]) || 0
          return (
            <Link key={i} to={`/week/${i + 1}/`} className={`chip ${i === wi ? 'on' : ''} ${wDone(i) === w.length ? 'ok' : ''}`}>
              W{i + 1}{rev > 0 ? ` · R${rev}` : ''}
            </Link>
          )
        })}
      </div>
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
          <div>
            <b className="mono">Week {wi + 1}</b>
            <span className="sm"> · {doneCount} / {qs.length} solved{range}</span>
          </div>
          {revCount > 0 && (
            <span className="pill" style={{ background: 'var(--pbg)', color: 'var(--ok)', fontWeight: 600 }}>
              ✓ {revCount} {revCount === 1 ? 'revision' : 'revisions'} completed
            </span>
          )}
        </div>
        <Bar a={doneCount} b={qs.length} cls="big" />
        <div className="wk">
          {tps.map((t) => (
            <span key={t} className="pill">{data.topics[t]} {qs.filter((q, i) => q.topic === t && S.done[wi + '-' + i]).length}/{qs.filter((q) => q.topic === t).length}</span>
          ))}
        </div>
      </div>

      {/* Revision Tag Bar */}
      <div className={`rev-bar ${allDone ? 'all-done' : ''}`}>
        <div className="rev-left">
          <span className="rev-badge">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 6, verticalAlign: '-1px' }}>
              <polyline points="23 4 23 10 17 10"></polyline>
              <polyline points="1 20 1 14 7 14"></polyline>
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
            </svg>
            Revision {revCount}
          </span>
          <span className="rev-info">
            {allDone ? (
              <span className="rev-ok">🎉 All {qs.length} completed! Revision count +1. Ready to repractice?</span>
            ) : revCount > 0 ? (
              <span>Round {revCount + 1} · {doneCount}/{qs.length} solved ({qs.length - doneCount} remaining)</span>
            ) : (
              <span>Solve all {qs.length} questions to achieve Revision 1</span>
            )}
          </span>
        </div>
        <div className="rev-right">
          {doneCount > 0 && (
            <button
              className={`repractice-btn ${allDone ? 'repractice-go' : ''}`}
              onClick={handleRepractice}
              title="Untick all questions in this week for a fresh practice run. All saved solutions are kept safe."
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 5, verticalAlign: '-1px' }}>
                <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/>
              </svg>
              {allDone ? 'Repractice & Refresh' : 'Reset Ticks'}
            </button>
          )}
        </div>
      </div>

      <div className="tools">
        <select value={topic} onChange={(e) => setTopic(e.target.value)} aria-label="Filter topic">
          <option value="">All topics</option>
          {data.topics.map((t) => <option key={t}>{t}</option>)}
        </select>
        <label><input type="checkbox" checked={hide} onChange={(e) => setHide(e.target.checked)} /> Hide solved</label>
        <label><input type="checkbox" checked={star} onChange={(e) => setStar(e.target.checked)} /> ✎ With solution</label>
        <span className="hint">Document icon = write a solution · orange icon = open on LeetCode.</span>
      </div>
      <div className="list">
        {rows.length ? rows.map(([i, q], n) => <QuestionRow key={i} k={wi + '-' + i} q={q} i={n} />) : <div className="card hint">Nothing here.</div>}
      </div>
    </Layout>
  )
}
