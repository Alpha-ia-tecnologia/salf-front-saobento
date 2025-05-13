// URL base da API
const API_BASE_URL_FILTROS = 'https://salf-salf-api2.gkgtsp.easypanel.host/api';

// Elementos DOM
const escolaSelect = document.getElementById('escola');
const turmaSelect = document.getElementById('turma');
const alunoSelect = document.getElementById('aluno');
localStorage.removeItem("aluno")
localStorage.removeItem("turma")
localStorage.removeItem("queryId")
const btnIniciarAvaliacao = document.getElementById('iniciar-avaliacao');
// Função para fazer requisições à API
async function fetchAPI(endpoint) {
    try {
        const response = await fetch(`${API_BASE_URL_FILTROS}${endpoint}`);
        if (!response.ok) {
            throw new Error(`Erro ao acessar a API: ${response.status}`);
        }
        return await response.json();
        } catch (error) {
        console.error(`Erro na requisição: ${error.message}`);
        return [];
    }
}

// Função para carregar as escolas
async function carregarEscolas() {
    // Limpa e desabilita os selects dependentes
    limparSelect(escolaSelect, 'Selecione uma escola');
    limparSelect(turmaSelect, 'Selecione uma turma');
    limparSelect(alunoSelect, 'Selecione um aluno');

    // Desabilita os selects dependentes
    turmaSelect.disabled = true;
    alunoSelect.disabled = true;

    // Busca as escolas na API
    const escolas = await fetchAPI('/schools');

    // Adiciona as opções de escolas ao select
    if (escolas && escolas.length > 0) {
        escolas.forEach(escola => {
            const option = document.createElement('option');
            option.value = escola.id;
            option.textContent = escola.name;
            escolaSelect.appendChild(option);
        });

        // Habilita o select de escolas
        escolaSelect.disabled = false;
    } else {
        // Se não houver escolas, exibe mensagem no select
        limparSelect(escolaSelect, 'Nenhuma escola encontrada');
        escolaSelect.disabled = true;
    }
}

// Função para carregar as turmas com base na escola selecionada
async function carregarTurmas(escolaId) {
    // Limpa e desabilita os selects dependentes
    limparSelect(turmaSelect, 'Carregando turmas...');
    limparSelect(alunoSelect, 'Selecione um aluno');

    // Desabilita os selects dependentes
    turmaSelect.disabled = true;
    alunoSelect.disabled = true;

        if (!escolaId) {
        limparSelect(turmaSelect, 'Selecione uma escola primeiro');
            return;
        }

    // Busca as turmas na API com base na escola selecionada
    const turmas = await fetchAPI(`/class-groups?schoolId=${escolaId}`);
    // Limpa o select de turmas para adicionar as novas opções
    limparSelect(turmaSelect, 'Selecione uma turma');

    // Adiciona as opções de turmas ao select
                if (turmas && turmas.length > 0) {
        turmas.forEach(turma => {
            const option = document.createElement('option');
            option.value = turma.id;
            option.textContent = turma.name;
            turmaSelect.appendChild(option);
        });

        // Habilita o select de turmas
        turmaSelect.disabled = false;
    } else {
        // Se não houver turmas, exibe mensagem no select
        limparSelect(turmaSelect, 'Nenhuma turma encontrada para esta escola');
        turmaSelect.disabled = true;
    }
}

// Função para carregar os alunos com base na turma selecionada
async function carregarAlunos(turmaId) {
    // Limpa e desabilita o select de alunos
    limparSelect(alunoSelect, 'Carregando alunos...');
    alunoSelect.disabled = true;

    if (!turmaId) {
        limparSelect(alunoSelect, 'Selecione uma turma primeiro');
            return;
        }

    // Busca os alunos na API com base na turma selecionada
    const alunos = await fetchAPI(`/students?classGroupId=${turmaId}`);

    // Limpa o select de alunos para adicionar as novas opções
    limparSelect(alunoSelect, 'Selecione um aluno');

    // Adiciona as opções de alunos ao select
    if (alunos && alunos.length > 0) {
        alunos.forEach(aluno => {
            const option = document.createElement('option');
            option.value = aluno.id;
            option.textContent = aluno.name;
            alunoSelect.appendChild(option);
        });

        // Habilita o select de alunos
        alunoSelect.disabled = false;
    } else {
        // Se não houver alunos, exibe mensagem no select
        limparSelect(alunoSelect, 'Nenhum aluno encontrado para esta turma');
        alunoSelect.disabled = true;
    }
}

// Função auxiliar para limpar um select e adicionar uma opção padrão
function limparSelect(selectElement, textoOpcaoPadrao) {
    // Remove todas as opções existentes
    selectElement.innerHTML = '';

    // Adiciona a opção padrão
    const opcaoPadrao = document.createElement('option');
    opcaoPadrao.value = '';
    opcaoPadrao.textContent = textoOpcaoPadrao;
    selectElement.appendChild(opcaoPadrao);
}

// Event listeners
escolaSelect.addEventListener('change', function () {
                const escolaId = this.value;
    carregarTurmas(escolaId);
});

turmaSelect.addEventListener('change', function () {
                const turmaId = this.value;
    carregarAlunos(turmaId);
});

const filtroEvento = document.getElementById('evento-avaliacao');
const filtroTestes = document.getElementById('teste-leitura');

const carregarEventos = async () => {
    const eventos = await fetch('https://salf-salf-api2.gkgtsp.easypanel.host/api/assessment-events');
    const eventosJson = await eventos.json();
    eventosJson.forEach(evento => {
        const option = document.createElement('option');
        option.value = evento.id;
        option.textContent = evento.name;
        filtroEvento.appendChild(option);
    });
    const testes = await fetch('https://salf-salf-api2.gkgtsp.easypanel.host/api/assessments');
    const testesJson = await testes.json();
    testesJson.forEach(teste => {
        const option = document.createElement('option');
        option.value = teste.id;
        option.textContent = teste.name;
        filtroTestes.appendChild(option);
    });
}


// Inicializa os filtros quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', function () {
    carregarEscolas();
    carregarEventos();

    btnIniciarAvaliacao.addEventListener('click', function () {
        const eventoId = filtroEvento.value;
        const testeId = filtroTestes.value;
        const alunoId = alunoSelect.value;
        const nameAluno = alunoSelect.options[alunoSelect.selectedIndex].textContent;
        const nameTurma = turmaSelect.options[turmaSelect.selectedIndex].textContent;
        localStorage.setItem('aluno', JSON.stringify(nameAluno));
        localStorage.setItem('turma', JSON.stringify(nameTurma));
        console.log(eventoId, testeId, alunoId);
    });

});


