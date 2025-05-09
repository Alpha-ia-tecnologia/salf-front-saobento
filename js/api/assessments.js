// Cliente API para avaliações

// Função para obter todas as avaliações
async function getAllAssessments() {
  const response = await fetch('https://api.salf.maximizaedu.com/api/assessments');
  if (!response.ok) throw new Error('Falha ao buscar avaliações');
  return response.json();
}

// Função para obter uma avaliação específica por ID
async function getAssessmentById(id) {
  const response = await fetch(`https://api.salf.maximizaedu.com/api/assessments/${id}`);
  if (!response.ok) throw new Error('Avaliação não encontrada');
  return response.json();
}

// Função para atualizar uma avaliação
async function updateAssessment(id, data) {
  const token = localStorage.getItem('token') || '';
  
  const response = await fetch(`https://api.salf.maximizaedu.com/api/assessments/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });
  if (!response.ok) throw new Error('Falha ao atualizar avaliação');
  return response.json();
}

// Função para excluir uma avaliação
async function deleteAssessment(id) {
  const token = localStorage.getItem('token') || '';
  
  const response = await fetch(`https://api.salf.maximizaedu.com/api/assessments/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  if (!response.ok) throw new Error('Falha ao excluir avaliação');
  return response.json();
}

// Função para criar uma nova avaliação
async function createAssessment(data) {
  const token = localStorage.getItem('token') || '';
  
  const response = await fetch('https://api.salf.maximizaedu.com/api/assessments', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Falha ao criar avaliação');
  }
  
  return response.json();
}

// Exportar funções
window.AssessmentAPI = {
  getAllAssessments,
  getAssessmentById,
  updateAssessment,
  deleteAssessment,
  createAssessment
}; 