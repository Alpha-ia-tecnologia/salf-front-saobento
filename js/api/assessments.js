/**
 * SALF - Sistema de Avaliação de Leitura e Fluência
 *
 * ARQUIVO: api/assessments.js
 * FUNÇÃO: Cliente API para gestão de avaliações
 *
 * Este arquivo fornece interface para operações CRUD de avaliações:
 * - Busca todas as avaliações disponíveis
 * - Obtém avaliação específica por ID
 * - Cria novas avaliações
 * - Atualiza avaliações existentes
 * - Remove avaliações do sistema
 *
 * RELACIONAMENTOS:
 * - Consome endpoint /assessments da API principal
 * - Integra com sistema de autenticação JWT
 * - Fornece dados para módulo de avaliações
 * - Conecta com sistema de criação de testes
 */

async function getAllAssessments() {
  const response = await fetch(
    "https://salf-salf-api2.gkgtsp.easypanel.host/api/assessments"
  );
  if (!response.ok) throw new Error("Falha ao buscar avaliações");
  return response.json();
}

async function getAssessmentById(id) {
  const response =
    await fetch(`https://salf-salf-api2.gkgtsp.easypanel.host/api/assessments
/${id}`);
  if (!response.ok) throw new Error("Avaliação não encontrada");
  return response.json();
}

async function updateAssessment(id, data) {
  const token = localStorage.getItem("token") || "";

  const response = await fetch(
    `https://salf-salf-api2.gkgtsp.easypanel.host/api/assessments
/${id}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    }
  );
  if (!response.ok) throw new Error("Falha ao atualizar avaliação");
  return response.json();
}

async function deleteAssessment(id) {
  const token = localStorage.getItem("token") || "";

  const response = await fetch(
    `https://salf-salf-api2.gkgtsp.easypanel.host/api/assessments
/${id}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  if (!response.ok) throw new Error("Falha ao excluir avaliação");
  return response.json();
}

async function createAssessment(data) {
  const token = localStorage.getItem("token") || "";

  const response = await fetch(
    "https://salf-salf-api2.gkgtsp.easypanel.host/api/assessments",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Falha ao criar avaliação");
  }

  return response.json();
}

window.AssessmentAPI = {
  getAllAssessments,
  getAssessmentById,
  updateAssessment,
  deleteAssessment,
  createAssessment,
};
