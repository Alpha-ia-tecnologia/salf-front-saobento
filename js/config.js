/**
 * SALF - Sistema de Avaliação de Leitura e Fluência
 *
 * ARQUIVO: config.js
 * FUNÇÃO: Configuração global centralizada do sistema
 *
 * Este arquivo centraliza todas as configurações importantes:
 * - URLs da API
 * - Configurações de timeout e retry
 * - Funções para headers padrão e construção de URLs
 * - Configurações de paginação e debug
 *
 * RELACIONAMENTOS:
 * - Importado por todos os módulos que fazem requisições à API
 * - Fornece configurações globais para autenticação e endpoints
 * - Centraliza a manutenção de URLs e configurações do sistema
 */

const API_BASE_URL = "https://salf-ribamar-salf-api-ribamar.gkgtsp.easypanel.host/api";

const API_BASE_URL_NO_API = "https://salf-ribamar-salf-api-ribamar.gkgtsp.easypanel.host";

const CONFIG = {
  API_BASE_URL: API_BASE_URL,
  API_BASE_URL_NO_API: API_BASE_URL_NO_API,

  REQUEST_TIMEOUT: 30000,

  MAX_RETRIES: 3,

  DEBUG_MODE: false,

  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
};

function getDefaultHeaders() {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    Authorization: token ? `Bearer ${token}` : "",
  };
}

function buildApiUrl(endpoint, useApiSuffix = true) {
  const baseUrl = useApiSuffix
    ? CONFIG.API_BASE_URL
    : CONFIG.API_BASE_URL_NO_API;
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint.slice(1) : endpoint;
  return `${baseUrl}/${cleanEndpoint}`;
}

window.CONFIG = CONFIG;
window.API_BASE_URL = API_BASE_URL;
window.API_BASE_URL_NO_API = API_BASE_URL_NO_API;
window.getDefaultHeaders = getDefaultHeaders;
window.buildApiUrl = buildApiUrl;

console.log("🔧 Configuração global carregada:", CONFIG);
