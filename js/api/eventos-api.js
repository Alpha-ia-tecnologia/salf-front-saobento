// API para gerenciamento de eventos de avaliação

/**
 * Obtém todos os eventos de avaliação
 * @returns {Promise<Array>} Lista de eventos
 */
async function getAllAssessmentEvents() {
  const token = localStorage.getItem('token') || '';
  const url = 'https://salf-salf-api2.gkgtsp.easypanel.host/assessment-events';
  
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
 * Obtém um evento de avaliação específico por ID
 * @param {number} id - ID do evento
 * @returns {Promise<Object>} Dados do evento
 */
async function getAssessmentEventById(id) {
  const token = localStorage.getItem('token') || '';
  const url = `https://salf-salf-api2.gkgtsp.easypanel.host/assessment-events/${id}`;
  
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  if (!response.ok) {
    throw new Error('Evento de avaliação não encontrado');
  }
  
  return response.json();
}

/**
 * Atualiza um evento de avaliação existente
 * @param {number} id - ID do evento a ser atualizado
 * @param {Object} data - Dados atualizados do evento
 * @returns {Promise<Object>} Evento atualizado
 */
async function updateAssessmentEvent(id, data) {
  const token = localStorage.getItem('token') || '';
  const url = `https://salf-salf-api2.gkgtsp.easypanel.host/assessment-events/${id}`;
  
  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Falha ao atualizar evento de avaliação');
  }
  
  return response.json();
}

/**
 * Cria um novo evento de avaliação
 * @param {Object} data - Dados do novo evento
 * @returns {Promise<Object>} Evento criado
 */
async function createAssessmentEvent(data) {
  const token = localStorage.getItem('token') || '';
  const url = 'https://salf-salf-api2.gkgtsp.easypanel.host/assessment-events';
  
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
    throw new Error(errorData.message || 'Falha ao criar evento de avaliação');
  }
  
  return response.json();
}

/**
 * Exclui um evento de avaliação
 * @param {number} id - ID do evento a ser excluído
 * @returns {Promise<Object>} Resultado da exclusão
 */
async function deleteAssessmentEvent(id) {
  const token = localStorage.getItem('token') || '';
  const url = `https://salf-salf-api2.gkgtsp.easypanel.host/assessment-events/${id}`;
  
  const response = await fetch(url, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  if (!response.ok) {
    throw new Error('Falha ao excluir evento de avaliação');
  }
  
  return response.json();
}

// Exportar funções para uso global
window.EventosAPI = {
  getAllAssessmentEvents,
  getAssessmentEventById,
  updateAssessmentEvent,
  createAssessmentEvent,
  deleteAssessmentEvent
}; 