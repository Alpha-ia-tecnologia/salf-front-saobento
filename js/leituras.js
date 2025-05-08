// Sistema de Avaliação de Leitura e Fluência - Módulo de Leituras
// Este módulo é responsável por gerenciar as etapas de leitura da avaliação

// Token de autenticação
const token = localStorage.getItem('authToken');
const headers = {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : ''
};

// URL base da API
const API_BASE_URL = "https://salf-salf-api.py5r5i.easypanel.host/api";

// Elementos DOM relacionados às etapas de leitura
const etapasDOM = {
    // Containers
    palavras: document.getElementById('etapa-palavras'),
    pseudopalavras: document.getElementById('etapa-pseudopalavras'),
    frases: document.getElementById('etapa-frases'),
    texto: document.getElementById('etapa-texto'),
    resultado: document.getElementById('etapa-resultado'),
    
    // Grids e containers de itens
    gridPalavras: document.querySelector('#etapa-palavras .grid'),
    gridPseudopalavras: document.querySelector('#etapa-pseudopalavras .grid'),
    containerFrases: document.getElementById('frases-container'),
    containerTexto: document.getElementById('texto-container'),
    
    // Timers
    timerPalavras: document.getElementById('timer-palavras'),
    timerPseudopalavras: document.getElementById('timer-pseudopalavras'),
    timerFrases: document.getElementById('timer-frases'),
    timerTexto: document.getElementById('timer-texto'),
    
    // Botões de timer
    btnTimerPalavras: document.getElementById('iniciar-timer-palavras'),
    btnTimerPseudopalavras: document.getElementById('iniciar-timer-pseudopalavras'),
    btnTimerFrases: document.getElementById('iniciar-timer-frases'),
    btnTimerTexto: document.getElementById('iniciar-timer-texto'),
    
    // Botões de navegação
    btnProximoPalavras: document.getElementById('proximo-etapa-palavras'),
    btnProximoPseudopalavras: document.getElementById('proximo-etapa-pseudopalavras'),
    btnProximoFrases: document.getElementById('proximo-etapa-frases'),
    btnProximoTexto: document.getElementById('proximo-etapa-texto'),
    
    // Contadores
    totalPalavrasLidas: document.getElementById('total-palavras-lidas'),
    totalPalavras: document.getElementById('total-palavras'),
    totalPseudopalavrasLidas: document.getElementById('total-pseudopalavras-lidas'),
    totalPseudopalavras: document.getElementById('total-pseudopalavras'),
    totalFrasesLidas: document.getElementById('total-frases-lidas'),
    totalFrases: document.getElementById('total-frases'),
    totalLinhasLidas: document.getElementById('total-linhas-lidas'),
    totalLinhas: document.getElementById('total-linhas')
};

// Estado da avaliação
const estadoLeitura = {
    palavrasLidas: 0,
    pseudopalavrasLidas: 0,
    frasesLidas: 0,
    linhasLidas: 0,
    tempoRestante: {
        // Usar constantes para os nomes das etapas
        WORDS: 3,          // Reduzido de 60 para 3 segundos
        PSEUDOWORDS: 3,     // Reduzido de 60 para 3 segundos  
        SENTENCES: 3,       // Reduzido de 60 para 3 segundos
        TEXT: 3,            // Reduzido de 60 para 3 segundos
        INTERPRETATION: 3,  // Reduzido de 60 para 3 segundos
        // Manter os nomes antigos para compatibilidade
        palavras: 3,        // Reduzido de 60 para 3 segundos
        pseudopalavras: 3,   // Reduzido de 60 para 3 segundos
        frases: 3,           // Reduzido de 60 para 3 segundos
        texto: 3             // Reduzido de 60 para 3 segundos
    },
    timers: {
        // Usar constantes para os nomes das etapas
        WORDS: null,
        PSEUDOWORDS: null,
        SENTENCES: null,
        TEXT: null,
        INTERPRETATION: null,
        // Manter os nomes antigos para compatibilidade
        palavras: null,
        pseudopalavras: null,
        frases: null,
        texto: null
    },
    avaliacao: null,
    aluno: null
};

// Dados de exemplo para teste
const dadosTeste = {
    palavras: [
        "casa", "bola", "gato", "mesa", "livro", "pato", "fogo", "roda", "vela", "mala",
        "lobo", "rato", "sapo", "faca", "pipa", "dedo", "moto", "suco", "bota", "lua"
    ],
    pseudopalavras: [
        "dalu", "fema", "pilo", "sati", "beco", "vota", "mipe", "catu", "lemi", "rano",
        "bagi", "pute", "seco", "vilo", "fota", "zema", "neri", "joba", "tibe", "cuna"
    ],
    frases: [
        "O menino corre no parque.",
        "A menina gosta de sorvete.",
        "O gato subiu na árvore.",
        "Minha mãe fez um bolo gostoso.",
        "O cachorro late para o carteiro."
    ],
    texto: "A menina de cabelos dourados caminhava pela floresta. Era uma linda manhã de primavera, e as flores coloridas enfeitavam o caminho. Ela carregava uma cesta com frutas frescas para sua avó. O sol brilhava entre as folhas das árvores, criando sombras dançantes no chão."
};

// Inicialização do módulo
function inicializarModuloLeituras() {
    console.log("Inicializando módulo de leituras...");
    
    // Configurar botões de navegação entre etapas
    configurarBotoesNavegacao();
    
    // Configurar botões de timer
    configurarBotoesTimer();
    
    // Verificar se já tem uma avaliação em andamento (através dos parâmetros da URL)
    const params = new URLSearchParams(window.location.search);
    const alunoId = params.get('aluno');
    const eventoId = params.get('evento');
    
    if (alunoId && eventoId) {
        console.log(`Avaliação em andamento: Aluno ID ${alunoId}, Evento ID ${eventoId}`);
        carregarDetalhesAvaliacao(alunoId, eventoId);
    }
    
    console.log("Módulo de leituras inicializado com sucesso!");
}

