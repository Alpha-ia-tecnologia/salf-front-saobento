
// Inicializar listas
const avaliacoesList = document.getElementById('avaliacoes-list');
let paginaAtual = 1;
// Função para obter o token de autenticação do localStorage
function getAuthToken() {
    return localStorage.getItem('token') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IlVzdWFyaW8gU0FMRiIsImlhdCI6MTUxNjIzOTAyMn0.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
}
let isCreate = localStorage.getItem('isCreate') === 'true';
// Carregar avaliações e eventos na inicialização
document.addEventListener('DOMContentLoaded', function () {

    // Carregar avaliações
    carregarAvaliacoes();

    // Carregar eventos
    carregarEventos();

    // Configurar tabs
    tabEventos.addEventListener('click', function () {
        tabEventos.classList.add('border-blue-500', 'text-blue-600');
        tabEventos.classList.remove('border-transparent', 'text-gray-500');
        tabAvaliacao.classList.add('border-transparent', 'text-gray-500');
        tabAvaliacao.classList.remove('border-blue-500', 'text-blue-600');
        secaoEventos.classList.remove('hidden');
        secaoAvaliacoes.classList.add('hidden');
    });

    tabAvaliacao.addEventListener('click', function () {
        tabAvaliacao.classList.add('border-blue-500', 'text-blue-600');
        tabAvaliacao.classList.remove('border-transparent', 'text-gray-500');
        tabEventos.classList.add('border-transparent', 'text-gray-500');
        tabEventos.classList.remove('border-blue-500', 'text-blue-600');
        secaoAvaliacoes.classList.remove('hidden');
        secaoEventos.classList.add('hidden');
    });

    // Adicionar event listener para o botão de nova avaliação
    const btnNovaAvaliacao = document.getElementById('btn-nova-avaliacao');
    if (btnNovaAvaliacao) {
        btnNovaAvaliacao.addEventListener('click', () => {
            isCreate = true;
            avaliacaoIdEmEdicao = null;
            resetFormAvaliacao();
            document.querySelector('#modal-avaliacao h3').textContent = 'Nova Avaliação';
            const btnSalvar = document.getElementById('btn-salvar-avaliacao');
            if (btnSalvar) {
                btnSalvar.textContent = 'Criar Avaliação';
            }
            modalAvaliacao.classList.remove('hidden');
        });
    }
});

// Elementos de Avaliação
const btnNovaAvaliacao = document.getElementById('btn-nova-avaliacao');
const btnExportarAvaliacoes = document.getElementById('btn-exportar-avaliacoes');
const modalAvaliacao = document.getElementById('modal-avaliacao');
const fecharModalAvaliacao = document.getElementById('fechar-modal-avaliacao');
const cancelarAvaliacao = document.getElementById('cancelar-avaliacao');
const formAvaliacao = document.getElementById('form-avaliacao');
const pesquisaAvaliacao = document.getElementById('pesquisa-avaliacao');

// Elementos de Eventos
const btnNovoEvento = document.getElementById('btn-novo-evento');
const modalEvento = document.getElementById('modal-evento');
const fecharModalEvento = document.getElementById('fechar-modal-evento');
const cancelarEvento = document.getElementById('cancelar-evento');
const formEvento = document.getElementById('form-evento');
const pesquisaEvento = document.getElementById('pesquisa-evento');

// Elementos para alternância entre abas
const tabAvaliacao = document.getElementById('tab-avaliacao');
const tabEventos = document.getElementById('tab-eventos');
const secaoAvaliacoes = document.getElementById('secao-avaliacoes');
const secaoEventos = document.getElementById('secao-eventos');

// Elementos para gerenciamento de palavras, pseudopalavras e frases
const novaPalavra = document.getElementById('nova-palavra');
const adicionarPalavra = document.getElementById('adicionar-palavra');
const listaPalavras = document.getElementById('lista-palavras');
const novaPseudopalavra = document.getElementById('nova-pseudopalavra');
const adicionarPseudopalavra = document.getElementById('adicionar-pseudopalavra');
const listaPseudopalavras = document.getElementById('lista-pseudopalavras');
const novaFrase = document.getElementById('nova-frase');
const adicionarFrase = document.getElementById('adicionar-frase');
const listaFrases = document.getElementById('lista-frases');
const textoAvaliacao = document.getElementById('texto-avaliacao');
const contagemPalavras = document.getElementById('contagem-palavras');

// Elementos para questões de múltipla escolha
const btnAdicionarQuestao = document.getElementById('adicionar-questao');
const templateQuestao = document.getElementById('template-questao');
const containerQuestoes = document.getElementById('container-questoes');
const semQuestoes = document.getElementById('sem-questoes');

// Elementos para o modal de envio simples
const modalEnvioSimples = document.getElementById('modal-envio-simples');
const fecharModalSimples = document.getElementById('fechar-modal-simples');
const cancelarEnvioSimples = document.getElementById('cancelar-envio-simples');
const formEnvioSimples = document.getElementById('form-envio-simples');
const btnSalvarAvaliacao = document.getElementById('btn-salvar-avaliacao');

// Elementos do modal de edição
const modalEditarAvaliacao = document.getElementById('modal-editar-avaliacao');
const fecharModalEditarAvaliacao = document.getElementById('fechar-modal-editar-avaliacao');
const cancelarEditarAvaliacao = document.getElementById('cancelar-editar-avaliacao');
const formEditarAvaliacao = document.getElementById('form-editar-avaliacao');
const btnSalvarEditarAvaliacao = document.getElementById('btn-salvar-editar-avaliacao');

// Dados simulados para avaliações
// let avaliacoes = [
//     { id: 1, nome: 'Avaliação 1º Semestre 2023', palavras: [], pseudopalavras: [], frases: [], texto: '', totalPalavras: 40, totalPseudopalavras: 30, questoes: [] },
//     { id: 2, nome: 'Avaliação 2º Semestre 2023', palavras: [], pseudopalavras: [], frases: [], texto: '', totalPalavras: 40, totalPseudopalavras: 30, questoes: [] }
// ];

// // Dados simulados para eventos
// let eventos = [
//     { id: 1, nome: 'Evento Avaliação 1º Bimestre', avaliacaoId: 1, avaliacaoNome: 'Avaliação 1º Semestre 2023', ativo: true },
//     { id: 2, nome: 'Evento Avaliação 2º Bimestre', avaliacaoId: 2, avaliacaoNome: 'Avaliação 2º Semestre 2023', ativo: false }
// ];

// ID para edição
let avaliacaoIdEmEdicao = null;
let eventoIdEmEdicao = null;
let palavrasAdicionadas = [];
let pseudopalavrasAdicionadas = [];
let frasesAdicionadas = [];

// Variáveis para as questões
let questoesAdicionadas = [];
let contadorQuestoes = 0;

btnSalvarAvaliacao.addEventListener('click', async () => {
    const nomeAvaliacao = document.getElementById('nome-avaliacao').value;
    const texto = textoAvaliacao.value;
    const questoesElements = document.querySelectorAll('#container-questoes .questao:not(.questao-template)');
    questoesAdicionadas = Array.from(questoesElements).map(questaoEl => {
        const enunciado = questaoEl.querySelector('.enunciado-questao').value;
        const opcoes = Array.from(questaoEl.querySelectorAll('.opcao-container')).map(opt =>
            opt.querySelector('.texto-opcao').value
        );

        return {
            text: enunciado,
            options: opcoes,
        };
    });

    if (nomeAvaliacao.trim() === '') {
        alert('Por favor, informe o nome da avaliação.');
        return;
    }

    const request = {
        name: nomeAvaliacao,
        text: texto,
        words: palavrasAdicionadas,
        pseudowords: pseudopalavrasAdicionadas,
        phrases: frasesAdicionadas,
        questions: questoesAdicionadas,
        gradeRange: document.getElementById('faixa-serie').value,
        totalWords: palavrasAdicionadas.length,
        totalPseudowords: pseudopalavrasAdicionadas.length,
    };

    try {
        await handleCreateAssessment(request);
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao criar avaliação.');
    }
});

// Abrir e fechar modal de avaliação
btnNovaAvaliacao.addEventListener('click', function () {
    avaliacaoIdEmEdicao = null;
    resetFormAvaliacao();
    document.querySelector('#modal-avaliacao h3').textContent = 'Nova Avaliação';
    modalAvaliacao.classList.remove('hidden');
});

fecharModalAvaliacao.addEventListener('click', function () {
    modalAvaliacao.classList.add('hidden');
});

cancelarAvaliacao.addEventListener('click', function () {
    modalAvaliacao.classList.add('hidden');
});

