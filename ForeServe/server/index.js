// Minimal Express backend for ForeServe
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const app = express();

// Config
const PORT = process.env.PORT || 4000;
const CORS_ORIGIN = process.env.CORS_ORIGIN || '*';

// Middleware
const allowAll = CORS_ORIGIN === '*';
const parsedOrigins = allowAll
  ? '*'
  : CORS_ORIGIN.split(',').map((s) => s.trim()).filter(Boolean);

app.use(
  cors({
    origin: allowAll ? '*' : parsedOrigins,
    credentials: allowAll ? false : true,
  })
);
app.use(express.json());
app.use(morgan('dev'));

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'foreserve-api', timestamp: new Date().toISOString() });
});

app.post('/api/echo', (req, res) => {
  res.json({ youSent: req.body });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

// Error handler
app.use((err, req, res, _next) => {
  console.error('Unhandled error:', err);
  res.status(err.status || 500).json({ error: 'Internal Server Error' });
});

app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});
