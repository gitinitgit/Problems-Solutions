import React from 'react'
import { Link } from 'gatsby'
import Layout from '../components/Layout'
import QuestionRow from '../components/QuestionRow'
import data from '../../content/questions.json'
import { useTracker } from '../hooks/useTracker'

export default function ConceptTemplate({ pageContext, location }) {
  const { topic, slug } = pageContext
  const { S, set, solCount } = useTracker()
  const qs = []
  data.weeks.forEach((w, wi) => w.forEach((q, i) => { if (q.topic === topic) qs.push([wi + '-' + i, q]) }))
  return (
    <Layout location={location}>
      <Link className="chip" to="/concepts/">← All topics</Link>
      <div className="tools" style={{ marginTop: 14 }}>
        <h1>{data.topics[topic]}</h1>
        <span className="hint">{solCount(topic)} solutions</span>
        <label style={{ marginLeft: 'auto' }}>
          <input type="checkbox" checked={!!S.revised[slug]} onChange={(e) => set('revised', slug, e.target.checked ? 1 : undefined)} /> Revised
        </label>
      </div>
      <h2>Problems ({qs.length})</h2>
      <div className="list">{qs.map(([k, q], n) => <QuestionRow key={k} k={k} q={q} i={n} />)}</div>
    </Layout>
  )
}
