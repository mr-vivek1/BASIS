const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Root route
app.get('/', (req, res) => {
  res.send('Petrol Bunk API is running...');
});

// Import and use routes (placeholders for now)
try {
    app.use('/api/auth', require('./routes/auth'));
    app.use('/api/sales', require('./routes/sales'));
    app.use('/api/maintenance', require('./routes/maintenance'));
    app.use('/api/attendance', require('./routes/attendance'));
    app.use('/api/prices', require('./routes/prices'));
    app.use('/api/loans', require('./routes/loans'));
    app.use('/api/stats', require('./routes/stats'));
    app.use('/api/tanks', require('./routes/tanks'));
} catch (error) {

    console.warn('Some routes are not yet implemented:', error.message);
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
