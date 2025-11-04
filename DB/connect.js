const mongoose = require('mongoose')

const connectDB = async (URL) => {
    if (!URL || typeof URL !== 'string') {
        throw new Error('MONGO_URI is not defined or invalid')
    }
    try {
        await mongoose.connect(URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        })
    } catch (error) {
        console.error('MongoDB connection error:', error.message || error)
        throw error
    }
}

module.exports = connectDB