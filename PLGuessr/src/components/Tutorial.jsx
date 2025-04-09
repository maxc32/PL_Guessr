import { useState } from 'react';
import './Tutorial.css';

const Tutorial = ({ onComplete }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const totalPages = 2;

  const nextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    } else {
      onComplete();
    }
  };

  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <div className="tutorial-container">
      <div className="tutorial-content">
        <div className={`tutorial-page ${currentPage === 0 ? 'active' : ''}`}>
          <div className="tutorial-page-content">
            <h2>Welcome to PLGuessr!</h2>
            <div className="tutorial-image">
              <img src="/images/PLlogo.svg" alt="Premier League Logo" />
            </div>
            <p>
              Test your knowledge of Premier League stadium locations in this map based game.
              You'll be shown a street view of a stadium and need to guess its location on the map.
            </p>
            <div className="tutorial-navigation">
              <button 
                className="tutorial-btn skip-btn" 
                onClick={onComplete}
              >
                Skip Tutorial
              </button>
              <button 
                className="tutorial-btn next-btn" 
                onClick={nextPage}
              >
                Next
              </button>
            </div>
          </div>
        </div>

        <div className={`tutorial-page ${currentPage === 1 ? 'active' : ''}`}>
          <div className="tutorial-page-content">
            <h2>How to Play</h2>
            <div className="tutorial-steps">
              <div className="tutorial-step">
                <div className="step-number">1</div>
                <div className="step-text">You'll be shown a street view of a Premier League stadium</div>
              </div>
              <div className="tutorial-step">
                <div className="step-number">2</div>
                <div className="step-text">Use the small guess map in the corner to place your guess marker</div>
              </div>
              <div className="tutorial-step">
                <div className="step-number">3</div>
                <div className="step-text">You have 30 seconds for each guess - be sure to place a guess before the time runs out!</div>
              </div>
              <div className="tutorial-step">
                <div className="step-number">4</div>
                <div className="step-text">Your score is based on how close your guess is to the actual location</div>
              </div>
            </div>
            <div className="tutorial-navigation">
              <button 
                className="tutorial-btn prev-btn" 
                onClick={prevPage}
              >
                Previous
              </button>
              <button 
                className="tutorial-btn start-btn" 
                onClick={onComplete}
              >
                Start Game
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tutorial; 