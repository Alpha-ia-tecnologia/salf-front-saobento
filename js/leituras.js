/**
 * SALF - Sistema de Avaliação de Leitura e Fluência
 *
 * ARQUIVO: leituras.js
 * FUNÇÃO: Sistema de etapas de leitura e cronometragem
 *
 * Este arquivo gerencia as etapas sequenciais de leitura:
 * - Etapas: Palavras → Pseudopalavras → Frases → Texto → Interpretação
 * - Sistema de timers cronometrados para cada etapa
 * - Contadores automáticos de itens lidos
 * - Grids interativos para marcação de progresso
 * - Cálculo de PPM (Palavras Por Minuto) e níveis de leitura
 *
 * RELACIONAMENTOS:
 * - Integra com realizar-avaliacao.js para dados da avaliação
 * - Gerencia estado de leitura e progresso
 * - Conecta com sistema de timers para controle de tempo
 * - Persiste resultados parciais durante a avaliação
 */

const token = localStorage.getItem("authToken");
const headers = {
  "Content-Type": "application/json",
  Authorization: token ? `Bearer ${token}` : "",
};

const API_BASE_URL = "https://salf-salf-api2.gkgtsp.easypanel.host/api";

const etapasDOM = {
  palavras: document.getElementById("etapa-palavras"),
  pseudopalavras: document.getElementById("etapa-pseudopalavras"),
  frases: document.getElementById("etapa-frases"),
  texto: document.getElementById("etapa-texto"),
  resultado: document.getElementById("etapa-resultado"),

  gridPalavras: document.querySelector("#etapa-palavras .grid"),
  gridPseudopalavras: document.querySelector("#etapa-pseudopalavras .grid"),
  containerFrases: document.getElementById("frases-container"),
  containerTexto: document.getElementById("texto-container"),

  timerPalavras: document.getElementById("timer-palavras"),
  timerPseudopalavras: document.getElementById("timer-pseudopalavras"),
  timerFrases: document.getElementById("timer-frases"),
  timerTexto: document.getElementById("timer-texto"),

  btnTimerPalavras: document.getElementById("iniciar-timer-palavras"),
  btnTimerPseudopalavras: document.getElementById(
    "iniciar-timer-pseudopalavras"
  ),
  btnTimerFrases: document.getElementById("iniciar-timer-frases"),
  btnTimerTexto: document.getElementById("iniciar-timer-texto"),

  btnProximoPalavras: document.getElementById("proximo-etapa-palavras"),
  btnProximoPseudopalavras: document.getElementById(
    "proximo-etapa-pseudopalavras"
  ),
  btnProximoFrases: document.getElementById("proximo-etapa-frases"),
  btnProximoTexto: document.getElementById("proximo-etapa-texto"),

  totalPalavrasLidas: document.getElementById("total-palavras-lidas"),
  totalPalavras: document.getElementById("total-palavras"),
  totalPseudopalavrasLidas: document.getElementById(
    "total-pseudopalavras-lidas"
  ),
  totalPseudopalavras: document.getElementById("total-pseudopalavras"),
  totalFrasesLidas: document.getElementById("total-frases-lidas"),
  totalFrases: document.getElementById("total-frases"),
  totalLinhasLidas: document.getElementById("total-linhas-lidas"),
  totalLinhas: document.getElementById("total-linhas"),
};

const estadoLeitura = {
  palavrasLidas: 0,
  pseudopalavrasLidas: 0,
  frasesLidas: 0,
  linhasLidas: 0,
  tempoRestante: {
    WORDS: 3,
    PSEUDOWORDS: 3,
    SENTENCES: 3,
    TEXT: 3,
    INTERPRETATION: 3,
    palavras: 3,
    pseudopalavras: 3,
    frases: 3,
    texto: 3,
  },
  timers: {
    WORDS: null,
    PSEUDOWORDS: null,
    SENTENCES: null,
    TEXT: null,
    INTERPRETATION: null,
    palavras: null,
    pseudopalavras: null,
    frases: null,
    texto: null,
  },
  avaliacao: null,
  aluno: null,
};

