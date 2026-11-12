import http from 'http';
import { json } from './middlewares/json.js';
import { manipuladorDeRotas } from './routes.js';

const server = http.createServer(async (request, response) => {
  // Executa o middleware do JSON primeiro
  await json(request, response);

  // Depois passa para o manipulador de rotas
  return manipuladorDeRotas(request, response);
});

server.listen(3333, () => {
  console.log('Servidor a funcionar na porta 3333 🚀');
});