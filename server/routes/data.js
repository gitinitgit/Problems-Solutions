const express = require('express')
const { protect } = require('../middleware/auth')
const TrackerData = require('../models/TrackerData')

const router = express.Router()

// All data routes require authentication
router.use(protect)

// GET /api/data — load user's tracker data from cloud
router.get('/', async (req, res) => {
  try {
    const doc = await TrackerData.findOne({ user: req.user._id })
    res.json({ data: doc ? doc.data : null })
  } catch (err) {
    console.error('Load data error:', err)
    res.status(500).json({ error: 'Failed to load data' })
  }
})

// PUT /api/data — save/update user's tracker data to cloud
router.put('/', async (req, res) => {
  try {
    const { data } = req.body
    if (!data || typeof data !== 'object') {
      return res.status(400).json({ error: 'Invalid data payload' })
    }

    const doc = await TrackerData.findOneAndUpdate(
      { user: req.user._id },
      { data },
      { upsert: true, new: true, runValidators: true }
    )

    res.json({ message: 'Saved', updatedAt: doc.updatedAt })
  } catch (err) {
    console.error('Save data error:', err)
    res.status(500).json({ error: 'Failed to save data' })
  }
})

module.exports = router
