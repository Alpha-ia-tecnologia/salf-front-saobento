document.addEventListener('DOMContentLoaded', function() {
    // Referências aos elementos do formulário
    const formCadastroUsuario = document.getElementById('form-cadastro-usuario');
    const nomeUsuario = document.getElementById('nome-usuario');
    const emailUsuario = document.getElementById('email-usuario');
    const senhaUsuario = document.getElementById('senha-usuario');
    const confirmarSenha = document.getElementById('confirmar-senha');
    const tipo = document.getElementById('tipo-usuario');
    console.log(tipo);
    

    // Endpoint base da API
    const API_BASE_URL = 'https://salf-salf-api2.gkgtsp.easypanel.host/api';
    
    // Token de autenticação
    const AUTH_TOKEN = localStorage.getItem('token');

    // Event Listeners
    formCadastroUsuario.addEventListener('submit', cadastrarUsuario);

    // Função para validar o formulário
    function validarFormulario() {
        // Verificar se todos os campos obrigatórios estão preenchidos
        if (!nomeUsuario.value.trim()) {
            alert('Por favor, insira o nome do usuário.');
            nomeUsuario.focus();
            return false;
        }

        if (!emailUsuario.value.trim()) {
            alert('Por favor, insira o e-mail do usuário.');
            emailUsuario.focus();
            return false;
        }

        // Validar formato de e-mail
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(emailUsuario.value)) {
            alert('Por favor, insira um e-mail válido.');
            emailUsuario.focus();
            return false;
        }

        if (!senhaUsuario.value) {
            alert('Por favor, insira a senha.');
            senhaUsuario.focus();
            return false;
        }

        if (senhaUsuario.value.length < 6) {
            alert('A senha deve ter pelo menos 6 caracteres.');
            senhaUsuario.focus();
            return false;
        }

        if (senhaUsuario.value !== confirmarSenha.value) {
            alert('As senhas não coincidem.');
            confirmarSenha.focus();
            return false;
        }

      

        return true;
    }

    // Função para cadastrar o usuário
    function cadastrarUsuario(e) {
        e.preventDefault();

        // Validar formulário antes de prosseguir
        if (!validarFormulario()) {
            return;
        }

        // Preparar os dados do usuário para envio à API
        const dadosUsuario = {
            name: nomeUsuario.value.trim(),
            email: emailUsuario.value.trim(),
            password: senhaUsuario.value,
            role: tipo.value,
        };

        // Enviar para a API
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
                if (response.status === 409) {
                    throw new Error('Já existe um usuário cadastrado com este e-mail.');
                }
                throw new Error('Erro ao cadastrar usuário');
            }
            return response.json();
        })
        .then(data => {
            // Exibir mensagem de sucesso
            alert('Usuário cadastrado com sucesso!');
            
            // Redirecionar para a lista de usuários
            window.location.href = 'listar.html';
        })
        .catch(error => {
            console.error('Erro ao cadastrar usuário:', error);
            
            if (error.message.includes('e-mail')) {
                emailUsuario.focus();
            }
            
            alert(error.message || 'Erro ao cadastrar usuário. Por favor, tente novamente.');
        });
    }

    // Função para mostrar feedback de força da senha
    senhaUsuario.addEventListener('input', function() {
        const senha = senhaUsuario.value;
        const confirmar = confirmarSenha.value;
        
        // Se tiver uma senha confirmada, verificar se combinam
        if (confirmar && senha !== confirmar) {
            confirmarSenha.classList.add('border-red-500');
            confirmarSenha.classList.remove('border-green-500');
        } else if (confirmar) {
            confirmarSenha.classList.add('border-green-500');
            confirmarSenha.classList.remove('border-red-500');
        }
    });

    // Verificar se as senhas combinam quando digitar na confirmação
    confirmarSenha.addEventListener('input', function() {
        const senha = senhaUsuario.value;
        const confirmar = confirmarSenha.value;
        
        if (senha && confirmar) {
            if (senha === confirmar) {
                confirmarSenha.classList.add('border-green-500');
                confirmarSenha.classList.remove('border-red-500');
            } else {
                confirmarSenha.classList.add('border-red-500');
                confirmarSenha.classList.remove('border-green-500');
            }
        }
    });
}); 