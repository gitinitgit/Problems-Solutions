export const today = () =>
  new Date(Date.now() - new Date().getTimezoneOffset() * 6e4).toISOString().slice(0, 10)
export const fmt = (m) => Math.floor(m / 60) + 'hr ' + Math.round(m % 60) + 'min'
export const streak = (done) => {
  const days = new Set(Object.values(done))
  const d = new Date(today())
  let n = 0
  if (!days.has(today())) d.setUTCDate(d.getUTCDate() - 1)
  while (days.has(d.toISOString().slice(0, 10))) {
    n++
    d.setUTCDate(d.getUTCDate() - 1)
  }
  return n
}
