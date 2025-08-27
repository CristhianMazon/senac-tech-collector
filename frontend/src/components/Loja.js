import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Loja.css'; // Importa os estilos da loja
import './Dashboard.css'; // Reutiliza alguns estilos do dashboard

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

function Loja({ player, onBack }) {
    const [itensLoja, setItensLoja] = useState([]);
    const [techcoins, setTechcoins] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                setLoading(true);
                // Busca os itens da loja
                const itensResponse = await axios.get(`${API_URL}/api/loja/itens`);
                setItensLoja(itensResponse.data);

                // Busca o saldo de Techcoins do jogador
                const dashboardResponse = await axios.get(`${API_URL}/api/dashboard/${player.email}`);
                setTechcoins(dashboardResponse.data.techcoins || 0);

            } catch (error) {
                console.error("Erro ao buscar dados da loja:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [player.email]);

    const handleBuy = async (itemId, itemCusto) => {
        if (techcoins >= itemCusto) {
            try {
                await axios.post(`${API_URL}/api/loja/comprar`, {
                    email: player.email,
                    itemId: itemId,
                });
                alert('Compra realizada com sucesso!');
                // Atualiza o saldo de techcoins após a compra
                setTechcoins(techcoins - itemCusto);
            } catch (error) {
                alert(error.response?.data?.error || 'Erro ao realizar a compra.');
                console.error("Erro ao comprar item:", error);
            }
        } else {
            alert('Techcoins insuficientes!');
        }
    };

    if (loading) {
        return (
            <header className="dashboard-header">
                <div className="player-name">CARREGANDO LOJA...</div>
            </header>
        );
    }

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
                    {/* Coluna da esquerda com as informações do jogador */}
                    <div className="stats-column">
                        <h3>Suas Moedas</h3>
                        <div className="stat-box">
                            Techcoins: {techcoins} 🪙
                        </div>
                    </div>

                    {/* Coluna da direita com os itens da loja */}
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