// Abrir e fechar modal de evento
btnNovoEvento.addEventListener('click', function () {
    eventoIdEmEdicao = null;
    resetFormEvento();
    document.querySelector('#modal-evento h3').textContent = 'Novo Evento de Avaliação';
    modalEvento.classList.remove('hidden');

    // Carregar as avaliações disponíveis para o select
    carregarAvaliacoesParaSelect();
});

fecharModalEvento.addEventListener('click', function () {
    modalEvento.classList.add('hidden');
});

cancelarEvento.addEventListener('click', function () {
    modalEvento.classList.add('hidden');
});

const btnPagina = document.getElementById('btn-page');
const btnPaginaAnterior = document.getElementById('btn-page-anterior');
const btnPaginaProximo = document.getElementById('btn-page-proximo');
const btnPaginaAvaliacao = document.getElementById('btn-page-avaliacao');
const btnPaginaAnteriorAvaliacao = document.getElementById('btn-page-anterior-avaliacao');
const btnPaginaProximoAvaliacao = document.getElementById('btn-page-proximo-avaliacao');

btnPaginaAvaliacao.addEventListener('click', function () {
    btnPagina.innerText = paginaAtual - 1;
    carregarEventos();
});

btnPaginaProximoAvaliacao.addEventListener('click', function () {
    btnPaginaAvaliacao.innerText = paginaAtual + 1;
    carregarEventos();
});

btnPaginaAnterior.addEventListener('click', function () {
    btnPagina.innerText = paginaAtual - 1;
    carregarEventos();
});
btnPaginaProximo.addEventListener('click', function () {
    btnPagina.innerText = paginaAtual + 1;
    carregarEventos();
});

// Submissão do formulário de avaliação

// Função para carregar os eventos da API
function carregarEventos() {
    // Verificar se a API de eventos está disponível
    if (window.EventosAPI && typeof window.EventosAPI.getAllAssessmentEvents === 'function') {
        // Usar a API mais moderna
        window.EventosAPI.getAllAssessmentEvents()
            .then(data => {
                // Atualizar a variável de eventos
                eventos = data;
                // Atualizar a exibição na tabela
                mostrarEventosNaTabela(eventos);
            })
            .catch(error => {
                console.error('Erro ao carregar eventos:', error);
                alert('Erro ao carregar eventos. Por favor, tente novamente.');
            });
    } else {
        // Fallback para o método antigo
        fetch(`${API_BASE_URL}/assessment-events`, {
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`
            }
        })
            .then(response => {
                if (!response.ok) {
                }
                return response.json();
            })
            .then((data) => {
                // Atualizar a variável de eventos
                eventos = data;
                // Atualizar a exibição na tabela
                mostrarEventosNaTabela(eventos);
            })
            .catch(error => {
                console.error('Erro ao carregar eventos:', error);
            });
    }
}

// Função para mostrar os eventos na tabela
function mostrarEventosNaTabela(eventos) {
    const tbody = document.getElementById('tabela-eventos');
    if (!tbody) {
        console.error('Elemento tbody não encontrado');
        return;
    }

    tbody.innerHTML = '';

    if (eventos.length === 0) {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td colspan="5" class="px-6 py-4 text-center text-gray-500">
                Nenhum evento encontrado
            </td>
        `;
        tbody.appendChild(tr);
        return;
    }

    eventos.forEach(evento => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                ${evento.id}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">${evento.name}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                ${evento.assessmentName || (evento.assessment ? evento.assessment.name : '')}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                ${evento.status === 'ACTIVE'
                ? '<span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Ativo</span>'
                : '<span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">Inativo</span>'}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button class="text-blue-600 hover:text-blue-900 mr-3 exportar-avaliacao" data-id="${evento.id}" title="Exportar Prova">
                    <i class="fas fa-file-export"></i>
                </button>
                <button class="text-yellow-600 hover:text-yellow-900 mr-3 editar-evento" data-id="${evento.id}">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="text-red-600 hover:text-red-900 excluir-evento" data-id="${evento.id}">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });

    // Configurar eventos dos botões
    adicionarEventListenersTabelaEventos();
}

// Função para adicionar event listeners aos botões da tabela de eventos
function adicionarEventListenersTabelaEventos() {
    // Event listeners para botões de editar
    document.querySelectorAll('.editar-evento').forEach(btn => {
        btn.addEventListener('click', function () {
            const id = parseInt(this.getAttribute('data-id'));
            editarEvento(id);
        });
    });

    // Event listeners para botões de excluir
    document.querySelectorAll('.excluir-evento').forEach(btn => {
        btn.addEventListener('click', function () {
            const id = parseInt(this.getAttribute('data-id'));
            excluirEvento(id);
        });
    });
}

// Função para excluir um assessment
function excluirAssessment(id) {
    if (confirm('Tem certeza que deseja excluir esta avaliação?')) {
        fetch(`${API_BASE_URL}/assessments/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`
            }
        })
            .then(response => {
                if (!response.ok) {
                    alert(response.message);
                    throw new Error('Erro ao excluir avaliação');
                }
                return response.json();
            })
            .then(({ data }) => {
                alert('Avaliação excluída com sucesso!');
                carregarAvaliacoes();
                carregarEventos();
            })
            .catch(error => {
                console.error('Erro ao excluir avaliação:', error);
                alert(error.message);
            });
    }
}

function configurarAdicionarQuestoes() {
    const btnAdicionarQuestao = document.getElementById('adicionar-questao');
    const templateQuestao = document.getElementById('template-questao');
    const containerQuestoes = document.getElementById('container-questoes');

    let contadorQuestoes = 0;

    if (!btnAdicionarQuestao || !templateQuestao || !containerQuestoes) {
        console.warn('Elementos para adicionar questões não encontrados');
        return;
    }

    console.log('Configurando funcionalidade de adicionar questões');

    btnAdicionarQuestao.addEventListener('click', () => {
        adicionarNovaQuestao();
    });

    function adicionarNovaQuestao(questaoData = null) {
        contadorQuestoes++;

        const novaQuestao = templateQuestao.cloneNode(true);
        novaQuestao.classList.remove('questao-template', 'hidden');
        novaQuestao.classList.add('questao');
        novaQuestao.id = `questao-${contadorQuestoes}`;

        const enunciadoQuestao = novaQuestao.querySelector('.enunciado-questao');
        const textosOpcoes = novaQuestao.querySelectorAll('.texto-opcao');


        if (questaoData) {
            enunciadoQuestao.value = questaoData.enunciado || '';

            textosOpcoes.forEach((input, index) => {
                if (questaoData.opcoes && questaoData.opcoes[index]) {
                    input.value = questaoData.opcoes[index];
                }
            });

            if (questaoData.respostaCorreta !== undefined &&
                respostasCorretas[questaoData.respostaCorreta]) {
                respostasCorretas[questaoData.respostaCorreta].checked = true;
            }
        }

        const btnRemoverQuestao = novaQuestao.querySelector('.btn-remover-questao');
        if (btnRemoverQuestao) {
            btnRemoverQuestao.addEventListener('click', function () {
                novaQuestao.remove();

                const questoes = document.querySelectorAll('#container-questoes .questao:not(.questao-template)');
                if (questoes.length === 0) {
                    const semQuestoes = document.getElementById('sem-questoes');
                    if (semQuestoes) {
                        semQuestoes.classList.remove('hidden');
                    }
                }
            });
        }

        const botoesRemoverOpcao = novaQuestao.querySelectorAll('.btn-remover-opcao');
        botoesRemoverOpcao.forEach(btn => {
            btn.addEventListener('click', function () {
                const opcoes = novaQuestao.querySelectorAll('.opcao-container');

                this.closest('.opcao-container').remove();
            });
        });

        const btnAdicionarOpcao = novaQuestao.querySelector('.btn-adicionar-opcao');
        if (btnAdicionarOpcao) {
            btnAdicionarOpcao.addEventListener('click', function () {
                adicionarNovaOpcao(novaQuestao, contadorQuestoes);
            });
        }

        containerQuestoes.appendChild(novaQuestao);

        const semQuestoes = document.getElementById('sem-questoes');
        if (semQuestoes) {
            semQuestoes.classList.add('hidden');
        }

        console.log(`Questão ${contadorQuestoes} adicionada`);
        return novaQuestao;
    }

    function adicionarNovaOpcao(questaoEl, questaoId) {
        const opcoesContainer = questaoEl.querySelectorAll('.opcao-container');
        if (opcoesContainer.length === 0) {
            console.error('Nenhuma opção encontrada para clonar');
            return;
        }

        const ultimaOpcao = opcoesContainer[opcoesContainer.length - 1];
        const novaOpcao = ultimaOpcao.cloneNode(true);

        const inputTexto = novaOpcao.querySelector('.texto-opcao');
        if (inputTexto) {
            inputTexto.value = '';
            inputTexto.placeholder = `Alternativa ${String.fromCharCode(65 + opcoesContainer.length)}`;
        }

        const radioButton = novaOpcao.querySelector('.resposta-correta');
        if (radioButton) {
            radioButton.checked = false;
            radioButton.name = `resposta-correta-${questaoId}`;
        }

        const btnRemover = novaOpcao.querySelector('.btn-remover-opcao');
        if (btnRemover) {
            btnRemover.addEventListener('click', function () {
                const opcoes = questaoEl.querySelectorAll('.opcao-container');
                if (opcoes.length <= 2) {
                    alert('É necessário ter pelo menos 2 alternativas.');
                    return;
                }
                novaOpcao.remove();
            });
        }

        const btnAdicionarOpcao = questaoEl.querySelector('.btn-adicionar-opcao');
        if (btnAdicionarOpcao) {
            btnAdicionarOpcao.parentNode.insertBefore(novaOpcao, btnAdicionarOpcao);
        } else {
            const container = questaoEl.querySelector('.space-y-2');
            if (container) {
                container.appendChild(novaOpcao);
            }
        }

        console.log(`Nova opção adicionada à questão ${questaoId}`);
    }
}



