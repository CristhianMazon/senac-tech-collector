import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Loja.css';
import './Dashboard.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

function Loja({ player, onBack }) {
    const [itensLoja, setItensLoja] = useState([]);
    const [techcoins, setTechcoins] = useState(0);
    const [loading, setLoading] = useState(true);

    // O useEffect é chamado para buscar os dados da loja e do jogador
    useEffect(() => {
        if (!player || !player.email) {
            setLoading(false);
            return;
        }

        async function fetchData() {
            try {
                setLoading(true);
                const itensResponse = await axios.get(`${API_URL}/api/loja/itens`);
                setItensLoja(itensResponse.data);

                const dashboardResponse = await axios.get(`${API_URL}/api/dashboard/${player.email}`);
                setTechcoins(dashboardResponse.data.techcoins || 0);

            } catch (error) {
                console.error("Erro ao buscar dados da loja:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [player]);

    // A função handleBuy precisa estar dentro do componente para ser acessada
    const handleBuy = async (itemId, itemCusto) => {
        if (techcoins >= itemCusto) {
            try {
                await axios.post(`${API_URL}/api/loja/comprar`, {
                    email: player.email,
                    itemId: itemId,
                });
                alert('Compra realizada com sucesso!');
                setTechcoins(techcoins - itemCusto);
            } catch (error) {
                alert(error.response?.data?.error || 'Erro ao realizar a compra.');
                console.error("Erro ao comprar item:", error);
            }
        } else {
            alert('Techcoins insuficientes!');
        }
    };

    // Renderização condicional no topo do componente para evitar erros
    if (loading) {
        return (
            <header className="dashboard-header">
                <div className="player-name">CARREGANDO LOJA...</div>
            </header>
        );
    }
    
    if (!player) {
        return (
          <header className="dashboard-header">
            <div className="player-name">ERRO AO CARREGAR DADOS</div>
            <button className="logout-button" onClick={onBack}>Voltar</button>
          </header>
        );
    }
      
    // Renderização principal do componente
    return (
        <>
            <header className="dashboard-header">
                <div className="player-info">
                    <div className="player-name">{player.nome.split(' ')[0].toUpperCase()}</div>
                    <div className="vertical-divider"></div>
                    <div className="company-name">Senac Hub de Tecnologia</div>
                </div>
                <div className="header-buttons">
                    <button className="logout-button" onClick={onBack}>Voltar</button>
                </div>
            </header>

            <div className="dashboard-content-wrapper">
                <main className="loja-main">
                    <div className="stats-column">
                        <h3>Suas Moedas</h3>
                        <div className="stat-box">
                            Techcoins: {techcoins} 🪙
                        </div>
                    </div>

                    <div className="itens-column">
                        <h3>Itens Disponíveis</h3>
                        <div className="loja-itens-grid">
                            {itensLoja.map(item => (
                                <div key={item.id} className="item-card">
                                    <span className="item-emoji">{item.emoji}</span>
                                    <h3>{item.nome}</h3>
                                    <p>{item.descricao}</p>
                                    <div className="item-footer">
                                        <span className="item-cost">{item.custo} 🪙</span>
                                        <button className="buy-button" onClick={() => handleBuy(item.id, item.custo)}>
                                            Comprar
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </main>
                
                <footer className="dashboard-footer">
                    <button className="play-button" onClick={onBack}>Voltar ao Dashboard</button>
                </footer>
            </div>
        </>
    );
}

export default Loja;