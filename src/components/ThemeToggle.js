import React, { useEffect, useState } from 'react'

export default function ThemeToggle() {
  const [th, setTh] = useState('dark')
  useEffect(() => setTh(document.documentElement.dataset.theme || 'dark'), [])
  const toggle = () => {
    const n = th === 'dark' ? 'light' : 'dark'
    document.documentElement.dataset.theme = n
    try { localStorage.setItem('theme', n) } catch (e) {}
    setTh(n)
  }
  return <button className="dim tg" onClick={toggle} aria-label="Toggle light/dark theme" title="Toggle theme">{th === 'dark' ? '☀ Light' : '☾ Dark'}</button>
}