// Inicializar a interface
configurarAdicionarQuestoes();

// Adição de palavras
adicionarPalavra.addEventListener('click', function () {
    adicionarPalavrasMultiplas();
});

// Permitir pressionar Enter para adicionar palavras
novaPalavra.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
        e.preventDefault();
        adicionarPalavrasMultiplas();
    }
});

// Adição de pseudopalavras
adicionarPseudopalavra.addEventListener('click', function () {
    adicionarPseudopalavrasMultiplas();
});

// Permitir pressionar Enter para adicionar pseudopalavras
novaPseudopalavra.addEventListener('keydown', function (e) {
    console.log(e.key);
    if (e.key === 'Enter') {
        e.preventDefault();
        adicionarPseudopalavrasMultiplas();
    }
});

// Adição de frases
adicionarFrase.addEventListener('click', function () {
    adicionarFrasesMultiplas();
});

// Permitir pressionar Enter para adicionar frases
novaFrase.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
        e.preventDefault();
        adicionarFrasesMultiplas();
    }
});

// Funções para adicionar múltiplos itens
function adicionarPalavrasMultiplas() {
    const texto = novaPalavra.value.trim();
    if (texto === '') {
        alert('Por favor, digite uma palavra para adicionar.');
        return;
    }

    // Separar por vírgulas ou espaços se houver
    const palavras = texto.split(/,|\n/).map(p => p.trim()).filter(p => p !== '');

    if (palavras.length === 0) {
        return;
    }

    let adicionadas = 0;
    let repetidas = 0;

    palavras.forEach(palavra => {
        if (!palavrasAdicionadas.includes(palavra)) {
            adicionarPalavraAoDOM(palavra);
            palavrasAdicionadas.push(palavra);
            adicionadas++;
        } else {
            repetidas++;
        }
    });

    // Mensagem de feedback
    if (adicionadas > 0) {
        if (repetidas > 0) {
            alert(`${adicionadas} palavra(s) adicionada(s). ${repetidas} palavra(s) foi(ram) ignorada(s) por já existir(em).`);
        }
        novaPalavra.value = '';
        novaPalavra.focus();
    } else if (repetidas > 0) {
        alert('Todas as palavras já foram adicionadas anteriormente.');
    }
}

function adicionarPseudopalavrasMultiplas() {
    const texto = novaPseudopalavra.value.trim();
    if (texto === '') {
        alert('Por favor, digite uma pseudopalavra para adicionar.');
        return;
    }

    // Separar por vírgulas ou espaços se houver
    const pseudopalavras = texto.split(/,|\n/).map(p => p.trim()).filter(p => p !== '');

    if (pseudopalavras.length === 0) {
        return;
    }

    let adicionadas = 0;
    let repetidas = 0;

    pseudopalavras.forEach(pseudopalavra => {
        if (!pseudopalavrasAdicionadas.includes(pseudopalavra)) {
            adicionarPseudopalavraAoDOM(pseudopalavra);
            pseudopalavrasAdicionadas.push(pseudopalavra);
            adicionadas++;
        } else {
            repetidas++;
        }
    });

    // Mensagem de feedback
    if (adicionadas > 0) {
        if (repetidas > 0) {
            alert(`${adicionadas} pseudopalavra(s) adicionada(s). ${repetidas} pseudopalavra(s) foi(ram) ignorada(s) por já existir(em).`);
        }
        novaPseudopalavra.value = '';
        novaPseudopalavra.focus();
    } else if (repetidas > 0) {
        alert('Todas as pseudopalavras já foram adicionadas anteriormente.');
    }
}

function adicionarFrasesMultiplas() {
    const texto = novaFrase.value.trim();
    if (texto === '') {
        alert('Por favor, digite uma frase para adicionar.');
        return;
    }

    // Separar por linhas primeiro, depois por pontos (.) se houver múltiplas frases
    const frases = texto.split(/\n|\.(?=\s|$)/).map(f => f.trim()).filter(f => f !== '');

    if (frases.length === 0) {
        return;
    }

    let adicionadas = 0;
    let repetidas = 0;

    frases.forEach(frase => {
        // Adicionar ponto final se não tiver
        if (!frase.endsWith('.')) {
            frase = frase + '.';
        }

        if (!frasesAdicionadas.includes(frase)) {
            adicionarFraseAoDOM(frase);
            frasesAdicionadas.push({ text: frase });
            adicionadas++;
        } else {
            repetidas++;
        }
    });

    // Mensagem de feedback
    if (adicionadas > 0) {
        if (repetidas > 0) {
            alert(`${adicionadas} frase(s) adicionada(s). ${repetidas} frase(s) foi(ram) ignorada(s) por já existir(em).`);
        }
        novaFrase.value = '';
        novaFrase.focus();
    } else if (repetidas > 0) {
        alert('Todas as frases já foram adicionadas anteriormente.');
    }
}

// Contagem de palavras no texto
textoAvaliacao.addEventListener('input', function () {
    const texto = textoAvaliacao.value.trim();
    const palavras = texto === '' ? 0 : texto.split(/\s+/).length;
    contagemPalavras.textContent = palavras;

    // Mudar cor se estiver fora do intervalo recomendado
    if (palavras < 150 || palavras > 400) {
        contagemPalavras.classList.add('text-red-500');
        contagemPalavras.classList.remove('text-green-500');
    } else {
        contagemPalavras.classList.add('text-green-500');
        contagemPalavras.classList.remove('text-red-500');
    }
});

// Pesquisa de avaliações
pesquisaAvaliacao.addEventListener('input', function () {
    const termo = pesquisaAvaliacao.value.toLowerCase();
    const linhas = document.querySelectorAll('#secao-avaliacoes tbody tr');

    linhas.forEach(linha => {
        const nome = linha.querySelector('td:nth-child(2)').textContent.toLowerCase();
        if (nome.includes(termo)) {
            linha.style.display = '';
        } else {
            linha.style.display = 'none';
        }
    });
});

// Pesquisa de eventos
pesquisaEvento.addEventListener('input', function () {
    const termo = pesquisaEvento.value.toLowerCase();
    const linhas = document.querySelectorAll('#secao-eventos tbody tr');

    linhas.forEach(linha => {
        const nome = linha.querySelector('td:nth-child(2)').textContent.toLowerCase();
        const avaliacao = linha.querySelector('td:nth-child(3)').textContent.toLowerCase();
        if (nome.includes(termo) || avaliacao.includes(termo)) {
            linha.style.display = '';
        } else {
            linha.style.display = 'none';
        }
    });
});

// Funções auxiliares
function resetFormAvaliacao() {
    formAvaliacao.reset();
    listaPalavras.innerHTML = '';
    listaPseudopalavras.innerHTML = '';
    listaFrases.innerHTML = '';
    palavrasAdicionadas = [];
    pseudopalavrasAdicionadas = [];
    frasesAdicionadas = [];
    contagemPalavras.textContent = '0';
    contagemPalavras.classList.remove('text-red-500', 'text-green-500');

    // Limpar questões
    resetQuestoes();
}

function resetFormEvento() {
    formEvento.reset();
}

