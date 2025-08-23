# 🎮 Senac Tech Collector

Bem-vindo ao repositório do **Senac Tech Collector**, um jogo web interativo desenvolvido como parte de um projeto acadêmico do Senac.  
Este projeto é uma aplicação full-stack que combina um jogo de coleta de itens com um sistema de pontuação e estatísticas.

---

## 📖 Sobre o Projeto

O **Senac Tech Collector** é um jogo simples onde os jogadores devem clicar em itens tecnológicos que caem na tela para coletar pontos, enquanto evitam itens maliciosos como vírus.  

A aplicação conta com um dashboard completo, que exibe as estatísticas pessoais do jogador e o recorde global.  
A experiência é totalmente responsiva, adaptando-se perfeitamente a computadores, tablets e celulares em diferentes orientações de tela.

---

## ✨ Funcionalidades Principais

- **Sistema de Cadastro e Login**: Usuários podem se cadastrar e acompanhar seu progresso.  
- **Dashboard Personalizado**: Estatísticas como total de partidas, recorde pessoal e última pontuação.  
- **Ranking Global**: Recorde mundial exibido em tempo real.  
- **Jogabilidade Interativa**: Desenvolvido com Phaser, coleta de itens e pontuação dinâmica.  
- **Sons Personalizados**: Criados com Tone.js para itens, bônus e penalidades.  
- **Design Responsivo**: Layout que se adapta automaticamente a diferentes dispositivos.

---

## 🛠️ Tecnologias Utilizadas

### Frontend
- React  
- Phaser.js  
- Tone.js  
- Axios  
- Vercel (deploy)  

### Backend
- Node.js  
- Express.js  
- PostgreSQL  
- Render (deploy backend e banco)  

---

## 🚀 Como Rodar o Projeto Localmente

### Pré-requisitos
- Node.js (v14 ou superior)  
- npm (gerenciador de pacotes)  
- Servidor PostgreSQL local  

### 🔹 Backend

1. Acesse a pasta do backend:  
   `cd backend`

2. Instale as dependências:  
   `npm install`

3. Configure o banco PostgreSQL local e crie as tabelas:

    ```
    CREATE TABLE public.jogadores (
        email VARCHAR(255) PRIMARY KEY,
        nome VARCHAR(255) NOT NULL,
        telefone VARCHAR(20)
    );

    CREATE TABLE public.partidas (
        id SERIAL PRIMARY KEY,
        jogador_email VARCHAR(255) REFERENCES public.jogadores(email),
        pontuacao INT NOT NULL,
        stats_coletados JSONB,
        data_partida TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
    ```

4. Configure a conexão com o banco no arquivo `server.js`:

    ```
    const pool = new Pool({
      user: 'postgres',
      host: 'localhost',
      database: 'senac_jogo_db', // Nome do seu banco local
      password: 'sua_senha',
      port: 5432,
    });
    ```

5. Inicie o servidor:  
   `npm run start`  

O backend rodará em: **http://localhost:3001**

---

### 🔹 Frontend

1. Acesse a pasta do frontend:  
   `cd frontend`

2. Instale as dependências:  
   `npm install`

3. Crie o arquivo `.env.development` na pasta frontend com:  
   `REACT_APP_API_URL=http://localhost:3001`

4. Inicie a aplicação React:  
   `npm run start`

O app abrirá em: **http://localhost:3000**

---

## 📦 Estrutura de Pastas

backend
├── node_modules
├── package-lock.json
├── package.json
├── server.js
├── setup-db.js

frontend
├── public
│ ├── assets
│ ├── favicon.ico
│ ├── index.html
│ ├── logo192.png
│ ├── logo512.png
│ ├── manifest.json
│ ├── robots.txt
├── src
│ ├── components
│ ├── phaser
│ ├── App.css
│ ├── App.js
│ ├── App.test.js
│ ├── index.css
│ ├── index.js
│ ├── logo.svg
│ ├── reportWebVitals.js
│ ├── setupTests.js
├── .env.production
├── .gitignore
├── README.md
├── package-lock.json
├── package.json

---

## 🌐 Implantação

- **Frontend**: hospedado no Vercel, deploy automático a cada push no branch principal.  
- **Backend & Banco de Dados**: hospedados no Render, também com deploy automático.  
- A variável de ambiente `REACT_APP_API_URL` no Vercel aponta para o backend no Render.  

---

## 👨‍💻 Créditos

**Desenvolvedores:**  
- Cristhian Mazon  
- Eloize Aiume  
