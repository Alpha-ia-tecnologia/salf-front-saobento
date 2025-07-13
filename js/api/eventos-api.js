// API para gerenciamento de eventos de avaliação

/**
 * Obtém todos os eventos de avaliação
 * @returns {Promise<Array>} Lista de eventos
 */
async function getAllAssessmentEvents() {
  const token = localStorage.getItem('token') || '';
  const url = `${window.API_BASE_URL_NO_API}/assessment-events`;
  
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  if (!response.ok) {
    throw new Error('Falha ao buscar eventos de avaliação');
  }
  
  return response.json();
}

/**
 * Obtém um evento específico
 * @param {number} id - ID do evento
 * @returns {Promise<Object>} Evento encontrado
 */
async function getAssessmentEvent(id) {
  const token = localStorage.getItem('token') || '';
  const url = `${window.API_BASE_URL_NO_API}/assessment-events/${id}`;
  
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  if (!response.ok) {
    throw new Error('Falha ao buscar evento de avaliação');
  }
  
  return response.json();
}

/**
 * Atualiza um evento de avaliação
 * @param {number} id - ID do evento
 * @param {Object} eventData - Dados do evento
 * @returns {Promise<Object>} Evento atualizado
 */
async function updateAssessmentEvent(id, eventData) {
  const token = localStorage.getItem('token') || '';
  const url = `${window.API_BASE_URL_NO_API}/assessment-events/${id}`;
  
  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(eventData)
  });
  
  if (!response.ok) {
    throw new Error('Falha ao atualizar evento de avaliação');
  }
  
  return response.json();
}

/**
 * Cria um novo evento de avaliação
 * @param {Object} eventData - Dados do evento
 * @returns {Promise<Object>} Evento criado
 */
async function createAssessmentEvent(eventData) {
  const token = localStorage.getItem('token') || '';
  const url = `${window.API_BASE_URL_NO_API}/assessment-events`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(eventData)
  });
  
  if (!response.ok) {
    throw new Error('Falha ao criar evento de avaliação');
  }
  
  return response.json();
}

/**
 * Exclui um evento de avaliação
 * @param {number} id - ID do evento
 * @returns {Promise<void>}
 */
async function deleteAssessmentEvent(id) {
  const token = localStorage.getItem('token') || '';
  const url = `${window.API_BASE_URL_NO_API}/assessment-events/${id}`;
  
  const response = await fetch(url, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  if (!response.ok) {
    throw new Error('Falha ao excluir evento de avaliação');
  }
}

// Exportar funções para uso global
window.EventosAPI = {
  getAllAssessmentEvents,
  getAssessmentEvent,
  updateAssessmentEvent,
  createAssessmentEvent,
  deleteAssessmentEvent
}; 