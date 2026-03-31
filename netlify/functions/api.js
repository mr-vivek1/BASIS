const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const serverless = require('serverless-http');

const app = express();

// Middleware
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());

// MongoDB connection caching for serverless (cold start optimization)
let cachedDb = null;

const connectDB = async () => {
  if (cachedDb && mongoose.connection.readyState === 1) return;

  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      bufferCommands: false,
    });
    cachedDb = mongoose.connection;
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
  }
};

// Connect to DB before each request
app.use(async (req, res, next) => {
  await connectDB();
  next();
});

// Health check
app.get('/api', (req, res) => {
  res.json({ status: 'Petrol Bunk API is running on Netlify' });
});

// Import and use routes
try {
  app.use('/api/auth', require('../../backend/routes/auth'));
  app.use('/api/sales', require('../../backend/routes/sales'));
  app.use('/api/maintenance', require('../../backend/routes/maintenance'));
  app.use('/api/attendance', require('../../backend/routes/attendance'));
  app.use('/api/prices', require('../../backend/routes/prices'));
  app.use('/api/loans', require('../../backend/routes/loans'));
  app.use('/api/stats', require('../../backend/routes/stats'));
  app.use('/api/tanks', require('../../backend/routes/tanks'));
} catch (error) {
  console.warn('Some routes failed to load:', error.message);
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something broke!' });
});

// Export as Netlify Function handler
module.exports.handler = serverless(app);