// Configuração dos botões de navegação
function configurarBotoesNavegacao() {
    // Verificar se os elementos existem antes de adicionar os event listeners
    if (etapasDOM.btnProximoPalavras) {
        etapasDOM.btnProximoPalavras.addEventListener('click', () => mudarEtapa('palavras', 'pseudopalavras'));
    }
    
    if (etapasDOM.btnProximoPseudopalavras) {
        etapasDOM.btnProximoPseudopalavras.addEventListener('click', () => mudarEtapa('pseudopalavras', 'frases'));
    }
    
    if (etapasDOM.btnProximoFrases) {
        etapasDOM.btnProximoFrases.addEventListener('click', () => mudarEtapa('frases', 'texto'));
    }
    
    if (etapasDOM.btnProximoTexto) {
        etapasDOM.btnProximoTexto.addEventListener('click', () => mudarEtapa('texto', 'resultado'));
    }
}

// Configuração dos botões de timer
function configurarBotoesTimer() {
    // Verificar se os elementos existem antes de adicionar os event listeners
    if (etapasDOM.btnTimerPalavras) {
        etapasDOM.btnTimerPalavras.addEventListener('click', () => iniciarTimer('palavras'));
    }
    
    if (etapasDOM.btnTimerPseudopalavras) {
        etapasDOM.btnTimerPseudopalavras.addEventListener('click', () => iniciarTimer('pseudopalavras'));
    }
    
    if (etapasDOM.btnTimerFrases) {
        etapasDOM.btnTimerFrases.addEventListener('click', () => iniciarTimer('frases'));
    }
    
    if (etapasDOM.btnTimerTexto) {
        etapasDOM.btnTimerTexto.addEventListener('click', () => iniciarTimer('texto'));
    }
}

// Carregar detalhes da avaliação
async function carregarDetalhesAvaliacao(alunoId, eventoId) {
    try {
        // Buscar dados do aluno
        const respostaAluno = await fetch(`${API_BASE_URL}/students/${alunoId}`);
        if (!respostaAluno.ok) {
            throw new Error(`Erro ao buscar dados do aluno: ${respostaAluno.status}`);
        }
        const aluno = await respostaAluno.json();
        
        // Buscar dados do evento
        const respostaEvento = await fetch(`${API_BASE_URL}/evaluationEvents/${eventoId}`);
        if (!respostaEvento.ok) {
            throw new Error(`Erro ao buscar dados do evento: ${respostaEvento.status}`);
        }
        const evento = await respostaEvento.json();
        
        // Buscar dados da avaliação
        const respostaAvaliacao = await fetch(`${API_BASE_URL}/evaluationEvents/${eventoId}/tests`);
        if (!respostaAvaliacao.ok) {
            throw new Error(`Erro ao buscar dados da avaliação: ${respostaAvaliacao.status}`);
        }
        const avaliacao = await respostaAvaliacao.json();
        
        // Armazenar dados
        estadoLeitura.aluno = aluno;
        estadoLeitura.avaliacao = {
            evento: evento,
            detalhes: avaliacao
        };
        
        // Preparar as etapas de leitura
        prepararEtapasPalavras();
        
    } catch (error) {
        console.error("Erro ao carregar detalhes da avaliação:", error);
        
        // Em caso de erro, usar dados de teste
        estadoLeitura.avaliacao = {
            detalhes: dadosTeste
        };
        
        prepararEtapasPalavras();
    }
}

// Preparar etapa de palavras
function prepararEtapasPalavras() {
    // Limpar o grid
    etapasDOM.gridPalavras.innerHTML = '';
    
    // Obter palavras (do servidor ou do teste)
    const palavras = estadoLeitura.avaliacao?.detalhes?.palavras || dadosTeste.palavras;
    
    // Criar elementos para cada palavra
    palavras.forEach((palavra, index) => {
        const divPalavra = document.createElement('div');
        divPalavra.className = 'border rounded p-2 flex items-center palavra-item bg-yellow-100 cursor-not-allowed transition-colors';
        divPalavra.setAttribute('data-id', index);
        divPalavra.innerHTML = `<span class="text-sm text-gray-800 select-none w-full text-center">${palavra}</span>`;
        
        // Adicionar evento de clique
        divPalavra.addEventListener('click', function(e) {
            // Verificar se o timer está ativo
            if (!estadoLeitura.timers.palavras) {
                // Não mostrar alert, pois agora é tratado pelo timer-fixes.js
                return;
            }
            
            // Marcar como lida
            if (!this.classList.contains('bg-green-200')) {
                this.classList.remove('bg-yellow-100', 'cursor-not-allowed');
                this.classList.add('bg-green-200');
                atualizarContadorPalavras();
            }
        });
        
        etapasDOM.gridPalavras.appendChild(divPalavra);
    });
    
    // Atualizar contador
    etapasDOM.totalPalavras.textContent = palavras.length;
    etapasDOM.totalPalavrasLidas.textContent = '0';
}

// Preparar etapa de pseudopalavras
function prepararEtapaPseudopalavras() {
    // Limpar o grid
    etapasDOM.gridPseudopalavras.innerHTML = '';
    
    // Obter pseudopalavras (do servidor ou do teste)
    const pseudopalavras = estadoLeitura.avaliacao?.detalhes?.pseudopalavras || dadosTeste.pseudopalavras;
    
    // Criar elementos para cada pseudopalavra
    pseudopalavras.forEach((palavra, index) => {
        const divPalavra = document.createElement('div');
        divPalavra.className = 'border rounded p-2 flex items-center pseudopalavra-item bg-yellow-100 cursor-not-allowed transition-colors';
        divPalavra.setAttribute('data-id', index);
        divPalavra.innerHTML = `<span class="text-sm text-gray-800 select-none w-full text-center">${palavra}</span>`;
        
        // Adicionar evento de clique
        divPalavra.addEventListener('click', function(e) {
            // Verificar se o timer está ativo
            if (!estadoLeitura.timers.pseudopalavras) {
                // Não mostrar alert, pois agora é tratado pelo timer-fixes.js
                return;
            }
            
            // Marcar como lida
            if (!this.classList.contains('bg-green-200')) {
                this.classList.remove('bg-yellow-100', 'cursor-not-allowed');
                this.classList.add('bg-green-200');
                atualizarContadorPseudopalavras();
            }
        });
        
        etapasDOM.gridPseudopalavras.appendChild(divPalavra);
    });
    
    // Atualizar contador
    etapasDOM.totalPseudopalavras.textContent = pseudopalavras.length;
    etapasDOM.totalPseudopalavrasLidas.textContent = '0';
}

