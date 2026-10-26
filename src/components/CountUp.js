import React, { useEffect, useState } from 'react'

export default function CountUp({ n }) {
  const [v, setV] = useState(0)
  useEffect(() => {
    let r, t0
    const f = (t) => {
      t0 = t0 || t
      const p = Math.min(1, (t - t0) / 900)
      setV(Math.round(n * (1 - (1 - p) ** 3)))
      if (p < 1) r = requestAnimationFrame(f)
    }
    r = requestAnimationFrame(f)
    return () => cancelAnimationFrame(r)
  }, [n])
  return <>{v}</>
}
