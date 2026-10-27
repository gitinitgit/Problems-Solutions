const jwt = require('jsonwebtoken')
const User = require('../models/User')

// Protect routes — reads JWT from httpOnly cookie only
const protect = async (req, res, next) => {
  try {
    const token = req.cookies?.token
    if (!token) {
      return res.status(401).json({ error: 'Not authenticated' })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findById(decoded.id)
    if (!user) {
      return res.status(401).json({ error: 'User not found' })
    }

    req.user = user
    next()
  } catch (err) {
    return res.status(401).json({ error: 'Token invalid or expired' })
  }
}

module.exports = { protect }