// Preparar etapa de frases
function prepararEtapaFrases() {
    // Limpar o container
    etapasDOM.containerFrases.innerHTML = '';
    
    // Obter frases (do servidor ou do teste)
    const frases = estadoLeitura.avaliacao?.detalhes?.frases || dadosTeste.frases;
    
    // Criar elementos para cada frase
    frases.forEach((frase, index) => {
        const divFrase = document.createElement('div');
        divFrase.className = 'border rounded p-3 flex items-center frase-item bg-yellow-100 cursor-not-allowed transition-colors';
        divFrase.setAttribute('data-id', index);
        divFrase.innerHTML = `<span class="text-sm text-gray-800 select-none w-full">${frase}</span>`;
        
        // Adicionar evento de clique
        divFrase.addEventListener('click', function(e) {
            // Verificar se o timer está ativo
            if (!estadoLeitura.timers.frases) {
                // Não mostrar alert, pois agora é tratado pelo timer-fixes.js
                return;
            }
            
            // Marcar como lida
            if (!this.classList.contains('bg-green-200')) {
                this.classList.remove('bg-yellow-100', 'cursor-not-allowed');
                this.classList.add('bg-green-200');
                atualizarContadorFrases();
            }
        });
        
        etapasDOM.containerFrases.appendChild(divFrase);
    });
    
    // Atualizar contador
    etapasDOM.totalFrases.textContent = frases.length;
    etapasDOM.totalFrasesLidas.textContent = '0';
}

// Preparar etapa de texto
function prepararEtapaTexto() {
    // Limpar o container
    etapasDOM.containerTexto.innerHTML = '';
    
    // Obter texto (do servidor ou do teste)
    const texto = estadoLeitura.avaliacao?.detalhes?.texto || dadosTeste.texto;
    
    // Dividir o texto em linhas (aproximadamente 12 palavras por linha)
    const palavras = texto.split(' ');
    const linhas = [];
    let linhaAtual = [];
    
    palavras.forEach(palavra => {
        linhaAtual.push(palavra);
        if (linhaAtual.length >= 12) {
            linhas.push(linhaAtual.join(' '));
            linhaAtual = [];
        }
    });
    
    // Adicionar a última linha se houver palavras restantes
    if (linhaAtual.length > 0) {
        linhas.push(linhaAtual.join(' '));
    }
    
    // Criar elementos para cada linha
    linhas.forEach((linha, index) => {
        const divLinha = document.createElement('div');
        divLinha.className = 'border rounded p-2 mb-2 linha-texto-item bg-yellow-100 cursor-not-allowed transition-colors';
        divLinha.setAttribute('data-id', index);
        divLinha.innerHTML = `<span class="text-sm text-gray-800 select-none">${linha}</span>`;
        
        // Adicionar evento de clique
        divLinha.addEventListener('click', function(e) {
            // Verificar se o timer está ativo
            if (!estadoLeitura.timers.texto) {
                // Não mostrar alert, pois agora é tratado pelo timer-fixes.js
                return;
            }
            
            // Marcar como lida
            if (!this.classList.contains('bg-green-200')) {
                this.classList.remove('bg-yellow-100', 'cursor-not-allowed');
                this.classList.add('bg-green-200');
                atualizarContadorLinhas();
            }
        });
        
        etapasDOM.containerTexto.appendChild(divLinha);
    });
    
    // Atualizar contador
    etapasDOM.totalLinhas.textContent = linhas.length;
    etapasDOM.totalLinhasLidas.textContent = '0';
}

