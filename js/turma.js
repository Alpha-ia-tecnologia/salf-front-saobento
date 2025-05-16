document.addEventListener('DOMContentLoaded', function() {
    // Referências aos elementos
    const btnNovaTurma = document.getElementById('btn-nova-turma');
    const modalTurma = document.getElementById('modal-turma');
    const fecharModal = document.getElementById('fechar-modal');
    const cancelarTurma = document.getElementById('cancelar-turma');
    const formTurma = document.getElementById('form-turma');
    const filtroEscola = document.getElementById('filtro-escola');
    const pesquisaTurma = document.querySelector('input[placeholder="Pesquisar turmas..."]');
    
    // Endpoint base da API
    const API_BASE_URL = 'https://salf-salf-api2.gkgtsp.easypanel.host/api';
    
    // Token de autenticação (mock)
    const AUTH_TOKEN = localStorage.getItem('token');
    
    // Dados
    let turmas = [];
    let escolas = [];
    let turmaIdEmEdicao = null;
    
    // Event Listeners
    btnNovaTurma.addEventListener('click', abrirModal);
    fecharModal.addEventListener('click', fecharModalTurma);
    cancelarTurma.addEventListener('click', fecharModalTurma);
    formTurma.addEventListener('submit', salvarTurma);
    
    if (filtroEscola) {
        filtroEscola.addEventListener('change', filtrarTurmas);
    }
    
    if (pesquisaTurma) {
        pesquisaTurma.addEventListener('input', filtrarTurmas);
    }
    
    // Inicializar dados
    carregarEscolas();
    carregarTurmas();
    
    // Funções
    function carregarEscolas() {
        fetch(`${API_BASE_URL}/schools`, {
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${AUTH_TOKEN}`
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Erro ao buscar escolas');
            }
            return response.json();
        })
        .then(({data}) => {
            escolas = data;
            
            // Preencher select de escolas do filtro
            if (filtroEscola) {
                filtroEscola.innerHTML = '<option value="">Todas as escolas</option>';
                escolas.forEach(escola => {
                    const option = document.createElement('option');
                    option.value = escola.id;
                    option.textContent = escola.name;
                    filtroEscola.appendChild(option);
                });
            }
            
            // Preencher select de escolas do formulário
            const escolaTurma = document.getElementById('escola-turma');
            if (escolaTurma) {
                escolaTurma.innerHTML = '<option value="">Selecione uma escola</option>';
                escolas.forEach(escola => {
                    const option = document.createElement('option');
                    option.value = escola.id;
                    option.textContent = escola.name;
                    escolaTurma.appendChild(option);
                });
            }
        })
        .catch(error => {
            console.error('Erro ao carregar escolas:', error);
            alert('Erro ao carregar escolas. Por favor, tente novamente.');
        });
    }
    
    function carregarTurmas() {
        fetch(`${API_BASE_URL}/class-groups`, {
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${AUTH_TOKEN}`
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Erro ao buscar turmas');
            }
            return response.json();
        })
        .then(({data}) => {
            turmas = data;
            atualizarTabela();
        })
        .catch(error => {
            console.error('Erro ao carregar turmas:', error);
            alert('Erro ao carregar turmas. Por favor, tente novamente.');
        });
    }
    
    function abrirModal() {
        modalTurma.classList.remove('hidden');
        document.getElementById('escola-turma').focus();
        
        // Resetar o formulário
        formTurma.reset();
        formTurma.removeAttribute('data-editing-id');
        
        // Resetar o título do modal
        const modalTitle = modalTurma.querySelector('h3');
        modalTitle.textContent = 'Nova Turma';
        
        // Resetar o botão de submit
        const btnSubmit = formTurma.querySelector('button[type="submit"]');
        btnSubmit.textContent = 'Salvar';
        
        // Garantir que o event listener seja o correto
        formTurma.removeEventListener('submit', atualizarTurmaExistente);
        formTurma.addEventListener('submit', salvarTurma);
    }
    
    function fecharModalTurma() {
        modalTurma.classList.add('hidden');
        formTurma.reset();
    }
    
    function salvarTurma(e) {
        e.preventDefault();
        
        const escolaId = document.getElementById('escola-turma').value;
        const nomeTurma = document.getElementById('nome-turma').value;
        const serieTurma = document.getElementById('serie-turma').value;
        const turnoTurma = document.getElementById('turno-turma').value;
        const anoLetivoEl = document.getElementById('ano-letivo');
        const anoLetivo = anoLetivoEl ? anoLetivoEl.value : new Date().getFullYear().toString();
        
        if (!escolaId || !nomeTurma || !serieTurma || !turnoTurma) {
            alert('Por favor, preencha todos os campos.');
            return;
        }
        
        // Criar objeto de dados conforme o formato da API
        const dadosTurma = {
            name: nomeTurma,
            grade: serieTurma.toLocaleUpperCase(),
            schoolId: parseInt(escolaId),
            turn: turnoTurma.toLocaleUpperCase(),
            schoolYear: parseInt(anoLetivo),
            totalStudents : 0
        };
        
        // Enviar para a API
        fetch(`${API_BASE_URL}/class-groups`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${AUTH_TOKEN}`
            },
            body: JSON.stringify(dadosTurma)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Erro ao cadastrar turma');
            }
            return response.json();
        })
        .then(data => {
            alert('Turma cadastrada com sucesso!');
            fecharModalTurma();
            carregarTurmas();
        })
        .catch(error => {
            console.error('Erro ao cadastrar turma:', error);
            alert('Erro ao cadastrar turma. Por favor, tente novamente.');
        });
    }
    
    function converterTurnoParaAPI(turno) {
        const mapeamento = {
            'Matutino': 'MORNING',
            'Vespertino': 'AFTERNOON',
            'Noturno': 'EVENING'
        };
        
        return mapeamento[turno] || turno;
    }
    
    function converterTurnoParaExibicao(turno) {
        if (!turno) return '';
        
        const mapeamento = {
            'MORNING': 'Matutino',
            'AFTERNOON': 'Vespertino',
            'EVENING': 'Noturno',
            'MATUTINO': 'Matutino'
        };
        
        return mapeamento[turno] || turno;
    }
    const btnPagina = document.getElementById('btn-page');
    const btnPaginaAnterior = document.getElementById('btn-page-anterior');
    const btnPaginaProximo = document.getElementById('btn-page-proximo');
    btnPaginaAnterior.addEventListener('click', function() {
        btnPagina.textContent = paginaAtual - 1;
        carregarTurmas();
    });
    btnPaginaProximo.addEventListener('click', function() {
        btnPagina.textContent = paginaAtual + 1;
        carregarTurmas();
    });
    function atualizarTabela(turmasFiltradas = null) {
        const dadosParaMostrar = turmasFiltradas || turmas;
        const tbody = document.querySelector('table tbody');
        tbody.innerHTML = '';
        
        dadosParaMostrar.forEach(turma => {
            const tr = document.createElement('tr');
            tr.setAttribute('data-id', turma.id);
            tr.setAttribute('data-school-id', turma.schoolId);
            
            tr.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${turma.id}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900">${turma.name}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${turma.grade || turma.gradeLevel || ''}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${converterTurnoParaExibicao(turma.turn || turma.shift || '')}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${turma.school ? turma.school.name : ''}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${turma.totalStudents || 0}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button class="text-yellow-600 hover:text-yellow-900 mr-3 btn-editar" data-id="${turma.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="text-red-600 hover:text-red-900 btn-excluir" data-id="${turma.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });
        
        // Atualizar contador de resultados
        const resultadosMsg = document.querySelector('.bg-white.px-4.py-3 .text-sm.text-gray-700');
        if (resultadosMsg) {
            resultadosMsg.innerHTML = `
                Mostrando <span class="font-medium">1</span> a <span class="font-medium">${dadosParaMostrar.length}</span> de <span class="font-medium">${turmas.length}</span> resultados
            `;
        }
        
        // Configurar eventos dos botões
        configurarBotoes();
    }
    
    function filtrarTurmas() {
        const escolaId = filtroEscola ? parseInt(filtroEscola.value) : null;
        const textoPesquisa = pesquisaTurma ? pesquisaTurma.value.toLowerCase() : '';
        
        let turmasFiltradas = [...turmas];
        
        if (escolaId) {
            turmasFiltradas = turmasFiltradas.filter(turma => turma.schoolId === escolaId);
        }
        
        if (textoPesquisa) {
            turmasFiltradas = turmasFiltradas.filter(turma => {
                const nome = (turma.name || '').toLowerCase();
                const serie = (turma.grade || turma.gradeLevel || '').toLowerCase();
                return nome.includes(textoPesquisa) || serie.includes(textoPesquisa);
            });
        }
        
        atualizarTabela(turmasFiltradas);
    }
    
    function configurarBotoes() {
        // Botões de editar
        document.querySelectorAll('.btn-editar').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = parseInt(this.getAttribute('data-id'));
                editarTurma(id);
            });
        });
        
        // Botões de excluir
        document.querySelectorAll('.btn-excluir').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = parseInt(this.getAttribute('data-id'));
                excluirTurma(id);
            });
        });
    }
    
    function editarTurma(id) {
        // Buscar detalhes da turma da API
        fetch(`${API_BASE_URL}/class-groups/${id}`, {
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${AUTH_TOKEN}`
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Erro ao buscar dados da turma');
            }
            return response.json();
        })
        .then(turma => {
            document.getElementById('escola-turma').value = turma.schoolId;
            document.getElementById('nome-turma').value = turma.name;
            document.getElementById('serie-turma').value = turma.grade || turma.gradeLevel || '';
            document.getElementById('turno-turma').value = converterTurnoParaExibicao(turma.turn || turma.shift || '');
            
            // Verificar se o elemento ano-letivo existe
            const anoLetivoEl = document.getElementById('ano-letivo');
            if (anoLetivoEl) {
                anoLetivoEl.value = turma.schoolYear;
            }
            
            // Modificar o formulário para modo de edição
            formTurma.setAttribute('data-editing-id', id);
            
            // Alterar o título do modal
            const modalTitle = modalTurma.querySelector('h3');
            modalTitle.textContent = 'Editar Turma';
            
            // Alterar o botão de submit
            const btnSubmit = formTurma.querySelector('button[type="submit"]');
            btnSubmit.textContent = 'Atualizar';
            
            // Garantir que o event listener seja o correto
            formTurma.removeEventListener('submit', salvarTurma);
            formTurma.addEventListener('submit', atualizarTurmaExistente);
            
            // Abrir o modal
            modalTurma.classList.remove('hidden');
        })
        .catch(error => {
            console.error('Erro ao editar turma:', error);
            alert('Erro ao buscar dados da turma. Por favor, tente novamente.');
        });
    }
    
    function atualizarTurmaExistente(e) {
        e.preventDefault();
        
        const escolaId = document.getElementById('escola-turma').value;
        const nomeTurma = document.getElementById('nome-turma').value;
        const serieTurma = document.getElementById('serie-turma').value;
        const turnoTurma = document.getElementById('turno-turma').value;
        const anoLetivoEl = document.getElementById('ano-letivo');
        const anoLetivo = anoLetivoEl ? anoLetivoEl.value : new Date().getFullYear().toString();
        const idEditing = parseInt(formTurma.getAttribute('data-editing-id'));
        
        if (!escolaId || !nomeTurma || !serieTurma || !turnoTurma) {
            alert('Por favor, preencha todos os campos.');
            return;
        }
        
        // Criar objeto de dados
        const dadosTurma = {
            name: nomeTurma,
            gradeLevel: serieTurma,
            schoolId: parseInt(escolaId),
            shift: converterTurnoParaAPI(turnoTurma),
            schoolYear: parseInt(anoLetivo)
        };
        
        // Enviar para a API
        fetch(`${API_BASE_URL}/class-groups/${idEditing}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${AUTH_TOKEN}`
            },
            body: JSON.stringify(dadosTurma)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Erro ao atualizar turma');
            }
            return response.json();
        })
        .then(data => {
            alert('Turma atualizada com sucesso!');
            fecharModalTurma();
            carregarTurmas();
        })
        .catch(error => {
            console.error('Erro ao atualizar turma:', error);
            alert('Erro ao atualizar turma. Por favor, tente novamente.');
        });
    }
    
    function excluirTurma(id) {
        if (confirm('Tem certeza que deseja excluir esta turma?')) {
            fetch(`${API_BASE_URL}/class-groups/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${AUTH_TOKEN}`
                }
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Erro ao excluir turma');
                }
                return response.text();
            })
            .then(() => {
                alert('Turma excluída com sucesso!');
                carregarTurmas();
            })
            .catch(error => {
                console.error('Erro ao excluir turma:', error);
                alert('Erro ao excluir turma. Por favor, tente novamente.');
            });
        }
    }
}); 