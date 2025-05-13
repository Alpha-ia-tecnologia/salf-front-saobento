/**
 * Módulo de renderização para avaliação de leitura
 * Este arquivo contém funções modulares para renderizar os componentes da avaliação
 */

// Configuração global
const AVALIACAO_CONFIG = {
  // Tempo padrão para cada etapa em segundos
  tempoPadrao: 2,
  // Classes CSS para itens não selecionados
  classesItemNaoSelecionado: 'bg-yellow-100 cursor-not-allowed transition-colors',
  // Classes CSS para itens selecionados
  classesItemSelecionado: 'bg-green-200',
  // Classes CSS para itens desabilitados
  classesItemDesabilitado: 'opacity-50 bg-gray-200 cursor-not-allowed'
};

// Armazena referências a timers e estados
window.estadoAvaliacao = {
  timers: {},
  etapaAtual: null,
  dadosAvaliacao: null
};

/**
 * Inicializa a avaliação completa com os dados recebidos
 * @param {Object} dadosAvaliacao - Dados da avaliação da API
 * @param {Function} callbackFinalizar - Função a ser chamada ao finalizar
 * @returns {Boolean} - Sucesso da inicialização
 */
function inicializarAvaliacao(dadosAvaliacao, callbackFinalizar) {
  try {
    console.log('Inicializando avaliação com dados:', dadosAvaliacao);
    
    // Armazenar dados para uso futuro
    window.estadoAvaliacao.dadosAvaliacao = dadosAvaliacao;
    
    // Extrair dados para cada etapa
    const assessment = dadosAvaliacao.assessment || dadosAvaliacao;
    
    // Processar cada tipo de dados
    const palavras = extrairArray(assessment.words || []);
    const pseudopalavras = extrairArray(assessment.pseudowords || []);
    const frases = extrairArray(assessment.phrases || assessment.sentences || []);
    const texto = extrairTexto(assessment.text || '');
    
    // Ocultar seleção e mostrar primeira etapa
    document.getElementById('selecao-avaliacao')?.classList.add('hidden');
    document.getElementById('etapa-palavras')?.classList.remove('hidden');
    
    // Garantir que a seção de resultado esteja oculta inicialmente
    ocultarSecaoResultado();
    
    // Inicializar cada etapa
    renderizarEtapaPalavras(palavras);
    renderizarEtapaPseudopalavras(pseudopalavras);
    renderizarEtapaFrases(frases);
    renderizarEtapaTexto(texto);
    
    // Configurar botões de cronômetro para todas as etapas
    configurarCronometros();
    
    // Configurar botões de navegação entre etapas
    configurarBotoesNavegacao(callbackFinalizar);
    
    // Armazenar no localStorage
    localStorage.setItem('avaliacaoAtual', JSON.stringify({
      id: dadosAvaliacao.id,
      assessment: assessment
    }));
    
    return true;
  } catch (error) {
    console.error('Erro ao inicializar avaliação:', error);
    return false;
  }
}

/**
 * Oculta todas as seções de resultado
 * Chamada no início para garantir que elementos de resultado não apareçam antes da hora
 */
function ocultarSecaoResultado() {
  // Ocultar o modal de resultado
  const modalResult = document.getElementById('modalResult');
  if (modalResult) {
    modalResult.classList.add('d-none');
  }
  
  // Ocultar a área de botões finais (Nova Avaliação, Ver Resultado, etc)
  const secaoFinal = document.querySelector('.text-center.py-4');
  if (secaoFinal) {
    secaoFinal.classList.add('hidden');
  }
  
  console.log('✅ Seções de resultado ocultadas com sucesso');
}

/**
 * Renderiza a etapa de palavras
 * @param {Array} palavras - Lista de palavras para renderizar
 * @returns {Boolean} - Sucesso da renderização
 */
function renderizarEtapaPalavras(palavras) {
  try {
    console.log('🚀 Renderizando etapa de palavras:', palavras);

    // Garantir que existem palavras para renderizar
    if (!palavras || palavras.length === 0) {
      palavras = ["casa", "bola", "gato", "pato"];
    }

    // Localizar container
    const container = document.querySelector('#etapa-palavras .grid');
    if (!container) {
      console.error('❌ Container de palavras não encontrado');
      return false;
    }

    // Limpar container
    container.innerHTML = '';

    // Adicionar palavras
    palavras.forEach((palavra, index) => {
      const divPalavra = document.createElement('div');
      divPalavra.className = `border rounded p-2 flex items-center palavra-item ${AVALIACAO_CONFIG.classesItemNaoSelecionado}`;
      divPalavra.setAttribute('data-id', index);
      divPalavra.setAttribute('data-palavra', palavra);
      divPalavra.innerHTML = `<span class="text-sm text-gray-800 select-none w-full text-center">${palavra}</span>`;

      // Adicionar evento de clique diretamente durante a renderização (para garantir)
      divPalavra.addEventListener('click', function (event) {
        console.log(`🖱️ Clique direto em palavra: ${palavra}`);
        // Só funciona se o cronômetro estiver ativo
        if (window.estadoAvaliacao.timers && window.estadoAvaliacao.timers.palavras) {
          if (this.classList.contains(AVALIACAO_CONFIG.classesItemSelecionado)) {
            // Desselecionar
            this.classList.remove(AVALIACAO_CONFIG.classesItemSelecionado);
            this.classList.add('bg-gray-100', 'hover:bg-blue-100');
            atualizarContadorLido('palavras', -1);
          } else {
            // Selecionar
            this.classList.remove('bg-gray-100', 'hover:bg-blue-100');
            this.classList.add(AVALIACAO_CONFIG.classesItemSelecionado);
            atualizarContadorLido('palavras', 1);
          }
        } else {
          console.log('⏱️ Cronômetro não está ativo, clique ignorado');
        }
      });

      container.appendChild(divPalavra);
    });

    // Atualizar contadores
    atualizarContadores('palavras', 0, palavras.length);

    // Adicionar botão para forçar habilitação se necessário
    const etapaPalavras = document.getElementById('etapa-palavras');
    if (etapaPalavras && !etapaPalavras.querySelector('.btn-force-enable')) {
      const btnForce = document.createElement('button');
      btnForce.className = 'btn-force-enable text-xs text-gray-400 mt-2 hidden';
      btnForce.textContent = 'Problemas com cliques? Clique aqui';
      btnForce.addEventListener('click', () => {
        habilitarEtapaPalavras();
        btnForce.classList.add('hidden');
      });
      etapaPalavras.appendChild(btnForce);

      // Mostrar botão após 3 segundos se o cronômetro estiver ativo
      setTimeout(() => {
        if (window.estadoAvaliacao.timers && window.estadoAvaliacao.timers.palavras) {
          btnForce.classList.remove('hidden');
        }
      }, 3000);
    }

    return true;
  } catch (error) {
    console.error('❌ Erro ao renderizar palavras:', error);
    return false;
  }
}