// Iniciar timer para uma etapa
function iniciarTimer(etapa) {
    // Mapeamento de nomes DOM para constantes
    const etapaParaConstante = {
        'palavras': 'WORDS',
        'pseudopalavras': 'PSEUDOWORDS',
        'frases': 'SENTENCES',
        'texto': 'TEXT',
        'interpretacao': 'INTERPRETATION'
    };
    
    // Verificar se já temos uma constante, se não, tentar converter
    const etapaConstante = etapaParaConstante[etapa] || etapa;
    const etapaDOM = etapa; // Nome usado no DOM (palavras, pseudopalavras, etc.)
    
    // Verificar se o timer já está ativo
    if (estadoLeitura.timers[etapaConstante] || estadoLeitura.timers[etapaDOM]) {
        alert("O cronômetro já está em andamento.");
        return;
    }
    
    // Configurar elementos do DOM
    const timerElement = etapasDOM[`timer${etapaDOM.charAt(0).toUpperCase() + etapaDOM.slice(1)}`];
    const btnElement = etapasDOM[`btnTimer${etapaDOM.charAt(0).toUpperCase() + etapaDOM.slice(1)}`];
    
    // Desabilitar o botão
    btnElement.disabled = true;
    btnElement.classList.add('bg-gray-400');
    btnElement.classList.remove('bg-blue-600', 'hover:bg-blue-700');
    btnElement.textContent = 'Cronômetro iniciado';
    
    // Configurar tempo restante
    estadoLeitura.tempoRestante[etapaConstante] = 3; // Reduzido de 60 para 3 segundos
    estadoLeitura.tempoRestante[etapaDOM] = 3; // Para compatibilidade
    
    // Configurar o timer
    estadoLeitura.timers[etapaConstante] = setInterval(() => {
        // Decrementar o tempo
        estadoLeitura.tempoRestante[etapaConstante]--;
        estadoLeitura.tempoRestante[etapaDOM]--; // Para compatibilidade
        
        // Atualizar o elemento de exibição do timer
        const minutos = Math.floor(estadoLeitura.tempoRestante[etapaConstante] / 60);
        const segundos = estadoLeitura.tempoRestante[etapaConstante] % 60;
        timerElement.textContent = `${minutos.toString().padStart(2, '0')}:${segundos.toString().padStart(2, '0')}`;
        
        // Verificar se o tempo acabou
        if (estadoLeitura.tempoRestante[etapaConstante] <= 0) {
            // Parar o timer
            clearInterval(estadoLeitura.timers[etapaConstante]);
            estadoLeitura.timers[etapaConstante] = null;
            estadoLeitura.timers[etapaDOM] = null; // Para compatibilidade
            
            // Habilitar o botão de próxima etapa
            const btnProximo = etapasDOM[`btnProximo${etapaDOM.charAt(0).toUpperCase() + etapaDOM.slice(1)}`];
            btnProximo.disabled = false;
            btnProximo.classList.remove('opacity-50', 'cursor-not-allowed');
            
            // Desabilitar itens não marcados
            switch (etapaDOM) {
        case 'palavras':
                    document.querySelectorAll('.palavra-item:not(.bg-green-200)').forEach(item => {
                        item.classList.add('opacity-50', 'cursor-not-allowed');
                        item.classList.remove('hover:bg-blue-100', 'cursor-pointer');
                    });
            break;
        case 'pseudopalavras':
                    document.querySelectorAll('.pseudopalavra-item:not(.bg-green-200)').forEach(item => {
                        item.classList.add('opacity-50', 'cursor-not-allowed');
                        item.classList.remove('hover:bg-blue-100', 'cursor-pointer');
                    });
            break;
        case 'frases':
                    document.querySelectorAll('.frase-item:not(.bg-green-200)').forEach(item => {
                        item.classList.add('opacity-50', 'cursor-not-allowed');
                        item.classList.remove('hover:bg-blue-100', 'cursor-pointer');
                    });
            break;
        case 'texto':
                    document.querySelectorAll('.linha-texto-item:not(.bg-green-200)').forEach(item => {
                        item.classList.add('opacity-50', 'cursor-not-allowed');
                        item.classList.remove('hover:bg-blue-100', 'cursor-pointer');
                    });
            break;
            }
            
            // Exibir mensagem
            alert(`Tempo esgotado para a etapa de ${getNomeEtapa(etapaDOM)}!`);
            
            // Disparar evento
            document.dispatchEvent(new CustomEvent('cronometroFinalizado', { detail: { etapa: etapaConstante } }));
        }
    }, 1000);
    
    // Manter compatibilidade com código existente
    estadoLeitura.timers[etapaDOM] = estadoLeitura.timers[etapaConstante];
    
    // Habilitar itens para clique
    switch (etapaDOM) {
        case 'palavras':
            document.querySelectorAll('.palavra-item').forEach(item => {
                item.classList.remove('bg-yellow-100', 'cursor-not-allowed');
                item.classList.add('bg-white', 'hover:bg-blue-100', 'cursor-pointer');
            });
            break;
        case 'pseudopalavras':
            document.querySelectorAll('.pseudopalavra-item').forEach(item => {
                item.classList.remove('bg-yellow-100', 'cursor-not-allowed');
                item.classList.add('bg-white', 'hover:bg-blue-100', 'cursor-pointer');
            });
            break;
        case 'frases':
            document.querySelectorAll('.frase-item').forEach(item => {
                item.classList.remove('bg-yellow-100', 'cursor-not-allowed');
                item.classList.add('bg-white', 'hover:bg-blue-100', 'cursor-pointer');
            });
            break;
        case 'texto':
            document.querySelectorAll('.linha-texto-item').forEach(item => {
                item.classList.remove('bg-yellow-100', 'cursor-not-allowed');
                item.classList.add('bg-white', 'hover:bg-blue-100', 'cursor-pointer');
            });
            break;
    }
    
    console.log(`Timer iniciado para ${etapaConstante}`);
}

// Obter nome amigável da etapa
function getNomeEtapa(etapa) {
    // Verificar primeiro se é uma constante
    switch (etapa) {
        case 'WORDS':
        case 'palavras': 
            return 'Leitura de Palavras';
        case 'PSEUDOWORDS':
        case 'pseudopalavras': 
            return 'Leitura de Pseudopalavras';
        case 'SENTENCES':
        case 'frases': 
            return 'Leitura de Frases';
        case 'TEXT':
        case 'texto': 
            return 'Leitura de Texto';
        case 'INTERPRETATION':
        case 'interpretacao': 
            return 'Interpretação';
        default: 
            return etapa;
    }
}

// Atualizar contadores
function atualizarContadorPalavras() {
    const marcadas = document.querySelectorAll('.palavra-item.bg-green-200').length;
    estadoLeitura.palavrasLidas = marcadas;
    etapasDOM.totalPalavrasLidas.textContent = marcadas;
}

function atualizarContadorPseudopalavras() {
    const marcadas = document.querySelectorAll('.pseudopalavra-item.bg-green-200').length;
    estadoLeitura.pseudopalavrasLidas = marcadas;
    etapasDOM.totalPseudopalavrasLidas.textContent = marcadas;
}

function atualizarContadorFrases() {
    const marcadas = document.querySelectorAll('.frase-item.bg-green-200').length;
    estadoLeitura.frasesLidas = marcadas;
    etapasDOM.totalFrasesLidas.textContent = marcadas;
}

function atualizarContadorLinhas() {
    const marcadas = document.querySelectorAll('.linha-texto-item.bg-green-200').length;
    estadoLeitura.linhasLidas = marcadas;
    etapasDOM.totalLinhasLidas.textContent = marcadas;
}

