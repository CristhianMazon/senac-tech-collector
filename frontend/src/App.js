import React, { useState, useEffect } from 'react';
import api from './api'; // Importa a instância do axios
import Dashboard from './components/Dashboard';
import Cadastro from './components/Cadastro';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showCadastro, setShowCadastro] = useState(false);
  const [scores, setScores] = useState([]);

  useEffect(() => {
    fetchScores();
  }, []);

  const fetchScores = async () => {
    try {
      // Usa a instância 'api' e a rota correta '/api/scores'
      const response = await api.get('/api/scores');
      setScores(response.data);
    } catch (err)
    {
      console.error('Erro ao buscar scores:', err);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      // Usa a instância 'api' e a rota correta '/api/login'
      const response = await api.post('/api/login', { username, password });
      setUser(response.data.user);
      setError('');
    } catch (err) {
      console.error('Erro no login:', err);
      setError('Usuário ou senha inválidos.');
    }
  };

  const handleFimDeJogo = async (score) => {
    if (user) {
      try {
        // Usa a instância 'api' e a rota correta '/api/scores'
        await api.post('/api/scores', { userId: user.id, score });
        fetchScores(); // Atualiza a lista de scores
      } catch (err) {
        console.error('Erro ao salvar pontuação:', err);
      }
    }
  };

  const handleLogout = () => {
    setUser(null);
    setUsername('');
    setPassword('');
  };

  if (user) {
    return <Dashboard user={user} onLogout={handleLogout} onGameEnd={handleFimDeJogo} scores={scores} />;
  }

  if (showCadastro) {
    return <Cadastro onCadastroSuccess={() => setShowCadastro(false)} />;
  }

  return (
    <div className="App">
      <div className="auth-container">
        <h1>Senac Tech Collector</h1>
        <form onSubmit={handleLogin}>
          <input
            type="text"
            placeholder="Usuário"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit">Login</button>
        </form>
        {error && <p className="error">{error}</p>}
        <button className="link-button" onClick={() => setShowCadastro(true)}>Não tem uma conta? Cadastre-se</button>
      </div>
    </div>
  );
}

export default App;