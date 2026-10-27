const mongoose = require('mongoose')

const connectDB = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/dsa-tracker'
  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    })
    console.log(`✓ MongoDB connected: ${conn.connection.host}`)
    return conn
  } catch (err) {
    console.warn(`⚠️ MongoDB connection error: ${err.message}`)
    console.warn('Backend server will stay alive. Please start MongoDB or set MONGO_URI in server/.env.')
    return null
  }
}

module.exports = connectDB
