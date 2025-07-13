/**
 * Serviço de API para buscar dados para o sistema SALF
 * Centraliza todas as chamadas de API em um único local
 */
const ApiService = (function() {
    // URL base da API - agora vem da configuração global
    // const API_BASE_URL = 'https://salf-salf-api2.gkgtsp.easypanel.host/api'; // Removido - usando configuração global
    
    /**
     * Obtém um token de autenticação do localStorage
     * @returns {string|null} Token de autenticação ou null se não existir
     */
    function getAuthToken() {
        return localStorage.getItem('token');
    }
    
    /**
     * Configura os cabeçalhos para requisições
     * @returns {Object} Objeto com cabeçalhos para requisições
     */
    function getHeaders() {
        const token = getAuthToken();
        return {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : ''
        };
    }
    
    /**
     * Realiza uma requisição GET para a API
     * @param {string} endpoint - Endpoint da API
     * @returns {Promise<any>} Promise com os dados da resposta
     */
    async function get(endpoint) {
        try {
            const response = await fetch(`${window.API_BASE_URL}/${endpoint}`, {
                method: 'GET',
                headers: getHeaders()
            });
            
            if (!response.ok) {
                throw new Error(`Erro na requisição: ${response.status} ${response.statusText}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Erro ao fazer requisição GET:', error);
            throw error;
        }
    }
    
    /**
     * Realiza uma requisição POST para a API
     * @param {string} endpoint - Endpoint da API
     * @param {Object} data - Dados a serem enviados no corpo da requisição
     * @returns {Promise<any>} Promise com os dados da resposta
     */
    async function post(endpoint, data) {
        try {
            const response = await fetch(`${window.API_BASE_URL}/${endpoint}`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify(data)
            });
            
            if (!response.ok) {
                throw new Error(`Erro na requisição: ${response.status} ${response.statusText}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Erro ao fazer requisição POST:', error);
            throw error;
        }
    }
    
    /**
     * Realiza uma requisição PUT para a API
     * @param {string} endpoint - Endpoint da API
     * @param {Object} data - Dados a serem enviados no corpo da requisição
     * @returns {Promise<any>} Promise com os dados da resposta
     */
    async function put(endpoint, data) {
        try {
            const response = await fetch(`${window.API_BASE_URL}/${endpoint}`, {
                method: 'PUT',
                headers: getHeaders(),
                body: JSON.stringify(data)
            });
            
            if (!response.ok) {
                throw new Error(`Erro na requisição: ${response.status} ${response.statusText}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Erro ao fazer requisição PUT:', error);
            throw error;
        }
    }
    
    // Interface pública do serviço de API
    return {
        // Métodos gerais da API
        get,
        post,
        put,
        
        // Métodos específicos para entidades
        escolas: {
            /**
             * Busca todas as escolas
             * Rota: /schools
             * @returns {Promise<Array>} Promise com a lista de escolas
             */
            getAll: async function() {
                return await get('schools');
            }
        },
        
        turmas: {
            /**
             * Busca todas as turmas
             * Rota: /class-groups
             * @returns {Promise<Array>} Promise com a lista de turmas
             */
            getAll: async function() {
                return await get('class-groups');
            },
            
            /**
             * Filtra turmas por escola (filtro local)
             * @param {number} escolaId - ID da escola
             * @param {Array} turmas - Lista de todas as turmas
             * @returns {Array} Lista de turmas filtradas
             */
            filtrarPorEscola: function(escolaId, turmas) {
                if (!turmas || !Array.isArray(turmas)) return [];
                return turmas.filter(turma => turma.schoolId == escolaId);
            }
        },
        
        alunos: {
            /**
             * Busca todos os alunos
             * Rota: /students
             * @returns {Promise<Array>} Promise com a lista de alunos
             */
            getAll: async function() {
                return await get('students');
            },
            
            /**
             * Filtra alunos por turma (filtro local)
             * @param {number} turmaId - ID da turma
             * @param {Array} alunos - Lista de todos os alunos
             * @returns {Array} Lista de alunos filtrados
             */
            filtrarPorTurma: function(turmaId, alunos) {
                if (!alunos || !Array.isArray(alunos)) return [];
                return alunos.filter(aluno => aluno.classGroupId == turmaId);
            }
        },
        
        eventosAvaliacao: {
            /**
             * Busca todos os eventos de avaliação
             * Rota: /assessment-events
             * @returns {Promise<Array>} Promise com a lista de eventos
             */
            getAll: async function() {
                return await get('assessment-events');
            },
            
            /**
             * Busca os eventos de avaliação mais recentes para um aluno
             * @param {number} alunoId - ID do aluno
             * @returns {Promise<Object>} Promise com os dados dos eventos e testes disponíveis
             */
            getByAluno: async function(alunoId) {
                return await get(`reading-assessments/student/${alunoId}/latest`);
            }
        },

        avaliacoes: {
            /**
             * Busca todas as avaliações
             * Rota: /assessments
             * @returns {Promise<Array>} Promise com a lista de avaliações
             */
            getAll: async function() {
                return await get('assessments');
            },

            /**
             * Busca uma avaliação por ID
             * @param {number} id - ID da avaliação
             * @returns {Promise<Object>} Promise com os dados da avaliação
             */
            getById: async function(id) {
                return await get(`assessments/${id}`);
            },

            /**
             * Cria uma nova avaliação
             * @param {Object} dados - Dados da avaliação
             * @returns {Promise<Object>} Promise com os dados da avaliação criada
             */
            criar: async function(dados) {
                return await post('assessments', dados);
            },

            /**
             * Atualiza uma avaliação existente
             * @param {number} id - ID da avaliação
             * @param {Object} dados - Dados atualizados da avaliação
             * @returns {Promise<Object>} Promise com os dados da avaliação atualizada
             */
            atualizar: async function(id, dados) {
                return await put(`assessments/${id}`, dados);
            }
        }
    };
})();

// Tornar o serviço disponível globalmente
window.ApiService = ApiService; 