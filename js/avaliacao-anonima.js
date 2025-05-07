/**
 * Sistema de Avaliação de Leitura e Fluência (SALF)
 * Módulo de realização de avaliação de leitura anônima
 * 
 * Este código gerencia todo o processo de avaliação de leitura
 * sem a necessidade de selecionar um aluno específico.
 */

(function() {
    'use strict';

    // ===================================================
    // INICIALIZAÇÃO E CONFIGURAÇÃO
    // ===================================================
    
    // Aguardar carregamento do DOM
    document.addEventListener('DOMContentLoaded', inicializar);

    // Objeto principal com as referências DOM
    const DOM = {};
    
    // Estado da aplicação
    const estado = {
        // Dados da avaliação atual
        avaliacao: null,
        faixaSerie: null,
        
        // Contadores
        palavrasLidas: 0,
        pseudopalavrasLidas: 0,
        frasesLidas: 0,
        linhasLidas: 0,
        respostasCorretas: 0,
        
        // Controle de timers
        timers: {
            palavras: null,
            pseudopalavras: null,
            frases: null,
            texto: null
        }
    };
    
    // Dados para simulação (em produção, viria de uma API)
    const DADOS = {
        avaliacoes: [
            {
                id: 1,
                nome: "Avaliação 1º Semestre 2023",
                palavras: [
                    "casa", "bola", "gato", "mesa", "livro", "pato", "fogo", "roda", "vela", "mala",
                    "lobo", "rato", "sapo", "faca", "pipa", "dedo", "moto", "suco", "bota", "lua",
                    "pele", "cama", "papel", "terra", "água", "boca", "ponte", "porta", "rede", "sol",
                    "folha", "vento", "nuvem", "chuva", "praia", "vidro", "barco", "peixe", "rosa", "dente"
                ],
                pseudopalavras: [
                    "dalu", "fema", "pilo", "sati", "beco", "vota", "mipe", "catu", "lemi", "rano",
                    "bagi", "pute", "seco", "vilo", "fota", "zema", "neri", "joba", "tibe", "cuna",
                    "larpo", "bestu", "pilda", "vamil", "torpa", "sertu", "ganso", "finpo", "melfa", "darno"
                ],
                texto: "A menina de cabelos dourados caminhava pela floresta. Era uma linda manhã de primavera, e as flores coloridas enfeitavam o caminho. Ela carregava uma cesta com frutas frescas para sua avó. O sol brilhava entre as folhas das árvores, criando sombras dançantes no chão. Enquanto andava, a menina cantarolava uma doce melodia que sua mãe lhe ensinou. Os pássaros, encantados com a canção, acompanhavam com seus trinados. De repente, ela encontrou um pequeno coelho branco parado no meio da trilha. Seus olhos eram vermelhos como rubis e suas orelhas compridas tremiam levemente. A menina sorriu e ofereceu uma cenoura da sua cesta. O coelho hesitou por um momento, mas logo aceitou o presente, pegando a cenoura com suas patas dianteiras. Agradecido, ele saltitou ao lado da menina por um tempo, como se quisesse fazer companhia. Mais adiante, encontraram um riacho de águas cristalinas. A menina parou para beber um pouco de água fresca e descansar sob a sombra de um grande carvalho.",
                frases: [
                    "O menino corre no parque.",
                    "A menina gosta de sorvete.",
                    "O gato subiu na árvore.",
                    "Minha mãe fez um bolo gostoso.",
                    "O cachorro late para o carteiro.",
                    "As crianças brincam na escola.",
                    "O sol brilha no céu azul.",
                    "Eu gosto de ler livros de aventura.",
                    "Meu pai dirige um carro vermelho.",
                    "A professora ensina matemática."
                ],
                questoes: [
                    {
                        pergunta: "Qual é o personagem principal do texto?",
                        opcoes: ["Uma menina", "Um menino", "Um animal", "Um adulto"],
                        respostaCorreta: 0
                    },
                    {
                        pergunta: "Onde se passa a história?",
                        opcoes: ["Na floresta", "Na praia", "Na cidade", "Na escola"],
                        respostaCorreta: 0
                    },
                    {
                        pergunta: "O que o personagem principal estava fazendo?",
                        opcoes: ["Dormindo", "Estudando", "Caminhando", "Nadando"],
                        respostaCorreta: 2
                    },
                    {
                        pergunta: "Qual animal aparece na história?",
                        opcoes: ["Gato", "Cachorro", "Coelho", "Pássaro"],
                        respostaCorreta: 2
                    },
                    {
                        pergunta: "O que o personagem principal carregava?",
                        opcoes: ["Uma mochila", "Um livro", "Uma cesta", "Um brinquedo"],
                        respostaCorreta: 2
                    }
                ]
            },
            {
                id: 2,
                nome: "Avaliação 2º Semestre 2023",
                palavras: [
                    "pão", "dia", "chá", "rio", "céu", "lua", "mar", "pé", "sal", "rei",
                    "anel", "doce", "faca", "gelo", "ilha", "jogo", "kiwi", "leão", "maçã", "navio",
                    "ovo", "pato", "queijo", "rato", "sapo", "tatu", "uva", "vaca", "xadrez", "zebra",
                    "azul", "bolo", "casa", "dado", "escola", "festa", "gato", "hora", "igreja", "janela"
                ],
                pseudopalavras: [
                    "pimo", "lema", "zatu", "fepo", "daje", "bilu", "rona", "sabe", "voti", "mulo",
                    "tabe", "pori", "lute", "gami", "sedo", "nafu", "bive", "zumi", "falo", "rupe",
                    "terpa", "nilsa", "ranco", "melfi", "sotor", "galda", "pefti", "vunde", "zerbo", "caqui"
                ],
                texto: "O pequeno Pedro adorava brincar no parque perto de sua casa. Todos os dias, depois da escola, ele corria para lá, ansioso para encontrar seus amigos. No centro do parque havia um grande carrossel colorido, com cavalos, elefantes e até mesmo dragões. Era a atração favorita das crianças. Ao lado do carrossel, ficava um lago onde nadavam patos e cisnes brancos. Pedro sempre levava pedaços de pão para alimentá-los, observando como mergulhavam em busca das migalhas. Havia também um campo de futebol onde os meninos organizavam partidas animadas. Pedro era um bom goleiro e defendia muitas bolas difíceis. Seus amigos sempre o escolhiam primeiro quando formavam os times. No canto mais tranquilo do parque, existia uma pequena biblioteca ao ar livre. Estantes protegidas da chuva guardavam livros de histórias que as crianças podiam ler sentadas nos bancos de madeira. Pedro às vezes gostava de passar ali algumas horas, mergulhado em aventuras fantásticas.",
                frases: [
                    "O menino corre no parque.",
                    "A menina gosta de sorvete.",
                    "O gato subiu na árvore.",
                    "Minha mãe fez um bolo gostoso.",
                    "O cachorro late para o carteiro.",
                    "As crianças brincam na escola.",
                    "O sol brilha no céu azul.",
                    "Eu gosto de ler livros de aventura.",
                    "Meu pai dirige um carro vermelho.",
                    "A professora ensina matemática."
                ],
                questoes: [
                    {
                        pergunta: "Qual é o personagem principal do texto?",
                        opcoes: ["Uma menina", "Um menino", "Um animal", "Um adulto"],
                        respostaCorreta: 1
                    },
                    {
                        pergunta: "Onde se passa a história?",
                        opcoes: ["Na floresta", "No parque", "Na cidade", "Na escola"],
                        respostaCorreta: 1
                    },
                    {
                        pergunta: "O que o personagem principal estava fazendo?",
                        opcoes: ["Dormindo", "Estudando", "Brincando", "Nadando"],
                        respostaCorreta: 2
                    },
                    {
                        pergunta: "Qual animal aparece na história?",
                        opcoes: ["Gato", "Cachorro", "Pato", "Pássaro"],
                        respostaCorreta: 2
                    },
                    {
                        pergunta: "O que o personagem principal carregava?",
                        opcoes: ["Uma mochila", "Brinquedos", "Pedaços de pão", "Um livro"],
                        respostaCorreta: 2
                    }
                ]
            }
        ]
    };
    
    // ===================================================
    // FUNÇÕES DE INICIALIZAÇÃO
    // ===================================================
    
    /**
     * Inicializa a aplicação
     */
    function inicializar() {
        console.log('Inicializando aplicação de avaliação de leitura anônima...');
        
        // Obter referências aos elementos do DOM
        obterReferenciasDOM();
        
        // Verificar se elementos críticos foram encontrados
        if (!verificarElementosEssenciais()) {
            return;
        }
        
        // Configurar os eventos
        configurarEventos();
        
        console.log('Aplicação de avaliação de leitura anônima inicializada com sucesso!');
    }
    
    /**
     * Obtém as referências para os elementos DOM principais
     */
    function obterReferenciasDOM() {
        // Containers de etapas
        DOM.containers = {
            selecaoAvaliacao: document.getElementById('selecao-avaliacao'),
            etapaPalavras: document.getElementById('etapa-palavras'),
            etapaPseudopalavras: document.getElementById('etapa-pseudopalavras'),
            etapaFrases: document.getElementById('etapa-frases'),
            etapaTexto: document.getElementById('etapa-texto'),
            etapaInterpretacao: document.getElementById('etapa-interpretacao'),
            etapaResultado: document.getElementById('etapa-resultado')
        };
        
        // Seletores de dados
        DOM.selects = {
            evento: document.getElementById('evento-avaliacao'),
            nivelSerie: document.getElementById('nivel-serie')
        };
        
        // Botões de navegação
        DOM.navegacao = {
            iniciarAvaliacao: document.getElementById('iniciar-avaliacao'),
            proximoEtapaPalavras: document.getElementById('proximo-etapa-palavras'),
            proximoEtapaPseudopalavras: document.getElementById('proximo-etapa-pseudopalavras'),
            proximoEtapaFrases: document.getElementById('proximo-etapa-frases'),
            proximoEtapaTexto: document.getElementById('proximo-etapa-texto'),
            novaAvaliacao: document.getElementById('btn-nova-avaliacao'),
            voltarDashboard: document.getElementById('btn-voltar-dashboard')
        };
        
        // Timers e controles de tempo
        DOM.timers = {
            palavras: document.getElementById('timer-palavras'),
            pseudopalavras: document.getElementById('timer-pseudopalavras'),
            frases: document.getElementById('timer-frases'),
            texto: document.getElementById('timer-texto'),
            iniciarPalavras: document.getElementById('iniciar-timer-palavras'),
            iniciarPseudopalavras: document.getElementById('iniciar-timer-pseudopalavras'),
            iniciarFrases: document.getElementById('iniciar-timer-frases'),
            iniciarTexto: document.getElementById('iniciar-timer-texto')
        };
        
        // Contadores
        DOM.contadores = {
            palavrasLidas: document.getElementById('total-palavras-lidas'),
            totalPalavras: document.getElementById('total-palavras'),
            pseudopalavrasLidas: document.getElementById('total-pseudopalavras-lidas'),
            totalPseudopalavras: document.getElementById('total-pseudopalavras'),
            frasesLidas: document.getElementById('total-frases-lidas'),
            totalFrases: document.getElementById('total-frases'),
            linhasLidas: document.getElementById('total-linhas-lidas'),
            totalLinhas: document.getElementById('total-linhas')
        };
        
        // Containers de conteúdo
        DOM.conteudo = {
            palavras: DOM.containers.etapaPalavras ? DOM.containers.etapaPalavras.querySelector('.grid') : null,
            pseudopalavras: DOM.containers.etapaPseudopalavras ? DOM.containers.etapaPseudopalavras.querySelector('.grid') : null,
            frases: document.getElementById('frases-container'),
            texto: document.getElementById('texto-container')
        };
        
        // Elementos dos resultados
        DOM.resultados = {
            mostrarResultados: document.getElementById('mostrar-resultados'),
            nivelEnsino: document.getElementById('resultado-nivel-ensino'),
            nivelLeitor: document.getElementById('nivel-leitor-sugerido'),
            descricaoNivel: document.getElementById('descricao-nivel'),
            progresso: document.getElementById('nivel-progresso'),
            observacoes: document.getElementById('nivel-observacao')
        };
    }
    
    /**
     * Verifica se os elementos essenciais foram encontrados no DOM
     * @returns {boolean} Verdadeiro se todos os elementos essenciais foram encontrados
     */
    function verificarElementosEssenciais() {
        // Verificar se os elementos essenciais foram encontrados
        if (!DOM.selects.evento) {
            console.error("ERRO CRÍTICO: Elemento 'evento-avaliacao' não encontrado na página!");
            alert("Erro: O formulário não pode ser inicializado corretamente. Por favor, recarregue a página.");
            return false;
        }
        
        if (!DOM.selects.nivelSerie) {
            console.error("ERRO CRÍTICO: Elemento 'nivel-serie' não encontrado na página!");
            alert("Erro: O formulário não pode ser inicializado corretamente. Por favor, recarregue a página.");
            return false;
        }
        
        return true;
    }
    
    /**
     * Configura os eventos da aplicação
     */
    function configurarEventos() {
        // Eventos de navegação
        DOM.navegacao.iniciarAvaliacao.addEventListener('click', iniciarAvaliacao);
        DOM.navegacao.proximoEtapaPalavras.addEventListener('click', () => mudarEtapa('palavras', 'pseudopalavras'));
        DOM.navegacao.proximoEtapaPseudopalavras.addEventListener('click', () => mudarEtapa('pseudopalavras', 'frases'));
        DOM.navegacao.proximoEtapaFrases.addEventListener('click', () => mudarEtapa('frases', 'texto'));
        DOM.navegacao.proximoEtapaTexto.addEventListener('click', () => mudarEtapa('texto', 'resultado'));
        
        // Eventos de timer
        DOM.timers.iniciarPalavras.addEventListener('click', () => iniciarTimer('palavras'));
        DOM.timers.iniciarPseudopalavras.addEventListener('click', () => iniciarTimer('pseudopalavras'));
        DOM.timers.iniciarFrases.addEventListener('click', () => iniciarTimer('frases'));
        DOM.timers.iniciarTexto.addEventListener('click', () => iniciarTimer('texto'));
        
        // Eventos de botões de resultado
        if (DOM.navegacao.novaAvaliacao) {
            DOM.navegacao.novaAvaliacao.addEventListener('click', resetarAvaliacao);
        }
        
        if (DOM.navegacao.voltarDashboard) {
            DOM.navegacao.voltarDashboard.addEventListener('click', () => window.location.href = '../../dashboard.html');
        }
    }
    
    // ===================================================
    // FUNÇÕES DE PREPARAÇÃO E INÍCIO DA AVALIAÇÃO
    // ===================================================
    
    /**
     * Inicia uma nova avaliação com os parâmetros selecionados
     */
    function iniciarAvaliacao() {
        try {
            // Obter ID do evento e nível da série selecionados
            const eventoId = parseInt(DOM.selects.evento.value);
            const nivelSerie = DOM.selects.nivelSerie.value;
            
            // Validar seleções
            if (isNaN(eventoId) || eventoId <= 0) {
                mostrarErro('Por favor, selecione um evento de avaliação.');
                return;
            }
            
            if (!nivelSerie) {
                mostrarErro('Por favor, selecione um nível de ensino.');
                return;
            }
            
            console.log(`Iniciando avaliação - Evento ID: ${eventoId}, Nível: ${nivelSerie}`);
            
            // Obter dados da avaliação
            estado.avaliacao = DADOS.avaliacoes.find(a => a.id === eventoId);
            estado.faixaSerie = nivelSerie;
            
            // Validar dados obtidos
            if (!estado.avaliacao) {
                mostrarErro('Erro ao carregar os dados da avaliação.');
                return;
            }
            
            // Preparar a primeira etapa da avaliação
            prepararEtapaPalavras();
            
            // Mostrar a etapa de palavras
            exibirEtapa('palavras');
            
            console.log('Avaliação iniciada com sucesso');
        } catch (error) {
            console.error('Erro ao iniciar avaliação:', error);
            mostrarErro('Não foi possível iniciar a avaliação. Por favor, tente novamente.');
        }
    }
    
    /**
     * Exibe uma etapa específica e esconde as demais
     * @param {string} etapa - Nome da etapa a ser exibida
     */
    function exibirEtapa(etapa) {
        // Esconder todas as etapas
        Object.values(DOM.containers).forEach(container => {
            if (container) container.classList.add('hidden');
        });
        
        // Exibir a etapa solicitada
        switch (etapa) {
            case 'selecaoAvaliacao':
                if (DOM.containers.selecaoAvaliacao) DOM.containers.selecaoAvaliacao.classList.remove('hidden');
                break;
            case 'palavras':
                if (DOM.containers.etapaPalavras) DOM.containers.etapaPalavras.classList.remove('hidden');
                break;
            case 'pseudopalavras':
                if (DOM.containers.etapaPseudopalavras) DOM.containers.etapaPseudopalavras.classList.remove('hidden');
                break;
            case 'frases':
                if (DOM.containers.etapaFrases) DOM.containers.etapaFrases.classList.remove('hidden');
                break;
            case 'texto':
                if (DOM.containers.etapaTexto) DOM.containers.etapaTexto.classList.remove('hidden');
                break;
            case 'interpretacao':
                if (DOM.containers.etapaInterpretacao) DOM.containers.etapaInterpretacao.classList.remove('hidden');
                break;
            case 'resultado':
                if (DOM.containers.etapaResultado) DOM.containers.etapaResultado.classList.remove('hidden');
                // Atualizar resultado
                atualizarResultados();
                break;
        }
        
        console.log(`Etapa exibida: ${etapa}`);
    }

    // ===================================================
    // FUNÇÕES DE PREPARAÇÃO DAS ETAPAS DE AVALIAÇÃO
    // ===================================================
    
    /**
     * Prepara a etapa de palavras
     */
    function prepararEtapaPalavras() {
        try {
            // Limpar o container
            DOM.conteudo.palavras.innerHTML = '';
            
            // Adicionar as palavras ao container
            estado.avaliacao.palavras.forEach((palavra, index) => {
                const div = document.createElement('div');
                div.className = 'border rounded p-2 flex items-center palavra-item bg-yellow-100 cursor-not-allowed transition-colors';
                div.setAttribute('data-index', index);
                div.innerHTML = `<span class="text-sm text-gray-800 select-none w-full text-center">${palavra}</span>`;
                
                // Adicionar evento de clique
                div.addEventListener('click', function(e) {
                    // Verificar se o timer está ativo
                    if (!estado.timers.palavras) {
                        e.preventDefault();
                        // Não mostrar erro, pois agora é tratado pelo timer-fixes.js
                        return;
                    }
                    
                    // Marcar como lida
                    if (!this.classList.contains('bg-green-200') && !this.classList.contains('bg-red-200')) {
                        this.classList.remove('bg-yellow-100', 'hover:bg-yellow-200', 'cursor-not-allowed');
                        this.classList.add('bg-green-200');
                        atualizarContadorPalavras();
                    }
                });
                
                DOM.conteudo.palavras.appendChild(div);
            });
            
            // Atualizar contador
            DOM.contadores.totalPalavras.textContent = estado.avaliacao.palavras.length;
            DOM.contadores.palavrasLidas.textContent = '0';
            estado.palavrasLidas = 0;
            
            console.log(`Etapa de palavras preparada com ${estado.avaliacao.palavras.length} palavras`);
        } catch (error) {
            console.error('Erro ao preparar etapa de palavras:', error);
            mostrarErro('Ocorreu um erro ao preparar a etapa de palavras.');
        }
    }
    
    /**
     * Prepara a etapa de pseudopalavras
     */
    function prepararEtapaPseudopalavras() {
        try {
            // Limpar o container
            DOM.conteudo.pseudopalavras.innerHTML = '';
            
            // Adicionar as pseudopalavras ao container
            estado.avaliacao.pseudopalavras.forEach((palavra, index) => {
                const div = document.createElement('div');
                div.className = 'border rounded p-2 flex items-center pseudopalavra-item bg-yellow-100 cursor-not-allowed transition-colors';
                div.setAttribute('data-index', index);
                div.innerHTML = `<span class="text-sm text-gray-800 select-none w-full text-center">${palavra}</span>`;
                
                // Adicionar evento de clique
                div.addEventListener('click', function(e) {
                    // Verificar se o timer está ativo
                    if (!estado.timers.pseudopalavras) {
                        e.preventDefault();
                        // Não mostrar erro, pois agora é tratado pelo timer-fixes.js
                        return;
                    }
                    
                    // Marcar como lida
                    if (!this.classList.contains('bg-green-200') && !this.classList.contains('bg-red-200')) {
                        this.classList.remove('bg-yellow-100', 'hover:bg-yellow-200', 'cursor-not-allowed');
                        this.classList.add('bg-green-200');
                        atualizarContadorPseudopalavras();
                    }
                });
                
                DOM.conteudo.pseudopalavras.appendChild(div);
            });
            
            // Atualizar contador
            DOM.contadores.totalPseudopalavras.textContent = estado.avaliacao.pseudopalavras.length;
            DOM.contadores.pseudopalavrasLidas.textContent = '0';
            estado.pseudopalavrasLidas = 0;
            
            console.log(`Etapa de pseudopalavras preparada com ${estado.avaliacao.pseudopalavras.length} pseudopalavras`);
        } catch (error) {
            console.error('Erro ao preparar etapa de pseudopalavras:', error);
            mostrarErro('Ocorreu um erro ao preparar a etapa de pseudopalavras.');
        }
    }
    
    /**
     * Prepara a etapa de frases
     */
    function prepararEtapaFrases() {
        try {
            // Limpar o container
            DOM.conteudo.frases.innerHTML = '';
            
            // Adicionar as frases ao container
            estado.avaliacao.frases.forEach((frase, index) => {
                const div = document.createElement('div');
                div.className = 'border rounded p-3 flex items-center frase-item bg-yellow-100 cursor-not-allowed transition-colors';
                div.setAttribute('data-index', index);
                div.innerHTML = `<span class="text-sm text-gray-800 select-none w-full">${frase}</span>`;
                
                // Adicionar evento de clique
                div.addEventListener('click', function(e) {
                    // Verificar se o timer está ativo
                    if (!estado.timers.frases) {
                        e.preventDefault();
                        // Não mostrar erro, pois agora é tratado pelo timer-fixes.js
                        return;
                    }
                    
                    // Marcar como lida
                    if (!this.classList.contains('bg-green-200') && !this.classList.contains('bg-red-200')) {
                        this.classList.remove('bg-yellow-100', 'hover:bg-yellow-200', 'cursor-not-allowed');
                        this.classList.add('bg-green-200');
                        atualizarContadorFrases();
                    }
                });
                
                DOM.conteudo.frases.appendChild(div);
            });
            
            // Atualizar contador
            DOM.contadores.totalFrases.textContent = estado.avaliacao.frases.length;
            DOM.contadores.frasesLidas.textContent = '0';
            estado.frasesLidas = 0;
            
            console.log(`Etapa de frases preparada com ${estado.avaliacao.frases.length} frases`);
        } catch (error) {
            console.error('Erro ao preparar etapa de frases:', error);
            mostrarErro('Ocorreu um erro ao preparar a etapa de frases.');
        }
    }
    
    /**
     * Prepara a etapa de texto
     */
    function prepararEtapaTexto() {
        try {
            // Limpar o container
            DOM.conteudo.texto.innerHTML = '';
            
            // Dividir o texto em linhas (aproximadamente 10 palavras por linha)
            const palavras = estado.avaliacao.texto.split(' ');
            const linhas = [];
            let linhaAtual = [];
            
            palavras.forEach(palavra => {
                linhaAtual.push(palavra);
                if (linhaAtual.length >= 10) {
                    linhas.push(linhaAtual.join(' '));
                    linhaAtual = [];
                }
            });
            
            // Adicionar a última linha se houver palavras restantes
            if (linhaAtual.length > 0) {
                linhas.push(linhaAtual.join(' '));
            }
            
            // Adicionar as linhas ao container
            linhas.forEach((linha, index) => {
                const div = document.createElement('div');
                div.className = 'border rounded p-2 mb-2 linha-texto-item bg-yellow-100 cursor-not-allowed transition-colors';
                div.setAttribute('data-index', index);
                div.innerHTML = `<span class="text-sm text-gray-800 select-none">${linha}</span>`;
                
                // Adicionar evento de clique
                div.addEventListener('click', function(e) {
                    // Verificar se o timer está ativo
                    if (!estado.timers.texto) {
                        e.preventDefault();
                        // Não mostrar erro, pois agora é tratado pelo timer-fixes.js
                        return;
                    }
                    
                    // Marcar como lida
                    if (!this.classList.contains('bg-green-200') && !this.classList.contains('bg-red-200')) {
                        this.classList.remove('bg-yellow-100', 'hover:bg-yellow-200', 'cursor-not-allowed');
                        this.classList.add('bg-green-200');
                        atualizarContadorLinhas();
                    }
                });
                
                DOM.conteudo.texto.appendChild(div);
            });
            
            // Atualizar contador
            DOM.contadores.totalLinhas.textContent = linhas.length;
            DOM.contadores.linhasLidas.textContent = '0';
            estado.linhasLidas = 0;
            
            console.log(`Etapa de texto preparada com ${linhas.length} linhas`);
        } catch (error) {
            console.error('Erro ao preparar etapa de texto:', error);
            mostrarErro('Ocorreu um erro ao preparar a etapa de texto.');
        }
    }

    // ===================================================
    // FUNÇÕES DE ATUALIZAÇÃO DE CONTADORES
    // ===================================================
    
    /**
     * Atualiza o contador de palavras lidas
     */
    function atualizarContadorPalavras() {
        const itensVerdes = DOM.containers.etapaPalavras.querySelectorAll('.palavra-item.bg-green-200');
        estado.palavrasLidas = itensVerdes.length;
        DOM.contadores.palavrasLidas.textContent = estado.palavrasLidas;
    }
    
    /**
     * Atualiza o contador de pseudopalavras lidas
     */
    function atualizarContadorPseudopalavras() {
        const itensVerdes = DOM.containers.etapaPseudopalavras.querySelectorAll('.pseudopalavra-item.bg-green-200');
        estado.pseudopalavrasLidas = itensVerdes.length;
        DOM.contadores.pseudopalavrasLidas.textContent = estado.pseudopalavrasLidas;
    }
    
    /**
     * Atualiza o contador de frases lidas
     */
    function atualizarContadorFrases() {
        const itensVerdes = document.querySelectorAll('.frase-item.bg-green-200');
        estado.frasesLidas = itensVerdes.length;
        DOM.contadores.frasesLidas.textContent = estado.frasesLidas;
    }
    
    /**
     * Atualiza o contador de linhas lidas
     */
    function atualizarContadorLinhas() {
        const itensVerdes = document.querySelectorAll('.linha-texto-item.bg-green-200');
        estado.linhasLidas = itensVerdes.length;
        DOM.contadores.linhasLidas.textContent = estado.linhasLidas;
    }
    
    // ===================================================
    // FUNÇÕES DE CONTROLE DE TIMER
    // ===================================================
    
    /**
     * Inicia o timer para uma etapa específica
     * @param {string} etapa - Nome da etapa para iniciar o timer
     */
    function iniciarTimer(etapa) {
        try {
            console.log(`Iniciando timer para a etapa: ${etapa}`);
            
            let segundosRestantes = 60;
            const timerElement = DOM.timers[etapa];
            const btnElement = DOM.timers[`iniciar${etapa.charAt(0).toUpperCase() + etapa.slice(1)}`];
            
            // Desabilitar o botão
            btnElement.disabled = true;
            btnElement.classList.add('bg-gray-400');
            btnElement.classList.remove('bg-blue-600', 'hover:bg-blue-700');
            btnElement.textContent = 'Cronômetro iniciado';
            
            // Habilitar os itens desta etapa para cliques
            habilitarCliques(etapa);
            
            // Iniciar contagem regressiva
            estado.timers[etapa] = setInterval(() => {
                segundosRestantes--;
                
                // Formatar tempo (MM:SS)
                const minutos = Math.floor(segundosRestantes / 60);
                const segundos = segundosRestantes % 60;
                timerElement.textContent = `${minutos.toString().padStart(2, '0')}:${segundos.toString().padStart(2, '0')}`;
                
                // Verificar se o tempo acabou
                if (segundosRestantes <= 0) {
                    clearInterval(estado.timers[etapa]);
                    timerElement.textContent = '00:00';
                    
                    // Marcar itens não clicados como não lidos
                    marcarNaoLidos(etapa);
                    
                    // Notificar o usuário
                    mostrarMensagem('Tempo esgotado! Por favor, avance para a próxima etapa.');
                }
            }, 1000);
        } catch (error) {
            console.error(`Erro ao iniciar timer para ${etapa}:`, error);
            mostrarErro('Não foi possível iniciar o cronômetro. Por favor, tente novamente.');
        }
    }
    
    /**
     * Habilita os cliques nos itens de uma etapa
     * @param {string} etapa - Nome da etapa
     */
    function habilitarCliques(etapa) {
        let items;
        
        switch (etapa) {
            case 'palavras':
                items = document.querySelectorAll('.palavra-item');
                break;
            case 'pseudopalavras':
                items = document.querySelectorAll('.pseudopalavra-item');
                break;
            case 'frases':
                items = document.querySelectorAll('.frase-item');
                break;
            case 'texto':
                items = document.querySelectorAll('.linha-texto-item');
                break;
        }
        
        if (items && items.length > 0) {
            items.forEach(item => {
                item.classList.remove('cursor-not-allowed');
                item.classList.add('hover:bg-yellow-200', 'cursor-pointer');
                item.style.pointerEvents = 'auto';
            });
            
            console.log(`${items.length} itens habilitados para cliques na etapa ${etapa}`);
        }
    }
    
    /**
     * Marca os itens não clicados como não lidos
     * @param {string} etapa - Nome da etapa
     */
    function marcarNaoLidos(etapa) {
        let items;
        
        switch (etapa) {
            case 'palavras':
                items = document.querySelectorAll('.palavra-item:not(.bg-green-200)');
                break;
            case 'pseudopalavras':
                items = document.querySelectorAll('.pseudopalavra-item:not(.bg-green-200)');
                break;
            case 'frases':
                items = document.querySelectorAll('.frase-item:not(.bg-green-200)');
                break;
            case 'texto':
                items = document.querySelectorAll('.linha-texto-item:not(.bg-green-200)');
                break;
        }
        
        if (items && items.length > 0) {
            items.forEach(item => {
                item.classList.remove('bg-yellow-100', 'hover:bg-yellow-200');
                item.classList.add('bg-red-200');
                item.style.pointerEvents = 'none';
            });
            
            console.log(`${items.length} itens marcados como não lidos na etapa ${etapa}`);
        }
    }
    
    // ===================================================
    // FUNÇÕES DE NAVEGAÇÃO ENTRE ETAPAS
    // ===================================================
    
    /**
     * Muda de uma etapa para outra
     * @param {string} etapaAtual - Nome da etapa atual
     * @param {string} proximaEtapa - Nome da próxima etapa
     */
    function mudarEtapa(etapaAtual, proximaEtapa) {
        try {
            console.log(`Mudando de etapa: ${etapaAtual} -> ${proximaEtapa}`);
            
            // Parar o timer da etapa atual se estiver ativo
            if (estado.timers[etapaAtual]) {
                clearInterval(estado.timers[etapaAtual]);
                estado.timers[etapaAtual] = null;
            }
            
            // Verificar condições especiais baseadas na etapa
            if (etapaAtual === 'palavras') {
                // Se o aluno não leu palavras suficientes (perfil não leitor)
                if (estado.palavrasLidas <= 10) {
                    const mensagem = estado.palavrasLidas === 0 
                        ? "ATENÇÃO: Não foi lida nenhuma palavra, o que corresponde ao perfil NÍVEL 0 - NÃO AVALIADO. A avaliação será finalizada automaticamente."
                        : `ATENÇÃO: Foram lidas apenas ${estado.palavrasLidas} palavra(s), o que corresponde ao perfil NÍVEL 1 - NÃO LEITOR. A avaliação será finalizada automaticamente.`;
                    
                    mostrarMensagem(mensagem);
                    finalizarAvaliacaoAntecipadamente();
                    return;
                }
            }
            
            // Verificar condições para a etapa de pseudopalavras
            if (etapaAtual === 'pseudopalavras' && proximaEtapa === 'frases') {
                // Se o aluno leu poucas pseudopalavras (perfil leitor de sílabas)
                if (estado.pseudopalavrasLidas <= 6) {
                    mostrarMensagem(`ATENÇÃO: Foram lidas apenas ${estado.pseudopalavrasLidas} pseudopalavra(s), o que corresponde ao perfil NÍVEL 2 - LEITOR DE SÍLABAS. A avaliação será finalizada automaticamente.`);
                    finalizarAvaliacaoAntecipadamente();
                    return;
                }
            }
            
            // Exibir a próxima etapa
            exibirEtapa(proximaEtapa);
            
            // Preparar a próxima etapa
            switch (proximaEtapa) {
                case 'pseudopalavras':
                    prepararEtapaPseudopalavras();
                    break;
                case 'frases':
                    prepararEtapaFrases();
                    break;
                case 'texto':
                    prepararEtapaTexto();
                    break;
                case 'resultado':
                    // Já é tratado dentro da função exibirEtapa
                    break;
            }
        } catch (error) {
            console.error(`Erro ao mudar para a etapa ${proximaEtapa}:`, error);
            mostrarErro('Ocorreu um erro ao mudar de etapa. Por favor, tente novamente.');
        }
    }
})(); 