/**
 * SALF - Sistema de Avaliação de Leitura e Fluência
 *
 * ARQUIVO: api/reading-tests.js
 * FUNÇÃO: Cliente API para testes de leitura
 *
 * Este arquivo fornece interface para operações de testes de leitura:
 * - Busca todos os testes de leitura disponíveis
 * - Obtém teste específico por ID
 * - Remove testes de leitura do sistema
 * - Gerencia dados de testes aplicados
 *
 * RELACIONAMENTOS:
 * - Consome endpoint /reading-tests da API principal
 * - Integra com sistema de autenticação JWT
 * - Fornece dados para módulo de realização de avaliações
 * - Conecta com sistema de resultados de leitura
 */

async function getAllReadingTests() {
  try {
    const token = localStorage.getItem("token") || "";
    const response = await fetch(
      "https://salf-salf-api2.gkgtsp.easypanel.host/reading-tests",
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      console.error(`Erro na API: ${response.status} - ${response.statusText}`);
      throw new Error("Falha ao buscar testes de leitura");
    }

    return response.json();
  } catch (error) {
    console.error("Erro ao buscar testes de leitura:", error);
    return [];
  }
}

async function getReadingTestById(id) {
  const response = await fetch(
    `https://salf-salf-api2.gkgtsp.easypanel.host/reading-tests/${id}`
  );
  if (!response.ok) throw new Error("Teste de leitura não encontrado");
  return response.json();
}

async function deleteReadingTest(id) {
  const token = localStorage.getItem("token") || "";

  const response = await fetch(
    `https://salf-salf-api2.gkgtsp.easypanel.host/reading-tests/${id}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  if (!response.ok) throw new Error("Falha ao excluir teste de leitura");
  return response.json();
}

window.ReadingTestAPI = {
  getAllReadingTests,
  getReadingTestById,
  deleteReadingTest,
};
