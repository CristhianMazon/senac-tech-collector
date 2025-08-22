import React, { useState } from 'react';
import api from '../api'; // Importa a instância do axios

const Cadastro = ({ onCadastroSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleCadastro = async (e) => {
    e.preventDefault();
    try {
      // Usa a instância 'api' e a rota correta '/api/register'
      const response = await api.post('/api/register', { username, password });
      console.log('Cadastro bem-sucedido:', response.data);
      onCadastroSuccess(); // Chama a função para voltar ao login
    } catch (err) {
      console.error('Erro ao cadastrar:', err);
      setError('Erro ao cadastrar. Tente outro nome de usuário.');
    }
  };

  return (
    <div className="auth-container">
      <h2>Cadastro</h2>
      <form onSubmit={handleCadastro}>
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
        <button type="submit">Cadastrar</button>
      </form>
      {error && <p className="error">{error}</p>}
    </div>
  );
};

export default Cadastro;