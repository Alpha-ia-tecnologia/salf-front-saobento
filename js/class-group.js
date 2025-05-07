document.addEventListener('DOMContentLoaded', function() {
    // Verificar se o usuário está autenticado
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '../../login.html';
        return;
    }
    
    // URL base da API
    const API_BASE_URL = "https://salf-salf-api.py5r5i.easypanel.host/api";
    
    // Headers padrão para requisições à API
    const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    };
    
    // Elementos do DOM
    const tabelaTurmas = document.querySelector('tbody');
    const filtroEscola = document.getElementById('filtro-escola');
    const inputPesquisa = document.getElementById('pesquisa');
    const btnNovaTurma = document.getElementById('btn-nova-turma');
    const modalTurma = document.getElementById('modal-turma');
    const formTurma = document.getElementById('form-turma');
    const fecharModal = document.getElementById('fechar-modal');
    const cancelarTurma = document.getElementById('cancelar-turma');
    const escolaTurmaSelect = document.getElementById('escola-turma');
    const nomeTurmaInput = document.getElementById('nome-turma');
    const serieTurmaSelect = document.getElementById('serie-turma');
    const turnoTurmaSelect = document.getElementById('turno-turma');
    const anoEscolarTurmaInput = document.getElementById('ano-escolar-turma');
    
    // Estado para controlar o modo do formulário (novo ou edição)
    let modoEdicao = false;
    let turmaIdEmEdicao = null;
    
    // Arrays para armazenar dados
    let todasTurmas = [];
    let todasEscolas = [];
    
    // Carregar dados iniciais
    inicializarDados();
    
    // Event Listeners
    if (filtroEscola) {
        filtroEscola.addEventListener('change', filtrarTurmas);
    }
    if (inputPesquisa) {
        inputPesquisa.addEventListener('input', filtrarTurmas);
    }
    btnNovaTurma.addEventListener('click', abrirModalNovaTurma);
    fecharModal.addEventListener('click', fecharModalTurma);
    cancelarTurma.addEventListener('click', fecharModalTurma);
    formTurma.addEventListener('submit', salvarTurma);
    
    // Função para inicializar todos os dados necessários
    async function inicializarDados() {
        try {
            // Carregar escolas primeiro
            await carregarEscolas();
            
            // Depois carregar as turmas
            await carregarTurmas();
        } catch (error) {
            console.error('Erro ao inicializar dados:', error);
            mostrarErro('Não foi possível carregar os dados iniciais. Por favor, recarregue a página.');
        }
    }
    
    // Função para carregar escolas da API
    async function carregarEscolas() {
        try {
            // Verificar se API global está disponível
            if (window.API && window.API.escolas) {
                const dados = await window.API.escolas.listar();
                todasEscolas = dados;
            } else {
                // Fallback para API direta
                const response = await fetch(`${API_BASE_URL}/schools`, {
                    method: 'GET',
                    headers: headers
                });
                
                if (!response.ok) {
                    throw new Error(`Erro ao carregar escolas: ${response.status}`);
                }
                
                todasEscolas = await response.json();
            }
            
            // Preencher os selects de escolas
            preencherSelectEscolas();
        } catch (error) {
            console.error('Erro ao carregar escolas:', error);
            mostrarErro('Não foi possível carregar a lista de escolas.');
        }
    }
    
    // Função para preencher selects de escolas
    function preencherSelectEscolas() {
        // Preencher o filtro de escola
        if (filtroEscola) {
            // Limpar opções atuais, mantendo a opção default
            while (filtroEscola.options.length > 1) {
                filtroEscola.remove(1);
            }
            
            // Adicionar opções de escola
            todasEscolas.forEach(escola => {
                const option = document.createElement('option');
                option.value = escola.id;
                option.textContent = escola.name;
                filtroEscola.appendChild(option);
            });
        }
        
        // Preencher o select de escola no modal
        if (escolaTurmaSelect) {
            // Limpar opções atuais, mantendo a opção default
            while (escolaTurmaSelect.options.length > 1) {
                escolaTurmaSelect.remove(1);
            }
            
            // Adicionar opções de escola
            todasEscolas.forEach(escola => {
                const option = document.createElement('option');
                option.value = escola.id;
                option.textContent = escola.name;
                escolaTurmaSelect.appendChild(option);
            });
        }
    }
    
    // Função para carregar turmas da API
    async function carregarTurmas() {
        try {
            // Iniciar indicador de carregamento
            tabelaTurmas.innerHTML = `
                <tr>
                    <td colspan="7" class="px-6 py-4 text-center">
                        <div class="flex justify-center">
                            <i class="fas fa-circle-notch fa-spin text-blue-500 text-xl"></i>
                            <span class="ml-2">Carregando turmas...</span>
                        </div>
                    </td>
                </tr>
            `;
            
            const response = await fetch(`${API_BASE_URL}/class-groups`, {
                method: 'GET',
                headers: headers
            });
            
            if (!response.ok) {
                throw new Error(`Erro ao carregar turmas: ${response.status}`);
            }
            
            const turmas = await response.json();
            todasTurmas = turmas;
            
            renderizarTabela(turmas);
        } catch (error) {
            console.error('Erro ao carregar turmas:', error);
            tabelaTurmas.innerHTML = `
                <tr>
                    <td colspan="7" class="px-6 py-4 text-center text-red-500">
                        Não foi possível carregar a lista de turmas. Por favor, tente novamente.
                    </td>
                </tr>
            `;
        }
    }
    
    // Função para renderizar a tabela com dados das turmas
    function renderizarTabela(turmas) {
        // Limpar a tabela atual
        tabelaTurmas.innerHTML = '';
        
        if (turmas.length === 0) {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td colspan="7" class="px-6 py-4 text-center text-gray-500">
                    Nenhuma turma encontrada.
                </td>
            `;
            tabelaTurmas.appendChild(tr);
            return;
        }
        
        // Adicionar cada turma na tabela
        turmas.forEach(turma => {
            const tr = document.createElement('tr');
            
            // Determinar o turno baseado no valor da API
            let turnoTexto = "Desconhecido";
            if (turma.shift === "MORNING") turnoTexto = "Matutino";
            else if (turma.shift === "AFTERNOON") turnoTexto = "Vespertino";
            else if (turma.shift === "NIGHT") turnoTexto = "Noturno";
            else if (turma.shift === "FULL") turnoTexto = "Integral";
            
            tr.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${turma.id}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900">${turma.name || 'N/A'}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${turma.gradeLevel || 'N/A'}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${turnoTexto}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${turma.school?.name || 'N/A'}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${turma.students?.length || 0}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button class="text-orange-600 hover:text-orange-900 mr-3 btn-editar" data-id="${turma.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="text-red-600 hover:text-red-900 btn-excluir" data-id="${turma.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            
            // Adicionar event listeners para os botões
            const btnEditar = tr.querySelector('.btn-editar');
            const btnExcluir = tr.querySelector('.btn-excluir');
            
            btnEditar.addEventListener('click', () => editarTurma(turma.id));
            btnExcluir.addEventListener('click', () => confirmarExclusao(turma.id, turma.name));
            
            tabelaTurmas.appendChild(tr);
        });
    }
    
    // Função para filtrar turmas com base nos filtros aplicados
    function filtrarTurmas() {
        const termoPesquisa = inputPesquisa ? inputPesquisa.value.toLowerCase() : '';
        const escolaSelecionada = filtroEscola ? parseInt(filtroEscola.value) : null;
        
        const turmasFiltradas = todasTurmas.filter(turma => {
            // Filtrar por termo de pesquisa
            const matchPesquisa = !termoPesquisa || 
                               turma.name?.toLowerCase().includes(termoPesquisa) || 
                               turma.gradeLevel?.toLowerCase().includes(termoPesquisa) ||
                               turma.id?.toString().includes(termoPesquisa);
            
            // Filtrar por escola
            const matchEscola = !escolaSelecionada || turma.schoolId === escolaSelecionada;
            
            return matchPesquisa && matchEscola;
        });
        
        renderizarTabela(turmasFiltradas);
    }
    
    // Função para abrir o modal para adicionar nova turma
    function abrirModalNovaTurma() {
        // Resetar o formulário
        formTurma.reset();
        
        // Configurar modo de adição
        modoEdicao = false;
        turmaIdEmEdicao = null;
        
        // Atualizar título do modal
        document.querySelector('#modal-turma h3').textContent = 'Nova Turma';
        
        // Exibir o modal
        modalTurma.classList.remove('hidden');
    }
    
    // Função para fechar o modal
    function fecharModalTurma() {
        modalTurma.classList.add('hidden');
        formTurma.reset();
    }
    
    // Função para salvar turma (adicionar nova ou atualizar existente)
    async function salvarTurma(event) {
        event.preventDefault();
        
        // Obter dados do formulário
        const nome = nomeTurmaInput.value.trim();
        const escolaId = parseInt(escolaTurmaSelect.value);
        const serie = serieTurmaSelect.value;
        const turno = turnoTurmaSelect.value;
        const anoEscolar = anoEscolarTurmaInput ? parseInt(anoEscolarTurmaInput.value) : new Date().getFullYear();
        
        // Validação
        if (!nome || !escolaId || !serie || !turno) {
            alert('Por favor, preencha todos os campos obrigatórios.');
            return;
        }
        
        // Mapear o turno para o formato da API
        let turnoAPI = "MORNING"; // Default
        if (turno === "Matutino") turnoAPI = "MORNING";
        else if (turno === "Vespertino") turnoAPI = "AFTERNOON";
        else if (turno === "Noturno") turnoAPI = "NIGHT";
        else if (turno === "Integral") turnoAPI = "FULL";
        
        // Dados para enviar à API
        const turmaData = {
            name: nome,
            gradeLevel: serie,
            shift: turnoAPI,
            schoolYear: anoEscolar,
            schoolId: escolaId
        };
        
        try {
            let url = `${API_BASE_URL}/class-groups`;
            let method = 'POST';
            
            // Se estiver em modo de edição, usar PUT com o ID correto
            if (modoEdicao && turmaIdEmEdicao) {
                url = `${API_BASE_URL}/class-groups/${turmaIdEmEdicao}`;
                method = 'PUT';
            }
            
            const response = await fetch(url, {
                method: method,
                headers: headers,
                body: JSON.stringify(turmaData)
            });
            
            if (!response.ok) {
                throw new Error(`Erro ao ${modoEdicao ? 'atualizar' : 'adicionar'} turma: ${response.status}`);
            }
            
            // Fechar o modal
            fecharModalTurma();
            
            // Recarregar a lista de turmas
            await carregarTurmas();
            
            // Mensagem de sucesso
            alert(`Turma ${modoEdicao ? 'atualizada' : 'adicionada'} com sucesso!`);
            
        } catch (error) {
            console.error('Erro ao salvar turma:', error);
            alert(`Não foi possível ${modoEdicao ? 'atualizar' : 'adicionar'} a turma. Por favor, tente novamente.`);
        }
    }
    
    // Função para editar uma turma existente
    async function editarTurma(id) {
        try {
            // Buscar a turma completa da API
            const response = await fetch(`${API_BASE_URL}/class-groups/${id}`, {
                method: 'GET',
                headers: headers
            });
            
            if (!response.ok) {
                throw new Error(`Erro ao buscar detalhes da turma: ${response.status}`);
            }
            
            const turma = await response.json();
            
            if (!turma) {
                throw new Error(`Turma com ID ${id} não encontrada`);
            }
            
            // Preencher o formulário com os dados da turma
            nomeTurmaInput.value = turma.name || '';
            
            // Selecionar a escola
            if (turma.schoolId) {
                for (let i = 0; i < escolaTurmaSelect.options.length; i++) {
                    if (escolaTurmaSelect.options[i].value == turma.schoolId) {
                        escolaTurmaSelect.selectedIndex = i;
                        break;
                    }
                }
            }
            
            // Selecionar a série
            if (turma.gradeLevel) {
                for (let i = 0; i < serieTurmaSelect.options.length; i++) {
                    if (serieTurmaSelect.options[i].value === turma.gradeLevel) {
                        serieTurmaSelect.selectedIndex = i;
                        break;
                    }
                }
            }
            
            // Selecionar o turno
            let turnoSelecionado = 0; // Default para a primeira opção
            if (turma.shift === "MORNING") turnoSelecionado = 1;
            else if (turma.shift === "AFTERNOON") turnoSelecionado = 2;
            else if (turma.shift === "NIGHT") turnoSelecionado = 3;
            else if (turma.shift === "FULL") turnoSelecionado = 4;
            
            if (turnoSelecionado > 0 && turnoSelecionado < turnoTurmaSelect.options.length) {
                turnoTurmaSelect.selectedIndex = turnoSelecionado;
            }
            
            // Definir o ano escolar se o campo existir
            if (anoEscolarTurmaInput && turma.schoolYear) {
                anoEscolarTurmaInput.value = turma.schoolYear;
            }
            
            // Configurar modo de edição
            modoEdicao = true;
            turmaIdEmEdicao = id;
            
            // Atualizar título do modal
            document.querySelector('#modal-turma h3').textContent = 'Editar Turma';
            
            // Exibir o modal
            modalTurma.classList.remove('hidden');
            
        } catch (error) {
            console.error('Erro ao preparar edição de turma:', error);
            alert('Não foi possível carregar os dados da turma para edição.');
        }
    }
    
    // Função para confirmar a exclusão de uma turma
    function confirmarExclusao(id, nome) {
        if (confirm(`Tem certeza que deseja excluir a turma "${nome}"? Esta ação não pode ser desfeita.`)) {
            excluirTurma(id);
        }
    }
    
    // Função para excluir uma turma
    async function excluirTurma(id) {
        try {
            const response = await fetch(`${API_BASE_URL}/class-groups/${id}`, {
                method: 'DELETE',
                headers: headers
            });
            
            if (!response.ok) {
                throw new Error(`Erro ao excluir turma: ${response.status}`);
            }
            
            // Remover turma da lista local
            todasTurmas = todasTurmas.filter(turma => turma.id != id);
            
            // Atualizar a tabela
            renderizarTabela(todasTurmas);
            
            // Exibir mensagem de sucesso
            alert('Turma excluída com sucesso!');
            
        } catch (error) {
            console.error('Erro ao excluir turma:', error);
            alert('Não foi possível excluir a turma. Por favor, tente novamente.');
        }
    }
    
    // Função para mostrar mensagem de erro
    function mostrarErro(mensagem) {
        alert(mensagem);
    }
}); 