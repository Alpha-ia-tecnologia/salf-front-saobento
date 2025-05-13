document.addEventListener('DOMContentLoaded', function() {
    // Verificar se o usuário está autenticado
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '../../login.html';
        return;
    }
    
    // URL base da API
    const API_BASE_URL = "https://salf-salf-api2.gkgtsp.easypanel.host/api";
    
    // Headers padrão para requisições à API
    const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    };
    
    // Elementos do DOM
    const tabelaEscolas = document.querySelector('tbody');
    const inputPesquisa = document.getElementById('pesquisa');
    const filtroRegiao = document.getElementById('filtro-regiao');
    const filtroGrupo = document.getElementById('filtro-grupo');
    const btnNovaEscola = document.getElementById('btn-nova-escola');
    const modalEscola = document.getElementById('modal-escola');
    const formEscola = document.getElementById('form-escola');
    const fecharModal = document.getElementById('fechar-modal');
    const cancelarEscola = document.getElementById('cancelar-escola');
    const nomeEscolaInput = document.getElementById('nome-escola');
    const regiaoEscolaSelect = document.getElementById('regiao-escola-post');
    const grupoEscolaSelect = document.getElementById('grupo-escola-post');
    
    // Estado para controlar o modo do formulário (novo ou edição)
    let modoEdicao = false;
    let escolaIdEmEdicao = null;
    
    // Array para armazenar todas as escolas carregadas
    let todasEscolas = [];
    
    // Arrays para armazenar regiões e grupos
    let todasRegioes = [];
    let todosGrupos = [];
    
    // Carregar dados iniciais
    inicializarDados();
    
    // Event Listeners
    inputPesquisa.addEventListener('input', filtrarEscolas);
    filtroRegiao.addEventListener('change', filtrarEscolas);
    filtroGrupo.addEventListener('change', filtrarEscolas);
    btnNovaEscola.addEventListener('click', abrirModalNovaEscola);
    fecharModal.addEventListener('click', fecharModalEscola);
    cancelarEscola.addEventListener('click', fecharModalEscola);
    formEscola.addEventListener('submit', salvarEscola);
    
    // Função para inicializar todos os dados necessários
    async function inicializarDados() {
        try {
            // Carregar regiões e grupos primeiro
            // await Promise.all([
            //     carregarRegioes(),
            //     carregarGrupos()
            // ]);
            
            // // Depois carregar as escolas
            await carregarEscolas();
            
            // Preencher os filtros da página principal
            carregarFiltros();
        } catch (error) {
            console.error('Erro ao inicializar dados:', error);
            mostrarErro('Não foi possível carregar os dados iniciais. Por favor, recarregue a página.');
        }
    }



    
    // Função para carregar regiões da API
    // async function carregarRegioes() {
    //     console.log('carregando regioes');

    //     try {
    //         // Verificar se API global está disponível
    //         if (window.API && window.API.regioes) {
    //             const dados = await window.API.regioes.listar();
    //             todasRegioes = dados;
    //         } else {
    //             // Fallback para API direta
    //             const response = await fetch(`${API_BASE_URL}/regions`, {
    //                 method: 'GET',
    //                 headers: headers
    //             });
                
    //             if (!response.ok) {
    //                 throw new Error(`Erro ao carregar regiões: ${response.status}`);
    //             }
                
    //             todasRegioes = await response.json();
    //             console.log('regioes carregadas', todasRegioes);
    //         }
            
    //         // Preencher o select de regiões no modal
    //         preencherSelectRegioes();
    //     } catch (error) {
    //         console.error('Erro ao carregar regiões:', error);
    //     }
    // }
    
    // Função para carregar grupos da API
    // async function carregarGrupos() {
    //     try {
    //         // Verificar se API global está disponível
    //         if (window.API && window.API.grupos) {
    //             const dados = await window.API.grupos.listar();
    //             todosGrupos = dados;
    //         } else {
    //             // Fallback para API direta
    //             const response = await fetch(`${API_BASE_URL}/groups`, {
    //                 method: 'GET',
    //                 headers: headers
    //             });
                
    //             if (!response.ok) {
    //                 throw new Error(`Erro ao carregar grupos: ${response.status}`);
    //             }
                
    //             todosGrupos = await response.json();

                
    //         }
            
    //         // Preencher o select de grupos no modal
    //         preencherSelectGrupos();
    //     } catch (error) {
    //         console.error('Erro ao carregar grupos:', error);
    //     }
    // }
    
    // Função para preencher o select de regiões
    // function preencherSelectRegioes() {
    //     // Limpar opções atuais, mantendo a opção default
    //     while (regiaoEscolaSelect.options.length > 1) {
    //         regiaoEscolaSelect.remove(1);
    //     }
        
    //     // Adicionar opções de região
    //     todasRegioes.forEach(regiao => {
    //         const option = document.createElement('option');
    //         option.value = regiao.id ? regiao.id : regiao.nome;
    //         option.textContent = regiao.nome;
    //         regiaoEscolaSelect.appendChild(option);
    //     });
    // }
    
    // // Função para preencher o select de grupos
    // function preencherSelectGrupos() {
    //     // Limpar opções atuais, mantendo a opção default
    //     while (grupoEscolaSelect.options.length > 1) {
  
        
    //     // Adicionar opções de grupo
    //     todosGrupos.forEach(grupo => {
    //         const option = document.createElement('option');
    //         option.value = grupo.id ? grupo.id : grupo.nome;
    //         option.textContent = grupo.nome;
    //         grupoEscolaSelect.appendChild(option);
    //     });
    // }
    
    // Função para carregar escolas da API
    async function carregarEscolas() {
        try {
            const response = await fetch(`${API_BASE_URL}/schools`, {
                method: 'GET',
                headers: headers
            });
            
            if (!response.ok) {
                throw new Error(`Erro ao carregar escolas: ${response.status}`);
            }
            
            const escolas = await response.json();
            todasEscolas = escolas;
            
            renderizarTabela(escolas);
        } catch (error) {
            console.error('Erro ao carregar escolas:', error);
            mostrarErro('Não foi possível carregar a lista de escolas. Por favor, tente novamente.');
        }
    }
    
    // Função para carregar dados dos filtros
    async function carregarFiltros() {
        try {
            // Carregar regiões únicas
            // const regioes = [...new Set(todasEscolas.map(escola => escola.region))].filter(Boolean);
            const regioes = await fetch(`${API_BASE_URL}/regions`, { headers }).then(res => res.json());
    
    
            // Adicionar opções de região
            regioes.forEach(regiao => {
                const option = document.createElement('option');
                option.value = regiao.id;
                option.textContent = regiao.name;
                filtroRegiao.appendChild(option);
            });
            
            // Carregar grupos únicos
            // const grupos = [...new Set(todasEscolas.map(escola => escola.group))].filter(Boolean);
            const grupos = await fetch(`${API_BASE_URL}/groups`, { headers }).then(res => res.json());

            // Adicionar opções de grupo
            grupos.forEach(grupo => {
                const option = document.createElement('option');
                option.value = grupo.id;
                option.textContent = grupo.name;
                filtroGrupo.appendChild(option);
            });
            
        } catch (error) {
            console.error('Erro ao carregar filtros:', error);
        }
    }
    
    // // Função auxiliar para popular um select com opções
    // function populateSelectWithOptions(selectElement, options) {
    //     // Limpar opções atuais, mantendo a opção default
    //     while (selectElement.options.length > 1) {
    //         selectElement.remove(1);
    //     }
        
    //     // Adicionar opções
    //     options.forEach(option => {
    //         const optElement = document.createElement('option');
    //         optElement.value = option;
    //         optElement.textContent = option;
    //         selectElement.appendChild(optElement);
    //     });
    // }
    
    // Função para renderizar a tabela com dados das escolas
    function renderizarTabela(escolas) {
        // Limpar a tabela atual
        tabelaEscolas.innerHTML = '';
        
        if (escolas.length === 0) {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td colspan="7" class="px-6 py-4 text-center text-gray-500">
                    Nenhuma escola encontrada.
                </td>
            `;
            tabelaEscolas.appendChild(tr);
            return;
        }
        
        // Adicionar cada escola na tabela
        escolas.forEach(async(escola) => {
            const tr = document.createElement('tr');
            const name = async () => {
                const regiao = await fetch(`${API_BASE_URL}/regions/${escola.regionId}`, { headers }).then(res => res.json());
                return regiao.name;
            }
            const group = async () => {
                const grupo = await fetch(`${API_BASE_URL}/groups/${escola.groupId}`, { headers }).then(res => res.json());
                return grupo.name;
            }
            tr.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${escola.id}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900">${escola.name || 'N/A'}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${await name()}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${await group()}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${escola.classGroups?.length || 0}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${escola.students?.length || 0}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button class="text-blue-600 hover:text-blue-900 mr-3 btn-editar" data-id="${escola.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="text-red-600 hover:text-red-900 btn-excluir" data-id="${escola.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            
            // Adicionar event listeners para os botões
            const btnEditar = tr.querySelector('.btn-editar');
            const btnExcluir = tr.querySelector('.btn-excluir');
            
            btnEditar.addEventListener('click', () => editarEscola(escola.id));
            btnExcluir.addEventListener('click', () => confirmarExclusao(escola.id, escola.name));
            
            tabelaEscolas.appendChild(tr);
        });
    }
    
    // Função para filtrar escolas com base nos filtros aplicados
    function filtrarEscolas() {
        const termoPesquisa = inputPesquisa.value.trim();
        const regiaoSelecionada = filtroRegiao.value;
        const grupoSelecionado = filtroGrupo.value;
        
        // Verificar se o termo de pesquisa é um número (possível ID)
        if (/^\d+$/.test(termoPesquisa)) {
            // É um número, pode ser um ID - buscar diretamente na API
            buscarEscolaPorId(parseInt(termoPesquisa));
        } else {
            // Filtro normal pela lista local
            const termoLowerCase = termoPesquisa.toLowerCase();
            
            const escolasFiltradas = todasEscolas.filter(escola => {
                // Filtrar por termo de pesquisa
                const matchPesquisa = !termoLowerCase || 
                                  escola.name?.toLowerCase().includes(termoLowerCase) || 
                                  escola.id?.toString().includes(termoLowerCase);
                
                // Filtrar por região
                const matchRegiao = !regiaoSelecionada || escola.region === regiaoSelecionada;
                
                // Filtrar por grupo
                const matchGrupo = !grupoSelecionado || escola.group === grupoSelecionado;
                
                return matchPesquisa && matchRegiao && matchGrupo;
            });
            
            renderizarTabela(escolasFiltradas);
        }
    }
    
    // Função para buscar escola por ID diretamente na API
    async function buscarEscolaPorId(id) {
        try {
            // Verificar se existe na lista atual primeiro
            const escolaLocal = todasEscolas.find(e => e.id === id);
            if (escolaLocal) {
                // Mostrar apenas esta escola na tabela
                renderizarTabela([escolaLocal]);
                return;
            }
            
            // Iniciar o indicador de carregamento
            tabelaEscolas.innerHTML = `
                <tr>
                    <td colspan="7" class="px-6 py-4 text-center">
                        <div class="flex justify-center">
                            <i class="fas fa-circle-notch fa-spin text-blue-500 text-xl"></i>
                            <span class="ml-2">Buscando escola...</span>
                        </div>
                    </td>
                </tr>
            `;
            
            // Tentar fazer a busca direta pela API
            let url = `${API_BASE_URL}/schools/${id}`;
            
            // Verificar se a API global está disponível
            if (window.API && window.API.escolas && window.API.escolas.buscarPorId) {
                try {
                    const escolaAPI = await window.API.escolas.buscarPorId(id);
                    
                    if (escolaAPI) {
                        // Mostrar a escola encontrada
                        renderizarTabela([escolaAPI]);
                    } else {
                        tabelaEscolas.innerHTML = `
                            <tr>
                                <td colspan="7" class="px-6 py-4 text-center text-gray-500">
                                    Nenhuma escola encontrada com ID ${id}.
                                </td>
                            </tr>
                        `;
                    }
                    return;
                } catch (error) {
                    console.log('Erro ao buscar escola via API global, tentando requisição direta:', error);
                    // Continuar com a requisição direta abaixo
                }
            }
            
            // Fazer a requisição direta
            const response = await fetch(url, {
                method: 'GET',
                headers: headers
            });
            
            if (response.ok) {
                const escola = await response.json();
                // Mostrar a escola encontrada
                renderizarTabela([escola]);
            } else if (response.status === 404) {
                tabelaEscolas.innerHTML = `
                    <tr>
                        <td colspan="7" class="px-6 py-4 text-center text-gray-500">
                            Nenhuma escola encontrada com ID ${id}.
                        </td>
                    </tr>
                `;
            } else {
                throw new Error(`Erro ao buscar escola: ${response.status}`);
            }
        } catch (error) {
            console.error('Erro ao buscar escola por ID:', error);
            tabelaEscolas.innerHTML = `
                <tr>
                    <td colspan="7" class="px-6 py-4 text-center text-red-500">
                        Ocorreu um erro ao buscar a escola. Tente novamente.
                    </td>
                </tr>
            `;
        }
    }
    
    // Função para abrir o modal para adicionar nova escola
    async function abrirModalNovaEscola() {
        // Resetar o formulário
        formEscola.reset();
        
        // Configurar modo de adição
        modoEdicao = false;
        escolaIdEmEdicao = null;
        
        // Atualizar título do modal
        document.querySelector('#modal-escola h3').textContent = 'Nova Escola';

        // const filtroRegiaoPost = document.getElementById('regiao-escola-post');
        // const filtroGrupoPost = document.getElementById('grupo-escola-post');

        filtroRegiao.innerHTML = '';
        filtroGrupo.innerHTML = '';

        const regioes = await fetch(`${API_BASE_URL}/regions`, { headers }).then(res => res.json());
        const grupos = await fetch(`${API_BASE_URL}/groups`, { headers }).then(res => res.json());

        regioes.forEach(regiao => {
            const option = document.createElement('option');
            option.value = regiao.id;
            option.textContent = regiao.name;
            regiaoEscolaSelect.appendChild(option);
        });

        grupos.forEach(grupo => {
            const option = document.createElement('option');
            option.value = grupo.id;
            option.textContent = grupo.name;
            grupoEscolaSelect.appendChild(option);
        });
        // Exibir o modal
        modalEscola.classList.remove('hidden');
    }
    
    // Função para fechar o modal
    function fecharModalEscola() {
        modalEscola.classList.add('hidden');
        formEscola.reset();
    }
    
    // Função para salvar escola (adicionar nova ou atualizar existente)
    async function salvarEscola(event) {
        event.preventDefault();
        
        // Obter dados do formulário
        const nome = nomeEscolaInput.value.trim();
        const regiao = regiaoEscolaSelect.value;
        const grupo = grupoEscolaSelect.value;
        
        // Validação simples
        if (!nome) {
            alert('Por favor, informe o nome da escola.');
            return;
        }
        
        // Dados para enviar à API
        const escolaData = {
            name: nome || 'N/A',
            regionId: Number.parseInt(regiao),
            groupId: Number.parseInt(grupo)
        };
        console.log(escolaData);
        try {
            let url = `${API_BASE_URL}/schools`;
            let method = 'POST';
            
            // Se estiver em modo de edição, usar PUT com o ID correto
            if (modoEdicao && escolaIdEmEdicao) {
                url = `${API_BASE_URL}/schools/${escolaIdEmEdicao}`;
                method = 'PUT';
            }
            
            const response = await fetch(url, {
                method: method,
                headers: headers,
                body: JSON.stringify(escolaData)
            });
            
            if (!response.ok) {
                throw new Error(`Erro ao ${modoEdicao ? 'atualizar' : 'adicionar'} escola: ${response.status}`);
            }
            
            // Fechar o modal
            fecharModalEscola();
            
            // Recarregar a lista de escolas
            await carregarEscolas();
            
            // Recarregar filtros
            carregarFiltros();
            
        } catch (error) {
            console.error('Erro ao salvar escola:', error);
            alert(`Não foi possível ${modoEdicao ? 'atualizar' : 'adicionar'} a escola. Por favor, tente novamente.`);
    }
    }
    
    // Função para editar uma escola existente
    async function editarEscola(id) {
        try {
            // Encontrar a escola pelo ID
            const escola = todasEscolas.find(e => e.id == id);
            
            if (!escola) {
                throw new Error(`Escola com ID ${id} não encontrada`);
            }
            
            // Preencher o formulário com os dados da escola
            nomeEscolaInput.value = escola.name || '';
            
            // Selecionar a região
            if (escola.region) {
                for (let i = 0; i < regiaoEscolaSelect.options.length; i++) {
                    if (regiaoEscolaSelect.options[i].value === escola.region) {
                        regiaoEscolaSelect.selectedIndex = i;
                        break;
                    }
                }
            }
            
            // Selecionar o grupo
            if (escola.group) {
                for (let i = 0; i < grupoEscolaSelect.options.length; i++) {
                    if (grupoEscolaSelect.options[i].value === escola.group) {
                        grupoEscolaSelect.selectedIndex = i;
                        break;
                    }
                }
            }
            
            // Configurar modo de edição
            modoEdicao = true;
            escolaIdEmEdicao = id;
                
            // Atualizar título do modal
            document.querySelector('#modal-escola h3').textContent = 'Editar Escola';
                
            // Exibir o modal
                modalEscola.classList.remove('hidden');
            
        } catch (error) {
            console.error('Erro ao preparar edição de escola:', error);
            alert('Não foi possível carregar os dados da escola para edição.');
        }
    }
    
    // Função para confirmar a exclusão de uma escola
    function confirmarExclusao(id, nome) {
        if (confirm(`Tem certeza que deseja excluir a escola "${nome}"? Esta ação não pode ser desfeita.`)) {
            excluirEscola(id);
        }
    }
    
    // Função para excluir uma escola
    async function excluirEscola(id) {
        try {
            const response = await fetch(`${API_BASE_URL}/schools/${id}`, {
                method: 'DELETE',
                headers: headers
            });
            
            if (!response.ok) {
                throw new Error(`Erro ao excluir escola: ${response.status}`);
            }
            
            // Remover escola da lista local
            todasEscolas = todasEscolas.filter(escola => escola.id != id);
            
            // Atualizar a tabela
            renderizarTabela(todasEscolas);
            
            // Exibir mensagem de sucesso
                alert('Escola excluída com sucesso!');
            
            } catch (error) {
                console.error('Erro ao excluir escola:', error);
            alert('Não foi possível excluir a escola. Por favor, tente novamente.');
        }
    }
    
    // Função para mostrar mensagem de erro
    function mostrarErro(mensagem) {
        alert(mensagem);
    }
}); 