/**
 * Script de correção para garantir que os itens de avaliação sejam clicáveis
 * Este script deve ser adicionado após todos os outros scripts da avaliação
 */
(function() {
    console.log('🔧 Script de correção de cliques carregado');
    
    // Executar a correção quando o DOM estiver carregado
    document.addEventListener('DOMContentLoaded', function() {
        console.log('🔧 DOM carregado - Iniciando correções');
        
        // Executar correção inicial
        corrigirTodasEtapas();
        
        // Executar novamente após curtos intervalos para garantir
        setTimeout(corrigirTodasEtapas, 1000);
        setTimeout(corrigirTodasEtapas, 3000);
        
        // Adicionar listeners aos botões de iniciar timer
        adicionarListenersAosBotoes();
        
        // Função para ativar todos os itens clicáveis
        function ativarTodasOpcoes() {
            console.log('Ativando todas as opções clicáveis...');
            
            // Seletores para todos os tipos de itens
            const itens = document.querySelectorAll(
                '.palavra-item, .pseudopalavra-item, .frase-item, .linha-texto-item'
            );
            
            // Remover classes que impedem o clique e adicionar classes que permitem o clique
            itens.forEach(item => {
                // Remover classes que bloqueiam
                item.classList.remove('bg-yellow-100', 'cursor-not-allowed', 'opacity-50', 'disabled');
                
                // Adicionar classes que permitem o clique
                item.classList.add('bg-white', 'hover:bg-blue-100', 'cursor-pointer');
                
                // Garantir que o evento de clique funcione
                item.style.pointerEvents = 'auto';
                
                // Adicionar/modificar o evento de clique
                item.onclick = function() {
                    // Alternar entre marcado e não marcado
                    if (this.classList.contains('bg-green-200')) {
                        this.classList.remove('bg-green-200');
                        this.classList.add('bg-white', 'hover:bg-blue-100');
                        
                        // Atualizar contadores
                        atualizarContadores();
                    } else {
                        this.classList.add('bg-green-200');
                        this.classList.remove('bg-white', 'hover:bg-blue-100');
                        
                        // Atualizar contadores
                        atualizarContadores();
                    }
                };
            });
            
            console.log('Opções ativadas com sucesso!');
        }
        
        // Função para atualizar todos os contadores
        function atualizarContadores() {
            // Palavras
            const palavrasLidas = document.querySelectorAll('.palavra-item.bg-green-200').length;
            const totalPalavrasLidas = document.getElementById('total-palavras-lidas');
            if (totalPalavrasLidas) totalPalavrasLidas.textContent = palavrasLidas;
            
            // Pseudopalavras
            const pseudopalavrasLidas = document.querySelectorAll('.pseudopalavra-item.bg-green-200').length;
            const totalPseudopalavrasLidas = document.getElementById('total-pseudopalavras-lidas');
            if (totalPseudopalavrasLidas) totalPseudopalavrasLidas.textContent = pseudopalavrasLidas;
            
            // Frases
            const frasesLidas = document.querySelectorAll('.frase-item.bg-green-200').length;
            const totalFrasesLidas = document.getElementById('total-frases-lidas');
            if (totalFrasesLidas) totalFrasesLidas.textContent = frasesLidas;
            
            // Linhas de texto
            const linhasLidas = document.querySelectorAll('.linha-texto-item.bg-green-200').length;
            const totalLinhasLidas = document.getElementById('total-linhas-lidas');
            if (totalLinhasLidas) totalLinhasLidas.textContent = linhasLidas;
        }
        
        // Ativar todas as opções imediatamente
        ativarTodasOpcoes();
        
        // Verificar regularmente para garantir que novas opções também sejam ativadas
        setInterval(ativarTodasOpcoes, 2000);
        
        // Sobrescrever verificação de timer nas funções de leitura
        if (window.iniciarTimer) {
            const originalIniciarTimer = window.iniciarTimer;
            window.iniciarTimer = function(etapa) {
                // Chamar a função original
                originalIniciarTimer(etapa);
                
                // Garantir que todos os itens estejam ativados
                setTimeout(ativarTodasOpcoes, 100);
            };
        }
    });
    
    /**
     * Corrige cliques em todas as etapas de avaliação
     */
    function corrigirTodasEtapas() {
        console.log('🔧 Aplicando correções para todas as etapas');
        corrigirCliquesEtapa('palavras', '#etapa-palavras', '.palavra-item');
        corrigirCliquesEtapa('pseudopalavras', '#etapa-pseudopalavras', '.pseudopalavra-item');
        corrigirCliquesEtapa('frases', '#etapa-frases', '.frase-item');
        corrigirCliquesEtapa('texto', '#etapa-texto', '.linha-texto-item');
    }
    
    /**
     * Corrige cliques em uma etapa específica
     * @param {string} etapaNome - Nome da etapa (palavras, pseudopalavras, etc)
     * @param {string} etapaSelector - Seletor CSS do container da etapa
     * @param {string} itemClass - Classe CSS dos itens
     */
    function corrigirCliquesEtapa(etapaNome, etapaSelector, itemClass) {
        console.log(`🔧 Corrigindo cliques para etapa: ${etapaNome}`);
        
        // Encontrar todos os itens para esta etapa
        let itens = [];
        
        // Tentar encontrar pelo container e seletor dos itens
        const container = document.querySelector(etapaSelector);
        if (container) {
            // Primeiro, tente o seletor específico da classe
            itens = Array.from(document.querySelectorAll(itemClass));
            
            // Se não encontrou, tente buscar os divs dentro dos containers específicos
            if (itens.length === 0) {
                if (etapaNome === 'palavras' || etapaNome === 'pseudopalavras') {
                    itens = Array.from(container.querySelectorAll('.grid > div'));
                } else if (etapaNome === 'frases') {
                    itens = Array.from(document.querySelectorAll('#frases-container > div'));
                } else if (etapaNome === 'texto') {
                    itens = Array.from(document.querySelectorAll('#texto-container > div'));
                }
            }
            
            // Se ainda não encontrou, busque qualquer div dentro do container
            if (itens.length === 0) {
                itens = Array.from(container.querySelectorAll('div'))
                    .filter(div => div.textContent.trim() !== '' && !div.classList.contains('flex'));
            }
        }
        
        console.log(`🔧 Encontrados ${itens.length} itens para a etapa ${etapaNome}`);
        
        // Remover a classe cursor-not-allowed e aplicar classes para habilitar clique
        itens.forEach(item => {
            // Adicionar a classe específica do tipo de item se não tiver
            if (!item.classList.contains(itemClass.substring(1))) {
                item.classList.add(itemClass.substring(1));
            }
            
            // Remover classes que desabilitam o clique
            item.classList.remove('cursor-not-allowed', 'opacity-50', 'bg-gray-200');
            
            // Adicionar classes que habilitam o clique
            item.classList.add('cursor-pointer');
            if (!item.classList.contains('bg-green-200')) {
                item.classList.add('hover:bg-blue-100');
            }
            
            // Garantir que pointer-events esteja ativado
            item.style.pointerEvents = 'auto';
            
            // Adicionar evento de clique (clone o nó para remover listeners antigos)
            const novoItem = item.cloneNode(true);
            
            // Adicionar novo evento de clique
            novoItem.addEventListener('click', function() {
                console.log(`🔧 Item clicado na etapa ${etapaNome}`);
                
                // Verificar se o item já está marcado
                if (this.classList.contains('bg-green-200')) {
                    // Desmarcar item
                    this.classList.remove('bg-green-200');
                    this.classList.add('hover:bg-blue-100');
                    
                    // Decrementar contador
                    const contador = document.getElementById(`total-${etapaNome === 'texto' ? 'linhas' : etapaNome}-lidas`);
                    if (contador) {
                        const valor = parseInt(contador.textContent) || 0;
                        contador.textContent = Math.max(0, valor - 1);
                    }
                } else {
                    // Marcar item como lido
                    this.classList.remove('hover:bg-blue-100');
                    this.classList.add('bg-green-200');
                    
                    // Incrementar contador
                    const contador = document.getElementById(`total-${etapaNome === 'texto' ? 'linhas' : etapaNome}-lidas`);
                    if (contador) {
                        const valor = parseInt(contador.textContent) || 0;
                        contador.textContent = valor + 1;
                    }
                }
            });
            
            // Substituir o item antigo pelo novo
            if (item.parentNode) {
                item.parentNode.replaceChild(novoItem, item);
            }
        });
    }
    
    /**
     * Adiciona listeners aos botões de iniciar cronômetro
     */
    function adicionarListenersAosBotoes() {
        const botoes = [
            { id: 'iniciar-timer-palavras', etapa: 'palavras' },
            { id: 'iniciar-timer-pseudopalavras', etapa: 'pseudopalavras' },
            { id: 'iniciar-timer-frases', etapa: 'frases' },
            { id: 'iniciar-timer-texto', etapa: 'texto' }
        ];
        
        botoes.forEach(botao => {
            const elemento = document.getElementById(botao.id);
            if (elemento) {
                console.log(`🔧 Adicionando listener ao botão: ${botao.id}`);
                
                // Clonar o botão para remover listeners existentes
                const novoBotao = elemento.cloneNode(true);
                
                // Adicionar novo listener
                novoBotao.addEventListener('click', function() {
                    console.log(`🔧 Botão ${botao.id} clicado - Habilitando itens para a etapa ${botao.etapa}`);
                    
                    // Aplicar correção para esta etapa
                    setTimeout(() => {
                        corrigirCliquesEtapa(botao.etapa, 
                                         `#etapa-${botao.etapa}`, 
                                         `.${botao.etapa === 'texto' ? 'linha-texto' : botao.etapa}-item`);
                    }, 100);
                });
                
                // Substituir o botão original
                if (elemento.parentNode) {
                    elemento.parentNode.replaceChild(novoBotao, elemento);
                }
            }
        });
    }
})(); 