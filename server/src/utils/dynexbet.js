const axios = require('axios');

const DYNEBET_CRICKET_API = process.env.DYNEBET_CRICKET_API;
const DYNEBET_EVENT_DETAILS_API = process.env.DYNEBET_EVENT_DETAILS_API;

async function fetchCricketData() {
  try {
    const response = await axios.get(DYNEBET_CRICKET_API);
    return response.data;
  } catch (error) {
    console.error('Error fetching DynexBet cricket data:', error.message);
    throw error;
  }
}

async function fetchEventDetails(eventId) {
  try {
    const url = `${DYNEBET_EVENT_DETAILS_API}${eventId}`;
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching DynexBet event details:', error.message);
    throw error;
  }
}

module.exports = { fetchCricketData, fetchEventDetails }; 