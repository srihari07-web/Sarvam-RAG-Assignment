import React from 'react';
import { assets } from '../../assets/assets';

const Cards = ({ handleCardClick }) => {
  return (
    <>
    
      <div className="cards">
        <div className="card" onClick={() => handleCardClick("Explain the Pitch and Volume of Sound.")}>
          <p>Explain the Pitch and Volume of Sound.</p>
          <img src={assets.messagecardsicon} alt="" />
        </div>
        <div className="card" onClick={() => handleCardClick("What is the relationship between frequency and pitch in sound waves?")}>
          <p>What is the relationship between frequency and pitch in sound waves?</p>
          <img src={assets.messagecardsicon} alt="" />
        </div>
        <div className="card" onClick={() => handleCardClick("How does amplitude affect the loudness of a sound?")}>
          <p>How does amplitude affect the loudness of a sound?</p>
          <img src={assets.messagecardsicon} alt="" />
        </div>
      </div>
    </>
  );
};

export default Cards;
