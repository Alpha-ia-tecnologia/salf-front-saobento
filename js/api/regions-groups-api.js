// API para gerenciamento de regiões e grupos

/**
 * Obtém todas as regiões
 * @returns {Promise<Array>} Lista de regiões
 */
async function getAllRegions() {
  const token = localStorage.getItem('token') || '';
  const url = 'https://api.salf.maximizaedu.com/api/regions';
  
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  if (!response.ok) {
    throw new Error('Falha ao buscar regiões');
  }
  
  return response.json();
}

/**
 * Cria uma nova região
 * @param {Object} data - Dados da nova região
 * @returns {Promise<Object>} Região criada
 */
async function createRegion(data) {
  const token = localStorage.getItem('token') || '';
  const url = 'https://api.salf.maximizaedu.com/api/regions';
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Falha ao criar região');
  }
  
  return response.json();
}

/**
 * Obtém todos os grupos
 * @returns {Promise<Array>} Lista de grupos
 */
async function getAllGroups() {
  const token = localStorage.getItem('token') || '';
  const url = 'https://api.salf.maximizaedu.com/api/groups';
  
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  if (!response.ok) {
    throw new Error('Falha ao buscar grupos');
  }
  
  return response.json();
}

/**
 * Cria um novo grupo
 * @param {Object} data - Dados do novo grupo
 * @returns {Promise<Object>} Grupo criado
 */
async function createGroup(data) {
  const token = localStorage.getItem('token') || '';
  const url = 'https://api.salf.maximizaedu.com/api/groups';
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Falha ao criar grupo');
  }
  
  return response.json();
}

// Exportar funções para uso global
window.RegionsGroupsAPI = {
  getAllRegions,
  createRegion,
  getAllGroups,
  createGroup
}; 