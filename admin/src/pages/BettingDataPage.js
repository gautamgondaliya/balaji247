import React, { useState } from 'react';
import BettingDataDisplay from '../components/BettingDataDisplay';
import './BettingDataPage.css';

const BettingDataPage = () => {
  const [apiData, setApiData] = useState(null);
  const [inputData, setInputData] = useState('');

  const handleInputChange = (e) => {
    setInputData(e.target.value);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    
    try {
      // Try to parse the input as JSON first
      try {
        const parsedJson = JSON.parse(inputData);
        setApiData(parsedJson);
        return;
      } catch (jsonError) {
        // If JSON parsing fails, treat as a raw string
        console.log("Not valid JSON, treating as raw data");
      }
      
      // Format the string as an object with properties
      const cleanedInput = inputData.trim();
      
      // Extract different sections based on expected structure
      const messagesMatch = cleanedInput.match(/"messages"\s*:\s*"([^"]*)"/);
      const inactiveMarketsMatch = cleanedInput.match(/"inactiveMarkets"\s*:\s*"([^"]*)"/);
      const booksMatch = cleanedInput.match(/"books"\s*:\s*"([^"]*)"/);
      const scoreMatch = cleanedInput.match(/"score"\s*:\s*"([^"]*)"/);
      
      // Create data object with extracted parts
      const dataObj = {
        messages: messagesMatch ? messagesMatch[1] : "{}",
        inactiveMarkets: inactiveMarketsMatch ? inactiveMarketsMatch[1] : "[]",
        books: booksMatch ? booksMatch[1] : "{}",
        score: scoreMatch ? scoreMatch[1] : "{}"
      };
      
      setApiData(dataObj);
    } catch (err) {
      console.error("Error processing input data:", err);
      alert("Error processing input data. Please check the console for details.");
    }
  };

  const handleClearData = () => {
    setApiData(null);
    setInputData('');
  };

  // Example data for demo purposes
  const loadExampleData = () => {
    const exampleJson = `{
      "messages": "{\\"1.243739891\\":[{\\"time\\":1747214196,\\"message\\":\\" Aviator\\\\u2708 Games \\\\u0026 Ludo Cricket Started in Our Exchange..\\\\n\\",\\"isActive\\":true},{\\"time\\":1747386575,\\"message\\":\\" Aviator\\\\u2708 Games Started in Our Exchange..\\\\n\\",\\"isActive\\":true},{\\"time\\":1747667816,\\"message\\":\\"CSK VS RR ADV Fancy \\\\u0026 Bookmaker Started In Our Exchange...\\",\\"isActive\\":true}]}",
      "inactiveMarkets": "[\\"1.243739900\\",\\"1.243739902\\"]",
      "books": "{\\"1.243739891\\":\\"1.243739891|5|SUSPENDED|True|05/19/2025 17:58:26|1747677553580|False|42821393~ACTIVE~1000:113.78:*470:43.46:*240:44.55:~,7671296~ACTIVE~~1.01:159700.51:*1.02:3268.11:*1.03:3838.79:\\",\\"1.243739893\\":\\"1.243739893|5|CLOSED|True||1747677568574|False|37302~LOSER~~,37303~WINNER~~\\"}",
      "score": "{\\"e\\":\\"34316684\\",\\"en\\":\\"Lucknow Super Giants v Sunrisers Hyderabad\\",\\"t\\":\\"2025-05-19T17:58:45.332Z\\",\\"p\\":true,\\"tw\\":\\"a\\",\\"fb\\":\\"h\\",\\"mf\\":\\"T20\\",\\"ott\\":\\"20\\",\\"isDwl\\":false,\\"rtc\\":0,\\"bpo\\":6,\\"h\\":\\"Lucknow Super Giants\\",\\"a\\":\\"Sunrisers Hyderabad\\",\\"hs\\":[{\\"r\\":\\"205\\",\\"w\\":\\"7\\",\\"o\\":\\"20\\",\\"rr\\":\\"10.25\\",\\"rrr\\":\\"0.0\\",\\"ic\\":false},{\\"r\\":\\"0\\",\\"w\\":\\"0\\",\\"o\\":\\"0.0\\",\\"rr\\":\\"0\\",\\"rrr\\":\\"0.0\\",\\"ic\\":false}],\\"as\\":[{\\"r\\":\\"206\\",\\"w\\":\\"4\\",\\"o\\":\\"18.2\\",\\"rr\\":\\"11.24\\",\\"rrr\\":\\"0.0\\",\\"ic\\":false},{\\"r\\":\\"0\\",\\"w\\":\\"0\\",\\"o\\":\\"0.0\\",\\"rr\\":\\"0\\",\\"rrr\\":\\"0.0\\",\\"ic\\":false}],\\"s\\":\\"NA\\",\\"o\\":[{\\"i\\":1,\\"n\\":1,\\"e\\":\\"NA\\",\\"w\\":\\"NA\\",\\"r\\":\\"4\\"},{\\"i\\":2,\\"n\\":2,\\"e\\":\\"NA\\",\\"w\\":\\"NA\\",\\"r\\":\\"1\\"}],\\"c\\":1,\\"i\\":0,\\"r\\":false,\\"m\\":\\"**|Sunrisers Hyderabad won by 6 wickets\\",\\"l\\":\\"18~14~4 1 1 W 4 4 |17~8~1 0WD 2 1 1 1 1 |16~8~1 2 1 2 1 1 |15~6~1 1 1 2 1 0 |14~17~1 0WD 1 2 4 4 4 \\"}"
    }`;
    
    setInputData(exampleJson);
  };

  return (
    <div className="betting-data-page">
      <h1>Betting Data Parser</h1>
      
      <div className="input-section">
        <form onSubmit={handleFormSubmit}>
          <div className="form-group">
            <label htmlFor="apiData">Enter API Data:</label>
            <textarea 
              id="apiData" 
              value={inputData} 
              onChange={handleInputChange} 
              rows="10"
              placeholder="Paste your API data here (JSON or raw format)"
            />
          </div>
          
          <div className="button-group">
            <button type="submit" className="primary-btn">Parse Data</button>
            <button type="button" onClick={handleClearData} className="secondary-btn">Clear</button>
            <button type="button" onClick={loadExampleData} className="secondary-btn">Load Example</button>
          </div>
        </form>
      </div>
      
      {apiData && (
        <div className="data-display-section">
          <BettingDataDisplay rawData={apiData} />
        </div>
      )}
      
      <div className="instructions">
        <h3>Instructions</h3>
        <ol>
          <li>Paste your API data in the text area above.</li>
          <li>Click "Parse Data" to process and view the formatted data.</li>
          <li>You can use the "Load Example" button to see a demonstration.</li>
          <li>Data can be in JSON format or as a raw API response string.</li>
        </ol>
      </div>
    </div>
  );
};

export default BettingDataPage; 