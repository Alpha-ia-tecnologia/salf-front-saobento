document.addEventListener('DOMContentLoaded', function() {
    // URL base da API
    const API_BASE_URL = "https://api.salf.maximizaedu.com/api";
    
    // Referências aos elementos do DOM
    const loginForm = document.getElementById('login-form');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const loginButton = document.getElementById('login-button');
    const loadingSpinner = document.getElementById('loading-spinner');
    const loginError = document.getElementById('login-error');
    const errorMessage = document.getElementById('error-message');
    localStorage.clear();
    // Token de autenticação - obter do localStorage
    const token = localStorage.getItem('token') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IlVzdWFyaW8gU0FMRiIsImlhdCI6MTUxNjIzOTAyMn0.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
    if (token) {
        // Se existir token, verificar se é válido
        validarToken(token)
            .then(valido => {
                if (valido) {
                    // Token válido, redirecionar para o dashboard
                    redirecionarParaDashboard();
                }
            })
            .catch(err => {
                // Em caso de erro, remover o token e manter na página de login
                console.error("Erro ao validar token:", err);
                localStorage.removeItem('token');
            });
    }
    
    // Event listener para o formulário de login
    loginForm.addEventListener('submit', function(event) {
        event.preventDefault();
        
        // Obter os valores dos campos
        const email = emailInput.value.trim();
        const password = passwordInput.value;
        
        // Validação simples
        if (!email || !password) {
            mostrarErro('Por favor, preencha todos os campos.');
            return;
        }
        
        // Desabilitar botão e mostrar spinner durante o login
        loginButton.disabled = true;
        loadingSpinner.classList.remove('hidden');
        loginError.classList.add('hidden');
        
        // Realizar requisição de login
        realizarLogin(email, password);
    });
    
    // Função para realizar o login
    async function realizarLogin(email, password) {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });
            
            if (response.ok) {
                const data = await response.json();
                
                // Verificar se a resposta contém um token
                if (data.token) {
                    // Armazenar o token no localStorage
                    localStorage.setItem('token', data.token);
                    
                    // Armazenar informações do usuário
                    if (data.user) {
                        localStorage.setItem('user', JSON.stringify(data.user));
                    }
                    
                    console.log("Login bem-sucedido, redirecionando para o dashboard...");
                    
                    // Esperar um momento antes de redirecionar para garantir que os dados foram salvos
                    setTimeout(() => {
                        redirecionarParaDashboard();
                    }, 500);
                } else {
                    mostrarErro('Resposta de autenticação inválida.');
                }
            } else {
                // Login falhou
                const errorData = await response.json().catch(() => ({}));
                const mensagem = errorData.message || 'Credenciais inválidas. Verifique seu email e senha.';
                mostrarErro(mensagem);
            }
        } catch (error) {
            console.error('Erro durante o login:', error);
            mostrarErro('Erro de conexão. Verifique sua internet e tente novamente.');
        } finally {
            // Reativar botão e esconder spinner
            loginButton.disabled = false;
            loadingSpinner.classList.add('hidden');
        }
    }
    
    // Função para validar token existente
    async function validarToken(token) {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/validate`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            return response.ok;
        } catch (error) {
            console.error('Erro ao validar token:', error);
            return false;
        }
    }
    
    // Função para mostrar mensagem de erro
    function mostrarErro(mensagem) {
        errorMessage.textContent = mensagem;
        loginError.classList.remove('hidden');
    }
    
    // Função para redirecionar para o dashboard
    function redirecionarParaDashboard() {
        // Garantir que o redirecionamento funcione corretamente, independente da localização atual
        const currentPath = window.location.pathname;
        const basePath = currentPath.substring(0, currentPath.lastIndexOf('/') + 1);
        const dashboardUrl = `${window.location.protocol}//${window.location.host}${basePath}pages/dashboard/index.html`;
        
        console.log("Redirecionando para:", dashboardUrl);
        
        window.location.href = dashboardUrl;
        
        // Caso o redirecionamento acima falhe, tente um método mais direto
        setTimeout(() => {
            if (window.location.pathname.includes('login.html')) {
                console.log("Redirecionamento alternativo...");
                window.location.replace('pages/dashboard/index.html');
            }
        }, 1000);
    }
}); 