/**
 * Função específica para habilitar a etapa de palavras para clique
 * Pode ser chamada diretamente para resolver problemas de clique
 */
function habilitarEtapaPalavras() {
  console.log('🔄 Forçando habilitação da etapa de palavras para clique');

  // Tentar vários seletores para garantir que encontramos os itens
  const seletores = [
    '#etapa-palavras .grid > div',
    '.palavra-item',
    '#etapa-palavras div[data-palavra]',
    '#etapa-palavras div[data-id]'
  ];

  let itensEncontrados = false;

  // Tentar cada seletor até encontrar itens
  for (const seletor of seletores) {
    const itens = document.querySelectorAll(seletor);
    console.log(`🔍 Seletor "${seletor}": encontrados ${itens.length} itens`);

    if (itens.length > 0) {
      itensEncontrados = true;

      // Preparar itens para clique
      itens.forEach((item, index) => {
        // Remover todas as classes antigas
        item.className = 'border rounded p-2 flex items-center palavra-item bg-gray-100 hover:bg-blue-100 cursor-pointer';

        // Garantir que o evento de clique está funcionando
        const novoItem = item.cloneNode(true);
        const palavra = item.getAttribute('data-palavra') || `Palavra ${index + 1}`;

        // Adicionar evento de clique no novo item
        novoItem.addEventListener('click', function () {
          console.log(`🖱️ Clique em palavra: ${palavra}`);

          if (this.classList.contains(AVALIACAO_CONFIG.classesItemSelecionado)) {
            // Desselecionar
            this.classList.remove(AVALIACAO_CONFIG.classesItemSelecionado);
            this.classList.add('bg-gray-100', 'hover:bg-blue-100');
            atualizarContadorLido('palavras', -1);
          } else {
            // Selecionar
            this.classList.remove('bg-gray-100', 'hover:bg-blue-100');
            this.classList.add(AVALIACAO_CONFIG.classesItemSelecionado);
            atualizarContadorLido('palavras', 1);
          }
        });

        // Substituir o item antigo pelo novo
        if (item.parentNode) {
          item.parentNode.replaceChild(novoItem, item);
        }
      });

      // Não precisamos tentar mais seletores
      break;
    }
  }

  // Se não encontramos itens, criar novo aviso
  if (!itensEncontrados) {
    console.error('❌ Não foi possível encontrar itens para habilitar cliques na etapa palavras');
    alert('Não foi possível habilitar os cliques na etapa de palavras. Tente reiniciar a avaliação.');
  }

  return itensEncontrados;
}

/**
 * Renderiza a etapa de pseudopalavras
 * @param {Array} pseudopalavras - Lista de pseudopalavras para renderizar
 * @returns {Boolean} - Sucesso da renderização
 */
function renderizarEtapaPseudopalavras(pseudopalavras) {
  try {
    console.log('Renderizando etapa de pseudopalavras:', pseudopalavras);

    // Garantir que existem pseudopalavras para renderizar
    if (!pseudopalavras || pseudopalavras.length === 0) {
      pseudopalavras = ["tasi", "mupa", "dala", "lemo"];
    }

    // Localizar container
    const container = document.querySelector('#etapa-pseudopalavras .grid');
    if (!container) {
      console.error('Container de pseudopalavras não encontrado');
      return false;
    }

    // Limpar container
    container.innerHTML = '';

    // Adicionar pseudopalavras
    pseudopalavras.forEach((palavra, index) => {
      const divPalavra = document.createElement('div');
      divPalavra.className = `border rounded p-2 flex items-center pseudopalavra-item ${AVALIACAO_CONFIG.classesItemNaoSelecionado}`;
      divPalavra.setAttribute('data-id', index);
      divPalavra.innerHTML = `<span class="text-sm text-gray-800 select-none w-full text-center">${palavra}</span>`;
      container.appendChild(divPalavra);
    });

    // Atualizar contadores
    atualizarContadores('pseudopalavras', 0, pseudopalavras.length);

    return true;
  } catch (error) {
    console.error('Erro ao renderizar pseudopalavras:', error);
    return false;
  }
}

/**
 * Renderiza a etapa de frases
 * @param {Array} frases - Lista de frases para renderizar
 * @returns {Boolean} - Sucesso da renderização
 */
function renderizarEtapaFrases(frases) {
  try {
    console.log('Renderizando etapa de frases:', frases);

    // Garantir que existem frases para renderizar
    if (!frases || frases.length === 0) {
      frases = ["O menino joga bola.", "A casa é grande."];
    }

    // Localizar container
    const container = document.getElementById('frases-container');
    if (!container) {
      console.error('Container de frases não encontrado');
      return false;
    }

    // Limpar container
    container.innerHTML = '';

    // Adicionar frases
    frases.forEach((frase, index) => {
      const divFrase = document.createElement('div');
      divFrase.className = `border rounded p-3 mb-2 frase-item ${AVALIACAO_CONFIG.classesItemNaoSelecionado}`;
      divFrase.setAttribute('data-id', index);

      // Extrair texto da frase - lidar com diferentes formatos
      let textoFrase = '';
      if (typeof frase === 'string') {
        textoFrase = frase;
      } else if (typeof frase === 'object') {
        textoFrase = frase.text || frase.content || frase.phrase || frase.sentence || '';
      }

      if (!textoFrase) {
        textoFrase = `Frase ${index + 1}`;
      }

      divFrase.innerHTML = `<span class="text-sm text-gray-800 select-none w-full">${textoFrase}</span>`;
      container.appendChild(divFrase);
    });

    // Atualizar contadores
    atualizarContadores('frases', 0, frases.length);

    return true;
  } catch (error) {
    console.error('Erro ao renderizar frases:', error);
    return false;
  }
}

/**
 * Renderiza a etapa de texto
 * @param {String} texto - Texto para renderizar
 * @returns {Boolean} - Sucesso da renderização
 */
