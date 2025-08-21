import React from 'react';

function Instrucoes({ onStartGame }) {
  return (
    <div className="screen-container">
      <div className="box-style">
        <h2>Como Jogar</h2>
        <ul id="instrucoes-lista">
          <li><span>💻</span> +10 Pontos (Computador)</li>
          <li><span>🖱️</span> +10 Pontos (Mouse)</li>
          <li><span>⌨️</span> +10 Pontos (Teclado)</li>
          <li><span>🎓</span> +20 Pontos (Bônus SENAC)</li>
          <li><span>⏰</span> +5 Segundos (Tempo Extra)</li>
          <li><span>🦠</span> -15 Pontos (Cuidado com o Vírus!)</li>
        </ul>
        <button id="start-game-button" onClick={onStartGame}>
          Começar a Jogar!
        </button>
      </div>
    </div>
  );
}

export default Instrucoes;