import mongoose from 'mongoose'

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  throw new Error('MONGODB_URI is not defined in .env.local')
}

let cached = global.mongoose

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null }
}

async function connectDB() {
  if (cached.conn) {
    console.log('MongoDB: using cached connection')
    return cached.conn
  }

  if (!cached.promise) {
    console.log('MongoDB: creating new connection...')
    console.log('MongoDB: URI prefix check →', MONGODB_URI.substring(0, 20) + '...') 
    // Only logs the start of the URI so your password is never exposed in logs

    cached.promise = mongoose
      .connect(MONGODB_URI)
      .then((mongoose) => {
        console.log('MongoDB: connected successfully')
        return mongoose
      })
      .catch((error) => {
        console.error('MongoDB: connection failed →', error.message)

        if (error.name === 'MongoNetworkError') {
          console.error('MongoDB: Network error — check Atlas IP whitelist, make sure 0.0.0.0/0 is added under Network Access')
        } else if (error.name === 'MongoParseError') {
          console.error('MongoDB: URI parse error — check the format of your MONGODB_URI in .env.local')
        } else if (error.code === 8000) {
          console.error('MongoDB: Auth failed — wrong username or password in MONGODB_URI')
        } else {
          console.error('MongoDB: General error →', error)
        }

        // Reset promise so next request retries instead of hanging forever
        cached.promise = null
        throw error
      })
  }

  cached.conn = await cached.promise
  return cached.conn
}

export default connectDB