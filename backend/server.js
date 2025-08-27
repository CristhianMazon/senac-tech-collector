const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3001;
const TECHCOIN_RATE = 10; // 1 Techcoin a cada 10 pontos

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
      INSERT INTO public.jogadores (nome, email, telefone)
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

// ROTA 2: Salvar o resultado de uma partida e adicionar Techcoins
app.post('/api/partidas', async (req, res) => {
  const { email, score, stats } = req.body;
  try {
    const query = 'INSERT INTO public.partidas (jogador_email, pontuacao, stats_coletados) VALUES ($1, $2, $3)';
    await pool.query(query, [email, score, stats]);

    // Adiciona Techcoins ao jogador
    const techcoinsGanhos = Math.floor(score / TECHCOIN_RATE);
    await pool.query('UPDATE public.jogadores SET techcoins = techcoins + $1 WHERE email = $2', [techcoinsGanhos, email]);

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
        (SELECT nome FROM public.jogadores WHERE email = $1) as nome_jogador,
        (SELECT techcoins FROM public.jogadores WHERE email = $1) as techcoins,
        (SELECT COUNT(*) FROM public.partidas WHERE jogador_email = $1) as total_partidas,
        (SELECT MAX(pontuacao) FROM public.partidas WHERE jogador_email = $1) as pontuacao_maxima_pessoal,
        (SELECT pontuacao FROM public.partidas WHERE jogador_email = $1 ORDER BY data_partida DESC LIMIT 1) as ultima_pontuacao,
        (SELECT jsonb_object_agg(key, value) FROM (SELECT key, SUM((stats_coletados->>key)::int) AS value FROM public.partidas, jsonb_each_text(stats_coletados) WHERE jogador_email = $1 GROUP BY key) AS stats) as stats_totais
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
      FROM public.partidas p
      LEFT JOIN public.jogadores j ON p.jogador_email = j.email
      ORDER BY p.pontuacao DESC
      LIMIT 5;
    `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar recorde global:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
});

// ROTA 5: Listar itens da loja
app.get('/api/loja/itens', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM public.loja_itens ORDER BY custo ASC');
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar itens da loja:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
});

// ROTA 6: Comprar um item da loja
app.post('/api/loja/comprar', async (req, res) => {
  const { email, itemId } = req.body;
  try {
    await pool.query('BEGIN'); // Inicia uma transação

    // 1. Encontra o jogador e o item
    const jogadorResult = await pool.query('SELECT techcoins FROM public.jogadores WHERE email = $1 FOR UPDATE', [email]);
    const itemResult = await pool.query('SELECT custo, stock FROM public.loja_itens WHERE id = $1 FOR UPDATE', [itemId]);

    const jogador = jogadorResult.rows[0];
    const item = itemResult.rows[0];

    // 2. Valida a compra
    if (!jogador) {
      await pool.query('ROLLBACK');
      return res.status(404).json({ error: 'Jogador não encontrado.' });
    }
    if (!item) {
      await pool.query('ROLLBACK');
      return res.status(404).json({ error: 'Item não encontrado.' });
    }
    if (jogador.techcoins < item.custo) {
      await pool.query('ROLLBACK');
      return res.status(400).json({ error: 'Techcoins insuficientes.' });
    }
    if (item.stock <= 0) {
      await pool.query('ROLLBACK');
      return res.status(400).json({ error: 'Item esgotado.' });
    }

    // 3. Processa a compra
    await pool.query('UPDATE public.jogadores SET techcoins = techcoins - $1 WHERE email = $2', [item.custo, email]);
    await pool.query('UPDATE public.loja_itens SET stock = stock - 1 WHERE id = $1', [itemId]);
    // Adicionar um registro da compra em uma tabela 'compras' seria ideal aqui.

    await pool.query('COMMIT'); // Finaliza a transação
    res.status(200).json({ message: 'Compra realizada com sucesso!' });
  } catch (error) {
    await pool.query('ROLLBACK');
    console.error('Erro ao comprar item:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
});

app.listen(port, () => {
  console.log(`Backend rodando na porta ${port}`);
});