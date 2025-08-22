import React from 'react';
import './JogoUI.css';

function JogoUI({ score, time, playerName }) {
    return (
        <>
            <div id="score-display" className="game-ui">
                Pontos: {score}
            </div>
            <div id="timer-display" className="game-ui">
                Tempo: {time}
            </div>
            <div id="info-usuario" className="game-ui">
                {playerName}
            </div>
        </>
    );
}

export default JogoUI;
