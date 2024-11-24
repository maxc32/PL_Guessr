const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public')); // express can use resources in public folder

const PORT = 3000;

// Locations array with stadium data
let locations = [
    { "id": 1, "name": "Emirates Stadium", "lat": 51.555, "lng": -0.108611 },
    { "id": 14, "name": "Villa Park", "lat": 52.5086695, "lng": -1.8867347 },
    { "id": 3, "name": "Falmer Stadium", "lat": 50.861822, "lng": -0.083278 },
    { "id": 6, "name": "Stamford Bridge", "lat": 51.481667, "lng": -0.191111 },
    { "id": 7, "name": "Selhurst Park", "lat": 51.398333, "lng": -0.085556 },
    { "id": 8, "name": "Goodison Park", "lat": 53.438889, "lng": -2.966389 },
    { "id": 9, "name": "Craven Cottage", "lat": 51.475, "lng": -0.221667 },
    { "id": 10, "name": "Portman Road", "lat": 52.055061, "lng": 1.144831 },
    { "id": 11, "name": "King Power Stadium", "lat": 52.620278, "lng": -1.142222 },
    { "id": 12, "name": "Anfield", "lat": 53.430819, "lng": -2.960828 },
    { "id": 13, "name": "Etihad Stadium", "lat": 53.482989, "lng": -2.200292 },
    { "id": 2, "name": "Old Trafford", "lat": 53.463056, "lng": -2.291389 },
    { "id": 15, "name": "Sports Direct Arena", "lat": 54.975556, "lng": -1.621667 },
    { "id": 16, "name": "City Ground", "lat": 52.94, "lng": -1.132778 },
    { "id": 17, "name": "St Mary's Stadium", "lat": 50.905833, "lng": -1.391111 },
    { "id": 18, "name": "Tottenham Hotspur Stadium", "lat": 51.603333, "lng": -0.065833 },
    { "id": 20, "name": "Molineux Stadium", "lat": 52.590278, "lng": -2.130278 }
];

// Fisher-Yates Shuffle algorithm to randomize array, so stadiums aren't always in the same order
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]]; // Swap elements
    }
}

// Shuffle the locations when the game starts
shuffleArray(locations);

let currentLocationIndex = 0;
let score = 0;

// Get the current stadium
function getCurrentStadium() {
    return locations[currentLocationIndex];
}

// Render the game page with the current stadium location
app.get('/', (req, res) => {
    const stadium = getCurrentStadium();
    res.render('game', { lat: stadium.lat, lng: stadium.lng, score });
});

app.post('/guess', (req, res) => {
    // Ensure the lat and lng values are present or api will return an error
    const userLat = parseFloat(req.body.lat);
    const userLng = parseFloat(req.body.lng);

    // Check if lat and lng are valid numbers
    if (isNaN(userLat) || isNaN(userLng)) {
        // Redirect to the map page with an error message if no valid guess is made
        return res.redirect('/'); // or you can pass an error message via query params
    }

    const stadium = getCurrentStadium();
    const stadiumLat = stadium.lat;
    const stadiumLng = stadium.lng;

    // Calculate the distance between the guessed and actual location, using haversine for score
    const distance = haversineDistance(userLat, userLng, stadiumLat, stadiumLng);

    // Example scoring: closer to 0 km = higher score
    const scoreGained = Math.max(0, 100 - distance); // Distance in kilometers
    score += Math.round(scoreGained);

    // Render the results page with the distance, score, and both latitudes/longitudes
    res.render('result', {
        distance: distance.toFixed(2),
        scoreGained: Math.round(scoreGained),
        score,
        lat: stadiumLat,
        lng: stadiumLng,
        userLat: userLat,
        userLng: userLng
    });
});

// Route to move to the next location
app.post('/next', (req, res) => {
    currentLocationIndex++;
    if (currentLocationIndex < locations.length) {
        res.redirect('/');
    } else {
        res.render('end', { score, total: locations.length });
        currentLocationIndex = 0;
        score = 0; // Reset game
    }
});

// Haversine formula to calculate the great-circle distance between two points
// Way of computing distances between two points on the surface of a sphere using the ltd and lng
function haversineDistance(lat1, lng1, lat2, lng2) {
    const toRadians = (degree) => (degree * Math.PI) / 180;

    const R = 6371; // Radius of Earth in kilometers
    const dLat = toRadians(lat2 - lat1);
    const dLng = toRadians(lng2 - lng1);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRadians(lat1)) *
            Math.cos(toRadians(lat2)) *
            Math.sin(dLng / 2) *
            Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in kilometers
}

app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