function adicionarPalavraAoDOM(palavra, isEdit = false) {
    const div = document.createElement('div');
    div.className = 'bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center';
    div.innerHTML = `
        ${palavra}
        <button type="button" class="ml-2 text-blue-600 hover:text-blue-800" data-palavra="${palavra}">
            <i class="fas fa-times-circle"></i>
        </button>
    `;

    div.querySelector('button').addEventListener('click', function () {
        const palavraParaRemover = this.getAttribute('data-palavra');
        if (isEdit) {
            palavrasAdicionadasEdit = palavrasAdicionadasEdit.filter(p => p !== palavraParaRemover);
        } else {
            palavrasAdicionadas = palavrasAdicionadas.filter(p => p !== palavraParaRemover);
        }
        div.remove();
    });

    const container = isEdit ? document.getElementById('lista-palavras-edit') : listaPalavras;
    container.appendChild(div);
}

function adicionarPseudopalavraAoDOM(pseudopalavra, isEdit = false) {
    const div = document.createElement('div');
    div.className = 'bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm flex items-center';
    div.innerHTML = `
        ${pseudopalavra}
        <button type="button" class="ml-2 text-purple-600 hover:text-purple-800" data-pseudopalavra="${pseudopalavra}">
            <i class="fas fa-times-circle"></i>
        </button>
    `;

    div.querySelector('button').addEventListener('click', function () {
        const pseudopalavraParaRemover = this.getAttribute('data-pseudopalavra');
        if (isEdit) {
            pseudopalavrasAdicionadasEdit = pseudopalavrasAdicionadasEdit.filter(p => p !== pseudopalavraParaRemover);
        } else {
            pseudopalavrasAdicionadas = pseudopalavrasAdicionadas.filter(p => p !== pseudopalavraParaRemover);
        }
        div.remove();
    });

    const container = isEdit ? document.getElementById('lista-pseudopalavras-edit') : listaPseudopalavras;
    container.appendChild(div);
}

function adicionarFraseAoDOM(frase, isEdit = false) {
    const div = document.createElement('div');
    div.className = 'bg-green-100 text-green-800 px-3 py-2 rounded-md text-sm flex items-center justify-between';
    div.innerHTML = `
        <span class="flex-1">${frase}</span>
        <button type="button" class="ml-2 text-green-600 hover:text-green-800" data-frase="${frase}">
            <i class="fas fa-times-circle"></i>
        </button>
    `;

    div.querySelector('button').addEventListener('click', function () {
        const fraseParaRemover = this.getAttribute('data-frase');
        if (isEdit) {
            frasesAdicionadasEdit = frasesAdicionadasEdit.filter(f => f !== fraseParaRemover);
        } else {
            frasesAdicionadas = frasesAdicionadas.filter(f => f !== fraseParaRemover);
        }
        div.remove();
    });

    const container = isEdit ? document.getElementById('lista-frases-edit') : listaFrases;
    container.appendChild(div);
}

function resetQuestoes() {
    containerQuestoes.querySelectorAll('.questao:not(.questao-template)').forEach(el => el.remove());
    semQuestoes.classList.remove('hidden');
    questoesAdicionadas = [];
    contadorQuestoes = 0;
}

function preencherFormAvaliacao(avaliacao) {
    document.getElementById('nome-avaliacao').value = avaliacao.nome;
    textoAvaliacao.value = avaliacao.texto;

    // Atualizar contagem de palavras
    const texto = textoAvaliacao.value.trim();
    const palavras = texto === '' ? 0 : texto.split(/\s+/).length;
    contagemPalavras.textContent = palavras;

    if (palavras < 150 || palavras > 400) {
        contagemPalavras.classList.add('text-red-500');
        contagemPalavras.classList.remove('text-green-500');
    } else {
        contagemPalavras.classList.add('text-green-500');
        contagemPalavras.classList.remove('text-red-500');
    }

    // Adicionar palavras
    listaPalavras.innerHTML = '';
    palavrasAdicionadas = [...avaliacao.palavras];
    palavrasAdicionadas.forEach(palavra => {
        adicionarPalavraAoDOM(palavra);
    });

    // Adicionar pseudopalavras
    listaPseudopalavras.innerHTML = '';
    pseudopalavrasAdicionadas = [...avaliacao.pseudopalavras];
    pseudopalavrasAdicionadas.forEach(pseudopalavra => {
        adicionarPseudopalavraAoDOM(pseudopalavra);
    });

    // Adicionar frases
    listaFrases.innerHTML = '';
    frasesAdicionadas = avaliacao.frases ? [...avaliacao.frases] : [];
    frasesAdicionadas.forEach(frase => {
        adicionarFraseAoDOM(frase.text);
    });

    // Adicionar questões
    resetQuestoes();
    if (avaliacao.questoes && avaliacao.questoes.length > 0) {
        avaliacao.questoes.forEach(questao => {
            adicionarQuestao(questao);
        });
    }
}


const handleCreateAssessment = async (request) => {
    try {
        const response = await fetch(`${API_BASE_URL}/assessments`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getAuthToken()}`
            },
            body: JSON.stringify(request)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Erro ao criar avaliação');
        }

        alert('Avaliação criada com sucesso!');
        resetFormAvaliacao();
        modalAvaliacao.classList.add('hidden');
        location.reload();
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao criar avaliação.');
    }
};

const handleUpdateAssessment = async (id, request) => {
    try {
        const response = await fetch(`${API_BASE_URL}/assessments/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getAuthToken()}`
            },
            body: JSON.stringify(request)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Erro ao atualizar avaliação');
        }

        alert('Avaliação atualizada com sucesso!');
        resetFormAvaliacao();
        modalEditarAvaliacao.classList.add('hidden');
        location.reload();
    } catch (error) {
        console.error('Erro:', error);
        throw error; // Propagar o erro para ser tratado pelo chamador
    }
};

function preencherFormEvento(evento) {
    document.getElementById('nome-evento').value = evento.nome;
    document.getElementById('avaliacao-evento').value = evento.avaliacaoId;
    document.getElementById('status-evento').checked = evento.ativo;
}

// Função para carregar as avaliações da API
async function carregarAvaliacoes() {
    try {
        const response = await fetch(`${API_BASE_URL}/assessments`, {
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`
            }
        });

        if (!response.ok) {
            throw new Error('Erro ao carregar avaliações');
        }

        const data = await response.json();
        avaliacoes = data.data;
        atualizarTabelaAvaliacoes();
    } catch (error) {
        console.error('Erro ao carregar avaliações:', error);
        alert('Erro ao carregar avaliações. Por favor, tente novamente.');
    }
}

// Função para buscar uma avaliação específica
async function buscarAvaliacao(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/assessments/${id}`, {
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`
            }
        });

        if (!response.ok) {
            throw new Error('Erro ao buscar avaliação');
        }

        return await response.json();
    } catch (error) {
        console.error('Erro ao buscar avaliação:', error);
        throw error;
    }
}

// Função para mostrar as avaliações na tabela
function mostrarAvaliacoesNaTabela(avaliacoes) {
    const tbody = document.querySelector('#secao-avaliacoes tbody');
    if (!tbody) {
        console.error('Elemento tbody não encontrado');
        return;
    }

    tbody.innerHTML = '';

    avaliacoes.forEach(avaliacao => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                ${avaliacao.id}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">${avaliacao.name || avaliacao.nome}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                ${avaliacao.totalWords || avaliacao.totalPalavras || 0}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                ${avaliacao.totalPseudowords || avaliacao.totalPseudopalavras || 0}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                ${avaliacao.questions ? avaliacao.questions.length : (avaliacao.questoes ? avaliacao.questoes.length : 0)}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button class="text-blue-600 hover:text-blue-900 mr-3 exportar-avaliacao" data-id="${avaliacao.id}" title="Exportar Prova">
                    <i class="fas fa-file-export"></i>
                </button>
                <button class="text-yellow-600 hover:text-yellow-900 mr-3 editar-avaliacao" data-id="${avaliacao.id}" title="Editar Avaliação">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="text-red-600 hover:text-red-900 excluir-avaliacao" data-id="${avaliacao.id}" title="Excluir Avaliação">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });

    // Configurar eventos dos botões
    adicionarEventListenersTabela();
}

// Função para adicionar event listeners aos botões da tabela
function adicionarEventListenersTabela() {
    // Event listeners para botões de editar (botão amarelo/laranja)
    document.querySelectorAll('.editar-avaliacao').forEach(btn => {
        btn.addEventListener('click', function () {
            isCreate = false;
            const id = parseInt(this.getAttribute('data-id'));
            localStorage.setItem('id', id);
            editarAvaliacao(id);
        });
    });

    // Event listeners para botões de exportar (botão azul)
    document.querySelectorAll('.exportar-avaliacao').forEach(btn => {
        btn.addEventListener('click', function () {
            const id = parseInt(this.getAttribute('data-id'));
            exportarProva(id);
        });
    });

    // Event listeners para botões de excluir (botão vermelho)
    document.querySelectorAll('.excluir-avaliacao').forEach(btn => {
        btn.addEventListener('click', function () {
            const id = parseInt(this.getAttribute('data-id'));
            excluirAvaliacao(id);
        });
    });
}

