import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Dashboard.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

function Dashboard({ player, onPlay, onLogout, onStore }) {
  const [dashboardData, setDashboardData] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        console.log("Dashboard.js: Buscando dados para o email:", player.email);
        const dashPromise = axios.get(`${API_URL}/api/dashboard/${player.email}`);
        const leadPromise = axios.get(`${API_URL}/api/leaderboard/top`);
        const [dashResponse, leadResponse] = await Promise.all([dashPromise, leadPromise]);
        
        console.log("Dashboard.js: Dados do dashboard recebidos:", dashResponse.data);
        console.log("Dashboard.js: Dados do leaderboard recebidos:", leadResponse.data);
        
        setDashboardData(dashResponse.data);
        // Garante que a leaderboard é um array
        setLeaderboard(Array.isArray(leadResponse.data) ? leadResponse.data : []);
      } catch (error) {
        console.error("Dashboard.js: Erro ao buscar dados:", error);
        setDashboardData(null);
        setLeaderboard([]);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [player.email]);

  if (loading) {
    return (
        <header className="dashboard-header">
            <div className="player-name">CARREGANDO...</div>
        </header>
    );
  }

  // Verifica se os dados principais estão presentes antes de tentar renderizar
  if (!dashboardData) {
      return (
        <header className="dashboard-header">
            <div className="player-name">ERRO AO CARREGAR DADOS</div>
            <button className="logout-button" onClick={onLogout}>Sair</button>
        </header>
    );
  }

  const { nome_jogador, total_partidas, pontuacao_maxima_pessoal, ultima_pontuacao, stats_totais, techcoins } = dashboardData;

  return (
    <>
      <header className="dashboard-header">
        <div className="player-info">
          <div className="player-name">{nome_jogador.split(' ')[0].toUpperCase()}</div>
          <div className="vertical-divider"></div>
          <div className="company-name">Senac Hub de Tecnologia</div>
        </div>
        <div className="header-buttons">
          <button className="shop-button" onClick={onStore}>Loja</button>
          <button className="logout-button" onClick={onLogout}>Sair</button>
        </div>
      </header>
      
      <div className="dashboard-content-wrapper">
        <main className="dashboard-main">
          <div className="stats-column">
            <h3>Estatísticas Pessoais</h3>
            <div className="stat-box">Partidas: {total_partidas || 0}</div>
            <div className="stat-box">Última: {ultima_pontuacao || 0} pts</div>
            <div className="stat-box">Recorde: {pontuacao_maxima_pessoal || 0} pts</div>
            <div className="stat-box">Techcoins: {techcoins || 0} 🪙</div>
          </div>

          <div className="items-column">
            <h3>Total de Itens Coletados</h3>
            <div className="items-box">
              <div><span>🖥️</span> Monitor: {stats_totais?.computador || 0}</div>
              <div><span>🖱️</span> Mouse: {stats_totais?.mouse || 0}</div>
              <div><span>⌨️</span> Teclado: {stats_totais?.teclado || 0}</div>
              <div><span>🎓</span> Logo SENAC: {stats_totais?.senac || 0}</div>
              <div><span>⏰</span> Relógio: {stats_totais?.relogio || 0}</div>
              <div><span>🦠</span> Vírus: {stats_totais?.virus || 0}</div>
            </div>
          </div>

          <div className="stats-column">
            <h3>Recorde Global</h3>
            {leaderboard.length > 0 ? (
                leaderboard.map((record, index) => (
                    <div key={index} className="stat-box">
                        {index + 1}. {record.nome && typeof record.nome === 'string' ? record.nome.split(' ')[0] : 'Jogador'}: {record.pontuacao} pts
                    </div>
                ))
            ) : (
                <div className="stat-box">Nenhum recorde ainda.</div>
            )}
          </div>
        </main>

        <footer className="dashboard-footer">
          <button className="play-button" onClick={onPlay}>Jogar</button>
        </footer>
      </div>
    </>
  );
}

export default Dashboard;