const express = require('express');
const {getEventDetails, getCricketData} = require('./routes/eventDetails.routes');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const authRoutes = require('./routes/auth.routes');
const walletRoutes = require('./routes/wallet.routes');
const bettingRoutes = require('./routes/betting.routes');

const app = express();


// CORS configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

app.use(express.json());
app.use(cors(corsOptions));


app.use('/api/event-details', getEventDetails);
app.use('/api/cricket', getCricketData);
app.use('/api/auth', authRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/betting', bettingRoutes);

// No API routes

app.get('/', (req, res) => res.send('API Running!'));

module.exports = app; 