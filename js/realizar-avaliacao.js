document.addEventListener('DOMContentLoaded', function() {
    // ==========================================
    // CONFIGURAÇÃO INICIAL E REFERÊNCIAS DOM
    // ==========================================
    
    // API base URL
    const API_BASE_URL = 'https://salf-salf-api.py5r5i.easypanel.host';
    
    // Obter token de autenticação
    const token = localStorage.getItem('authToken');
    
    // Cabeçalhos para requisições
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
    };
    
    // Referências às etapas principais
    const elementos = {
        // Containers de etapas
        selecaoAluno: document.getElementById('selecao-aluno'),
        etapaPalavras: document.getElementById('etapa-palavras'),
        etapaPseudopalavras: document.getElementById('etapa-pseudopalavras'),
        etapaFrases: document.getElementById('etapa-frases'),
        etapaTexto: document.getElementById('etapa-texto'),
        etapaInterpretacao: document.getElementById('etapa-interpretacao'),
        etapaResultado: document.getElementById('etapa-resultado'),
        
        // Selects para seleção de aluno
        eventoSelect: document.getElementById('evento-avaliacao'),
        escolaSelect: document.getElementById('escola'),
        turmaSelect: document.getElementById('turma'),
        alunoSelect: document.getElementById('aluno'),
        
        // Botões principais
        iniciarAvaliacaoBtn: document.getElementById('iniciar-avaliacao'),
        salvarAvaliacaoBtn: document.getElementById('salvar-avaliacao'),
        
        // Timers
        timerPalavras: document.getElementById('timer-palavras'),
        timerPseudopalavras: document.getElementById('timer-pseudopalavras'),
        timerFrases: document.getElementById('timer-frases'),
        timerTexto: document.getElementById('timer-texto'),
        
        // Botões de iniciar timer
        iniciarTimerPalavrasBtn: document.getElementById('iniciar-timer-palavras'),
        iniciarTimerPseudopalavrasBtn: document.getElementById('iniciar-timer-pseudopalavras'),
        iniciarTimerFrasesBtn: document.getElementById('iniciar-timer-frases'),
        iniciarTimerTextoBtn: document.getElementById('iniciar-timer-texto'),
        
        // Botões de avançar etapa
        proximoEtapaPalavrasBtn: document.getElementById('proximo-etapa-palavras'),
        proximoEtapaPseudopalavrasBtn: document.getElementById('proximo-etapa-pseudopalavras'),
        proximoEtapaFrasesBtn: document.getElementById('proximo-etapa-frases'),
        proximoEtapaTextoBtn: document.getElementById('proximo-etapa-texto'),
        finalizarAvaliacaoBtn: document.getElementById('finalizar-avaliacao'),
        
        // Contadores
        totalPalavrasLidas: document.getElementById('total-palavras-lidas'),
        totalPalavras: document.getElementById('total-palavras'),
        totalPseudopalavrasLidas: document.getElementById('total-pseudopalavras-lidas'),
        totalPseudopalavras: document.getElementById('total-pseudopalavras'),
        totalFrasesLidas: document.getElementById('total-frases-lidas'),
        totalFrases: document.getElementById('total-frases'),
        totalLinhasLidas: document.getElementById('total-linhas-lidas'),
        totalLinhas: document.getElementById('total-linhas'),
        totalRespostasCorretas: document.getElementById('total-respostas-corretas'),
        totalQuestoes: document.getElementById('total-questoes')
    };
    
    // ==========================================
    // VARIÁVEIS DE ESTADO
    // ==========================================
    
    // Estado atual da avaliação
    const estado = {
        avaliacaoAtual: null,
        alunoAtual: null,
        palavrasLidas: 0,
        pseudopalavrasLidas: 0,
        frasesLidas: 0,
        linhasLidas: 0,
        respostasCorretas: 0,
        faixaSerie: null,
        timers: {
            palavras: null,
            pseudopalavras: null,
            frases: null,
            texto: null
        }
    };
    
    console.log("Documento carregado. Iniciando setup da página de avaliação...");
    
    // Verificar referências aos elementos principais
    console.log("Verificando referências aos elementos:");
    console.log("- escolaSelect:", elementos.escolaSelect);
    console.log("- turmaSelect:", elementos.turmaSelect);
    console.log("- alunoSelect:", elementos.alunoSelect);
    console.log("- eventoSelect:", elementos.eventoSelect);
    console.log("- iniciarAvaliacaoBtn:", elementos.iniciarAvaliacaoBtn);
    
    // Verificar se os elementos essenciais foram encontrados
    const elementosEssenciais = [
        { elemento: elementos.escolaSelect, nome: 'escola' },
        { elemento: elementos.turmaSelect, nome: 'turma' },
        { elemento: elementos.alunoSelect, nome: 'aluno' },
        { elemento: elementos.eventoSelect, nome: 'evento-avaliacao' }
    ];
    
    let todosElementosEncontrados = true;
    for (const { elemento, nome } of elementosEssenciais) {
        if (!elemento) {
            console.error(`ERRO CRÍTICO: Elemento '${nome}' não encontrado na página!`);
            todosElementosEncontrados = false;
        }
    }
    
    if (!todosElementosEncontrados) {
        alert("Erro: O formulário não pode ser inicializado corretamente. Por favor, recarregue a página.");
        return;
    }
    
    // Inicializar os filtros
    inicializarFiltros();
    
    // ==========================================
    // FUNÇÕES DE INICIALIZAÇÃO DE FILTROS
    // ==========================================
    
    /**
     * Inicializa todos os filtros da página
     */
    function inicializarFiltros() {
        console.log("Iniciando configuração dos filtros...");
        
        // Configurar eventos de change para os selects
        elementos.escolaSelect.addEventListener('change', handleEscolaChange);
        elementos.turmaSelect.addEventListener('change', handleTurmaChange);
        elementos.alunoSelect.addEventListener('change', handleAlunoChange);
        
        // Configurar botão de iniciar avaliação
        elementos.iniciarAvaliacaoBtn.addEventListener('click', iniciarAvaliacao);
        
        // Carregar dados iniciais
        carregarEscolas();
        carregarTodosAlunos();
        carregarEventosAvaliacao();
        
        console.log("Filtros inicializados com sucesso!");
    }
    
    /**
     * Carrega a lista de escolas da API
     */
    function carregarEscolas() {
        console.log("Carregando escolas da API...");
        
        // Limpar o select
        elementos.escolaSelect.innerHTML = '<option value="">Selecione uma escola</option>';
        
        fetch(`${API_BASE_URL}/schools`, { headers })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Erro ao buscar escolas: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                console.log("Dados de escolas recebidos:", data);
                
                // Processar dados (considerando diferentes formatos possíveis)
                const escolas = Array.isArray(data) ? data : (data.schools || []);
                
                // Adicionar opções ao select
                escolas.forEach(escola => {
                    const option = document.createElement('option');
                    option.value = escola.id;
                    option.textContent = escola.name || escola.nome || escola.school_name;
                    elementos.escolaSelect.appendChild(option);
                });
                
                console.log(`${escolas.length} escolas carregadas com sucesso`);
            })
            .catch(error => {
                console.error("Erro ao carregar escolas:", error);
                
                // Adicionar escolas estáticas em caso de falha
                const escolasEstaticas = [
                    { id: 1, nome: "Escola Municipal João da Silva" },
                    { id: 2, nome: "Escola Estadual Maria José" }
                ];
                
                escolasEstaticas.forEach(escola => {
                const option = document.createElement('option');
                    option.value = escola.id;
                    option.textContent = escola.nome;
                    elementos.escolaSelect.appendChild(option);
                });
                
                console.log("Escolas estáticas carregadas como fallback");
            });
    }
    
    /**
     * Carrega todos os alunos da API (sem filtro)
     */
    function carregarTodosAlunos() {
        console.log("Carregando todos os alunos da API...");
        
        // Limpar o select
        elementos.alunoSelect.innerHTML = '<option value="">Selecione um aluno</option>';
        
        fetch(`${API_BASE_URL}/students`, { headers })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Erro ao buscar alunos: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                console.log("Dados de alunos recebidos:", data);
                
                // Processar dados (considerando diferentes formatos possíveis)
                const alunos = Array.isArray(data) ? data : (data.students || []);
                
                // Adicionar opções ao select
                alunos.forEach(aluno => {
                    const option = document.createElement('option');
                    option.value = aluno.id;
                    option.textContent = aluno.name || aluno.nome || aluno.student_name;
                    if (aluno.registrationNumber) {
                        option.textContent += ` (${aluno.registrationNumber})`;
                    }
                    elementos.alunoSelect.appendChild(option);
                });
                
                console.log(`${alunos.length} alunos carregados com sucesso`);
            })
            .catch(error => {
                console.error("Erro ao carregar alunos:", error);
                
                // Adicionar alunos estáticos em caso de falha
                const alunosEstaticos = [
                    { id: 1, nome: "Ana Silva", matricula: "12345" },
                    { id: 2, nome: "Bruno Santos", matricula: "12346" },
                    { id: 3, nome: "Carla Oliveira", matricula: "12347" },
                    { id: 4, nome: "Daniel Pereira", matricula: "12348" },
                    { id: 5, nome: "Eduarda Souza", matricula: "12349" }
                ];
                
                alunosEstaticos.forEach(aluno => {
                const option = document.createElement('option');
                option.value = aluno.id;
                    option.textContent = `${aluno.nome}${aluno.matricula ? ` (${aluno.matricula})` : ''}`;
                elementos.alunoSelect.appendChild(option);
            });
                
                console.log("Alunos estáticos carregados como fallback");
            });
    }
    
    /**
     * Carrega as turmas de uma escola específica
     * @param {number} escolaId - ID da escola selecionada
     */
    function carregarTurmasDaEscola(escolaId) {
        console.log(`Carregando turmas da escola ${escolaId}...`);
        
        // Limpar o select
        elementos.turmaSelect.innerHTML = '<option value="">Selecione uma turma</option>';
        
        fetch(`${API_BASE_URL}/schools/${escolaId}/classes`, { headers })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Erro ao buscar turmas: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                console.log("Dados de turmas recebidos:", data);
                
                // Processar dados (considerando diferentes formatos possíveis)
                const turmas = Array.isArray(data) ? data : (data.classes || []);
                
                if (turmas.length === 0) {
                    const option = document.createElement('option');
                    option.value = "";
                    option.textContent = "Nenhuma turma encontrada";
                    elementos.turmaSelect.appendChild(option);
                    return;
                }
                
                // Adicionar opções ao select
                turmas.forEach(turma => {
                    const option = document.createElement('option');
                    option.value = turma.id;
                    const nome = turma.name || turma.nome || turma.class_name;
                    const serie = turma.grade || turma.serie || turma.class_grade || '';
                    option.textContent = serie ? `${nome} (${serie})` : nome;
                    elementos.turmaSelect.appendChild(option);
                });
                
                console.log(`${turmas.length} turmas carregadas com sucesso`);
            })
            .catch(error => {
                console.error("Erro ao carregar turmas:", error);
                
                // Adicionar turmas estáticas em caso de falha
                const turmasEstaticas = [
                    { id: 1, nome: "Turma A", serie: "1º Ano", escola_id: 1 },
                    { id: 2, nome: "Turma B", serie: "2º Ano", escola_id: 1 },
                    { id: 3, nome: "Turma C", serie: "1º Ano", escola_id: 2 },
                    { id: 4, nome: "Turma D", serie: "3º Ano", escola_id: 2 }
                ].filter(turma => turma.escola_id === escolaId);
                
                if (turmasEstaticas.length === 0) {
                    const option = document.createElement('option');
                    option.value = "";
                    option.textContent = "Nenhuma turma encontrada";
                    elementos.turmaSelect.appendChild(option);
                    return;
                }
                
                turmasEstaticas.forEach(turma => {
                    const option = document.createElement('option');
                    option.value = turma.id;
                    option.textContent = `${turma.nome} (${turma.serie})`;
                    elementos.turmaSelect.appendChild(option);
                });
                
                console.log("Turmas estáticas carregadas como fallback");
            });
    }
    
    /**
     * Carrega os alunos de uma turma específica
     * @param {number} turmaId - ID da turma selecionada
     */
    function carregarAlunosDaTurma(turmaId) {
        console.log(`Carregando alunos da turma ${turmaId}...`);
        
        // Limpar o select
        elementos.alunoSelect.innerHTML = '<option value="">Selecione um aluno</option>';
        
        fetch(`${API_BASE_URL}/classes/${turmaId}/students`, { headers })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Erro ao buscar alunos da turma: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                console.log("Dados de alunos da turma recebidos:", data);
                
                // Processar dados (considerando diferentes formatos possíveis)
                const alunos = Array.isArray(data) ? data : (data.students || []);
                
                if (alunos.length === 0) {
                    const option = document.createElement('option');
                    option.value = "";
                    option.textContent = "Nenhum aluno encontrado";
                    elementos.alunoSelect.appendChild(option);
                    return;
                }
                
                // Adicionar opções ao select
                alunos.forEach(aluno => {
                    const option = document.createElement('option');
                    option.value = aluno.id;
                    option.textContent = aluno.name || aluno.nome || aluno.student_name;
                    if (aluno.registrationNumber) {
                        option.textContent += ` (${aluno.registrationNumber})`;
                    }
                    elementos.alunoSelect.appendChild(option);
                });
                
                console.log(`${alunos.length} alunos da turma carregados com sucesso`);
            })
            .catch(error => {
                console.error("Erro ao carregar alunos da turma:", error);
                
                // Adicionar alunos estáticos em caso de falha
                const alunosEstaticos = [
                    { id: 1, nome: "Ana Silva", matricula: "12345", turma_id: 1 },
                    { id: 2, nome: "Bruno Santos", matricula: "12346", turma_id: 1 },
                    { id: 3, nome: "Carla Oliveira", matricula: "12347", turma_id: 2 },
                    { id: 4, nome: "Daniel Pereira", matricula: "12348", turma_id: 3 },
                    { id: 5, nome: "Eduarda Souza", matricula: "12349", turma_id: 4 }
                ].filter(aluno => aluno.turma_id === turmaId);
                
                if (alunosEstaticos.length === 0) {
                    const option = document.createElement('option');
                    option.value = "";
                    option.textContent = "Nenhum aluno encontrado";
                    elementos.alunoSelect.appendChild(option);
                    return;
                }
                
                alunosEstaticos.forEach(aluno => {
                    const option = document.createElement('option');
                    option.value = aluno.id;
                    option.textContent = `${aluno.nome} (${aluno.matricula})`;
                    elementos.alunoSelect.appendChild(option);
                });
                
                console.log("Alunos estáticos carregados como fallback");
            });
    }
    
    /**
     * Carrega os eventos de avaliação disponíveis
     */
    function carregarEventosAvaliacao() {
        console.log("Carregando eventos de avaliação...");
        
        // Limpar o select
        elementos.eventoSelect.innerHTML = '<option value="">Selecione um evento</option>';
        
        fetch(`${API_BASE_URL}/assessment-events`, { headers })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Erro ao buscar eventos: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                console.log("Dados de eventos recebidos:", data);
                
                // Processar dados (considerando diferentes formatos possíveis)
                const eventos = Array.isArray(data) ? data : (data.events || []);
                
                // Adicionar opções ao select
                eventos.forEach(evento => {
                    const option = document.createElement('option');
                    option.value = evento.id;
                    option.textContent = evento.name || evento.nome || evento.event_name || evento.description;
                    elementos.eventoSelect.appendChild(option);
                });
                
                console.log(`${eventos.length} eventos carregados com sucesso`);
            })
            .catch(error => {
                console.error("Erro ao carregar eventos:", error);
                
                // Adicionar eventos estáticos em caso de falha
                const eventosEstaticos = [
                    { id: 1, nome: "Avaliação 1º Semestre 2023" },
                    { id: 2, nome: "Avaliação 2º Semestre 2023" }
                ];
                
                eventosEstaticos.forEach(evento => {
                    const option = document.createElement('option');
                    option.value = evento.id;
                    option.textContent = evento.nome;
                    elementos.eventoSelect.appendChild(option);
                });
                
                console.log("Eventos estáticos carregados como fallback");
            });
    }
    
    // ==========================================
    // MANIPULADORES DE EVENTOS (EVENT HANDLERS)
    // ==========================================
    
    /**
     * Manipulador do evento de mudança na seleção de escola
     */
    function handleEscolaChange() {
        const escolaId = parseInt(this.value);
        console.log(`Escola selecionada: ID ${escolaId}`);
        
        if (escolaId) {
            // Carregar turmas da escola selecionada
            carregarTurmasDaEscola(escolaId);
        } else {
            // Limpar turmas e recarregar todos os alunos
            elementos.turmaSelect.innerHTML = '<option value="">Selecione uma turma</option>';
            carregarTodosAlunos();
        }
    }
    
    /**
     * Manipulador do evento de mudança na seleção de turma
     */
    function handleTurmaChange() {
        const turmaId = parseInt(this.value);
        console.log(`Turma selecionada: ID ${turmaId}`);
        
        if (turmaId) {
            // Carregar alunos da turma selecionada
            carregarAlunosDaTurma(turmaId);
            
            // Determinar a faixa de série com base na turma
            determinarFaixaSerie(turmaId);
        } else {
            // Se nenhuma turma for selecionada, mas há escola
            const escolaId = parseInt(elementos.escolaSelect.value);
            if (escolaId) {
                // Recarregar todos os alunos da escola
                carregarTodosAlunos();
            }
        }
    }
    
    /**
     * Manipulador do evento de mudança na seleção de aluno
     */
    function handleAlunoChange() {
        const alunoId = parseInt(this.value);
        console.log(`Aluno selecionado: ID ${alunoId}`);
        
        if (alunoId) {
            // Carregar informações detalhadas do aluno se necessário
            carregarDetalhesAluno(alunoId);
        }
    }
    
    /**
     * Determina a faixa de série com base na turma
     * @param {number} turmaId - ID da turma selecionada
     */
    function determinarFaixaSerie(turmaId) {
        // Buscar informações da turma para determinar a faixa de série
        fetch(`${API_BASE_URL}/classes/${turmaId}`, { headers })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Erro ao buscar detalhes da turma: ${response.status}`);
                }
                return response.json();
            })
            .then(turma => {
                console.log("Detalhes da turma recebidos:", turma);
                
                // Extrair o número da série
                const serie = turma.grade || turma.serie || turma.class_grade || '';
                const match = serie.match(/\d+/);
                let numeroSerie = 1; // valor padrão
                
                if (match && match[0]) {
                    numeroSerie = parseInt(match[0]);
                } else {
                    console.log("Não foi possível extrair o número da série:", serie);
                }
                
                // Determinar a faixa
                if (numeroSerie <= 2) {
                    estado.faixaSerie = "1-2";
                } else if (numeroSerie <= 5) {
                    estado.faixaSerie = "3-5";
                } else {
                    estado.faixaSerie = "6-9";
                }
                
                console.log(`Faixa de série determinada: ${estado.faixaSerie} (Série: ${serie}, Número: ${numeroSerie})`);
            })
            .catch(error => {
                console.error("Erro ao determinar faixa de série:", error);
                // Usar um valor padrão em caso de erro
                estado.faixaSerie = "1-2";
            });
    }
    
    /**
     * Carrega detalhes de um aluno específico
     * @param {number} alunoId - ID do aluno selecionado
     */
    function carregarDetalhesAluno(alunoId) {
        fetch(`${API_BASE_URL}/students/${alunoId}`, { headers })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Erro ao buscar detalhes do aluno: ${response.status}`);
                }
                return response.json();
            })
            .then(aluno => {
                console.log("Detalhes do aluno recebidos:", aluno);
                
                // Armazenar o aluno no estado da aplicação
                estado.alunoAtual = aluno;
                
                // Se a turma do aluno for diferente da selecionada, atualizar
                const turmaAluno = aluno.class_id || aluno.turma_id;
                if (turmaAluno && turmaAluno !== parseInt(elementos.turmaSelect.value)) {
                    console.log(`Atualizando turma para a do aluno: ${turmaAluno}`);
                    elementos.turmaSelect.value = turmaAluno;
                    
                    // Se a turma tem escola, atualizar
                    if (aluno.school_id || aluno.escola_id) {
                        const escolaAluno = aluno.school_id || aluno.escola_id;
                        elementos.escolaSelect.value = escolaAluno;
                    }
                }
            })
            .catch(error => {
                console.error("Erro ao carregar detalhes do aluno:", error);
            });
    }
    
    /**
     * Inicia uma nova avaliação com os dados selecionados
     */
    function iniciarAvaliacao() {
        // Validar seleções
        const alunoId = parseInt(elementos.alunoSelect.value);
        const eventoId = parseInt(elementos.eventoSelect.value);
        
        if (!alunoId || !eventoId) {
            alert("Por favor, selecione um aluno e um evento de avaliação para continuar.");
            return;
        }
        
        console.log(`Iniciando avaliação: Aluno ID ${alunoId}, Evento ID ${eventoId}`);
        
        // Obter prova correspondente à faixa de série do aluno
        obterProvaCorrespondente().then(prova => {
            if (!prova) {
                alert("Não foi possível encontrar uma prova adequada para o aluno selecionado.");
                return;
            }
            
            console.log("Prova selecionada:", prova);
            
            // Buscar detalhes da avaliação
            buscarDetalhesAvaliacao(eventoId, prova.id)
                .then(detalhes => {
                    if (!detalhes) {
                        alert("Não foi possível carregar os detalhes da avaliação.");
                return;
                    }
                    
                    console.log("Detalhes da avaliação carregados:", detalhes);
                    
                    // Armazenar dados da avaliação no estado
                    estado.avaliacaoAtual = detalhes;
                    
                    // Preparar primeira etapa
                    prepararEtapaPalavras();
                    
                    // Mostrar etapa de palavras
                    Object.values(elementos.containers).forEach(container => {
                        if (container) container.classList.add('hidden');
                    });
                    elementos.etapaPalavras.classList.remove('hidden');
                    
                    console.log("Avaliação iniciada com sucesso");
                })
                .catch(error => {
                    console.error("Erro ao iniciar avaliação:", error);
                    alert("Ocorreu um erro ao iniciar a avaliação. Por favor, tente novamente.");
                });
        });
    }
    
    /**
     * Obtém a prova correspondente à faixa de série do aluno
     * @returns {Promise<Object>} Promessa que resolve para o objeto da prova
     */
    function obterProvaCorrespondente() {
        return new Promise((resolve, reject) => {
            fetch(`${API_BASE_URL}/reading-tests`, { headers })
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`Erro ao buscar provas: ${response.status}`);
                    }
                    return response.json();
                })
                .then(data => {
                    console.log("Dados de provas recebidos:", data);
                    
                    // Processar dados (considerando diferentes formatos possíveis)
                    const provas = Array.isArray(data) ? data : (data.tests || []);
                    
                    // Encontrar a prova correspondente à faixa de série
                    const provaCorrespondente = provas.find(prova => {
                        const niveisProva = prova.grade_range || prova.niveis || [];
                        return Array.isArray(niveisProva) 
                            ? niveisProva.includes(estado.faixaSerie)
                            : niveisProva === estado.faixaSerie;
                    });
                    
                    if (provaCorrespondente) {
                        resolve(provaCorrespondente);
            } else {
                        console.warn("Nenhuma prova encontrada para a faixa de série:", estado.faixaSerie);
                        
                        // Usar dados estáticos como fallback
                        const provasEstaticas = [
                            { id: 1, nome: "Prova de Leitura - Básico", niveis: ["1-2"] },
                            { id: 2, nome: "Prova de Leitura - Intermediário", niveis: ["3-5"] },
                            { id: 3, nome: "Prova de Leitura - Avançado", niveis: ["6-9"] }
                        ];
                        
                        const provaEstatica = provasEstaticas.find(prova => 
                            prova.niveis.includes(estado.faixaSerie)
                        );
                        
                        resolve(provaEstatica);
                    }
                })
                .catch(error => {
                    console.error("Erro ao obter prova correspondente:", error);
                    
                    // Usar dados estáticos como fallback
                    const provasEstaticas = [
                        { id: 1, nome: "Prova de Leitura - Básico", niveis: ["1-2"] },
                        { id: 2, nome: "Prova de Leitura - Intermediário", niveis: ["3-5"] },
                        { id: 3, nome: "Prova de Leitura - Avançado", niveis: ["6-9"] }
                    ];
                    
                    const provaEstatica = provasEstaticas.find(prova => 
                        prova.niveis.includes(estado.faixaSerie || "1-2")
                    );
                    
                    resolve(provaEstatica);
                });
        });
    }
    
    /**
     * Busca os detalhes de uma avaliação específica
     * @param {number} eventoId - ID do evento de avaliação
     * @param {number} provaId - ID da prova
     * @returns {Promise<Object>} Promessa que resolve para o objeto com detalhes da avaliação
     */
    function buscarDetalhesAvaliacao(eventoId, provaId) {
        return new Promise((resolve, reject) => {
            fetch(`${API_BASE_URL}/assessment-events/${eventoId}/tests/${provaId}`, { headers })
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`Erro ao buscar detalhes da avaliação: ${response.status}`);
                    }
                    return response.json();
                })
                .then(detalhes => {
                    console.log("Detalhes da avaliação recebidos:", detalhes);
                    resolve(detalhes);
                })
                .catch(error => {
                    console.error("Erro ao buscar detalhes da avaliação:", error);
                    
                    // Usar dados estáticos como fallback
                    const avaliacoesEstaticas = [
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
                            ]
                        }
                    ];
                    
                    const avaliacaoEstatica = avaliacoesEstaticas.find(a => a.id === eventoId);
                    
                    if (avaliacaoEstatica) {
                        resolve(avaliacaoEstatica);
                    } else {
                        resolve(avaliacoesEstaticas[0]);
                    }
                });
        });
    }
}); 