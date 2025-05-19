const express = require('express');
const { fetchEventDetails, fetchCricketData } = require('../utils/dynexbet');
const Router = express.Router();

// Route handlers assigned to variables
const getEventDetails = Router.get('/:id', async (req, res) => {
  try {
    const data = await fetchEventDetails(req.params.id);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch event details' });
  }
});

const getCricketData = Router.get('/', async (req, res) => {
  try {
    const data = await fetchCricketData();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch cricket data' });
  }
});

// Exports
module.exports = {
  getEventDetails,
  getCricketData
};
