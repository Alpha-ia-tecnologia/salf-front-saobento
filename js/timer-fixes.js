/**
 * Correções para os problemas de cronômetro no SALF
 * Este arquivo contém funções para corrigir problemas conhecidos
 * relacionados aos cronômetros nas avaliações de leitura
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('Carregando correções para os cronômetros...');
    
    // 1. Corrigir problema de duplicação de eventos de cronômetro
    corrigirDuplicacaoEventos();
    
    // 2. Corrigir problema de botões de próxima etapa
    corrigirBotoesProximaEtapa();
    
    // 3. Corrigir problema de sincronização entre etapas
    corrigirSincronizacaoEtapas();
    
    // 4. Corrigir comportamento de clique antes de iniciar cronômetro
    corrigirCliqueAntesInicioCronometro();
    
    console.log('Correções de cronômetro aplicadas com sucesso!');
});

/**
 * Corrige problema de duplicação de eventos quando um cronômetro é iniciado mais de uma vez
 */
function corrigirDuplicacaoEventos() {
    // Mapeamento de IDs dos botões para etapas 
    const mapeamentoBotoes = {
        'iniciar-timer-palavras': 'WORDS',
        'iniciar-timer-pseudopalavras': 'PSEUDOWORDS',
        'iniciar-timer-frases': 'SENTENCES',
        'iniciar-timer-texto': 'TEXT'
    };
    
    // Lista de IDs dos botões
    const botoesTimer = Object.keys(mapeamentoBotoes);
    
    botoesTimer.forEach(id => {
        const botao = document.getElementById(id);
        if (!botao) return;
        
        // Remover eventos existentes e re-adicionar um único evento
        const novoElemento = botao.cloneNode(true);
        if (botao.parentNode) {
            botao.parentNode.replaceChild(novoElemento, botao);
        }
        
        // Adicionar ouvinte de clique apenas uma vez
        novoElemento.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Extrair o tipo de etapa do ID do botão
            const etapaMatch = id.match(/iniciar-timer-(\w+)/);
            if (!etapaMatch) return;
            
            // Converter para o novo formato constante
            const etapaDOM = etapaMatch[1]; // nome do DOM (palavras, pseudopalavras, etc)
            const etapa = mapeamentoBotoes[id]; // nome constante (WORDS, PSEUDOWORDS, etc)
            
            console.log(`[Correção] Iniciando cronômetro para etapa: ${etapa}`);
            
            // Desabilitar o botão imediatamente para prevenir cliques múltiplos
            this.disabled = true;
            
            // Se o módulo TimerModule estiver disponível, usá-lo diretamente
            if (window.TimerModule && typeof window.iniciarTimer !== 'function') {
                const timerElement = document.getElementById(`timer-${etapaDOM}`);
                
                window.TimerModule.iniciarCronometro(etapa, 0.3, {
                    onStart: () => {
                        // Atualizar UI
                        this.textContent = 'Cronômetro iniciado';
                        this.classList.add('bg-gray-400');
                        this.classList.remove('bg-blue-600', 'hover:bg-blue-700');
                        
                        // Habilitar itens para clique
                        habilitarItensParaClicar(etapa, etapaDOM);
                    },
                    onTick: (_, segundosRestantes) => {
                        if (timerElement) {
                            timerElement.textContent = window.TimerModule.formatarTempo(segundosRestantes);
                        }
                    },
                    onComplete: () => {
                        // Desabilitar itens não marcados
                        desabilitarItensNaoMarcados(etapa, etapaDOM);
                        
                        // Habilitar botão de próxima etapa
                        const btnProximo = document.getElementById(`proximo-etapa-${etapaDOM}`);
                        if (btnProximo) {
                            btnProximo.disabled = false;
                            btnProximo.classList.remove('opacity-50', 'cursor-not-allowed');
                        }
                        
                        // Notificar
                        alert(`Tempo esgotado para a etapa de ${etapaDOM}!`);
                    }
                });
            } else if (typeof window.iniciarTimer === 'function') {
                // Usar a função global iniciarTimer, passando o nome do DOM para compatibilidade
                window.iniciarTimer(etapaDOM);
            }
        });
    });
}

/**
 * Corrige problemas com os botões de próxima etapa que às vezes ficam desabilitados
 */
