document.addEventListener('DOMContentLoaded', function() {
    // Verificar se o usuário está autenticado
    const token = localStorage.getItem('token');
    if (!token) {
        // Redirecionar para a página de login se não houver token
        window.location.href = 'login.html';
        return;
    }

    // Carregar o sidebar e header
    loadTemplate();

    // Gerenciar logout
    document.addEventListener('click', function(e) {
        if (e.target && (e.target.id === 'logout-btn' || e.target.closest('#logout-btn'))) {
            logout();
        }
    });
});

// Função para determinar o caminho base com base na URL atual
function getBasePath() {
    return window.location.protocol + '//' + window.location.host + '/';
}

function loadTemplate() {
    // Obter informações do usuário
    let userData = {};
    try {
        const userString = localStorage.getItem('user');
        if (userString) {
            userData = JSON.parse(userString);
        }
    } catch (e) {
        console.error('Erro ao carregar dados do usuário:', e);
    }
    
    // Verificar papel do usuário e usar um valor padrão mais privilegiado para garantir acesso durante o desenvolvimento
    // Em produção, isso deve ser alterado para um papel menos privilegiado como 'APPLICATOR'
    const userRole = userData.role || 'ADMIN';
    const userEmail = userData.email || 'usuário';
    const userName = userData.name || 'Usuário';
    
    // Log de depuração - remover em produção
    console.log("Informações do usuário:", {
        role: userRole,
        name: userName,
        email: userEmail
    });
    
    // Mapear o papel do usuário para um formato mais legível
    const roleDisplay = {
        'ADMIN': 'Administrador',
        'COORDINATOR': 'Coordenador',
        'APPLICATOR': 'Aplicador',
        'MANAGER': 'Gestor'
    };
    
    const displayRole = roleDisplay[userRole] || userRole;
    
    // Estrutura do cabeçalho
    const header = `
        <div class="bg-white border-b px-4 py-3 flex justify-between items-center">
            <div class="flex items-center">
                <button id="sidebar-toggle" class="text-gray-600 focus:outline-none lg:hidden mr-2">
                    <i class="fas fa-bars"></i>
                </button>
                <h1 class="text-xl font-bold text-blue-800">SALF</h1>
            </div>
            <div class="flex items-center">
                <div class="mr-4 text-sm text-gray-600">
                    <span class="font-semibold">${userName}</span>
                    <span class="ml-1 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">${displayRole}</span>
                </div>
                <button id="logout-btn" class="text-red-600 hover:text-red-800 focus:outline-none">
                    <i class="fas fa-sign-out-alt"></i> Sair
                </button>
            </div>
        </div>
    `;
    
    // Detectar a página atual para destacar o item de menu correspondente
    const currentPage = window.location.pathname;
    
    // Obter o caminho base para construir URLs absolutas
    const basePath = getBasePath();
    
    console.log("Base path:", basePath);
    console.log("Current page:", currentPage);
    
    // Estrutura do sidebar com permissões baseadas no papel do usuário
    let menuItems = '';
    
    // Menu comum a todos os usuários
    menuItems += `
        <a href="${basePath}pages/dashboard/index.html" class="flex items-center px-4 py-3 hover:bg-blue-700 transition ${currentPage.includes('/dashboard/') ? 'bg-blue-700' : ''}">
            <i class="fas fa-chart-bar w-6"></i>
            <span>Dashboard</span>
        </a>
    `;
    
    // Modificar as condições para garantir que todos os itens estejam acessíveis durante o desenvolvimento
    // Em produção, essas condições devem ser ajustadas para os papéis corretos
    
    // Menus específicos por papel - garantir que esses menus apareçam durante o desenvolvimento
    //if (['ADMIN', 'COORDINATOR', 'MANAGER'].includes(userRole)) {
        menuItems += `            <a href="${basePath}pages/escola/listar.html" class="flex items-center px-4 py-3 hover:bg-blue-700 transition ${currentPage.includes('/escola/') ? 'bg-blue-700' : ''}">
                <i class="fas fa-school w-6"></i>
                <span>Escolas</span>
            </a>
            <a href="${basePath}pages/turma/listar.html" class="flex items-center px-4 py-3 hover:bg-blue-700 transition ${currentPage.includes('/turma/') ? 'bg-blue-700' : ''}">
                <i class="fas fa-users w-6"></i>
                <span>Turmas</span>
            </a>
            <a href="${basePath}pages/aluno/listar.html" class="flex items-center px-4 py-3 hover:bg-blue-700 transition ${currentPage.includes('/aluno/') ? 'bg-blue-700' : ''}">
                <i class="fas fa-user-graduate w-6"></i>
                <span>Alunos</span>
            </a>
            <a href="${basePath}pages/avaliacao/listar.html" class="flex items-center px-4 py-3 hover:bg-blue-700 transition ${currentPage.includes('/avaliacao/listar') ? 'bg-blue-700' : ''}">
                <i class="fas fa-clipboard-check w-6"></i>
                <span>Avaliações</span>
            </a>
        `;
    //}
    
    //if (userRole === 'ADMIN') {
        menuItems += `            <a href="${basePath}pages/usuario/listar.html" class="flex items-center px-4 py-3 hover:bg-blue-700 transition ${currentPage.includes('/usuario/') ? 'bg-blue-700' : ''}">
                <i class="fas fa-user-cog w-6"></i>
                <span>Usuários</span>
            </a>
        `;
    //}
    
    //if (['APPLICATOR', 'ADMIN', 'COORDINATOR'].includes(userRole)) {
        menuItems += `            <a href="${basePath}pages/avaliacao/realizar.html" class="flex items-center px-4 py-3 hover:bg-blue-700 transition ${currentPage.includes('/avaliacao/realizar') ? 'bg-blue-700' : ''}">
                <i class="fas fa-tasks w-6"></i>
                <span>Realizar Avaliação</span>
            </a>
        `;
    //}
    
    const sidebar = `
        <div id="sidebar" class="h-screen bg-blue-800 text-white w-64 space-y-1 py-4 fixed inset-y-0 left-0 transform lg:relative lg:translate-x-0 -translate-x-full transition duration-200 ease-in-out z-10">
            <div class="flex items-center justify-between px-4 mb-4">
                <div class="flex items-center">
                    <h2 class="text-xl font-bold">SALF</h2>
                </div>
                <button id="sidebar-close" class="text-white focus:outline-none lg:hidden">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <nav>
                ${menuItems}
            </nav>
        </div>
    `;
    
    // Adicionar o template ao DOM
    const headerContainer = document.getElementById('header-container');
    if (headerContainer) {
        headerContainer.innerHTML = header;
    } else {
        console.warn("Elemento #header-container não encontrado");
    }
    
    const sidebarContainer = document.getElementById('sidebar-container');
    if (sidebarContainer) {
        sidebarContainer.innerHTML = sidebar;
    } else {
        console.warn("Elemento #sidebar-container não encontrado");
    }
    
    // Configurar toggle do sidebar para dispositivos móveis
    setupSidebarToggle();
}

function setupSidebarToggle() {
    const sidebarToggle = document.getElementById('sidebar-toggle');
    const sidebarClose = document.getElementById('sidebar-close');
    const sidebar = document.getElementById('sidebar');
    
    if (sidebarToggle && sidebar) {
        sidebarToggle.addEventListener('click', function() {
            sidebar.classList.toggle('-translate-x-full');
        });
    }
    
    if (sidebarClose && sidebar) {
        sidebarClose.addEventListener('click', function() {
            sidebar.classList.add('-translate-x-full');
        });
    }
}

function logout() {
    // Limpar o localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Redirecionar para a página de login na raiz
    window.location.href = getBasePath() + 'login.html';
} 


