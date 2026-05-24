/**
 * @module server
 * @description ManufactCRM Express 5 API Server
 *
 * Entry point — loads environment, connects to MongoDB,
 * mounts route modules, and starts the HTTP server.
 */

require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

/* ------------------------------------------------------------------ */
/*  Middleware                                                        */
/* ------------------------------------------------------------------ */

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));

app.use(express.json({ limit: '2mb' }));

/* ------------------------------------------------------------------ */
/*  Routes                                                            */
/* ------------------------------------------------------------------ */

app.use('/api/auth', require('./routes/auth'));
app.use('/api/leads', require('./routes/leads'));
app.use('/api/interactions', require('./routes/interactions'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/users', require('./routes/users'));
app.use('/api/reminders', require('./routes/reminders'));

// Convenience alias — notifications are also accessible via /api/reminders/notifications
app.use('/api/notifications', require('./routes/notifications'));

/* ------------------------------------------------------------------ */
/*  Root & Health check                                               */
/* ------------------------------------------------------------------ */

app.get('/', (req, res) => {
  res.send('ManufactCRM API is running. Please use /api endpoints.');
});


app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

/* ------------------------------------------------------------------ */
/*  Global Error Handler                                              */
/* ------------------------------------------------------------------ */

// Express 5 requires exactly (err, req, res, next) signature
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error('❌ Unhandled error:', err.stack || err.message || err);

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ message: 'Validation error', errors: messages });
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue).join(', ');
    return res.status(409).json({ message: `Duplicate value for: ${field}` });
  }

  // Mongoose bad ObjectId
  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    return res.status(400).json({ message: 'Invalid ID format' });
  }

  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

/* ------------------------------------------------------------------ */
/*  Database connection & server start                                */
/* ------------------------------------------------------------------ */

const PORT = process.env.PORT || 5000;

async function start() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected');

    app.listen(PORT, () => {
      console.log(`🚀 ManufactCRM API running on port ${PORT} (${process.env.NODE_ENV || 'development'})`);
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err.message);
    process.exit(1);
  }
}

start();

module.exports = app; // for testing