function corrigirBotoesProximaEtapa() {
    // Mapeamento de botões para etapas constantes
    const mapeamentoBotoes = {
        'proximo-etapa-palavras': 'WORDS',
        'proximo-etapa-pseudopalavras': 'PSEUDOWORDS',
        'proximo-etapa-frases': 'SENTENCES',
        'proximo-etapa-texto': 'TEXT'
    };
    
    // Lista de IDs dos botões
    const botoesProxima = Object.keys(mapeamentoBotoes);
    
    botoesProxima.forEach(id => {
        const botao = document.getElementById(id);
        if (!botao) return;
        
        // Garantir que o botão fique desabilitado inicialmente
        botao.disabled = true;
        botao.classList.add('opacity-50', 'cursor-not-allowed');
        
        // Adicionar evento para ativar/desativar o botão com base no timer
        document.addEventListener('cronometroFinalizado', function(e) {
            if (e.detail && e.detail.etapa) {
                const etapaFinalizada = e.detail.etapa;
                // Extrair a etapa deste botão 
                const etapaMatch = id.match(/proximo-etapa-(\w+)/);
                if (etapaMatch) {
                    // Verificar se a etapa finalizada corresponde a este botão
                    const etapaDOM = etapaMatch[1];
                    const etapaConstante = mapeamentoBotoes[id];
                    
                    if (etapaFinalizada === etapaConstante || etapaFinalizada === etapaDOM) {
                        botao.disabled = false;
                        botao.classList.remove('opacity-50', 'cursor-not-allowed');
                    }
                }
            }
        });
    });
}

/**
 * Corrige problemas de sincronização quando se muda de uma etapa para outra
 */
function corrigirSincronizacaoEtapas() {
    // Mapeamento de etapas DOM para constantes e próximas etapas
    const mapeamentoEtapas = {
        'palavras': { constante: 'WORDS', proxima: 'pseudopalavras', proximaConstante: 'PSEUDOWORDS' },
        'pseudopalavras': { constante: 'PSEUDOWORDS', proxima: 'frases', proximaConstante: 'SENTENCES' },
        'frases': { constante: 'SENTENCES', proxima: 'texto', proximaConstante: 'TEXT' },
        'texto': { constante: 'TEXT', proxima: 'resultado', proximaConstante: 'RESULT' }
    };
    
    const botoesProxima = [
        'proximo-etapa-palavras',
        'proximo-etapa-pseudopalavras',
        'proximo-etapa-frases',
        'proximo-etapa-texto'
    ];
    
    botoesProxima.forEach(id => {
        const botao = document.getElementById(id);
        if (!botao) return;
        
        // Remover eventos existentes
        const novoElemento = botao.cloneNode(true);
        if (botao.parentNode) {
            botao.parentNode.replaceChild(novoElemento, botao);
        }
        
        // Adicionar evento de clique
        novoElemento.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Extrair as etapas do ID do botão
            const etapaMatch = id.match(/proximo-etapa-(\w+)/);
            if (!etapaMatch) return;
            
            const etapaAtualDOM = etapaMatch[1];
            const etapaInfo = mapeamentoEtapas[etapaAtualDOM];
            
            if (!etapaInfo) return;
            
            const etapaAtualConstante = etapaInfo.constante;
            const proximaEtapaDOM = etapaInfo.proxima;
            const proximaEtapaConstante = etapaInfo.proximaConstante;
            
            // Parar qualquer timer ativo da etapa atual
            if (window.TimerModule) {
                window.TimerModule.pararCronometro(etapaAtualConstante);
                // Também tenta parar usando o nome DOM para compatibilidade
                window.TimerModule.pararCronometro(etapaAtualDOM);
            } else if (window.estadoLeitura && window.estadoLeitura.timers) {
                // Verificar ambos formatos (constante e DOM)
                if (window.estadoLeitura.timers[etapaAtualConstante]) {
                    clearInterval(window.estadoLeitura.timers[etapaAtualConstante]);
                    window.estadoLeitura.timers[etapaAtualConstante] = null;
                }
                
                if (window.estadoLeitura.timers[etapaAtualDOM]) {
                    clearInterval(window.estadoLeitura.timers[etapaAtualDOM]);
                    window.estadoLeitura.timers[etapaAtualDOM] = null;
                }
            }
            
            // Esconder todas as etapas (usando nomes DOM para os IDs)
            const etapasIdsDOM = ['palavras', 'pseudopalavras', 'frases', 'texto', 'resultado', 'interpretacao'];
            etapasIdsDOM.forEach(id => {
                const elemento = document.getElementById(`etapa-${id}`);
                if (elemento) {
                    elemento.classList.add('hidden');
                }
            });
            
            // Mostrar a próxima etapa (usando nome DOM para o ID)
            const elementoProximaEtapa = document.getElementById(`etapa-${proximaEtapaDOM}`);
            if (elementoProximaEtapa) {
                elementoProximaEtapa.classList.remove('hidden');
                
                // Se for a etapa de resultado, preparar o resultado
                if (proximaEtapaDOM === 'resultado' && typeof window.prepararEtapaResultado === 'function') {
                    window.prepararEtapaResultado();
                }
            }
            
            console.log(`[Correção] Mudança de etapa: ${etapaAtualConstante} -> ${proximaEtapaConstante}`);
        });
    });
}