// Função para atualizar contadores no modal de edição
const atualizarContadoresEdit = () => {
    const totalPalavras = document.getElementById('lista-palavras-edit').children.length;
    const totalPseudopalavras = document.getElementById('lista-pseudopalavras-edit').children.length;
    const totalFrases = document.getElementById('lista-frases-edit').children.length;

    document.getElementById('contador-palavras-edit').textContent = totalPalavras;
    document.getElementById('contador-pseudopalavras-edit').textContent = totalPseudopalavras;
    document.getElementById('contador-frases-edit').textContent = totalFrases;

    // Atualizar classes de cor baseado nos limites
    const contadorPalavras = document.getElementById('contador-palavras-edit');
    const contadorPseudopalavras = document.getElementById('contador-pseudopalavras-edit');

    // Validação para palavras (limite: 200)
    if (totalPalavras > 200) {
        contadorPalavras.classList.add('text-red-500');
        contadorPalavras.classList.remove('text-green-500');
    } else {
        contadorPalavras.classList.add('text-green-500');
        contadorPalavras.classList.remove('text-red-500');
    }

    // Validação para pseudopalavras (limite: 60)
    if (totalPseudopalavras > 60) {
        contadorPseudopalavras.classList.add('text-red-500');
        contadorPseudopalavras.classList.remove('text-green-500');
    } else {
        contadorPseudopalavras.classList.add('text-green-500');
        contadorPseudopalavras.classList.remove('text-red-500');
    }
};

// Função para editar uma avaliação
function editarAvaliacao(id) {
    fetch(`${API_BASE_URL}/assessments/${id}`, {
        headers: {
            'Authorization': `Bearer ${getAuthToken()}`
        }
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Erro ao buscar avaliação');
            }
            return response.json();
        })
        .then(avaliacao => {
            console.log('Dados recebidos:', avaliacao);

            // Preencher campos básicos
            document.getElementById('nome-avaliacao-edit').value = avaliacao.name || '';
            document.getElementById('faixa-serie-edit').value = avaliacao.gradeRange || '';
            document.getElementById('texto-avaliacao-edit').value = avaliacao.text || '';

            // Limpar listas existentes
            document.getElementById('lista-palavras-edit').innerHTML = '';
            document.getElementById('lista-pseudopalavras-edit').innerHTML = '';
            document.getElementById('lista-frases-edit').innerHTML = '';
            document.getElementById('container-questoes-edit').innerHTML = '';

            // Carregar palavras
            if (avaliacao.words && Array.isArray(avaliacao.words)) {
                avaliacao.words.forEach(palavra => {
                    const div = document.createElement('div');
                    div.className = 'bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center';
                    div.innerHTML = `
                    ${palavra}
                    <button type="button" class="ml-2 text-blue-600 hover:text-blue-800">
                        <i class="fas fa-times-circle"></i>
                    </button>
                `;
                    document.getElementById('lista-palavras-edit').appendChild(div);
                });
            }

            // Carregar pseudopalavras
            if (avaliacao.pseudowords && Array.isArray(avaliacao.pseudowords)) {
                avaliacao.pseudowords.forEach(pseudopalavra => {
                    const div = document.createElement('div');
                    div.className = 'bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm flex items-center';
                    div.innerHTML = `
                    ${pseudopalavra}
                    <button type="button" class="ml-2 text-purple-600 hover:text-purple-800">
                        <i class="fas fa-times-circle"></i>
                    </button>
                `;
                    document.getElementById('lista-pseudopalavras-edit').appendChild(div);
                });
            }

            // Carregar frases
            if (avaliacao.phrases && Array.isArray(avaliacao.phrases)) {
                avaliacao.phrases.forEach(frase => {
                    const texto = typeof frase === 'string' ? frase : (frase.text || '');
                    const div = document.createElement('div');
                    div.className = 'bg-green-100 text-green-800 px-3 py-2 rounded-md text-sm flex items-center justify-between';
                    div.innerHTML = `
                    <span class="flex-1">${texto}</span>
                    <button type="button" class="ml-2 text-green-600 hover:text-green-800">
                        <i class="fas fa-times-circle"></i>
                    </button>
                `;
                    document.getElementById('lista-frases-edit').appendChild(div);
                });
            }

            // Carregar questões
            const containerQuestoesEdit = document.getElementById('container-questoes-edit');
            const semQuestoesEdit = document.getElementById('sem-questoes-edit');

            if (!avaliacao.questions || avaliacao.questions.length === 0) {
                semQuestoesEdit.classList.remove('hidden');
            } else {
                semQuestoesEdit.classList.add('hidden');
                avaliacao.questions.forEach(questao => {
                    const questaoDiv = document.createElement('div');
                    questaoDiv.className = 'questao border rounded-md p-4 bg-gray-50 relative';
                    questaoDiv.innerHTML = `
                    <button type="button" class="btn-remover-questao absolute top-2 right-2 text-red-500 hover:text-red-700">
                        <i class="fas fa-trash"></i>
                    </button>
                    
                    <div class="mb-3">
                        <label class="block text-sm font-medium text-gray-700 mb-1">Enunciado da Questão</label>
                        <textarea class="enunciado-questao w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
                            rows="2" placeholder="Digite o enunciado da questão">${questao.text}</textarea>
                    </div>
                    
                    <div class="space-y-2 mb-3">
                        <label class="block text-sm font-medium text-gray-700">Alternativas</label>
                        ${questao.options.map((opcao, index) => `
                            <div class="opcao-container flex items-center">
                                <input type="text" class="texto-opcao flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
                                    value="${opcao}" placeholder="Alternativa ${String.fromCharCode(65 + index)}">
                                <button type="button" class="btn-remover-opcao ml-2 text-red-500 hover:text-red-700">
                                    <i class="fas fa-times"></i>
                                </button>
                            </div>
                        `).join('')}
                    </div>
                    
                    <button type="button" class="btn-adicionar-opcao text-sm text-blue-600 hover:text-blue-800">
                        <i class="fas fa-plus mr-1"></i> Adicionar alternativa
                    </button>
                `;

                    // Adicionar event listeners para os botões
                    questaoDiv.querySelector('.btn-remover-questao').addEventListener('click', function () {
                        questaoDiv.remove();
                        if (containerQuestoesEdit.querySelectorAll('.questao').length === 0) {
                            semQuestoesEdit.classList.remove('hidden');
                        }
                    });

                    questaoDiv.querySelectorAll('.btn-remover-opcao').forEach(btn => {
                        btn.addEventListener('click', function () {
                            const opcoesContainer = this.closest('.space-y-2');
                            if (opcoesContainer.querySelectorAll('.opcao-container').length > 2) {
                                this.closest('.opcao-container').remove();
                            } else {
                                alert('É necessário ter pelo menos 2 alternativas.');
                            }
                        });
                    });

                    questaoDiv.querySelector('.btn-adicionar-opcao').addEventListener('click', function () {
                        const opcoesContainer = questaoDiv.querySelector('.space-y-2');
                        const novaOpcao = document.createElement('div');
                        novaOpcao.className = 'opcao-container flex items-center mt-2';
                        novaOpcao.innerHTML = `
                        <input type="text" class="texto-opcao flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
                            placeholder="Nova alternativa">
                        <button type="button" class="btn-remover-opcao ml-2 text-red-500 hover:text-red-700">
                            <i class="fas fa-times"></i>
                        </button>
                    `;

                        novaOpcao.querySelector('.btn-remover-opcao').addEventListener('click', function () {
                            if (opcoesContainer.querySelectorAll('.opcao-container').length > 2) {
                                novaOpcao.remove();
                            } else {
                                alert('É necessário ter pelo menos 2 alternativas.');
                            }
                        });

                        opcoesContainer.appendChild(novaOpcao);
                    });

                    containerQuestoesEdit.appendChild(questaoDiv);
                });
            }

            // Configurar os botões de remover após carregar todos os elementos
            configurarBotoesRemoverEdit();

            // Atualizar contadores
            atualizarContadoresEdit();

            // Mostrar o modal de edição
            modalEditarAvaliacao.classList.remove('hidden');
        })
        .catch(error => {
            console.error('Erro ao carregar avaliação:', error);
            alert('Erro ao carregar dados da avaliação. Por favor, tente novamente.');
        });
}

