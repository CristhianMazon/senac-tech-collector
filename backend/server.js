const express = require('express');
const { Pool } = require('pg');
const cors = require('cors'); // Adicionado

const app = express();
const port = process.env.PORT || 5000;

// Middlewares
app.use(cors()); // Adicionado para permitir requisições de outras origens
app.use(express.json()); // Adicionado para interpretar o corpo das requisições como JSON

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Rota para registrar um novo usuário
app.post('/api/register', async (req, res) => {
  const { username, password } = req.body;
  try {
    const newUser = await pool.query(
      "INSERT INTO users (username, password) VALUES ($1, $2) RETURNING *",
      [username, password]
    );
    res.json(newUser.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// Rota para login de usuário
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await pool.query("SELECT * FROM users WHERE username = $1", [username]);
    if (user.rows.length === 0) {
      return res.status(401).json("Invalid Credential");
    }
    if (user.rows[0].password !== password) {
      return res.status(401).json("Invalid Credential");
    }
    res.json({ message: "Logged in successfully", user: user.rows[0] });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// Rota para salvar a pontuação
app.post('/api/scores', async (req, res) => {
  const { userId, score } = req.body;
  try {
    const newScore = await pool.query(
      "INSERT INTO scores (user_id, score) VALUES ($1, $2) RETURNING *",
      [userId, score]
    );
    res.json(newScore.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// Rota para obter os 10 melhores scores
app.get('/api/scores', async (req, res) => {
  try {
    const topScores = await pool.query(
      "SELECT u.username, s.score FROM scores s JOIN users u ON s.user_id = u.id ORDER BY s.score DESC LIMIT 10"
    );
    res.json(topScores.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});