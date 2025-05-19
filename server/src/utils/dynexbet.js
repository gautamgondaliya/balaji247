const axios = require('axios');
const NodeCache = require('node-cache');

// Increased cache TTL to 10 seconds to reduce API load while still getting fresh data
const cache = new NodeCache({ stdTTL: 10 });

// Track ongoing fetch requests to prevent duplicates
const pendingRequests = {};

const DYNEBET_CRICKET_API = process.env.DYNEBET_CRICKET_API;
const DYNEBET_EVENT_DETAILS_API = process.env.DYNEBET_EVENT_DETAILS_API;

async function fetchCricketData() {
  try {
    // Check cache first
    const cachedData = cache.get('cricket_data');
    if (cachedData) {
      return cachedData;
    }

    // Check if there's already a request in progress
    if (pendingRequests['cricket_data']) {
      return pendingRequests['cricket_data'];
    }

    // Create a promise for this request and store it
    pendingRequests['cricket_data'] = new Promise(async (resolve, reject) => {
      try {
        const response = await axios.get(DYNEBET_CRICKET_API);
        // Store in cache
        cache.set('cricket_data', response.data);
        resolve(response.data);
      } catch (error) {
        reject(error);
      } finally {
        // Clear this pending request
        delete pendingRequests['cricket_data'];
      }
    });

    return pendingRequests['cricket_data'];
  } catch (error) {
    console.error('Error fetching DynexBet cricket data:', error.message);
    throw error;
  }
}

async function fetchEventDetails(eventId) {
  try {
    // Cache key for this event
    const cacheKey = `event_${eventId}`;
    
    // Check cache first
    const cachedData = cache.get(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    // Check if there's already a request in progress for this event
    if (pendingRequests[cacheKey]) {
      return pendingRequests[cacheKey];
    }

    // Create a promise for this request and store it
    pendingRequests[cacheKey] = new Promise(async (resolve, reject) => {
      try {
        const url = `${DYNEBET_EVENT_DETAILS_API}${eventId}`;
        const response = await axios.get(url);
        // Store in cache
        cache.set(cacheKey, response.data);
        resolve(response.data);
      } catch (error) {
        reject(error);
      } finally {
        // Clear this pending request
        delete pendingRequests[cacheKey];
      }
    });

    return pendingRequests[cacheKey];
  } catch (error) {
    console.error('Error fetching DynexBet event details:', error.message);
    throw error;
  }
}

module.exports = { fetchCricketData, fetchEventDetails }; 