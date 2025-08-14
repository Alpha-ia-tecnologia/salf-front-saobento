/**
 * SALF - Sistema de Avaliação de Leitura e Fluência
 *
 * ARQUIVO: api/regions-groups-api.js
 * FUNÇÃO: Cliente API para gestão de regiões e grupos
 *
 * Este arquivo fornece interface para operações de regiões e grupos:
 * - Busca todas as regiões disponíveis
 * - Cria novas regiões
 * - Busca todos os grupos disponíveis
 * - Cria novos grupos
 * - Gerencia hierarquia geográfica do sistema
 *
 * RELACIONAMENTOS:
 * - Consome endpoints /regions e /groups da API principal
 * - Integra com sistema de autenticação JWT
 * - Fornece dados para filtros hierárquicos
 * - Conecta com sistema de escolas e turmas
 */

async function getAllRegions() {
  const token = localStorage.getItem("token") || "";
  const url = `${window.API_BASE_URL_NO_API}/regions`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Falha ao buscar regiões");
  }

  return response.json();
}

async function createRegion(regionData) {
  const token = localStorage.getItem("token") || "";
  const url = `${window.API_BASE_URL_NO_API}/regions`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(regionData),
  });

  if (!response.ok) {
    throw new Error("Falha ao criar região");
  }

  return response.json();
}

async function getAllGroups() {
  const token = localStorage.getItem("token") || "";
  const url = `${window.API_BASE_URL_NO_API}/groups`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Falha ao buscar grupos");
  }

  return response.json();
}

async function createGroup(groupData) {
  const token = localStorage.getItem("token") || "";
  const url = `${window.API_BASE_URL_NO_API}/groups`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(groupData),
  });

  if (!response.ok) {
    throw new Error("Falha ao criar grupo");
  }

  return response.json();
}

window.RegionsGroupsAPI = {
  getAllRegions,
  createRegion,
  getAllGroups,
  createGroup,
};
