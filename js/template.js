/**
 * SALF - Sistema de Avaliação de Leitura e Fluência
 *
 * ARQUIVO: template.js
 * FUNÇÃO: Sistema de template e navegação do sistema
 *
 * Este arquivo gerencia a interface principal do sistema:
 * - Construção dinâmica do sidebar e header
 * - Sistema de navegação baseado em roles
 * - Gerenciamento de logout e autenticação
 * - Responsividade mobile com toggle de sidebar
 *
 * RELACIONAMENTOS:
 * - Importado por todas as páginas principais do sistema
 * - Integra com roleAcessProvider.js para permissões
 * - Fornece estrutura de navegação consistente
 * - Gerencia estado de autenticação global
 */

document.addEventListener("DOMContentLoaded", function () {
  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = this.location.origin + "/login.html";
    return;
  }

  loadTemplate();

  document.addEventListener("click", function (e) {
    if (
      e.target &&
      (e.target.id === "logout-btn" || e.target.closest("#logout-btn"))
    ) {
      logout();
    }
  });
});

function getBasePath() {
  return window.location.protocol + "//" + window.location.host + "/";
}

function loadTemplate() {
  let userData = {};
  try {
    const userString = localStorage.getItem("user");
    if (userString) {
      userData = JSON.parse(userString);
    }
  } catch (e) {
    console.error("Erro ao carregar dados do usuário:", e);
  }

  const userRole = userData.role || "ADMIN";
  const userEmail = userData.email || "usuário";
  const userName = userData.name || "Usuário";

  console.log("Informações do usuário:", {
    role: userRole,
    name: userName,
    email: userEmail,
  });

  const roleDisplay = {
    ADMIN: "Administrador",
    COORDINATOR: "Coordenador",
    APPLICATOR: "Aplicador",
    MANAGER: "Gestor",
  };

  const displayRole = roleDisplay[userRole] || userRole;

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

  const currentPage = window.location.pathname;
  const basePath = getBasePath();

  console.log("Base path:", basePath);
  console.log("Current page:", currentPage);

  let menuItems = "";

  menuItems += `
        <a href="${basePath}pages/dashboard/index.html" class="flex items-center px-4 py-3 hover:bg-blue-700 transition ${
    currentPage.includes("/dashboard/") ? "bg-blue-700" : ""
  }">
            <i class="fas fa-chart-bar w-6"></i>
            <span>Dashboard</span>
        </a>
    `;

  const rolesPanel = {
    ADMIN: [
      "Escolas",
      "Turmas",
      "Alunos",
      "Avaliações",
      "Realizar",
      "Usuários",
      "Ranking de Alunos",
      "Ranking de Escolas",
    ],
    COORDINATOR: [
      "Escolas",
      "Turmas",
      "Alunos",
      "Avaliações",
      "Ranking de Alunos",
      "Ranking de Escolas",
    ],
    APPLICATOR: ["Realizar"],
    MANAGER: ["Dashboard"],
  };
  const redirectUrls = {
    ADMIN: {
      Escolas: "escola",
      Turmas: "turma",
      Alunos: "aluno",
      Realizar: "realizacao",
      Avaliações: "avaliacao",
      Usuários: "usuario",
      "Ranking de Alunos": "rankings-a",
      "Ranking de Escolas": "rankings-e",
    },
    COORDINATOR: {
      Escolas: "escola",
      Turmas: "turma",
      Alunos: "aluno",
      Avaliações: "avaliacao",
      "Ranking de Alunos": "rankings-a",
      "Ranking de Escolas": "rankings-e",
    },
    APPLICATOR: {
      Realizar: "realizacao",
    },
  };
  const icons = {
    Escolas: "fas fa-school",
    Turmas: "fas fa-users",
    Alunos: "fas fa-user-graduate",
    Avaliações: "fas fa-clipboard-check",
    Usuários: "fas fa-user",
    Realizar: "fas fa-clipboard-check",
    "Ranking de Alunos": "fas fa-user-graduate",
    "Ranking de Escolas": "fas fa-school",
  };
  rolesPanel[userRole].forEach((item) => {
    const redirectUrl = redirectUrls[userRole][item];
    menuItems += `
            <a href="${location.origin}/pages/${redirectUrl.toLowerCase()}/${
      redirectUrl === "realizacao" ? "realizar" : "listar"
    }.html" class="flex items-center px-4 py-3 hover:bg-blue-700 transition ${
      currentPage.includes("/${redirectUrl.toLowerCase()}/")
        ? "bg-blue-700"
        : ""
    }">
                <i class="${icons[item]} w-6"></i>
                <span>${
                  item === "Realizar" ? "Realizar Avaliação" : item
                }</span>
            </a>
        `;
  });

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

  const headerContainer = document.getElementById("header-container");
  if (headerContainer) {
    headerContainer.innerHTML = header;
  } else {
    console.warn("Elemento #header-container não encontrado");
  }

  const sidebarContainer = document.getElementById("sidebar-container");
  if (sidebarContainer) {
    sidebarContainer.innerHTML = sidebar;
  } else {
    console.warn("Elemento #sidebar-container não encontrado");
  }

  setupSidebarToggle();
}

function setupSidebarToggle() {
  const sidebarToggle = document.getElementById("sidebar-toggle");
  const sidebarClose = document.getElementById("sidebar-close");
  const sidebar = document.getElementById("sidebar");

  if (sidebarToggle && sidebar) {
    sidebarToggle.addEventListener("click", function () {
      sidebar.classList.toggle("-translate-x-full");
    });
  }

  if (sidebarClose && sidebar) {
    sidebarClose.addEventListener("click", function () {
      sidebar.classList.add("-translate-x-full");
    });
  }
}

function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");

  window.location.href = getBasePath() + "login.html";
}
