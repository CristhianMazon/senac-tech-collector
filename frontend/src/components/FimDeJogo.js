import React from 'react';

function FimDeJogo({ score, onRestart }) {
  return (
    <div className="screen-container">
      <div className="box-style">
        <h2>Fim de Jogo!</h2>
        <p style={{ fontSize: '24px', color: '#00a9e0', fontWeight: 'bold' }}>
          Sua Pontuação Final: {score}
        </p>
        <button onClick={onRestart}>Jogar Novamente</button>
      </div>
    </div>
  );
}

export default FimDeJogo;