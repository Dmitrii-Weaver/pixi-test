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
      <h1>My Super cool and shiny card with awesome effects!</h1>
      <div className="card-container">
        <ParallaxCard  />
      </div>
    </div>
  );
}

export default App