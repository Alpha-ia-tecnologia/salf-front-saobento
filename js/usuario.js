document.addEventListener('DOMContentLoaded', function() {
    // Referências aos elementos
    const btnNovoUsuario = document.getElementById('btn-novo-usuario');
    const modalUsuario = document.getElementById('modal-usuario');
    const fecharModal = document.getElementById('fechar-modal');
    const cancelarUsuario = document.getElementById('cancelar-usuario');
    const formUsuario = document.getElementById('form-usuario');
    const filtroTipo = document.getElementById('filtro-tipo');
    const pesquisa = document.getElementById('pesquisa');
    
    // Verificar se estamos na página de listagem
    const isListPage = window.location.href.includes('listar.html');
    
    // Endpoint base da API
    const API_BASE_URL = 'https://salf-salf-api.py5r5i.easypanel.host/api';
    
    // Token de autenticação (mock)
    const AUTH_TOKEN = localStorage.getItem('token');
    // Redirecionar para a página de cadastro quando clicar em novo usuário
    if (btnNovoUsuario) {
        btnNovoUsuario.addEventListener('click', function() {
            window.location.href = 'cadastrar.html';
        });
    }
    
    // Array para armazenar os usuários
    let usuarios = [];
    
    // Event Listeners para modal (apenas na página de listagem)
    if (isListPage) {
        if (fecharModal) fecharModal.addEventListener('click', fecharModalUsuario);
        if (cancelarUsuario) cancelarUsuario.addEventListener('click', fecharModalUsuario);
        if (formUsuario) formUsuario.addEventListener('submit', salvarUsuario);
        
        if (filtroTipo) filtroTipo.addEventListener('change', filtrarUsuarios);
        if (pesquisa) pesquisa.addEventListener('input', filtrarUsuarios);
        
        // Carregar usuários da API
        carregarUsuarios();
    }
    
    // Funções
    function carregarUsuarios() {
        fetch(`${API_BASE_URL}/users`, {
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${AUTH_TOKEN}`
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Erro ao buscar usuários');
            }
            return response.json();
        })
        .then(data => {
            usuarios = data;
            atualizarTabela();
            configurarBotoes();
        })
        .catch(error => {
            console.error('Erro ao carregar usuários:', error);
            alert('Erro ao carregar usuários. Por favor, tente novamente.');
        });
    }
    
    function abrirModal() {
        modalUsuario.classList.remove('hidden');
        document.getElementById('nome-usuario').focus();
        
        // Resetar o formulário
        formUsuario.reset();
        document.getElementById('status-usuario').checked = true;
        formUsuario.removeAttribute('data-editing-id');
        
        // Resetar o título do modal
        const modalTitle = modalUsuario.querySelector('h3');
        modalTitle.textContent = 'Novo Usuário';
        
        // Resetar o botão de submit
        const btnSubmit = formUsuario.querySelector('button[type="submit"]');
        btnSubmit.textContent = 'Salvar';
    }
    
    function fecharModalUsuario() {
        modalUsuario.classList.add('hidden');
        formUsuario.reset();
    }
    
    function salvarUsuario(e) {
        e.preventDefault();
        
        const nomeUsuario = document.getElementById('nome-usuario').value;
        const emailUsuario = document.getElementById('email-usuario').value;
        const senhaUsuario = document.getElementById('senha-usuario').value;
        const tipoUsuario = document.getElementById('tipo-usuario').value;
        const statusUsuario = document.getElementById('status-usuario').checked;
        
        if (!nomeUsuario || !emailUsuario || !tipoUsuario) {
            alert('Por favor, preencha todos os campos.');
            return;
        }
        
        // Criar objeto de dados
        const dadosUsuario = {
            name: nomeUsuario,
            email: emailUsuario,
            role: tipoUsuario.toUpperCase(),
            active: statusUsuario
        };
        
        // Adicionar senha apenas se fornecida
        if (senhaUsuario) {
            dadosUsuario.password = senhaUsuario;
        }
        
        // Verificar se estamos editando ou criando um novo usuário
        const idEditing = formUsuario.getAttribute('data-editing-id');
        
        if (idEditing) {
            // Editando um usuário existente
            fetch(`${API_BASE_URL}/users/${idEditing}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${AUTH_TOKEN}`
                },
                body: JSON.stringify(dadosUsuario)
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Erro ao atualizar usuário');
                }
                return response.json();
            })
            .then(data => {
                alert('Usuário atualizado com sucesso!');
                fecharModalUsuario();
                carregarUsuarios();
            })
            .catch(error => {
                console.error('Erro ao atualizar usuário:', error);
                alert('Erro ao atualizar usuário. Por favor, tente novamente.');
            });
        } else {
            // Criando um novo usuário
            fetch(`${API_BASE_URL}/users`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${AUTH_TOKEN}`
                },
                body: JSON.stringify(dadosUsuario)
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Erro ao cadastrar usuário');
                }
                return response.json();
            })
            .then(data => {
                alert('Usuário cadastrado com sucesso!');
                fecharModalUsuario();
                carregarUsuarios();
            })
            .catch(error => {
                console.error('Erro ao cadastrar usuário:', error);
                alert('Erro ao cadastrar usuário. Por favor, tente novamente.');
            });
        }
    }
    
    function filtrarUsuarios() {
        const tipoFiltrado = filtroTipo ? filtroTipo.value.toUpperCase() : '';
        const textoPesquisa = pesquisa ? pesquisa.value.toLowerCase() : '';
        
        // Filtragem
        let usuariosFiltrados = [...usuarios];
        
        if (tipoFiltrado) {
            usuariosFiltrados = usuariosFiltrados.filter(u => u.role.toUpperCase() === tipoFiltrado);
        }
        
        if (textoPesquisa) {
            usuariosFiltrados = usuariosFiltrados.filter(u => 
                (u.name && u.name.toLowerCase().includes(textoPesquisa)) || 
                (u.email && u.email.toLowerCase().includes(textoPesquisa))
            );
        }
        
        // Atualizar a tabela com os resultados filtrados
        atualizarTabela(usuariosFiltrados);
    }
    
    function atualizarTabela(usuariosFiltrados = null) {
        const tbody = document.querySelector('table tbody');
        if (!tbody) return;
        
        tbody.innerHTML = '';
        
        const dadosParaMostrar = usuariosFiltrados || usuarios;
        
        if (dadosParaMostrar.length === 0) {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td colspan="6" class="px-6 py-4 text-center text-gray-500">
                    Nenhum usuário encontrado
                </td>
            `;
            tbody.appendChild(tr);
            
            // Atualizar contador de resultados
            const resultadosMsg = document.querySelector('.bg-white.px-4.py-3 .text-sm.text-gray-700');
            if (resultadosMsg) {
                resultadosMsg.innerHTML = `
                    Mostrando <span class="font-medium">0</span> de <span class="font-medium">${usuarios.length}</span> resultados
                `;
            }
            
            return;
        }
        
        // Mapear papel para texto e classe
        const roleMap = {
            'ADMIN': { text: 'Administrador', class: 'bg-purple-100 text-purple-800' },
            'COORDINATOR': { text: 'Coordenador', class: 'bg-blue-100 text-blue-800' },
            'APPLICATOR': { text: 'Aplicador', class: 'bg-green-100 text-green-800' },
            'MANAGER': { text: 'Gestor', class: 'bg-yellow-100 text-yellow-800' }
        };
        
        dadosParaMostrar.forEach(usuario => {
            // Determinar classes e textos para exibição
            const roleInfo = roleMap[usuario.role] || { text: usuario.role, class: 'bg-gray-100 text-gray-800' };
            const statusClass = 'bg-green-100 text-green-800';
            const statusText = 'Ativo' ;
            
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${usuario.id}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900">${usuario.name}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${usuario.email}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${roleInfo.class}">
                        ${roleInfo.text}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusClass}">
                        ${statusText}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button class="text-yellow-600 hover:text-yellow-900 mr-3 btn-editar" data-id="${usuario.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="text-red-600 hover:text-red-900 btn-excluir" data-id="${usuario.id}">
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
                Mostrando <span class="font-medium">1</span> a <span class="font-medium">${dadosParaMostrar.length}</span> de <span class="font-medium">${usuarios.length}</span> resultados
            `;
        }
        
        // Reconfigura os botões após atualizar a tabela
        configurarBotoes();
    }
    
    function configurarBotoes() {
        // Botões de editar
        document.querySelectorAll('.btn-editar').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = parseInt(this.getAttribute('data-id'));
                editarUsuario(id);
            });
        });
        
        // Botões de excluir
        document.querySelectorAll('.btn-excluir').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = parseInt(this.getAttribute('data-id'));
                excluirUsuario(id);
            });
        });
    }
    
    function editarUsuario(id) {
        // Buscar detalhes do usuário da API
        fetch(`${API_BASE_URL}/users/${id}`, {
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${AUTH_TOKEN}`
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Erro ao buscar dados do usuário');
            }
            return response.json();
        })
        .then(usuario => {
            // Preencher o formulário com os dados do usuário
            document.getElementById('nome-usuario').value = usuario.name;
            document.getElementById('email-usuario').value = usuario.email;
            document.getElementById('senha-usuario').value = ''; // Por segurança, não preenchemos a senha
            document.getElementById('tipo-usuario').value = usuario.role.toLowerCase();
            document.getElementById('status-usuario').checked = usuario.active;
            
            // Modificar o formulário para modo de edição
            formUsuario.setAttribute('data-editing-id', id);
            
            // Modificar o título do modal
            const modalTitle = modalUsuario.querySelector('h3');
            modalTitle.textContent = 'Editar Usuário';
            
            // Modificar o botão de submit
            const btnSubmit = formUsuario.querySelector('button[type="submit"]');
            btnSubmit.textContent = 'Atualizar';
            
            // Abrir o modal
            modalUsuario.classList.remove('hidden');
        })
        .catch(error => {
            console.error('Erro ao editar usuário:', error);
            alert('Erro ao buscar dados do usuário. Por favor, tente novamente.');
        });
    }
    
    function excluirUsuario(id) {
        if (confirm('Tem certeza que deseja excluir este usuário?')) {
            fetch(`${API_BASE_URL}/users/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${AUTH_TOKEN}`
                }
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Erro ao excluir usuário');
                }
                return response.text();
            })
            .then(() => {
                alert('Usuário excluído com sucesso!');
                carregarUsuarios();
            })
            .catch(error => {
                console.error('Erro ao excluir usuário:', error);
                alert('Erro ao excluir usuário. Por favor, tente novamente.');
            });
        }
    }
}); 