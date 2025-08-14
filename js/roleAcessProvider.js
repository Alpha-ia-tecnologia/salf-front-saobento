/**
 * SALF - Sistema de Avaliação de Leitura e Fluência
 *
 * ARQUIVO: roleAcessProvider.js
 * FUNÇÃO: Sistema de controle de acesso baseado em roles
 *
 * Este arquivo define e gerencia as permissões do sistema:
 * - Mapeamento de roles para funcionalidades
 * - Verificação de acesso às páginas
 * - Redirecionamento baseado em permissões
 * - Controle de navegação por tipo de usuário
 *
 * RELACIONAMENTOS:
 * - Executado automaticamente em todas as páginas
 * - Integra com template.js para construção do menu
 * - Controla acesso às funcionalidades do sistema
 * - Redireciona usuários não autorizados para 401.html
 */

const roles = {
  ADMIN: [
    "dashboard",
    "usuario",
    "aluno",
    "avaliacao",
    "resultado",
    "relatorio",
  ],
  COORDINATOR: [
    "dashboard",
    "usuario",
    "aluno",
    "escola",
    "regiao-grupo",
    "turma",
  ],
  APPLICATOR: ["avaliacao", "resultado"],
  MANAGER: ["dashboard"],
};

const verifyRole = (role) => {
  if (roles[role].includes(window.location.pathname.split("/").pop())) {
    return roles[role][0];
  }
  return (window.location.href = window.origin + "/401.html");
};

const redirectRole = (role) => {
  if (roles[role]) {
    window.location.href =
      window.origin + `/pages/${verifyRole(role)}/listar.html`;
  }
};

document.addEventListener("DOMContentLoaded", () => {
  const user = JSON.parse(localStorage.getItem("user"));
  redirectRole(user.role);
});
