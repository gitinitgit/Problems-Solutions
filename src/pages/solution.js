import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Link, navigate } from 'gatsby'
import Layout from '../components/Layout'
import data from '../../content/questions.json'
import { useTracker } from '../hooks/useTracker'
import { md, LANGS, langLabel, onCopyClick } from '../components/Markdown'
import { today } from '../utils'

const LKEY = 'dsa-layout-v1'
const DEF = { w: 1200, h: 700, r: 0.5, write: true } // workspace width/height (px), split ratio, writing mode
const clamp = (v, a, b) => Math.min(b, Math.max(a, v))
const tpl = (l) =>
  `# Intuition\n<!-- Describe your first thoughts on how to solve this problem. -->\n\n# Approach\n<!-- Describe your approach to solving the problem. -->\n\n# Complexity\n- Time complexity:\n<!-- Add your time complexity here, e.g. $$O(n)$$ -->\n\n- Space complexity:\n<!-- Add your space complexity here, e.g. $$O(n)$$ -->\n\n# Code\n\`\`\`${l} []\n\n\`\`\`\n`

export default function SolutionPage({ location }) {
  const k = new URLSearchParams(location.search).get('k') || ''
  const { S, set, ready } = useTracker()
  const [w, i] = k.split('-')
  const q = data.weeks[w] && data.weeks[w][i]
  const saved = S.solutions[k]
  const [init, setInit] = useState(false)
  const [title, setTitle] = useState('')
  const [tags, setTags] = useState([])
  const [lang, setLang] = useState('cpp')
  const [body, setBody] = useState('')
  const [adding, setAdding] = useState(false)
  const [tip, setTip] = useState(false)
  const [lay, setLay] = useState(DEF)
  const [laid, setLaid] = useState(false)
  const ws = useRef(), split = useRef(), ta = useRef()

  useEffect(() => {
    try { setLay((l) => ({ ...l, ...JSON.parse(localStorage.getItem(LKEY) || '{}') })) } catch (e) {}
    setLaid(true)
  }, [])
  useEffect(() => {
    if (laid) try { localStorage.setItem(LKEY, JSON.stringify(lay)) } catch (e) {}
  }, [lay, laid])
  useEffect(() => {
    if (!ready || init || !q) return
    const d = S.drafts[k] || S.solutions[k] || {}
    setTitle(d.title || '')
    setTags(d.tags || [data.topics[q.topic]])
    setLang(d.lang || 'cpp')
    setBody(d.body || tpl(d.lang || 'cpp'))
    setInit(true)
    // eslint-disable-next-line
  }, [ready, q])
  useEffect(() => {
    if (init) set('drafts', k, { title, tags, lang, body })
    // eslint-disable-next-line
  }, [title, tags, lang, body, init])
  const html = useMemo(() => md(body), [body])

  if (!q)
    return <Layout location={location}><p>Open a problem in the <Link to="/weekly/">Weekly Tracker</Link> and click its document icon.</p></Layout>

  // ---- resizing: workspace edges/corner + split divider
  const drag = (move) => (e) => {
    e.preventDefault()
    document.body.style.userSelect = 'none'
    const up = () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
      document.body.style.userSelect = ''
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
  }
  const resize = (kind, side) => (e) => {
    const x0 = e.clientX, y0 = e.clientY, w0 = ws.current.offsetWidth, h0 = ws.current.offsetHeight
    drag((ev) => {
      const dx = ev.clientX - x0, dy = ev.clientY - y0
      setLay((l) => ({
        ...l,
        ...(kind !== 'h' ? { w: clamp(w0 + (side === 'l' ? -dx : dx) * 2, 520, 3000) } : {}),
        ...(kind !== 'w' ? { h: clamp(h0 + dy, 360, 2000) } : {}),
      }))
    })(e)
  }
  const splitDrag = (e) => {
    const r = split.current.getBoundingClientRect()
    drag((ev) => setLay((l) => ({ ...l, r: clamp((ev.clientX - r.left) / r.width, 0.2, 0.8) })))(e)
  }
  const nudge = (e) => {
    if (e.key === 'ArrowLeft') setLay((l) => ({ ...l, r: clamp(l.r - 0.02, 0.2, 0.8) }))
    if (e.key === 'ArrowRight') setLay((l) => ({ ...l, r: clamp(l.r + 0.02, 0.2, 0.8) }))
  }

  // ---- editor helpers
  const edit = (fn) => {
    const t = ta.current, [nv, a, b] = fn(body, t.selectionStart, t.selectionEnd)
    setBody(nv)
    requestAnimationFrame(() => { t.focus(); t.setSelectionRange(a, b) })
  }
  const wrap = (p, s = p, ph = 'text') => edit((v, a, b) => { const x = v.slice(a, b) || ph; return [v.slice(0, a) + p + x + s + v.slice(b), a + p.length, a + p.length + x.length] })
  const prefix = (p) => edit((v, a, b) => { const ls = v.lastIndexOf('\n', a - 1) + 1; return [v.slice(0, ls) + p + v.slice(ls), a + p.length, b + p.length] })
  const put = (txt, at) => edit((v, a, b) => [v.slice(0, a) + txt + v.slice(b), a + at, a + at])
  const fence = '```' + lang + ' []\n'
  const tools = [
    ['H', 'Heading', () => prefix('## ')], ['B', 'Bold', () => wrap('**')], ['I', 'Italic', () => wrap('*')],
    ['1.', 'Numbered list', () => prefix('1. ')], ['•', 'Bullet list', () => prefix('- ')], ['―', 'Divider', () => put('\n---\n', 5)],
    ['▣', 'Code block', () => put(fence + '\n```\n', fence.length)], ['</>', 'Inline code', () => wrap('`')], ['Σ', 'Math', () => wrap('$$', '$$', 'O(n)')],
    ['🖼', 'Image', () => { const u = window.prompt('Image URL'); if (u) put(`![image](${u})`, 0) }],
    ['🔗', 'Link', () => { const u = window.prompt('Link URL'); if (u) wrap('[', `](${u})`) }],
    ['❝', 'Quote', () => prefix('> ')],
  ]
  const changeLang = (l) => { setLang(l); setBody((b) => b.replace(/```[\w+#-]+( \[\])?/, '```' + l + ' []')) }
  const addTag = (e) => {
    const v = e.target.value.trim()
    if (v && !tags.includes(v)) setTags([...tags, v])
    setAdding(false)
  }
  const loadVersion = (e) => {
    const v = (saved.versions || [])[+e.target.value]
    if (v) { setTitle(v.title); setTags(v.tags); setLang(v.lang); setBody(v.body) }
    e.target.value = ''
  }
  const post = () => {
    const sol = { title: title.trim() || q.title, tags, lang, body, date: today() }
    // keep the previous version in the solution's history
    const versions = saved ? [{ title: saved.title, tags: saved.tags, lang: saved.lang, body: saved.body, date: saved.date }, ...(saved.versions || [])].slice(0, 20) : []
    set('solutions', k, { ...sol, versions: saved && saved.body === body ? saved.versions || [] : versions })
    set('drafts', k)
    navigate('/solutions/')
  }
  const cancel = () => { set('drafts', k); window.history.length > 1 ? navigate(-1) : navigate('/') }
  const wr = lay.write

  return (
    <Layout location={location} wide>
      <div className="wsw" ref={ws} style={{ width: `min(100%, ${lay.w}px)`, height: lay.h }}>
        <div className="ws">
          <div className="wsh">
            {wr ? <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Enter your title" aria-label="Title" />
              : <h2 className="rtitle">{title || q.title}</h2>}
            <span className="sm hide-s">LC {q.n} · {q.title}</span>
            <button className="dim" onClick={cancel}>{wr ? 'Cancel' : 'Close'}</button>
            <button className="go" onClick={post}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: 5, verticalAlign: '-1px' }}>
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
              </svg>
              Post
            </button>
          </div>
          {wr && (
            <div className="tags">
              {adding ? <input className="taginp" autoFocus placeholder="Tag…" onBlur={addTag} onKeyDown={(e) => { if (e.key === 'Enter') addTag(e); if (e.key === 'Escape') setAdding(false) }} />
                : <button className="tag" onClick={() => setAdding(true)}>+ Tag</button>}
              <span className="tag"><select value={lang} onChange={(e) => changeLang(e.target.value)} aria-label="Language">{LANGS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></span>
              {tags.map((t) => <span className="tag" key={t}>{t} <button className="x" aria-label={`Remove ${t}`} onClick={() => setTags(tags.filter((x) => x !== t))}>×</button></span>)}
              {saved && (saved.versions || []).length > 0 && (
                <select className="tag" defaultValue="" onChange={loadVersion} aria-label="Version history">
                  <option value="" disabled>History ({saved.versions.length})</option>
                  {saved.versions.map((v, n) => <option key={n} value={n}>{v.date} · {v.title}</option>)}
                </select>
              )}
            </div>
          )}
          <div className="tb">
            {wr && tools.map(([l, t, fn]) => <button key={t} title={t} aria-label={t} onClick={fn}>{l}</button>)}
            <label className="sw" title="Turn off to read the solution full-width">Writing mode
              <input type="checkbox" checked={wr} onChange={() => setLay((l) => ({ ...l, write: !l.write }))} /><i />
            </label>
            <button title="Reset workspace size" aria-label="Reset workspace size" onClick={() => setLay((l) => ({ ...DEF, write: l.write }))}>⤢</button>
            {wr && <button title="Tips" aria-label="Tips" onClick={() => setTip(!tip)}>💡</button>}
          </div>
          {wr && tip && <div className="tip">Markdown · <code>$$O(n)$$</code> math · <code>```cpp</code> code · <code>&lt;!-- comments --&gt;</code> hidden in preview · Tab inserts spaces · drag the divider or workspace edges to resize · drafts autosave.</div>}
          {wr ? (
            <div className="split" ref={split} style={{ gridTemplateColumns: `minmax(0,${lay.r}fr) 8px minmax(0,${1 - lay.r}fr)` }}>
              <div className="pane">
                <textarea ref={ta} value={body} onChange={(e) => setBody(e.target.value)} onKeyDown={(e) => { if (e.key === 'Tab') { e.preventDefault(); put('  ', 2) } }} spellCheck="false" aria-label="Solution markdown" />
              </div>
              <div className="dv" role="separator" aria-orientation="vertical" aria-label="Resize panels (arrow keys, double-click to reset)" tabIndex={0} onPointerDown={splitDrag} onKeyDown={nudge} onDoubleClick={() => setLay((l) => ({ ...l, r: 0.5 }))} />
              <div className="pane prev" onClick={onCopyClick} dangerouslySetInnerHTML={{ __html: html }} />
            </div>
          ) : (
            <div className="pane prev read" onClick={onCopyClick}>
              <div className="wk" style={{ marginTop: 0 }}><span className="pill">{langLabel(lang)}</span>{tags.map((t) => <span className="pill" key={t}>{t}</span>)}</div>
              <div dangerouslySetInnerHTML={{ __html: html }} />
            </div>
          )}
        </div>
        <div className="rh l" onPointerDown={resize('w', 'l')} title="Drag to resize width" />
        <div className="rh r" onPointerDown={resize('w', 'r')} title="Drag to resize width" />
        <div className="bh" onPointerDown={resize('h')} title="Drag to resize height" />
        <div className="ch" onPointerDown={resize('wh', 'r')} title="Drag to resize" />
      </div>
    </Layout>
  )
}