// Modificar a função configurarBotoesRemoverEdit para atualizar contadores
const configurarBotoesRemoverEdit = () => {
    // Configurar botões de remover palavras
    document.querySelectorAll('#lista-palavras-edit .bg-blue-100 button').forEach(btn => {
        btn.addEventListener('click', function () {
            this.closest('.bg-blue-100').remove();
            atualizarContadoresEdit();
        });
    });

    // Configurar botões de remover pseudopalavras
    document.querySelectorAll('#lista-pseudopalavras-edit .bg-purple-100 button').forEach(btn => {
        btn.addEventListener('click', function () {
            this.closest('.bg-purple-100').remove();
            atualizarContadoresEdit();
        });
    });

    // Configurar botões de remover frases
    document.querySelectorAll('#lista-frases-edit .bg-green-100 button').forEach(btn => {
        btn.addEventListener('click', function () {
            this.closest('.bg-green-100').remove();
            atualizarContadoresEdit();
        });
    });
};

// Modificar as funções de adicionar para atualizar contadores
const adicionarPalavraEdit = () => {
    const novaPalavraEdit = document.getElementById('nova-palavra-edit');
    const texto = novaPalavraEdit.value.trim();

    if (texto === '') {
        alert('Por favor, digite uma palavra para adicionar.');
        return;
    }

    const palavras = texto.split(/,|\n/).map(p => p.trim()).filter(p => p !== '');
    const listaPalavrasEdit = document.getElementById('lista-palavras-edit');

    palavras.forEach(palavra => {
        const palavrasExistentes = Array.from(listaPalavrasEdit.children).map(el =>
            el.textContent.trim().replace(/[×✕]$/, '').trim()
        );

        if (!palavrasExistentes.includes(palavra)) {
            const div = document.createElement('div');
            div.className = 'bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center';
            div.innerHTML = `
                ${palavra}
                <button type="button" class="ml-2 text-blue-600 hover:text-blue-800">
                    <i class="fas fa-times-circle"></i>
                </button>
            `;
            adicionarEventListenerRemover(div);
            listaPalavrasEdit.appendChild(div);
        }
    });

    novaPalavraEdit.value = '';
    novaPalavraEdit.focus();
    atualizarContadoresEdit();
};

const adicionarPseudopalavraEdit = () => {
    const novaPseudopalavraEdit = document.getElementById('nova-pseudopalavra-edit');
    const texto = novaPseudopalavraEdit.value.trim();

    if (texto === '') {
        alert('Por favor, digite uma pseudopalavra para adicionar.');
        return;
    }

    const pseudopalavras = texto.split(/,|\n/).map(p => p.trim()).filter(p => p !== '');
    const listaPseudopalavrasEdit = document.getElementById('lista-pseudopalavras-edit');

    pseudopalavras.forEach(pseudopalavra => {
        const pseudopalavrasExistentes = Array.from(listaPseudopalavrasEdit.children).map(el =>
            el.textContent.trim().replace(/[×✕]$/, '').trim()
        );

        if (!pseudopalavrasExistentes.includes(pseudopalavra)) {
            const div = document.createElement('div');
            div.className = 'bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm flex items-center';
            div.innerHTML = `
                ${pseudopalavra}
                <button type="button" class="ml-2 text-purple-600 hover:text-purple-800">
                    <i class="fas fa-times-circle"></i>
                </button>
            `;
            adicionarEventListenerRemover(div);
            listaPseudopalavrasEdit.appendChild(div);
        }
    });

    novaPseudopalavraEdit.value = '';
    novaPseudopalavraEdit.focus();
    atualizarContadoresEdit();
};

const adicionarFraseEdit = () => {
    const novaFraseEdit = document.getElementById('nova-frase-edit');
    const texto = novaFraseEdit.value.trim();

    if (texto === '') {
        alert('Por favor, digite uma frase para adicionar.');
        return;
    }

    const frases = texto.split(/,|\n/).map(f => f.trim()).filter(f => f !== '');
    const listaFrasesEdit = document.getElementById('lista-frases-edit');

    frases.forEach(frase => {
        const frasesExistentes = Array.from(listaFrasesEdit.children).map(el =>
            el.textContent.trim().replace(/[×✕]$/, '').trim()
        );

        if (!frasesExistentes.includes(frase)) {
            const div = document.createElement('div');
            div.className = 'bg-green-100 text-green-800 px-3 py-2 rounded-md text-sm flex items-center justify-between';
            div.innerHTML = `
                <span class="flex-1">${frase}</span>
                <button type="button" class="ml-2 text-green-600 hover:text-green-800">
                    <i class="fas fa-times-circle"></i>
                </button>
            `;
            adicionarEventListenerRemover(div);
            listaFrasesEdit.appendChild(div);
        }
    });

    novaFraseEdit.value = '';
    novaFraseEdit.focus();
    atualizarContadoresEdit();
};

// Função para excluir uma avaliação
function excluirAvaliacao(id) {
    if (confirm('Tem certeza que deseja excluir esta avaliação?')) {
        fetch(`${API_BASE_URL}/assessments/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`
            }
        })
            .then(async (response) => {
                if (response.status != 500 || response.status != 400) {
                    const error = await response.json();
                    alert(error.message);
                    throw new Error('Erro ao excluir avaliação');
                }
                return response.json();
            })
            .then(() => {
                // Remover a avaliação da lista local
                avaliacoes = avaliacoes.filter(a => a.id !== id);
                // Atualizar a tabela
                mostrarAvaliacoesNaTabela(avaliacoes);
                alert('Avaliação excluída com sucesso!');
            })
            .catch(error => {
                console.error('Erro ao excluir avaliação:', error);
                alert('Erro ao excluir avaliação. Por favor, tente novamente.');
            });
    }
}

// Sobrescrever a função atualizarTabelaAvaliacoes para usar a nova implementação
function atualizarTabelaAvaliacoes() {
    mostrarAvaliacoesNaTabela(avaliacoes);
}

// Abrir e fechar modal simples


if (fecharModalSimples) {
    fecharModalSimples.addEventListener('click', function () {
        modalEnvioSimples.classList.add('hidden');
    });
}

if (cancelarEnvioSimples) {
    cancelarEnvioSimples.addEventListener('click', function () {
        modalEnvioSimples.classList.add('hidden');
    });
}



// var associarEvento = async () => {
//     try {
//         const response = await fetch(`${API_BASE_URL}/assessments/${1})}/associate-event`, {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json',
//                 'Authorization': `Bearer ${getAuthToken()}`
//             },
//             body: JSON.stringify({ assessmentEventId: 1 })
//         });

//         if (!response.ok) {
//             throw new Error('Erro ao associar evento');
//         }

