import { useState, useEffect } from "react";
import Game from './components/Game';
import Tutorial from './components/Tutorial';

const App = () => {
  const [score, setScore] = useState(0);
  const [locations, setLocations] = useState([]);
  const [showTutorial, setShowTutorial] = useState(true);

  // Fetch locations from the backend
  useEffect(() => {
    fetch('http://localhost:5000/api/locations')
      .then((response) => response.json())
      .then((data) => setLocations(data))
      .catch((error) => console.error('Error fetching locations:', error));
  }, []);

  const handleTutorialComplete = () => {
    setShowTutorial(false);
  };

  return (
    <div className="app-container">
      {showTutorial && <Tutorial onComplete={handleTutorialComplete} />}
      {!showTutorial && (
        locations.length > 0 ? (
          <Game
            locations={locations}
            score={score}
            setScore={setScore}
          />
        ) : (
          <p>Loading stadiums...</p>
        )
      )}
    </div>
  );
};

export default App;