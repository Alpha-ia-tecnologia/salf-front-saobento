// Cliente API para testes de leitura

// Função para obter todos os testes de leitura
async function getAllReadingTests() {
  const response = await fetch('https://salf-salf-api.py5r5i.easypanel.host/api/reading-tests');
  if (!response.ok) throw new Error('Falha ao buscar testes de leitura');
  return response.json();
}

// Função para obter um teste de leitura específico por ID
async function getReadingTestById(id) {
  const response = await fetch(`https://salf-salf-api.py5r5i.easypanel.host/api/reading-tests/${id}`);
  if (!response.ok) throw new Error('Teste de leitura não encontrado');
  return response.json();
}

// Função para excluir um teste de leitura
async function deleteReadingTest(id) {
  const token = localStorage.getItem('token') || '';
  
  const response = await fetch(`https://salf-salf-api.py5r5i.easypanel.host/api/reading-tests/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  if (!response.ok) throw new Error('Falha ao excluir teste de leitura');
  return response.json();
}

// Exportar funções
window.ReadingTestAPI = {
  getAllReadingTests,
  getReadingTestById,
  deleteReadingTest
}; 