/**
 * Habilita os itens para clique em uma determinada etapa
 * @param {string} etapa - Constante da etapa (WORDS, PSEUDOWORDS, etc.)
 * @param {string} etapaDOM - Nome da etapa no DOM (palavras, pseudopalavras, etc.)
 */
function habilitarItensParaClicar(etapa, etapaDOM) {
    let seletor;
    
    // Usar o etapaDOM para determinar o seletor CSS
    switch (etapaDOM) {
        case 'palavras':
            seletor = '.palavra-item';
            break;
        case 'pseudopalavras':
            seletor = '.pseudopalavra-item';
            break;
        case 'frases':
            seletor = '.frase-item';
            break;
        case 'texto':
            seletor = '.linha-texto-item';
            break;
        default:
            return;
    }
    
    document.querySelectorAll(seletor).forEach(item => {
        item.classList.remove('bg-yellow-100', 'cursor-not-allowed');
        item.classList.add('bg-white', 'hover:bg-blue-100', 'cursor-pointer');
    });
}

/**
 * Desabilita os itens não marcados em uma determinada etapa
 * @param {string} etapa - Constante da etapa (WORDS, PSEUDOWORDS, etc.)
 * @param {string} etapaDOM - Nome da etapa no DOM (palavras, pseudopalavras, etc.)
 */
function desabilitarItensNaoMarcados(etapa, etapaDOM) {
    let seletor;
    
    // Usar o etapaDOM para determinar o seletor CSS
    switch (etapaDOM) {
        case 'palavras':
            seletor = '.palavra-item:not(.bg-green-200)';
            break;
        case 'pseudopalavras':
            seletor = '.pseudopalavra-item:not(.bg-green-200)';
            break;
        case 'frases':
            seletor = '.frase-item:not(.bg-green-200)';
            break;
        case 'texto':
            seletor = '.linha-texto-item:not(.bg-green-200)';
            break;
        default:
            return;
    }
    
    document.querySelectorAll(seletor).forEach(item => {
        item.classList.remove('bg-white', 'hover:bg-blue-100', 'cursor-pointer');
        item.classList.add('bg-red-100', 'cursor-not-allowed');
    });
    
    // Disparar evento de finalização do cronômetro com o nome constante da etapa
    document.dispatchEvent(new CustomEvent('cronometroFinalizado', { 
        detail: { etapa: etapa }
    }));
}

/**
 * Corrige comportamento quando usuário clica nos itens antes de iniciar o cronômetro
 * Evita as mensagens de alerta repetitivas substituindo-as por feedback visual
 */
