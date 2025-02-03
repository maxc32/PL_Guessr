import { useEffect, useState, useRef } from "react";
import { haversineDistance } from "../utils/haversine"; // Import your haversine function
import "./Game.css"; // Import the CSS file

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
const DEFAULT_CENTER = { lat: 54.0, lng: -2.0 }; // Center on the UK for PL stadiums

// Helper function to shuffle the locations
const shuffleLocations = (locations) => {
  return [...locations].sort(() => Math.random() - 0.5);
};

const Game = ({ locations, score, setScore }) => {
  const streetViewRef = useRef(null);
  const guessMapRef = useRef(null);
  const resultMapRef = useRef(null); // Result map ref
  const guessMarkerRef = useRef(null);

  const [guess, setGuess] = useState(null);
  const [guessMap, setGuessMap] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [distance, setDistance] = useState(null);
  const [newScore, setNewScore] = useState(null);
  const [stadiumIndex, setStadiumIndex] = useState(0);

  // Lazy initialization: Shuffle locations only once when the component mounts
  const [randomizedLocations, setRandomizedLocations] = useState(() => {
    if (locations && locations.length > 0) {
      return shuffleLocations(locations);
    }
    return [];
  });

  // Initialize maps and StreetView when stadiumIndex or randomizedLocations change
  useEffect(() => {
    if (!locations || locations.length === 0) {
      console.error("No locations available for the game.");
      return;
    }

    if (stadiumIndex >= randomizedLocations.length) return;
    const stadium = randomizedLocations[stadiumIndex];

    if (!stadium || !stadium.lat || !stadium.lng) {
      console.error("Invalid stadium data:", stadium);
      return;
    }

    const loadGoogleMaps = () => {
      if (!window.google) {
        const script = document.createElement("script");
        script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&callback=initMaps`;
        script.async = true;
        script.defer = true;
        document.body.appendChild(script);
        script.onload = () => initMaps();
      } else {
        initMaps();
      }
    };

    const initMaps = () => {
      // Initialize Street View
      if (streetViewRef.current) {
        new window.google.maps.StreetViewPanorama(streetViewRef.current, {
          position: { lat: stadium.lat, lng: stadium.lng },
          pov: { heading: 165, pitch: 0 },
          zoom: 1,
          fullscreenControl: false,
          disableDefaultUI: true,
        });
      }

      // Initialize Guess Map
      if (guessMapRef.current) {
        const newGuessMap = new window.google.maps.Map(guessMapRef.current, {
          center: DEFAULT_CENTER,
          zoom: 6,
          fullscreenControl: false,
          disableDefaultUI: true,
        });
        setGuessMap(newGuessMap);

        // Add click listener for making a guess
        newGuessMap.addListener("click", function (event) {
          if (!event.latLng) {
            console.error("Invalid latLng value", event);
            return;
          }

          if (guessMarkerRef.current) {
            guessMarkerRef.current.setPosition(event.latLng);
          } else {
            guessMarkerRef.current = new window.google.maps.Marker({
              position: event.latLng,
              map: newGuessMap,
              title: "Guess",
            });
          }

          setGuess(event.latLng.toJSON());
        });
      }
    };

    loadGoogleMaps();
  }, [locations, stadiumIndex, randomizedLocations]);

  // Display the result map with markers and a line when the modal is visible
  useEffect(() => {
    if (modalVisible && resultMapRef.current && guess && randomizedLocations[stadiumIndex]) {
      const stadium = randomizedLocations[stadiumIndex];
      console.log(stadium);
      let zoomLevel = 10;
      if (distance > 200) zoomLevel = 5;
      else if (distance > 50) zoomLevel = 6;
      else if (distance > 10) zoomLevel = 9;

      const resultMap = new window.google.maps.Map(resultMapRef.current, {
        center: stadium,
        zoom: zoomLevel,
        fullscreenControl: false,
        disableDefaultUI: true,
      });

      // Marker for the player's guess
      new window.google.maps.Marker({
        position: guess,
        map: resultMap,
        title: "Your Guess",
      });

      // Marker for the actual stadium
      new window.google.maps.Marker({
        position: stadium,
        map: resultMap,
        title: "Actual Stadium",
      });

      // Draw the line between guess and actual stadium
      const newLine = new window.google.maps.Polyline({
        path: [guess, stadium],
        geodesic: true,
        strokeColor: "#FF0000",
        strokeOpacity: 1.0,
        strokeWeight: 2,
      });

      newLine.setMap(resultMap);
    }
  }, [modalVisible, guess, randomizedLocations, stadiumIndex, distance]);

  // Handle form submission for a guess
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!guess) {
      alert("Please make a guess first!");
      return;
    }

    const stadium = randomizedLocations[stadiumIndex];
    if (!stadium || !stadium.lat || !stadium.lng) {
      console.error("Invalid stadium data:", stadium);
      return;
    }

    const dist = haversineDistance(guess.lat, guess.lng, stadium.lat, stadium.lng);
    setDistance(dist);

    const newGameScore = +(Math.max(0, 100 - dist).toFixed(2));
    setScore(score + newGameScore);
    setNewScore(newGameScore);

    setModalVisible(true);
  };

  // Handle moving to the next stadium, or restarting the game if at the end of the list
  const handleNextStadium = () => {
    if (stadiumIndex + 1 < randomizedLocations.length) {
      setStadiumIndex(stadiumIndex + 1);
    } else {
      alert("Game Over! Restarting...");
      // Reset the stadium index
      setStadiumIndex(0);
      // Re-shuffle the locations for a new game
      setRandomizedLocations(shuffleLocations(locations));
    }

    // Reset guess and modal state
    setGuess(null);
    setModalVisible(false);

    // Remove old guess marker
    if (guessMarkerRef.current) {
      guessMarkerRef.current.setMap(null);
      guessMarkerRef.current = null;
    }
  };

  return (
    <div className="game-container">
      <h1 className="game-title">
        <img
          src="/images/pl.png"
          alt="Premier League Logo"
          width="50"
          height="50"
          style={{ marginRight: "10px" }}
        />
        Guess the Premier League Stadium Location
      </h1>
      <div ref={streetViewRef} className="street-view"></div>
      <div ref={guessMapRef} className="guess-map"></div>
      <form onSubmit={handleSubmit} className="game-form">
        <button type="submit" className="submit-button">
          Submit Guess
        </button>
      </form>
      <h3 className="game-score">Score: {score}</h3>

      {modalVisible && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Result</h2>
            <p>Distance to the actual stadium: {distance?.toFixed(2)} km</p>
            <p>Your Score: {newScore}</p>
            <div
              ref={resultMapRef}
              className="result-map"
              style={{ width: "100%", height: "300px" }}
            ></div>
            <button onClick={handleNextStadium} className="next-stadium-button">
              Next Stadium
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Game;