function renderizarEtapaTexto(texto) {
  try {
    console.log('Renderizando etapa de texto');

    // Garantir que existe texto para renderizar
    if (!texto || texto.trim().length === 0) {
      texto = "Este é um exemplo de texto para avaliação de leitura. O sistema está preparado para avaliar a fluência do aluno na leitura de textos contínuos.";
    }

    // Localizar container
    const container = document.getElementById('texto-container');
    if (!container) {
      console.error('Container de texto não encontrado');
      return false;
    }

    // Limpar container
    container.innerHTML = '';

    // Dividir texto em linhas de aprox. 12 palavras
    const palavras = texto.split(' ');
    const linhas = [];
    let linhaAtual = [];
    const palavrasPorLinha = 12;

    // Dividir palavras em linhas
    palavras.forEach(palavra => {
      linhaAtual.push(palavra);
      if (linhaAtual.length >= palavrasPorLinha) {
        linhas.push(linhaAtual.join(' '));
        linhaAtual = [];
      }
    });

    // Adicionar última linha se houver palavras restantes
    if (linhaAtual.length > 0) {
      linhas.push(linhaAtual.join(' '));
    }

    // Adicionar linhas ao container
    linhas.forEach((linha, index) => {
      const divLinha = document.createElement('div');
      divLinha.className = `border rounded p-2 mb-2 linha-texto-item ${AVALIACAO_CONFIG.classesItemNaoSelecionado}`;
      divLinha.setAttribute('data-id', index);
      divLinha.innerHTML = `<span class="text-sm text-gray-800 select-none">${linha}</span>`;
      container.appendChild(divLinha);
    });

    // Atualizar contadores
    atualizarContadores('linhas', 0, linhas.length);

    return true;
  } catch (error) {
    console.error('Erro ao renderizar texto:', error);
    return false;
  }
}

/**
 * Configura os cronômetros para todas as etapas
 */
function configurarCronometros() {
  // Lista de etapas e seus timers
  const etapas = [
    { id: 'iniciar-timer-palavras', etapa: 'palavras', elemTimer: 'timer-palavras' },
    { id: 'iniciar-timer-pseudopalavras', etapa: 'pseudopalavras', elemTimer: 'timer-pseudopalavras' },
    { id: 'iniciar-timer-frases', etapa: 'frases', elemTimer: 'timer-frases' },
    { id: 'iniciar-timer-texto', etapa: 'texto', elemTimer: 'timer-texto' }
  ];

  // Desabilitar botões de próxima etapa inicialmente
  etapas.forEach(etapa => {
    desabilitarBotaoProxima(etapa.etapa);
  });

  // Adicionar event listeners aos botões de cronômetro
  etapas.forEach(etapa => {
    const botao = document.getElementById(etapa.id);
    const timerElem = document.getElementById(etapa.elemTimer);

    if (botao && timerElem) {
      // Remover listeners existentes
      const novoBotao = botao.cloneNode(true);
      botao.parentNode.replaceChild(novoBotao, botao);

      // Adicionar novo listener
      novoBotao.addEventListener('click', () => iniciarCronometro(etapa.etapa, timerElem));
    }
  });
}

/**
 * Inicia o cronômetro para uma etapa específica
 * @param {String} etapa - Nome da etapa (palavras, pseudopalavras, etc)
 * @param {HTMLElement} timerElem - Elemento DOM para exibir o timer
 */
function iniciarCronometro(etapa, timerElem) {
  console.log(`🕒 Iniciando cronômetro para etapa: ${etapa}`);

  // Verificar se já existe timer ativo
  if (window.estadoAvaliacao.timers[etapa]) {
    alert("O cronômetro já está em andamento!");
    return;
  }

  // Armazenar etapa atual
  window.estadoAvaliacao.etapaAtual = etapa;

  // Desabilitar botão de iniciar
  const botaoIniciar = document.getElementById(`iniciar-timer-${etapa}`);
  if (botaoIniciar) {
    botaoIniciar.disabled = true;
    botaoIniciar.classList.add('bg-gray-400');
    botaoIniciar.classList.remove('bg-blue-600', 'hover:bg-blue-700');
    botaoIniciar.textContent = 'Cronômetro iniciado';
  }

  // Habilitar itens para clique
  habilitarItensParaClicar(etapa);

  // NOVO: Ativação direta e específica para cada etapa
  if (etapa === 'palavras') {
    setTimeout(() => {
      console.log('🔄 Executando habilitação específica para palavras');
      habilitarEtapaPalavras();
    }, 100);
  }

  // Configurar tempo inicial
  let segundosRestantes = AVALIACAO_CONFIG.tempoPadrao;

  // Formatar tempo inicial na interface
  const minutos = Math.floor(segundosRestantes / 60);
  const segundos = segundosRestantes % 60;
  timerElem.textContent = `${minutos.toString().padStart(2, '0')}:${segundos.toString().padStart(2, '0')}`;

  // Iniciar contagem regressiva
  window.estadoAvaliacao.timers[etapa] = setInterval(() => {
    segundosRestantes--;

    // Atualizar exibição
    const minutos = Math.floor(segundosRestantes / 60);
    const segundos = segundosRestantes % 60;
    timerElem.textContent = `${minutos.toString().padStart(2, '0')}:${segundos.toString().padStart(2, '0')}`;

    // Verificar se o tempo acabou
    if (segundosRestantes <= 0) {
      clearInterval(window.estadoAvaliacao.timers[etapa]);
      window.estadoAvaliacao.timers[etapa] = null;

      // Desabilitar itens não marcados
      desabilitarItensRestantes(etapa);

      // NOVO: Enviar dados da etapa para a API antes de notificar o usuário
      const contagens = obterContagensEtapa(etapa);

      // Enviar dados para API ao término do cronômetro
      enviarDadosEtapaApiSimplificado(etapa, contagens)
        .then(resultado => {
          console.log(`✅ Dados da etapa ${etapa} enviados ao término do cronômetro:`, resultado);

          // Notificar o usuário
          alert(`Tempo esgotado! A etapa de ${getNomeEtapa(etapa)} foi concluída e os dados foram registrados.`);

          // Habilitar botão de próxima etapa
          habilitarBotaoProxima(etapa);
        })
        .catch(erro => {
          console.error(`❌ Erro ao enviar dados da etapa ${etapa} no final do cronômetro:`, erro);

          // Notificar o usuário, mas menos detalhadamente para não assustar
          alert(`Tempo esgotado! A etapa de ${getNomeEtapa(etapa)} foi concluída.`);

          // Habilitar botão de próxima etapa mesmo com erro
          habilitarBotaoProxima(etapa);
        });
    }
  }, 1000);
}

/**
 * Configura os botões de navegação entre etapas
 * @param {Function} callbackFinalizar - Função a ser chamada ao finalizar
 */
