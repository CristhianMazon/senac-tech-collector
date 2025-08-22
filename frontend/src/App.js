import React, { useState, useEffect, useCallback } from 'react';
import Phaser from 'phaser';
import axios from 'axios';

import Dashboard from './components/Dashboard';
import ScorePopup from './components/ScorePopup';
import ComoJogarPopup from './components/ComoJogarPopup';
import Cadastro from './components/Cadastro';
import JogoUI from './components/JogoUI';
import GameScene from './phaser/GameScene';

// Use a variável de ambiente para a URL da API, com um fallback para desenvolvimento local
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

function App() {
  const [gameState, setGameState] = useState('cadastro');
  const [showComoJogar, setShowComoJogar] = useState(false);
  const [playerData, setPlayerData] = useState(null);
  const [uiData, setUiData] = useState({ score: 0, time: 60 });
  const [lastGameResult, setLastGameResult] = useState(null);
  
  const gameInstanceRef = React.useRef(null);

  useEffect(() => {
    const savedPlayer = localStorage.getItem('playerData');
    if (savedPlayer) {
      setPlayerData(JSON.parse(savedPlayer));
      setGameState('dashboard');
    }
  }, []);

  const handleCadastro = useCallback(async (data) => {
    try {
      await axios.post(`${API_URL}/api/jogador`, data);
      localStorage.setItem('playerData', JSON.stringify(data));
      setPlayerData(data);
      setGameState('dashboard');
    } catch (error) {
      console.error("Erro ao cadastrar:", error);
      // Alterado para usar um alerta customizado em vez de alert()
      // alert("Não foi possível conectar ao servidor.");
      // Você pode implementar um modal ou mensagem na tela para o usuário
    }
  }, []);

  const handleLogout = useCallback(() => {
    localStorage.removeItem('playerData');
    setPlayerData(null);
    setGameState('cadastro');
  }, []);

  const handleShowComoJogar = useCallback(() => {
    setShowComoJogar(true);
  }, []);

  const handleStartGame = useCallback(() => {
    setShowComoJogar(false);
    setUiData({ score: 0, time: 60 });
    setGameState('jogando');
  }, []);
  
  const handleGameOver = useCallback(async (score, stats) => {
    try {
        await axios.post(`${API_URL}/api/partidas`, {
          email: playerData.email,
          score,
          stats
        });
        setLastGameResult({ score });
        setGameState('popup');
    } catch (error) {
        console.error("Erro ao salvar partida:", error);
        setGameState('dashboard');
    }
  }, [playerData]);

  const handleClosePopup = useCallback(() => {
    setLastGameResult(null);
    setGameState('dashboard');
  }, []);

  useEffect(() => {
    if (gameState === 'jogando' && !gameInstanceRef.current) {
      const config = {
        type: Phaser.AUTO,
        width: window.innerWidth,
        height: window.innerHeight,
        parent: 'jogo-container',
        backgroundColor: '#003B6F',
        physics: {
          default: 'arcade',
          arcade: {
            gravity: { y: 100 },
          },
        },
        scene: [GameScene]
      };
      const game = new Phaser.Game(config);
      game.events.on('updateUI', (data) => {
          setUiData(prev => ({ ...prev, ...data }));
      });
      game.scene.start('GameScene', { onGameOver: handleGameOver });
      gameInstanceRef.current = game;
    }
    
    if (gameState !== 'jogando' && gameInstanceRef.current) {
      gameInstanceRef.current.destroy(true);
      gameInstanceRef.current = null;
    }

    return () => {
      if (gameInstanceRef.current) {
        gameInstanceRef.current.destroy(true);
        gameInstanceRef.current = null;
      }
    };
  }, [gameState, handleGameOver]);

  return (
    <div className="App">
      {gameState === 'jogando' && (
        <>
          <div id="jogo-container" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1 }} />
          {playerData && (
            <JogoUI 
              score={uiData.score} 
              time={uiData.time} 
              playerName={playerData.nome.split(' ')[0]} 
            />
          )}
        </>
      )}

      {gameState === 'cadastro' && <Cadastro onCadastrar={handleCadastro} />}
      
      {playerData && gameState === 'dashboard' && (
        <Dashboard 
          player={playerData} 
          onPlay={handleShowComoJogar} 
          onLogout={handleLogout}
        />
      )}
      
      {gameState === 'popup' && lastGameResult && (
        <ScorePopup score={lastGameResult.score} onClose={handleClosePopup} />
      )}

      {showComoJogar && <ComoJogarPopup onStartGame={handleStartGame} />}
    </div>
  );
}

export default App;