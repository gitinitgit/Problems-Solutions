import React from 'react'
import { Link } from 'gatsby'
import Layout from '../components/Layout'
import Bar from '../components/Bar'
import data from '../../content/questions.json'
import { useTracker } from '../hooks/useTracker'
import { topicSlug } from '../utils/slug'

export default function Concepts({ location }) {
  const { S, tStat, solCount } = useTracker()
  return (
    <Layout location={location}>
      <h1>Concepts</h1>
      <p className="hint">One module per topic: its problems, your solutions and a revised tick.</p>
      <div className="grid g3">
        {data.topics.map((t, i) => {
          const k = topicSlug(t), [a, b] = tStat(i)
          return (
            <Link key={t} className="card" to={`/concepts/${k}/`} style={{ animationDelay: `${i * 30}ms` }}>
              <b className="mono">{t}</b>
              <div className="sm">{S.revised[k] ? '✅ Revised' : 'Not revised'} · {a}/{b} solved · {solCount(i)} solutions</div>
              <Bar a={a} b={b} />
            </Link>
          )
        })}
      </div>
    </Layout>
  )
}