//         return response.json();
//     } catch (error) {
//         console.error('Erro ao associar evento:', error);
//     }
// }
// Submissão do formulário de evento
formEvento.addEventListener('submit', function (e) {
    e.preventDefault();

    const nomeEvento = document.getElementById('nome-evento').value;

    // Data de hoje para data de início
    const dataHoje = new Date();
    // const dataInicio = dataHoje.toISOString().split('T')[0];

    // Data 6 meses no futuro para data fim
    const dataFim = new Date();
    dataFim.setMonth(dataFim.getMonth() + 6);
    const dataFimFormatada = dataFim.toISOString().split('T')[0];

    if (nomeEvento.trim() === '') {
        alert('Por favor, informe o nome do evento');
        return;
    }


    // Desabilitar o botão de submit para evitar múltiplos envios
    const btnSubmit = formEvento.querySelector('button[type="submit"]');
    btnSubmit.disabled = true;
    btnSubmit.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Salvando...';

    // Criar objeto de dados conforme formato solicitado pela API
    const dadosEvento = {
        name: nomeEvento,
        status: "ACTIVE"
    };

    console.log('Dados do evento a serem enviados:', dadosEvento);

    if (eventoIdEmEdicao === null) {
        // Adicionar novo evento
        fetch(API_BASE_URL + '/assessment-events', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getAuthToken()}`
            },
            body: JSON.stringify(dadosEvento)
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Erro ao adicionar evento');
                }
                return response.json();
            })
            .then(data => {
                // Mostrar notificação de sucesso
                alert('Evento adicionado com sucesso!');
                // associarEvento

                // Fechar o modal
                modalEvento.classList.add('hidden');

                // Recarregar eventos
                carregarEventos();
            }).finally(() => {
                // Reativar o botão de submit
                btnSubmit.disabled = false;
                btnSubmit.innerHTML = 'Salvar';
            });



    } else {
        // Atualizar evento existente
        fetch(`${API_BASE_URL_NO_API}/api/assessment-events/${eventoIdEmEdicao}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getAuthToken()}`
            },
            body: JSON.stringify(dadosEvento)
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Erro ao atualizar evento');
                }
                return response.json();
            })
            .then(data => {
                // Mostrar notificação de sucesso
                alert('Evento atualizado com sucesso!');

                // Fechar o modal
                modalEvento.classList.add('hidden');

                // Recarregar eventos
                carregarEventos();
            })
            .catch(error => {
                console.error('Erro ao atualizar evento:', error);
                alert('Erro ao atualizar evento. Por favor, tente novamente.');
            })
            .finally(() => {
                // Reativar o botão de submit
                btnSubmit.disabled = false;
                btnSubmit.innerHTML = 'Salvar';
            });
    }
});

// Função para carregar as avaliações disponíveis para o select de eventos
async function carregarAvaliacoesParaSelect() {
    const avaliacaoSelect = document.getElementById('avaliacao-evento');

    // Limpar opções atuais, mantendo a opção default
    while (avaliacaoSelect.options.length > 1) {
        avaliacaoSelect.remove(1);
    }

    // Mostrar indicador de carregamento
    avaliacaoSelect.innerHTML = '<option value="">Carregando avaliações...</option>';

    return fetch(API_BASE_URL + '/assessments', {
        headers: {
            'Authorization': `Bearer ${getAuthToken()}`
        }
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Erro ao buscar avaliações');
            }
            return response.json();
        })
        .then(data => {
            // Limpar opção de carregamento
            avaliacaoSelect.innerHTML = '<option value="">Selecione uma avaliação</option>';

            // Adicionar as avaliações ao select
            data.forEach(avaliacao => {
                const option = document.createElement('option');
                option.value = avaliacao.id;
                option.textContent = avaliacao.name || avaliacao.nome;
                avaliacaoSelect.appendChild(option);
            });

            return data; // Retornar os dados para encadeamento de promises
        })
        .catch(error => {
            console.error('Erro ao carregar avaliações para o select:', error);
            avaliacaoSelect.innerHTML = '<option value="">Erro ao carregar avaliações</option>';
            throw error; // Propagar o erro para que o .catch de quem chamou trate
        });
}

// Função para editar um evento
function editarEvento(id) {
    // Verificar se a API de eventos está disponível
    if (window.EventosAPI && typeof window.EventosAPI.getAssessmentEventById === 'function') {
        // Usar a API mais moderna
        window.EventosAPI.getAssessmentEventById(id)
            .then(evento => {
                console.log('Dados do evento obtidos:', evento);

                // Preencher o formulário com os dados do evento
                document.getElementById('nome-evento').value = evento.nome;
                document.getElementById('status-evento').checked = evento.status === 'ACTIVE';

                // Carregar avaliações e selecionar a correta
                carregarAvaliacoesParaSelect().then(() => {
                    document.getElementById('avaliacao-evento').value = evento.assessmentId;
                });

                // Atualizar o ID em edição
                eventoIdEmEdicao = evento.id;

                // Alterar título do modal
                document.querySelector('#modal-evento h3').textContent = 'Editar Evento de Avaliação';

                // Exibir o modal
                modalEvento.classList.remove('hidden');
            })
            .catch(error => {
                console.error('Erro ao editar evento:', error);
                alert('Erro ao carregar dados do evento. Por favor, tente novamente.');
            });
    } else {
        // Fallback para o método antigo
        fetch(`${API_BASE_URL}/api/assessment-events/${id}`, {
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`
            }
        })
            .then(async response => {
                if (!response.ok) {
                    throw new Error('Erro ao buscar detalhes do evento');
                }
                const data = await response.json();
                return data;
            })
            .then(evento => {
                // Preencher o formulário com os dados do evento
                console.log(evento);
                document.getElementById('nome-evento').value = evento.name ?? "Sem nome";
                // document.getElementById('status-evento').checked = evento.status === 'ACTIVE';

                // Carregar avaliações e selecionar a correta
                carregarAvaliacoesParaSelect().then(() => {
                    document.getElementById('avaliacao-evento').value = evento.assessmentId;
                });

                // Atualizar o ID em edição
                eventoIdEmEdicao = evento.id;

                // Alterar título do modal
                document.querySelector('#modal-evento h3').textContent = 'Editar Evento de Avaliação';

                // Exibir o modal
                modalEvento.classList.remove('hidden');
            })
            .catch(error => {
                console.error('Erro ao editar evento:', error);
                alert('Erro ao carregar dados do evento. Por favor, tente novamente.');
            });
    }
}

// Função para excluir um evento
function excluirEvento(id) {
    if (confirm('Tem certeza que deseja excluir este evento?')) {
        // Verificar se a API de eventos está disponível
        if (window.EventosAPI && typeof window.EventosAPI.deleteAssessmentEvent === 'function') {
            // Usar a API mais moderna
            window.EventosAPI.deleteAssessmentEvent(id)
                .then(data => {
                    alert('Evento excluído com sucesso!');
                    carregarEventos();
                })
                .catch(error => {
                    console.error('Erro ao excluir evento:', error);
                    alert('Erro ao excluir evento. Por favor, tente novamente.');
                });
        } else {
            // Fallback para o método antigo
            fetch(`${API_BASE_URL}/assessment-events/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${getAuthToken()}`
                }
            })
                .then(response => {
                    if([200,201,204].includes(response.status)) alert('Evento excluído com sucesso!')
                    return response.json();
                })
                .then(data => {
                    carregarEventos();
                })
        }
    }
}

// Sobrescrever a função atualizarTabelaEventos para usar a nova implementação
function atualizarTabelaEventos() {
    mostrarEventosNaTabela(eventos);
}

