const express = require('express')
const jwt = require('jsonwebtoken')
const User = require('../models/User')

const router = express.Router()

// Helper: set JWT as httpOnly cookie and return user + token
const sendTokenCookie = (res, user) => {
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  })

  const isProd = process.env.NODE_ENV === 'production'
  const cookieOpts = {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax', // 'none' required for cross-domain Netlify <-> API cookies
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/',
  }

  res.cookie('token', token, cookieOpts)
  return {
    user: { id: user._id, name: user.name, email: user.email },
    token,
  }
}

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body

    // Input validation
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' })
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' })
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(400).json({ error: 'Please provide a valid email' })
    }
    if (name.length > 50) {
      return res.status(400).json({ error: 'Name cannot exceed 50 characters' })
    }

    // Check if user exists
    const exists = await User.findOne({ email: email.toLowerCase().trim() })
    if (exists) {
      return res.status(400).json({ error: 'An account with this email already exists' })
    }

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
    })

    const { user: userData, token } = sendTokenCookie(res, user)
    res.status(201).json({ user: userData, token })
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ error: 'An account with this email already exists' })
    }
    console.error('Register error:', err)
    res.status(500).json({ error: 'Server error. Please try again.' })
  }
})

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' })
    }

    // Explicitly select password for comparison
    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password')
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    const isMatch = await user.comparePassword(password)
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    const { user: userData, token } = sendTokenCookie(res, user)
    res.json({ user: userData, token })
  } catch (err) {
    console.error('Login error:', err)
    res.status(500).json({ error: 'Server error. Please try again.' })
  }
})

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  const isProd = process.env.NODE_ENV === 'production'
  res.cookie('token', '', {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    expires: new Date(0),
    path: '/',
  })
  res.json({ message: 'Logged out' })
})

// GET /api/auth/me — check current session
router.get('/me', async (req, res) => {
  try {
    let token = req.cookies?.token
    if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1]
    }

    if (!token) {
      return res.status(401).json({ error: 'Not authenticated' })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findById(decoded.id)
    if (!user) {
      return res.status(401).json({ error: 'User not found' })
    }

    res.json({ user: { id: user._id, name: user.name, email: user.email } })
  } catch (err) {
    res.status(401).json({ error: 'Not authenticated' })
  }
})

module.exports = router
