/**
 * Mapeia os dados da avaliação da API para o formato utilizado na aplicação
 * @param {Object} avaliacaoAPI - Objeto da avaliação retornado pela API
 * @returns {Object} Objeto da avaliação no formato utilizado pela aplicação
 */
function mapearAvaliacao(avaliacaoAPI) {
    // Se a entrada for um array, usar o primeiro item
    const avaliacao = Array.isArray(avaliacaoAPI) ? avaliacaoAPI[0] : avaliacaoAPI;
    console.log('🚀 avaliacao:', avaliacao);

    if (!avaliacao) {
        console.error("Dados de avaliação inválidos");
        return null;
    }

    // Mapear o objeto para o formato esperado pela aplicação
    return {
        id: avaliacao.id,
        studentId: avaliacao.studentId,
        student: avaliacao.student ? {
            id: avaliacao.student.id,
            name: avaliacao.student.name,
            registrationNumber: avaliacao.student.registrationNumber
        } : null,
        assessmentEventId: avaliacao.assessmentEventId,
        assessmentEvent: avaliacao.assessmentEvent ? {
            id: avaliacao.assessmentEvent.id,
            name: avaliacao.assessmentEvent.name,
            status: avaliacao.assessmentEvent.status
        } : null,
        readingTestId: avaliacao.readingTestId,
        readingTest: avaliacao.readingTest ? {
            id: avaliacao.readingTest.id,
            name: avaliacao.readingTest.name,
            gradeRange: avaliacao.readingTest.gradeRange,
            // Adicionar os itens para avaliação de leitura
            words: gerarLista(40, "palavras"), // Lista de palavras (mock se não existir)
            pseudowords: gerarLista(30, "pseudopalavras"), // Lista de pseudopalavras (mock se não existir)
            sentences: gerarLista(10, "frases", true), // Lista de frases (mock se não existir)
            text: gerarTextoMock() // Texto para leitura (mock se não existir)
        } : null,
        date: avaliacao.date || new Date().toISOString(),
        wordsRead: avaliacao.wordsRead || 0,
        wordsTotal: avaliacao.wordsTotal || 40,
        pseudowordsRead: avaliacao.pseudowordsRead || 0,
        pseudowordsTotal: avaliacao.pseudowordsTotal || 30,
        sentencesRead: avaliacao.sentencesRead || 0,
        sentencesTotal: avaliacao.sentencesTotal || 10,
        textLinesRead: avaliacao.textLinesRead || 0,
        textLinesTotal: avaliacao.textLinesTotal || 15,
        readingLevel: avaliacao.readingLevel || "WORD_READER",
        ppm: avaliacao.ppm || 0,
        completed: avaliacao.completed || false,
        completedStages: avaliacao.completedStages || [],
        answers: avaliacao.answers || [],
        createdAt: avaliacao.createdAt || new Date().toISOString(),
        updatedAt: avaliacao.updatedAt || new Date().toISOString()
    };
}

/**
 * Gera uma lista de palavras, pseudopalavras ou frases para mock de dados
 * @param {number} quantidade - Quantidade de itens a gerar
 * @param {string} tipo - Tipo de lista ('palavras', 'pseudopalavras' ou 'frases')
 * @param {boolean} frases - Indica se deve gerar frases completas
 * @returns {Array} Lista de itens gerados
 */
