import React from 'react';

// Este componente é o HUD (Heads-Up Display) que fica sobre o jogo
function JogoUI({ score, time, playerName }) {
  return (
    <>
      <div id="info-usuario" className="game-ui">
        Jogador: <span>{playerName}</span>
      </div>
      <div id="score-display" className="game-ui">
        Pontos: <span>{score}</span>
      </div>
      <div id="timer-display" className="game-ui">
        Tempo: <span>{time}</span>
      </div>
    </>
  );
}

export default JogoUI;