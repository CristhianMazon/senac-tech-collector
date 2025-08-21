import React from 'react';

function ScorePopup({ score, onClose }) {
  return (
    // Aplicando as novas classes de estilo
    <div className="form-popup-overlay">
      <div className="form-popup-box">
        <h2>Fim de Jogo!</h2>
        <p style={{ fontSize: '2rem', color: '#FFFFFF' }}>
          Sua Pontuação Final foi:
          <br/>
          <strong style={{ color: 'var(--azul-brilhante)', fontSize: '3rem' }}>{score}</strong>
        </p>
        <button onClick={onClose}>Dashboard</button>
      </div>
    </div>
  );
}

export default ScorePopup;