function configurarBotoesNavegacao(callbackFinalizar) {
  const botoesProxima = [
    { id: 'proximo-etapa-palavras', atual: 'palavras', proxima: 'pseudopalavras' },
    { id: 'proximo-etapa-pseudopalavras', atual: 'pseudopalavras', proxima: 'frases' },
    { id: 'proximo-etapa-frases', atual: 'frases', proxima: 'texto' },
    { id: 'proximo-etapa-texto', atual: 'texto', proxima: 'resultado' }
  ];
  
  botoesProxima.forEach(config => {
    const botao = document.getElementById(config.id);
    
    if (botao) {
      // Limpar qualquer evento anterior
      botao.onclick = null;
      
      // Adicionar novo evento simplificado e direto
      botao.onclick = async function (event) {
        event.preventDefault();
        console.log(`🚀 Botão de avançar clicado: ${config.atual} -> ${config.proxima}`);
        if (config.proxima === 'RESULT') {
          console.log('Chegou na tela de resultado! 902')
          return;
        }
        
        // Mostrar estado de carregamento no botão
        botao.disabled = true;
        botao.innerHTML = '<span class="animate-pulse">Enviando dados...</span>';
        
        // Parar timer se estiver ativo
        if (window.estadoAvaliacao.timers && window.estadoAvaliacao.timers[config.atual]) {
          clearInterval(window.estadoAvaliacao.timers[config.atual]);
          window.estadoAvaliacao.timers[config.atual] = null;
        }
        
        // Obter dados de contagem
        const contagens = obterContagensEtapa(config.atual);
        console.log(`📊 Contagens para enviar: ${JSON.stringify(contagens)}`);
        
        try {
          // ENVIAR DADOS PARA API - função simplificada
          await enviarDadosEtapaApiSimplificado(config.atual, contagens);
          
          // Restaurar botão e avançar para próxima etapa
          botao.innerHTML = config.proxima === 'resultado' ? 'Finalizar' : 'Próxima Etapa';
          botao.disabled = false;
          
          // Ocultar etapa atual e mostrar próxima
          document.getElementById(`etapa-${config.atual}`).classList.add('hidden');
          document.getElementById(`etapa-${config.proxima}`).classList.remove('hidden');
          
          console.log(`✅ Avançado com sucesso para: ${config.proxima}`);
          
          // IMPORTANTE: Se avançou para a tela de resultado, chamar a finalização explicitamente
          if (config.proxima === 'resultado') {
            console.log("🎯 Chegou na tela de resultado! Chamando finalizarAvaliacao...");
            
            // Esperar um pouco para garantir que a tela de resultado foi carregada
            setTimeout(() => {
              finalizarAvaliacao();
            }, 300);
          }
          
          // Chamar callback se necessário
          if (typeof callbackFinalizar === 'function') {
            callbackFinalizar();
          }
        } catch (error) {
          console.error(`❌ ERRO AO AVANÇAR: ${error.message}`);
          
          // Restaurar botão
          botao.innerHTML = 'Próxima Etapa';
          botao.disabled = false;
          
          // Exibir erro
          alert(`Erro ao enviar dados: ${error.message}`);
          
          // Avançar mesmo assim
          document.getElementById(`etapa-${config.atual}`).classList.add('hidden');
          document.getElementById(`etapa-${config.proxima}`).classList.remove('hidden');
        }
        
        return false;
      };
    } else {
      console.warn(`⚠️ Botão não encontrado: ${config.id}`);
    }
  });
  
  console.log('✅ Botões de navegação configurados com sucesso');
}

/**
 * Função simplificada para enviar dados da etapa para API
 * @param {String} etapa - Nome da etapa
 * @param {Object} contagens - Objeto com contagens {lidos, total}
 * @returns {Promise} - Promessa da requisição
 */
async function enviarDadosEtapaApiSimplificado(etapa, contagens) {
  // 1. Obter ID da avaliação
  const avaliacaoAtual = JSON.parse(localStorage.getItem('avaliacaoAtual') || '{}');
  const avaliacaoId = avaliacaoAtual.id;

  if (!avaliacaoId) {
    throw new Error('ID da avaliação não encontrado. Por favor, reinicie a avaliação.');
  }

  // 2. Construir URL da API - CORREÇÃO: Garantindo URL correta conforme especificado
  const API_URL = `https://salf-salf-api2.gkgtsp.easypanel.host/reading-assessments/${avaliacaoId}/stage`;
  console.log(`📡 URL da API corrigida: ${API_URL}`);

  // 3. Configurar cabeçalhos da requisição
  const token = localStorage.getItem('token') || '';
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : ''
  };

  // 4. Preparar dados para envio (valores específicos da etapa)
  const dados = {
    stage: getEtapaValue(etapa),
    itemsRead: contagens.lidos,
    totalItems: contagens.total
  };

  console.log(`📤 Enviando dados: ${JSON.stringify(dados)}`);

  // 5. Fazer a requisição PUT para a API
  const response = await fetch(API_URL, {
    method: 'PUT',
    headers: headers,
    body: JSON.stringify(dados)
  });

  // 6. Verificar se a resposta foi bem-sucedida
  if (!response.ok) {
    const responseText = await response.text();
    throw new Error(`Erro da API (${response.status}): ${responseText}`);
  }

  // 7. Processar e retornar a resposta da API
  const resultado = await response.json();
  console.log(`✅ Dados enviados com sucesso! Resposta: ${JSON.stringify(resultado)}`);

  return resultado;
}

/**
 * Função mais robusta para habilitar itens para clique
 * Inclui fallbacks e várias técnicas para garantir que os itens sejam clicáveis
 * @param {String} etapa - Nome da etapa
 */
function habilitarItensParaClicar(etapa) {
  console.log(`🔍 Habilitando itens para clique na etapa: ${etapa}`);

  // Determinar seletor principal e seletores alternativos conforme a etapa
  let seletorPrincipal = '';
  let seletoresAlternativos = [];

  switch (etapa) {
    case 'palavras':
      seletorPrincipal = '#etapa-palavras .grid > div';
      seletoresAlternativos = ['.palavra-item', '#etapa-palavras div[data-palavra]', '#etapa-palavras div[data-id]'];
      break;
    case 'pseudopalavras':
      seletorPrincipal = '#etapa-pseudopalavras .grid > div';
      seletoresAlternativos = ['.pseudopalavra-item', '#etapa-pseudopalavras div[data-id]'];
      break;
    case 'frases':
      seletorPrincipal = '#frases-container > div';
      seletoresAlternativos = ['.frase-item', '#etapa-frases div[data-id]'];
      break;
    case 'texto':
    case 'linhas':
      seletorPrincipal = '#texto-container > div';
      seletoresAlternativos = ['.linha-texto-item', '#etapa-texto div[data-id]'];
      break;
  }

  // Tentar com o seletor principal primeiro
  const itensPrincipais = document.querySelectorAll(seletorPrincipal);
  console.log(`🔍 Seletor principal "${seletorPrincipal}": encontrados ${itensPrincipais.length} itens`);

  if (itensPrincipais.length > 0) {
    // Processar os itens encontrados com o seletor principal
    processarItensParaClique(itensPrincipais, etapa);
    return;
  }

  // Se o seletor principal não encontrou itens, tentar com os alternativos
  for (const seletor of seletoresAlternativos) {
    const itens = document.querySelectorAll(seletor);
    console.log(`🔍 Seletor alternativo "${seletor}": encontrados ${itens.length} itens`);

    if (itens.length > 0) {
      // Processar os itens encontrados com este seletor alternativo
      processarItensParaClique(itens, etapa);
      return;
    }
  }

  // Se chegamos aqui, não conseguimos encontrar itens com nenhum seletor
  console.warn(`⚠️ Não foi possível encontrar itens para a etapa ${etapa}`);

  // Criar botão para permitir uma nova tentativa
  const etapaElement = document.getElementById(`etapa-${etapa}`);
  if (etapaElement && !etapaElement.querySelector('.btn-retry-enable')) {
    const btnRetry = document.createElement('button');
    btnRetry.className = 'btn-retry-enable text-xs bg-blue-100 text-blue-800 p-2 rounded mt-2';
    btnRetry.textContent = 'Clique aqui para habilitar itens';
    btnRetry.addEventListener('click', () => {
      // Tentar novamente com técnica alternativa
      habilitarItensAlternativo(etapa);
      btnRetry.remove();
    });
    etapaElement.appendChild(btnRetry);
  }
}

