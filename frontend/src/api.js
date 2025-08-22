import axios from 'axios';

// Cria uma instância do axios que aponta para a URL do seu backend no Render
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
});

export default api;