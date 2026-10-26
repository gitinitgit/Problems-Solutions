import React from 'react'

export default function Bar({ a, b, cls = '' }) {
  return (
    <div className={`bar ${cls} ${a && a === b ? 'full' : ''}`}>
      <i style={{ width: `${b ? (100 * a) / b : 0}%` }} />
    </div>
  )
}
