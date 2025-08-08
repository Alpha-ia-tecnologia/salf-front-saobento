/**
 * Configuração global do sistema SALF
 * Centraliza todas as configurações importantes em um único local
 */

// URL base da API
const API_BASE_URL = 'https://sao-bento-salf-api.gkgtsp.easypanel.host/api';

// URL base da API sem o /api para alguns endpoints específicos
const API_BASE_URL_NO_API = 'https://sao-bento-salf-api.gkgtsp.easypanel.host/';

// Configuração para modo de desenvolvimento/produção
const CONFIG = {
    // URLs da API
    API_BASE_URL: API_BASE_URL,
    API_BASE_URL_NO_API: API_BASE_URL_NO_API,
    
    // Configurações de timeout para requisições
    REQUEST_TIMEOUT: 30000,
    
    // Configurações de retry
    MAX_RETRIES: 3,
    
    // Configurações de debug
    DEBUG_MODE: false,
    
    // Configurações de paginação
    DEFAULT_PAGE_SIZE: 20,
    MAX_PAGE_SIZE: 100
};

// Função para obter headers padrão para as requisições
function getDefaultHeaders() {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
    };
}

// Função para construir URL completa da API
function buildApiUrl(endpoint, useApiSuffix = true) {
    const baseUrl = useApiSuffix ? CONFIG.API_BASE_URL : CONFIG.API_BASE_URL_NO_API;
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
    return `${baseUrl}/${cleanEndpoint}`;
}

// Tornar as configurações globalmente disponíveis
window.CONFIG = CONFIG;
window.API_BASE_URL = API_BASE_URL;
window.API_BASE_URL_NO_API = API_BASE_URL_NO_API;
window.getDefaultHeaders = getDefaultHeaders;
window.buildApiUrl = buildApiUrl;

// Log para confirmar que a configuração foi carregada
console.log('🔧 Configuração global carregada:', CONFIG); 