/**
 * Processa itens para habilitar cliques
 * @param {NodeList} itens - Lista de elementos DOM
 * @param {String} etapa - Nome da etapa
 */
function processarItensParaClique(itens, etapa) {
  console.log(`🔄 Processando ${itens.length} itens para clique na etapa ${etapa}`);

  itens.forEach((item, index) => {
    // Remover classes de desabilitado
    if (AVALIACAO_CONFIG.classesItemNaoSelecionado) {
      AVALIACAO_CONFIG.classesItemNaoSelecionado.split(' ').forEach(classe => {
        if (classe) item.classList.remove(classe);
      });
    }

    // Adicionar classes de clicável
    item.classList.add('bg-gray-100', 'hover:bg-blue-100', 'cursor-pointer');

    // TÉCNICA DIRETA: Adicionar evento diretamente
    // Esta técnica adiciona o evento no próprio elemento sem clonagem
    // É uma primeira camada de garantia
    item.onclick = function (e) {
      console.log(`🖱️ [Direto] Clique no item ${index} da etapa ${etapa}`);
      toggleItemSelecao(this, etapa);
      e.stopPropagation(); // Prevenir evento de subir na hierarquia
    };

    // TÉCNICA COM CLONAGEM: Substitui o elemento para garantir limpeza
    // Esta é uma segunda camada para garantir que não haja eventos antigos
    const novoItem = item.cloneNode(true);
    novoItem.addEventListener('click', function (e) {
      console.log(`🖱️ [Clone] Clique no item ${index} da etapa ${etapa}`);
      toggleItemSelecao(this, etapa);
      e.stopPropagation(); // Prevenir evento de subir na hierarquia
    });

    if (item.parentNode) {
      item.parentNode.replaceChild(novoItem, item);
    }
  });

  // Adicionar evento para detectar se os cliques estão funcionando
  setTimeout(() => {
    const etapaElement = document.getElementById(`etapa-${etapa}`);
    if (etapaElement) {
      // Adicionar handler temporário para monitorar cliques
      const clicouHandler = () => {
        console.log('✅ Clique detectado na etapa!');
        etapaElement.removeEventListener('click', clicouHandler);
      };
      etapaElement.addEventListener('click', clicouHandler);
    }
  }, 1000);
}

/**
 * Método alternativo para habilitar itens quando os métodos normais falham
 * @param {String} etapa - Nome da etapa
 */
function habilitarItensAlternativo(etapa) {
  console.log(`⚡ Habilitando itens com método alternativo para etapa: ${etapa}`);

  // Identificar o container da etapa
  const etapaElement = document.getElementById(`etapa-${etapa}`);
  if (!etapaElement) {
    console.error('❌ Elemento da etapa não encontrado');
    return;
  }

  // Encontrar o container específico para os itens
  let containerItens = null;

  switch (etapa) {
    case 'palavras':
    case 'pseudopalavras':
      containerItens = etapaElement.querySelector('.grid');
      break;
    case 'frases':
      containerItens = document.getElementById('frases-container');
      break;
    case 'texto':
      containerItens = document.getElementById('texto-container');
      break;
  }

  if (!containerItens) {
    console.error('❌ Container de itens não encontrado');
    return;
  }

  // TÉCNICA ALTERNATIVA: Redefinir todos os itens do container
  const itens = containerItens.children;
  console.log(`🔄 Redefinindo ${itens.length} itens no container`);

  for (let i = 0; i < itens.length; i++) {
    const item = itens[i];

    // Limpar completamente todas as classes e aplicar as básicas
    item.className = `item-${etapa} border rounded p-2 mb-2 bg-gray-100 hover:bg-blue-100 cursor-pointer`;

    // Definir o atributo data-index
    item.setAttribute('data-index', i);

    // Adicionar evento com mais recursos
    item.onclick = function (e) {
      e.preventDefault();
      e.stopPropagation();
      console.log(`🖱️ Clique detectado no item ${i} (método alternativo)`);

      // Toggle da seleção
      if (this.classList.contains(AVALIACAO_CONFIG.classesItemSelecionado)) {
        this.classList.remove(AVALIACAO_CONFIG.classesItemSelecionado);
        this.classList.add('bg-gray-100', 'hover:bg-blue-100');
        atualizarContadorLido(etapa, -1);
      } else {
        this.classList.remove('bg-gray-100', 'hover:bg-blue-100');
        this.classList.add(AVALIACAO_CONFIG.classesItemSelecionado);
        atualizarContadorLido(etapa, 1);
      }

      return false;
    };
  }

  // Notificar sobre a habilitação
  alert(`Os itens da etapa de ${getNomeEtapa(etapa)} foram habilitados. Agora você pode clicar neles.`);
}

/**
 * Função auxiliar para alternar o estado de seleção de um item
 * @param {HTMLElement} item - Elemento DOM do item
 * @param {String} etapa - Nome da etapa
 */
function toggleItemSelecao(item, etapa) {
  if (item.classList.contains(AVALIACAO_CONFIG.classesItemSelecionado)) {
    // Desselecionar
    item.classList.remove(AVALIACAO_CONFIG.classesItemSelecionado);
    item.classList.add('bg-gray-100', 'hover:bg-blue-100');
    atualizarContadorLido(etapa, -1);
  } else {
    // Selecionar
    item.classList.remove('bg-gray-100', 'hover:bg-blue-100');
    item.classList.add(AVALIACAO_CONFIG.classesItemSelecionado);
    atualizarContadorLido(etapa, 1);
  }
}

/**
 * Desabilita itens não marcados após o tempo acabar
 * @param {String} etapa - Nome da etapa
 */
