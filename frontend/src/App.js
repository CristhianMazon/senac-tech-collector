import React, { useState, useEffect, useCallback } from 'react';
import Phaser from 'phaser';
import axios from 'axios';

import Dashboard from './components/Dashboard';
import ScorePopup from './components/ScorePopup';
import ComoJogarPopup from './components/ComoJogarPopup';
import Cadastro from './components/Cadastro';
import JogoUI from './components/JogoUI';
import GameScene from './phaser/GameScene';
import Loja from './components/Loja';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

function App() {
  const [gameState, setGameState] = useState('cadastro');
  const [showComoJogar, setShowComoJogar] = useState(false);
  const [playerData, setPlayerData] = useState(null);
  const [uiData, setUiData] = useState({ score: 0, time: 60 });
  const [lastGameResult, setLastGameResult] = useState(null);
  
  const gameInstanceRef = React.useRef(null);

  useEffect(() => {
    console.log("App.js: useEffect inicial");
    const savedPlayer = localStorage.getItem('playerData');
    if (savedPlayer) {
      console.log("App.js: Jogador encontrado no localStorage. Mudando para dashboard.");
      setPlayerData(JSON.parse(savedPlayer));
      setGameState('dashboard');
    }
  }, []);

  const handleCadastro = useCallback(async (data) => {
    console.log("App.js: Chamando handleCadastro com dados:", data);
    try {
      const response = await axios.post(`${API_URL}/api/jogador`, data);
      console.log("App.js: Resposta do backend recebida:", response);
      localStorage.setItem('playerData', JSON.stringify(data));
      setPlayerData(data);
      setGameState('dashboard');
    } catch (error) {
      console.error("App.js: Erro ao cadastrar:", error);
      alert("Não foi possível conectar ao servidor. Verifique sua conexão ou tente mais tarde.");
    }
  }, []);

  const handleLogout = useCallback(() => {
    console.log("App.js: Fazendo logout.");
    localStorage.removeItem('playerData');
    setPlayerData(null);
    setGameState('cadastro');
  }, []);

  const handleShowComoJogar = useCallback(() => {
    console.log("App.js: Exibindo popup Como Jogar.");
    setShowComoJogar(true);
  }, []);

  const handleStartGame = useCallback(() => {
    console.log("App.js: Iniciando jogo.");
    setShowComoJogar(false);
    setUiData({ score: 0, time: 60 });
    setGameState('jogando');
  }, []);
  
  const handleGameOver = useCallback(async (score, stats) => {
    console.log("App.js: Jogo terminou. Tentando salvar partida.");
    try {
        const response = await axios.post(`${API_URL}/api/partidas`, {
          email: playerData.email,
          score,
          stats
        });
        console.log("App.js: Resposta do backend ao salvar partida:", response);
        setLastGameResult({ score });
        setGameState('popup');
    } catch (error) {
        console.error("App.js: Erro ao salvar partida:", error);
        alert("Não foi possível salvar a partida. Tente novamente mais tarde.");
        setGameState('dashboard');
    }
  }, [playerData]);

  const handleClosePopup = useCallback(() => {
    console.log("App.js: Fechando popup de score.");
    setLastGameResult(null);
    setGameState('dashboard');
  }, []);

  // Novo handler para a loja
  const handleShowStore = useCallback(() => {
    setGameState('loja');
  }, []);

  const handleCloseStore = useCallback(() => {
    setGameState('dashboard');
  }, []);

  useEffect(() => {
    console.log("App.js: Estado do jogo atual:", gameState);
    if (gameState === 'jogando' && !gameInstanceRef.current) {
      console.log("App.js: Criando nova instância do jogo Phaser.");
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
      console.log("App.js: Destruindo instância do jogo Phaser.");
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
          onStore={handleShowStore}
        />
      )}
      
      {gameState === 'loja' && <Loja onClose={handleCloseStore} />}

      {gameState === 'popup' && lastGameResult && (
        <ScorePopup score={lastGameResult.score} onClose={handleClosePopup} />
      )}

      {showComoJogar && <ComoJogarPopup onStartGame={handleStartGame} />}
    </div>
  );
}

export default App;
