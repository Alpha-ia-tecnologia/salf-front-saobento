/**
 * Sistema de Avaliação de Leitura e Fluência (SALF)
 * Módulo de realização de avaliação de leitura completa
 * 
 * Este código gerencia todo o processo de avaliação de leitura
 * com seleção de escola, turma, aluno, série e prova.
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
        aluno: null,
        turma: null,
        escola: null,
        avaliacao: null,
        prova: null,
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
        escolas: [
            { id: 1, nome: "Escola Municipal João da Silva" },
            { id: 2, nome: "Escola Estadual Maria José" }
        ],
        
        turmas: [
            { id: 1, nome: "1º Ano A", serie: "1º Ano", escola_id: 1 },
            { id: 2, nome: "2º Ano B", serie: "2º Ano", escola_id: 1 },
            { id: 3, nome: "3º Ano C", serie: "3º Ano", escola_id: 1 },
            { id: 4, nome: "4º Ano A", serie: "4º Ano", escola_id: 2 },
            { id: 5, nome: "5º Ano B", serie: "5º Ano", escola_id: 2 }
        ],
        
        alunos: [
            { id: 1, nome: "Ana Silva", matricula: "12345", turma_id: 1 },
            { id: 2, nome: "Bruno Santos", matricula: "12346", turma_id: 1 },
            { id: 3, nome: "Carla Oliveira", matricula: "12347", turma_id: 2 },
            { id: 4, nome: "Daniel Pereira", matricula: "12348", turma_id: 3 },
            { id: 5, nome: "Eduarda Souza", matricula: "12349", turma_id: 4 },
            { id: 6, nome: "Fernando Lima", matricula: "12350", turma_id: 5 }
        ],
        
        provas: [
            { id: 1, nome: "Prova de Leitura - Básico", niveis: ["1-2"] },
            { id: 2, nome: "Prova de Leitura - Intermediário", niveis: ["3-5"] },
            { id: 3, nome: "Prova de Leitura - Avançado", niveis: ["6-9"] }
        ],
        
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
        console.log('Inicializando aplicação de avaliação de leitura completa...');
        
        // Obter referências aos elementos do DOM
        obterReferenciasDOM();
        
        // Verificar se elementos críticos foram encontrados
        if (!verificarElementosEssenciais()) {
            return;
        }
        
        // Configurar os eventos
        configurarEventos();
        
        // Carregar os dados iniciais
        carregarDadosIniciais();
        
        console.log('Aplicação de avaliação de leitura completa inicializada com sucesso!');
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
            escola: document.getElementById('escola'),
            turma: document.getElementById('turma'),
            aluno: document.getElementById('aluno'),
            serie: document.getElementById('serie'),
            prova: document.getElementById('prova'),
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
            alunoNome: document.getElementById('resultado-aluno-nome'),
            serie: document.getElementById('resultado-serie'),
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
        const elementosEssenciais = [
            { elemento: DOM.selects.escola, nome: 'escola' },
            { elemento: DOM.selects.turma, nome: 'turma' },
            { elemento: DOM.selects.aluno, nome: 'aluno' },
            { elemento: DOM.selects.prova, nome: 'prova' },
            { elemento: DOM.selects.evento, nome: 'evento-avaliacao' }
        ];
        
        for (const { elemento, nome } of elementosEssenciais) {
            if (!elemento) {
                console.error(`ERRO CRÍTICO: Elemento '${nome}' não encontrado na página!`);
                alert(`Erro: O formulário não pode ser inicializado corretamente. Por favor, recarregue a página.`);
                return false;
            }
        }
        
        return true;
    }
    
    /**
     * Configura os eventos da aplicação
     */
    function configurarEventos() {
        // Eventos para os selects cascata
        DOM.selects.escola.addEventListener('change', carregarTurmas);
        DOM.selects.turma.addEventListener('change', carregarAlunos);
        DOM.selects.aluno.addEventListener('change', carregarDadosAluno);
        
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
    
    /**
     * Carrega os dados iniciais
     */
    function carregarDadosIniciais() {
        // Carregar escolas
        carregarEscolas();
        
        // Carregar eventos de avaliação
        carregarEventosAvaliacao();
        
        // Carregar provas
        carregarProvas();
        
        // Carregar alunos da API quando a página carregar
        carregarTodosAlunosAPI();
    }
    
    /**
     * Carrega todos os alunos diretamente da API quando a página carrega
     */
    function carregarTodosAlunosAPI() {
        try {
            console.log('Buscando todos os alunos na API...');
            
            const apiUrl = '/api/alunos';
            console.log('Requisitando dados da API:', apiUrl);
            
            fetch(apiUrl)
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Falha ao buscar dados de alunos: ' + response.status);
                    }
                    return response.json();
                })
                .then(data => {
                    console.log('Dados recebidos da API:', data);
                    
                    // Limpar o select de alunos
                    DOM.selects.aluno.innerHTML = '<option value="">Selecione um aluno</option>';
                    
                    // Verificar formato de dados e iterar
                    const alunos = Array.isArray(data) ? data : (data.alunos || []);
                    
                    // Adicionar os alunos ao select
                    alunos.forEach(aluno => {
                        const option = document.createElement('option');
                        option.value = aluno.id;
                        option.textContent = aluno.nome || aluno.name;
                        DOM.selects.aluno.appendChild(option);
                    });
                    
                    console.log('Alunos carregados com sucesso da API:', alunos.length);
                })
                .catch(error => {
                    console.error('Erro ao carregar alunos da API:', error);
                    // Em caso de erro, usar os dados estáticos como fallback
                    console.log('Usando dados estáticos como fallback...');
                    
                    DOM.selects.aluno.innerHTML = '<option value="">Selecione um aluno</option>';
                    DADOS.alunos.forEach(aluno => {
                        const option = document.createElement('option');
                        option.value = aluno.id;
                        option.textContent = `${aluno.nome} (${aluno.matricula})`;
                        DOM.selects.aluno.appendChild(option);
                    });
                });
        } catch (error) {
            console.error('Erro ao carregar todos os alunos:', error);
            mostrarErro('Não foi possível carregar a lista de alunos.');
        }
    }
    
    /**
     * Carrega as escolas no select
     */
    function carregarEscolas() {
        try {
            // Limpar o select
            DOM.selects.escola.innerHTML = '<option value="">Selecione uma escola</option>';
            
            // Adicionar as escolas como opções
            DADOS.escolas.forEach(escola => {
                const option = document.createElement('option');
                option.value = escola.id;
                option.textContent = escola.nome;
                DOM.selects.escola.appendChild(option);
            });
            
            console.log(`Escolas carregadas: ${DADOS.escolas.length}`);
        } catch (error) {
            console.error('Erro ao carregar escolas:', error);
            mostrarErro('Não foi possível carregar as escolas. Por favor, recarregue a página.');
        }
    }
    
    /**
     * Carrega as turmas de uma escola no select
     */
    function carregarTurmas() {
        try {
            // Obter ID da escola selecionada
            const escolaId = parseInt(DOM.selects.escola.value);
            
            // Limpar os selects dependentes
            DOM.selects.turma.innerHTML = '<option value="">Selecione uma turma</option>';
            DOM.selects.aluno.innerHTML = '<option value="">Selecione um aluno</option>';
            DOM.selects.serie.innerHTML = '<option value="">Série do aluno</option>';
            
            // Armazenar escola selecionada
            if (!isNaN(escolaId) && escolaId > 0) {
                estado.escola = DADOS.escolas.find(e => e.id === escolaId);
            } else {
                estado.escola = null;
                return;
            }
            
            // Filtrar turmas pela escola selecionada
            const turmasFiltradas = DADOS.turmas.filter(turma => turma.escola_id === escolaId);
            
            // Se não houver turmas, mostrar mensagem
            if (turmasFiltradas.length === 0) {
                const option = document.createElement('option');
                option.value = "";
                option.textContent = "Nenhuma turma encontrada";
                DOM.selects.turma.appendChild(option);
                console.log('Nenhuma turma encontrada para a escola selecionada');
                return;
            }
            
            // Adicionar cada turma como opção
            turmasFiltradas.forEach(turma => {
                const option = document.createElement('option');
                option.value = turma.id;
                option.textContent = `${turma.nome} (${turma.serie})`;
                DOM.selects.turma.appendChild(option);
            });
            
            console.log(`Turmas carregadas: ${turmasFiltradas.length}`);
        } catch (error) {
            console.error('Erro ao carregar turmas:', error);
            mostrarErro('Ocorreu um erro ao carregar as turmas.');
        }
    }
    
    /**
     * Carrega os alunos de uma turma no select
     */
    function carregarAlunos() {
        try {
            // Obter ID da turma selecionada
            const turmaId = parseInt(DOM.selects.turma.value);
            
            // Limpar o select de alunos e série
            DOM.selects.aluno.innerHTML = '<option value="">Selecione um aluno</option>';
            DOM.selects.serie.innerHTML = '<option value="">Série do aluno</option>';
            
            // Armazenar turma selecionada
            if (!isNaN(turmaId) && turmaId > 0) {
                estado.turma = DADOS.turmas.find(t => t.id === turmaId);
                
                // Preencher a série da turma no select correspondente
                if (estado.turma) {
                    DOM.selects.serie.innerHTML = `<option value="${estado.turma.serie}">${estado.turma.serie}</option>`;
                    
                    // Determinar a faixa de série com base na turma selecionada
                    determinarFaixaSerie(estado.turma.serie);
                }
            } else {
                estado.turma = null;
                return;
            }
            
            // Buscar alunos da turma selecionada da API
            console.log(`Buscando alunos da turma ${turmaId} na API...`);
            
            fetch(`/api/turmas/${turmaId}/alunos`)
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Falha ao buscar alunos da turma: ' + response.status);
                    }
                    return response.json();
                })
                .then(data => {
            // Se não houver alunos, mostrar mensagem
                    if (data.length === 0) {
                const option = document.createElement('option');
                option.value = "";
                option.textContent = "Nenhum aluno encontrado";
                DOM.selects.aluno.appendChild(option);
                console.log('Nenhum aluno encontrado para a turma selecionada');
                return;
            }
            
            // Adicionar cada aluno como opção
                    data.forEach(aluno => {
                        const option = document.createElement('option');
                        option.value = aluno.id;
                        option.textContent = aluno.nome + (aluno.matricula ? ` (${aluno.matricula})` : '');
                        DOM.selects.aluno.appendChild(option);
                    });
                    
                    console.log(`Alunos carregados da API: ${data.length}`);
                })
                .catch(error => {
                    console.error('Erro ao carregar alunos da API:', error);
                    console.log('Usando dados estáticos como fallback...');
                    
                    // Em caso de erro, usar os dados estáticos como fallback
                    const alunosFiltrados = DADOS.alunos.filter(aluno => aluno.turma_id === turmaId);
                    
                    if (alunosFiltrados.length === 0) {
                        const option = document.createElement('option');
                        option.value = "";
                        option.textContent = "Nenhum aluno encontrado";
                        DOM.selects.aluno.appendChild(option);
                        return;
                    }
                    
            alunosFiltrados.forEach(aluno => {
                const option = document.createElement('option');
                option.value = aluno.id;
                option.textContent = `${aluno.nome} (${aluno.matricula})`;
                DOM.selects.aluno.appendChild(option);
                    });
            });
            
        } catch (error) {
            console.error('Erro ao carregar alunos:', error);
            mostrarErro('Ocorreu um erro ao carregar os alunos.');
        }
    }
    
    /**
     * Carrega os dados de um aluno selecionado
     */
    function carregarDadosAluno() {
        try {
            // Obter ID do aluno selecionado
            const alunoId = parseInt(DOM.selects.aluno.value);
            
            // Armazenar aluno selecionado
            if (!isNaN(alunoId) && alunoId > 0) {
                estado.aluno = DADOS.alunos.find(a => a.id === alunoId);
                console.log(`Aluno selecionado: ${estado.aluno.nome}`);
                
                // Sugerir prova adequada com base na série
                sugerirProva();
            } else {
                estado.aluno = null;
            }
        } catch (error) {
            console.error('Erro ao carregar dados do aluno:', error);
            mostrarErro('Ocorreu um erro ao carregar os dados do aluno.');
        }
    }
    
    /**
     * Carrega as provas disponíveis no select
     */
    function carregarProvas() {
        try {
            // Limpar o select
            DOM.selects.prova.innerHTML = '<option value="">Selecione uma prova</option>';
            
            // Adicionar as provas como opções
            DADOS.provas.forEach(prova => {
                const option = document.createElement('option');
                option.value = prova.id;
                option.textContent = prova.nome;
                DOM.selects.prova.appendChild(option);
            });
            
            console.log(`Provas carregadas: ${DADOS.provas.length}`);
        } catch (error) {
            console.error('Erro ao carregar provas:', error);
            mostrarErro('Não foi possível carregar as provas. Por favor, recarregue a página.');
        }
    }
    
    /**
     * Sugere uma prova adequada com base na série do aluno
     */
    function sugerirProva() {
        if (!estado.faixaSerie) return;
        
        const provaRecomendada = DADOS.provas.find(prova => 
            prova.niveis.includes(estado.faixaSerie)
        );
        
        if (provaRecomendada) {
            DOM.selects.prova.value = provaRecomendada.id;
            console.log(`Prova recomendada: ${provaRecomendada.nome}`);
        }
    }
    
    /**
     * Carrega os eventos de avaliação no select
     */
    function carregarEventosAvaliacao() {
        try {
            // Limpar o select
            DOM.selects.evento.innerHTML = '<option value="">Selecione um evento</option>';
            
            // Adicionar os eventos como opções
            DADOS.avaliacoes.forEach(avaliacao => {
                const option = document.createElement('option');
                option.value = avaliacao.id;
                option.textContent = avaliacao.nome;
                DOM.selects.evento.appendChild(option);
            });
            
            console.log(`Eventos de avaliação carregados: ${DADOS.avaliacoes.length}`);
        } catch (error) {
            console.error('Erro ao carregar eventos de avaliação:', error);
            mostrarErro('Não foi possível carregar os eventos de avaliação. Por favor, recarregue a página.');
        }
    }
    
    /**
     * Determina a faixa de série do aluno
     * @param {string} serie - Série escolar do aluno
     */
    function determinarFaixaSerie(serie) {
        try {
            // Extrair o número da série
            const match = serie.match(/\d+/);
            let numeroSerie = 1; // valor padrão
            
            if (match && match[0]) {
                numeroSerie = parseInt(match[0]);
                console.log(`Número da série extraído: ${numeroSerie}`);
            } else {
                console.warn(`Não foi possível extrair o número da série: ${serie}`);
            }
            
            // Determinar a faixa de série
            if (numeroSerie <= 2) {
                estado.faixaSerie = "1-2";
            } else if (numeroSerie <= 5) {
                estado.faixaSerie = "3-5";
            } else {
                estado.faixaSerie = "6-9";
            }
            
            // Atualizar o campo nivelSerie (mantido para compatibilidade)
            if (DOM.selects.nivelSerie) {
                DOM.selects.nivelSerie.value = estado.faixaSerie;
            }
            
            console.log(`Faixa de série determinada: ${estado.faixaSerie} (Série: ${serie})`);
        } catch (error) {
            console.error('Erro ao determinar faixa de série:', error);
            estado.faixaSerie = "1-2"; // valor padrão em caso de erro
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
            // Validar os campos obrigatórios
            if (!validarCamposFormulario()) {
                return;
            }
            
            // Obter dados da avaliação
            const eventoId = parseInt(DOM.selects.evento.value);
            const provaId = parseInt(DOM.selects.prova.value);
            
            estado.avaliacao = DADOS.avaliacoes.find(a => a.id === eventoId);
            estado.prova = DADOS.provas.find(p => p.id === provaId);
            
            console.log(`Iniciando avaliação - Aluno: ${estado.aluno.nome}, Evento: ${estado.avaliacao.nome}, Prova: ${estado.prova.nome}`);
            
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
     * Valida os campos do formulário de avaliação
     * @returns {boolean} Verdadeiro se todos os campos estão válidos
     */
    function validarCamposFormulario() {
        // Validar escola
        if (!DOM.selects.escola.value) {
            mostrarErro('Por favor, selecione uma escola.');
            return false;
        }
        
        // Validar turma
        if (!DOM.selects.turma.value) {
            mostrarErro('Por favor, selecione uma turma.');
            return false;
        }
        
        // Validar aluno
        if (!DOM.selects.aluno.value) {
            mostrarErro('Por favor, selecione um aluno.');
            return false;
        }
        
        // Validar prova
        if (!DOM.selects.prova.value) {
            mostrarErro('Por favor, selecione uma prova.');
            return false;
        }
        
        // Validar evento
        if (!DOM.selects.evento.value) {
            mostrarErro('Por favor, selecione um evento de avaliação.');
            return false;
        }
        
        return true;
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
                        mostrarErro('Por favor, inicie o cronômetro antes de começar a marcar as palavras.');
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
                        mostrarErro('Por favor, inicie o cronômetro antes de começar a marcar as pseudopalavras.');
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
                        mostrarErro('Por favor, inicie o cronômetro antes de começar a marcar as frases.');
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
                        mostrarErro('Por favor, inicie o cronômetro antes de começar a marcar as linhas de texto.');
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

    // ===================================================
    // FUNÇÕES DE FINALIZAÇÃO E RESULTADOS
    // ===================================================
    
    /**
     * Finaliza a avaliação antecipadamente
     */
    function finalizarAvaliacaoAntecipadamente() {
        try {
            console.log('Finalizando avaliação antecipadamente');
            
            // Exibir a tela de resultado
            exibirEtapa('resultado');
            
            // Verificar se deve mostrar resultados detalhados
            const mostrarResultados = DOM.resultados.mostrarResultados.checked;
            
            // Se não mostrar resultados detalhados, esconder elementos
            if (!mostrarResultados) {
                const elementosParaEsconder = [
                    'resultado-aluno-nome',
                    'resultado-serie',
                    'nivel-leitor-sugerido',
                    'descricao-nivel',
                    'nivel-progresso',
                    'nivel-observacao'
                ];
                
                // Esconder elementos
                elementosParaEsconder.forEach(id => {
                    const elemento = document.getElementById(id);
                    if (elemento) {
                        elemento.parentElement.classList.add('hidden');
                    }
                });
            }
            
            // Voltar para o topo da página
            window.scrollTo(0, 0);
            
            console.log('Avaliação finalizada com sucesso');
        } catch (error) {
            console.error('Erro ao finalizar avaliação:', error);
            mostrarErro('Ocorreu um erro ao finalizar a avaliação.');
        }
    }
    
    /**
     * Atualiza e exibe os resultados da avaliação
     */
    function atualizarResultados() {
        try {
            // Preencher os dados do aluno no resultado
            if (DOM.resultados.alunoNome && estado.aluno) {
                DOM.resultados.alunoNome.textContent = estado.aluno.nome;
            }
            
            if (DOM.resultados.serie && estado.turma) {
                DOM.resultados.serie.textContent = estado.turma.serie;
            }
            
            // Determinar nível de leitura
            const nivel = determinarNivel();
            
            // Exibir resultados com base no nível
            exibirResultadosNivel(nivel);
            
            console.log(`Resultados atualizados - Nível: ${nivel}`);
        } catch (error) {
            console.error('Erro ao atualizar resultados:', error);
            mostrarErro('Não foi possível calcular os resultados corretamente.');
        }
    }
    
    /**
     * Determina o nível de leitura com base no desempenho
     * @returns {number} Nível de leitura (0-6)
     */
    function determinarNivel() {
        try {
            // Verificar se há palavras lidas
            if (estado.palavrasLidas === 0) {
                return 0; // NÍVEL 0 - NÃO AVALIADO
            }
            
            // Calcular palavras por minuto (PPM)
            const ppm = estado.palavrasLidas;
            
            // Determinar nível baseado na faixa e PPM
            switch (estado.faixaSerie) {
                case "1-2": // 1º e 2º anos
                    if (ppm <= 10) return 1; // NÍVEL 1 - NÃO LEITOR
                    if (ppm <= 25) return 2; // NÍVEL 2 - LEITOR DE SÍLABAS
                    if (ppm <= 35) return 3; // NÍVEL 3 - LEITOR DE PALAVRAS
                    if (ppm <= 44) return 4; // NÍVEL 4 - LEITOR DE FRASES
                    if (ppm <= 59) return 5; // NÍVEL 5 - LEITOR DE TEXTO SEM FLUÊNCIA
                    return 6; // NÍVEL 6 - LEITOR DE TEXTO COM FLUÊNCIA
                
                case "3-5": // 3º ao 5º anos
                    if (ppm <= 20) return 1; // NÍVEL 1 - NÃO LEITOR
                    if (ppm <= 39) return 2; // NÍVEL 2 - LEITOR DE SÍLABAS
                    if (ppm <= 69) return 3; // NÍVEL 3 - LEITOR DE PALAVRAS
                    if (ppm <= 89) return 4; // NÍVEL 4 - LEITOR DE FRASES
                    if (ppm <= 109) return 5; // NÍVEL 5 - LEITOR DE TEXTO SEM FLUÊNCIA
                    return 6; // NÍVEL 6 - LEITOR DE TEXTO COM FLUÊNCIA
                
                case "6-9": // 6º ao 9º anos
                    if (ppm <= 50) return 1; // NÍVEL 1 - NÃO LEITOR
                    if (ppm <= 80) return 2; // NÍVEL 2 - LEITOR DE SÍLABAS
                    if (ppm <= 110) return 3; // NÍVEL 3 - LEITOR DE PALAVRAS
                    if (ppm <= 130) return 4; // NÍVEL 4 - LEITOR DE FRASES
                    if (ppm <= 160) return 5; // NÍVEL 5 - LEITOR DE TEXTO SEM FLUÊNCIA
                    return 6; // NÍVEL 6 - LEITOR DE TEXTO COM FLUÊNCIA
                
                default:
                    return 3; // Valor médio em caso de erro
            }
        } catch (error) {
            console.error('Erro ao determinar nível:', error);
            return 3; // Valor médio em caso de erro
        }
    }
    
    /**
     * Exibe os resultados com base no nível de leitura
     * @param {number} nivel - Nível de leitura (0-6)
     */
    function exibirResultadosNivel(nivel) {
        let descricaoNivel = "";
        let infoDetalhada = "";
        let corNivel = "";
        let recomendacoes = [];
        
        // Definir descrição e cor do nível
        if (nivel === 0) {
            descricaoNivel = "NÍVEL 0 - NÃO AVALIADO";
            corNivel = "#6B7280"; // Cinza
            infoDetalhada = "Não foi possível avaliar. O aluno não realizou nenhuma leitura.";
            recomendacoes = [
                "Realizar nova avaliação em outro momento",
                "Verificar se o aluno compreendeu as instruções",
                "Considerar avaliação individual com apoio pedagógico"
            ];
        } else if (nivel === 1) {
            descricaoNivel = "NÍVEL 1 - NÃO LEITOR";
            corNivel = "#EF4444"; // Vermelho
            infoDetalhada = `Palavras lidas: ${estado.palavrasLidas}. Necessita intervenção urgente.`;
            recomendacoes = [
                "Intervenção pedagógica imediata",
                "Desenvolvimento de consciência fonológica",
                "Atividades diárias de reconhecimento de letras e sílabas"
            ];
        } else if (nivel === 2) {
            descricaoNivel = "NÍVEL 2 - LEITOR DE SÍLABAS";
            corNivel = "#F97316"; // Laranja
            infoDetalhada = `Palavras lidas: ${estado.palavrasLidas}. Pseudopalavras lidas: ${estado.pseudopalavrasLidas}. Foco em decodificação.`;
            recomendacoes = [
                "Praticar leitura em voz alta diariamente",
                "Exercícios de associação de sílabas",
                "Jogos de formação de palavras"
            ];
        } else if (nivel === 3) {
            descricaoNivel = "NÍVEL 3 - LEITOR DE PALAVRAS";
            corNivel = "#FBBF24"; // Amarelo
            infoDetalhada = `Palavras lidas: ${estado.palavrasLidas}. Pseudopalavras lidas: ${estado.pseudopalavrasLidas}. Frases lidas: ${estado.frasesLidas}. Atenção à fluência.`;
            recomendacoes = [
                "Leitura de textos curtos e simples",
                "Exercícios de ampliação de vocabulário",
                "Atividades de compreensão de frases"
            ];
        } else if (nivel === 4) {
            descricaoNivel = "NÍVEL 4 - LEITOR DE FRASES";
            corNivel = "#34D399"; // Verde claro
            infoDetalhada = `Palavras lidas: ${estado.palavrasLidas}. Frases lidas: ${estado.frasesLidas}. Ritmo comprometido.`;
            recomendacoes = [
                "Leitura de textos diversos",
                "Práticas de entonação e ritmo",
                "Atividades de interpretação de pequenos textos"
            ];
        } else if (nivel === 5) {
            descricaoNivel = "NÍVEL 5 - LEITOR DE TEXTO SEM FLUÊNCIA";
            corNivel = "#22D3EE"; // Azul claro
            infoDetalhada = `Palavras lidas: ${estado.palavrasLidas}. Linhas de texto lidas: ${estado.linhasLidas}. Boa base.`;
            recomendacoes = [
                "Praticar leitura em diferentes gêneros textuais",
                "Exercícios específicos de fluência",
                "Atividades de compreensão textual mais complexas"
            ];
        } else {
            descricaoNivel = "NÍVEL 6 - LEITOR DE TEXTO COM FLUÊNCIA";
            corNivel = "#2563EB"; // Azul
            infoDetalhada = `Palavras lidas: ${estado.palavrasLidas}. Linhas de texto lidas: ${estado.linhasLidas}. Leitura fluente.`;
            recomendacoes = [
                "Aprimorar a interpretação crítica",
                "Leitura de textos de diferentes níveis de complexidade",
                "Atividades de produção textual baseadas na leitura"
            ];
        }
        
        // Atualizar elementos da interface
        if (DOM.resultados.nivelLeitor) {
            DOM.resultados.nivelLeitor.textContent = descricaoNivel;
            DOM.resultados.nivelLeitor.style.color = corNivel;
        }
        
        if (DOM.resultados.descricaoNivel) {
            DOM.resultados.descricaoNivel.textContent = infoDetalhada;
        }
        
        if (DOM.resultados.progresso) {
            DOM.resultados.progresso.style.width = `${(nivel / 6) * 100}%`;
            DOM.resultados.progresso.style.backgroundColor = corNivel;
        }
        
        if (DOM.resultados.observacoes) {
            DOM.resultados.observacoes.innerHTML = `<strong>Recomendações:</strong><br>• ${recomendacoes.join('<br>• ')}`;
        }
    }
    
    /**
     * Reseta a avaliação para iniciar uma nova
     */
    function resetarAvaliacao() {
        try {
            console.log('Resetando avaliação');
            
            // Limpar estado
            estado.aluno = null;
            estado.turma = null;
            estado.escola = null;
            estado.avaliacao = null;
            estado.prova = null;
            estado.palavrasLidas = 0;
            estado.pseudopalavrasLidas = 0;
            estado.frasesLidas = 0;
            estado.linhasLidas = 0;
            
            // Parar todos os timers
            Object.keys(estado.timers).forEach(etapa => {
                if (estado.timers[etapa]) {
                    clearInterval(estado.timers[etapa]);
                    estado.timers[etapa] = null;
                }
            });
            
            // Resetar timers na interface
            DOM.timers.palavras.textContent = '01:00';
            DOM.timers.pseudopalavras.textContent = '01:00';
            DOM.timers.frases.textContent = '01:00';
            DOM.timers.texto.textContent = '01:00';
            
            // Reativar botões
            const botoes = [
                DOM.timers.iniciarPalavras,
                DOM.timers.iniciarPseudopalavras,
                DOM.timers.iniciarFrases,
                DOM.timers.iniciarTexto
            ];
            
            botoes.forEach(btn => {
                if (btn) {
                    btn.disabled = false;
                    btn.classList.remove('bg-gray-400');
                    btn.classList.add('bg-blue-600', 'hover:bg-blue-700');
                    btn.textContent = 'Iniciar Cronômetro';
                }
            });
            
            // Voltar para a tela de seleção
            exibirEtapa('selecaoAvaliacao');
            
            console.log('Avaliação resetada com sucesso');
        } catch (error) {
            console.error('Erro ao resetar avaliação:', error);
            mostrarErro('Ocorreu um erro ao preparar uma nova avaliação.');
        }
    }
    
    // ===================================================
    // FUNÇÕES AUXILIARES
    // ===================================================
    
    /**
     * Exibe uma mensagem de erro para o usuário
     * @param {string} mensagem - A mensagem de erro a ser exibida
     */
    function mostrarErro(mensagem) {
        alert(mensagem);
    }
    
    /**
     * Exibe uma mensagem informativa para o usuário
     * @param {string} mensagem - A mensagem a ser exibida
     */
    function mostrarMensagem(mensagem) {
        alert(mensagem);
    }
})(); 