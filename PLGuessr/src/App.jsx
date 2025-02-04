import { useState, useEffect } from "react";
import Game from './components/Game';

const App = () => {
  const [score, setScore] = useState(0);
  const [locations, setLocations] = useState([]);

  // Fetch locations from the backend
  useEffect(() => {
    fetch('http://localhost:5000/api/locations')
      .then((response) => response.json())
      .then((data) => setLocations(data))
      .catch((error) => console.error('Error fetching locations:', error));
  }, []);

  // Update score in the backend
  const updateScore = (newScore) => {
    fetch('http://localhost:5000/api/update-score', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ score: newScore }),
    })
      .then((response) => response.json())
      .then((data) => console.log(data))
      .catch((error) => console.error('Error updating score:', error));
  };
//
  return (
    <div>
      {locations.length > 0 ? (
        <Game
          locations={locations}
          score={score}
          setScore={(newScore) => {
            setScore(newScore);
            updateScore(newScore);
          }}
        />
      ) : (
        <p>Loading locations...</p>
      )}
    </div>
  );
};

export default App;