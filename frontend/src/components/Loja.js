import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Loja.css'; // Você precisará criar este arquivo CSS

// URL do backend local
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

function Loja({ onClose }) {
  const [lojaItens, setLojaItens] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLojaItens() {
      try {
        const response = await axios.get(`${API_URL}/api/loja/itens`);
        setLojaItens(response.data);
      } catch (error) {
        console.error("Erro ao buscar itens da loja:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchLojaItens();
  }, []);

  // Esta função será implementada quando a rota de compra estiver pronta no backend
  const handleBuyItem = async (itemId) => {
    // Lógica para comprar o item
    console.log("Comprando item:", itemId);
  };

  if (loading) {
    return (
      <div className="form-popup-overlay">
        <div className="form-popup-box">
          <h2>Carregando Loja...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="form-popup-overlay">
      <div className="form-popup-box">
        <h2>Loja de Prêmios</h2>
        <div className="loja-itens-grid">
          {lojaItens.map(item => (
            <div key={item.id} className="item-card">
              <div className="item-emoji">{item.emoji}</div>
              <h3>{item.nome}</h3>
              <p>{item.descricao}</p>
              <div className="item-footer">
                <span className="item-cost">{item.custo} Techcoins</span>
                <button className="buy-button" onClick={() => handleBuyItem(item.id)}>Comprar</button>
              </div>
            </div>
          ))}
        </div>
        <button className="close-button" onClick={onClose}>Fechar</button>
      </div>
    </div>
  );
}

export default Loja;
