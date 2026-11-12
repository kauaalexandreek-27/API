import { randomUUID } from 'crypto';

// Banco de dados em memória centralizado para todas as entidades
const database = {
  clientes: [],
  categorias: [],
  produtos: [],
  fornecedores: []
};

export const manipuladorDeRotas = (request, response) => {
  const { method, url, body } = request;

  // =================================================================
  // 1. ROTAS DE CLIENTES (/clientes)
  // =================================================================
  if (url === '/clientes' && method === 'GET') {
    response.writeHead(200, { 'Content-Type': 'application/json' });
    return response.end(JSON.stringify(database.clientes));
  }

  if (url === '/clientes' && method === 'POST') {
    const { nome, email, telefone, ativo } = body;

    // Desafio extra: Impedir cadastro se já existir um cliente com o mesmo email (.some())
    const emailJaExiste = database.clientes.some(cliente => cliente.email === email);
    if (emailJaExiste) {
      response.writeHead(409, { 'Content-Type': 'application/json' });
      return response.end(JSON.stringify({ erro: "Já existe um cliente cadastrado com este e-mail." }));
    }

    const novoCliente = {
      id: randomUUID(),
      nome,
      email,
      telefone,
      ativo: ativo ?? true
    };

    database.clientes.push(novoCliente);
    response.writeHead(201, { 'Content-Type': 'application/json' });
    return response.end(JSON.stringify({ 
      mensagem: "Cliente cadastrado com sucesso!", 
      cliente: novoCliente 
    }));
  }

  // =================================================================
  // 2. ROTAS DE CATEGORIAS (/categorias)
  // =================================================================
  if (url === '/categorias' && method === 'GET') {
    response.writeHead(200, { 'Content-Type': 'application/json' });
    return response.end(JSON.stringify(database.categorias));
  }

  if (url === '/categorias' && method === 'POST') {
    const { nome, descricao } = body;

    const novaCategoria = {
      id: randomUUID(),
      nome,
      descricao
    };

    database.categorias.push(novaCategoria);
    response.writeHead(201, { 'Content-Type': 'application/json' });
    return response.end(JSON.stringify({ 
      mensagem: "Categoria cadastrada com sucesso!", 
      categoria: novaCategoria 
    }));
  }

  // =================================================================
  // 3. ROTAS DE PRODUTOS (/produtos)
  // =================================================================
  if (url === '/produtos' && method === 'GET') {
    response.writeHead(200, { 'Content-Type': 'application/json' });
    return response.end(JSON.stringify(database.produtos));
  }

  if (url === '/produtos' && method === 'POST') {
    const { nome, preco, categoria_id } = body;

    // Desafio extra: Validar se a categoria enviada realmente existe (.find())
    const categoriaExiste = database.categorias.find(cat => cat.id === categoria_id);
    if (!categoriaExiste) {
      response.writeHead(400, { 'Content-Type': 'application/json' });
      return response.end(JSON.stringify({ erro: "A categoria informada não existe." }));
    }

    const novoProduto = {
      id: randomUUID(),
      nome,
      preco,
      categoria_id
    };

    database.produtos.push(novoProduto);
    response.writeHead(201, { 'Content-Type': 'application/json' });
    return response.end(JSON.stringify({ 
      mensagem: "Produto cadastrado com sucesso!", 
      produto: novoProduto 
    }));
  }

  // =================================================================
  // 4. ROTAS DE FORNECEDORES (/fornecedores)
  // =================================================================
  if (url === '/fornecedores' && method === 'GET') {
    response.writeHead(200, { 'Content-Type': 'application/json' });
    return response.end(JSON.stringify(database.fornecedores));
  }

  if (url === '/fornecedores' && method === 'POST') {
    const { razaoSocial, cnpj, contato } = body;

    // Desafio extra: Validar se o CNPJ tem 14 caracteres (removendo pontuação)
    const cnpjLimpo = cnpj ? cnpj.replace(/\D/g, '') : '';
    if (cnpjLimpo.length !== 14) {
      response.writeHead(400, { 'Content-Type': 'application/json' });
      return response.end(JSON.stringify({ erro: "O CNPJ deve conter exatamente 14 dígitos." }));
    }

    const novoFornecedor = {
      id: randomUUID(),
      razaoSocial,
      cnpj: cnpjLimpo,
      contato
    };

    database.fornecedores.push(novoFornecedor);
    response.writeHead(201, { 'Content-Type': 'application/json' });
    return response.end(JSON.stringify({ 
      mensagem: "Fornecedor cadastrado com sucesso!", 
      fornecedor: novoFornecedor 
    }));
  }

  // =================================================================
  // LÓGICA PARA ROTAS DE PRODUTO COM ID (PUT / DELETE)
  // =================================================================
  const isRotaProdutoComId = url.startsWith('/produtos/') && url.split('/').length === 3;

  if (isRotaProdutoComId) {
    const id = url.split('/')[2]; 
    const indexProduto = database.produtos.findIndex(produto => produto.id === id);

    if (indexProduto === -1) {
      response.writeHead(404, { 'Content-Type': 'application/json' });
      return response.end(JSON.stringify({ erro: "Produto não encontrado." }));
    }

    if (method === 'PUT') {
      const { nome, preco, categoria_id } = body;
      
      // Se mandar atualizar a categoria, valida se ela existe
      if (categoria_id) {
        const categoriaExiste = database.categorias.find(cat => cat.id === categoria_id);
        if (!categoriaExiste) {
          response.writeHead(400, { 'Content-Type': 'application/json' });
          return response.end(JSON.stringify({ erro: "A categoria informada não existe." }));
        }
      }

      database.produtos[indexProduto] = {
        ...database.produtos[indexProduto],
        nome: nome ?? database.produtos[indexProduto].nome,
        preco: preco ?? database.produtos[indexProduto].preco,
        categoria_id: categoria_id ?? database.produtos[indexProduto].categoria_id,
      };

      response.writeHead(200, { 'Content-Type': 'application/json' });
      return response.end(JSON.stringify({ 
        mensagem: "Produto atualizado com sucesso!", 
        produto: database.produtos[indexProduto] 
      }));
    }

    if (method === 'DELETE') {
      database.produtos.splice(indexProduto, 1);
      response.writeHead(204);
      return response.end();
    }
  }

  // Rota 404 (Fallback)
  response.writeHead(404, { 'Content-Type': 'application/json' });
  return response.end(JSON.stringify({ erro: "Rota ou método não encontrado." }));
};