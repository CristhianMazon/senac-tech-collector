const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3001;

// Configuração para conectar ao banco de dados no Render, usando variáveis de ambiente
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

app.use(cors());
app.use(express.json());

// ROTA 1: Cadastro/Login do jogador
app.post('/api/jogador', async (req, res) => {
  const { nome, email, telefone } = req.body;
  try {
    const query = `
      INSERT INTO senac_jogo_db_user.jogadores (nome, email, telefone)
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
    const query = 'INSERT INTO senac_jogo_db_user.partidas (jogador_email, pontuacao, stats_coletados) VALUES ($1, $2, $3)';
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
        (SELECT nome FROM senac_jogo_db_user.jogadores WHERE email = $1) as nome_jogador,
        (SELECT COUNT(*) FROM senac_jogo_db_user.partidas WHERE jogador_email = $1) as total_partidas,
        (SELECT MAX(pontuacao) FROM senac_jogo_db_user.partidas WHERE jogador_email = $1) as pontuacao_maxima_pessoal,
        (SELECT pontuacao FROM senac_jogo_db_user.partidas WHERE jogador_email = $1 ORDER BY data_partida DESC LIMIT 1) as ultima_pontuacao,
        (SELECT jsonb_object_agg(key, value) FROM (SELECT key, SUM((stats_coletados->>key)::int) AS value FROM senac_jogo_db_user.partidas, jsonb_each_text(stats_coletados) WHERE jogador_email = $1 GROUP BY key) AS stats) as stats_totais
    `;
    const result = await pool.query(query, [email]);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao buscar dados do dashboard:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
});

// ROTA 4: Buscar o recorde global
app.get('/api/leaderboard/top', async (req, res) => {
  try {
    const query = `
      SELECT p.pontuacao, j.nome
      FROM senac_jogo_db_user.partidas p
      JOIN senac_jogo_db_user.jogadores j ON p.jogador_email = j.email
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
  console.log(`Backend rodando na porta ${port}`);
});