// Mudar de etapa
function mudarEtapa(etapaAtual, proximaEtapa) {
    // Mapeamento de nomes DOM para constantes
    const etapaParaConstante = {
        'palavras': 'WORDS',
        'pseudopalavras': 'PSEUDOWORDS',
        'frases': 'SENTENCES',
        'texto': 'TEXT',
        'interpretacao': 'INTERPRETATION'
    };
    
    // Verificar se já temos uma constante, se não, tentar converter
    const etapaAtualConstante = etapaParaConstante[etapaAtual] || etapaAtual;
    const etapaAtualDOM = etapaAtual; // Nome usado no DOM
    
    const proximaEtapaConstante = etapaParaConstante[proximaEtapa] || proximaEtapa;
    const proximaEtapaDOM = proximaEtapa; // Nome usado no DOM
    
    console.log(`Mudando de etapa: ${etapaAtualConstante} -> ${proximaEtapaConstante}`);
    
    // Parar o timer da etapa atual
    if (estadoLeitura.timers[etapaAtualConstante] || estadoLeitura.timers[etapaAtualDOM]) {
        // Verificar se estamos usando o novo módulo
        if (window.TimerModule) {
            window.TimerModule.pararCronometro(etapaAtualConstante);
            // Tentar também com o nome DOM para compatibilidade
            window.TimerModule.pararCronometro(etapaAtualDOM);
        } else {
            // Limpar o intervalo usando o nome constante
            if (estadoLeitura.timers[etapaAtualConstante]) {
                clearInterval(estadoLeitura.timers[etapaAtualConstante]);
                estadoLeitura.timers[etapaAtualConstante] = null;
            }
            
            // Limpar o intervalo usando o nome DOM para compatibilidade
            if (estadoLeitura.timers[etapaAtualDOM]) {
                clearInterval(estadoLeitura.timers[etapaAtualDOM]);
                estadoLeitura.timers[etapaAtualDOM] = null;
            }
        }
    }
    
    // Esconder todas as etapas (usando os nomes do DOM)
    etapasDOM.palavras.classList.add('hidden');
    etapasDOM.pseudopalavras.classList.add('hidden');
    etapasDOM.frases.classList.add('hidden');
    etapasDOM.texto.classList.add('hidden');
    etapasDOM.resultado.classList.add('hidden');
    
    // Mostrar a próxima etapa (usando o nome DOM)
    if (proximaEtapaDOM === 'palavras') {
        etapasDOM.palavras.classList.remove('hidden');
    } else if (proximaEtapaDOM === 'pseudopalavras') {
        etapasDOM.pseudopalavras.classList.remove('hidden');
        prepararEtapaPseudopalavras();
    } else if (proximaEtapaDOM === 'frases') {
        etapasDOM.frases.classList.remove('hidden');
        prepararEtapaFrases();
    } else if (proximaEtapaDOM === 'texto') {
        etapasDOM.texto.classList.remove('hidden');
        prepararEtapaTexto();
    } else if (proximaEtapaDOM === 'resultado') {
        etapasDOM.resultado.classList.remove('hidden');
        gerarResultado();
    } else if (proximaEtapaDOM === 'interpretacao') {
        if (etapasDOM.interpretacao) {
            etapasDOM.interpretacao.classList.remove('hidden');
            prepararEtapaInterpretacao();
        }
    }
}

// Gerar resultado da avaliação
function gerarResultado() {
    console.log("Gerando resultado da avaliação...");
    console.log("Palavras lidas:", estadoLeitura.palavrasLidas);
    console.log("Pseudopalavras lidas:", estadoLeitura.pseudopalavrasLidas);
    console.log("Frases lidas:", estadoLeitura.frasesLidas);
    console.log("Linhas lidas:", estadoLeitura.linhasLidas);
    
    // Aqui você pode implementar a lógica para determinar o nível do leitor
    // e preencher os campos na interface
    
    // Exemplo simples:
    document.getElementById('resultado-aluno-nome').textContent = estadoLeitura.aluno?.nome || "Aluno Teste";
    
    // Determinar nível com base nas palavras lidas
    let nivel, descricao, porcentagem;
    
    if (estadoLeitura.palavrasLidas === 0) {
        nivel = "NÍVEL 0 - NÃO AVALIADO";
        descricao = "Não foi possível avaliar o nível de leitura.";
        porcentagem = 0;
    } else if (estadoLeitura.palavrasLidas < 10) {
        nivel = "NÍVEL 1 - NÃO LEITOR";
        descricao = `Lê menos de 10 palavras/min. Necessita intervenção imediata.`;
        porcentagem = 16;
    } else if (estadoLeitura.palavrasLidas < 20) {
        nivel = "NÍVEL 2 - LEITOR DE SÍLABAS";
        descricao = `Lê de 10 a 20 palavras/min. Em desenvolvimento inicial.`;
        porcentagem = 32;
    } else if (estadoLeitura.palavrasLidas < 30) {
        nivel = "NÍVEL 3 - LEITOR DE PALAVRAS";
        descricao = `Lê de 20 a 30 palavras/min. Atenção à fluência.`;
        porcentagem = 48;
    } else if (estadoLeitura.palavrasLidas < 40) {
        nivel = "NÍVEL 4 - LEITOR DE FRASES";
        descricao = `Lê de 30 a 40 palavras/min. Boa evolução.`;
        porcentagem = 64;
    } else if (estadoLeitura.palavrasLidas < 50) {
        nivel = "NÍVEL 5 - LEITOR DE TEXTO SEM FLUÊNCIA";
        descricao = `Lê de 40 a 50 palavras/min. Quase lá!`;
        porcentagem = 80;
    } else {
        nivel = "NÍVEL 6 - LEITOR DE TEXTO COM FLUÊNCIA";
        descricao = `Lê mais de 50 palavras/min. Excelente desempenho!`;
        porcentagem = 100;
    }
    
    // Atualizar a interface
    document.getElementById('nivel-leitor-sugerido').textContent = nivel;
    document.getElementById('descricao-nivel').textContent = descricao;
    document.getElementById('nivel-progresso').style.width = `${porcentagem}%`;
}

// Inicializar o módulo quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', inicializarModuloLeituras);

