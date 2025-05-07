/**
 * Script para garantir que os botões de timer estejam corretamente habilitados
 * Este script deve ser adicionado após todos os outros scripts da avaliação
 */
(function() {
    console.log('🔄 Script de ativação de botões carregado');
    
    // Executar ao carregar a página e depois periodicamente
    document.addEventListener('DOMContentLoaded', function() {
        console.log('🔄 DOM carregado - Iniciando correções de botões');
        
        // Ativar botões imediatamente
        ativarBotoesTimer();
        
        // Repetir a ativação para garantir que botões fiquem disponíveis mesmo após
        // possíveis manipulações por outros scripts
        setInterval(ativarBotoesTimer, 2000);
    });
    
    /**
     * Garante que os botões de iniciar timer estejam habilitados
     */
    function ativarBotoesTimer() {
        const botoes = [
            'iniciar-timer-palavras',
            'iniciar-timer-pseudopalavras',
            'iniciar-timer-frases',
            'iniciar-timer-texto'
        ];
        
        botoes.forEach(id => {
            const botao = document.getElementById(id);
            if (botao) {
                if (botao.disabled) {
                    console.log(`🔄 Habilitando botão de timer: ${id}`);
                }
                
                // Remover atributo disabled
                botao.disabled = false;
                
                // Remover classes de desativado
                botao.classList.remove('opacity-50', 'cursor-not-allowed', 'bg-gray-400');
                
                // Adicionar classes de ativo
                botao.classList.add('bg-blue-600', 'hover:bg-blue-700', 'cursor-pointer');
                
                // Garantir que o evento de clique está sendo propagado
                botao.style.pointerEvents = 'auto';
                
                // Atualizar texto se necessário
                if (botao.textContent === 'Cronômetro iniciado') {
                    botao.textContent = 'Iniciar Cronômetro';
                }
            }
        });
    }
})(); 