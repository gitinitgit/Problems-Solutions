export const getApiUrl = () => {
  if (process.env.GATSBY_API_URL) {
    return process.env.GATSBY_API_URL.replace(/\/$/, '')
  }
  if (typeof window !== 'undefined') {
    if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      // In production without GATSBY_API_URL, use relative origin or warn
      return ''
    }
  }
  return 'http://localhost:5000'
}

export const getAuthHeaders = (extraHeaders = {}) => {
  const headers = { ...extraHeaders }
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('dsa_token')
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
  }
  return headers
}

export const config = {
  title: 'DSA TRACKER',
  storageKey: 'dsa-tracker-v1',
  apiUrl: getApiUrl(),
  // [link, label, path prefix that marks it active]
  nav: [
    ['/', 'Dashboard', '/'],
    ['/weekly/', 'Weekly Tracker', '/week'],
    ['/concepts/', 'Concepts', '/concepts'],
    ['/solutions/', 'My Solutions', '/solutions'],
  ],
}