function gerarLista(quantidade, tipo, frases = false) {
    // Listas de exemplo para cada tipo
    const exemplosPalavras = [
        "casa", "bola", "gato", "mesa", "livro", "pato", "fogo", "roda", "vela", "mala",
        "lobo", "rato", "sapo", "faca", "pipa", "dedo", "moto", "suco", "bota", "lua",
        "pele", "cama", "papel", "terra", "água", "boca", "ponte", "porta", "rede", "sol",
        "folha", "vento", "nuvem", "chuva", "praia", "vidro", "barco", "peixe", "rosa", "dente"
    ];

    const exemplosPseudopalavras = [
        "dalu", "fema", "pilo", "sati", "beco", "vota", "mipe", "catu", "lemi", "rano",
        "bagi", "pute", "seco", "vilo", "fota", "zema", "neri", "joba", "tibe", "cuna",
        "larpo", "bestu", "pilda", "vamil", "torpa", "sertu", "ganso", "finpo", "melfa", "darno"
    ];

    const exemplosFrases = [
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
    ];

    // Escolher a lista de exemplos apropriada
    let exemplos;
    if (frases) {
        exemplos = exemplosFrases;
    } else if (tipo === 'pseudopalavras') {
        exemplos = exemplosPseudopalavras;
    } else {
        exemplos = exemplosPalavras;
    }

    // Verificar se temos exemplos suficientes
    if (exemplos.length < quantidade) {
        // Repetir exemplos se necessário
        const repeticoes = Math.ceil(quantidade / exemplos.length);
        const listaExpandida = [];
        for (let i = 0; i < repeticoes; i++) {
            listaExpandida.push(...exemplos);
        }
        exemplos = listaExpandida;
    }

    // Retornar a quantidade solicitada
    return exemplos.slice(0, quantidade);
}

/**
 * Gera um texto para mock de dados
 * @returns {string} Texto gerado para leitura
 */
function gerarTextoMock() {
    return "A menina de cabelos dourados caminhava pela floresta. Era uma linda manhã de primavera, e as flores coloridas enfeitavam o caminho. Ela carregava uma cesta com frutas frescas para sua avó. O sol brilhava entre as folhas das árvores, criando sombras dançantes no chão. Enquanto andava, a menina cantarolava uma doce melodia que sua mãe lhe ensinou. Os pássaros, encantados com a canção, acompanhavam com seus trinados. De repente, ela encontrou um pequeno coelho branco parado no meio da trilha. Seus olhos eram vermelhos como rubis e suas orelhas compridas tremiam levemente. A menina sorriu e ofereceu uma cenoura da sua cesta. O coelho hesitou por um momento, mas logo aceitou o presente, pegando a cenoura com suas patas dianteiras. Agradecido, ele saltitou ao lado da menina por um tempo, como se quisesse fazer companhia. Mais adiante, encontraram um riacho de águas cristalinas. A menina parou para beber um pouco de água fresca e descansar sob a sombra de um grande carvalho.";
}

// Sistema de Avaliação de Leitura e Fluência
// Módulo para mapear dados de avaliação da API para as etapas no HTML

