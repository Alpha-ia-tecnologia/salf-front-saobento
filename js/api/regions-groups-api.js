// API para gerenciamento de regiões e grupos

/**
 * Obtém todas as regiões
 * @returns {Promise<Array>} Lista de regiões
 */
async function getAllRegions() {
  const token = localStorage.getItem('token') || '';
  const url = `${window.API_BASE_URL_NO_API}/regions`;
  
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
 * @param {Object} regionData - Dados da região
 * @returns {Promise<Object>} Região criada
 */
async function createRegion(regionData) {
  const token = localStorage.getItem('token') || '';
  const url = `${window.API_BASE_URL_NO_API}/regions`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(regionData)
  });
  
  if (!response.ok) {
    throw new Error('Falha ao criar região');
  }
  
  return response.json();
}

/**
 * Obtém todos os grupos
 * @returns {Promise<Array>} Lista de grupos
 */
async function getAllGroups() {
  const token = localStorage.getItem('token') || '';
  const url = `${window.API_BASE_URL_NO_API}/groups`;
  
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
 * @param {Object} groupData - Dados do grupo
 * @returns {Promise<Object>} Grupo criado
 */
async function createGroup(groupData) {
  const token = localStorage.getItem('token') || '';
  const url = `${window.API_BASE_URL_NO_API}/groups`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(groupData)
  });
  
  if (!response.ok) {
    throw new Error('Falha ao criar grupo');
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