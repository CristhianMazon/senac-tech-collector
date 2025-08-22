const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
const port = 3001;

// Configuração para conectar ao seu banco de dados LOCAL
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'senac_jogo',
  password: 'Liloka*8', 
  port: 5432,
});

app.use(cors());
app.use(express.json());

// ROTA 1: Cadastro/Login do jogador
app.post('/api/jogador', async (req, res) => {
  const { nome, email, telefone } = req.body;
  try {
    const query = `
      INSERT INTO jogadores (nome, email, telefone)
      VALUES ($1, $2, $3)
      ON CONFLICT (email) DO NOTHING;
    `;
    await pool.query(query, [nome, email, telefone]);
    res.status(201).json({ message: 'Jogador cadastrado ou já existente.' });
  } catch (error) {
    console.error('Erro ao salvar jogador:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
});

// ROTA 2: Salvar o resultado de uma partida
app.post('/api/partidas', async (req, res) => {
  const { email, score, stats } = req.body;
  try {
    const query = 'INSERT INTO partidas (jogador_email, pontuacao, stats_coletados) VALUES ($1, $2, $3)';
    await pool.query(query, [email, score, stats]);
    res.status(201).json({ message: 'Partida salva com sucesso!' });
  } catch (error) {
    console.error('Erro ao salvar partida:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
});

// ROTA 3: Buscar dados para o dashboard
app.get('/api/dashboard/:email', async (req, res) => {
  const { email } = req.params;
  try {
    const query = `
      SELECT
        (SELECT nome FROM jogadores WHERE email = $1) as nome_jogador,
        (SELECT COUNT(*) FROM partidas WHERE jogador_email = $1) as total_partidas,
        (SELECT MAX(pontuacao) FROM partidas WHERE jogador_email = $1) as pontuacao_maxima_pessoal,
        (SELECT pontuacao FROM partidas WHERE jogador_email = $1 ORDER BY data_partida DESC LIMIT 1) as ultima_pontuacao,
        (SELECT jsonb_object_agg(key, value) FROM (SELECT key, SUM((stats_coletados->>key)::int) AS value FROM partidas, jsonb_each_text(stats_coletados) WHERE jogador_email = $1 GROUP BY key) AS stats) as stats_totais
    `;
    const result = await pool.query(query, [email]);
    res.json(result.rows[0]);
  } catch (error) { // <-- A CHAVE { QUE FALTAVA FOI ADICIONADA AQUI
    console.error('Erro ao buscar dados do dashboard:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
});

// ROTA 4: Buscar o recorde global
app.get('/api/leaderboard/top', async (req, res) => {
  try {
    const query = `
      SELECT p.pontuacao, j.nome
      FROM partidas p
      JOIN jogadores j ON p.jogador_email = j.email
      ORDER BY p.pontuacao DESC
      LIMIT 1;
    `;
    const result = await pool.query(query);
    res.json(result.rows[0] || { pontuacao: 0, nome: 'Ninguém' });
  } catch (error) {
    console.error('Erro ao buscar recorde global:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
});

app.listen(port, () => {
  console.log(`Backend rodando em http://localhost:${port}`);
});