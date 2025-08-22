const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function setupDatabase() {
  try {
    console.log('Iniciando setup do banco de dados...');
    const client = await pool.connect();

    // Criar a tabela 'jogadores' no schema 'public'
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.jogadores (
        email VARCHAR(255) PRIMARY KEY,
        nome VARCHAR(255) NOT NULL,
        telefone VARCHAR(20)
      );
    `);

    // Criar a tabela 'partidas' no schema 'public'
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.partidas (
        id SERIAL PRIMARY KEY,
        jogador_email VARCHAR(255) REFERENCES public.jogadores(email),
        pontuacao INT NOT NULL,
        stats_coletados JSONB,
        data_partida TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    client.release();
    console.log('Setup do banco de dados concluído com sucesso!');
  } catch (error) {
    console.error('Erro no setup do banco de dados:', error);
  } finally {
    await pool.end();
  }
}

setupDatabase();
