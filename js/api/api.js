// Configuração base da API - agora vem da configuração global
// const API_BASE_URL = 'https://salf-salf-api2.gkgtsp.easypanel.host/api'; // Removido - usando configuração global
const MOCK_MODE = true; // Ativar modo de simulação para usar dados mockados em caso de falha do servidor

// Função para obter o token do localStorage
const getToken = () => localStorage.getItem('token') || 'mock-token';

// Headers básicos para todas as requisições
const getHeaders = () => {
  const headers = {
    'Content-Type': 'application/json'
  };

  const token = getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
};

// Função para verificar se a resposta é válida
const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({
      error: 'Ocorreu um erro na requisição'
    }));
    throw new Error(error.error || 'Ocorreu um erro na requisição');
  }
  
  return response.json();
};

// Função para simular delay em respostas
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Dados simulados para modo mock
const mockData = {
  usuarios: [
    { 
      id: 1, 
      nome: 'Admin Sistema', 
      email: 'admin@salf.edu.br', 
      senha: '$2b$10$1aOAQgkqZ9VcnqL/4EF7UuNjOlIGt5cww.ObXP8OBUGSOL7GgfBt.', // senha123
      tipo: 'admin', 
      ativo: true, 
      token: 'admin-mock-token' 
    },
    { 
      id: 2, 
      nome: 'Maria Coordenadora', 
      email: 'coordenador@salf.edu.br', 
      senha: '$2b$10$1aOAQgkqZ9VcnqL/4EF7UuNjOlIGt5cww.ObXP8OBUGSOL7GgfBt.', // senha123
      tipo: 'coordenador', 
      ativo: true, 
      token: 'coordenador-mock-token' 
    },
    { 
      id: 3, 
      nome: 'João Aplicador', 
      email: 'aplicador@salf.edu.br', 
      senha: '$2b$10$1aOAQgkqZ9VcnqL/4EF7UuNjOlIGt5cww.ObXP8OBUGSOL7GgfBt.', // senha123
      tipo: 'aplicador', 
      ativo: true, 
      token: 'aplicador-mock-token' 
    },
    { 
      id: 4, 
      nome: 'Pedro Gestor', 
      email: 'gestor@salf.edu.br', 
      senha: '$2b$10$1aOAQgkqZ9VcnqL/4EF7UuNjOlIGt5cww.ObXP8OBUGSOL7GgfBt.', // senha123
      tipo: 'gestor', 
      ativo: true, 
      token: 'gestor-mock-token' 
    }
  ],
  escolas: [
    { id: 1, nome: 'Escola Municipal João da Silva', regiaoId: 1, regiao: { id: 1, nome: 'Norte' }, grupoId: 1, grupo: { id: 1, nome: 'Grupo Municipal' }, _count: { turmas: 2 } },
    { id: 2, nome: 'Escola Estadual Maria José', regiaoId: 2, regiao: { id: 2, nome: 'Sul' }, grupoId: 2, grupo: { id: 2, nome: 'Grupo Estadual' }, _count: { turmas: 1 } },
    { id: 3, nome: 'Colégio Particular São José', regiaoId: 5, regiao: { id: 5, nome: 'Centro' }, grupoId: 3, grupo: { id: 3, nome: 'Grupo Particular' }, _count: { turmas: 1 } }
  ],
  regioes: [
    { id: 1, nome: 'Norte', _count: { escolas: 1 } },
    { id: 2, nome: 'Sul', _count: { escolas: 1 } },
    { id: 3, nome: 'Leste', _count: { escolas: 0 } },
    { id: 4, nome: 'Oeste', _count: { escolas: 0 } },
    { id: 5, nome: 'Centro', _count: { escolas: 1 } }
  ],
  grupos: [
    { id: 1, nome: 'Grupo Municipal', _count: { escolas: 1 } },
    { id: 2, nome: 'Grupo Estadual', _count: { escolas: 1 } },
    { id: 3, nome: 'Grupo Particular', _count: { escolas: 1 } }
  ]
};

