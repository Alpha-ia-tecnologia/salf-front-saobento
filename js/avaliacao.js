// Inicializar listas
const avaliacoesList = document.getElementById('avaliacoes-list');

// Função para obter o token de autenticação do localStorage
function getAuthToken() {
    return localStorage.getItem('token') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IlVzdWFyaW8gU0FMRiIsImlhdCI6MTUxNjIzOTAyMn0.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
}

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
            avaliacaoIdEmEdicao = null;
            resetFormAvaliacao();
            document.querySelector('#modal-avaliacao h3').textContent = 'Nova Avaliação';
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

// Submissão do formulário de avaliação
formAvaliacao.addEventListener('submit', function (e) {
    e.preventDefault();

    const nomeAvaliacao = document.getElementById('nome-avaliacao').value;
    const texto = textoAvaliacao.value;

    if (nomeAvaliacao.trim() === '') {
        alert('Por favor, informe o nome da avaliação.');
        return;
    }

    if (palavrasAdicionadas.length === 0) {
        alert('Por favor, adicione pelo menos uma palavra à avaliação.');
        return;
    }

    if (pseudopalavrasAdicionadas.length === 0) {
        alert('Por favor, adicione pelo menos uma pseudopalavra à avaliação.');
        return;
    }

    if (texto.trim() === '') {
        alert('Por favor, adicione o texto para a avaliação.');
        return;
    }

    const contarPalavras = texto.trim().split(/\s+/).length;
    if (contarPalavras < 150 || contarPalavras > 180) {
        alert('O texto deve conter entre 150 e 180 palavras.');
        return;
    }

    // Coletar questões do formulário
    const questoes = [];
    document.querySelectorAll('.questao:not(.questao-template)').forEach(questaoEl => {
        const enunciado = questaoEl.querySelector('.enunciado-questao').value;
        const opcoes = [];
        let respostaCorreta = null;

        questaoEl.querySelectorAll('.opcao-container').forEach((opcaoEl, index) => {
            const texto = opcaoEl.querySelector('.texto-opcao').value;
            const selecionada = opcaoEl.querySelector('.resposta-correta').checked;

            if (texto.trim()) {
                opcoes.push(texto);
                if (selecionada) {
                    respostaCorreta = index;
                }
            }
        });

        if (enunciado.trim() && opcoes.length >= 2 && respostaCorreta !== null) {
            questoes.push({
                enunciado,
                opcoes,
                respostaCorreta
            });
        }
    });

    if (avaliacaoIdEmEdicao === null) {
        // Adicionar nova avaliação
        const novaAvaliacao = {
            id: avaliacoes.length > 0 ? Math.max(...avaliacoes.map(a => a.id)) + 1 : 1,
            nome: nomeAvaliacao,
            palavras: [...palavrasAdicionadas],
            pseudopalavras: [...pseudopalavrasAdicionadas],
            frases: [...frasesAdicionadas],
            texto: texto,
            totalPalavras: palavrasAdicionadas.length,
            totalPseudopalavras: pseudopalavrasAdicionadas.length,
            questoes: questoes
        };

        avaliacoes.push(novaAvaliacao);
        alert('Avaliação adicionada com sucesso!');
    } else {
        // Atualizar avaliação existente
        const index = avaliacoes.findIndex(a => a.id === avaliacaoIdEmEdicao);
        if (index !== -1) {
            avaliacoes[index].nome = nomeAvaliacao;
            avaliacoes[index].palavras = [...palavrasAdicionadas];
            avaliacoes[index].pseudopalavras = [...pseudopalavrasAdicionadas];
            avaliacoes[index].frases = [...frasesAdicionadas];
            avaliacoes[index].texto = texto;
            avaliacoes[index].totalPalavras = palavrasAdicionadas.length;
            avaliacoes[index].totalPseudopalavras = pseudopalavrasAdicionadas.length;
            avaliacoes[index].questoes = questoes;
            alert('Avaliação atualizada com sucesso!');
        }
    }

    atualizarTabelaAvaliacoes();
    modalAvaliacao.classList.add('hidden');
});

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
        fetch('https://salf-salf-api.py5r5i.easypanel.host/api/assessment-events', {
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`
            }
        })
            .then(response => {
                if (!response.ok) {
                }
                return response.json();
            })
            .then(data => {
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
        fetch(`https://salf-salf-api.py5r5i.easypanel.host/api/assessments/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`
            }
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Erro ao excluir avaliação');
                }
                return response.json();
            })
            .then(data => {
                alert('Avaliação excluída com sucesso!');
                // Recarregar as avaliações e eventos após a exclusão
                carregarAvaliacoes();
                carregarEventos();
            })
            .catch(error => {
                console.error('Erro ao excluir avaliação:', error);
                alert('Erro ao excluir avaliação. Por favor, tente novamente.');
            });
    }
}

