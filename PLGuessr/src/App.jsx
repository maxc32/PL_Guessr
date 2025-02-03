import { useState } from "react";
import Game from './components/Game'; // Import Game here
import locations from './data/locations.json'; // Adjust path based on file structure

const App = () => {
    const [score, setScore] = useState(0); // Initial score

    return (
        <div>
            <Game 
                locations={locations}
                score={score} 
                setScore={setScore} 
            />
        </div>
    );
};

export default App;
