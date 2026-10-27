export const config = {
  title: 'DSA TRACKER',
  storageKey: 'dsa-tracker-v1',
  apiUrl: process.env.GATSBY_API_URL || 'http://localhost:5000',
  // [link, label, path prefix that marks it active]
  nav: [
    ['/', 'Dashboard', '/'],
    ['/weekly/', 'Weekly Tracker', '/week'],
    ['/concepts/', 'Concepts', '/concepts'],
    ['/solutions/', 'My Solutions', '/solutions'],
  ],
}