// API de autenticação
const authAPI = {
  login: async (email, senha) => {
    if (MOCK_MODE) {
      await delay(1000); // Simular delay de rede
      
      // Verificar se email e senha foram fornecidos
      if (!email || !senha) {
        throw new Error('Email e senha são obrigatórios');
      }
      
      // Buscar o usuário pelo email
      const usuario = mockData.usuarios.find(u => u.email === email);
      
      // Verificar se o usuário existe
      if (!usuario) {
        throw new Error('Credenciais inválidas');
      }
      
      // Verificar se o usuário está ativo
      if (!usuario.ativo) {
        throw new Error('Usuário inativo. Entre em contato com o administrador.');
      }
      
      // Verificar a senha (para simplificar, vamos aceitar 'senha123' para todos no modo mock)
      if (senha !== 'senha123') {
        throw new Error('Credenciais inválidas');
      }
      
      // Salvar token e informações do usuário
      localStorage.setItem('token', usuario.token);
      localStorage.setItem('userEmail', usuario.email);
      localStorage.setItem('userName', usuario.nome);
      localStorage.setItem('userRole', usuario.tipo);
      localStorage.setItem('isLoggedIn', 'true');
      
      return {
        token: usuario.token,
        usuario: {
          id: usuario.id,
          nome: usuario.nome,
          email: usuario.email,
          tipo: usuario.tipo
        }
      };
    }
    
    // Código para modo de produção
    const response = await fetch(`${window.API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, senha })
    });
    
    const data = await handleResponse(response);
    
    // Salvar token e informações do usuário
    if (data.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('userEmail', data.usuario.email);
      localStorage.setItem('userName', data.usuario.nome);
      localStorage.setItem('userRole', data.usuario.tipo);
      localStorage.setItem('isLoggedIn', 'true');
    }
    
    return data;
  },
  
  verificarToken: async () => {
    if (MOCK_MODE) {
      await delay(300);
      
      const token = getToken();
      
      // Se não há token, retorna erro
      if (!token || token === 'mock-token') {
        throw new Error('Token inválido ou expirado');
      }
      
      // Buscar usuário pelo token
      const usuario = mockData.usuarios.find(u => u.token === token);
      
      if (!usuario) {
        throw new Error('Usuário não encontrado');
      }
      
      if (!usuario.ativo) {
        throw new Error('Usuário inativo');
      }
      
      return {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        tipo: usuario.tipo,
        ativo: usuario.ativo
      };
    }
    
    const response = await fetch(`${window.API_BASE_URL}/auth/me`, {
      method: 'GET',
      headers: getHeaders()
    });
    
    return handleResponse(response);
  },
  
  logout: () => {
    // Limpar o localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    localStorage.removeItem('userRole');
    localStorage.removeItem('isLoggedIn');
  }
};

// API de escolas
const escolasAPI = {
  listar: async (filtros = {}) => {
    if (MOCK_MODE) {
      await delay(300);
      
      // Simular filtros
      let escolasFiltradas = [...mockData.escolas];
      
      if (filtros.regiaoId) {
        escolasFiltradas = escolasFiltradas.filter(e => e.regiaoId == filtros.regiaoId);
      }
      
      if (filtros.grupoId) {
        escolasFiltradas = escolasFiltradas.filter(e => e.grupoId == filtros.grupoId);
      }
      
      if (filtros.search) {
        const searchLower = filtros.search.toLowerCase();
        escolasFiltradas = escolasFiltradas.filter(e => 
          e.nome.toLowerCase().includes(searchLower)
        );
      }
      
      return escolasFiltradas;
    }
    
    // Código original
    const queryParams = new URLSearchParams();
    if (filtros.regiaoId) queryParams.append('regiaoId', filtros.regiaoId);
    if (filtros.grupoId) queryParams.append('grupoId', filtros.grupoId);
    if (filtros.search) queryParams.append('search', filtros.search);
    
    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
    
    const response = await fetch(`${window.API_BASE_URL}/escolas${queryString}`, {
      method: 'GET',
      headers: getHeaders()
    });
    
    return handleResponse(response);
  },
  
  buscarPorId: async (id) => {
    if (MOCK_MODE) {
      await delay(300);
      const escola = mockData.escolas.find(e => e.id == id);
      
      if (!escola) {
        throw new Error('Escola não encontrada');
      }
      
      return { ...escola, turmas: [], usuarios: [] };
    }
    
    const response = await fetch(`${window.API_BASE_URL}/escolas/${id}`, {
      method: 'GET',
      headers: getHeaders()
    });
    
    return handleResponse(response);
  },
  
  criar: async (dadosEscola) => {
    if (MOCK_MODE) {
      await delay(500);
      
      // Simular criação
      const novaEscola = {
        id: mockData.escolas.length + 1,
        ...dadosEscola,
        regiao: mockData.regioes.find(r => r.id == dadosEscola.regiaoId),
        grupo: dadosEscola.grupoId ? mockData.grupos.find(g => g.id == dadosEscola.grupoId) : null,
        _count: { turmas: 0 }
      };
      
      mockData.escolas.push(novaEscola);
      return novaEscola;
    }
    
    const response = await fetch(`${window.API_BASE_URL}/escolas`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(dadosEscola)
    });
    
    return handleResponse(response);
  },
  
  atualizar: async (id, dadosEscola) => {
    if (MOCK_MODE) {
      await delay(500);
      
      const index = mockData.escolas.findIndex(e => e.id == id);
      if (index === -1) {
        throw new Error('Escola não encontrada');
      }
      
      mockData.escolas[index] = {
        ...mockData.escolas[index],
        ...dadosEscola,
        regiao: dadosEscola.regiaoId ? mockData.regioes.find(r => r.id == dadosEscola.regiaoId) : mockData.escolas[index].regiao,
        grupo: dadosEscola.grupoId ? mockData.grupos.find(g => g.id == dadosEscola.grupoId) : mockData.escolas[index].grupo
      };
      
      return mockData.escolas[index];
    }
    
    const response = await fetch(`${window.API_BASE_URL}/escolas/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(dadosEscola)
    });
    
    return handleResponse(response);
  },
  
  excluir: async (id) => {
    if (MOCK_MODE) {
      await delay(500);
      
      const index = mockData.escolas.findIndex(e => e.id == id);
      if (index === -1) {
        throw new Error('Escola não encontrada');
      }
      
      mockData.escolas.splice(index, 1);
      return { message: 'Escola excluída com sucesso' };
    }
    
    const response = await fetch(`${window.API_BASE_URL}/escolas/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    
    return handleResponse(response);
  }
};

// API de regiões
const regioesAPI = {
  listar: async (search = '') => {
    if (MOCK_MODE) {
      await delay(300);
      
      if (!search) {
        return mockData.regioes;
      }
      
      // Filtrar por busca
      const searchLower = search.toLowerCase();
      return mockData.regioes.filter(regiao => 
        regiao.nome.toLowerCase().includes(searchLower)
      );
    }
    
    const queryString = search ? `?search=${search}` : '';
    
    const response = await fetch(`${window.API_BASE_URL}/regioes${queryString}`, {
      method: 'GET',
      headers: getHeaders()
    });
    
    return handleResponse(response);
  },
  
  buscarPorId: async (id) => {
    if (MOCK_MODE) {
      await delay(300);
      
      const regiao = mockData.regioes.find(r => r.id == id);
      if (!regiao) {
        throw new Error('Região não encontrada');
      }
      
      // Adicionar escolas associadas
      const escolas = mockData.escolas.filter(e => e.regiaoId == id);
      return { ...regiao, escolas };
    }
    
    const response = await fetch(`${window.API_BASE_URL}/regioes/${id}`, {
      method: 'GET',
      headers: getHeaders()
    });
    
    return handleResponse(response);
  },
  
  criar: async (nome) => {
    if (MOCK_MODE) {
      await delay(500);
      
      // Simular criação
      const novaRegiao = {
        id: mockData.regioes.length + 1,
        nome,
        _count: { escolas: 0 }
      };
      
      mockData.regioes.push(novaRegiao);
      return novaRegiao;
    }
    
    const response = await fetch(`${window.API_BASE_URL}/regioes`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ nome })
    });
    
    return handleResponse(response);
  },
  
  atualizar: async (id, nome) => {
    if (MOCK_MODE) {
      await delay(500);
      
      const index = mockData.regioes.findIndex(r => r.id == id);
      if (index === -1) {
        throw new Error('Região não encontrada');
      }
      
      mockData.regioes[index].nome = nome;
      return mockData.regioes[index];
    }
    
    const response = await fetch(`${window.API_BASE_URL}/regioes/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ nome })
    });
    
    return handleResponse(response);
  },
  
  excluir: async (id) => {
    if (MOCK_MODE) {
      await delay(500);
      
      // Verificar se há escolas associadas
      const temEscolas = mockData.escolas.some(e => e.regiaoId == id);
      if (temEscolas) {
        throw new Error('Não é possível excluir a região pois existem escolas associadas');
      }
      
      const index = mockData.regioes.findIndex(r => r.id == id);
      if (index === -1) {
        throw new Error('Região não encontrada');
      }
      
      mockData.regioes.splice(index, 1);
      return { message: 'Região excluída com sucesso' };
    }
    
    const response = await fetch(`${window.API_BASE_URL}/regioes/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    
    return handleResponse(response);
  }
};

// API de grupos
const gruposAPI = {
  listar: async (search = '') => {
    if (MOCK_MODE) {
      await delay(300);
      
      if (!search) {
        return mockData.grupos;
      }
      
      // Filtrar por busca
      const searchLower = search.toLowerCase();
      return mockData.grupos.filter(grupo => 
        grupo.nome.toLowerCase().includes(searchLower)
      );
    }
    
    const queryString = search ? `?search=${search}` : '';
    
    const response = await fetch(`${window.API_BASE_URL}/grupos${queryString}`, {
      method: 'GET',
      headers: getHeaders()
    });
    
    return handleResponse(response);
  },
  
  buscarPorId: async (id) => {
    if (MOCK_MODE) {
      await delay(300);
      
      const grupo = mockData.grupos.find(g => g.id == id);
      if (!grupo) {
        throw new Error('Grupo não encontrado');
      }
      
      // Adicionar escolas associadas
      const escolas = mockData.escolas.filter(e => e.grupoId == id);
      return { ...grupo, escolas };
    }
    
    const response = await fetch(`${window.API_BASE_URL}/grupos/${id}`, {
      method: 'GET',
      headers: getHeaders()
    });
    
    return handleResponse(response);
  },
  
  criar: async (nome) => {
    if (MOCK_MODE) {
      await delay(500);
      
      // Simular criação
      const novoGrupo = {
        id: mockData.grupos.length + 1,
        nome,
        _count: { escolas: 0 }
      };
      
      mockData.grupos.push(novoGrupo);
      return novoGrupo;
    }
    
    const response = await fetch(`${window.API_BASE_URL}/grupos`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ nome })
    });
    
    return handleResponse(response);
  },
  
  atualizar: async (id, nome) => {
    if (MOCK_MODE) {
      await delay(500);
      
      const index = mockData.grupos.findIndex(g => g.id == id);
      if (index === -1) {
        throw new Error('Grupo não encontrado');
      }
      
      mockData.grupos[index].nome = nome;
      return mockData.grupos[index];
    }
    
    const response = await fetch(`${window.API_BASE_URL}/grupos/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ nome })
    });
    
    return handleResponse(response);
  },
  
  excluir: async (id) => {
    if (MOCK_MODE) {
      await delay(500);
      
      // Verificar se há escolas associadas
      const temEscolas = mockData.escolas.some(e => e.grupoId == id);
      if (temEscolas) {
        throw new Error('Não é possível excluir o grupo pois existem escolas associadas');
      }
      
      const index = mockData.grupos.findIndex(g => g.id == id);
      if (index === -1) {
        throw new Error('Grupo não encontrado');
      }
      
      mockData.grupos.splice(index, 1);
      return { message: 'Grupo excluído com sucesso' };
    }
    
    const response = await fetch(`${window.API_BASE_URL}/grupos/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    
    return handleResponse(response);
  }
};

// Exportar a API para uso global
window.API = {
  auth: authAPI,
  escolas: escolasAPI,
  regioes: regioesAPI,
  grupos: gruposAPI
}; 