const express = require('express');
const {getEventDetails, getCricketData} = require('./routes/eventDetails.routes');
const cors = require('cors');
const authRoutes = require('./routes/auth.routes');

const app = express();
app.use(express.json());
app.use(cors());

app.use('/api/event-details', getEventDetails);
app.use('/api/cricket', getCricketData);
app.use('/api/auth', authRoutes);

// No API routes

app.get('/', (req, res) => res.send('API Running!'));

module.exports = app; 