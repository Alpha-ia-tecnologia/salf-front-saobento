/**
 * SALF - Sistema de Avaliação de Leitura e Fluência
 *
 * ARQUIVO: configuracoes/regioes-grupos.js
 * FUNÇÃO: Sistema de gestão de regiões e grupos
 *
 * Este arquivo gerencia a configuração geográfica do sistema:
 * - CRUD completo de regiões
 * - CRUD completo de grupos
 * - Associação de grupos a regiões
 * - Interface de abas para organização
 * - Validação de formulários
 *
 * RELACIONAMENTOS:
 * - Integra com RegionsGroupsAPI para operações CRUD
 * - Fornece dados para filtros hierárquicos do sistema
 * - Conecta com sistema de escolas e turmas
 * - Base para organização geográfica das avaliações
 */

document.addEventListener("DOMContentLoaded", function () {
  const tabRegioes = document.getElementById("tab-regioes");
  const tabGrupos = document.getElementById("tab-grupos");
  const secaoRegioes = document.getElementById("secao-regioes");
  const secaoGrupos = document.getElementById("secao-grupos");

  const formRegiao = document.getElementById("form-regiao");
  const nomeRegiao = document.getElementById("nome-regiao");
  const descricaoRegiao = document.getElementById("descricao-regiao");

  const formGrupo = document.getElementById("form-grupo");
  const nomeGrupo = document.getElementById("nome-grupo");
  const descricaoGrupo = document.getElementById("descricao-grupo");
  const regiaoGrupo = document.getElementById("regiao-grupo");

  const tabelaRegioes = document.getElementById("tabela-regioes");
  const tabelaGrupos = document.getElementById("tabela-grupos");

  init();

  function init() {
    configurarAbas();

    carregarRegioes();
    carregarGrupos();

    configurarFormularios();
  }

  function configurarAbas() {
    tabRegioes.addEventListener("click", function () {
      tabRegioes.classList.add("border-blue-500", "text-blue-600");
      tabRegioes.classList.remove("border-transparent", "text-gray-500");

      tabGrupos.classList.add("border-transparent", "text-gray-500");
      tabGrupos.classList.remove("border-blue-500", "text-blue-600");

      secaoRegioes.classList.remove("hidden");
      secaoGrupos.classList.add("hidden");
    });

    tabGrupos.addEventListener("click", function () {
      tabGrupos.classList.add("border-blue-500", "text-blue-600");
      tabGrupos.classList.remove("border-transparent", "text-gray-500");

      tabRegioes.classList.add("border-transparent", "text-gray-500");
      tabRegioes.classList.remove("border-blue-500", "text-blue-600");

      secaoGrupos.classList.remove("hidden");
      secaoRegioes.classList.add("hidden");

      carregarRegioesParaSelect();
    });
  }

  function configurarFormularios() {
    formRegiao.addEventListener("submit", async function (e) {
      e.preventDefault();

      if (!nomeRegiao.value.trim()) {
        alert("Por favor, informe o nome da região");
        return;
      }

      try {
        const dados = {
          name: nomeRegiao.value.trim(),
          description: descricaoRegiao.value.trim(),
        };

        if (window.RegionsGroupsAPI && window.RegionsGroupsAPI.createRegion) {
          await window.RegionsGroupsAPI.createRegion(dados);
        } else {
          const response = await fetch(
            `${window.API_BASE_URL_NO_API}/regions`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
              body: JSON.stringify(dados),
            }
          );

          if (!response.ok) {
            throw new Error("Falha ao criar região");
          }
        }

        alert("Região criada com sucesso!");
        formRegiao.reset();
        carregarRegioes();
      } catch (error) {
        console.error("Erro ao criar região:", error);
        alert("Erro ao criar região. Por favor, tente novamente.");
      }
    });

    formGrupo.addEventListener("submit", async function (e) {
      e.preventDefault();

      if (!nomeGrupo.value.trim()) {
        alert("Por favor, informe o nome do grupo");
        return;
      }

      if (!regiaoGrupo.value) {
        alert("Por favor, selecione uma região");
        return;
      }

      try {
        const dados = {
          name: nomeGrupo.value.trim(),
          description: descricaoGrupo.value.trim(),
          regionId: parseInt(regiaoGrupo.value),
        };

        if (window.RegionsGroupsAPI && window.RegionsGroupsAPI.createGroup) {
          await window.RegionsGroupsAPI.createGroup(dados);
        } else {
          const response = await fetch(`${window.API_BASE_URL_NO_API}/groups`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            body: JSON.stringify(dados),
          });

          if (!response.ok) {
            throw new Error("Falha ao criar grupo");
          }
        }

        alert("Grupo criado com sucesso!");
        formGrupo.reset();
        carregarGrupos();
      } catch (error) {
        console.error("Erro ao criar grupo:", error);
        alert("Erro ao criar grupo. Por favor, tente novamente.");
      }
    });
  }

  async function carregarRegioes() {
    try {
      let regioes = [];

      if (window.RegionsGroupsAPI && window.RegionsGroupsAPI.getAllRegions) {
        regioes = await window.RegionsGroupsAPI.getAllRegions();
      } else {
        const response = await fetch(`${window.API_BASE_URL_NO_API}/regions`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (!response.ok) {
          throw new Error("Falha ao buscar regiões");
        }

        regioes = await response.json();
      }

      mostrarRegioesNaTabela(regioes.data || regioes);
    } catch (error) {
      console.error("Erro ao carregar regiões:", error);
      alert("Erro ao carregar regiões. Por favor, tente novamente.");
    }
  }

  async function carregarGrupos() {
    try {
      let grupos = [];

      if (window.RegionsGroupsAPI && window.RegionsGroupsAPI.getAllGroups) {
        grupos = await window.RegionsGroupsAPI.getAllGroups();
      } else {
        const response = await fetch(`${window.API_BASE_URL_NO_API}/groups`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (!response.ok) {
          throw new Error("Falha ao buscar grupos");
        }

        grupos = await response.json();
      }

      mostrarGruposNaTabela(grupos.data || grupos);
    } catch (error) {
      console.error("Erro ao carregar grupos:", error);
      alert("Erro ao carregar grupos. Por favor, tente novamente.");
    }
  }

  async function carregarRegioesParaSelect() {
    try {
      let regioes = [];

      if (window.RegionsGroupsAPI && window.RegionsGroupsAPI.getAllRegions) {
        regioes = await window.RegionsGroupsAPI.getAllRegions();
      } else {
        const response = await fetch(`${window.API_BASE_URL_NO_API}/regions`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (!response.ok) {
          throw new Error("Falha ao buscar regiões");
        }

        regioes = await response.json();
      }

      regiaoGrupo.innerHTML = '<option value="">Selecione uma região</option>';
      (regioes.data || regioes).forEach((regiao) => {
        const option = document.createElement("option");
        option.value = regiao.id;
        option.textContent = regiao.name;
        regiaoGrupo.appendChild(option);
      });
    } catch (error) {
      console.error("Erro ao carregar regiões para select:", error);
    }
  }

  function mostrarRegioesNaTabela(regioes) {
    if (!tabelaRegioes) return;

    const tbody = tabelaRegioes.querySelector("tbody");
    if (!tbody) return;

    tbody.innerHTML = "";

    if (regioes.length === 0) {
      tbody.innerHTML = `
                <tr>
                    <td colspan="3" class="px-6 py-4 text-center text-gray-500">
                        Nenhuma região encontrada
                    </td>
                </tr>
            `;
      return;
    }

    regioes.forEach((regiao) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    ${regiao.name}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${regiao.description || "-"}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button class="text-indigo-600 hover:text-indigo-900 btn-editar-regiao" data-id="${
                      regiao.id
                    }">
                        Editar
                    </button>
                </td>
            `;
      tbody.appendChild(tr);
    });

    configurarBotoesRegioes();
  }

  function mostrarGruposNaTabela(grupos) {
    if (!tabelaGrupos) return;

    const tbody = tabelaGrupos.querySelector("tbody");
    if (!tbody) return;

    tbody.innerHTML = "";

    if (grupos.length === 0) {
      tbody.innerHTML = `
                <tr>
                    <td colspan="4" class="px-6 py-4 text-center text-gray-500">
                        Nenhum grupo encontrado
                    </td>
                </tr>
            `;
      return;
    }

    grupos.forEach((grupo) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    ${grupo.name}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${grupo.description || "-"}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${grupo.regionName || "-"}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button class="text-indigo-600 hover:text-indigo-900 btn-editar-grupo" data-id="${
                      grupo.id
                    }">
                        Editar
                    </button>
                </td>
            `;
      tbody.appendChild(tr);
    });

    configurarBotoesGrupos();
  }

  function configurarBotoesRegioes() {
    document.querySelectorAll(".btn-editar-regiao").forEach((btn) => {
      btn.addEventListener("click", function () {
        const regiaoId = this.getAttribute("data-id");
        editarRegiao(regiaoId);
      });
    });
  }

  function configurarBotoesGrupos() {
    document.querySelectorAll(".btn-editar-grupo").forEach((btn) => {
      btn.addEventListener("click", function () {
        const grupoId = this.getAttribute("data-id");
        editarGrupo(grupoId);
      });
    });
  }

  function editarRegiao(regiaoId) {
    console.log("Editar região:", regiaoId);
  }

  function editarGrupo(grupoId) {
    console.log("Editar grupo:", grupoId);
  }
});
