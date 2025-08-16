/**
 * SALF - Sistema de Avaliação de Leitura e Fluência
 *
 * ARQUIVO: login.js
 * FUNÇÃO: Sistema de autenticação e login do usuário
 *
 * Este arquivo gerencia todo o processo de autenticação:
 * - Validação de credenciais (email/senha)
 * - Gerenciamento de tokens JWT
 * - Redirecionamento baseado em autenticação
 * - Validação automática de tokens existentes
 *
 * RELACIONAMENTOS:
 * - Primeira página carregada pelo sistema
 * - Redireciona para dashboard após login bem-sucedido
 * - Armazena token e dados do usuário no localStorage
 * - Integra com sistema de roles para redirecionamento
 */

document.addEventListener("DOMContentLoaded", function () {
  const loginForm = document.getElementById("login-form");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const loginButton = document.getElementById("login-button");
  const loadingSpinner = document.getElementById("loading-spinner");
  const loginError = document.getElementById("login-error");
  const errorMessage = document.getElementById("error-message");
  localStorage.clear();

  const token =
    localStorage.getItem("token")  
  if (token) {
    validarToken(token)
      .then((valido) => {
        if (valido) {
          redirecionarParaDashboard();
        }
      })
      .catch((err) => {
        console.error("Erro ao validar token:", err);
        localStorage.removeItem("token");
      });
  }

  loginForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const email = emailInput.value.trim();
    const password = passwordInput.value;

    if (!email || !password) {
      mostrarErro("Por favor, preencha todos os campos.");
      return;
    }

    loginButton.disabled = true;
    loadingSpinner.classList.remove("hidden");
    loginError.classList.add("hidden");

    realizarLogin(email, password);
  });

  async function realizarLogin(email, password) {
    try {
      const response = await fetch(`${window.API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();

        if (data.token) {
          localStorage.setItem("token", data.token);

          if (data.user) {
            localStorage.setItem("user", JSON.stringify(data.user));
          }

          console.log("Login bem-sucedido, redirecionando para o dashboard...");

          setTimeout(() => {
            redirecionarParaDashboard();
          }, 500);
        } else {
          mostrarErro("Resposta de autenticação inválida.");
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        const mensagem =
          errorData.message ||
          "Credenciais inválidas. Verifique seu email e senha.";
        mostrarErro(mensagem);
      }
    } catch (error) {
      console.error("Erro durante o login:", error);
      mostrarErro("Erro de conexão. Verifique sua internet e tente novamente.");
    } finally {
      loginButton.disabled = false;
      loadingSpinner.classList.add("hidden");
    }
  }

  async function validarToken(token) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/validate`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.ok;
    } catch (error) {
      console.error("Erro ao validar token:", error);
      return false;
    }
  }

  function mostrarErro(mensagem) {
    errorMessage.textContent = mensagem;
    loginError.classList.remove("hidden");
  }

  function redirecionarParaDashboard() {
    const currentPath = window.location.origin;
    const basePath = currentPath.substring(0, currentPath.lastIndexOf("/") + 1);
    const dashboardUrl = `${currentPath}/pages/dashboard/listar.html`;

    console.log("Redirecionando para:", dashboardUrl);

    window.location.href = dashboardUrl;

    setTimeout(() => {

        redirectRole(user.role);
      
    }, 1000);
  }
});