// Adição de palavras
adicionarPalavra.addEventListener('click', function () {
    adicionarPalavrasMultiplas();
});

// Permitir pressionar Enter para adicionar palavras
novaPalavra.addEventListener('keypress', function (e) {
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
novaPseudopalavra.addEventListener('keypress', function (e) {
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
novaFrase.addEventListener('keypress', function (e) {
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
            frasesAdicionadas.push(frase);
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
    if (palavras < 150 || palavras > 180) {
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

function adicionarPalavraAoDOM(palavra) {
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
        palavrasAdicionadas = palavrasAdicionadas.filter(p => p !== palavraParaRemover);
        div.remove();
    });

    listaPalavras.appendChild(div);
}

function adicionarPseudopalavraAoDOM(pseudopalavra) {
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
        pseudopalavrasAdicionadas = pseudopalavrasAdicionadas.filter(p => p !== pseudopalavraParaRemover);
        div.remove();
    });

    listaPseudopalavras.appendChild(div);
}

function adicionarFraseAoDOM(frase) {
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
        frasesAdicionadas = frasesAdicionadas.filter(f => f !== fraseParaRemover);
        div.remove();
    });

    listaFrases.appendChild(div);
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

    if (palavras < 150 || palavras > 180) {
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

function preencherFormEvento(evento) {
    document.getElementById('nome-evento').value = evento.nome;
    document.getElementById('avaliacao-evento').value = evento.avaliacaoId;
    document.getElementById('status-evento').checked = evento.ativo;
}

// Função para carregar as avaliações da API
function carregarAvaliacoes() {
    fetch('https://salf-salf-api.py5r5i.easypanel.host/api/assessments', {
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
            // Atualizar a variável de avaliações
            avaliacoes = data;
            // Atualizar a exibição na tabela
            mostrarAvaliacoesNaTabela(avaliacoes);
        })
        .catch(error => {
            console.error('Erro ao carregar avaliações:', error);
            alert('Erro ao carregar avaliações. Por favor, tente novamente.');
        });
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
            const id = parseInt(this.getAttribute('data-id'));
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

// Função para editar uma avaliação
function editarAvaliacao(id) {
    // Se a função existir no novo script, usar ela
    if (typeof abrirModalEditarAvaliacao === 'function') {
        abrirModalEditarAvaliacao(id);
        return;
    }

    // Implementação antiga como fallback
    fetch(`https://salf-salf-api.py5r5i.easypanel.host/api/assessments/${id}`, {
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
            avaliacaoIdEmEdicao = id;

            // Preencher o formulário com os dados da avaliação
            document.getElementById('nome-avaliacao').value = avaliacao.name || avaliacao.nome;
            textoAvaliacao.value = avaliacao.text || avaliacao.texto;

            // Atualizar contagem de palavras
            const texto = textoAvaliacao.value.trim();
            const palavras = texto === '' ? 0 : texto.split(/\s+/).length;
            contagemPalavras.textContent = palavras;

            // Adicionar palavras, se houver
            listaPalavras.innerHTML = '';
            palavrasAdicionadas = [];
            if (avaliacao.words && avaliacao.words.length > 0) {
                avaliacao.words.forEach(palavra => {
                    adicionarPalavraAoDOM(palavra);
                    palavrasAdicionadas.push(palavra);
                });
            } else if (avaliacao.palavras && avaliacao.palavras.length > 0) {
                avaliacao.palavras.forEach(palavra => {
                    adicionarPalavraAoDOM(palavra);
                    palavrasAdicionadas.push(palavra);
                });
            }

            // Adicionar pseudopalavras, se houver
            listaPseudopalavras.innerHTML = '';
            pseudopalavrasAdicionadas = [];
            if (avaliacao.pseudowords && avaliacao.pseudowords.length > 0) {
                avaliacao.pseudowords.forEach(pseudopalavra => {
                    adicionarPseudopalavraAoDOM(pseudopalavra);
                    pseudopalavrasAdicionadas.push(pseudopalavra);
                });
            } else if (avaliacao.pseudopalavras && avaliacao.pseudopalavras.length > 0) {
                avaliacao.pseudopalavras.forEach(pseudopalavra => {
                    adicionarPseudopalavraAoDOM(pseudopalavra);
                    pseudopalavrasAdicionadas.push(pseudopalavra);
                });
            }

            // Adicionar frases, se houver
            listaFrases.innerHTML = '';
            frasesAdicionadas = [];
            if (avaliacao.phrases && avaliacao.phrases.length > 0) {
                avaliacao.phrases.forEach(frase => {
                    adicionarFraseAoDOM(frase.text);
                    frasesAdicionadas.push(frase.text);
                });
            } else if (avaliacao.sentences && avaliacao.sentences.length > 0) {
                avaliacao.sentences.forEach(frase => {
                    adicionarFraseAoDOM(frase);
                    frasesAdicionadas.push(frase);
                });
            } else if (avaliacao.frases && avaliacao.frases.length > 0) {
                avaliacao.frases.forEach(frase => {
                    adicionarFraseAoDOM(frase.text || frase);
                    frasesAdicionadas.push(frase.text || frase);
                });
            }

            // Adicionar questões, se houver
            resetQuestoes();
            if (avaliacao.questions && avaliacao.questions.length > 0) {
                avaliacao.questions.forEach(questao => {
                    const questaoData = {
                        enunciado: questao.text,
                        opcoes: questao.options,
                        respostaCorreta: 0 // Assumindo que a primeira opção é a correta
                    };
                    adicionarQuestao(questaoData);
                });
            } else if (avaliacao.questoes && avaliacao.questoes.length > 0) {
                avaliacao.questoes.forEach(questao => {
                    const questaoData = {
                        enunciado: questao.text || questao.enunciado,
                        opcoes: questao.options || questao.opcoes,
                        respostaCorreta: 0 // Assumindo que a primeira opção é a correta
                    };
                    adicionarQuestao(questaoData);
                });
            }

            // Mostrar o modal de edição
            document.querySelector('#modal-avaliacao h3').textContent = 'Editar Avaliação';
            modalAvaliacao.classList.remove('hidden');
        })
        .catch(error => {
            console.error('Erro ao editar avaliação:', error);
            alert('Erro ao editar avaliação. Por favor, tente novamente.');
        });
}

// Função para excluir uma avaliação
function excluirAvaliacao(id) {
    if (confirm('Tem certeza que deseja excluir esta avaliação?')) {
        fetch(`https://salf-salf-api.py5r5i.easypanel.host/api/assessments/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`
            }
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Erro ao excluir avaliação');
                }
                return response.text();
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

// Submissão do formulário simples
if (formEnvioSimples) {
    formEnvioSimples.addEventListener('submit', function (e) {
        e.preventDefault();

        const nomeProva = document.getElementById('nome-prova').value;
        const descricaoProva = document.getElementById('descricao-prova').value;

        if (nomeProva.trim() === '') {
            alert('Por favor, informe o nome da prova.');
            return;
        }

        // Criar objeto de dados conforme o formato da API
        const dadosEnvio = {
            name: nomeProva,
            description: descricaoProva
        };

        // Enviar para a API
        fetch('https://salf-salf-api.py5r5i.easypanel.host/api/assessments', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getAuthToken()}`
            },
            body: JSON.stringify(dadosEnvio)
        })
            .then(response => {
                if (!response.ok) {
                }
                console.log(response)
            })
            .then(data => {
                alert('Avaliação criada com sucesso!');
                modalEnvioSimples.classList.add('hidden');

                // Limpar formulário
                document.getElementById('nome-prova').value = '';
                document.getElementById('descricao-prova').value = '';

                // Atualizar lista de avaliações
                carregarAvaliacoes();
            })
            .catch(error => {
                console.error('Erro ao enviar avaliação:', error);
            });
    });
}

 var associarEvento = async () => {
    try {
        const response = await fetch(`https://salf-salf-api.py5r5i.easypanel.host/api/assessments/${1})}/associate-event`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getAuthToken()}`
            },
            body: JSON.stringify({ assessmentEventId: 1})
        });

        if (!response.ok) {
            throw new Error('Erro ao associar evento');
        }

        return response.json();
    } catch (error) {
        console.error('Erro ao associar evento:', error);
    }
}
// Submissão do formulário de evento
formEvento.addEventListener('submit', function (e) {
    e.preventDefault();

    const nomeEvento = document.getElementById('nome-evento').value;
    const avaliacaoId = document.getElementById('avaliacao-evento').value;
    const ativo = document.getElementById('status-evento').checked;

    // Data de hoje para data de início
    const dataHoje = new Date();
    const dataInicio = dataHoje.toISOString().split('T')[0];

    // Data 6 meses no futuro para data fim
    const dataFim = new Date();
    dataFim.setMonth(dataFim.getMonth() + 6);
    const dataFimFormatada = dataFim.toISOString().split('T')[0];

    if (nomeEvento.trim() === '') {
        alert('Por favor, informe o nome do evento');
        return;
    }

    if (!avaliacaoId) {
        alert('Por favor, selecione uma avaliação');
        return;
    }

    // Desabilitar o botão de submit para evitar múltiplos envios
    const btnSubmit = formEvento.querySelector('button[type="submit"]');
    btnSubmit.disabled = true;
    btnSubmit.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Salvando...';

    // Criar objeto de dados conforme formato solicitado pela API
    const dadosEvento = {
        name: nomeEvento,
        assessmentId: parseInt(avaliacaoId),
        startDate: dataInicio,
        endDate: dataFimFormatada,
        status: ativo ? 'ACTIVE' : 'INACTIVE'
    };

    console.log('Dados do evento a serem enviados:', dadosEvento);

    if (eventoIdEmEdicao === null) {
        // Adicionar novo evento
        fetch('https://salf-salf-api.py5r5i.easypanel.host/api/assessment-events', {
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
                associarEvento()
                
                // Fechar o modal
                modalEvento.classList.add('hidden');

                // Recarregar eventos
                carregarEventos();
            })
            .catch(error => {
                console.error('Erro ao adicionar evento:', error);
                alert('Erro ao adicionar evento. Por favor, tente novamente.');
            })
            .finally(() => {
                // Reativar o botão de submit
                btnSubmit.disabled = false;
                btnSubmit.innerHTML = 'Salvar';
            });



    } else {
        // Atualizar evento existente
        fetch(`https://salf-salf-api.py5r5i.easypanel.host/api/assessment-events/${eventoIdEmEdicao}`, {
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
function carregarAvaliacoesParaSelect() {
    const avaliacaoSelect = document.getElementById('avaliacao-evento');

    // Limpar opções atuais, mantendo a opção default
    while (avaliacaoSelect.options.length > 1) {
        avaliacaoSelect.remove(1);
    }

    // Mostrar indicador de carregamento
    avaliacaoSelect.innerHTML = '<option value="">Carregando avaliações...</option>';

    return fetch('https://salf-salf-api.py5r5i.easypanel.host/api/assessments', {
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
        fetch(`https://salf-salf-api.py5r5i.easypanel.host/api/assessment-events/${id}`, {
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`
            }
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Erro ao buscar detalhes do evento');
                }
                return response.json();
            })
            .then(evento => {
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
            fetch(`https://salf-salf-api.py5r5i.easypanel.host/api/assessment-events/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${getAuthToken()}`
                }
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Erro ao excluir evento');
                    }
                    return response.json();
                })
                .then(data => {
                    alert('Evento excluído com sucesso!');
                    carregarEventos();
                })
                .catch(error => {
                    console.error('Erro ao excluir evento:', error);
                    alert('Erro ao excluir evento. Por favor, tente novamente.');
                });
        }
    }
}

// Sobrescrever a função atualizarTabelaEventos para usar a nova implementação
function atualizarTabelaEventos() {
    mostrarEventosNaTabela(eventos);
}

// Função para exportar uma prova
function exportarProva(id) {
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
    fetch(`https://salf-salf-api.py5r5i.easypanel.host/api/assessments/${id}/document`, {
        headers: {
            'Authorization': `Bearer ${getAuthToken()}`
        }
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Erro ao gerar documento da avaliação');
            }
            return response.json();
        })
        .then(data => {
            // Remover o overlay de carregamento
            document.body.removeChild(loadingOverlay);

            window.open('https://salf-salf-api.py5r5i.easypanel.host' + data.url, '_blank');
            // Verificar se a API retornou um link válido
            if (data && data.documentUrl) {
                // Criar link para download e acessar diretamente
            } else {
                throw new Error('A API não retornou um link válido para o documento');
            }
        })
        .catch(error => {
            console.error('Erro ao exportar prova:', error);
            // Remover overlay de carregamento
            // Mostrar mensagem de erro
            alert('Erro ao exportar prova. Por favor, tente novamente.');
        });
}