import React from 'react'
import { useTracker } from '../hooks/useTracker'
import { today } from '../utils'

export default function Heatmap() {
  const { S, ready } = useTracker()
  if (!ready) return <div className="heat" />
  const c = {}
  Object.values(S.done).forEach((d) => (c[d] = (c[d] || 0) + 1))
  const f = new Date(today())
  f.setUTCDate(f.getUTCDate() - 139)
  const cells = Array.from({ length: (f.getUTCDay() + 6) % 7 }, (_, i) => <i key={'p' + i} style={{ visibility: 'hidden' }} />)
  for (let i = 0; i < 140; i++) {
    const k = f.toISOString().slice(0, 10), n = c[k] || 0
    cells.push(<i key={k} className={n ? 'l' + (n < 2 ? 1 : n < 4 ? 2 : n < 7 ? 3 : 4) : ''} title={`${k}: ${n} solved`} />)
    f.setUTCDate(f.getUTCDate() + 1)
  }
  return <div className="heat">{cells}</div>
}
