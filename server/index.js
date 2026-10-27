const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '.env') })
const express = require('express')
const cookieParser = require('cookie-parser')
const cors = require('cors')
const helmet = require('helmet')
const rateLimit = require('express-rate-limit')
const connectDB = require('./config/db')
const authRoutes = require('./routes/auth')
const dataRoutes = require('./routes/data')

const app = express()
const PORT = process.env.PORT || 5000

// Reverse proxy trust (Render, Railway, Heroku, etc.)
app.set('trust proxy', 1)

// Security headers
app.use(helmet())

// CORS — allow Gatsby dev server and production origins
const allowedOrigins = [
  'http://localhost:8000',
  'http://localhost:9000',
  'http://localhost:5173',
  'http://localhost:3000',
  'https://dsclassmate.netlify.app',
  process.env.CLIENT_ORIGIN,
].filter(Boolean)

const isOriginAllowed = (origin) => {
  if (!origin) return true
  if (allowedOrigins.includes(origin)) return true
  // Allow all Netlify deployments and deploy previews
  if (/\.netlify\.app$/.test(origin)) return true
  return false
}

const corsOptions = {
  origin: (origin, cb) => {
    if (isOriginAllowed(origin)) {
      return cb(null, true)
    }
    // Return cb(null, false) so preflight doesn't throw a 500
    cb(null, false)
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}

app.use(cors(corsOptions))
app.options('*', cors(corsOptions))

// Body parsing
app.use(express.json({ limit: '2mb' })) // tracker data can be large
app.use(cookieParser())

// Rate limiting on auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // limit each IP to 20 requests per windowMs
  message: { error: 'Too many requests. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
})

// DB readiness middleware for API routes
app.use('/api', (req, res, next) => {
  if (req.path === '/health') return next()
  const mongoose = require('mongoose')
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      error: 'Database unavailable. Please ensure MongoDB is running or verify MONGO_URI in server/.env.',
    })
  }
  next()
})

// Routes
app.use('/api/auth', authLimiter, authRoutes)
app.use('/api/data', dataRoutes)

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok' }))

// Global error handler
app.use((err, req, res, _next) => {
  console.error('Unhandled error:', err)
  res.status(500).json({ error: 'Internal server error' })
})

// Connect to DB and start server
connectDB().finally(() => {
  app.listen(PORT, () => {
    console.log(`✓ DSA Tracker API Server running on port ${PORT}`)
    console.log(`✓ Allowed client origins: ${allowedOrigins.join(', ')}`)
  })
})