document.addEventListener('DOMContentLoaded', function () {
    // API Base URL
    const API_BASE_URL = "https://api.salf.maximizaedu.com/api";

    // Token de autenticação
    const token = localStorage.getItem('token');
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
    };

    // Elementos do DOM para as etapas
    const etapasDOM = {
        // Containers
        palavras: document.getElementById('etapa-palavras'),
        pseudopalavras: document.getElementById('etapa-pseudopalavras'),
        frases: document.getElementById('etapa-frases'),
        texto: document.getElementById('etapa-texto'),
        resultado: document.getElementById('etapa-resultado'),

        // Grids e containers
        gridPalavras: document.querySelector('#etapa-palavras .grid'),
        gridPseudopalavras: document.querySelector('#etapa-pseudopalavras .grid'),
        containerFrases: document.getElementById('frases-container'),
        containerTexto: document.getElementById('texto-container'),

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

    // Botão para iniciar a avaliação
    const btnIniciarAvaliacao = document.getElementById('iniciar-avaliacao');
    if (btnIniciarAvaliacao) {
        btnIniciarAvaliacao.addEventListener('click', iniciarAvaliacao);
    }

    // Função para iniciar a avaliação
    async function iniciarAvaliacao() {
        // Verificar se aluno e evento foram selecionados
        const alunoSelect = document.getElementById('aluno');
        const eventoSelect = document.getElementById('evento-avaliacao');
        const avaliacaoAtual = document.getElementById('teste-leitura');

        if (!alunoSelect || !eventoSelect) {
            console.error("Elementos de seleção não encontrados");
            return;
        }

        const alunoId = alunoSelect.value;
        const eventoId = eventoSelect.value;
        const testeId = avaliacaoAtual.value;

        if (!alunoId || !eventoId) {
            alert("Por favor, selecione um aluno e um evento de avaliação");
            return;
        }

        try {
            // Criar a avaliação na API
            const response = await fetch(`${API_BASE_URL}/reading-assessments`, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify({
                    assessmentId: parseInt(testeId),
                    assessmentEventId: parseInt(eventoId),
                    studentId: parseInt(alunoId)
                })
            });

            if (!response.ok) {
                throw new Error(`Erro ao criar avaliação: ${response.status}`);
            }

            // Obter a resposta com os dados da avaliação
            const avaliacaoData = await response.json();
            console.log("Avaliação criada:", avaliacaoData);

            // Armazenar os dados da avaliação no localStorage para uso posterior
            localStorage.setItem('avaliacaoAtual', JSON.stringify(avaliacaoData));

            // Ocultar tela de seleção
            const selecaoAvaliacao = document.getElementById('selecao-avaliacao');
            if (selecaoAvaliacao) {
                selecaoAvaliacao.classList.add('hidden');
            }

            // Renderizar as etapas com base nos dados recebidos
            renderizarEtapas(avaliacaoData);

        } catch (error) {
            console.error("Erro ao iniciar avaliação:", error);
            alert("Ocorreu um erro ao iniciar a avaliação. Por favor, tente novamente.");
        }
    }

    // Função para renderizar as etapas com base nos dados da avaliação
    function renderizarEtapas(avaliacaoData) {
        // Verificar se temos dados válidos
        if (!avaliacaoData || !avaliacaoData.assessment) {
            console.error("Dados de avaliação inválidos ou incompletos");
            return;
        }

        const assessment = avaliacaoData.assessment;
        console.log('🚀 phheheheheh:', assessment.phrases);

        // Preparar e exibir a etapa de palavras
        prepararEtapaPalavras(assessment);
        prepararEtapaPseudopalavras(assessment);
        prepararEtapaFrases(assessment);
        prepararEtapaTexto(assessment);
        if (etapasDOM.palavras) {
            etapasDOM.palavras.classList.remove('hidden');
        }
    }

    // Preparar etapa de palavras
    function prepararEtapaPalavras(assessment) {
        if (!etapasDOM.gridPalavras) {
            console.error("Elemento grid de palavras não encontrado");
            return;
        }

        // Limpar o grid
        etapasDOM.gridPalavras.innerHTML = '';

        // Obter palavras do assessment
        let palavras = [];
        if (assessment.words) {
            // Verificar se words já é um array ou se precisa ser parseado
            palavras = Array.isArray(assessment.words)
                ? assessment.words
                : JSON.parse(assessment.words);
        }

        // Criar elementos para cada palavra
        palavras.forEach((palavra, index) => {
            const divPalavra = document.createElement('div');
            divPalavra.className = 'border rounded p-2 flex items-center justify-center palavra-item bg-white hover:bg-blue-100 cursor-pointer transition-colors';
            divPalavra.setAttribute('data-id', index);
            divPalavra.innerHTML = `<span class="text-sm text-gray-800 select-none w-full text-center">${palavra}</span>`;

            // Adicionar evento de clique ao div inteiro
            divPalavra.addEventListener('click', function (e) {
                // Permitir cliques a qualquer momento
                if (!this.classList.contains('bg-green-200')) {
                    this.classList.remove('bg-white', 'hover:bg-blue-100');
                    this.classList.add('bg-green-200');
                    atualizarContadorPalavras();
                } else {
                    // Permitir desmarcar ao clicar novamente
                    this.classList.remove('bg-green-200');
                    this.classList.add('bg-white', 'hover:bg-blue-100');
                    atualizarContadorPalavras();
                }
            });

            etapasDOM.gridPalavras.appendChild(divPalavra);
        });

        // Atualizar contador
        if (etapasDOM.totalPalavras) {
            etapasDOM.totalPalavras.textContent = palavras.length;
        }
        if (etapasDOM.totalPalavrasLidas) {
            etapasDOM.totalPalavrasLidas.textContent = '0';
        }
    }

    // Preparar etapa de pseudopalavras
    function prepararEtapaPseudopalavras(assessment) {
        if (!etapasDOM.gridPseudopalavras) {
            console.error("Elemento grid de pseudopalavras não encontrado");
            return;
        }

        // Limpar o grid
        etapasDOM.gridPseudopalavras.innerHTML = '';

        // Obter pseudopalavras do assessment
        let pseudopalavras = [];
        if (assessment.pseudowords) {
            // Verificar se pseudowords já é um array ou se precisa ser parseado
            pseudopalavras = Array.isArray(assessment.pseudowords)
                ? assessment.pseudowords
                : JSON.parse(assessment.pseudowords);
        }

        // Criar elementos para cada pseudopalavra
        pseudopalavras.forEach((palavra, index) => {
            const divPalavra = document.createElement('div');
            divPalavra.className = 'border rounded p-2 flex items-center justify-center pseudopalavra-item bg-white hover:bg-blue-100 cursor-pointer transition-colors';
            divPalavra.setAttribute('data-id', index);
            divPalavra.innerHTML = `<span class="text-sm text-gray-800 select-none w-full text-center">${palavra}</span>`;

            // Adicionar evento de clique ao div inteiro
            divPalavra.addEventListener('click', function (e) {
                // Permitir cliques a qualquer momento
                if (!this.classList.contains('bg-green-200')) {
                    this.classList.remove('bg-white', 'hover:bg-blue-100');
                    this.classList.add('bg-green-200');
                    atualizarContadorPseudopalavras();
                } else {
                    // Permitir desmarcar ao clicar novamente
                    this.classList.remove('bg-green-200');
                    this.classList.add('bg-white', 'hover:bg-blue-100');
                    atualizarContadorPseudopalavras();
                }
            });

            etapasDOM.gridPseudopalavras.appendChild(divPalavra);
        });

        // Atualizar contador
        if (etapasDOM.totalPseudopalavras) {
            etapasDOM.totalPseudopalavras.textContent = pseudopalavras.length;
        }
        if (etapasDOM.totalPseudopalavrasLidas) {
            etapasDOM.totalPseudopalavrasLidas.textContent = '0';
        }
    }

    // Preparar etapa de frases
    function prepararEtapaFrases(assessment) {
        if (!etapasDOM.containerFrases) {
            console.error("Elemento container de frases não encontrado");
            return;
        }

        // Limpar o container
        etapasDOM.containerFrases.innerHTML = '';

        // Obter frases do assessment
        let frases = [];

        // Verificar se frases vêm do campo 'phrases' ou 'sentences'
        frases = assessment.phrases.map(phrase => phrase.text);

        console.log('🚀 frases MMMMMMM:', frases);

        console.log('🚀 frases:', frases);
        // Criar elementos para cada frase
        frases.forEach((frase, index) => {
            const divFrase = document.createElement('div');
            divFrase.className = 'border rounded p-3 flex items-center frase-item bg-white hover:bg-blue-100 cursor-pointer transition-colors';
            divFrase.setAttribute('data-id', index);
            divFrase.innerHTML = `<span class="text-sm text-gray-800 select-none w-full">${frase}</span>`;

            // Adicionar evento de clique ao div inteiro
            divFrase.addEventListener('click', function (e) {
                // Permitir cliques a qualquer momento
                if (!this.classList.contains('bg-green-200')) {
                    this.classList.remove('bg-white', 'hover:bg-blue-100');
                    this.classList.add('bg-green-200');
                    atualizarContadorFrases();
                } else {
                    // Permitir desmarcar ao clicar novamente
                    this.classList.remove('bg-green-200');
                    this.classList.add('bg-white', 'hover:bg-blue-100');
                    atualizarContadorFrases();
                }
            });

            etapasDOM.containerFrases.appendChild(divFrase);
        });

        // Atualizar contador
        if (etapasDOM.totalFrases) {
            etapasDOM.totalFrases.textContent = frases.length;
        }
        if (etapasDOM.totalFrasesLidas) {
            etapasDOM.totalFrasesLidas.textContent = '0';
        }
    }

    // Preparar etapa de texto
    function prepararEtapaTexto(assessment) {
        if (!etapasDOM.containerTexto) {
            console.error("Elemento container de texto não encontrado");
            return;
        }

        // Limpar o container
        etapasDOM.containerTexto.innerHTML = '';

        // Obter texto do assessment
        const texto = assessment.text || '';

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
            divLinha.className = 'border rounded p-2 mb-2 linha-texto-item bg-white hover:bg-blue-100 cursor-pointer transition-colors';
            divLinha.setAttribute('data-id', index);
            divLinha.innerHTML = `<span class="text-sm text-gray-800 select-none">${linha}</span>`;

            // Adicionar evento de clique ao div inteiro
            divLinha.addEventListener('click', function (e) {
                // Permitir cliques a qualquer momento
                if (!this.classList.contains('bg-green-200')) {
                    this.classList.remove('bg-white', 'hover:bg-blue-100');
                    this.classList.add('bg-green-200');
                    atualizarContadorLinhas();
                } else {
                    // Permitir desmarcar ao clicar novamente
                    this.classList.remove('bg-green-200');
                    this.classList.add('bg-white', 'hover:bg-blue-100');
                    atualizarContadorLinhas();
                }
            });

            etapasDOM.containerTexto.appendChild(divLinha);
        });

        // Atualizar contador
        if (etapasDOM.totalLinhas) {
            etapasDOM.totalLinhas.textContent = linhas.length;
        }
        if (etapasDOM.totalLinhasLidas) {
            etapasDOM.totalLinhasLidas.textContent = '0';
        }
    }

    // Contadores
    function atualizarContadorPalavras() {
        if (!etapasDOM.totalPalavrasLidas) return;

        const marcadas = document.querySelectorAll('.palavra-item.bg-green-200').length;
        etapasDOM.totalPalavrasLidas.textContent = marcadas;
    }

    function atualizarContadorPseudopalavras() {
        if (!etapasDOM.totalPseudopalavrasLidas) return;

        const marcadas = document.querySelectorAll('.pseudopalavra-item.bg-green-200').length;
        etapasDOM.totalPseudopalavrasLidas.textContent = marcadas;
    }

    function atualizarContadorFrases() {
        if (!etapasDOM.totalFrasesLidas) return;

        const marcadas = document.querySelectorAll('.frase-item.bg-green-200').length;
        etapasDOM.totalFrasesLidas.textContent = marcadas;
    }

    function atualizarContadorLinhas() {
        if (!etapasDOM.totalLinhasLidas) return;

        const marcadas = document.querySelectorAll('.linha-texto-item.bg-green-200').length;
        etapasDOM.totalLinhasLidas.textContent = marcadas;
    }

    // Configurar botões de navegação entre etapas
    document.addEventListener('cronometroFinalizado', function (e) {
        const etapa = e.detail.etapa;
        console.log(`Cronômetro finalizado para etapa: ${etapa}`);

        // Habilitar botão de próxima etapa
        const mapaBotoes = {
            'WORDS': 'proximoEtapaPalavras',
            'PSEUDOWORDS': 'proximoEtapaPseudopalavras',
            'SENTENCES': 'proximoEtapaFrases',
            'TEXT': 'proximoEtapaTexto'
        };

        const botaoId = mapaBotoes[etapa];
        if (botaoId) {
            const botao = document.getElementById(botaoId);
            if (botao) {
                botao.disabled = false;
                botao.classList.remove('opacity-50', 'cursor-not-allowed');
            }
        }
    });

    // Configurar navegação entre etapas
    const btnProximoEtapaPalavras = document.getElementById('proximo-etapa-palavras');
    const btnProximoEtapaPseudopalavras = document.getElementById('proximo-etapa-pseudopalavras');
    const btnProximoEtapaFrases = document.getElementById('proximo-etapa-frases');
    const btnProximoEtapaTexto = document.getElementById('proximo-etapa-texto');

    if (btnProximoEtapaPalavras) {
        btnProximoEtapaPalavras.addEventListener('click', function () {
            const avaliacaoAtualStr = localStorage.getItem('avaliacaoAtual');
            if (avaliacaoAtualStr) {
                const avaliacaoAtual = JSON.parse(avaliacaoAtualStr);

                // Atualizar estado da avaliação
                const palavrasLidas = document.querySelectorAll('.palavra-item.bg-green-200').length;
                const totalPalavras = document.querySelectorAll('.palavra-item').length;

                // Ocultar etapa atual e mostrar próxima
                if (etapasDOM.palavras) etapasDOM.palavras.classList.add('hidden');
                if (etapasDOM.pseudopalavras) {
                    etapasDOM.pseudopalavras.classList.remove('hidden');
                    prepararEtapaPseudopalavras(avaliacaoAtual.assessment);
                }

                // Enviar dados para a API
                atualizarAvaliacao({
                    stage: "WORDS",
                    itemsRead: palavrasLidas,
                    totalItems: totalPalavras
                });
            }
        });
    }

    if (btnProximoEtapaPseudopalavras) {
        btnProximoEtapaPseudopalavras.addEventListener('click', function () {
            const avaliacaoAtualStr = localStorage.getItem('avaliacaoAtual');
            if (avaliacaoAtualStr) {
                const avaliacaoAtual = JSON.parse(avaliacaoAtualStr);

                // Atualizar estado da avaliação
                const pseudopalavrasLidas = document.querySelectorAll('.pseudopalavra-item.bg-green-200').length;
                const totalPseudopalavras = document.querySelectorAll('.pseudopalavra-item').length;

                // Ocultar etapa atual e mostrar próxima
                if (etapasDOM.pseudopalavras) etapasDOM.pseudopalavras.classList.add('hidden');
                if (etapasDOM.frases) {
                    etapasDOM.frases.classList.remove('hidden');
                    prepararEtapaFrases(avaliacaoAtual.assessment);
                }

                // Enviar dados para a API
                atualizarAvaliacao({
                    stage: "PSEUDOWORDS",
                    itemsRead: pseudopalavrasLidas,
                    totalItems: totalPseudopalavras
                });
            }
        });
    }

    if (btnProximoEtapaFrases) {
        btnProximoEtapaFrases.addEventListener('click', function () {
            const avaliacaoAtualStr = localStorage.getItem('avaliacaoAtual');
            if (avaliacaoAtualStr) {
                const avaliacaoAtual = JSON.parse(avaliacaoAtualStr);

                // Atualizar estado da avaliação
                const frasesLidas = document.querySelectorAll('.frase-item.bg-green-200').length;
                const totalFrases = document.querySelectorAll('.frase-item').length;

                // Ocultar etapa atual e mostrar próxima
                if (etapasDOM.frases) etapasDOM.frases.classList.add('hidden');
                if (etapasDOM.texto) {
                    etapasDOM.texto.classList.remove('hidden');
                    prepararEtapaTexto(avaliacaoAtual.assessment);
                }

                // Enviar dados para a API
                atualizarAvaliacao({
                    stage: "SENTENCES",
                    itemsRead: frasesLidas,
                    totalItems: totalFrases
                });
            }
        });
    }

    if (btnProximoEtapaTexto) {
        btnProximoEtapaTexto.addEventListener('click', function () {
            const avaliacaoAtualStr = localStorage.getItem('avaliacaoAtual');
            if (avaliacaoAtualStr) {
                const avaliacaoAtual = JSON.parse(avaliacaoAtualStr);

                // Atualizar estado da avaliação
                const linhasLidas = document.querySelectorAll('.linha-texto-item.bg-green-200').length;
                const totalLinhas = document.querySelectorAll('.linha-texto-item').length;

                // Ocultar etapa atual e mostrar próxima
                if (etapasDOM.texto) etapasDOM.texto.classList.add('hidden');
                if (etapasDOM.resultado) {
                    etapasDOM.resultado.classList.remove('hidden');
                    renderizarResultado(avaliacaoAtual);
                }

                // Enviar dados para a API
                atualizarAvaliacao({
                    stage: "TEXT",
                    itemsRead: linhasLidas,
                    totalItems: totalLinhas,
                    completed: true
                });
            }
        });
    }

    // Função para atualizar avaliação na API
    function atualizarAvaliacao(dados) {
        const avaliacaoAtualStr = localStorage.getItem('avaliacaoAtual');
        if (!avaliacaoAtualStr) {
            console.error("Nenhuma avaliação em andamento para atualizar");
            return;
        }

        const avaliacaoAtual = JSON.parse(avaliacaoAtualStr);
        const id = avaliacaoAtual.id;

        // Construir a URL
        const url = `${API_BASE_URL}/reading-assessments/${id}/stage`;

        // Preparar o body no formato especificado
        const requestBody = {
            stage: dados.stage,
            itemsRead: dados.itemsRead,
            totalItems: dados.totalItems,
            ...dados
        };

        console.log("Enviando dados:", requestBody);

        // Enviar os dados
        fetch(url, {
            method: 'PUT',
            headers: headers,
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
            })
            .catch(error => {
                console.error("Erro ao atualizar avaliação:", error);
            });
    }

    // Função para renderizar o resultado
    function renderizarResultado(avaliacaoAtual) {
        // Preencher informações do aluno
        const nomeAlunoElement = document.getElementById('resultado-aluno-nome');
        const serieElement = document.getElementById('resultado-serie');

        if (nomeAlunoElement && avaliacaoAtual.student) {
            nomeAlunoElement.textContent = avaliacaoAtual.student.name;
        }

        if (serieElement && avaliacaoAtual.student) {
            serieElement.textContent = avaliacaoAtual.student.grade || '-';
        }

        // Determinar nível de leitura baseado nos dados coletados
        const palavrasLidas = document.querySelectorAll('.palavra-item.bg-green-200').length;
        let nivel, descricao, porcentagem;

        if (palavrasLidas === 0) {
            nivel = "NÍVEL 0 - NÃO AVALIADO";
            descricao = "Não foi possível avaliar o nível de leitura.";
            porcentagem = 0;
        } else if (palavrasLidas < 10) {
            nivel = "NÍVEL 1 - NÃO LEITOR";
            descricao = `Lê menos de 10 palavras/min. Necessita intervenção imediata.`;
            porcentagem = 16;
        } else if (palavrasLidas < 20) {
            nivel = "NÍVEL 2 - LEITOR DE SÍLABAS";
            descricao = `Lê de 10 a 20 palavras/min. Em desenvolvimento inicial.`;
            porcentagem = 32;
        } else if (palavrasLidas < 30) {
            nivel = "NÍVEL 3 - LEITOR DE PALAVRAS";
            descricao = `Lê de 20 a 30 palavras/min. Atenção à fluência.`;
            porcentagem = 48;
        } else if (palavrasLidas < 40) {
            nivel = "NÍVEL 4 - LEITOR DE FRASES";
            descricao = `Lê de 30 a 40 palavras/min. Boa evolução.`;
            porcentagem = 64;
        } else if (palavrasLidas < 50) {
            nivel = "NÍVEL 5 - LEITOR DE TEXTO SEM FLUÊNCIA";
            descricao = `Lê de 40 a 50 palavras/min. Quase lá!`;
            porcentagem = 80;
        } else {
            nivel = "NÍVEL 6 - LEITOR DE TEXTO COM FLUÊNCIA";
            descricao = `Lê mais de 50 palavras/min. Excelente desempenho!`;
            porcentagem = 100;
        }

        // Atualizar a interface
        const nivelElement = document.getElementById('nivel-leitor-sugerido');
        const descricaoElement = document.getElementById('descricao-nivel');
        const progressoElement = document.getElementById('nivel-progresso');

        if (nivelElement) nivelElement.textContent = nivel;
        if (descricaoElement) descricaoElement.textContent = descricao;
        if (progressoElement) progressoElement.style.width = `${porcentagem}%`;

        // Configurar botões de ação final
        const btnNovaAvaliacao = document.getElementById('btn-nova-avaliacao');
        const btnVoltarDashboard = document.getElementById('btn-voltar-dashboard');

        if (btnNovaAvaliacao) {
            btnNovaAvaliacao.addEventListener('click', function () {
                localStorage.removeItem('avaliacaoAtual');
                location.reload();
            });
        }

        if (btnVoltarDashboard) {
            btnVoltarDashboard.addEventListener('click', function () {
                localStorage.removeItem('avaliacaoAtual');
                window.location.href = '/dashboard.html';
            });
        }
    }
}); 