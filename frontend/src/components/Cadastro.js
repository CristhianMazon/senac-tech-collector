import React, { useState } from 'react';

function Cadastro({ onCadastrar }) {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    if (nome && email && telefone) {
      onCadastrar({ nome, email, telefone });
    }
  };

  return (
    // Aplicando as novas classes de estilo
    <div className="form-popup-overlay">
      <div className="form-popup-box">
        <h2>SENAC Tech Collector</h2>
        <p>Preencha os seus dados para começar a jogar!</p>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Nome Completo"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            required
          />
          <input
            type="email"
            placeholder="E-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="tel"
            placeholder="Telefone"
            value={telefone}
            onChange={(e) => setTelefone(e.target.value)}
            required
          />
          <button type="submit">Avançar</button>
        </form>
      </div>
    </div>
  );
}

export default Cadastro;