function corrigirCliqueAntesInicioCronometro() {
    // Mapeamento entre seletores, nomes DOM e constantes
    const tiposItens = [
        { seletor: '.palavra-item', etapaDOM: 'palavras', etapa: 'WORDS' },
        { seletor: '.pseudopalavra-item', etapaDOM: 'pseudopalavras', etapa: 'PSEUDOWORDS' },
        { seletor: '.frase-item', etapaDOM: 'frases', etapa: 'SENTENCES' },
        { seletor: '.linha-texto-item', etapaDOM: 'texto', etapa: 'TEXT' }
    ];
    
    // Controle para não exibir alertas repetidos
    const alertasExibidos = {
        WORDS: false,
        PSEUDOWORDS: false,
        SENTENCES: false,
        TEXT: false,
        INTERPRETATION: false
    };
    
    // Rastreador do estado dos timers
    window.timerStatus = {
        WORDS: false,
        PSEUDOWORDS: false,
        SENTENCES: false,
        TEXT: false,
        INTERPRETATION: false
    };
    
    // Configurar observador de mudanças nos botões de timer
    const observarBotoesTimer = () => {
        const mapeamentoBotoes = {
            'iniciar-timer-palavras': 'WORDS',
            'iniciar-timer-pseudopalavras': 'PSEUDOWORDS',
            'iniciar-timer-frases': 'SENTENCES',
            'iniciar-timer-texto': 'TEXT'
        };
        
        const botoesTimer = Object.keys(mapeamentoBotoes);
        
        botoesTimer.forEach(id => {
            const botao = document.getElementById(id);
            if (!botao) return;
            
            // Quando um botão de timer é desabilitado, marcar o timer como ativo
            const etapaMatch = id.match(/iniciar-timer-(\w+)/);
            if (etapaMatch) {
                const etapaDOM = etapaMatch[1];
                const etapa = mapeamentoBotoes[id];
                
                // Observar mudanças no botão
                const observer = new MutationObserver((mutations) => {
                    mutations.forEach((mutation) => {
                        if (mutation.attributeName === 'disabled') {
                            const isDisabled = botao.disabled;
                            if (isDisabled) {
                                window.timerStatus[etapa] = true;
                                console.log(`[Timer] Cronômetro de ${etapa} ativado`);
                            }
                        }
                    });
                });
                
                observer.observe(botao, { attributes: true });
            }
        });
    };
    
    // Configurar observadores iniciais
    observarBotoesTimer();
    
    // Variável para armazenar o tooltip
    let tooltipAtual = null;
    
    // Criar um elemento de tooltip reutilizável
    const tooltip = document.createElement('div');
    tooltip.className = 'bg-yellow-100 text-yellow-800 px-3 py-2 rounded-md text-sm shadow-md fixed z-50 pointer-events-none opacity-0 transition-opacity duration-300';
    tooltip.style.maxWidth = '250px';
    tooltip.style.textAlign = 'center';
    document.body.appendChild(tooltip);
    
    // Para cada tipo de item, adicionar tratamento melhorado
    tiposItens.forEach(({ seletor, etapaDOM, etapa }) => {
        // Encontrar container da etapa
        const container = document.getElementById(`etapa-${etapaDOM}`);
        if (!container) return;
        
        // Adicionar delegação de eventos ao container
        container.addEventListener('click', function(e) {
            // Verificar se o elemento clicado ou algum de seus pais corresponde ao seletor
            let elementoClicado = e.target;
            let itemEncontrado = null;
            
            while (elementoClicado && elementoClicado !== container) {
                if (elementoClicado.matches(seletor)) {
                    itemEncontrado = elementoClicado;
                    break;
                }
                elementoClicado = elementoClicado.parentElement;
            }
            
            if (!itemEncontrado) return;
            
            // Verificar se o cronômetro está ativo
            const timerAtivo = verificarTimerAtivo(etapa, etapaDOM);
            
            // Se o item já estiver marcado como lido, não precisa interferir
            if (itemEncontrado.classList.contains('bg-green-200')) {
                return;
            }
            
            // Se o timer não estiver ativo, mostrar a mensagem e impedir o clique
            if (!timerAtivo) {
                e.preventDefault();
                e.stopPropagation();
                
                // Destacar visualmente o botão de iniciar cronômetro
                const btnTimer = document.getElementById(`iniciar-timer-${etapaDOM}`);
                if (btnTimer) {
                    // Aplicar animação pulsante
                    btnTimer.classList.add('animate-pulse');
                    btnTimer.classList.add('ring-4', 'ring-yellow-400', 'ring-opacity-50');
                    
                    // Remover a animação após 2 segundos
                    setTimeout(() => {
                        btnTimer.classList.remove('animate-pulse');
                        btnTimer.classList.remove('ring-4', 'ring-yellow-400', 'ring-opacity-50');
                    }, 2000);
                }
                
                // Mostrar tooltip ao invés de alerta
                exibirTooltip(itemEncontrado, `Inicie o cronômetro antes de marcar os itens`);
                
                // Mostrar alerta apenas uma vez por etapa
                if (!alertasExibidos[etapa]) {
                    alertasExibidos[etapa] = true;
                    // Substituir o alert por um toast ou notificação sutil
                    const mensagem = document.createElement('div');
                    mensagem.className = 'fixed bottom-4 right-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-3 rounded shadow-md z-50 animate-fade-in-up';
                    mensagem.innerHTML = `
                        <div class="flex">
                            <div class="py-1"><i class="fas fa-exclamation-circle text-yellow-500 mr-2"></i></div>
                            <div>
                                <p class="font-bold">Atenção</p>
                                <p>Por favor, inicie o cronômetro antes de marcar os itens.</p>
                            </div>
                        </div>
                    `;
                    document.body.appendChild(mensagem);
                    
                    // Remover após 3 segundos
                    setTimeout(() => {
                        mensagem.classList.add('animate-fade-out');
                        setTimeout(() => mensagem.remove(), 300);
                    }, 3000);
                }
                
                return false;
            }
        }, true); // Usar capture para pegar o evento antes que ele chegue ao elemento
    });
    
    /**
     * Exibe um tooltip próximo ao elemento
     */
    function exibirTooltip(elemento, texto) {
        // Limpar qualquer tooltip anterior
        if (tooltipAtual) {
            clearTimeout(tooltipAtual);
        }
        
        // Posicionar o tooltip
        const rect = elemento.getBoundingClientRect();
        tooltip.style.left = `${rect.left + rect.width / 2 - 125}px`; // centralizado
        tooltip.style.top = `${rect.top - 40}px`; // acima do elemento
        
        // Definir o texto e mostrar
        tooltip.textContent = texto;
        tooltip.style.opacity = '1';
        
        // Esconder após 2 segundos
        tooltipAtual = setTimeout(() => {
            tooltip.style.opacity = '0';
        }, 2000);
    }
    
    /**
     * Verifica se o timer para a etapa está ativo
     * @param {string} etapa - Constante da etapa (WORDS, PSEUDOWORDS, etc.)
     * @param {string} etapaDOM - Nome da etapa no DOM (palavras, pseudopalavras, etc.)
     */
    function verificarTimerAtivo(etapa, etapaDOM) {
        // Verificar no rastreador de status
        if (window.timerStatus && window.timerStatus[etapa] === true) {
            return true;
        }
        
        // Verificar visualmente - se o timer não estiver mais mostrando "01:00", então está ativo
        const timerElement = document.getElementById(`timer-${etapaDOM}`);
        if (timerElement && timerElement.textContent !== '01:00') {
            window.timerStatus[etapa] = true;
            return true;
        }
        
        // Verificar se o botão de iniciar está desabilitado
        const btnTimer = document.getElementById(`iniciar-timer-${etapaDOM}`);
        if (btnTimer && btnTimer.disabled) {
            window.timerStatus[etapa] = true;
            return true;
        }
        
        // Verificar no módulo TimerModule
        if (window.TimerModule && window.TimerModule.estaCronometroAtivo) {
            // Verificar tanto a etapa constante quanto a DOM
            if (window.TimerModule.estaCronometroAtivo(etapa) || 
                window.TimerModule.estaCronometroAtivo(etapaDOM)) {
                window.timerStatus[etapa] = true;
                return true;
            }
        }
        
        // Verificar na variável estadoLeitura global
        if (window.estadoLeitura && window.estadoLeitura.timers) {
            // Verificar tanto a etapa constante quanto a DOM
            if (window.estadoLeitura.timers[etapa] || 
                window.estadoLeitura.timers[etapaDOM]) {
                window.timerStatus[etapa] = true;
                return true;
            }
        }
        
        // Verificar na avaliacao-anonima.js
        if (window.estado && window.estado.timers) {
            // Verificar tanto a etapa constante quanto a DOM
            if (window.estado.timers[etapa] || 
                window.estado.timers[etapaDOM]) {
                window.timerStatus[etapa] = true;
                return true;
            }
        }
        
        // Verificar se o cronômetro foi substituído por um true simples (acontece às vezes)
        if (window.estadoLeitura && window.estadoLeitura.timers) {
            if (window.estadoLeitura.timers[etapa] === true || 
                window.estadoLeitura.timers[etapaDOM] === true) {
                window.timerStatus[etapa] = true;
                return true;
            }
        }
        
        return false;
    }
    
    // Adicionar estilos para animações
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeOut {
            from { opacity: 1; }
            to { opacity: 0; }
        }
        .animate-fade-in-up {
            animation: fadeInUp 0.3s ease-out forwards;
        }
        .animate-fade-out {
            animation: fadeOut 0.3s ease-out forwards;
        }
        .animate-pulse {
            animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: .5; }
        }
    `;
    document.head.appendChild(style);
} 