function desabilitarItensRestantes(etapa) {
  let seletor = '';

  switch (etapa) {
    case 'palavras':
      seletor = '#etapa-palavras .grid > div';
      break;
    case 'pseudopalavras':
      seletor = '#etapa-pseudopalavras .grid > div';
      break;
    case 'frases':
      seletor = '#frases-container > div';
      break;
    case 'texto':
    case 'linhas':
      seletor = '#texto-container > div';
      break;
  }

  const itens = document.querySelectorAll(seletor);

  itens.forEach(item => {
    if (!item.classList.contains(AVALIACAO_CONFIG.classesItemSelecionado)) {
      // Remover classes de clicável
      item.classList.remove('bg-gray-100', 'hover:bg-blue-100', 'cursor-pointer');
      // Adicionar classes de desabilitado
      item.classList.add(...AVALIACAO_CONFIG.classesItemDesabilitado.split(' '));

      // Remover eventos
      const novoItem = item.cloneNode(true);
      item.parentNode.replaceChild(novoItem, item);
    }
  });
}

/**
 * Atualiza o contador de uma etapa
 * @param {String} etapa - Nome da etapa
 * @param {Number} lidos - Quantidade de itens lidos
 * @param {Number} total - Total de itens
 */
function atualizarContadores(etapa, lidos, total) {
  let elemLidos, elemTotal;

  switch (etapa) {
    case 'palavras':
      elemLidos = document.getElementById('total-palavras-lidas');
      elemTotal = document.getElementById('total-palavras');
      break;
    case 'pseudopalavras':
      elemLidos = document.getElementById('total-pseudopalavras-lidas');
      elemTotal = document.getElementById('total-pseudopalavras');
      break;
    case 'frases':
      elemLidos = document.getElementById('total-frases-lidas');
      elemTotal = document.getElementById('total-frases');
      break;
    case 'texto':
    case 'linhas':
      elemLidos = document.getElementById('total-linhas-lidas');
      elemTotal = document.getElementById('total-linhas');
      break;
  }

  if (elemLidos) elemLidos.textContent = lidos;
  if (elemTotal) elemTotal.textContent = total;
}

/**
 * Atualiza apenas o contador de itens lidos
 * @param {String} etapa - Nome da etapa
 * @param {Number} incremento - Valor a incrementar (1) ou decrementar (-1)
 */
function atualizarContadorLido(etapa, incremento) {
  let elemLidos, elemTotal;

  switch (etapa) {
    case 'palavras':
      elemLidos = document.getElementById('total-palavras-lidas');
      elemTotal = document.getElementById('total-palavras');
      break;
    case 'pseudopalavras':
      elemLidos = document.getElementById('total-pseudopalavras-lidas');
      elemTotal = document.getElementById('total-pseudopalavras');
      break;
    case 'frases':
      elemLidos = document.getElementById('total-frases-lidas');
      elemTotal = document.getElementById('total-frases');
      break;
    case 'texto':
    case 'linhas':
      elemLidos = document.getElementById('total-linhas-lidas');
      elemTotal = document.getElementById('total-linhas');
      break;
  }

  if (elemLidos) {
    const valorAtual = parseInt(elemLidos.textContent) || 0;
    const valorTotal = parseInt(elemTotal?.textContent) || 0;

    // Garantir que o valor não seja negativo ou maior que o total
    const novoValor = Math.max(0, Math.min(valorAtual + incremento, valorTotal));

    elemLidos.textContent = novoValor;
  }
}

/**
 * Obtém as contagens atuais de uma etapa
 * @param {String} etapa - Nome da etapa
 * @returns {Object} - Objeto com contagens
 */
function obterContagensEtapa(etapa) {
  let elemLidos, elemTotal;

  switch (etapa) {
    case 'palavras':
      elemLidos = document.getElementById('total-palavras-lidas');
      elemTotal = document.getElementById('total-palavras');
      break;
    case 'pseudopalavras':
      elemLidos = document.getElementById('total-pseudopalavras-lidas');
      elemTotal = document.getElementById('total-pseudopalavras');
      break;
    case 'frases':
      elemLidos = document.getElementById('total-frases-lidas');
      elemTotal = document.getElementById('total-frases');
      break;
    case 'texto':
    case 'linhas':
      elemLidos = document.getElementById('total-linhas-lidas');
      elemTotal = document.getElementById('total-linhas');
      break;
  }

  const lidos = parseInt(elemLidos?.textContent) || 0;
  const total = parseInt(elemTotal?.textContent) || 0;

  return { lidos, total };
}

/**
 * Salva os dados de uma etapa no localStorage
 * @param {String} etapa - Nome da etapa
 * @param {Object} contagens - Objeto com contagens {lidos, total}
 */
async function salvarDadosEtapa(etapa, contagens) {
  try {
    const avaliacaoStr = localStorage.getItem('avaliacaoAtual');
    if (!avaliacaoStr) return;

    const avaliacao = JSON.parse(avaliacaoStr);

    // Adicionar etapa às etapas completadas
    if (!avaliacao.completedStages) avaliacao.completedStages = [];
    const etapaValue = getEtapaValue(etapa);

    if (!avaliacao.completedStages.includes(etapaValue)) {
      avaliacao.completedStages.push(etapaValue);
    }

    // Adicionar contagens específicas por etapa
    switch (etapa) {
      case 'palavras':
        avaliacao.wordsRead = contagens.lidos;
        avaliacao.wordsTotal = contagens.total;
        break;
      case 'pseudopalavras':
        avaliacao.pseudowordsRead = contagens.lidos;
        avaliacao.pseudowordsTotal = contagens.total;
        break;
      case 'frases':
        avaliacao.phrasesRead = contagens.lidos;
        avaliacao.phrasesTotal = contagens.total;
        break;
      case 'texto':
      case 'linhas':
        avaliacao.textLinesRead = contagens.lidos;
        avaliacao.textLinesTotal = contagens.total;

        // Calcular PPM e nível
        const ppm = contagens.lidos * 12; // Estimativa de 12 palavras por linha
        let nivelLeitura = 'NON_READER';

        if (ppm >= 50) nivelLeitura = 'TEXT_READER_WITH_FLUENCY';
        else if (ppm >= 40) nivelLeitura = 'TEXT_READER_WITHOUT_FLUENCY';
        else if (ppm >= 30) nivelLeitura = 'SENTENCE_READER';
        else if (ppm >= 20) nivelLeitura = 'WORD_READER';
        else if (ppm >= 10) nivelLeitura = 'SYLLABLE_READER';

        avaliacao.readingLevel = nivelLeitura;
        avaliacao.ppm = ppm;

        if (etapa === 'texto') {
          
          avaliacao.completed = true;
          const urlFinalize = `https://salf-salf-api2.gkgtsp.easypanel.host/reading-assessments/${avaliacaoId}/finalize`;
          const responseFinalize = await fetch(urlFinalize, {
            method: 'PUT',
            headers: headers
          });
          
          const urlResult = `https://salf-salf-api2.gkgtsp.easypanel.host/reading-assessments/${avaliacaoId}/result`;

          const responseResult = await fetch(urlResult, {
            method: 'GET',
            headers
          })


          
        

        }
        break;
    }

    localStorage.setItem('avaliacaoAtual', JSON.stringify(avaliacao));
  } catch (error) {
    console.error('Erro ao salvar dados da etapa:', error);
  }
}

