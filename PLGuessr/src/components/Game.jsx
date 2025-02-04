import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { haversineDistance } from "../utils/haversine";
import "./Game.css";

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
const DEFAULT_CENTER = { lat: 54.0, lng: -2.0 };

const shuffleLocations = (locations) => {
  return [...locations].sort(() => Math.random() - 0.5);
};

const AlertMessage = () => {
  // Container slides in from off-screen left.
  const containerVariants = {
    // FRAMER MOTION different phases of the animation/variants of components
    initial: { x: "-100vw" },
    animate: { x: 0, transition: { duration: 0.5 } },
    exit: {
      x: "100vw",
      transition: { delay: 1.5, duration: 1.3, ease: "easeInOut" },
    },
  };

  const textVariants = {
    initial: { opacity: 1, clipPath: "inset(0 0 0 0)" },
    animate: { opacity: 1, clipPath: "inset(0 0 0 0)" },
    exit: {
      opacity: 0,
      clipPath: "inset(0 0 0 100%)",
      transition: { duration: 0.5, ease: "easeInOut" },
    },
  };

  const imageVariants = {
    initial: { x: 0 },
    animate: {
      x: 190,
      transition: { delay: 2.3, duration: 1.5, ease: "easeInOut" },
    },
  };

  const overlayVariants = {
    initial: { width: 0 },
    exit: {
      width: "100%",
      transition: { duration: 0.5, ease: "easeInOut" },
    },
  };

  return (
    <motion.div // motion.div is a component that animates the div
      className="alert-container"
      variants={containerVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      style={{
        position: "fixed",
        top: "20px",
        left: "40%",
        zIndex: 1000,
        width: "300px",
        borderRadius: "5px",
        backgroundColor: "#230076",
        overflow: "visible",
      }}
    >
      <div
        className="alert-content"
        style={{
          display: "flex",
          alignItems: "center",
          position: "relative",
          padding: "10px 10px",
        }}
      >
        {/* Logo image */}
        <motion.img
          src="/images/VARlogo.svg"
          alt="Icon"
          variants={imageVariants}
          initial="initial"
          animate="animate"
          style={{
            width: "80px",
            height: "auto",
            marginRight: "10px",
            position: "relative",
            zIndex: 2,
            backgroundColor: "#230076",
          }}
        />

        {/* Alert text */}
        <motion.span
          variants={textVariants}
          initial="initial"
          exit="exit"
          style={{
            color: "white",
            fontWeight: "bold",
            flex: 1,
            position: "relative",
            zIndex: 1,
          }}
        >
          Please make a guess first!
        </motion.span>
      </div>
    </motion.div>
  );
};

const Game = ({ locations, score, setScore }) => {
  const streetViewRef = useRef(null);
  const guessMapRef = useRef(null);
  const resultMapRef = useRef(null);
  const guessMarkerRef = useRef(null);

  const [guess, setGuess] = useState(null);
  const [guessMap, setGuessMap] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [distance, setDistance] = useState(null);
  const [newScore, setNewScore] = useState(null);
  const [stadiumIndex, setStadiumIndex] = useState(0);
  const [showAlert, setShowAlert] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  const [randomizedLocations, setRandomizedLocations] = useState(() => {
    return locations && locations.length ? shuffleLocations(locations) : [];
  });

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
      if (streetViewRef.current) {
        new window.google.maps.StreetViewPanorama(streetViewRef.current, {
          position: { lat: stadium.lat, lng: stadium.lng },
          pov: { heading: 165, pitch: 0 },
          zoom: 1,
          fullscreenControl: false,
          disableDefaultUI: true,
        });
      }

      if (guessMapRef.current) {
        const newGuessMap = new window.google.maps.Map(guessMapRef.current, {
          center: DEFAULT_CENTER,
          zoom: 5,
          fullscreenControl: false,
          disableDefaultUI: true,
        });
        setGuessMap(newGuessMap);

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

  useEffect(() => {
    if (
      modalVisible &&
      resultMapRef.current &&
      guess &&
      randomizedLocations[stadiumIndex]
    ) {
      const stadium = randomizedLocations[stadiumIndex];
      let zoomLevel = 10;
      if (distance > 200) zoomLevel = 4;
      else if (distance > 50) zoomLevel = 5;
      else if (distance > 10) zoomLevel = 8;

      const resultMap = new window.google.maps.Map(resultMapRef.current, {
        center: stadium,
        zoom: zoomLevel,
        fullscreenControl: false,
        disableDefaultUI: true,
      });

      new window.google.maps.Marker({
        position: guess,
        map: resultMap,
        title: "Your Guess",
      });
      new window.google.maps.Marker({
        position: stadium,
        map: resultMap,
        title: "Actual Stadium",
      });
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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!guess) {
      setShowAlert(true);
      // Allow time for the alert’s entry and exit animations.
      setTimeout(() => {
        setShowAlert(false);
      }, 2500);
      return;
    }

    const stadium = randomizedLocations[stadiumIndex];
    if (!stadium || !stadium.lat || !stadium.lng) {
      console.error("Invalid stadium data:", stadium);
      return;
    }

    const dist = haversineDistance(
      guess.lat,
      guess.lng,
      stadium.lat,
      stadium.lng
    );
    setDistance(dist);
    const newGameScore = +(Math.max(0, 100 - dist).toFixed(2));
    setScore(score + newGameScore);
    setNewScore(newGameScore);
    setModalVisible(true);
  };

  // When no more stadiums remain, show a game over overlay instead of automatically restarting.
  // Deals with what happens when the user clicks "Next Stadium" after the last stadium.
  const handleNextStadium = () => {
    if (stadiumIndex + 1 < randomizedLocations.length) {
      setStadiumIndex(stadiumIndex + 1);
      setGuess(null);
      setModalVisible(false);
      if (guessMarkerRef.current) {
        guessMarkerRef.current.setMap(null);
        guessMarkerRef.current = null;
      }
    } else {
      // Game over: show the overlay with final score and restart option.
      setGameOver(true);
      setModalVisible(true);
    }
  };

  const handleRestart = () => {
    // Restart the game: reset index, score, game over flag, and other state.
    setStadiumIndex(0);
    setRandomizedLocations(shuffleLocations(locations));
    setScore(0);
    setModalVisible(false);
    setGameOver(false);
    setGuess(null);
    if (guessMarkerRef.current) {
      guessMarkerRef.current.setMap(null);
      guessMarkerRef.current = null;
    }
  };

  return (
    <div className="game-container">
      <h1 className="game-title">
        <img
          src="/images/PLlogo.svg"
          alt="Premier League Logo"
          width="100"
          height="100"
        />
        PLGuessr
      </h1>
      <div ref={streetViewRef} className="street-view"></div>

      <div ref={guessMapRef} className="guess-map"></div>

      <form onSubmit={handleSubmit} className="game-form">
        <button type="submit" className="submit-btn">
          Submit Guess
        </button>
      </form>

      {/* Alert message */}
      <AnimatePresence>
        {showAlert && <AlertMessage />}
      </AnimatePresence>

      {/* Result overlay , if game over display final score and restart option, otherwise display guess and score */}
      {modalVisible && (
        <div className="overlay">
          <div className="overlay-card">
            {gameOver ? (
              <>
                <div className="overlay-card-title">Game Over!</div>
                <div className="overlay-card-body">
                  <div className="match">
                    <span className="team">Final Score</span>
                    <span className="score">{score.toFixed(2)}</span>
                  </div>
                  <button onClick={handleRestart} className="next-stadium-btn">
                    Restart
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="overlay-card-title">Your Guess</div>
                <div className="overlay-card-body">
                  <div className="match">
                    <span className="team">Score</span>
                    <span className="score">{newScore.toFixed(2)}</span>
                  </div>
                  <div className="match">
                    <span className="team">Overall Score</span>
                    <span className="score">{score.toFixed(2)}</span>
                  </div>
                  {/* Result map */}
                  <div ref={resultMapRef} className="result-map"></div>
                  <div className="attendance">
                    Distance: {distance.toFixed(2)}km
                    <p>
                      ({stadiumIndex + 1}/{randomizedLocations.length})
                    </p>
                  </div>
                  <button onClick={handleNextStadium} className="next-stadium-btn">
                    Next Stadium
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Game;
