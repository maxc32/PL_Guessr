const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 5000;

app.use(cors()); // Enables CORS for front to backend communication
app.use(express.json()); // Parse JSON request bodies

// Serve static files (locations.json)
app.use(express.static(path.join(__dirname, 'data')));

// API endpoint to fetch locations
app.get('/api/locations', (req, res) => {
  const locations = require('./data/locations.json');
  res.json(locations);
});

// API endpoint to update score
app.post('/api/update-score', (req, res) => {
  const { score } = req.body;
  console.log('Updated score:', score);
  res.json({ success: true, score });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});