/**
 * Script para garantir que os botões de timer estejam corretamente habilitados
 * Este script deve ser adicionado após todos os outros scripts da avaliação
 */
(function() {
    console.log('🔄 Script de ativação de botões carregado');
    
    // Executar ao carregar a página e depois periodicamente
    document.addEventListener('DOMContentLoaded', function() {
        console.log('🔄 DOM carregado - Iniciando correções de botões');
        
        // Função para ativar todos os botões da interface
        function ativarTodosBotoes() {
            // Seletor para todos os botões da interface de avaliação
            const botoes = document.querySelectorAll('.btn-next-step, button[id^="proximo-etapa"], button[id^="iniciar-timer"]');
            
            // Remover o atributo disabled de todos os botões
            botoes.forEach(botao => {
                botao.removeAttribute('disabled');
            });
            
            console.log('Todos os botões foram ativados');
        }
        
        // Ativar botões imediatamente
        ativarTodosBotoes();
        
        // Ativar também o botão de iniciar avaliação
        const btnIniciarAvaliacao = document.getElementById('iniciar-avaliacao');
        if (btnIniciarAvaliacao) {
            btnIniciarAvaliacao.removeAttribute('disabled');
        }
        
        // Garantir que novos botões também sejam ativados (para elementos adicionados dinamicamente)
        setInterval(ativarTodosBotoes, 2000);
    });
})(); 