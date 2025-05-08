/**
 * Script para gerenciar os filtros relacionados de escola, turma e aluno
 * Implementa relações hierárquicas entre as seleções de filtros
 * Usa as seguintes rotas de API:
 * - Escolas: /schools
 * - Turmas: /class-groups
 * - Alunos: /students
 * - Eventos: /assessment-events
 * - Testes: obtidos da resposta de eventos (assessments)
 */
(function () {
    const selectEvento = document.getElementById('evento-avaliacao');
    const selectTeste = document.getElementById('teste-leitura');

    // Cache de dados para evitar múltiplas requisições à API
    const dadosCache = {
        escolas: null,
        turmas: null,
        alunos: null,
        eventos: null,
        testes: null
    };

    // Dados de exemplo para os filtros (fallback caso a API falhe)
    // const ESCOLAS = [
    //     { id: 1, name: "Escola Municipal Presidente Vargas" },
    //     { id: 2, name: "Escola Estadual Paulo Freire" },
    //     { id: 3, name: "Escola Municipal Machado de Assis" }
    // ];

    // const TURMAS = [
    //     { id: 1, name: "1º Ano A", schoolId: 1 },
    //     { id: 2, name: "2º Ano B", schoolId: 1 },
    //     { id: 3, name: "3º Ano C", schoolId: 1 },
    //     { id: 4, name: "1º Ano A", schoolId: 2 },
    //     { id: 5, name: "2º Ano A", schoolId: 2 },
    //     { id: 6, name: "1º Ano A", schoolId: 3 },
    //     { id: 7, name: "1º Ano B", schoolId: 3 }
    // ];

    // const ALUNOS = [
    //     { id: 1, name: "Ana Silva", classGroupId: 1 },
    //     { id: 2, name: "Bruno Oliveira", classGroupId: 1 },
    //     { id: 3, name: "Carla Santos", classGroupId: 1 },
    //     { id: 4, name: "Daniel Pereira", classGroupId: 2 },
    //     { id: 5, name: "Eduarda Lima", classGroupId: 2 },
    //     { id: 6, name: "Felipe Souza", classGroupId: 3 },
    //     { id: 7, name: "Gabriela Costa", classGroupId: 3 },
    //     { id: 8, name: "Henrique Almeida", classGroupId: 4 },
    //     { id: 9, name: "Isabella Martins", classGroupId: 4 },
    //     { id: 10, name: "João Pedro", classGroupId: 5 },
    //     { id: 11, name: "Karina Ferreira", classGroupId: 5 },
    //     { id: 12, name: "Lucas Ribeiro", classGroupId: 6 },
    //     { id: 13, name: "Maria Clara", classGroupId: 6 },
    //     { id: 14, name: "Nicolas Gomes", classGroupId: 7 },
    //     { id: 15, name: "Olívia Rodrigues", classGroupId: 7 }
    // ];

    // Carregar os dados quando o DOM estiver pronto
    document.addEventListener('DOMContentLoaded', function () {
        console.log('Carregando filtros relacionados...');

        // Verificar se o serviço de API está disponível
        const usarAPI = typeof ApiService !== 'undefined';
        console.log('Usando API:', usarAPI);

        if (usarAPI) {
            // Carregar todos os dados necessários para os filtros
            carregarDadosAPI();
        } else {
            // Inicializar com dados locais
            inicializarComDadosLocais();
        }

        // Adicionar eventos para relacionamento entre os filtros
        adicionarEventos();
    });

    /**
     * Carrega todos os dados necessários da API
     */
    async function carregarDadosAPI() {
        try {
            // 1. Carregar escolas - rota /schools
            const escolas = await ApiService.escolas.getAll();
            dadosCache.escolas = escolas;
            carregarEscolas();

            // Os outros dados serão carregados conforme necessário
            console.log('Escolas carregadas com sucesso:', escolas.length);
        } catch (error) {
            console.error('Erro ao carregar dados iniciais:', error);
            // Fallback para dados locais em caso de erro
            inicializarComDadosLocais();
        }
    }

    /**
     * Inicializa os filtros com dados locais
     */
    function inicializarComDadosLocais() {
        dadosCache.escolas = ESCOLAS;
        dadosCache.turmas = TURMAS;
        dadosCache.alunos = ALUNOS;

        carregarEscolas();

        console.log('Filtros inicializados com dados locais');
    }

    /**
     * Carrega as escolas no select correspondente (usando dados do cache)
     */
    function carregarEscolas() {
        const selectEscola = document.getElementById('escola');
        if (!selectEscola) return;

        // Limpar opções existentes
        selectEscola.innerHTML = '<option value="">Selecione uma escola</option>';

        // Verificar se temos dados no cache
        if (!dadosCache.escolas || !dadosCache.escolas.length) {
            selectEscola.innerHTML = '<option value="">Nenhuma escola encontrada</option>';
            return;
        }

        // Adicionar escolas
        dadosCache.escolas.forEach(escola => {
            const option = document.createElement('option');
            option.value = escola.id;
            option.textContent = escola.name;
            selectEscola.appendChild(option);
        });

        console.log('Escolas carregadas do cache:', dadosCache.escolas.length);
    }

    /**
     * Carrega todas as turmas da API (usando rota /class-groups)
     */
    async function carregarTurmasAPI() {
        try {
            // Buscar turmas da API - rota /class-groups
            const turmas = await ApiService.turmas.getAll();

            // Armazenar no cache
            dadosCache.turmas = turmas;

            console.log('Turmas carregadas da API:', turmas.length);
            return turmas;
        } catch (error) {
            console.error('Erro ao carregar turmas da API:', error);

            // Em caso de erro, usar dados de exemplo
            dadosCache.turmas = TURMAS;
            console.warn('Usando dados de exemplo para turmas');
            return TURMAS;
        }
    }

    /**
     * Carrega todos os alunos da API (usando rota /students)
     */
    async function carregarAlunosAPI() {
        try {
            // Buscar alunos da API - rota /students
            const alunos = await ApiService.alunos.getAll();

            // Armazenar no cache
            dadosCache.alunos = alunos;

            console.log('Alunos carregados da API:', alunos.length);
            return alunos;
        } catch (error) {
            console.error('Erro ao carregar alunos da API:', error);

            // Em caso de erro, usar dados de exemplo
            dadosCache.alunos = ALUNOS;
            console.warn('Usando dados de exemplo para alunos');
            return ALUNOS;
        }
    }

    /**
     * Carrega os eventos e testes
     * Eventos: rota /assessment-events
     * Testes: extraídos da resposta de eventos (assessments)
     */
    async function carregarEventosETestesAPI() {
        if (!selectEvento || !selectTeste) return;

        // Limpar opções existentes
        selectEvento.innerHTML = '<option value="">Carregando eventos...</option>';
        selectTeste.innerHTML = '<option value="">Aguardando evento...</option>';

        selectEvento.disabled = true;
        selectTeste.disabled = true;

        try {
            // Buscar todos os eventos de avaliação - rota /assessment-events
            const eventos = await ApiService.eventosAvaliacao.getAll();
            dadosCache.eventos = eventos;

            console.log('Eventos carregados da API:', eventos.length);

            // Limpar e preencher o select de eventos
            selectEvento.innerHTML = '<option value="">Selecione um evento</option>';
            dadosCache.eventos.forEach(evento => {
                const opt = new Option(evento.name || `Evento ${evento.id}`, evento.id);
                selectEvento.appendChild(opt);
            });

            // Configurar evento de change no select de eventos
            selectEvento.addEventListener('change', function() {
                const eventoId = Number(this.value);
                
                // Se não selecionou nenhum evento, limpar e desabilitar o select de testes
                if (!eventoId) {
                    selectTeste.innerHTML = '<option value="">Selecione um evento primeiro</option>';
                    selectTeste.disabled = true;
                    return;
                }
                
                try {
                    // Encontrar o evento selecionado
                    const eventoSelecionado = dadosCache.eventos.find(e => e.id === eventoId);
                    if (!eventoSelecionado) {
                        throw new Error(`Evento ID ${eventoId} não encontrado no cache`);
                    }
                    
                    // Verificar se o evento tem assessments
                    if (!eventoSelecionado.assessments || !eventoSelecionado.assessments.length) {
                        selectTeste.innerHTML = '<option value="">Nenhum teste disponível para este evento</option>';
                        selectTeste.disabled = true;
                        return;
                    }
                    
                    // Carregar os testes associados a este evento
                    carregarTestes(eventoSelecionado.assessments);
                } catch (error) {
                    console.error('Erro ao carregar testes para o evento:', error);
                    selectTeste.innerHTML = '<option value="">Erro ao carregar testes</option>';
                    selectTeste.disabled = true;
                }
            });

            // Inicialmente desabilitar o select de testes até que um evento seja selecionado
            selectTeste.innerHTML = '<option value="">Selecione um evento primeiro</option>';
            selectTeste.disabled = true;
            
            // Habilitar o select de eventos
            selectEvento.disabled = false;
        } catch (error) {
            console.error(`Erro ao carregar eventos e testes:`, error);

            // Em caso de erro, limpar selects
            selectEvento.innerHTML = '<option value="">Erro ao carregar eventos</option>';
            selectTeste.innerHTML = '<option value="">Selecione um evento primeiro</option>';

            // Adicionar alerta de erro
            selectEvento.innerHTML += '<option value="" disabled style="color: red">⚠️ Erro ao carregar dados</option>';
        }
    }
    
    /**
     * Carrega os testes associados a um evento de avaliação
     * @param {Array} testes - Lista de testes (assessments) do evento
     */
    function carregarTestes(testes) {
        if (!selectTeste) return;
        
        // Limpar opções existentes
        selectTeste.innerHTML = '<option value="">Selecione um teste</option>';
        
        // Verificar se há testes disponíveis
        if (!testes || !testes.length) {
            selectTeste.innerHTML = '<option value="">Nenhum teste disponível</option>';
            selectTeste.disabled = true;
            return;
        }
        
        // Adicionar opção para cada teste
        testes.forEach(teste => {
            const option = document.createElement('option');
            option.value = teste.id;
            option.textContent = teste.name || `Teste ${teste.id}`;
            
            // Adicionar metadados úteis como data attributes
            if (teste.gradeRange) option.dataset.gradeRange = teste.gradeRange;
            if (teste.totalWords) option.dataset.totalWords = teste.totalWords;
            if (teste.totalPseudowords) option.dataset.totalPseudowords = teste.totalPseudowords;
            
            selectTeste.appendChild(option);
        });
        
        // Habilitar o select de testes
        selectTeste.disabled = false;
        
        console.log(`${testes.length} testes carregados para o evento selecionado`);
    }

    /**
     * Carrega as turmas filtradas por escola no select
     * @param {number} escolaId - ID da escola selecionada
     */
    function carregarTurmasFiltradas(escolaId) {
        const selectTurma = document.getElementById('turma');
        if (!selectTurma) return;

        // Limpar opções existentes
        selectTurma.innerHTML = '<option value="">Selecione uma turma</option>';

        // Se não tiver escola selecionada, desabilitar o select
        if (!escolaId) {
            selectTurma.disabled = true;
            return;
        }

        // Se não temos turmas em cache, carregá-las da API
        if (!dadosCache.turmas || !dadosCache.turmas.length) {
            carregarTurmasAPI().then(turmas => {
                if (turmas && turmas.length > 0) {
                    carregarTurmasFiltradas(escolaId);
                }
            });
            return;
        }

        // Filtrar turmas da escola selecionada usando a função do ApiService
        const turmasFiltradas = ApiService.turmas.filtrarPorEscola(escolaId, dadosCache.turmas);

        // Se não encontrou turmas para a escola
        if (!turmasFiltradas.length) {
            selectTurma.innerHTML = '<option value="">Nenhuma turma encontrada para esta escola</option>';
            selectTurma.disabled = true;
            return;
        }

        // Adicionar turmas filtradas
        turmasFiltradas.forEach(turma => {
            const option = document.createElement('option');
            option.value = turma.id;
            option.textContent = turma.name;
            selectTurma.appendChild(option);
        });

        // Habilitar o select
        selectTurma.disabled = false;

        console.log(`Turmas carregadas para escola ${escolaId}:`, turmasFiltradas.length);
    }

    /**
     * Carrega os alunos filtrados por turma no select
     * @param {number} turmaId - ID da turma selecionada
     */
    function carregarAlunosFiltrados(turmaId) {
        const selectAluno = document.getElementById('aluno');
        if (!selectAluno) return;

        // Limpar opções existentes
        selectAluno.innerHTML = '<option value="">Selecione um aluno</option>';

        // Se não tiver turma selecionada, desabilitar o select
        if (!turmaId) {
            selectAluno.disabled = true;
            return;
        }

        // Se não temos alunos em cache, carregá-los da API
        if (!dadosCache.alunos || !dadosCache.alunos.length) {
            carregarAlunosAPI().then(alunos => {
                if (alunos && alunos.length > 0) {
                    carregarAlunosFiltrados(turmaId);
                }
            });
            return;
        }

        // Filtrar alunos da turma selecionada usando a função do ApiService
        const alunosFiltrados = ApiService.alunos.filtrarPorTurma(turmaId, dadosCache.alunos);

        // Se não encontrou alunos para a turma
        if (!alunosFiltrados.length) {
            selectAluno.innerHTML = '<option value="">Nenhum aluno encontrado para esta turma</option>';
            selectAluno.disabled = true;
            return;
        }

        // Adicionar alunos filtrados
        alunosFiltrados.forEach(aluno => {
            const option = document.createElement('option');
            option.value = aluno.id;
            option.textContent = aluno.name;
            selectAluno.appendChild(option);
        });

        // Habilitar o select
        selectAluno.disabled = false;

        console.log(`Alunos carregados para turma ${turmaId}:`, alunosFiltrados.length);
    }

    /**
     * Carrega os eventos de avaliação no select
     * @param {Array} eventos - Lista de eventos
     */
    function carregarEventosAvaliacao(eventos) {
        if (!selectEvento) return;

        // Limpar opções existentes
        selectEvento.innerHTML = '<option value="">Selecione um evento</option>';

        // Verificar se há eventos
        if (!eventos || !eventos.length) {
            selectEvento.innerHTML = '<option value="">Nenhum evento disponível</option>';
            selectEvento.disabled = true;
            return;
        }

        // Adicionar eventos
        eventos.forEach(evento => {
            const option = document.createElement('option');
            option.value = evento.id;

            // Buscar nome do evento com compatibilidade para diferentes formatos
            const nomeEvento = evento.name || evento.title || evento.description || `Evento ${evento.id}`;
            option.textContent = nomeEvento;

            // Armazenar dados adicionais como atributos de dados
            if (evento.date) option.dataset.date = evento.date;
            if (evento.assessmentIds) option.dataset.assessmentIds = JSON.stringify(evento.assessmentIds);
            
            // Armazenar a quantidade de testes associados
            const numTestes = evento.assessments ? evento.assessments.length : 0;
            option.dataset.numTestes = numTestes;
            
            selectEvento.appendChild(option);
        });

        // Habilitar o select
        selectEvento.disabled = false;

        console.log('Eventos carregados:', eventos.length);
        
        // Configurar evento de mudança para atualizar o select de testes
        selectEvento.addEventListener('change', function() {
            const eventoId = Number(this.value);
            carregarTestesLeitura(eventoId);
        });
    }

    /**
     * Carrega os testes de leitura baseados no evento selecionado
     * @param {string|number} eventoId - ID do evento selecionado
     */
    function carregarTestesLeitura(eventoId) {
        if (!selectTeste) return;

        // Limpar opções existentes
        selectTeste.innerHTML = '<option value="">Selecione um teste</option>';

        // Se não tiver evento selecionado
        if (!eventoId) {
            selectTeste.innerHTML = '<option value="">Selecione um evento primeiro</option>';
            selectTeste.disabled = true;
            return;
        }
        
        // Converter para número para garantir comparação correta
        const eventoIdNum = Number(eventoId);
        
        try {
            // Encontrar o evento selecionado nos dados em cache
            const eventoSelecionado = dadosCache.eventos.find(e => e.id === eventoIdNum);
            
            if (!eventoSelecionado) {
                throw new Error(`Evento ID ${eventoIdNum} não encontrado no cache`);
            }
            
            // Verificar se o evento tem assessments/testes
            if (!eventoSelecionado.assessments || !eventoSelecionado.assessments.length) {
                selectTeste.innerHTML = '<option value="">Nenhum teste disponível para este evento</option>';
                selectTeste.disabled = true;
                return;
            }
            
            // Usar a função auxiliar para carregar os testes
            carregarTestes(eventoSelecionado.assessments);
            
        } catch (error) {
            console.error('Erro ao carregar testes para o evento:', error);
            selectTeste.innerHTML = '<option value="">Erro ao carregar testes</option>';
            selectTeste.disabled = true;
        }
    }

    /**
     * Adiciona eventos para relacionamento entre os filtros
     */
    function adicionarEventos() {
        // Quando selecionar uma escola, carregar turmas correspondentes
        const selectEscola = document.getElementById('escola');
        if (selectEscola) {
            selectEscola.addEventListener('change', function () {
                const escolaId = this.value;
                carregarTurmasFiltradas(escolaId);

                // Limpar e desabilitar dependentes
                const selectAluno = document.getElementById('aluno');
                const selectEvento = document.getElementById('evento-avaliacao');
                const selectTeste = document.getElementById('teste-leitura');

                if (selectAluno) {
                    selectAluno.innerHTML = '<option value="">Selecione uma turma primeiro</option>';
                    selectAluno.disabled = true;
                }

                if (selectEvento) {
                    selectEvento.innerHTML = '<option value="">Selecione um aluno primeiro</option>';
                    selectEvento.disabled = true;
                }

                if (selectTeste) {
                    selectTeste.innerHTML = '<option value="">Selecione um evento primeiro</option>';
                    selectTeste.disabled = true;
                }
            });
        }

        // Quando selecionar uma turma, carregar alunos correspondentes
        const selectTurma = document.getElementById('turma');
        if (selectTurma) {
            selectTurma.addEventListener('change', function () {
                const turmaId = this.value;
                carregarAlunosFiltrados(turmaId);

                // Limpar selects dependentes
                const selectEvento = document.getElementById('evento-avaliacao');
                const selectTeste = document.getElementById('teste-leitura');

                if (selectEvento) {
                    selectEvento.innerHTML = '<option value="">Selecione um aluno primeiro</option>';
                    selectEvento.disabled = true;
                }

                if (selectTeste) {
                    selectTeste.innerHTML = '<option value="">Selecione um evento primeiro</option>';
                    selectTeste.disabled = true;
                }
            });
        }

        // Quando selecionar um aluno, carregar eventos e testes
        const selectAluno = document.getElementById('aluno');
        if (selectAluno) {
            selectAluno.addEventListener('change', async function () {
                const alunoId = this.value;

                if (alunoId) {
                    // Carregar eventos e testes
                    await carregarEventosETestesAPI();
                } else {
                    // Limpar selects dependentes
                    const selectEvento = document.getElementById('evento-avaliacao');
                    const selectTeste = document.getElementById('teste-leitura');

                    if (selectEvento) {
                        selectEvento.innerHTML = '<option value="">Selecione um aluno primeiro</option>';
                        selectEvento.disabled = true;
                    }

                    if (selectTeste) {
                        selectTeste.innerHTML = '<option value="">Selecione um evento primeiro</option>';
                        selectTeste.disabled = true;
                    }
                }
            });
        }

        // Quando selecionar um evento, carregar testes associados
        const selectEvento = document.getElementById('evento-avaliacao');
        console.log(selectEvento);
        if (selectEvento) {
            selectEvento.addEventListener('change', function () {
                const eventoId = this.value;
                carregarTestesLeitura(eventoId);
            });
        }

        // Inicialmente, desabilitar os selects que dependem de seleção anterior
        const selectTurmaInicial = document.getElementById('turma');
        const selectAlunoInicial = document.getElementById('aluno');
        const selectEventoInicial = document.getElementById('evento-avaliacao');
        const selectTesteInicial = document.getElementById('teste-leitura');

        if (selectTurmaInicial) selectTurmaInicial.disabled = true;
        if (selectAlunoInicial) selectAlunoInicial.disabled = true;
        if (selectEventoInicial) selectEventoInicial.disabled = true;
        if (selectTesteInicial) selectTesteInicial.disabled = true;
    }

    /**
     * Configura o botão de iniciar avaliação para validar os campos preenchidos
     */
    function configurarBotaoIniciar() {
        const btnIniciar = document.getElementById('iniciar-avaliacao');
        if (!btnIniciar) return;

        btnIniciar.addEventListener('click', function (e) {
            // Verificar se todos os campos obrigatórios estão preenchidos
            const aluno = document.getElementById('aluno').value;
            const evento = document.getElementById('evento-avaliacao').value;
            const teste = document.getElementById('teste-leitura').value;

            if (!aluno || !evento || !teste) {
                e.preventDefault();
                alert('Por favor, preencha todos os campos obrigatórios: Aluno, Evento de Avaliação e Teste de Leitura.');
                return false;
            }

            // Armazenar os valores selecionados para uso posterior
            try {
                // Obter texto selecionado para armazenar
                const alunoNome = document.getElementById('aluno').options[document.getElementById('aluno').selectedIndex].text;
                const eventoNome = document.getElementById('evento-avaliacao').options[document.getElementById('evento-avaliacao').selectedIndex].text;
                const testeNome = document.getElementById('teste-leitura').options[document.getElementById('teste-leitura').selectedIndex].text;

                localStorage.setItem('alunoSelecionado', JSON.stringify({
                    id: aluno,
                    nome: alunoNome
                }));

                localStorage.setItem('avaliacaoIniciada', JSON.stringify({
                    aluno: { id: aluno, nome: alunoNome },
                    evento: { id: evento, nome: eventoNome },
                    teste: { id: teste, nome: testeNome },
                    dataInicio: new Date().toISOString()
                }));

                console.log('Dados da avaliação armazenados no localStorage');
            } catch (error) {
                console.error('Erro ao armazenar dados:', error);
            }

            // Continuar com a execução normal
            console.log('Avaliação iniciada com Aluno:', aluno, 'Evento:', evento, 'Teste:', teste);
        });
    }

    // Configurar validações de iniciar avaliação quando o DOM estiver pronto
    document.addEventListener('DOMContentLoaded', configurarBotaoIniciar);
})(); 