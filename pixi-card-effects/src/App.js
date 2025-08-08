import React, { useState } from 'react';
import './App.css'; // For basic styling
import ParallaxCard from './ParallaxCard';

function App() {
  const [activeEffect, setActiveEffect] = useState(null);

  const handleButtonClick = (effectName) => {
    setActiveEffect(effectName);
  };

  const handleReset = () => {
    setActiveEffect(null);
  };

  return (
    <div className="App">
      <h1>My super cool and shiny cards with awesome effects!</h1>
      <div className="card-container">
        <ParallaxCard  />
      </div>
    </div>
  );
}

export default App