// Função para atualizar a avaliação na API
function atualizarAvaliacao(dados) {
    console.log("Atualizando avaliação:", dados);
    
    // Obter informações da avaliação atual
        const avaliacaoAtualStr = localStorage.getItem('avaliacaoAtual');
        if (!avaliacaoAtualStr) {
        console.error("Nenhuma avaliação em andamento para atualizar");
        return;
        }
        
        const avaliacaoAtual = JSON.parse(avaliacaoAtualStr);
    const id = avaliacaoAtual.id;
    
    // Construir a URL
    const url = `https://salf-salf-api.py5r5i.easypanel.host/api/reading-assessments/${id}/stage`;
        
    // Determinar a etapa atual e os valores de leitura com base nos dados fornecidos
    let stage, itemsRead, totalItems;
    
    if (dados.stage) {
        // Se já tiver a etapa definida, usar diretamente
        stage = dados.stage;
        itemsRead = dados.itemsRead || 0;
        totalItems = dados.totalItems || 0;
    } else if (dados.wordsRead !== undefined) {
        stage = "WORDS";
        itemsRead = dados.wordsRead;
        totalItems = dados.wordsTotal || 0;
    } else if (dados.pseudowordsRead !== undefined) {
        stage = "PSEUDOWORDS";
        itemsRead = dados.pseudowordsRead;
        totalItems = dados.pseudowordsTotal || 0;
    } else if (dados.sentencesRead !== undefined) {
        stage = "SENTENCES";
        itemsRead = dados.sentencesRead;
        totalItems = dados.sentencesTotal || 0;
    } else if (dados.textLinesRead !== undefined) {
        stage = "TEXT";
        itemsRead = dados.textLinesRead;
        totalItems = dados.textLinesTotal || 0;
    } else if (dados.interpretationScore !== undefined) {
        stage = "INTERPRETATION";
        itemsRead = dados.interpretationScore;
        totalItems = dados.interpretationTotal || 100;
    }
    
    // Preparar o body no formato especificado
    const requestBody = {
        stage: stage,
        itemsRead: itemsRead,
        totalItems: totalItems
    };
    
    console.log("Enviando dados:", requestBody);
    
    // Enviar os dados
    fetch(url, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(requestBody)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Erro ao atualizar avaliação: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        console.log("Avaliação atualizada com sucesso:", data);
        
        // Atualizar a avaliação no localStorage
        const avaliacaoAtualizada = { ...avaliacaoAtual, ...dados };
        localStorage.setItem('avaliacaoAtual', JSON.stringify(avaliacaoAtualizada));
        
        // Verificar se a avaliação está completa
        if (dados.completed) {
            console.log("Avaliação completa!");
        }
    })
    .catch(error => {
        console.error("Erro ao atualizar avaliação:", error);
    });
}

// Configurar a etapa de palavras
function configurarEtapaPalavras() {
    const etapaPalavras = document.getElementById('etapa-palavras');
    if (!etapaPalavras) return;
    
    const iniciarTimerBtn = document.getElementById('iniciar-timer-palavras');
    const proximoEtapaBtn = document.getElementById('proximo-etapa-palavras');
    const timerElement = document.getElementById('timer-palavras');
    const totalLidasElement = document.getElementById('total-palavras-lidas');
    
    let temporizador;
    let segundosRestantes = 60;
    let palavrasLidas = 0;
    
    // Inicialmente, desabilitar o botão de próxima etapa
    proximoEtapaBtn.disabled = true;
    proximoEtapaBtn.classList.add('opacity-50', 'cursor-not-allowed');
    
    // Configurar evento do botão de iniciar timer
    iniciarTimerBtn.addEventListener('click', function() {
        // Desabilitar o botão
        iniciarTimerBtn.disabled = true;
        iniciarTimerBtn.classList.add('opacity-50', 'cursor-not-allowed');
        
        // Habilitar os itens de palavra
        const itens = etapaPalavras.querySelectorAll('.palavra-item');
        itens.forEach(item => {
            item.classList.remove('bg-yellow-100', 'cursor-not-allowed');
            item.classList.add('bg-white', 'hover:bg-blue-100', 'cursor-pointer');
            
            // Adicionar evento de clique
            item.addEventListener('click', function() {
                if (!item.classList.contains('bg-green-200') && !item.classList.contains('disabled')) {
                    item.classList.add('bg-green-200');
                    item.classList.remove('bg-white', 'hover:bg-blue-100');
                    palavrasLidas++;
                    totalLidasElement.textContent = palavrasLidas;
                }
            });
        });
        
        // Iniciar o temporizador
        temporizador = setInterval(function() {
            segundosRestantes--;
            
            // Atualizar a exibição do timer
            const minutos = Math.floor(segundosRestantes / 60);
            const segundos = segundosRestantes % 60;
            timerElement.textContent = `${minutos.toString().padStart(2, '0')}:${segundos.toString().padStart(2, '0')}`;
            
            if (segundosRestantes <= 0) {
                // Parar o temporizador
                clearInterval(temporizador);
                
                // Desabilitar todos os itens não marcados
                itens.forEach(item => {
                    if (!item.classList.contains('bg-green-200')) {
                        item.classList.add('disabled', 'opacity-50');
                        item.classList.remove('hover:bg-blue-100', 'cursor-pointer');
                    }
                });
                
                // Habilitar o botão de próxima etapa
                proximoEtapaBtn.disabled = false;
                proximoEtapaBtn.classList.remove('opacity-50', 'cursor-not-allowed');
                
                // Salvar os resultados parciais
                const avaliacaoAtualStr = localStorage.getItem('avaliacaoAtual');
                if (avaliacaoAtualStr) {
                    // Atualizar a avaliação na API usando o novo formato
                    atualizarAvaliacao({
                        stage: "WORDS",
                        itemsRead: palavrasLidas,
                        totalItems: itens.length
                    });
                }
            }
        }, 1000);
    });
    
    // Configurar evento do botão de próxima etapa
    proximoEtapaBtn.addEventListener('click', function() {
        // Parar o temporizador se ainda estiver rodando
        if (temporizador) {
            clearInterval(temporizador);
        }
        
        // Esconder a etapa atual e mostrar a próxima
        etapaPalavras.classList.add('hidden');
        document.getElementById('etapa-pseudopalavras').classList.remove('hidden');
    });
}