/**
 * Habilita o botão de próxima etapa
 * @param {String} etapa - Nome da etapa
 */
function habilitarBotaoProxima(etapa) {
  const botao = document.getElementById(`proximo-etapa-${etapa}`);
  if (botao) {
    botao.disabled = false;
    botao.classList.remove('opacity-50', 'cursor-not-allowed', 'bg-gray-400');
    botao.classList.add('bg-green-600', 'hover:bg-green-700');
  }
}

/**
 * Desabilita o botão de próxima etapa
 * @param {String} etapa - Nome da etapa
 */
function desabilitarBotaoProxima(etapa) {
  const botao = document.getElementById(`proximo-etapa-${etapa}`);
  if (botao) {
    botao.disabled = true;
    botao.classList.add('opacity-50', 'cursor-not-allowed', 'bg-gray-400');
    botao.classList.remove('bg-green-600', 'hover:bg-green-700');
  }
}

// Funções Auxiliares

/**
 * Extrai array de dados que podem estar em diferentes formatos
 * @param {Array|String|Object} dados - Dados para extrair 
 * @returns {Array} - Array extraído
 */
function extrairArray(dados) {
  if (Array.isArray(dados)) {
    return dados;
  } else if (typeof dados === 'string') {
    if (dados.startsWith('[') && dados.endsWith(']')) {
      try {
        return JSON.parse(dados);
      } catch (e) {
        // Tentar extrair com regex
        const matches = dados.match(/"([^"]*)"/g);
        if (matches) {
          return matches.map(m => m.replace(/"/g, ''));
        }
      }
    }
    return [dados];
  } else if (typeof dados === 'object' && dados !== null) {
    return Object.values(dados);
  }
  return [];
}

/**
 * Extrai texto de diferentes formatos possíveis
 * @param {String|Object} texto - Texto para extrair
 * @returns {String} - Texto extraído
 */
function extrairTexto(texto) {
  if (typeof texto === 'string') {
    return texto;
  } else if (typeof texto === 'object' && texto !== null) {
    const campos = ['text', 'content', 'value', 'body'];
    for (const campo of campos) {
      if (texto[campo] && typeof texto[campo] === 'string') {
        return texto[campo];
      }
    }
  }
  return '';
}

/**
 * Obtém o nome amigável de uma etapa
 * @param {String} etapa - Código da etapa
 * @returns {String} - Nome amigável
 */
function getNomeEtapa(etapa) {
  switch (etapa) {
    case 'WORDS':
    case 'palavras':
      return 'Leitura de Palavras';
    case 'PSEUDOWORDS':
    case 'pseudopalavras':
      return 'Leitura de Pseudopalavras';
    case 'PHRASES':
    case 'frases':
      return 'Leitura de Frases';
    case 'TEXT':
    case 'texto':
    case 'linhas':
      return 'Leitura de Texto';
    default:
      return etapa;
  }
}

/**
 * Obtém o valor de API de uma etapa
 * @param {String} etapa - Código da etapa
 * @returns {String} - Valor para API
 */
function getEtapaValue(etapa) {
  switch (etapa) {
    case 'palavras': return 'WORDS';
    case 'pseudopalavras': return 'PSEUDOWORDS';
    case 'frases': return 'PHRASES';
    case 'texto':
    case 'linhas': return 'TEXT';
    default: return etapa;
  }
}

/**
 * Função para finalizar a avaliação e obter o resultado com o nível do leitor
 * Faz duas chamadas em sequência:
 * 1. Finaliza a avaliação: /reading-assessments/{id}/finalize
 * 2. Obtém o resultado: /reading-assessments/{id}/result
 * @returns {Promise<Object>} Objeto com o resultado da avaliação
 */
async function finalizarEObterResultadoAvaliacao() {
  try {
    // 1. Obter ID da avaliação
    const avaliacaoAtual = JSON.parse(localStorage.getItem('avaliacaoAtual') || '{}');
    const avaliacaoId = avaliacaoAtual.id;

    if (!avaliacaoId) {
      throw new Error('ID da avaliação não encontrado');
    }

    // 2. Configurar cabeçalhos da requisição
    const token = localStorage.getItem('token') || '';
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    };

    // 3. FINALIZAR A AVALIAÇÃO - Primeira chamada
    console.log(`📡 Finalizando avaliação: ID ${avaliacaoId}`);
    const urlFinalize = `https://salf-salf-api2.gkgtsp.easypanel.host/reading-assessments/${avaliacaoId}/finalize`;

    const responseFinalize = await fetch(urlFinalize, {
      method: 'POST',
      headers: headers
    });

    if (!responseFinalize.ok) {
      const errorText = await responseFinalize.text();
      throw new Error(`Erro ao finalizar avaliação (${responseFinalize.status}): ${errorText}`);
    }

    const resultadoFinalize = await responseFinalize.json();
    console.log(`✅ Avaliação finalizada com sucesso:`, resultadoFinalize);

    // 4. OBTER RESULTADO - Segunda chamada
    console.log(`📡 Obtendo resultado da avaliação: ID ${avaliacaoId}`);
    const urlResult = `https://salf-salf-api2.gkgtsp.easypanel.host/reading-assessments/${avaliacaoId}/result`;

    const responseResult = await fetch(urlResult, {
      method: 'GET',
      headers: headers
    });

    if (!responseResult.ok) {
      const errorText = await responseResult.text();
      throw new Error(`Erro ao obter resultado (${responseResult.status}): ${errorText}`);
    }

    const resultadoFinal = await responseResult.json();
    console.log(`✅ Resultado obtido com sucesso: Nível ${resultadoFinal.readingLevel}`, resultadoFinal);

    // 5. Salvar resultado no localStorage para uso futuro
    localStorage.setItem('resultadoAvaliacao', JSON.stringify(resultadoFinal));

    return resultadoFinal;
  } catch (error) {
    console.error('❌ Erro ao finalizar e obter resultado da avaliação:', error);
    throw error;
  }
}

/**
 * Atualiza a tela de resultado com os dados obtidos da API
 * @param {Object} resultado - Objeto com o resultado da avaliação
 */
