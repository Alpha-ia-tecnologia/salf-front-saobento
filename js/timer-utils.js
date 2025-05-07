/**
 * Módulo de utilidades para gerenciar cronômetros consistentes na aplicação SALF
 * Este módulo centraliza a lógica de cronômetro para garantir consistência e evitar bugs
 */

const TimerModule = (function() {
    // Armazenar todos os cronômetros ativos
    const activeTimers = {};
    
    // Callbacks padrão que podem ser sobrescritos
    const defaultCallbacks = {
        onTick: (etapa, segundosRestantes) => {},
        onComplete: (etapa) => {},
        onStart: (etapa) => {},
        onStop: (etapa) => {}
    };
    
    // Registrar callbacks globais
    let globalCallbacks = { ...defaultCallbacks };
    
    /**
     * Inicia um cronômetro para uma etapa específica
     * @param {string} etapa - Identificador da etapa (ex: 'palavras', 'pseudopalavras')
     * @param {number} duracao - Duração em segundos, padrão 3 segundos
     * @param {Object} callbacks - Callbacks para eventos do cronômetro
     * @returns {Object} Objeto com métodos para controlar o cronômetro
     */
    function iniciarCronometro(etapa, duracao = 3, callbacks = {}) {
        // Verificar se já existe um cronômetro ativo para esta etapa
        if (activeTimers[etapa]) {
            console.warn(`Já existe um cronômetro ativo para a etapa: ${etapa}`);
            return false;
        }
        
        console.log(`Iniciando cronômetro para etapa: ${etapa}, duração: ${duracao}s`);
        
        // Mesclar callbacks específicos com os globais
        const mergedCallbacks = { ...globalCallbacks, ...callbacks };
        
        // Armazenar o timestamp inicial para garantir precisão
        const startTime = Date.now();
        const endTime = startTime + (duracao * 1000);
        
        // Disparar callback de início
        mergedCallbacks.onStart(etapa);
        
        // Atualizar imediatamente (para mostrar o tempo inicial)
        const segundosRestantes = duracao;
        mergedCallbacks.onTick(etapa, segundosRestantes);
        
        // Iniciar o intervalo
        const intervalId = setInterval(() => {
            // Calcular tempo restante baseado na diferença real de tempo
            const now = Date.now();
            const tempoDecorrido = now - startTime;
            const segundosRestantes = Math.ceil((endTime - now) / 1000);
            
            // Disparar callback de tick com o tempo restante
            mergedCallbacks.onTick(etapa, segundosRestantes);
            
            // Verificar se o tempo acabou
            if (now >= endTime) {
                // Parar o timer
                clearInterval(intervalId);
                delete activeTimers[etapa];
                
                // Disparar callback de conclusão
                mergedCallbacks.onComplete(etapa);
                console.log(`Cronômetro concluído para etapa: ${etapa}`);
            }
        }, 250); // Atualização mais frequente para garantir precisão
        
        // Armazenar informações do timer
        activeTimers[etapa] = {
            id: intervalId,
            startTime,
            endTime,
            duracaoEmSegundos: duracao,
            callbacks: mergedCallbacks
        };
        
        return true;
    }
    
    /**
     * Para um cronômetro em execução
     * @param {string} etapa - Identificador da etapa
     * @returns {boolean} - true se o cronômetro foi parado, false se não existia
     */
    function pararCronometro(etapa) {
        if (!activeTimers[etapa]) {
            console.warn(`Nenhum cronômetro ativo para a etapa: ${etapa}`);
            return false;
        }
        
        console.log(`Parando cronômetro para etapa: ${etapa}`);
        
        // Parar o intervalo
        clearInterval(activeTimers[etapa].id);
        
        // Disparar callback de parada
        activeTimers[etapa].callbacks.onStop(etapa);
        
        // Remover da lista de ativos
        delete activeTimers[etapa];
        
        return true;
    }
    
    /**
     * Verifica se um cronômetro está ativo
     * @param {string} etapa - Identificador da etapa
     * @returns {boolean} - true se o cronômetro está ativo
     */
    function estaCronometroAtivo(etapa) {
        return !!activeTimers[etapa];
    }
    
    /**
     * Obtém o tempo restante de um cronômetro em segundos
     * @param {string} etapa - Identificador da etapa
     * @returns {number|null} - Tempo restante em segundos ou null se não existir
     */
    function getTempoRestante(etapa) {
        if (!activeTimers[etapa]) {
            return null;
        }
        
        const now = Date.now();
        const tempoRestanteMs = Math.max(0, activeTimers[etapa].endTime - now);
        return Math.ceil(tempoRestanteMs / 1000);
    }
    
    /**
     * Formata um tempo em segundos para o formato MM:SS
     * @param {number} segundos - Tempo em segundos
     * @returns {string} - Tempo formatado como MM:SS
     */
    function formatarTempo(segundos) {
        const minutos = Math.floor(segundos / 60);
        const segundosRestantes = segundos % 60;
        return `${minutos.toString().padStart(2, '0')}:${segundosRestantes.toString().padStart(2, '0')}`;
    }
    
    /**
     * Para todos os cronômetros ativos
     */
    function pararTodosCronometros() {
        console.log('Parando todos os cronômetros ativos');
        Object.keys(activeTimers).forEach(etapa => {
            pararCronometro(etapa);
        });
    }
    
    /**
     * Configura callbacks globais para todos os cronômetros
     * @param {Object} callbacks - Objeto com callbacks
     */
    function configurarCallbacksGlobais(callbacks) {
        globalCallbacks = { ...defaultCallbacks, ...callbacks };
    }
    
    // Limpar todos os timers quando a página é descarregada
    window.addEventListener('unload', pararTodosCronometros);
    
    return {
        iniciarCronometro,
        pararCronometro,
        estaCronometroAtivo,
        getTempoRestante,
        formatarTempo,
        pararTodosCronometros,
        configurarCallbacksGlobais
    };
})();

// Exportar o módulo para uso global
window.TimerModule = TimerModule; 