// Configurar a etapa de pseudopalavras
function configurarEtapaPseudopalavras() {
    const etapaPseudopalavras = document.getElementById('etapa-pseudopalavras');
    if (!etapaPseudopalavras) return;
    
    const iniciarTimerBtn = document.getElementById('iniciar-timer-pseudopalavras');
    const proximoEtapaBtn = document.getElementById('proximo-etapa-pseudopalavras');
    const timerElement = document.getElementById('timer-pseudopalavras');
    const totalLidasElement = document.getElementById('total-pseudopalavras-lidas');
    
    let temporizador;
    let segundosRestantes = 60;
    let pseudopalavrasLidas = 0;
    
    // Inicialmente, desabilitar o botão de próxima etapa
    proximoEtapaBtn.disabled = true;
    proximoEtapaBtn.classList.add('opacity-50', 'cursor-not-allowed');
    
    // Configurar evento do botão de iniciar timer
    iniciarTimerBtn.addEventListener('click', function() {
        // Desabilitar o botão
        iniciarTimerBtn.disabled = true;
        iniciarTimerBtn.classList.add('opacity-50', 'cursor-not-allowed');
        
        // Habilitar os itens de pseudopalavra
        const itens = etapaPseudopalavras.querySelectorAll('.pseudopalavra-item');
        itens.forEach(item => {
            item.classList.remove('bg-yellow-100', 'cursor-not-allowed');
            item.classList.add('bg-white', 'hover:bg-blue-100', 'cursor-pointer');
            
            // Adicionar evento de clique
            item.addEventListener('click', function() {
                if (!item.classList.contains('bg-green-200') && !item.classList.contains('disabled')) {
                    item.classList.add('bg-green-200');
                    item.classList.remove('bg-white', 'hover:bg-blue-100');
                    pseudopalavrasLidas++;
                    totalLidasElement.textContent = pseudopalavrasLidas;
                }
            });
        });
        
        // Iniciar o temporizador
        temporizador = setInterval(function() {
            segundosRestantes--;
            
            // Atualizar a exibição do timer
            const minutos = Math.floor(segundosRestantes / 60);
            const segundos = segundosRestantes % 60;
            timerElement.textContent = `${minutos.toString().padStart(2, '0')}:${segundos.toString().padStart(2, '0')}`;
            
            if (segundosRestantes <= 0) {
                // Parar o temporizador
                clearInterval(temporizador);
                
                // Desabilitar todos os itens não marcados
                itens.forEach(item => {
                    if (!item.classList.contains('bg-green-200')) {
                        item.classList.add('disabled', 'opacity-50');
                        item.classList.remove('hover:bg-blue-100', 'cursor-pointer');
                    }
                });
                
                // Habilitar o botão de próxima etapa
                proximoEtapaBtn.disabled = false;
                proximoEtapaBtn.classList.remove('opacity-50', 'cursor-not-allowed');
                
                // Salvar os resultados parciais
                const avaliacaoAtualStr = localStorage.getItem('avaliacaoAtual');
                if (avaliacaoAtualStr) {
                    // Atualizar a avaliação na API usando o novo formato
                    atualizarAvaliacao({
                        stage: "PSEUDOWORDS",
                        itemsRead: pseudopalavrasLidas,
                        totalItems: itens.length
                    });
                }
            }
        }, 1000);
    });
    
    // Configurar evento do botão de próxima etapa
    proximoEtapaBtn.addEventListener('click', function() {
        // Parar o temporizador se ainda estiver rodando
        if (temporizador) {
            clearInterval(temporizador);
        }
        
        // Esconder a etapa atual e mostrar a próxima
        etapaPseudopalavras.classList.add('hidden');
        document.getElementById('etapa-frases').classList.remove('hidden');
    });
}

// Configurar a etapa de frases
function configurarEtapaFrases() {
    const etapaFrases = document.getElementById('etapa-frases');
    if (!etapaFrases) return;
    
    const iniciarTimerBtn = document.getElementById('iniciar-timer-frases');
    const proximoEtapaBtn = document.getElementById('proximo-etapa-frases');
    const timerElement = document.getElementById('timer-frases');
    const totalLidasElement = document.getElementById('total-frases-lidas');
    
    let temporizador;
    let segundosRestantes = 60;
    let frasesLidas = 0;
    
    // Inicialmente, desabilitar o botão de próxima etapa
    proximoEtapaBtn.disabled = true;
    proximoEtapaBtn.classList.add('opacity-50', 'cursor-not-allowed');
    
    // Configurar evento do botão de iniciar timer
    iniciarTimerBtn.addEventListener('click', function() {
        // Desabilitar o botão
        iniciarTimerBtn.disabled = true;
        iniciarTimerBtn.classList.add('opacity-50', 'cursor-not-allowed');
        
        // Habilitar os itens de frase
        const itens = etapaFrases.querySelectorAll('.frase-item');
        itens.forEach(item => {
            item.classList.remove('bg-yellow-100', 'cursor-not-allowed');
            item.classList.add('bg-white', 'hover:bg-blue-100', 'cursor-pointer');
            
            // Adicionar evento de clique
            item.addEventListener('click', function() {
                if (!item.classList.contains('bg-green-200') && !item.classList.contains('disabled')) {
                    item.classList.add('bg-green-200');
                    item.classList.remove('bg-white', 'hover:bg-blue-100');
                    frasesLidas++;
                    totalLidasElement.textContent = frasesLidas;
                }
            });
        });
        
        // Iniciar o temporizador
        temporizador = setInterval(function() {
            segundosRestantes--;
            
            // Atualizar a exibição do timer
            const minutos = Math.floor(segundosRestantes / 60);
            const segundos = segundosRestantes % 60;
            timerElement.textContent = `${minutos.toString().padStart(2, '0')}:${segundos.toString().padStart(2, '0')}`;
            
            if (segundosRestantes <= 0) {
                // Parar o temporizador
                clearInterval(temporizador);
                
                // Desabilitar todos os itens não marcados
                itens.forEach(item => {
                    if (!item.classList.contains('bg-green-200')) {
                        item.classList.add('disabled', 'opacity-50');
                        item.classList.remove('hover:bg-blue-100', 'cursor-pointer');
                    }
                });
                
                // Habilitar o botão de próxima etapa
                proximoEtapaBtn.disabled = false;
                proximoEtapaBtn.classList.remove('opacity-50', 'cursor-not-allowed');
                
                // Salvar os resultados parciais
                const avaliacaoAtualStr = localStorage.getItem('avaliacaoAtual');
                if (avaliacaoAtualStr) {
                    // Atualizar a avaliação na API usando o novo formato
                    atualizarAvaliacao({
                        stage: "SENTENCES",
                        itemsRead: frasesLidas,
                        totalItems: itens.length
                    });
                }
            }
        }, 1000);
    });
    
    // Configurar evento do botão de próxima etapa
    proximoEtapaBtn.addEventListener('click', function() {
        // Parar o temporizador se ainda estiver rodando
        if (temporizador) {
            clearInterval(temporizador);
        }
        
        // Esconder a etapa atual e mostrar a próxima
        etapaFrases.classList.add('hidden');
        document.getElementById('etapa-texto').classList.remove('hidden');
    });
}

