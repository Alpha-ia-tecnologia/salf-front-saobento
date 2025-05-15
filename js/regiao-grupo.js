document.addEventListener('DOMContentLoaded', function() {
    // Referências aos elementos
    // Abas
    const tabRegioes = document.getElementById('tab-regioes');
    const tabGrupos = document.getElementById('tab-grupos');
    const conteudoRegioes = document.getElementById('conteudo-regioes');
    const conteudoGrupos = document.getElementById('conteudo-grupos');
    
    // Botões e modais para regiões
    const btnNovaRegiao = document.getElementById('btn-nova-regiao');
    const modalRegiao = document.getElementById('modal-regiao');
    const fecharModalRegiao = document.getElementById('fechar-modal-regiao');
    const cancelarRegiao = document.getElementById('cancelar-regiao');
    const formRegiao = document.getElementById('form-regiao');
    const tituloModalRegiao = document.getElementById('titulo-modal-regiao');
    
    // Botões e modais para grupos
    const btnNovoGrupo = document.getElementById('btn-novo-grupo');
    const modalGrupo = document.getElementById('modal-grupo');
    const fecharModalGrupo = document.getElementById('fechar-modal-grupo');
    const cancelarGrupo = document.getElementById('cancelar-grupo');
    const formGrupo = document.getElementById('form-grupo');
    const tituloModalGrupo = document.getElementById('titulo-modal-grupo');
    const regiaoGrupo = document.getElementById('regiao-grupo');
    
    // API endpoints
    const API_BASE_URL = 'https://api.salf.maximizaedu.com/api';
    
    // Token de autenticação
    const token = localStorage.getItem('token');
    
    // Event Listeners para abas
    tabRegioes.addEventListener('click', function() {
        ativarAba(this, conteudoRegioes);
        desativarAba(tabGrupos, conteudoGrupos);
    });
    
    tabGrupos.addEventListener('click', function() {
        ativarAba(this, conteudoGrupos);
        desativarAba(tabRegioes, conteudoRegioes);
    });
    
    // Event Listeners para regiões
    btnNovaRegiao.addEventListener('click', abrirModalNovaRegiao);
    fecharModalRegiao.addEventListener('click', fecharModalDaRegiao);
    cancelarRegiao.addEventListener('click', fecharModalDaRegiao);
    formRegiao.addEventListener('submit', salvarRegiao);
    
    // Event Listeners para grupos
    btnNovoGrupo.addEventListener('click', abrirModalNovoGrupo);
    fecharModalGrupo.addEventListener('click', fecharModalDoGrupo);
    cancelarGrupo.addEventListener('click', fecharModalDoGrupo);
    formGrupo.addEventListener('submit', salvarGrupo);
    
    // Inicializar dados
    carregarRegioes();
    carregarGrupos();
    
    // Funções para gerenciar abas
    function ativarAba(aba, conteudo) {
        aba.classList.add('tab-active', 'border-blue-500', 'text-blue-600');
        aba.classList.remove('border-transparent', 'text-gray-500');
        conteudo.classList.remove('hidden');
    }
    
    function desativarAba(aba, conteudo) {
        aba.classList.remove('tab-active', 'border-blue-500', 'text-blue-600');
        aba.classList.add('border-transparent', 'text-gray-500');
        conteudo.classList.add('hidden');
    }
    
    // Funções para gerenciar regiões
    function carregarRegioes() {
        fetch(`${API_BASE_URL}/regions`, {
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Erro ao buscar regiões');
            }
            return response.json();
        })
        .then(regioes => {
            atualizarTabelaRegioes(regioes);
            
            // Também atualiza o select de regiões no formulário de grupos
            regiaoGrupo.innerHTML = '<option value="">Selecione uma região</option>';
            regioes.forEach(regiao => {
                const option = document.createElement('option');
                option.value = regiao.id;
                option.textContent = regiao.name;
                regiaoGrupo.appendChild(option);
            });
        })
        .catch(error => {
            console.error('Erro ao carregar regiões:', error);
            alert('Erro ao carregar regiões. Por favor, tente novamente.');
        });
    }
    
    function atualizarTabelaRegioes(regioes) {
        const tbody = document.getElementById('tabela-regioes');
        tbody.innerHTML = '';
        
        if (!regioes || regioes.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="4" class="px-6 py-4 text-center text-gray-500">
                        Nenhuma região cadastrada
                    </td>
                </tr>
            `;
            return;
        }
        
        regioes.forEach(regiao => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${regiao.id}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900">${regiao.name}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${regiao.description || '-'}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button class="text-yellow-600 hover:text-yellow-900 mr-3 btn-editar-regiao" data-id="${regiao.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="text-red-600 hover:text-red-900 btn-excluir-regiao" data-id="${regiao.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });
        
        // Configurar eventos dos botões
        document.querySelectorAll('.btn-editar-regiao').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = this.getAttribute('data-id');
                editarRegiao(id);
            });
        });
        
        document.querySelectorAll('.btn-excluir-regiao').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = this.getAttribute('data-id');
                excluirRegiao(id);
            });
        });
    }
    
    function abrirModalNovaRegiao() {
        tituloModalRegiao.textContent = 'Nova Região';
        formRegiao.reset();
        formRegiao.removeAttribute('data-id');
        modalRegiao.classList.remove('hidden');
    }
    
    function fecharModalDaRegiao() {
        modalRegiao.classList.add('hidden');
        formRegiao.reset();
    }
    
    function editarRegiao(id) {
        fetch(`${API_BASE_URL}/regions/${id}`, {
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Erro ao buscar região');
            }
            return response.json();
        })
        .then(regiao => {
            tituloModalRegiao.textContent = 'Editar Região';
            document.getElementById('nome-regiao').value = regiao.name;
            document.getElementById('descricao-regiao').value = regiao.description || '';
            formRegiao.setAttribute('data-id', regiao.id);
            modalRegiao.classList.remove('hidden');
        })
        .catch(error => {
            console.error('Erro ao carregar região para edição:', error);
            alert('Erro ao carregar região para edição. Por favor, tente novamente.');
        });
    }
    
    function salvarRegiao(e) {
        e.preventDefault();
        
        const nome = document.getElementById('nome-regiao').value;
        const descricao = document.getElementById('descricao-regiao').value;
        
        if (!nome) {
            alert('O nome da região é obrigatório.');
            return;
        }
        
        const dados = {
            name: nome,
            description: descricao
        };
        
        const id = formRegiao.getAttribute('data-id');
        
        // Determinar se é uma atualização ou uma nova região
        const metodo = id ? 'PUT' : 'POST';
        const url = id ? `${API_BASE_URL}/regions/${id}` : `${API_BASE_URL}/regions`;
        
        fetch(url, {
            method: metodo,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(dados)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Erro ao salvar região');
            }
            return response.json();
        })
        .then(() => {
            alert(`Região ${id ? 'atualizada' : 'cadastrada'} com sucesso!`);
            fecharModalDaRegiao();
            carregarRegioes();
        })
        .catch(error => {
            console.error('Erro ao salvar região:', error);
            alert('Erro ao salvar região. Por favor, tente novamente.');
        });
    }
    
    function excluirRegiao(id) {
        if (confirm('Tem certeza que deseja excluir esta região? Todos os grupos associados serão excluídos também.')) {
            fetch(`${API_BASE_URL}/regions/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Erro ao excluir região');
                }
                return response.text();
            })
            .then(() => {
                alert('Região excluída com sucesso!');
                carregarRegioes();
                carregarGrupos(); // Recarrega grupos pois podem ter sido afetados
            })
            .catch(error => {
                console.error('Erro ao excluir região:', error);
                alert('Erro ao excluir região. Por favor, tente novamente.');
            });
        }
    }
    
    // Funções para gerenciar grupos
    function carregarGrupos() {
        fetch(`${API_BASE_URL}/groups`, {
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Erro ao buscar grupos');
            }
            return response.json();
        })
        .then(grupos => {
            atualizarTabelaGrupos(grupos);
        })
        .catch(error => {
            console.error('Erro ao carregar grupos:', error);
            alert('Erro ao carregar grupos. Por favor, tente novamente.');
        });
    }
    
    function atualizarTabelaGrupos(grupos) {
        const tbody = document.getElementById('tabela-grupos');
        tbody.innerHTML = '';
        
        if (!grupos || grupos.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" class="px-6 py-4 text-center text-gray-500">
                        Nenhum grupo cadastrado
                    </td>
                </tr>
            `;
            return;
        }
        
        grupos.forEach(grupo => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${grupo.id}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900">${grupo.name}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${grupo.region?.name || '-'}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${grupo.description || '-'}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button class="text-yellow-600 hover:text-yellow-900 mr-3 btn-editar-grupo" data-id="${grupo.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="text-red-600 hover:text-red-900 btn-excluir-grupo" data-id="${grupo.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });
        
        // Configurar eventos dos botões
        document.querySelectorAll('.btn-editar-grupo').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = this.getAttribute('data-id');
                editarGrupo(id);
            });
        });
        
        document.querySelectorAll('.btn-excluir-grupo').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = this.getAttribute('data-id');
                excluirGrupo(id);
            });
        });
    }
    
    function abrirModalNovoGrupo() {
        // Certifique-se de que o select de regiões esteja populado
        if (regiaoGrupo.options.length <= 1) {
            carregarRegioes();
        }
        
        tituloModalGrupo.textContent = 'Novo Grupo';
        formGrupo.reset();
        formGrupo.removeAttribute('data-id');
        modalGrupo.classList.remove('hidden');
    }
    
    function fecharModalDoGrupo() {
        modalGrupo.classList.add('hidden');
        formGrupo.reset();
    }
    
    function editarGrupo(id) {
        fetch(`${API_BASE_URL}/groups/${id}`, {
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Erro ao buscar grupo');
            }
            return response.json();
        })
        .then(grupo => {
            tituloModalGrupo.textContent = 'Editar Grupo';
            document.getElementById('regiao-grupo').value = grupo.regionId;
            document.getElementById('nome-grupo').value = grupo.name;
            document.getElementById('descricao-grupo').value = grupo.description || '';
            formGrupo.setAttribute('data-id', grupo.id);
            modalGrupo.classList.remove('hidden');
        })
        .catch(error => {
            console.error('Erro ao carregar grupo para edição:', error);
            alert('Erro ao carregar grupo para edição. Por favor, tente novamente.');
        });
    }
    
    function salvarGrupo(e) {
        e.preventDefault();
        
        const regiaoId = document.getElementById('regiao-grupo').value;
        const nome = document.getElementById('nome-grupo').value;
        const descricao = document.getElementById('descricao-grupo').value;
        
        if (!regiaoId || !nome) {
            alert('A região e o nome do grupo são obrigatórios.');
            return;
        }
        
        const dados = {
            name: nome,
            description: descricao,
            regionId: parseInt(regiaoId)
        };
        
        const id = formGrupo.getAttribute('data-id');
        
        // Determinar se é uma atualização ou um novo grupo
        const metodo = id ? 'PUT' : 'POST';
        const url = id ? `${API_BASE_URL}/groups/${id}` : `${API_BASE_URL}/groups`;
        
        fetch(url, {
            method: metodo,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(dados)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Erro ao salvar grupo');
            }
            return response.json();
        })
        .then(() => {
            alert(`Grupo ${id ? 'atualizado' : 'cadastrado'} com sucesso!`);
            fecharModalDoGrupo();
            carregarGrupos();
        })
        .catch(error => {
            console.error('Erro ao salvar grupo:', error);
            alert('Erro ao salvar grupo. Por favor, tente novamente.');
        });
    }
    
    function excluirGrupo(id) {
        if (confirm('Tem certeza que deseja excluir este grupo?')) {
            fetch(`${API_BASE_URL}/groups/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Erro ao excluir grupo');
                }
                return response.text();
            })
            .then(() => {
                alert('Grupo excluído com sucesso!');
                carregarGrupos();
            })
            .catch(error => {
                console.error('Erro ao excluir grupo:', error);
                alert('Erro ao excluir grupo. Por favor, tente novamente.');
            });
        }
    }
}); 