// Função para exportar uma prova
async function exportarProva(id) {
    // Mostrar indicador de processamento
    const loadingOverlay = document.createElement('div');
    loadingOverlay.className = 'fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50';
    loadingOverlay.innerHTML = `
        <div class="bg-white p-5 rounded-lg shadow-lg text-center">
            <div class="mb-3">
                <i class="fas fa-spinner fa-spin text-blue-600 text-4xl"></i>
            </div>
            <p class="text-gray-700">Gerando documento de prova...</p>
        </div>
    `;
    document.body.appendChild(loadingOverlay);

    // Buscar link de download da API
    const response = await fetch(`${API_BASE_URL}/assessments/${id}/document`, {
        headers: {
            'Authorization': `Bearer ${getAuthToken()}`
        }
    }).then(e => e.json())

    if(response.message === "Document generated successfully") document.body.removeChild(loadingOverlay)

    const a = document.createElement("a")
    a.href = `${API_BASE_URL_NO_API}${response.url}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
}

// Event listeners para o modal de edição
fecharModalEditarAvaliacao.addEventListener('click', () => {
    modalEditarAvaliacao.classList.add('hidden');
});

cancelarEditarAvaliacao.addEventListener('click', () => {
    modalEditarAvaliacao.classList.add('hidden');
});

function adicionarQuestaoExistente(questao, isEdit = false) {
    const containerQuestoes = isEdit ? document.getElementById('container-questoes-edit') : document.getElementById('container-questoes');
    const template = isEdit ? document.getElementById('template-questao-edit') : document.getElementById('template-questao');

    const novaQuestao = template.cloneNode(true);
    novaQuestao.classList.remove('questao-template', 'hidden');
    novaQuestao.classList.add('questao');

    const enunciado = novaQuestao.querySelector('.enunciado-questao');
    enunciado.value = questao.text;

    const opcoesContainer = novaQuestao.querySelector('.space-y-2');
    opcoesContainer.innerHTML = '';

    questao.options.forEach((opcao, index) => {
        const divOpcao = document.createElement('div');
        divOpcao.className = 'opcao-container flex items-center';
        divOpcao.innerHTML = `
            <input type="text" class="texto-opcao flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
                value="${opcao}" placeholder="Alternativa ${String.fromCharCode(65 + index)}">
            <button type="button" class="btn-remover-opcao ml-2 text-red-500 hover:text-red-700">
                <i class="fas fa-times"></i>
            </button>
        `;
        opcoesContainer.appendChild(divOpcao);
    });

    containerQuestoes.appendChild(novaQuestao);

    // Configurar eventos dos botões
    novaQuestao.querySelector('.btn-remover-questao').addEventListener('click', () => {
        novaQuestao.remove();
        const questoes = containerQuestoes.querySelectorAll('.questao:not(.questao-template)');
        if (questoes.length === 0) {
            const semQuestoes = isEdit ? document.getElementById('sem-questoes-edit') : document.getElementById('sem-questoes');
            semQuestoes.classList.remove('hidden');
        }
    });

    novaQuestao.querySelectorAll('.btn-remover-opcao').forEach(btn => {
        btn.addEventListener('click', function () {
            const opcoesContainer = this.closest('.space-y-2');
            if (opcoesContainer.querySelectorAll('.opcao-container').length > 2) {
                this.closest('.opcao-container').remove();
            } else {
                alert('É necessário ter pelo menos 2 alternativas.');
            }
        });
    });

    novaQuestao.querySelector('.btn-adicionar-opcao').addEventListener('click', () => {
        const novaOpcao = document.createElement('div');
        novaOpcao.className = 'opcao-container flex items-center';
        novaOpcao.innerHTML = `
            <input type="text" class="texto-opcao flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
                placeholder="Nova alternativa">
            <button type="button" class="btn-remover-opcao ml-2 text-red-500 hover:text-red-700">
                <i class="fas fa-times"></i>
            </button>
        `;

        opcoesContainer.appendChild(novaOpcao);

        novaOpcao.querySelector('.btn-remover-opcao').addEventListener('click', function () {
            if (opcoesContainer.querySelectorAll('.opcao-container').length > 2) {
                novaOpcao.remove();
            } else {
                alert('É necessário ter pelo menos 2 alternativas.');
            }
        });
    });
}

// Adicionar event listeners para os botões de adicionar no modal de edição
document.getElementById('adicionar-palavra-edit').addEventListener('click', adicionarPalavraEdit);
document.getElementById('adicionar-pseudopalavra-edit').addEventListener('click', adicionarPseudopalavraEdit);
document.getElementById('adicionar-frase-edit').addEventListener('click', adicionarFraseEdit);

// Adicionar event listeners para tecla Enter nos campos de input do modal de edição
document.getElementById('nova-palavra-edit').addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
        e.preventDefault();
        adicionarPalavraEdit();
    }
});

document.getElementById('nova-pseudopalavra-edit').addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
        e.preventDefault();
        adicionarPseudopalavraEdit();
    }
});

document.getElementById('nova-frase-edit').addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
        e.preventDefault();
        adicionarFraseEdit();
    }
});

// Adicionar event listener para contagem de palavras no texto de edição
document.getElementById('texto-avaliacao-edit').addEventListener('input', function () {
    const texto = this.value.trim();
    const palavras = texto === '' ? 0 : texto.split(/\s+/).length;
    const contagemPalavrasEdit = document.getElementById('contagem-palavras-edit');

    contagemPalavrasEdit.textContent = palavras;

    if (palavras < 150 || palavras > 400) {
        contagemPalavrasEdit.classList.add('text-red-500');
        contagemPalavrasEdit.classList.remove('text-green-500');
    } else {
        contagemPalavrasEdit.classList.add('text-green-500');
        contagemPalavrasEdit.classList.remove('text-red-500');
    }
});

// Função para adicionar nova questão no modal de edição
document.getElementById('adicionar-questao-edit').addEventListener('click', function () {
    const containerQuestoesEdit = document.getElementById('container-questoes-edit');
    const semQuestoesEdit = document.getElementById('sem-questoes-edit');

    const questaoDiv = document.createElement('div');
    questaoDiv.className = 'questao border rounded-md p-4 bg-gray-50 relative';
    questaoDiv.innerHTML = `
        <button type="button" class="btn-remover-questao absolute top-2 right-2 text-red-500 hover:text-red-700">
            <i class="fas fa-trash"></i>
        </button>
        
        <div class="mb-3">
            <label class="block text-sm font-medium text-gray-700 mb-1">Enunciado da Questão</label>
            <textarea class="enunciado-questao w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
                rows="2" placeholder="Digite o enunciado da questão"></textarea>
        </div>
        
        <div class="space-y-2 mb-3">
            <label class="block text-sm font-medium text-gray-700">Alternativas</label>
            <div class="opcao-container flex items-center">
                <input type="text" class="texto-opcao flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
                    placeholder="Alternativa A">
                <button type="button" class="btn-remover-opcao ml-2 text-red-500 hover:text-red-700">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="opcao-container flex items-center">
                <input type="text" class="texto-opcao flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
                    placeholder="Alternativa B">
                <button type="button" class="btn-remover-opcao ml-2 text-red-500 hover:text-red-700">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        </div>
        
        <button type="button" class="btn-adicionar-opcao text-sm text-blue-600 hover:text-blue-800">
            <i class="fas fa-plus mr-1"></i> Adicionar alternativa
        </button>
    `;

    containerQuestoesEdit.appendChild(questaoDiv);
    semQuestoesEdit.classList.add('hidden');

    // Adicionar eventos aos botões da nova questão
    questaoDiv.querySelector('.btn-remover-questao').addEventListener('click', function () {
        questaoDiv.remove();
        const questoes = containerQuestoesEdit.querySelectorAll('.questao:not(.questao-template)');
        if (questoes.length === 0) {
            semQuestoesEdit.classList.remove('hidden');
        }
    });

    questaoDiv.querySelectorAll('.btn-remover-opcao').forEach(btn => {
        btn.addEventListener('click', function () {
            const opcoesContainer = this.closest('.space-y-2');
            this.closest('.opcao-container').remove();

        });
    });

    questaoDiv.querySelector('.btn-adicionar-opcao').addEventListener('click', function () {
        const opcoesContainer = questaoDiv.querySelector('.space-y-2');
        const novaOpcao = document.createElement('div');
        novaOpcao.className = 'opcao-container flex items-center mt-2';
        novaOpcao.innerHTML = `
            <input type="text" class="texto-opcao flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
                placeholder="Nova alternativa">
            <button type="button" class="btn-remover-opcao ml-2 text-red-500 hover:text-red-700">
                <i class="fas fa-times"></i>
            </button>
        `;

        novaOpcao.querySelector('.btn-remover-opcao').addEventListener('click', function () {
            if (opcoesContainer.querySelectorAll('.opcao-container').length > 2) {
                novaOpcao.remove();
            } else {
                alert('É necessário ter pelo menos 2 alternativas.');
            }
        });

        opcoesContainer.appendChild(novaOpcao);
    });
});

// Função para salvar edição
btnSalvarEditarAvaliacao.addEventListener('click', async () => {
    const nomeAvaliacao = document.getElementById('nome-avaliacao-edit').value;
    const texto = document.getElementById('texto-avaliacao-edit').value;
    const questoesElements = document.querySelectorAll('#container-questoes-edit .questao:not(.questao-template)');
    const questoesAdicionadas = Array.from(questoesElements).map(questaoEl => {
        const enunciado = questaoEl.querySelector('.enunciado-questao').value;
        const opcoes = Array.from(questaoEl.querySelectorAll('.opcao-container')).map(opt =>
            opt.querySelector('.texto-opcao').value
        ).filter(texto => texto.trim() !== ''); // Filtrar opções vazias

        return {
            text: enunciado,
            options: opcoes,
        };
    }).filter(questao => questao.text.trim() !== ''); // Filtrar questões inválidas

    if (nomeAvaliacao.trim() === '') {
        alert('Por favor, informe o nome da avaliação.');
        return;
    }

    const request = {
        name: nomeAvaliacao,
        text: texto,
        words: Array.from(document.getElementById('lista-palavras-edit').children).map(el =>
            el.textContent.trim().replace(/[×✕]$/, '').trim()
        ),
        pseudowords: Array.from(document.getElementById('lista-pseudopalavras-edit').children).map(el =>
            el.textContent.trim().replace(/[×✕]$/, '').trim()
        ),
        phrases: Array.from(document.getElementById('lista-frases-edit').children).map(el => ({
            text: el.querySelector('span').textContent.trim()
        })),
        questions: questoesAdicionadas,
        gradeRange: document.getElementById('faixa-serie-edit').value,
        totalWords: document.getElementById('lista-palavras-edit').children.length,
        totalPseudowords: document.getElementById('lista-pseudopalavras-edit').children.length,
    };

    const id = localStorage.getItem('id');
    if (!id) {
        alert('ID da avaliação não encontrado');
        return;
    }

    try {
        await handleUpdateAssessment(id, request);
    } catch (error) {
        console.error('Erro ao salvar avaliação:', error);
        alert(`Erro ao salvar avaliação: ${error.message}`);
    }
});

// Função para adicionar event listener de remoção aos elementos
function adicionarEventListenerRemover(elemento) {
    const btnRemover = elemento.querySelector('button');
    if (btnRemover) {
        btnRemover.addEventListener('click', function () {
            elemento.remove();
            atualizarContadoresEdit();
        });
    }
}

// Função para carregar uma avaliação específica
async function carregarAvaliacao(id) {
    try {
        const response = await fetch(`${window.API_BASE_URL}/assessments/${id}`, {
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`
            }
        });

        if (!response.ok) {
            throw new Error('Erro ao buscar avaliação');
        }

        return await response.json();
    } catch (error) {
        console.error('Erro ao carregar avaliação:', error);
        throw error;
    }
}