function atualizarTelaResultado(resultado) {
  // if (!resultado) return;


  console.log('📝 Atualizando tela com resultado da avaliação:', resultado);

  try {
    // Atualizar nível do leitor no elemento correspondente
    const nivelLeitorElement = document.getElementById('nivel-leitor-sugerido');
    if (nivelLeitorElement && resultado.readingLevel) {
      const nivelFormatado = formatarNivelLeitor(resultado.readingLevel);
      nivelLeitorElement.textContent = nivelFormatado;
    }

    // Atualizar descrição do nível se disponível
    const descricaoNivelElement = document.getElementById('descricao-nivel');
    if (descricaoNivelElement && resultado.description) {
      descricaoNivelElement.textContent = resultado.description;
    }

    // Atualizar nome do aluno
    const nomeAlunoElement = document.getElementById('resultado-aluno-nome');
    if (nomeAlunoElement && resultado.studentName) {
      nomeAlunoElement.textContent = resultado.studentName;
    }

    // Atualizar série
    const serieElement = document.getElementById('resultado-serie');
    if (serieElement && resultado.grade) {
      serieElement.textContent = resultado.grade;
    }

    // Atualizar progresso na barra
    const progressoElement = document.getElementById('nivel-progresso');
    if (progressoElement && resultado.progressPercentage) {
      progressoElement.style.width = `${resultado.progressPercentage}%`;
    }

    // Atualizar observações/recomendações
    const observacaoElement = document.getElementById('nivel-observacao');
    if (observacaoElement && resultado.recommendations) {
      // Formatar recomendações como lista
      const recomendacoes = Array.isArray(resultado.recommendations)
        ? resultado.recommendations
        : [resultado.recommendations];

      let htmlRecomendacoes = '<strong>Recomendações:</strong><br>';
      recomendacoes.forEach(rec => {
        htmlRecomendacoes += `• ${rec}<br>`;
      });

      observacaoElement.innerHTML = htmlRecomendacoes;
    }

    console.log('✅ Tela de resultado atualizada com sucesso');
  } catch (error) {
    console.error('❌ Erro ao atualizar tela de resultado:', error);
  }
}

/**
 * Formata o nível do leitor de forma amigável
 * @param {String} nivel - Código do nível do leitor
 * @returns {String} - Descrição formatada do nível
 */
function formatarNivelLeitor(nivel) {
  const mapeamento = {
    'NON_READER': 'NÍVEL 1 - NÃO LEITOR',
    'SYLLABLE_READER': 'NÍVEL 2 - LEITOR DE SÍLABAS',
    'WORD_READER': 'NÍVEL 3 - LEITOR DE PALAVRAS',
    'SENTENCE_READER': 'NÍVEL 4 - LEITOR DE FRASES',
    'TEXT_READER_WITHOUT_FLUENCY': 'NÍVEL 5 - LEITOR DE TEXTO SEM FLUÊNCIA',
    'TEXT_READER_WITH_FLUENCY': 'NÍVEL 6 - LEITOR DE TEXTO COM FLUÊNCIA'
  };

  return mapeamento[nivel] || `NÍVEL - ${nivel}`;
}

/**
 * Função específica para finalizar a avaliação explicitamente na tela de resultado
 * Chamada diretamente quando a tela de resultado é exibida
 */
async function finalizarAvaliacao() {
  console.log("🔒 FINALIZANDO AVALIAÇÃO EXPLICITAMENTE NA TELA DE RESULTADO");
  
  try {
    // Obter ID da avaliação
    const avaliacaoAtual = JSON.parse(localStorage.getItem('avaliacaoAtual') || '{}');
    const avaliacaoId = avaliacaoAtual.id;
    
    if (!avaliacaoId) {
      console.error("❌ ID da avaliação não encontrado");
      return;
    }
    
    // Configurar cabeçalhos
    const token = localStorage.getItem('token') || '';
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    };
    
    // 1. FINALIZAR A AVALIAÇÃO - com método PUT
    console.log(`🔒 Chamando API de finalização: PUT /reading-assessments/${avaliacaoId}/finalize`);
    const urlFinalize = `https://salf-salf-api2.gkgtsp.easypanel.host/reading-assessments/${avaliacaoId}/finalize`;
    
    const responseFinalize = await fetch(urlFinalize, {
      method: 'PUT',
      headers: headers
    });
    
    if (!responseFinalize.ok) {
      console.error(`❌ Erro ao finalizar avaliação: ${responseFinalize.status}`);
    } else {
      const resultFinalize = await responseFinalize.json();
      console.log('✅ Avaliação finalizada com sucesso:', resultFinalize);
    }
    
    // 2. OBTER RESULTADO - com método GET
    console.log(`🔍 Chamando API de resultado: GET /reading-assessments/${avaliacaoId}/result`);
    const urlResult = `https://salf-salf-api2.gkgtsp.easypanel.host/reading-assessments/${avaliacaoId}/result`;
    
    const responseResult = await fetch(urlResult, {
      method: 'GET',
      headers: headers
    });
    
    if (!responseResult.ok) {
      console.error(`❌ Erro ao obter resultado: ${responseResult.status}`);
    } else {
      // Processar resultado
      const resultado = await responseResult.json();
      console.log('📝 Resultado obtido:', resultado);
      
      // Atualizar a tela com o resultado
      atualizarTelaResultado(resultado);
      
      // Salvar no localStorage
      localStorage.setItem('resultadoAvaliacao', JSON.stringify(resultado));
      
      // Mostrar a seção de resultado agora que tudo está pronto
      mostrarSecaoResultado();
      
      // Destacar elemento na tela para mostrar que foi carregado
      const nivelLeitorElement = document.getElementById('nivel-leitor-sugerido');
      if (nivelLeitorElement) {
        nivelLeitorElement.style.transition = 'background-color 0.5s';
        nivelLeitorElement.style.backgroundColor = '#e6f7ff';
        setTimeout(() => {
          nivelLeitorElement.style.backgroundColor = 'transparent';
        }, 1500);
      }
    }
  } catch (error) {
    console.error("❌ ERRO NA FINALIZAÇÃO:", error);
  }
}

/**
 * Mostra as seções de resultado após a finalização da avaliação
 */
function mostrarSecaoResultado() {
  // Mostrar a área de botões finais
  const secaoFinal = document.querySelector('.text-center.py-4');
  if (secaoFinal) {
    secaoFinal.classList.remove('hidden');
  }
  
  // Configurar botão para mostrar modal de resultado
  const btnModalResult = document.getElementById('btn-modal-result');
  if (btnModalResult) {
    btnModalResult.addEventListener('click', () => {
      const modalResult = document.getElementById('modalResult');
      if (modalResult) {
        modalResult.classList.remove('d-none');
      }
    });
  }
  
  console.log('✅ Seções de resultado exibidas após finalização');
} 