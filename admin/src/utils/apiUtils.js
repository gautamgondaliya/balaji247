/**
 * Utility functions for API response parsing and data transformation
 */

/**
 * Safely parses JSON data or returns empty object/array
 * @param {string} data - JSON string to parse
 * @param {boolean} isArray - Whether the expected result should be an array
 * @returns {Object|Array} Parsed data or empty object/array
 */
export const parseApiResponse = (data) => {
  if (!data) return {};
  
  try {
    if (typeof data === 'string') {
      return JSON.parse(data);
    }
    return data;
  } catch (error) {
    console.error('Error parsing API response:', error);
    return {};
  }
};

/**
 * Parse betting data from various sources
 * @param {string|Object} messagesData - Raw messages data
 * @param {string|Object} booksData - Raw books data
 * @param {string|Array} inactiveMarketsData - Raw inactive markets data
 * @returns {Object} Processed betting data
 */
export const parseBettingData = (messagesData, booksData, inactiveMarketsData) => {
  // Parse messages
  const messages = parseApiResponse(messagesData);
  
  // Parse books
  const books = parseApiResponse(booksData);
  
  // Parse inactive markets
  let inactiveMarkets = [];
  try {
    inactiveMarkets = Array.isArray(inactiveMarketsData) 
      ? inactiveMarketsData 
      : JSON.parse(inactiveMarketsData);
  } catch (error) {
    console.error('Error parsing inactive markets:', error);
  }

  return {
    messages,
    books,
    inactiveMarkets
  };
};
