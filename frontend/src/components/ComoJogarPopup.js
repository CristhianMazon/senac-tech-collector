import React from 'react';

function ComoJogarPopup({ onStartGame }) {
  return (
    <div className="form-popup-overlay">
      <div className="form-popup-box">
        <h2>Como Jogar</h2>
        {/* ================================================================== */}
        {/* MUDANÇA AQUI: Separamos a lista de itens para maior clareza     */}
        {/* ================================================================== */}
        <ul id="instrucoes-lista">
          <li><span>💻</span> +10 Pontos (Computador)</li>
          <li><span>🖱️</span> +10 Pontos (Mouse)</li>
          <li><span>⌨️</span> +10 Pontos (Teclado)</li>
          <li><span>🎓</span> +20 Pontos (Bônus SENAC)</li>
          <li><span>⏰</span> +5 Segundos (Tempo Extra)</li>
          <li><span>🦠</span> -15 Pontos (Cuidado com o Vírus!)</li>
        </ul>
        <button onClick={onStartGame}>Estou Pronto!</button>
      </div>
    </div>
  );
}

export default ComoJogarPopup;