// Configurar a etapa de texto
function configurarEtapaTexto() {
    const etapaTexto = document.getElementById('etapa-texto');
    if (!etapaTexto) return;
    
    const iniciarTimerBtn = document.getElementById('iniciar-timer-texto');
    const proximoEtapaBtn = document.getElementById('proximo-etapa-texto');
    const timerElement = document.getElementById('timer-texto');
    const totalLidasElement = document.getElementById('total-linhas-lidas');
    
    let temporizador;
    let segundosRestantes = 60;
    let linhasLidas = 0;
    
    // Inicialmente, desabilitar o botão de próxima etapa
    proximoEtapaBtn.disabled = true;
    proximoEtapaBtn.classList.add('opacity-50', 'cursor-not-allowed');
    
    // Configurar evento do botão de iniciar timer
    iniciarTimerBtn.addEventListener('click', function() {
        // Desabilitar o botão
        iniciarTimerBtn.disabled = true;
        iniciarTimerBtn.classList.add('opacity-50', 'cursor-not-allowed');
        
        // Habilitar os itens de linha de texto
        const itens = etapaTexto.querySelectorAll('.linha-texto-item');
        itens.forEach(item => {
            item.classList.remove('bg-yellow-100', 'cursor-not-allowed');
            item.classList.add('bg-white', 'hover:bg-blue-100', 'cursor-pointer');
            
            // Adicionar evento de clique
            item.addEventListener('click', function() {
                if (!item.classList.contains('bg-green-200') && !item.classList.contains('disabled')) {
                    item.classList.add('bg-green-200');
                    item.classList.remove('bg-white', 'hover:bg-blue-100');
                    linhasLidas++;
                    totalLidasElement.textContent = linhasLidas;
                }
            });
        });
        
        // Iniciar o temporizador
        temporizador = setInterval(function() {
            segundosRestantes--;
            
            // Atualizar a exibição do timer
            const minutos = Math.floor(segundosRestantes / 60);
            const segundos = segundosRestantes % 60;
            timerElement.textContent = `${minutos.toString().padStart(2, '0')}:${segundos.toString().padStart(2, '0')}`;
            
            if (segundosRestantes <= 0) {
                // Parar o temporizador
                clearInterval(temporizador);
                
                // Desabilitar todos os itens não marcados
                itens.forEach(item => {
                    if (!item.classList.contains('bg-green-200')) {
                        item.classList.add('disabled', 'opacity-50');
                        item.classList.remove('hover:bg-blue-100', 'cursor-pointer');
                    }
                });
                
                // Habilitar o botão de próxima etapa
                proximoEtapaBtn.disabled = false;
                proximoEtapaBtn.classList.remove('opacity-50', 'cursor-not-allowed');
                
                // Calcular PPM com base nas palavras lidas
                let ppm = 0;
                const avaliacaoAtualStr = localStorage.getItem('avaliacaoAtual');
                if (avaliacaoAtualStr) {
                    // Calcular palavras por minuto (estimativa)
                    // Considerando 12 palavras por linha em média
                    ppm = linhasLidas * 12;
                    
                    // Determinar nível de leitura com base no PPM
                    let nivelLeitura = 'NON_READER';
                    if (ppm >= 50) nivelLeitura = 'TEXT_READER_WITH_FLUENCY';
                    else if (ppm >= 40) nivelLeitura = 'TEXT_READER_WITHOUT_FLUENCY';
                    else if (ppm >= 30) nivelLeitura = 'SENTENCE_READER';
                    else if (ppm >= 20) nivelLeitura = 'WORD_READER';
                    else if (ppm >= 10) nivelLeitura = 'SYLLABLE_READER';
                    
                    // Atualizar a avaliação na API usando o novo formato
                    atualizarAvaliacao({
                        stage: "TEXT",
                        itemsRead: linhasLidas,
                        totalItems: itens.length,
                        // Dados adicionais que serão armazenados apenas no localStorage
                        readingLevel: nivelLeitura,
                        ppm: ppm,
                        completed: true
                    });
                }
            }
        }, 1000);
    });
    
    // Configurar evento do botão de próxima etapa
    proximoEtapaBtn.addEventListener('click', function() {
        // Parar o temporizador se ainda estiver rodando
        if (temporizador) {
            clearInterval(temporizador);
        }
        
        // Esconder a etapa atual e mostrar a próxima
        etapaTexto.classList.add('hidden');
        document.getElementById('etapa-resultado').classList.remove('hidden');
        
        // Preparar a tela de resultado
        const avaliacaoAtualStr = localStorage.getItem('avaliacaoAtual');
        if (avaliacaoAtualStr) {
            prepararEtapaResultado(JSON.parse(avaliacaoAtualStr));
        }
    });
}

// Configurar os botões de navegação na tela final
function configurarBotoesNavegacao() {
    const btnNovaAvaliacao = document.getElementById('btn-nova-avaliacao');
    const btnVoltarDashboard = document.getElementById('btn-voltar-dashboard');
    
    if (btnNovaAvaliacao) {
        btnNovaAvaliacao.addEventListener('click', function() {
            // Limpar a avaliação atual
            localStorage.removeItem('avaliacaoAtual');
            
            // Voltar para a tela de seleção
            document.getElementById('etapa-resultado').classList.add('hidden');
            document.getElementById('selecao-avaliacao').classList.remove('hidden');
            
            // Recarregar a página para limpar o estado
            window.location.reload();
        });
    }
    
    if (btnVoltarDashboard) {
        btnVoltarDashboard.addEventListener('click', function() {
            // Limpar a avaliação atual
            localStorage.removeItem('avaliacaoAtual');
            
            // Redirecionar para o dashboard
            window.location.href = '../../pages/dashboard/index.html';
        });
    }
} 