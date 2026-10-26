import React from 'react'
import { Link } from 'gatsby'
import Layout from '../components/Layout'

export default function NotFound({ location }) {
  return <Layout location={location}><h1>Page not found</h1><p><Link to="/">Back to dashboard</Link></p></Layout>
}