const dadosTeste = {
  palavras: [
    "casa",
    "bola",
    "gato",
    "mesa",
    "livro",
    "pato",
    "fogo",
    "roda",
    "vela",
    "mala",
    "lobo",
    "rato",
    "sapo",
    "faca",
    "pipa",
    "dedo",
    "moto",
    "suco",
    "bota",
    "lua",
  ],
  pseudopalavras: [
    "bato",
    "cela",
    "dima",
    "feno",
    "gula",
    "hita",
    "jupa",
    "kola",
    "lima",
    "nupa",
    "peta",
    "quia",
    "rupa",
    "sita",
    "tupa",
    "vila",
    "wata",
    "xupa",
    "yita",
    "zupa",
  ],
  frases: [
    "O gato dorme no sofá.",
    "A bola rola no chão.",
    "O livro está na mesa.",
    "A criança brinca na rua.",
    "O sol brilha no céu.",
  ],
  texto: `A menina pequena caminhava pela rua quando viu um gato preto.
    O gato olhou para ela com olhos verdes e brilhantes.
    Ela se aproximou devagar e estendeu a mão.
    O gato veio até ela e começou a ronronar.
    Desde aquele dia, eles se tornaram grandes amigos.`,
};

async function carregarAvaliacao(evento, aluno) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/assessments/${evento.assessmentId}`,
      {
        headers: headers,
      }
    );

    if (!response.ok) {
      throw new Error(`Erro ao carregar avaliação: ${response.status}`);
    }

    const avaliacao = await response.json();
    console.log("Avaliação carregada:", avaliacao);

    estadoLeitura.aluno = aluno;
    estadoLeitura.avaliacao = {
      evento: evento,
      detalhes: avaliacao,
    };

    prepararEtapasPalavras();
  } catch (error) {
    console.error("Erro ao carregar detalhes da avaliação:", error);

    estadoLeitura.avaliacao = {
      detalhes: dadosTeste,
    };

    prepararEtapasPalavras();
  }
}

function prepararEtapasPalavras() {
  etapasDOM.gridPalavras.innerHTML = "";

  const palavras =
    estadoLeitura.avaliacao?.detalhes?.palavras || dadosTeste.palavras;

  palavras.forEach((palavra, index) => {
    const divPalavra = document.createElement("div");
    divPalavra.className =
      "border rounded p-2 flex items-center palavra-item bg-yellow-100 cursor-not-allowed transition-colors";
    divPalavra.setAttribute("data-id", index);
    divPalavra.innerHTML = `<span class="text-sm text-gray-800 select-none w-full text-center">${palavra}</span>`;

    divPalavra.addEventListener("click", function (e) {
      if (!estadoLeitura.timers.palavras) {
        return;
      }

      if (!this.classList.contains("bg-green-200")) {
        this.classList.remove("bg-yellow-100", "cursor-not-allowed");
        this.classList.add("bg-green-200");
        atualizarContadorPalavras();
      }
    });

    etapasDOM.gridPalavras.appendChild(divPalavra);
  });

  etapasDOM.totalPalavras.textContent = palavras.length;
  etapasDOM.totalPalavrasLidas.textContent = "0";
}

function prepararEtapaPseudopalavras() {
  etapasDOM.gridPseudopalavras.innerHTML = "";

  const pseudopalavras =
    estadoLeitura.avaliacao?.detalhes?.pseudopalavras ||
    dadosTeste.pseudopalavras;

  pseudopalavras.forEach((palavra, index) => {
    const divPalavra = document.createElement("div");
    divPalavra.className =
      "border rounded p-2 flex items-center pseudopalavra-item bg-yellow-100 cursor-not-allowed transition-colors";
    divPalavra.setAttribute("data-id", index);
    divPalavra.innerHTML = `<span class="text-sm text-gray-800 select-none w-full text-center">${palavra}</span>`;

    divPalavra.addEventListener("click", function (e) {
      if (!estadoLeitura.timers.pseudopalavras) {
        return;
      }

      if (!this.classList.contains("bg-green-200")) {
        this.classList.remove("bg-yellow-100", "cursor-not-allowed");
        this.classList.add("bg-green-200");
        atualizarContadorPseudopalavras();
      }
    });

    etapasDOM.gridPseudopalavras.appendChild(divPalavra);
  });

  etapasDOM.totalPseudopalavras.textContent = pseudopalavras.length;
  etapasDOM.totalPseudopalavrasLidas.textContent = "0";
}

function prepararEtapaFrases() {
  etapasDOM.containerFrases.innerHTML = "";

  const frases = estadoLeitura.avaliacao?.detalhes?.frases || dadosTeste.frases;

  frases.forEach((frase, index) => {
    const divFrase = document.createElement("div");
    divFrase.className =
      "border rounded p-3 mb-3 frase-item bg-yellow-100 cursor-not-allowed transition-colors";
    divFrase.setAttribute("data-id", index);
    divFrase.innerHTML = `<p class="text-sm text-gray-800 select-none text-center">${frase}</p>`;

    divFrase.addEventListener("click", function (e) {
      if (!estadoLeitura.timers.frases) {
        return;
      }

      if (!this.classList.contains("bg-green-200")) {
        this.classList.remove("bg-yellow-100", "cursor-not-allowed");
        this.classList.add("bg-green-200");
        atualizarContadorFrases();
      }
    });

    etapasDOM.containerFrases.appendChild(divFrase);
  });

  etapasDOM.totalFrases.textContent = frases.length;
  etapasDOM.totalFrasesLidas.textContent = "0";
}

function prepararEtapaTexto() {
  etapasDOM.containerTexto.innerHTML = "";

  const texto = estadoLeitura.avaliacao?.detalhes?.texto || dadosTeste.texto;
  const linhas = texto.split("\n").filter((linha) => linha.trim() !== "");

  linhas.forEach((linha, index) => {
    const divLinha = document.createElement("div");
    divLinha.className =
      "border rounded p-2 mb-2 linha-item bg-yellow-100 cursor-not-allowed transition-colors";
    divLinha.setAttribute("data-id", index);
    divLinha.innerHTML = `<p class="text-sm text-gray-800 select-none">${linha}</p>`;

    divLinha.addEventListener("click", function (e) {
      if (!estadoLeitura.timers.texto) {
        return;
      }

      if (!this.classList.contains("bg-green-200")) {
        this.classList.remove("bg-yellow-100", "cursor-not-allowed");
        this.classList.add("bg-green-200");
        atualizarContadorLinhas();
      }
    });

    etapasDOM.containerTexto.appendChild(divLinha);
  });

  etapasDOM.totalLinhas.textContent = linhas.length;
  etapasDOM.totalLinhasLidas.textContent = "0";
}

function atualizarContadorPalavras() {
  estadoLeitura.palavrasLidas++;
  etapasDOM.totalPalavrasLidas.textContent = estadoLeitura.palavrasLidas;
}

function atualizarContadorPseudopalavras() {
  estadoLeitura.pseudopalavrasLidas++;
  etapasDOM.totalPseudopalavrasLidas.textContent =
    estadoLeitura.pseudopalavrasLidas;
}

function atualizarContadorFrases() {
  estadoLeitura.frasesLidas++;
  etapasDOM.totalFrasesLidas.textContent = estadoLeitura.frasesLidas;
}

function atualizarContadorLinhas() {
  estadoLeitura.linhasLidas++;
  etapasDOM.totalLinhasLidas.textContent = estadoLeitura.linhasLidas;
}

function iniciarTimer(etapa) {
  if (estadoLeitura.timers[etapa]) {
    clearInterval(estadoLeitura.timers[etapa]);
  }

  let tempoRestante = estadoLeitura.tempoRestante[etapa];
  const timerElement =
    etapasDOM[`timer${etapa.charAt(0).toUpperCase() + etapa.slice(1)}`];
  const btnProximo =
    etapasDOM[`btnProximo${etapa.charAt(0).toUpperCase() + etapa.slice(1)}`];

  if (timerElement) {
    timerElement.textContent = `${tempoRestante}s`;
  }

  if (btnProximo) {
    btnProximo.disabled = true;
    btnProximo.classList.add("opacity-50", "cursor-not-allowed");
  }

  estadoLeitura.timers[etapa] = setInterval(() => {
    tempoRestante--;

    if (timerElement) {
      timerElement.textContent = `${tempoRestante}s`;
    }

    if (tempoRestante <= 0) {
      clearInterval(estadoLeitura.timers[etapa]);
      estadoLeitura.timers[etapa] = null;

      if (btnProximo) {
        btnProximo.disabled = false;
        btnProximo.classList.remove("opacity-50", "cursor-not-allowed");
      }

      const itens =
        etapasDOM[`grid${etapa.charAt(0).toUpperCase() + etapa.slice(1)}`] ||
        etapasDOM[`container${etapa.charAt(0).toUpperCase() + etapa.slice(1)}`];

      if (itens) {
        const itensNaoLidos = itens.querySelectorAll(
          `.${etapa}-item:not(.bg-green-200)`
        );
        itensNaoLidos.forEach((item) => {
          item.classList.add("opacity-50", "cursor-not-allowed");
        });
      }
    }
  }, 1000);
}

function configurarEtapaPalavras() {
  const etapaPalavras = document.getElementById("etapa-palavras");
  if (!etapaPalavras) return;

  const iniciarTimerBtn = document.getElementById("iniciar-timer-palavras");
  const proximoEtapaBtn = document.getElementById("proximo-etapa-palavras");
  const timerElement = document.getElementById("timer-palavras");
  const totalLidasElement = document.getElementById("total-palavras-lidas");

  let temporizador;
  let segundosRestantes = 60;
  let palavrasLidas = 0;

  proximoEtapaBtn.disabled = true;
  proximoEtapaBtn.classList.add("opacity-50", "cursor-not-allowed");

  iniciarTimerBtn.addEventListener("click", function () {
    iniciarTimerBtn.disabled = true;
    iniciarTimerBtn.classList.add("opacity-50", "cursor-not-allowed");

    const itens = etapaPalavras.querySelectorAll(".palavra-item");
    itens.forEach((item) => {
      item.classList.remove("bg-yellow-100", "cursor-not-allowed");
      item.classList.add("bg-white", "hover:bg-blue-100", "cursor-pointer");

      item.addEventListener("click", function () {
        if (
          !item.classList.contains("bg-green-200") &&
          !item.classList.contains("disabled")
        ) {
          item.classList.add("bg-green-200");
          item.classList.remove("bg-white", "hover:bg-blue-100");
          palavrasLidas++;
          totalLidasElement.textContent = palavrasLidas;
        }
      });
    });

    temporizador = setInterval(function () {
      segundosRestantes--;

      const minutos = Math.floor(segundosRestantes / 60);
      const segundos = segundosRestantes % 60;
      timerElement.textContent = `${minutos
        .toString()
        .padStart(2, "0")}:${segundos.toString().padStart(2, "0")}`;

      if (segundosRestantes <= 0) {
        clearInterval(temporizador);

        itens.forEach((item) => {
          if (!item.classList.contains("bg-green-200")) {
            item.classList.add("disabled", "opacity-50");
            item.classList.remove("hover:bg-blue-100", "cursor-pointer");
          }
        });

        proximoEtapaBtn.disabled = false;
        proximoEtapaBtn.classList.remove("opacity-50", "cursor-not-allowed");

        const avaliacaoAtualStr = localStorage.getItem("avaliacaoAtual");
        if (avaliacaoAtualStr) {
          atualizarAvaliacao({
            stage: "WORDS",
            itemsRead: palavrasLidas,
            totalItems: itens.length,
          });
        }
      }
    }, 1000);
  });

  proximoEtapaBtn.addEventListener("click", function () {
    if (temporizador) {
      clearInterval(temporizador);
    }

    etapaPalavras.classList.add("hidden");
    document.getElementById("etapa-pseudopalavras").classList.remove("hidden");
  });
}

function configurarEtapaPseudopalavras() {
  const etapaPseudopalavras = document.getElementById("etapa-pseudopalavras");
  if (!etapaPseudopalavras) return;

  const iniciarTimerBtn = document.getElementById(
    "iniciar-timer-pseudopalavras"
  );
  const proximoEtapaBtn = document.getElementById(
    "proximo-etapa-pseudopalavras"
  );
  const timerElement = document.getElementById("timer-pseudopalavras");
  const totalLidasElement = document.getElementById(
    "total-pseudopalavras-lidas"
  );

  let temporizador;
  let segundosRestantes = 60;
  let pseudopalavrasLidas = 0;

  proximoEtapaBtn.disabled = true;
  proximoEtapaBtn.classList.add("opacity-50", "cursor-not-allowed");

  iniciarTimerBtn.addEventListener("click", function () {
    iniciarTimerBtn.disabled = true;
    iniciarTimerBtn.classList.add("opacity-50", "cursor-not-allowed");

    const itens = etapaPseudopalavras.querySelectorAll(".pseudopalavra-item");
    itens.forEach((item) => {
      item.classList.remove("bg-yellow-100", "cursor-not-allowed");
      item.classList.add("bg-white", "hover:bg-blue-100", "cursor-pointer");

      item.addEventListener("click", function () {
        if (
          !item.classList.contains("bg-green-200") &&
          !item.classList.contains("disabled")
        ) {
          item.classList.add("bg-green-200");
          item.classList.remove("bg-white", "hover:bg-blue-100");
          pseudopalavrasLidas++;
          totalLidasElement.textContent = pseudopalavrasLidas;
        }
      });
    });

    temporizador = setInterval(function () {
      segundosRestantes--;

      const minutos = Math.floor(segundosRestantes / 60);
      const segundos = segundosRestantes % 60;
      timerElement.textContent = `${minutos
        .toString()
        .padStart(2, "0")}:${segundos.toString().padStart(2, "0")}`;

      if (segundosRestantes <= 0) {
        clearInterval(temporizador);

        itens.forEach((item) => {
          if (!item.classList.contains("bg-green-200")) {
            item.classList.add("disabled", "opacity-50");
            item.classList.remove("hover:bg-blue-100", "cursor-pointer");
          }
        });

        proximoEtapaBtn.disabled = false;
        proximoEtapaBtn.classList.remove("opacity-50", "cursor-not-allowed");

        const avaliacaoAtualStr = localStorage.getItem("avaliacaoAtual");
        if (avaliacaoAtualStr) {
          atualizarAvaliacao({
            stage: "PSEUDOWORDS",
            itemsRead: pseudopalavrasLidas,
            totalItems: itens.length,
          });
        }
      }
    }, 1000);
  });

  proximoEtapaBtn.addEventListener("click", function () {
    if (temporizador) {
      clearInterval(temporizador);
    }

    etapaPseudopalavras.classList.add("hidden");
    document.getElementById("etapa-frases").classList.remove("hidden");
  });
}

function configurarEtapaFrases() {
  const etapaFrases = document.getElementById("etapa-frases");
  if (!etapaFrases) return;

  const iniciarTimerBtn = document.getElementById("iniciar-timer-frases");
  const proximoEtapaBtn = document.getElementById("proximo-etapa-frases");
  const timerElement = document.getElementById("timer-frases");
  const totalLidasElement = document.getElementById("total-frases-lidas");

  let temporizador;
  let segundosRestantes = 60;
  let frasesLidas = 0;

  proximoEtapaBtn.disabled = true;
  proximoEtapaBtn.classList.add("opacity-50", "cursor-not-allowed");

  iniciarTimerBtn.addEventListener("click", function () {
    iniciarTimerBtn.disabled = true;
    iniciarTimerBtn.classList.add("opacity-50", "cursor-not-allowed");

    const itens = etapaFrases.querySelectorAll(".frase-item");
    itens.forEach((item) => {
      item.classList.remove("bg-yellow-100", "cursor-not-allowed");
      item.classList.add("bg-white", "hover:bg-blue-100", "cursor-pointer");

      item.addEventListener("click", function () {
        if (
          !item.classList.contains("bg-green-200") &&
          !item.classList.contains("disabled")
        ) {
          item.classList.add("bg-green-200");
          item.classList.remove("bg-white", "hover:bg-blue-100");
          frasesLidas++;
          totalLidasElement.textContent = frasesLidas;
        }
      });
    });

    temporizador = setInterval(function () {
      segundosRestantes--;

      const minutos = Math.floor(segundosRestantes / 60);
      const segundos = segundosRestantes % 60;
      timerElement.textContent = `${minutos
        .toString()
        .padStart(2, "0")}:${segundos.toString().padStart(2, "0")}`;

      if (segundosRestantes <= 0) {
        clearInterval(temporizador);

        itens.forEach((item) => {
          if (!item.classList.contains("bg-green-200")) {
            item.classList.add("disabled", "opacity-50");
            item.classList.remove("hover:bg-blue-100", "cursor-pointer");
          }
        });

        proximoEtapaBtn.disabled = false;
        proximoEtapaBtn.classList.remove("opacity-50", "cursor-not-allowed");

        const avaliacaoAtualStr = localStorage.getItem("avaliacaoAtual");
        if (avaliacaoAtualStr) {
          atualizarAvaliacao({
            stage: "SENTENCES",
            itemsRead: frasesLidas,
            totalItems: itens.length,
          });
        }
      }
    }, 1000);
  });

  proximoEtapaBtn.addEventListener("click", function () {
    if (temporizador) {
      clearInterval(temporizador);
    }

    etapaFrases.classList.add("hidden");
    document.getElementById("etapa-texto").classList.remove("hidden");
  });
}

function configurarEtapaTexto() {
  const etapaTexto = document.getElementById("etapa-texto");
  if (!etapaTexto) return;

  const iniciarTimerBtn = document.getElementById("iniciar-timer-texto");
  const proximoEtapaBtn = document.getElementById("proximo-etapa-texto");
  const timerElement = document.getElementById("timer-texto");
  const totalLidasElement = document.getElementById("total-linhas-lidas");

  let temporizador;
  let segundosRestantes = 60;
  let linhasLidas = 0;

  proximoEtapaBtn.disabled = true;
  proximoEtapaBtn.classList.add("opacity-50", "cursor-not-allowed");

  iniciarTimerBtn.addEventListener("click", function () {
    iniciarTimerBtn.disabled = true;
    iniciarTimerBtn.classList.add("opacity-50", "cursor-not-allowed");

    const itens = etapaTexto.querySelectorAll(".linha-item");
    itens.forEach((item) => {
      item.classList.remove("bg-yellow-100", "cursor-not-allowed");
      item.classList.add("bg-white", "hover:bg-blue-100", "cursor-pointer");

      item.addEventListener("click", function () {
        if (
          !item.classList.contains("bg-green-200") &&
          !item.classList.contains("disabled")
        ) {
          item.classList.add("bg-green-200");
          item.classList.remove("bg-white", "hover:bg-blue-100");
          linhasLidas++;
          totalLidasElement.textContent = linhasLidas;
        }
      });
    });

    temporizador = setInterval(function () {
      segundosRestantes--;

      const minutos = Math.floor(segundosRestantes / 60);
      const segundos = segundosRestantes % 60;
      timerElement.textContent = `${minutos
        .toString()
        .padStart(2, "0")}:${segundos.toString().padStart(2, "0")}`;

      if (segundosRestantes <= 0) {
        clearInterval(temporizador);

        itens.forEach((item) => {
          if (!item.classList.contains("bg-green-200")) {
            item.classList.add("disabled", "opacity-50");
            item.classList.remove("hover:bg-blue-100", "cursor-pointer");
          }
        });

        proximoEtapaBtn.disabled = false;
        proximoEtapaBtn.classList.remove("opacity-50", "cursor-not-allowed");

        let ppm = 0;
        const avaliacaoAtualStr = localStorage.getItem("avaliacaoAtual");
        if (avaliacaoAtualStr) {
          ppm = linhasLidas * 12;

          let nivelLeitura = "NON_READER";
          if (ppm >= 50) nivelLeitura = "TEXT_READER_WITH_FLUENCY";
          else if (ppm >= 40) nivelLeitura = "TEXT_READER_WITHOUT_FLUENCY";
          else if (ppm >= 30) nivelLeitura = "SENTENCE_READER";
          else if (ppm >= 20) nivelLeitura = "WORD_READER";
          else if (ppm >= 10) nivelLeitura = "SYLLABLE_READER";

          atualizarAvaliacao({
            stage: "TEXT",
            itemsRead: linhasLidas,
            totalItems: itens.length,
            readingLevel: nivelLeitura,
            ppm: ppm,
            completed: true,
          });
        }
      }
    }, 1000);
  });

  proximoEtapaBtn.addEventListener("click", function () {
    if (temporizador) {
      clearInterval(temporizador);
    }

    etapaTexto.classList.add("hidden");
    document.getElementById("etapa-resultado").classList.remove("hidden");

    const avaliacaoAtualStr = localStorage.getItem("avaliacaoAtual");
    if (avaliacaoAtualStr) {
      prepararEtapaResultado(JSON.parse(avaliacaoAtualStr));
    }
  });
}

function configurarBotoesNavegacao() {
  const btnNovaAvaliacao = document.getElementById("btn-nova-avaliacao");
  const btnVoltarDashboard = document.getElementById("btn-voltar-dashboard");

  if (btnNovaAvaliacao) {
    btnNovaAvaliacao.addEventListener("click", function () {
      localStorage.removeItem("avaliacaoAtual");

      document.getElementById("etapa-resultado").classList.add("hidden");
      document.getElementById("selecao-avaliacao").classList.remove("hidden");

      window.location.reload();
    });
  }

  if (btnVoltarDashboard) {
    btnVoltarDashboard.addEventListener("click", function () {
      localStorage.removeItem("avaliacaoAtual");

      window.location.href = "../../pages/dashboard/index.html";
    });
  }
}
