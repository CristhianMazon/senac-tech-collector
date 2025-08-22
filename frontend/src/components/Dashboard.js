import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Dashboard.css';

// Usar a variável de ambiente para a URL da API
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

function Dashboard({ player, onPlay, onLogout }) {
  const [dashboardData, setDashboardData] = useState(null);
  const [leaderboard, setLeaderboard] = useState(null);
  const [loading, setLoading] = useState(true);

  // Removendo o useEffect de redimensionamento
  // O CSS flexível já lida com a responsividade.

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        console.log("Dashboard.js: Buscando dados para o email:", player.email); // Log para debug
        const dashPromise = axios.get(`${API_URL}/api/dashboard/${player.email}`);
        const leadPromise = axios.get(`${API_URL}/api/leaderboard/top`);
        const [dashResponse, leadResponse] = await Promise.all([dashPromise, leadPromise]);
        
        console.log("Dashboard.js: Dados do dashboard recebidos:", dashResponse.data); // Log para debug
        console.log("Dashboard.js: Dados do leaderboard recebidos:", leadResponse.data); // Log para debug
        
        setDashboardData(dashResponse.data);
        setLeaderboard(leadResponse.data);
      } catch (error) {
        console.error("Dashboard.js: Erro ao buscar dados:", error);
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

  if (!dashboardData || !leaderboard) {
      return (
        <header className="dashboard-header">
            <div className="player-name">ERRO</div>
            <button className="logout-button" onClick={onLogout}>Sair</button>
        </header>
    );
  }

  const { total_partidas, pontuacao_maxima_pessoal, ultima_pontuacao, stats_totais } = dashboardData;

  return (
    <>
      <header className="dashboard-header">
        <div className="player-info">
          <div className="player-name">{player.nome.split(' ')[0].toUpperCase()}</div>
          <div className="vertical-divider"></div>
          <div className="company-name">Senac Hub de Tecnologia</div>
        </div>
        <button className="logout-button" onClick={onLogout}>Sair</button>
      </header>
      
      <div className="dashboard-content-wrapper">
        <main className="dashboard-main">
          <div className="stats-column">
            <h3>Estatísticas Pessoais</h3>
            <div className="stat-box">Partidas: {total_partidas || 0}</div>
            <div className="stat-box">Última: {ultima_pontuacao || 0} pts</div>
            <div className="stat-box">Recorde: {pontuacao_maxima_pessoal || 0} pts</div>
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
            <div className="stat-box">{leaderboard.nome.split(' ')[0]}</div>
            <div className="stat-box">{leaderboard.pontuacao} pts</div>
            <div className="stat-box"><span>🏆</span></div>
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
