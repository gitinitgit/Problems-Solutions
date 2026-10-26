import React, { useRef } from 'react'
import { Link } from 'gatsby'
import Layout from '../components/Layout'
import Bar from '../components/Bar'
import CountUp from '../components/CountUp'
import Timer from '../components/Timer'
import Heatmap from '../components/Heatmap'
import data from '../../content/questions.json'
import { useTracker, total } from '../hooks/useTracker'
import { fmt, streak, today } from '../utils'
import { topicSlug } from '../utils/slug'

export default function Dashboard({ location }) {
  const { S, wDone, tStat, solved: s, curWeek: cw, setStart, importData, reset, restart } = useTracker()
  const file = useRef()
  const td = Object.values(S.done).filter((d) => d === today()).length
  const mins = S.sessions.reduce((a, x) => a + x.min, 0)
  const pc = Math.round((100 * s) / total)
  const tmn = (t) => S.sessions.filter((x) => x.label === t).reduce((a, x) => a + x.min, 0)
  const exportData = () => {
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([JSON.stringify(S)], { type: 'application/json' }))
    a.download = 'dsa-tracker-backup.json'
    a.click()
  }
  const onImport = (e) => {
    const f = e.target.files[0]
    if (f) f.text().then((t) => { try { importData(JSON.parse(t)) } catch (x) { alert('Invalid file') } })
  }

  return (
    <Layout location={location}>
      {/* ── Top row: Ring + Stats (LeetCode-style compact) ──────────── */}
      <div className="dash-top">
        <div className="dash-ring">
          <svg viewBox="0 0 120 120">
            <circle className="ring-bg" cx="60" cy="60" r="46" fill="none" strokeWidth="8" />
            <circle className="ring-fg" cx="60" cy="60" r="46" fill="none" strokeWidth="8" style={{ '--c': '289.0', '--o': (289.0 * (1 - s / total)).toFixed(1) }} />
          </svg>
          <div className="dash-ring-label">
            <span className="dash-ring-n"><CountUp n={s} /></span>
            <span className="dash-ring-t">/{total}</span>
            <span className="dash-ring-sub">Solved</span>
          </div>
        </div>
        <div className="dash-stats">
          <div className="ds"><b>{pc}%</b><span>complete</span></div>
          <div className="ds"><b>{wDone(cw)}/{data.weeks[cw].length}</b><span>week {cw + 1}</span></div>
          <div className="ds"><b><CountUp n={td} /></b><span>today</span></div>
          <div className="ds"><b><CountUp n={streak(S.done)} /></b><span>streak</span></div>
          <div className="ds"><b>{fmt(mins)}</b><span>studied</span></div>
          <div className="ds"><b>{Object.keys(S.solutions).length}</b><span>solutions</span></div>
        </div>
      </div>

      {/* ── Activity heatmap ────────────────────────────────────────── */}
      <div className="dash-section">
        <div className="dash-section-head">
          <span className="dash-label">Activity</span>
          <span className="dash-sub">streak {streak(S.done)}d · {td} today</span>
        </div>
        <div className="card compact"><Heatmap /></div>
      </div>

      {/* ── Weeks grid ──────────────────────────────────────────────── */}
      <div className="dash-section">
        <div className="dash-section-head">
          <span className="dash-label">Weeks</span>
          <Link className="dash-link" to="/weekly/">View all →</Link>
        </div>
        <div className="grid g4m">
          {data.weeks.map((w, i) => {
            const rev = (S.revisions && S.revisions[i]) || 0
            const done = wDone(i)
            return (
              <Link key={i} className="card compact wcard" to={`/week/${i + 1}/`}>
                <div className="wcard-top">
                  <span className="wcard-n">W{i + 1}</span>
                  {S.start && i === cw && <span className="wcard-now">now</span>}
                  {rev > 0 && <span className="wcard-rev">R{rev}</span>}
                  <span className="wcard-ct">{done}/{w.length}</span>
                </div>
                <Bar a={done} b={w.length} />
              </Link>
            )
          })}
        </div>
      </div>

      {/* ── Solved per week bar chart ───────────────────────────────── */}
      <div className="dash-section">
        <div className="dash-section-head"><span className="dash-label">Solved per week</span></div>
        <div className="card compact"><div className="cols">
          {data.weeks.map((w, i) => (
            <div className="col" key={i}><span>{wDone(i)}</span><i style={{ height: `${(70 * wDone(i)) / w.length}%` }} /><span>W{i + 1}</span></div>
          ))}
        </div></div>
      </div>

      {/* ── By topic ────────────────────────────────────────────────── */}
      <div className="dash-section">
        <div className="dash-section-head">
          <span className="dash-label">By topic</span>
          <Link className="dash-link" to="/concepts/">View all →</Link>
        </div>
        <div className="grid g3m">
          {data.topics.map((t, i) => {
            const [a, b] = tStat(i)
            return (
              <Link key={t} className="card compact tcard" to={`/concepts/${topicSlug(t)}/`}>
                <div className="tcard-top">
                  <span className="tcard-name">{t}</span>
                  <span className="tcard-pct">{Math.round((100 * a) / b)}%</span>
                </div>
                <Bar a={a} b={b} />
                <span className="tcard-sub">{a}/{b}{tmn(t) ? ` · ${fmt(tmn(t))}` : ''}</span>
              </Link>
            )
          })}
        </div>
      </div>

      {/* ── Timer + Settings (collapsed) ────────────────────────────── */}
      <div className="two" style={{ marginTop: 16 }}>
        <div>
          <div className="dash-section-head"><span className="dash-label">Timer</span></div>
          <Timer />
        </div>
        <div>
          <div className="dash-section-head"><span className="dash-label">Settings</span></div>
          <div className="card compact">
            <p className="sm" style={{ margin: '0 0 6px' }}>Plan start date</p>
            <input type="date" value={S.start} onChange={(e) => setStart(e.target.value)} />
            <div className="pre" style={{ marginTop: 10 }}>
              <button onClick={exportData}>Export</button>
              <button className="dim" onClick={() => file.current.click()}>Import</button>
              <button className="dim" onClick={() => window.confirm('Restart tracking?\n\nSolved ticks, sessions & start date archived. Solutions kept.') && restart()}>Restart</button>
              <button className="dim" onClick={() => window.confirm('Delete ALL data including solutions? Cannot be undone.') && reset()}>Delete all</button>
              <input ref={file} type="file" accept=".json" hidden onChange={onImport} />
            </div>
            {(S.history || []).length > 0 && (
              <>
                <p className="sm" style={{ margin: '10px 0 4px' }}>Past runs</p>
                {S.history.map((h, n) => (
                  <div key={h.id} className="sm">{n + 1}. {h.from}→{h.to} · {h.solved}/{total} · {fmt(h.sessions.reduce((a, x) => a + x.min, 0))}</div>
                ))}
              </>
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
}
