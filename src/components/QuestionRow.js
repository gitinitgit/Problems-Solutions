import React from 'react'
import { Link } from 'gatsby'
import data from '../../content/questions.json'
import { useTracker } from '../hooks/useTracker'

const LcIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 4 5.5 12.5a1.7 1.7 0 0 0 0 2.4L15 21" /><path d="M11 12h10" />
  </svg>
)
const SolIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 3h9l4 4v14H6z" /><path d="M14 3v5h5M9 13h6M9 17h4" />
  </svg>
)

export default function QuestionRow({ k, q, i = 0 }) {
  const { S, toggleDone, lastK } = useTracker()
  const d = S.done[k], has = S.solutions[k], pop = k === lastK
  return (
    <div className={`row${d ? ' done' : ''}${pop ? ' pop' : ''}`} style={pop ? undefined : { animationDelay: `${Math.min(i, 24) * 30}ms` }}>
      <input type="checkbox" checked={!!d} onChange={() => toggleDone(k)} aria-label="Mark done" />
      <span className="num">{q.n}</span>
      <span className="tt">{q.title}</span>
      <span className="pill">{data.topics[q.topic]}</span>
      <Link className={`lc sol${has ? ' has' : ''}`} to={`/solution/?k=${k}`} title={has ? 'Edit your solution' : 'Write a solution'} aria-label="Solution"><SolIcon /></Link>
      <a className="lc" href={q.url} target="_blank" rel="noopener noreferrer" title="Open on LeetCode" aria-label="Open on LeetCode"><LcIcon /></a>
    </div>
  )
}
