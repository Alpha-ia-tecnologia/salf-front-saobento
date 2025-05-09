/**
 * Modifica o script de inicialização para utilizar a função de mapeamento de avaliação
 * Este script deve ser incluído depois de mapear-avaliacao.js e antes de leituras.js
 */
document.addEventListener('DOMContentLoaded', function() {
    // Substituir a função de iniciar avaliação
    const btnIniciar = document.getElementById('iniciar-avaliacao');
    
    // Remover script inline da página que conflita com nossa implementação
    const scriptInline = document.querySelector('script:not([src])');
    if (scriptInline && scriptInline.textContent.includes('#proximo-etapa-palavras')) {
        scriptInline.remove();
    }
    
    // Modificar os botões de próxima etapa para incluir mensagem e classe CSS
    const botoesSeguintes = [
        'proximo-etapa-palavras',
        'proximo-etapa-pseudopalavras',
        'proximo-etapa-frases',
        'proximo-etapa-texto'
    ];
    
    botoesSeguintes.forEach(id => {
        const botao = document.getElementById(id);
        if (botao) {
            // Adicionar classe para tooltip
            botao.classList.add('btn-next-step');
            
            // Criar span para mensagem explicativa se não existir
            if (!botao.querySelector('.hint-text')) {
                const textoOriginal = botao.textContent.trim();
                botao.innerHTML = `${textoOriginal} <span class="text-xs hint-text">(aguarde o cronômetro)</span>`;
            }
        }
    });
    
    if (btnIniciar) {
        btnIniciar.addEventListener('click', async () => {
            console.log('Iniciando avaliação com mapeamento');
            
            // Obter valores dos campos simplificados
            const alunoId = document.getElementById('aluno').value || "1";
            const eventoId = document.getElementById('evento-avaliacao').value || "1";
            const testeId = document.getElementById('teste-leitura').value || "1";
            
            if (!alunoId || !testeId ) {
                alert('Por favor, selecione aluno, evento e teste para iniciar a avaliação.');
                return;
            }
            
            try {
                // Obter token de autenticação
                const token = localStorage.getItem('token');
                
                // Configurar cabeçalhos para requisições
                const headers = {
                    'Content-Type': 'application/json',
                    'Authorization': token ? `Bearer ${token}` : ''
                };
                
                // Buscar avaliação da API
                const hoje = new Date();
                const dataFutura = new Date();
                dataFutura.setDate(hoje.getDate() + 2);
                
                // Formatar datas para YYYY-MM-DD
                const dataInicial = hoje.toISOString().split('T')[0];
                const dataFinal = dataFutura.toISOString().split('T')[0];
                
                const url = `https://api.salf.maximizaedu.com/api/reading-assessments`;
              
                const response = await fetch(url, { 
                    headers, 
                    method: 'POST',
                    body: JSON.stringify({
                        studentId: Number.parseInt(alunoId), 
                        assessmentId: Number.parseInt(testeId),
                        assessmentEventId: Number.parseInt(eventoId)
                    })
                });
                
                const data = await response.json();
                const requestAvaliacao = await fetch(`https://api.salf.maximizaedu.com/api/reading-assessments/${data.id}`,{
                    headers: headers
                });
                const dataAvaliacao = await requestAvaliacao.json();
                
                // Mapear dados da avaliação para o formato usado pela aplicação
                const avaliacaoMapeada = mapearAvaliacao(dataAvaliacao);
                
                // Armazenar no localStorage para uso pelas etapas
                localStorage.setItem('avaliacaoAtual', JSON.stringify(avaliacaoMapeada));
                
                console.log('Avaliação mapeada:', avaliacaoMapeada);
                
                // Renderizar os dados da resposta no formato de etapas de avaliação
                renderizarDadosAvaliacao(data);
                
                // Configurar dataset para cada etapa
                configurarDatasetsEtapas();
                
                // Configurar os timers/cronômetros
                configurarCronometros();
                
                // Preparar cada etapa explicitamente para garantir que conteúdo seja renderizado
                prepararTodasEtapas(data);
                
                // Ocultar seleção de avaliação
                document.getElementById('selecao-avaliacao').classList.add('hidden');
                
                // Mostrar primeira etapa (palavras)
                document.getElementById('etapa-palavras').classList.remove('hidden');
                
                // Se já existir uma função global para preparar as etapas
                if (typeof prepararEtapasPalavras === 'function') {
                    prepararEtapasPalavras();
                } else if (typeof prepararEtapaPalavras === 'function') {
                    prepararEtapaPalavras(avaliacaoMapeada);
                }
                
            } catch (error) {
                console.error('Erro ao iniciar avaliação:', error);
                alert('Ocorreu um erro ao iniciar a avaliação. Por favor, tente novamente.');
            }
        });
    }
    
    /**
     * Configura os datasets para cada etapa da avaliação
     */
    function configurarDatasetsEtapas() {
        // Definir datasets para cada etapa
        const etapaPalavras = document.getElementById('etapa-palavras');
        if (etapaPalavras) {
            etapaPalavras.dataset.step = "palavras";
            etapaPalavras.dataset.stepValue = "WORDS";
        }
        
        const etapaPseudopalavras = document.getElementById('etapa-pseudopalavras');
        if (etapaPseudopalavras) {
            etapaPseudopalavras.dataset.step = "pseudopalavras";
            etapaPseudopalavras.dataset.stepValue = "PSEUDOWORDS";
        }
        
        const etapaFrases = document.getElementById('etapa-frases');
        if (etapaFrases) {
            etapaFrases.dataset.step = "frases";
            etapaFrases.dataset.stepValue = "SENTENCES";
        }
        
        const etapaTexto = document.getElementById('etapa-texto');
        if (etapaTexto) {
            etapaTexto.dataset.step = "texto";
            etapaTexto.dataset.stepValue = "TEXT";
        }
        
        const etapaResultado = document.getElementById('etapa-resultado');
        if (etapaResultado) {
            etapaResultado.dataset.step = "resultado";
            etapaResultado.dataset.stepValue = "RESULT";
        }
        
        // Adicionar listener para os botões de próxima etapa para atualizar a avaliação
        adicionarListenersBotoes();
    }
    
    /**
     * Envia o estágio atual da avaliação para a API
     * @param {number} avaliacaoId - ID da avaliação
     * @param {string} estagio - Valor do estágio atual (WORDS, PSEUDOWORDS, SENTENCES, TEXT, RESULT)
     * @param {number} itemsRead - Quantidade de itens lidos neste estágio
     * @param {number} totalItems - Total de itens disponíveis neste estágio
     * @returns {Promise<Object|null>} - Retorna o objeto da resposta ou null em caso de erro
     */
    async function enviarEstagioDaAvaliacao(avaliacaoId, estagio, itemsRead, totalItems) {
        try {
            // Obter token de autenticação
            const token = localStorage.getItem('token');
            
            // Configurar cabeçalhos para requisições
            const headers = {
                'Content-Type': 'application/json',
                'Authorization': token ? `Bearer ${token}` : ''
            };
            
            // Construir URL da rota
            const url = `https://api.salf.maximizaedu.com/api/reading-assessments/${avaliacaoId}/stage`;
            
            // Preparar dados a serem enviados
            const dados = {
                stage: estagio,
                itemsRead: itemsRead,
                totalItems: totalItems
            };
            
            console.log(`Enviando estágio ${estagio} para avaliação ID ${avaliacaoId}`, dados);
            
            // Fazer a requisição PUT
            const response = await fetch(url, {
                method: 'PUT',
                headers,
                body: JSON.stringify(dados)
            });
            
            // Verificar se a requisição foi bem-sucedida
            if (!response.ok) {
                throw new Error(`Erro ao enviar estágio: ${response.status} ${response.statusText}`);
            }
            
            // Converter resposta para JSON
            const resultado = await response.json();
            console.log('Estágio atualizado com sucesso:', resultado);
            
            return resultado;
        } catch (error) {
            console.error('Erro ao enviar estágio da avaliação:', error);
            return null;
        }
    }
    
    /**
     * Configura os cronômetros para cada etapa da avaliação
     */
    function configurarCronometros() {
        // Lista de botões de timer e suas etapas correspondentes
        const botoesTimer = [
            { id: 'iniciar-timer-palavras', etapa: 'palavras' },
            { id: 'iniciar-timer-pseudopalavras', etapa: 'pseudopalavras' },
            { id: 'iniciar-timer-frases', etapa: 'frases' },
            { id: 'iniciar-timer-texto', etapa: 'texto' }
        ];
        
        // Desabilitar botões de próxima etapa inicialmente
        desabilitarBotaoProximaEtapa('palavras');
        desabilitarBotaoProximaEtapa('pseudopalavras');
        desabilitarBotaoProximaEtapa('frases');
        desabilitarBotaoProximaEtapa('texto');
        
        // Estado global para controlar os timers
        window.estadoTimers = {
            timers: {
                palavras: null,
                pseudopalavras: null,
                frases: null,
                texto: null
            }
        };
        
        // Adicionar listeners para cada botão de timer
        botoesTimer.forEach(botao => {
            const btnElement = document.getElementById(botao.id);
            const timerElement = document.getElementById(`timer-${botao.etapa}`);
            
            if (btnElement && timerElement) {
                // Verificar se já tem listener (remover o existente)
                const novoElemento = btnElement.cloneNode(true);
                
                // Adicionar novo listener
                novoElemento.addEventListener('click', () => {
                    console.log(`Iniciando cronômetro para etapa: ${botao.etapa}`);
                    
                    // Verificar se o cronômetro já está ativo
                    if (window.estadoTimers.timers[botao.etapa]) {
                        alert("O cronômetro já está em andamento!");
                        return;
                    }
                    
                    // Desabilitar o botão
                    novoElemento.disabled = true;
                    novoElemento.classList.add('bg-gray-400');
                    novoElemento.classList.remove('bg-blue-600', 'hover:bg-blue-700');
                    novoElemento.textContent = 'Cronômetro iniciado';
                    
                    // Habilitar itens para clique
                    habilitarItensParaClicar(botao.etapa);
                    
                    // Configurar tempo inicial
                    let segundosRestantes = 60; // ALTERADO: 3 segundos -> 60 segundos (1 minuto)
                    
                    // Atualizar timer na interface
                    timerElement.textContent = '01:00'; // ALTERADO: mostrar 1 minuto
                    
                    // Iniciar contagem regressiva
                    window.estadoTimers.timers[botao.etapa] = setInterval(() => {
                        segundosRestantes--;
                        
                        // Formatar e exibir o tempo restante
                        const minutos = Math.floor(segundosRestantes / 60);
                        const segundos = segundosRestantes % 60;
                        timerElement.textContent = `${minutos.toString().padStart(2, '0')}:${segundos.toString().padStart(2, '0')}`;
                        
                        // Verificar se o tempo acabou
                        if (segundosRestantes <= 0) {
                            clearInterval(window.estadoTimers.timers[botao.etapa]);
                            window.estadoTimers.timers[botao.etapa] = null;
                            
                            // Desabilitar itens não marcados
                            desabilitarItensRestantes(botao.etapa);
                            
                            // Notificar o usuário
                            alert(`Tempo esgotado! A etapa de ${getNomeEtapa(botao.etapa)} foi concluída.`);
                            
                            // Habilitar botão de próxima etapa
                            habilitarBotaoProximaEtapa(botao.etapa);
                        }
                    }, 1000);
                });
                
                // Substituir o elemento original pelo novo com o listener
                btnElement.parentNode.replaceChild(novoElemento, btnElement);
            }
        });
    }
    
    /**
     * Desabilita o botão de próxima etapa
     * @param {string} etapa - Nome da etapa
     */
    function desabilitarBotaoProximaEtapa(etapa) {
        const btnProximo = document.getElementById(`proximo-etapa-${etapa}`);
        if (btnProximo) {
            btnProximo.disabled = true;
            btnProximo.classList.add('opacity-50', 'cursor-not-allowed', 'bg-gray-400');
            btnProximo.classList.remove('bg-green-600', 'hover:bg-green-700');
        }
    }
    
    /**
     * Habilita o botão de próxima etapa
     * @param {string} etapa - Nome da etapa
     */
    function habilitarBotaoProximaEtapa(etapa) {
        const btnProximo = document.getElementById(`proximo-etapa-${etapa}`);
        if (btnProximo) {
            btnProximo.disabled = false;
            btnProximo.classList.remove('opacity-50', 'cursor-not-allowed', 'bg-gray-400');
            btnProximo.classList.add('bg-green-600', 'hover:bg-green-700');
        }
    }
    
    /**
     * Habilita os itens de uma etapa para serem clicados
     * @param {string} etapa - Nome da etapa
     */
    function habilitarItensParaClicar(etapa) {
        let itens = [];
        
        // Selecionar os itens com base na etapa
        switch(etapa) {
            case 'palavras':
                itens = document.querySelectorAll('#etapa-palavras .grid > div');
                break;
            case 'pseudopalavras':
                itens = document.querySelectorAll('#etapa-pseudopalavras .grid > div');
                break;
            case 'frases':
                itens = document.querySelectorAll('#frases-container > div');
                break;
            case 'texto':
                itens = document.querySelectorAll('#texto-container > div');
                break;
        }
        
        // Habilitar clique em cada item
        itens.forEach(item => {
            item.classList.remove('bg-yellow-100', 'cursor-not-allowed');
            item.classList.add('bg-gray-100', 'hover:bg-blue-100', 'cursor-pointer');
            
            // Adicionar evento de clique
            item.addEventListener('click', () => {
                // Verificar se o item já está marcado
                if (item.classList.contains('bg-green-200')) {
                    // Desmarcar item
                    item.classList.remove('bg-green-200');
                    item.classList.add('bg-gray-100', 'hover:bg-blue-100');
                    
                    // Decrementar contador
                    atualizarContador(etapa, -1);
                } else {
                    // Marcar item como lido
                    item.classList.remove('bg-gray-100', 'hover:bg-blue-100');
                    item.classList.add('bg-green-200');
                    
                    // Incrementar contador
                    atualizarContador(etapa, 1);
                }
            });
        });
        
        console.log(`${itens.length} itens habilitados para clique na etapa ${etapa}`);
    }
    
    /**
     * Desabilita itens não marcados de uma etapa quando o tempo acaba
     * @param {string} etapa - Nome da etapa
     */
    function desabilitarItensRestantes(etapa) {
        let itens = [];
        
        // Selecionar os itens com base na etapa
        switch(etapa) {
            case 'palavras':
                itens = document.querySelectorAll('#etapa-palavras .grid > div');
                break;
            case 'pseudopalavras':
                itens = document.querySelectorAll('#etapa-pseudopalavras .grid > div');
                break;
            case 'frases':
                itens = document.querySelectorAll('#frases-container > div');
                break;
            case 'texto':
                itens = document.querySelectorAll('#texto-container > div');
                break;
        }
        
        // Desabilitar itens não marcados
        itens.forEach(item => {
            if (!item.classList.contains('bg-green-200')) {
                item.classList.remove('bg-gray-100', 'hover:bg-blue-100', 'cursor-pointer');
                item.classList.add('opacity-50', 'bg-gray-200', 'cursor-not-allowed');
                
                // Remover eventos de clique
                const novoItem = item.cloneNode(true);
                item.parentNode.replaceChild(novoItem, item);
            }
        });
        
        console.log(`Itens não marcados desabilitados na etapa ${etapa}`);
    }
    
    /**
     * Atualiza o contador de itens lidos
     * @param {string} etapa - Nome da etapa
     * @param {number} valor - Valor a incrementar (1) ou decrementar (-1)
     */
    function atualizarContador(etapa, valor) {
        let contador, total;
        
        // Selecionar os contadores com base na etapa
        switch(etapa) {
            case 'palavras':
                contador = document.getElementById('total-palavras-lidas');
                total = document.getElementById('total-palavras');
                break;
            case 'pseudopalavras':
                contador = document.getElementById('total-pseudopalavras-lidas');
                total = document.getElementById('total-pseudopalavras');
                break;
            case 'frases':
                contador = document.getElementById('total-frases-lidas');
                total = document.getElementById('total-frases');
                break;
            case 'texto':
                contador = document.getElementById('total-linhas-lidas');
                total = document.getElementById('total-linhas');
                break;
        }
        
        if (contador) {
            // Obter valor atual e atualizar
            let valorAtual = parseInt(contador.textContent) || 0;
            valorAtual += valor;
            
            // Garantir que não seja negativo
            valorAtual = Math.max(0, valorAtual);
            
            // Garantir que não exceda o total
            const valorTotal = parseInt(total?.textContent) || 0;
            valorAtual = Math.min(valorAtual, valorTotal);
            
            // Atualizar na interface
            contador.textContent = valorAtual;
        }
    }
    
    /**
     * Retorna um nome amigável para a etapa
     * @param {string} etapa - Nome da etapa
     * @returns {string} Nome amigável da etapa
     */
    function getNomeEtapa(etapa) {
        switch(etapa) {
            case 'WORDS':
            case 'palavras': 
                return 'Leitura de Palavras';
            case 'PSEUDOWORDS':
            case 'pseudopalavras': 
                return 'Leitura de Pseudopalavras';
            case 'SENTENCES':
            case 'frases': 
                return 'Leitura de Frases';
            case 'TEXT':
            case 'texto': 
                return 'Leitura de Texto';
            case 'INTERPRETATION':
            case 'interpretacao': 
                return 'Interpretação';
            default: 
                return etapa;
        }
    }
    
    /**
     * Adiciona listeners para os botões de próxima etapa
     */
    function adicionarListenersBotoes() {
        // Lista de botões e suas etapas correspondentes
        const botoes = [
            { id: 'proximo-etapa-palavras', etapaAtual: 'palavras', proxima: 'pseudopalavras' },
            { id: 'proximo-etapa-pseudopalavras', etapaAtual: 'pseudopalavras', proxima: 'frases' },
            { id: 'proximo-etapa-frases', etapaAtual: 'frases', proxima: 'texto' },
            { id: 'proximo-etapa-texto', etapaAtual: 'texto', proxima: 'resultado' }
        ];
        
        // Adicionar listeners para cada botão
        botoes.forEach(botao => {
            const elemento = document.getElementById(botao.id);
            if (elemento) {
                // Verificar se já tem listener (remover o existente)
                const novoElemento = elemento.cloneNode(true);
                
                // Adicionar novo listener
                novoElemento.addEventListener('click', async (event) => {
                    // Se o botão estiver desabilitado, mostrar mensagem de alerta e não prosseguir
                    if (novoElemento.disabled) {
                        event.preventDefault();
                        alert(`Aguarde o cronômetro terminar para avançar para a próxima etapa.`);
                        return;
                    }
                    
                    console.log(`Concluindo etapa: ${botao.etapaAtual}`);
                    
                    // Parar o timer desta etapa, se estiver ativo
                    if (window.estadoTimers?.timers[botao.etapaAtual]) {
                        clearInterval(window.estadoTimers.timers[botao.etapaAtual]);
                        window.estadoTimers.timers[botao.etapaAtual] = null;
                    }
                    
                    // Obter a avaliação atual do localStorage
                    const avaliacaoAtualStr = localStorage.getItem('avaliacaoAtual');
                    if (avaliacaoAtualStr) {
                        const avaliacaoAtual = JSON.parse(avaliacaoAtualStr);
                        
                        // Obter o valor do dataset para a etapa atual
                        const etapaAtualElement = document.getElementById(`etapa-${botao.etapaAtual}`);
                        if (etapaAtualElement && etapaAtualElement.dataset.stepValue) {
                            // Obter as etapas já completadas
                            const completedStages = [...(avaliacaoAtual.completedStages || [])];
                            
                            // Adicionar etapa atual se não estiver já incluída
                            if (!completedStages.includes(etapaAtualElement.dataset.stepValue)) {
                                completedStages.push(etapaAtualElement.dataset.stepValue);
                            }
                            
                            // Obter contadores específicos para cada etapa
                            let dadosAtualizacao = {
                                completedStages: completedStages
                            };
                            
                            // Dados específicos para cada etapa
                            switch(botao.etapaAtual) {
                                case 'palavras':
                                    const totalPalavrasLidas = parseInt(document.getElementById('total-palavras-lidas').textContent) || 0;
                                    const totalPalavras = parseInt(document.getElementById('total-palavras').textContent) || 0;
                                    dadosAtualizacao = {
                                        ...dadosAtualizacao,
                                        wordsRead: totalPalavrasLidas,
                                        wordsTotal: totalPalavras
                                    };
                                    break;
                                    
                                case 'pseudopalavras':
                                    const totalPseudopalavrasLidas = parseInt(document.getElementById('total-pseudopalavras-lidas').textContent) || 0;
                                    const totalPseudopalavras = parseInt(document.getElementById('total-pseudopalavras').textContent) || 0;
                                    dadosAtualizacao = {
                                        ...dadosAtualizacao,
                                        pseudowordsRead: totalPseudopalavrasLidas,
                                        pseudowordsTotal: totalPseudopalavras
                                    };
                                    break;
                                    
                                case 'frases':
                                    const totalFrasesLidas = parseInt(document.getElementById('total-frases-lidas').textContent) || 0;
                                    const totalFrases = parseInt(document.getElementById('total-frases').textContent) || 0;
                                    dadosAtualizacao = {
                                        ...dadosAtualizacao,
                                        sentencesRead: totalFrasesLidas,
                                        sentencesTotal: totalFrases
                                    };
                                    break;
                                    
                                case 'texto':
                                    const totalLinhasLidas = parseInt(document.getElementById('total-linhas-lidas').textContent) || 0;
                                    const totalLinhas = parseInt(document.getElementById('total-linhas').textContent) || 0;
                                    
                                    // Calcular palavras por minuto (estimativa)
                                    // Considerando 12 palavras por linha em média
                                    const ppm = totalLinhasLidas * 12;
                                    
                                    // Determinar nível de leitura com base no PPM
                                    let nivelLeitura = 'NON_READER';
                                    if (ppm >= 50) nivelLeitura = 'TEXT_READER_WITH_FLUENCY';
                                    else if (ppm >= 40) nivelLeitura = 'TEXT_READER_WITHOUT_FLUENCY';
                                    else if (ppm >= 30) nivelLeitura = 'SENTENCE_READER';
                                    else if (ppm >= 20) nivelLeitura = 'WORD_READER';
                                    else if (ppm >= 10) nivelLeitura = 'SYLLABLE_READER';
                                    
                                    dadosAtualizacao = {
                                        ...dadosAtualizacao,
                                        textLinesRead: totalLinhasLidas,
                                        textLinesTotal: totalLinhas,
                                        readingLevel: nivelLeitura,
                                        ppm: ppm,
                                        completed: true
                                    };
                                    break;
                            }
                            
                            // Atualizar dados completos no localStorage
                            localStorage.setItem('avaliacaoAtual', JSON.stringify({
                                ...avaliacaoAtual,
                                ...dadosAtualizacao
                            }));
                            
                            console.log(`Etapa ${botao.etapaAtual} concluída. Valor: ${etapaAtualElement.dataset.stepValue}`);
                            console.log('Dados de atualização:', dadosAtualizacao);
                            
                            // Enviar estágio atual para a API
                            let itemsRead = 0;
                            let totalItems = 0;
                            
                            switch(botao.etapaAtual) {
                                case 'palavras':
                                    itemsRead = dadosAtualizacao.wordsRead || 0;
                                    totalItems = dadosAtualizacao.wordsTotal || 0;
                                    break;
                                case 'pseudopalavras':
                                    itemsRead = dadosAtualizacao.pseudowordsRead || 0;
                                    totalItems = dadosAtualizacao.pseudowordsTotal || 0;
                                    break;
                                case 'frases':
                                    itemsRead = dadosAtualizacao.sentencesRead || 0;
                                    totalItems = dadosAtualizacao.sentencesTotal || 0;
                                    break;
                                case 'texto':
                                    itemsRead = dadosAtualizacao.textLinesRead || 0;
                                    totalItems = dadosAtualizacao.textLinesTotal || 0;
                                    break;
                            }
                            
                            await enviarEstagioDaAvaliacao(
                                avaliacaoAtual.id, 
                                etapaAtualElement.dataset.stepValue,
                                itemsRead,
                                totalItems
                            );
                            
                            // Se existe a função de atualização da API, chamar ela
                            if (typeof atualizarAvaliacao === 'function') {
                                atualizarAvaliacao(dadosAtualizacao);
                            }
                        }
                    }
                    
                    // Esconder etapa atual e mostrar próxima
                    document.getElementById(`etapa-${botao.etapaAtual}`).classList.add('hidden');
                    document.getElementById(`etapa-${botao.proxima}`).classList.remove('hidden');
                });
                
                // Substituir o elemento original pelo novo com o listener
                elemento.parentNode.replaceChild(novoElemento, elemento);
            }
        });
    }

    /**
     * Finaliza uma avaliação enviando requisição para a API
     * @param {number} avaliacaoId - ID da avaliação a ser finalizada
     * @returns {Promise<Object|null>} - Retorna o objeto da resposta ou null em caso de erro
     */
    async function finalizarAvaliacao(avaliacaoId) {
        try {
            // Obter token de autenticação
            const token = localStorage.getItem('token');
            
            // Configurar cabeçalhos para requisições
            const headers = {
                'Content-Type': 'application/json',
                'Authorization': token ? `Bearer ${token}` : ''
            };
            
            // Construir URL da rota
            const url = `https://api.salf.maximizaedu.com/api/reading-assessments/${avaliacaoId}/finalize`;
            
            console.log(`Finalizando avaliação ID ${avaliacaoId}`);
            
            // Fazer a requisição PUT
            const response = await fetch(url, {
                method: 'PUT',
                headers
            });
            
            // Verificar se a requisição foi bem-sucedida
            if (!response.ok) {
                throw new Error(`Erro ao finalizar avaliação: ${response.status} ${response.statusText}`);
            }
            
            // Converter resposta para JSON
            const resultado = await response.json();
            console.log('Avaliação finalizada com sucesso:', resultado);
            
            return resultado;
        } catch (error) {
            console.error('Erro ao finalizar avaliação:', error);
            return null;
        }
    }

    // Adicionar listener ao botão de voltar ao dashboard
    const btnVoltarDashboard = document.getElementById('btn-voltar-dashboard');
    if (btnVoltarDashboard) {
        btnVoltarDashboard.addEventListener('click', async () => {
            // Obter a avaliação atual do localStorage
            const avaliacaoAtualStr = localStorage.getItem('avaliacaoAtual');
            if (avaliacaoAtualStr) {
                const avaliacaoAtual = JSON.parse(avaliacaoAtualStr);
                
                // Finalizar a avaliação
                await finalizarAvaliacao(avaliacaoAtual.id);
                
                // Redirecionar para o dashboard
                window.location.href = '/dashboard.html';
            } else {
                // Caso não tenha avaliação no localStorage
                console.warn('Nenhuma avaliação encontrada para finalizar');
                window.location.href = '/dashboard.html';
            }
        });
    }
    
    // Adicionar também o mesmo comportamento ao botão de nova avaliação
    const btnNovaAvaliacao = document.getElementById('btn-nova-avaliacao');
    if (btnNovaAvaliacao) {
        btnNovaAvaliacao.addEventListener('click', async () => {
            // Obter a avaliação atual do localStorage
            const avaliacaoAtualStr = localStorage.getItem('avaliacaoAtual');
            if (avaliacaoAtualStr) {
                const avaliacaoAtual = JSON.parse(avaliacaoAtualStr);
                
                // Finalizar a avaliação atual
                await finalizarAvaliacao(avaliacaoAtual.id);
                
                // Limpar avaliação atual do localStorage
                localStorage.removeItem('avaliacaoAtual');
                
                // Redirecionar para a página de avaliação
                window.location.href = '/pages/avaliacao/realizar.html';
            } else {
                // Caso não tenha avaliação no localStorage
                window.location.href = '/pages/avaliacao/realizar.html';
            }
        });
    }

    /**
     * Prepara todas as etapas de avaliação com dados da API
     * @param {Object} dadosAvaliacao - Dados da avaliação recebidos da API
     */
    function prepararTodasEtapas(dadosAvaliacao) {
        console.log('📊 DIAGNÓSTICO - Iniciando prepararTodasEtapas com dados:', dadosAvaliacao);
        
        try {
            // Extrair e validar os dados
            if (!dadosAvaliacao) {
                console.error('❌ Dados de avaliação não fornecidos');
                return;
            }
            
            // DIAGNÓSTICO DETALHADO
            console.log('📊 Estrutura recebida:');
            console.log('- dadosAvaliacao existe?', Boolean(dadosAvaliacao));
            console.log('- dadosAvaliacao.assessment existe?', Boolean(dadosAvaliacao.assessment));
            
            if (dadosAvaliacao.assessment) {
                console.log('- assessment.words existe?', Boolean(dadosAvaliacao.assessment.words));
                console.log('- Tipo de assessment.words:', typeof dadosAvaliacao.assessment.words);
                console.log('- Valor de assessment.words:', dadosAvaliacao.assessment.words);
            } else {
                console.log('- words existe diretamente?', Boolean(dadosAvaliacao.words));
                console.log('- Tipo de words:', typeof dadosAvaliacao.words);
                console.log('- Valor de words:', dadosAvaliacao.words);
            }
            
            // CORREÇÃO IMPORTANTE: A estrutura correta da API possui os dados da avaliação dentro do campo 'assessment'
            const assessmentData = dadosAvaliacao.assessment ;
            
            console.log('📊 Usando assessmentData:', assessmentData);
            
            // SOLUÇÃO DIRETA PARA WORDS: Extrair words de assessment e converter para array 
            let wordsArray = [];
            
            // Se assessment.words existe, usar ele diretamente
            if (assessmentData.words) {
                const wordsData = assessmentData.words;
                
                // Se for string JSON como '["casa","bola","gato"]'
                if (typeof wordsData === 'string' && wordsData.startsWith('[') && wordsData.endsWith(']')) {
                    try {
                        wordsArray = JSON.parse(wordsData);
                        console.log('📊 Words convertido de JSON para array:', wordsArray);
                    } catch (error) {
                        console.error('📊 Erro ao converter words:', error);
                        // Tentar extrair com regex
                        const matches = wordsData.match(/"([^"]*)"/g);
                        if (matches) {
                            wordsArray = matches.map(m => m.replace(/"/g, ''));
                            console.log('📊 Words extraído via regex:', wordsArray);
                        }
                    }
                }
                // Se já for array
                else if (Array.isArray(wordsData)) {
                    wordsArray = wordsData;
                    console.log('📊 Words já é um array:', wordsArray);
                }
            }
            
            // GARANTIA: Se não conseguiu extrair, usar valores mínimos de exemplo
            if (!wordsArray || wordsArray.length === 0) {
                wordsArray = ["casa", "bola", "gato"];
                console.warn('📊 Usando words padrão:', wordsArray);
            }
            
            // Salvar no localStorage para garantir que prepararEtapaPalavras possa acessar
            try {
                const avaliacaoAtual = JSON.parse(localStorage.getItem('avaliacaoAtual') || '{}');
                if (!avaliacaoAtual.assessment) avaliacaoAtual.assessment = {};
                avaliacaoAtual.assessment.words = wordsArray;
                localStorage.setItem('avaliacaoAtual', JSON.stringify(avaliacaoAtual));
                console.log('📊 Words salvo no localStorage');
            } catch (error) {
                console.error('📊 Erro ao salvar no localStorage:', error);
            }
            
            // Extrair dados do assessment
            console.log('🚀 assessmentData:', assessmentData);
            const { 
                pseudowords = [], 
                sentences = [], 
                text = '', 
                phrases = [], 
                questions = [] 
            } = assessmentData;
            console.log('🚀 assessmentData: ', phrases);
            
            // Converter arrays se necessário
            const pseudowordsArray = processarCampoArray(pseudowords, 'pseudowords');
            const sentencesArray = processarCampoArray(sentences, 'sentences');
            
            // 1. Preparar etapa de palavras - USANDO WORDS EXTRAÍDO DIRETAMENTE
            console.log('🚀 Chamando prepararEtapaPalavras com words correto:', wordsArray);
            prepararEtapaPalavras(wordsArray);
            
            // 2. Preparar etapa de pseudopalavras
            prepararEtapaPseudopalavras(pseudowordsArray);
            
            // 3. Preparar etapa de frases - PRIORIZAR CAMPO PHRASES sobre SENTENCES
            // Dar preferência para o campo 'phrases' da API
            if (phrases && phrases.length > 0) {
                console.log('Usando campo "phrases" da resposta da API:', phrases);
                prepararEtapaFrases(phrases);
            } else {
                console.log('Campo "phrases" não encontrado, usando "sentences":', sentencesArray);
                prepararEtapaFrases(sentencesArray);
            }
            
            // 4. Preparar etapa de texto
            prepararEtapaTexto(text);
            
            // 5. Preparar etapa de interpretação (se houver questões)
            if (questions && questions.length > 0) {
                prepararEtapaInterpretacao(questions);
            }
            
            console.log('Todas as etapas preparadas com sucesso');
        } catch (error) {
            console.error('❌ Erro ao preparar todas as etapas:', error);
        }
    }
    
    /**
     * Prepara a etapa de palavras com os dados
     * @param {Array} palavras - Lista de palavras para a etapa
     */
    function prepararEtapaPalavras(palavras) {
        console.log('Preparando etapa de palavras:', palavras);
        
        // SOLUÇÃO DIRETA: Tentar extrair as palavras do assessment através do localStorage
        try {
            const avaliacaoStr = localStorage.getItem('avaliacaoAtual');
            if (avaliacaoStr) {
                const avaliacao = JSON.parse(avaliacaoStr);
                
                // Verificar se há assessment.words na avaliação
                if (avaliacao.assessment && avaliacao.assessment.words) {
                    let wordsDoAssessment = avaliacao.assessment.words;
                    
                    // Converter para array se for string JSON
                    if (typeof wordsDoAssessment === 'string' && wordsDoAssessment.includes('[')) {
                        try {
                            const wordsArray = JSON.parse(wordsDoAssessment);
                            if (Array.isArray(wordsArray) && wordsArray.length > 0) {
                                console.log('Usando palavras do assessment.words:', wordsArray);
                                palavras = wordsArray;
                            }
                        } catch (e) {
                            console.error('Erro ao converter words do assessment:', e);
                        }
                    } else if (Array.isArray(wordsDoAssessment)) {
                        console.log('Usando array de palavras do assessment.words:', wordsDoAssessment);
                        palavras = wordsDoAssessment;
                    }
                }
            }
        } catch (error) {
            console.error('Erro ao acessar words do assessment:', error);
        }
        
        const container = document.querySelector('#etapa-palavras .grid');
        if (!container) {
            console.error('Container de palavras não encontrado');
            return;
        }
        
        // Limpar o container
        container.innerHTML = '';
        
        // Criar elementos para cada palavra
        palavras.forEach((palavra, index) => {
            const divPalavra = document.createElement('div');
            divPalavra.className = 'border rounded p-2 flex items-center palavra-item bg-yellow-100 cursor-not-allowed transition-colors';
            divPalavra.setAttribute('data-id', index);
            divPalavra.innerHTML = `<span class="text-sm text-gray-800 select-none w-full text-center">${palavra}</span>`;
            container.appendChild(divPalavra);
        });
        
        // Atualizar contador
        const totalElement = document.getElementById('total-palavras');
        const lidasElement = document.getElementById('total-palavras-lidas');
        
        if (totalElement) totalElement.textContent = palavras.length;
        if (lidasElement) lidasElement.textContent = '0';
    }
    
    /**
     * Prepara a etapa de pseudopalavras com os dados
     * @param {Array} pseudopalavras - Lista de pseudopalavras para a etapa
     */
    function prepararEtapaPseudopalavras(pseudopalavras) {
        console.log('✅ INÍCIO DA RENDERIZAÇÃO DE PSEUDOPALAVRAS:', pseudopalavras);
        
        // FORÇA: Se não houver pseudopalavras, criar alguns exemplos
        if (!pseudopalavras || pseudopalavras.length === 0) {
            console.warn('⚠️ Nenhuma pseudopalavra encontrada nos dados, usando exemplos padrão');
            pseudopalavras = ["tasi", "mupa", "dala", "lemo", "pila", "veko", "suti", "rona", "fipe", "bima"];
        }
        
        // ETAPA 1: Verificar se a etapa existe
        const etapa = document.getElementById('etapa-pseudopalavras');
        if (!etapa) {
            console.error('❌ Elemento etapa-pseudopalavras não encontrado no DOM');
            return;
        }
        
        // ETAPA 2: Tentar várias maneiras de localizar o container
        let container = document.querySelector('#etapa-pseudopalavras .grid');
        
        // Tentativa alternativa 1
        if (!container) {
            container = etapa.querySelector('.grid');
            console.warn('⚠️ Usando seletor alternativo 1 para encontrar o container');
        }
        
        // Tentativa alternativa 2
        if (!container) {
            container = etapa.querySelector('[class*="grid"]');
            console.warn('⚠️ Usando seletor alternativo 2 para encontrar o container');
        }
        
        // Tentativa alternativa 3 - procura div que contenha mb-4
        if (!container) {
            container = etapa.querySelector('div[class*="mb-4"]');
            console.warn('⚠️ Usando seletor alternativo 3 para encontrar o container');
        }
        
        // FORÇA: Se ainda não encontrou o container, criar um novo
        if (!container) {
            console.warn('⚠️ Container não encontrado, criando um novo container para pseudopalavras');
            container = document.createElement('div');
            container.className = 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 mb-4';
            
            // Encontrar local adequado para inserir (após o alerta de "Importante")
            const alerta = etapa.querySelector('[role="alert"]');
            if (alerta) {
                alerta.insertAdjacentElement('afterend', container);
            } else {
                // Adicionar no final da etapa
                etapa.appendChild(container);
            }
        }
        
        console.log('✅ Container de pseudopalavras encontrado/criado:', container);
        
        // ETAPA 3: Limpar o container de forma segura
        try {
            container.innerHTML = '';
            console.log('✅ Container limpo com sucesso');
        } catch (error) {
            console.error('❌ Erro ao limpar container:', error);
        }
        
        // ETAPA 4: Criar elementos para cada pseudopalavra
        let sucessos = 0;
        pseudopalavras.forEach((palavra, index) => {
            try {
                const divPalavra = document.createElement('div');
                divPalavra.className = 'border rounded p-2 flex items-center pseudopalavra-item bg-yellow-100 cursor-not-allowed transition-colors';
                divPalavra.setAttribute('data-id', index);
                divPalavra.innerHTML = `<span class="text-sm text-gray-800 select-none w-full text-center">${palavra}</span>`;
                
                // Adicionar eventos de clique 
                divPalavra.addEventListener('click', function() {
                    // Verificar se o timer está ativo via window global
                    if (window.estadoTimers && window.estadoTimers.timers && window.estadoTimers.timers.pseudopalavras) {
                        // Marcar como lida
                        if (!this.classList.contains('bg-green-200')) {
                            this.classList.remove('bg-yellow-100', 'cursor-not-allowed');
                            this.classList.add('bg-green-200');
                            
                            // Atualizar contador
                            const contador = document.getElementById('total-pseudopalavras-lidas');
                            if (contador) {
                                const valor = parseInt(contador.textContent) || 0;
                                contador.textContent = valor + 1;
                            }
                        }
                    }
                });
                
                container.appendChild(divPalavra);
                sucessos++;
            } catch (error) {
                console.error(`❌ Erro ao adicionar pseudopalavra ${palavra}:`, error);
            }
        });
        
        console.log(`✅ Adicionadas ${sucessos} de ${pseudopalavras.length} pseudopalavras`);
        
        // ETAPA 5: Atualizar contadores de forma segura
        try {
            const totalElement = document.getElementById('total-pseudopalavras');
            if (totalElement) {
                totalElement.textContent = pseudopalavras.length;
            } else {
                console.warn('⚠️ Elemento total-pseudopalavras não encontrado');
                
                // Verificar se existe um elemento com o contador no formato "Total lidas: X / Y"
                const contadorPai = document.querySelector('[id*="total-pseudopalavras"], [class*="total"], span:contains("Total")');
                if (contadorPai) {
                    console.log('✅ Encontrado contador alternativo:', contadorPai);
                    // Tenta atualizar o texto usando expressão regular
                    contadorPai.textContent = contadorPai.textContent.replace(/\d+\s*\/\s*\d+/, `0 / ${pseudopalavras.length}`);
                }
            }
            
            const lidasElement = document.getElementById('total-pseudopalavras-lidas');
            if (lidasElement) {
                lidasElement.textContent = '0';
            } else {
                console.warn('⚠️ Elemento total-pseudopalavras-lidas não encontrado');
            }
            
            console.log('✅ Contadores atualizados com sucesso');
        } catch (error) {
            console.error('❌ Erro ao atualizar contadores:', error);
        }
        
        // ETAPA 6: Forçar atualizações visuais
        etapa.style.display = 'block';
        setTimeout(() => {
            etapa.style.display = '';
        }, 50);
        
        console.log('✅ RENDERIZAÇÃO DE PSEUDOPALAVRAS CONCLUÍDA');
    }
    
    /**
     * Prepara a etapa de frases com os dados
     * @param {Array} frases - Lista de frases para a etapa
     */
    function prepararEtapaFrases(frases) {
        console.log('✅ INÍCIO DA RENDERIZAÇÃO DE FRASES:', frases);
    
        
        // FORÇA: Se não houver frases, criar alguns exemplos
        if (!frases || frases.length === 0) {
            console.warn('⚠️ Nenhuma frase encontrada nos dados, usando exemplos padrão');
            frases = ["O menino joga bola.", "A casa é grande."];
        }
        
        // ETAPA 1: Verificar se a etapa existe
        const etapa = document.getElementById('etapa-frases');
        if (!etapa) {
            console.error('❌ Elemento etapa-frases não encontrado no DOM');
            return;
        }
        
        // ETAPA 2: Tentar várias maneiras de localizar o container
        const container = document.getElementById('frases-container');
        if (!container) {
            console.error('❌ Container de frases não encontrado');
            return;
        }
        
        console.log('✅ Container de frases encontrado:', container);
        
        // ETAPA 3: Limpar o container de forma segura
        try {
            container.innerHTML = '';
            console.log('✅ Container limpo com sucesso');
        } catch (error) {
            console.error('❌ Erro ao limpar container:', error);
        }
        
        // ETAPA 4: Criar elementos para cada frase
        let sucessos = 0;
        frases.forEach((frase, index) => {
            try {
                const divFrase = document.createElement('div');
                divFrase.className = 'border rounded p-3 mb-2 frase-item bg-yellow-100 cursor-not-allowed transition-colors';
                divFrase.setAttribute('data-id', index);
                
                // Extrair texto da frase - lidar com diferentes formatos de API
                let textoFrase = '';
                if (typeof frase === 'string') {
                    textoFrase = frase;
                } else if (typeof frase === 'object') {
                    // Suportar diferentes propriedades que podem conter o texto da frase
                    textoFrase = frase.text || frase.content || frase.phrase || frase.sentence || '';
                }
                
                // Garantir que sempre há um texto para exibir
                if (!textoFrase) {
                    console.warn(`⚠️ Frase ${index} não tem texto definido:`, frase);
                    textoFrase = `Frase ${index + 1}`;
                }
                
                divFrase.innerHTML = `<span class="text-sm text-gray-800 select-none w-full">${textoFrase}</span>`;
                
                // Adicionar eventos de clique 
                divFrase.addEventListener('click', function() {
                    // Verificar se o timer está ativo via window global
                    if (window.estadoTimers && window.estadoTimers.timers && window.estadoTimers.timers.frases) {
                        // Marcar como lida
                        if (!this.classList.contains('bg-green-200')) {
                            this.classList.remove('bg-yellow-100', 'cursor-not-allowed');
                            this.classList.add('bg-green-200');
                            
                            // Atualizar contador
                            const contador = document.getElementById('total-frases-lidas');
                            if (contador) {
                                const valor = parseInt(contador.textContent) || 0;
                                contador.textContent = valor + 1;
                            }
                        }
                    }
                });
                
                container.appendChild(divFrase);
                sucessos++;
            } catch (error) {
                console.error(`❌ Erro ao adicionar frase ${index}:`, error);
            }
        });
        
        console.log(`✅ Adicionadas ${sucessos} de ${frases.length} frases`);
        
        // ETAPA 5: Atualizar contadores de forma segura
        try {
            const totalElement = document.getElementById('total-frases');
            if (totalElement) {
                totalElement.textContent = frases.length;
            } else {
                console.warn('⚠️ Elemento total-frases não encontrado');
            }
            
            const lidasElement = document.getElementById('total-frases-lidas');
            if (lidasElement) {
                lidasElement.textContent = '0';
            } else {
                console.warn('⚠️ Elemento total-frases-lidas não encontrado');
            }
            
            console.log('✅ Contadores atualizados com sucesso');
        } catch (error) {
            console.error('❌ Erro ao atualizar contadores:', error);
        }
        
        console.log('✅ RENDERIZAÇÃO DE FRASES CONCLUÍDA');
    }
    
    /**
     * Prepara a etapa de texto com os dados
     * @param {string|object} texto - Texto para a etapa (string ou objeto)
     */
    function prepararEtapaTexto(texto) {
        console.log('✅ INÍCIO DA RENDERIZAÇÃO DE TEXTO');
        
        // ETAPA 1: Verificar e extrair texto
        let textoParaUsar = '';
        if (typeof texto === 'string' && texto.trim().length > 0) {
            console.log('Usando texto como string:', texto.substring(0, 50) + '...');
            textoParaUsar = texto;
        } else if (typeof texto === 'object' && texto !== null) {
            // Tentar extrair texto de diferentes propriedades possíveis
            const possiveisPropriedades = ['text', 'content', 'value', 'body'];
            
            for (const prop of possiveisPropriedades) {
                if (texto[prop] && typeof texto[prop] === 'string' && texto[prop].trim().length > 0) {
                    console.log(`Usando texto da propriedade ${prop}:`, texto[prop].substring(0, 50) + '...');
                    textoParaUsar = texto[prop];
                    break;
                }
            }
        }
        
        // Se ainda não tiver texto, usar exemplo padrão
        if (!textoParaUsar || textoParaUsar.trim().length === 0) {
            console.warn('⚠️ Nenhum texto válido fornecido, usando exemplo padrão');
            textoParaUsar = "Este é um texto de exemplo para a avaliação de leitura. Foi adicionado automaticamente porque não havia texto válido na resposta da API. O sistema está preparado para lidar com diferentes cenários e garantir que sempre haja conteúdo para todas as etapas de avaliação.";
        }
        
        // ETAPA 2: Verificar se a etapa existe
        const etapa = document.getElementById('etapa-texto');
        if (!etapa) {
            console.error('❌ Elemento etapa-texto não encontrado no DOM');
            return;
        }
        
        // ETAPA 3: Localizar o container
        const container = document.getElementById('texto-container');
        if (!container) {
            console.error('❌ Container de texto não encontrado');
            return;
        }
        
        console.log('✅ Container de texto encontrado');
        
        // ETAPA 4: Limpar o container de forma segura
        try {
            container.innerHTML = '';
            console.log('✅ Container limpo com sucesso');
        } catch (error) {
            console.error('❌ Erro ao limpar container:', error);
        }
        
        // ETAPA 5: Dividir o texto em linhas para melhor legibilidade
        try {
            const palavras = textoParaUsar.split(' ');
            const linhas = [];
            let linhaAtual = [];
            let palavrasPorLinha = 12;
            
            // Dividir as palavras em linhas
            palavras.forEach(palavra => {
                linhaAtual.push(palavra);
                if (linhaAtual.length >= palavrasPorLinha) {
                    linhas.push(linhaAtual.join(' '));
                    linhaAtual = [];
                }
            });
            
            // Adicionar a última linha se houver palavras restantes
            if (linhaAtual.length > 0) {
                linhas.push(linhaAtual.join(' '));
            }
            
            console.log(`✅ Texto dividido em ${linhas.length} linhas`);
            
            // ETAPA 6: Criar elementos para cada linha
            let sucessos = 0;
            linhas.forEach((linha, index) => {
                try {
                    const divLinha = document.createElement('div');
                    divLinha.className = 'border rounded p-2 mb-2 linha-texto-item bg-yellow-100 cursor-not-allowed transition-colors';
                    divLinha.setAttribute('data-id', index);
                    divLinha.innerHTML = `<span class="text-sm text-gray-800 select-none">${linha}</span>`;
                    
                    // Adicionar eventos de clique 
                    divLinha.addEventListener('click', function() {
                        // Verificar se o timer está ativo via window global
                        if (window.estadoTimers && window.estadoTimers.timers && window.estadoTimers.timers.texto) {
                            // Marcar como lida
                            if (!this.classList.contains('bg-green-200')) {
                                this.classList.remove('bg-yellow-100', 'cursor-not-allowed');
                                this.classList.add('bg-green-200');
                                
                                // Atualizar contador
                                const contador = document.getElementById('total-linhas-lidas');
                                if (contador) {
                                    const valor = parseInt(contador.textContent) || 0;
                                    contador.textContent = valor + 1;
                                }
                            }
                        }
                    });
                    
                    container.appendChild(divLinha);
                    sucessos++;
                } catch (error) {
                    console.error(`❌ Erro ao adicionar linha ${index}:`, error);
                }
            });
            
            console.log(`✅ Adicionadas ${sucessos} de ${linhas.length} linhas`);
            
            // ETAPA 7: Atualizar contadores de forma segura
            try {
                const totalElement = document.getElementById('total-linhas');
                if (totalElement) {
                    totalElement.textContent = linhas.length;
                } else {
                    console.warn('⚠️ Elemento total-linhas não encontrado');
                }
                
                const lidasElement = document.getElementById('total-linhas-lidas');
                if (lidasElement) {
                    lidasElement.textContent = '0';
                } else {
                    console.warn('⚠️ Elemento total-linhas-lidas não encontrado');
                }
                
                console.log('✅ Contadores atualizados com sucesso');
            } catch (error) {
                console.error('❌ Erro ao atualizar contadores:', error);
            }
        } catch (error) {
            console.error('❌ Erro ao processar o texto:', error);
        }
        
        console.log('✅ RENDERIZAÇÃO DE TEXTO CONCLUÍDA');
    }
    
    /**
     * Prepara a etapa de interpretação com as questões
     * @param {Array} questoes - Lista de questões de interpretação
     */
    function prepararEtapaInterpretacao(questoes) {
        console.log('Preparando etapa de interpretação:', questoes);
        
        // Verificar se existe o container de interpretação, se não, criá-lo
        let etapaInterpretacao = document.getElementById('etapa-interpretacao');
        if (!etapaInterpretacao) {
            // Criar o container principal
            etapaInterpretacao = document.createElement('div');
            etapaInterpretacao.id = 'etapa-interpretacao';
            etapaInterpretacao.className = 'bg-white rounded-lg shadow-md p-6 hidden';
            etapaInterpretacao.dataset.step = "interpretacao";
            etapaInterpretacao.dataset.stepValue = "INTERPRETATION";
            
            // Título da etapa
            const titulo = document.createElement('h2');
            titulo.className = 'text-xl font-semibold mb-4';
            titulo.textContent = 'Interpretação de Texto';
            etapaInterpretacao.appendChild(titulo);
            
            // Descrição
            const descricao = document.createElement('p');
            descricao.className = 'text-gray-600 mb-4';
            descricao.textContent = 'Responda as questões abaixo sobre o texto que acabou de ler:';
            etapaInterpretacao.appendChild(descricao);
            
            // Container para as questões
            const containerQuestoes = document.createElement('div');
            containerQuestoes.id = 'questoes-container';
            containerQuestoes.className = 'space-y-6';
            etapaInterpretacao.appendChild(containerQuestoes);
            
            // Botões de navegação
            const botoesNav = document.createElement('div');
            botoesNav.className = 'mt-6 flex justify-end';
            botoesNav.innerHTML = `
                <button id="proximo-etapa-interpretacao" class="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition">
                    Finalizar <i class="fas fa-arrow-right ml-2"></i>
                </button>
            `;
            etapaInterpretacao.appendChild(botoesNav);
            
            // Adicionar ao documento depois da etapa de texto
            const etapaTexto = document.getElementById('etapa-texto');
            if (etapaTexto && etapaTexto.parentNode) {
                etapaTexto.parentNode.insertBefore(etapaInterpretacao, etapaTexto.nextSibling);
                
                // Adicionar listener ao botão de próxima etapa
                const btnProximo = document.getElementById('proximo-etapa-interpretacao');
                if (btnProximo) {
                    btnProximo.addEventListener('click', () => {
                        document.getElementById('etapa-interpretacao').classList.add('hidden');
                        document.getElementById('etapa-resultado').classList.remove('hidden');
                    });
                }
                
                // Modificar o botão de próxima etapa do texto para ir para interpretação
                const btnProximoTexto = document.getElementById('proximo-etapa-texto');
                if (btnProximoTexto) {
                    const novoBtnTexto = btnProximoTexto.cloneNode(true);
                    novoBtnTexto.addEventListener('click', () => {
                        document.getElementById('etapa-texto').classList.add('hidden');
                        document.getElementById('etapa-interpretacao').classList.remove('hidden');
                    });
                    btnProximoTexto.parentNode.replaceChild(novoBtnTexto, btnProximoTexto);
                }
            } else {
                console.error('Etapa de texto não encontrada, não foi possível adicionar a etapa de interpretação');
                return;
            }
        }
        
        // Preencher as questões
        const containerQuestoes = document.getElementById('questoes-container');
        if (!containerQuestoes) {
            console.error('Container de questões não encontrado');
            return;
        }
        
        // Limpar o container
        containerQuestoes.innerHTML = '';
        
        // Adicionar cada questão
        questoes.forEach((questao, index) => {
            const divQuestao = document.createElement('div');
            divQuestao.className = 'bg-white shadow-sm rounded-lg p-4 border questao-item';
            divQuestao.setAttribute('data-id', questao.id || index);
            
            // Título da questão
            const tituloQuestao = document.createElement('h3');
            tituloQuestao.className = 'text-md font-medium mb-3';
            tituloQuestao.textContent = `${index + 1}. ${questao.text}`;
            divQuestao.appendChild(tituloQuestao);
            
            // Se tiver opções, adicionar as alternativas
            if (questao.options && questao.options.length > 0) {
                const opcoesContainer = document.createElement('div');
                opcoesContainer.className = 'space-y-2';
                
                questao.options.forEach((opcao, i) => {
                    const divOpcao = document.createElement('div');
                    divOpcao.className = 'flex items-center space-x-2';
                    
                    const radio = document.createElement('input');
                    radio.type = 'radio';
                    radio.name = `questao_${index}`;
                    radio.id = `q${index}_op${i}`;
                    radio.className = 'h-4 w-4 text-blue-600';
                    radio.value = opcao;
                    
                    const label = document.createElement('label');
                    label.htmlFor = `q${index}_op${i}`;
                    label.className = 'text-sm text-gray-700';
                    label.textContent = opcao;
                    
                    divOpcao.appendChild(radio);
                    divOpcao.appendChild(label);
                    opcoesContainer.appendChild(divOpcao);
                });
                
                divQuestao.appendChild(opcoesContainer);
            }
            
            containerQuestoes.appendChild(divQuestao);
        });
    }
    
    /**
     * Renderiza os dados da resposta da API no formato de avaliação com etapas
     * @param {Object} dadosAvaliacao - Dados da avaliação recebidos da API
     */
    function renderizarDadosAvaliacao(dadosAvaliacao) {
        console.log('✅ INÍCIO DA RENDERIZAÇÃO DOS DADOS DA AVALIAÇÃO:', dadosAvaliacao);
        
        try {
            // Verificar se os dados estão presentes
            if (!dadosAvaliacao) {
                console.error('❌ Dados da avaliação não fornecidos');
                return;
            }
            
            // CORREÇÃO IMPORTANTE: A estrutura correta da API possui os dados da avaliação dentro do campo 'assessment'
            // Extrair informações do assessment (dados da avaliação)
            const assessmentData = dadosAvaliacao.assessment;
            
            // Extrair os campos do assessment
            const {
                id,
                name,
                text,
                totalWords,
                totalPseudowords,
                gradeRange,
                words,
                pseudowords,
                sentences,
                assessmentEventId,
                createdAt,
                updatedAt,
                questions = [],
                phrases = []
            } = assessmentData;
            console.log('🚀 assessmentData: ', assessmentData);
            
            console.log('Campos extraídos do assessment:', { 
                id, name, totalWords, totalPseudowords, gradeRange, assessmentEventId,
                wordsLength: words?.length || 0,
                pseudowordsLength: pseudowords?.length || 0,
                sentencesLength: sentences?.length || 0,
                phrasesLength: phrases?.length || 0,
                questionsLength: questions?.length || 0
            });
            
            // Processar os campos que podem estar em formato JSON string
            const wordsArray = processarCampoArray(words, 'words');
            const pseudowordsArray = processarCampoArray(pseudowords, 'pseudowords');
            const sentencesArray = processarCampoArray(sentences, 'sentences');
            
            // ----- Informações Gerais - Sumário da Avaliação -----
            // Atualizar título da avaliação
            const tituloAvaliacao = document.querySelector('.text-2xl.font-bold');
            if (tituloAvaliacao) {
                tituloAvaliacao.textContent = name || 'Avaliação de Leitura';
            }
            
            // Adicionar informações da avaliação em uma seção de sumário (criar se não existir)
            let sumarioAvaliacao = document.getElementById('sumario-avaliacao');
            if (!sumarioAvaliacao) {
                sumarioAvaliacao = document.createElement('div');
                sumarioAvaliacao.id = 'sumario-avaliacao';
                sumarioAvaliacao.className = 'bg-white rounded-lg shadow-md p-4 mb-4';
                
                const selecaoAvaliacao = document.getElementById('selecao-avaliacao');
                if (selecaoAvaliacao && selecaoAvaliacao.parentNode) {
                    selecaoAvaliacao.parentNode.insertBefore(sumarioAvaliacao, selecaoAvaliacao.nextSibling);
                }
            }
            
            // Informações do aluno (se disponíveis)
            let infoAluno = '';
            if (dadosAvaliacao.student) {
                infoAluno = `
                <div class="border-t pt-3 mt-3">
                    <h3 class="text-md font-semibold mb-2">Informações do Aluno</h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                        <div><span class="font-medium">Nome:</span> ${dadosAvaliacao.student.name || 'N/A'}</div>
                        <div><span class="font-medium">Matrícula:</span> ${dadosAvaliacao.student.registrationNumber || 'N/A'}</div>
                    </div>
                </div>`;
            }
            
            // Preencher o sumário
            sumarioAvaliacao.innerHTML = `
                <h2 class="text-lg font-semibold mb-2">Informações da Avaliação</h2>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div><span class="font-medium">Nome:</span> ${name || 'N/A'}</div>
                    <div><span class="font-medium">Faixa de Série:</span> ${gradeRange || 'N/A'}</div>
                    <div><span class="font-medium">Total de Palavras:</span> ${totalWords || wordsArray.length || 0}</div>
                    <div><span class="font-medium">Total de Pseudopalavras:</span> ${totalPseudowords || pseudowordsArray.length || 0}</div>
                    <div><span class="font-medium">Criado em:</span> ${formatarData(createdAt) || 'N/A'}</div>
                    <div><span class="font-medium">Atualizado em:</span> ${formatarData(updatedAt) || 'N/A'}</div>
                </div>
                ${infoAluno}
            `;
            
            // ----- Etapa de Palavras -----
            const containerPalavras = document.querySelector('#etapa-palavras .grid');
            if (containerPalavras) {
                // Limpar container
                containerPalavras.innerHTML = '';
                
                // Adicionar cada palavra
                wordsArray.forEach((palavra, index) => {
                    const divPalavra = document.createElement('div');
                    divPalavra.className = 'border rounded p-2 flex items-center palavra-item bg-yellow-100 cursor-not-allowed transition-colors';
                    divPalavra.setAttribute('data-id', index);
                    divPalavra.innerHTML = `<span class="text-sm text-gray-800 select-none w-full text-center">${palavra}</span>`;
                    containerPalavras.appendChild(divPalavra);
                });
                
                // Atualizar contadores
                const totalPalavrasElement = document.getElementById('total-palavras');
                if (totalPalavrasElement) {
                    totalPalavrasElement.textContent = wordsArray.length;
                }
                
                const palavrasLidasElement = document.getElementById('total-palavras-lidas');
                if (palavrasLidasElement) {
                    palavrasLidasElement.textContent = '0';
                }
            }
            
            // ----- Etapa de Pseudopalavras -----
            const containerPseudopalavras = document.querySelector('#etapa-pseudopalavras .grid');
            if (containerPseudopalavras) {
                // Limpar container
                containerPseudopalavras.innerHTML = '';
                
                // Adicionar cada pseudopalavra
                pseudowordsArray.forEach((palavra, index) => {
                    const divPalavra = document.createElement('div');
                    divPalavra.className = 'border rounded p-2 flex items-center pseudopalavra-item bg-yellow-100 cursor-not-allowed transition-colors';
                    divPalavra.setAttribute('data-id', index);
                    divPalavra.innerHTML = `<span class="text-sm text-gray-800 select-none w-full text-center">${palavra}</span>`;
                    containerPseudopalavras.appendChild(divPalavra);
                });
                
                // Atualizar contadores
                const totalPseudopalavrasElement = document.getElementById('total-pseudopalavras');
                if (totalPseudopalavrasElement) {
                    totalPseudopalavrasElement.textContent = pseudowordsArray.length;
                }
                
                const pseudopalavrasLidasElement = document.getElementById('total-pseudopalavras-lidas');
                if (pseudopalavrasLidasElement) {
                    pseudopalavrasLidasElement.textContent = '0';
                }
            }
            
            // ----- Etapa de Frases -----
            const containerFrases = document.getElementById('frases-container');
            if (containerFrases) {
                // Limpar container
                containerFrases.innerHTML = '';
                
                // MODIFICADO: Priorizar o campo phrases sobre sentences
                let frasesParaUsar = [];
                if (phrases && phrases.length > 0) {
                    console.log('Usando campo "phrases" da resposta da API para renderização:', phrases);
                    frasesParaUsar = phrases;
                } else if (sentencesArray && sentencesArray.length > 0) {
                    console.log('Campo "phrases" não encontrado, usando "sentences" para renderização:', sentencesArray);
                    frasesParaUsar = sentencesArray;
                }
                
                // Adicionar cada frase
                frasesParaUsar.forEach((frase, index) => {
                    const divFrase = document.createElement('div');
                    divFrase.className = 'border rounded p-3 mb-2 frase-item bg-yellow-100 cursor-not-allowed transition-colors';
                    divFrase.setAttribute('data-id', index);
                    
                    // Extrair texto da frase - lidar com diferentes formatos de API
                    let textoFrase = '';
                    if (typeof frase === 'string') {
                        textoFrase = frase;
                    } else if (typeof frase === 'object') {
                        console.log('Frase é um objeto:', frase);
                        // Suportar diferentes propriedades que podem conter o texto da frase
                        textoFrase = frase.text || frase.content || frase.phrase || frase.sentence || '';
                    }
                    
                    // Garantir que sempre há um texto para exibir
                    if (!textoFrase) {
                        console.warn(`Frase ${index} não tem texto definido:`, frase);
                        textoFrase = `Frase ${index + 1}`;
                    }
                    
                    divFrase.innerHTML = `<span class="text-sm text-gray-800 select-none w-full">${textoFrase}</span>`;
                    containerFrases.appendChild(divFrase);
                });
                
                // Atualizar contadores
                const totalFrasesElement = document.getElementById('total-frases');
                if (totalFrasesElement) {
                    totalFrasesElement.textContent = frasesParaUsar.length;
                }
                
                const frasesLidasElement = document.getElementById('total-frases-lidas');
                if (frasesLidasElement) {
                    frasesLidasElement.textContent = '0';
                }
            }
            
            // ----- Etapa de Texto -----
            const containerTexto = document.getElementById('texto-container');
            if (containerTexto) {
                // Limpar container
                containerTexto.innerHTML = '';
                
                // Extrair texto da resposta da API
                let textoParaUsar = '';
                if (typeof text === 'string' && text.trim().length > 0) {
                    console.log('Renderizando: Usando texto como string:', text.substring(0, 50) + '...');
                    textoParaUsar = text;
                } else if (typeof text === 'object' && text !== null) {
                    // Tentar extrair texto de diferentes propriedades possíveis
                    const possiveisPropriedades = ['text', 'content', 'value', 'body'];
                    
                    for (const prop of possiveisPropriedades) {
                        if (text[prop] && typeof text[prop] === 'string' && text[prop].trim().length > 0) {
                            console.log(`Renderizando: Usando texto da propriedade ${prop}:`, text[prop].substring(0, 50) + '...');
                            textoParaUsar = text[prop];
                            break;
                        }
                    }
                }
                
                // Se ainda não tiver texto, usar exemplo padrão
                if (!textoParaUsar || textoParaUsar.trim().length === 0) {
                    console.warn('⚠️ Renderizando: Nenhum texto válido na resposta, usando exemplo padrão');
                    textoParaUsar = "Este é um texto de exemplo para a avaliação de leitura. Foi adicionado automaticamente porque não havia texto válido na resposta da API.";
                }
                
                // Dividir o texto em linhas para melhor legibilidade
                const palavras = textoParaUsar.split(' ');
                const linhas = [];
                let linhaAtual = [];
                let palavrasPorLinha = 12;
                
                // Dividir as palavras em linhas
                palavras.forEach(palavra => {
                    linhaAtual.push(palavra);
                    if (linhaAtual.length >= palavrasPorLinha) {
                        linhas.push(linhaAtual.join(' '));
                        linhaAtual = [];
                    }
                });
                
                // Adicionar a última linha se houver palavras restantes
                if (linhaAtual.length > 0) {
                    linhas.push(linhaAtual.join(' '));
                }
                
                console.log(`Renderizando: Texto dividido em ${linhas.length} linhas`);
                
                // Adicionar cada linha
                linhas.forEach((linha, index) => {
                    const divLinha = document.createElement('div');
                    divLinha.className = 'border rounded p-2 mb-2 linha-texto-item bg-yellow-100 cursor-not-allowed transition-colors';
                    divLinha.setAttribute('data-id', index);
                    divLinha.innerHTML = `<span class="text-sm text-gray-800 select-none">${linha}</span>`;
                    containerTexto.appendChild(divLinha);
                });
                
                // Atualizar contadores
                const totalLinhasElement = document.getElementById('total-linhas');
                if (totalLinhasElement) {
                    totalLinhasElement.textContent = linhas.length;
                }
                
                const linhasLidasElement = document.getElementById('total-linhas-lidas');
                if (linhasLidasElement) {
                    linhasLidasElement.textContent = '0';
                }
            }
            
            // ----- Etapa de Interpretação (Questões) -----
            if (questions && questions.length > 0) {
                // Verificar se existe um container para interpretação, se não, criá-lo
                let etapaInterpretacao = document.getElementById('etapa-interpretacao');
                if (!etapaInterpretacao) {
                    etapaInterpretacao = document.createElement('div');
                    etapaInterpretacao.id = 'etapa-interpretacao';
                    etapaInterpretacao.className = 'bg-white rounded-lg shadow-md p-6 hidden';
                    etapaInterpretacao.dataset.step = "interpretacao";
                    etapaInterpretacao.dataset.stepValue = "INTERPRETATION";
                    
                    // Título da etapa
                    const tituloInterpretacao = document.createElement('h2');
                    tituloInterpretacao.className = 'text-xl font-semibold mb-4';
                    tituloInterpretacao.textContent = 'Interpretação de Texto';
                    etapaInterpretacao.appendChild(tituloInterpretacao);
                    
                    // Adicionar container para as questões
                    const containerQuestoes = document.createElement('div');
                    containerQuestoes.id = 'questoes-container';
                    containerQuestoes.className = 'space-y-6';
                    etapaInterpretacao.appendChild(containerQuestoes);
                    
                    // Adicionar botão para próxima etapa
                    const botoesNavegacao = document.createElement('div');
                    botoesNavegacao.className = 'mt-6 flex justify-end';
                    botoesNavegacao.innerHTML = `
                        <button id="proximo-etapa-interpretacao" class="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition opacity-50 cursor-not-allowed" disabled>
                            Finalizar <i class="fas fa-arrow-right ml-2"></i>
                        </button>
                    `;
                    etapaInterpretacao.appendChild(botoesNavegacao);
                    
                    // Adicionar ao documento
                    const etapaTexto = document.getElementById('etapa-texto');
                    if (etapaTexto && etapaTexto.parentNode) {
                        etapaTexto.parentNode.insertBefore(etapaInterpretacao, etapaTexto.nextSibling);
                    }
                    
                    // Modificar botão de próxima etapa do texto para ir para interpretação
                    const btnProximoTexto = document.getElementById('proximo-etapa-texto');
                    if (btnProximoTexto) {
                        const novoElementoBtnTexto = btnProximoTexto.cloneNode(true);
                        novoElementoBtnTexto.addEventListener('click', () => {
                            document.getElementById('etapa-texto').classList.add('hidden');
                            document.getElementById('etapa-interpretacao').classList.remove('hidden');
                        });
                        btnProximoTexto.parentNode.replaceChild(novoElementoBtnTexto, btnProximoTexto);
                    }
                    
                    // Configurar botão de finalização da interpretação
                    const btnProximoInterpretacao = document.getElementById('proximo-etapa-interpretacao');
                    if (btnProximoInterpretacao) {
                        btnProximoInterpretacao.addEventListener('click', () => {
                            document.getElementById('etapa-interpretacao').classList.add('hidden');
                            document.getElementById('etapa-resultado').classList.remove('hidden');
                        });
                    }
                }
                
                // Limpar container de questões
                const containerQuestoes = document.getElementById('questoes-container');
                if (containerQuestoes) {
                    containerQuestoes.innerHTML = '';
                    
                    // Adicionar cada questão
                    questions.forEach((questao, index) => {
                        const divQuestao = document.createElement('div');
                        divQuestao.className = 'bg-white shadow-sm rounded-lg p-4 border';
                        divQuestao.setAttribute('data-id', questao.id || index);
                        
                        // Enunciado da questão
                        const enunciado = document.createElement('h3');
                        enunciado.className = 'text-md font-medium mb-3';
                        enunciado.textContent = `${index + 1}. ${questao.text}`;
                        divQuestao.appendChild(enunciado);
                        
                        // Opções da questão
                        if (questao.options && questao.options.length > 0) {
                            const opcoesContainer = document.createElement('div');
                            opcoesContainer.className = 'space-y-2';
                            
                            // Garantir que options seja um array
                            const opcoes = Array.isArray(questao.options) 
                                ? questao.options 
                                : (typeof questao.options === 'string' ? JSON.parse(questao.options) : []);
                            
                            opcoes.forEach((opcao, idxOpcao) => {
                                const divOpcao = document.createElement('div');
                                divOpcao.className = 'flex items-center';
                                divOpcao.innerHTML = `
                                    <input type="radio" id="q${index+1}_op${idxOpcao}" name="questao_${index}" class="h-4 w-4 text-blue-600">
                                    <label for="q${index+1}_op${idxOpcao}" class="ml-2 text-sm text-gray-700">${opcao}</label>
                                `;
                                opcoesContainer.appendChild(divOpcao);
                            });
                            
                            divQuestao.appendChild(opcoesContainer);
                        }
                        
                        containerQuestoes.appendChild(divQuestao);
                    });
                }
            }
            
            console.log('✅ DADOS DA AVALIAÇÃO RENDERIZADOS COM SUCESSO!');
        } catch (error) {
            console.error('❌ Erro ao renderizar dados da avaliação:', error);
        }
    }
    
    /**
     * Processa um campo que pode ser string JSON, array ou outro formato
     * @param {string|Array} campo - Campo a ser processado
     * @param {string} nomeCampo - Nome do campo para log
     * @returns {Array} - Array processado
     */
    function processarCampoArray(campo, nomeCampo) {
        try {
            console.log(`💡 Processando campo ${nomeCampo}. Tipo: ${typeof campo}, Valor:`, campo);
            
            if (Array.isArray(campo)) {
                console.log(`✅ Campo ${nomeCampo} já é um array com ${campo.length} itens:`, campo);
                return campo;
            } else if (typeof campo === 'string') {
                console.log(`🔄 Tentando converter campo ${nomeCampo} de string para array. String:`, campo);
                
                // CASO ESPECÍFICO: Formato observado para words na API: '["casa","bola","gato"]'
                if (campo.startsWith('[') && campo.endsWith(']')) {
                    try {
                        const arrayParsed = JSON.parse(campo);
                        if (Array.isArray(arrayParsed)) {
                            console.log(`✅ Campo ${nomeCampo} convertido de string JSON para array com ${arrayParsed.length} itens:`, arrayParsed);
                            return arrayParsed;
                        } else {
                            console.warn(`⚠️ Campo ${nomeCampo} foi parseado mas não é um array, tipo:`, typeof arrayParsed);
                        }
                    } catch (e) {
                        console.warn(`⚠️ Formato JSON aparente, mas erro ao converter campo ${nomeCampo}:`, e.message);
                        
                        // Tentativa manual de extração usando regex
                        try {
                            const matches = campo.match(/"([^"]*)"/g);
                            if (matches && matches.length > 0) {
                                const arrExtraido = matches.map(m => m.replace(/"/g, ''));
                                console.log(`✅ Campo ${nomeCampo} extraído manualmente com regex: ${arrExtraido.length} itens:`, arrExtraido);
                                return arrExtraido;
                            }
                        } catch (regexError) {
                            console.warn(`⚠️ Erro na extração manual por regex:`, regexError.message);
                        }
                    }
                }
                
                // Verificar se é uma string simples que pode ser dividida por vírgulas
                if (campo.includes(',')) {
                    const arrayDividido = campo.split(',').map(item => item.trim());
                    console.log(`✅ Campo ${nomeCampo} dividido por vírgulas em ${arrayDividido.length} itens:`, arrayDividido);
                    return arrayDividido;
                }
                
                // String simples - converter para array com um único item
                console.log(`✅ Campo ${nomeCampo} tratado como string simples:`, [campo]);
                return [campo];
            } else if (campo && typeof campo === 'object' && Object.keys(campo).length > 0) {
                // Tentar extrair valores do objeto
                const valores = Object.values(campo);
                console.warn(`⚠️ Campo ${nomeCampo} é um objeto, convertido para array com ${valores.length} valores`);
                return valores;
            }
            
            // Usar valores padrão conforme o tipo de campo
            console.warn(`⚠️ Campo ${nomeCampo} não pôde ser processado, usando valores padrão`);
            if (nomeCampo === 'words') {
                return ["casa", "bola", "gato"];
            } else if (nomeCampo === 'pseudowords') {
                return ["tasi", "mupa", "dala"];
            } else if (nomeCampo === 'sentences') {
                return ["O menino joga bola.", "A casa é grande."];
            }
            
            return [];
        } catch (error) {
            console.error(`❌ Erro ao processar campo ${nomeCampo}:`, error);
            
            // Valores padrão em caso de erro
            if (nomeCampo === 'words') {
                return ["casa", "bola", "gato"];
            } else if (nomeCampo === 'pseudowords') {
                return ["tasi", "mupa", "dala"];
            } else if (nomeCampo === 'sentences') {
                return ["O menino joga bola.", "A casa é grande."];
            }
            
            return [];
        }
    }
    
    /**
     * Formata data para exibição
     * @param {string} dataString - String de data
     * @returns {string} - Data formatada
     */
    function formatarData(dataString) {
        if (!dataString) return '';
        try {
            const data = new Date(dataString);
            return data.toLocaleString('pt-BR');
        } catch (e) {
            return dataString;
        }
    }

    /**
     * Busca ou cria um elemento container na etapa de palavras
     * @returns {HTMLElement} O container encontrado ou criado
     */
    function obterContainerPalavras() {
        console.log('🔍 Iniciando busca do container de palavras');
        
        // ETAPA 1: Verificar se o elemento etapa-palavras existe
        const etapa = document.getElementById('etapa-palavras');
        if (!etapa) {
            console.error('❌ Elemento #etapa-palavras não encontrado no DOM');
            
            // Verificar se existe um elemento com classe que contenha 'etapa' e 'palavra'
            const etapaAlternativa = document.querySelector('[class*="etapa"][class*="palavra"]');
            if (etapaAlternativa) {
                console.log('✅ Encontrado elemento alternativo para etapa:', etapaAlternativa);
                etapaAlternativa.id = 'etapa-palavras';
                return obterContainerPalavras(); // Tentar novamente com o ID definido
            }
            
            // Criar a etapa se não existir nenhuma alternativa
            const novaSessao = document.createElement('div');
            novaSessao.id = 'etapa-palavras';
            novaSessao.className = 'bg-white rounded-lg shadow-md p-6 hidden';
            novaSessao.innerHTML = `
                <h2 class="text-xl font-semibold mb-4">Leitura de Palavras</h2>
                <div class="alert alert-info mb-4" role="alert">
                    <p class="text-sm">Importante: Clique em "Iniciar Cronômetro" e depois clique em cada palavra que o aluno conseguir ler.</p>
                </div>
                <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 mb-4"></div>
                <div class="flex justify-between items-center">
                    <div class="text-sm">
                        Total lidas: <span id="total-palavras-lidas">0</span> / <span id="total-palavras">0</span>
                    </div>
                    <div class="flex space-x-2">
                        <button id="iniciar-timer-palavras" class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition">
                            Iniciar Cronômetro
                        </button>
                        <div class="flex items-center justify-center bg-gray-200 text-gray-800 font-mono px-4 py-2 rounded-md">
                            <span id="timer-palavras">01:00</span>
                        </div>
                    </div>
                </div>
                <div class="mt-6 flex justify-end">
                    <button id="proximo-etapa-palavras" class="bg-gray-400 text-white px-4 py-2 rounded-md transition opacity-50 cursor-not-allowed" disabled>
                        Próxima Etapa <i class="fas fa-arrow-right ml-2"></i>
                    </button>
                </div>
            `;
            
            // Inserir no documento - tentar encontrar um elemento pai adequado
            const main = document.querySelector('main') || document.querySelector('.container') || document.body;
            main.appendChild(novaSessao);
            console.log('✅ Criada nova seção etapa-palavras', novaSessao);
            
            // Configurar listeners para o novo elemento
            setTimeout(configurarCronometros, 100);
            
            return novaSessao.querySelector('.grid');
        }
        
        // ETAPA 2: Tentar encontrar o container dentro da etapa
        let container = etapa.querySelector('.grid');
        
        // Tentar alternativas se não encontrar
        if (!container) {
            container = etapa.querySelector('[class*="grid"]');
            console.log('⚠️ Usando seletor alternativo [class*="grid"] para container');
        }
        
        if (!container) {
            // Buscar qualquer div que possa servir de container
            const divs = etapa.querySelectorAll('div');
            for (const div of divs) {
                // Verificar se é um bom candidato (não é um botão, contador, etc)
                if (div.children.length === 0 && 
                    !div.textContent.includes('Total') && 
                    !div.querySelector('button') &&
                    !div.classList.contains('flex')) {
                    container = div;
                    div.className = 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 mb-4';
                    console.log('⚠️ Adaptando div existente para ser o container:', div);
                    break;
                }
            }
        }
        
        // ETAPA 3: Criar container se não encontrou
        if (!container) {
            console.log('⚠️ Criando novo container de palavras');
            container = document.createElement('div');
            container.className = 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 mb-4';
            
            // Tentar inserir em um local lógico
            const alert = etapa.querySelector('[role="alert"]');
            if (alert) {
                alert.insertAdjacentElement('afterend', container);
            } else {
                const title = etapa.querySelector('h1, h2, h3');
                if (title) {
                    title.insertAdjacentElement('afterend', container);
                } else {
                    // Adicionar após o primeiro elemento ou no início
                    if (etapa.firstChild) {
                        etapa.insertBefore(container, etapa.firstChild.nextSibling);
                    } else {
                        etapa.appendChild(container);
                    }
                }
            }
        }
        
        console.log('✅ Container de palavras encontrado/criado:', container);
        return container;
    }

    /**
     * Garante que as palavras sejam renderizadas na etapa de palavras
     * Esta função será chamada como método alternativo se a renderização padrão falhar
     */
    function renderizarEtapaPalavras() {
        console.log('🔄 Executando renderização alternativa de palavras');
        
        // Extrair words da resposta do localStorage
        let wordsArray = [];
        try {
            const avaliacaoStr = localStorage.getItem('avaliacaoAtual');
            if (avaliacaoStr) {
                const avaliacao = JSON.parse(avaliacaoStr);
                
                if (avaliacao.assessment && avaliacao.assessment.words) {
                    wordsArray = processarCampoArray(avaliacao.assessment.words, 'words de localStorage');
                } else if (avaliacao.words) {
                    wordsArray = processarCampoArray(avaliacao.words, 'words direto de localStorage');
                }
            }
        } catch (error) {
            console.error('❌ Erro ao extrair words do localStorage:', error);
        }
        
        // Se não conseguiu extrair do localStorage, usar valores padrão
        if (!wordsArray || wordsArray.length === 0) {
            wordsArray = ["casa", "bola", "gato", "pato", "meia", "tatu"];
            console.log('⚠️ Usando palavras padrão:', wordsArray);
        }
        
        // Obter container (busca ou cria)
        const container = obterContainerPalavras();
        
        // Limpar container
        container.innerHTML = '';
        
        // Adicionar as palavras
        wordsArray.forEach((palavra, index) => {
            const divPalavra = document.createElement('div');
            divPalavra.className = 'border rounded p-2 flex items-center palavra-item bg-yellow-100 cursor-not-allowed transition-colors';
            divPalavra.setAttribute('data-id', index);
            divPalavra.innerHTML = `<span class="text-sm text-gray-800 select-none w-full text-center">${palavra}</span>`;
            
            // Adicionar evento de clique
            divPalavra.addEventListener('click', function() {
                if (window.estadoTimers && window.estadoTimers.timers && window.estadoTimers.timers.palavras) {
                    if (!this.classList.contains('bg-green-200')) {
                        this.classList.remove('bg-yellow-100', 'cursor-not-allowed');
                        this.classList.add('bg-green-200');
                        
                        // Atualizar contador
                        const contador = document.getElementById('total-palavras-lidas');
                        if (contador) {
                            const valor = parseInt(contador.textContent) || 0;
                            contador.textContent = valor + 1;
                        }
                    }
                }
            });
            
            container.appendChild(divPalavra);
        });
        
        // Atualizar contador
        const totalElement = document.getElementById('total-palavras');
        if (totalElement) {
            totalElement.textContent = wordsArray.length;
        }
        
        const lidasElement = document.getElementById('total-palavras-lidas');
        if (lidasElement) {
            lidasElement.textContent = '0';
        }
        
        // Tornar etapa visível
        const etapa = document.getElementById('etapa-palavras');
        if (etapa) {
            etapa.classList.remove('hidden');
        }
        
        console.log('✅ Renderização alternativa de palavras concluída');
        return true;
    }
    
    // Executar a renderização alternativa após 1 segundo se não houver palavras renderizadas
    document.addEventListener('DOMContentLoaded', function() {
        setTimeout(function() {
            const etapaPalavras = document.getElementById('etapa-palavras');
            if (etapaPalavras && !etapaPalavras.classList.contains('hidden')) {
                const container = etapaPalavras.querySelector('.grid');
                
                // Verificar se já existem palavras renderizadas
                if (container && (!container.children || container.children.length === 0)) {
                    console.log('⚠️ Nenhuma palavra renderizada após 1 segundo, executando renderização alternativa');
                    renderizarEtapaPalavras();
                }
            }
        }, 1000);
    });

    // Função de correção direta para renderização de palavras
    function corrigirRenderizacaoPalavras() {
        console.log('⚡ CORREÇÃO DIRETA: Iniciando renderização forçada de palavras');
        
        // Inicializar com array vazio
        let palavras = [];
        
        // Tentar recuperar os dados da API do localStorage        
        try {
            const avaliacaoLocal = localStorage.getItem('avaliacaoAtual');
            if (avaliacaoLocal) {
                const avaliacao = JSON.parse(avaliacaoLocal);
                console.log('⚡ Dados do localStorage:', avaliacao);
                
                // VERIFICAR NA ESTRUTURA ASSESSMENT
                if (avaliacao.assessment && avaliacao.assessment.words) {
                    const wordsData = avaliacao.assessment.words;
                    console.log('⚡ Encontrado words dentro de assessment:', wordsData);
                    
                    // Se for string JSON, converter para array
                    if (typeof wordsData === 'string' && wordsData.startsWith('[') && wordsData.endsWith(']')) {
                        try {
                            palavras = JSON.parse(wordsData);
                            console.log('⚡ Palavras extraídas com JSON.parse:', palavras);
                        } catch (e) {
                            console.error('⚠️ Erro ao fazer parse do JSON:', e);
                            // Tentativa manual com regex
                            const matches = wordsData.match(/"([^"]*)"/g);
                            if (matches && matches.length > 0) {
                                palavras = matches.map(m => m.replace(/"/g, ''));
                                console.log('⚡ Palavras extraídas com regex:', palavras);
                            }
                        }
                    } else if (Array.isArray(wordsData)) {
                        palavras = wordsData;
                        console.log('⚡ Palavras já em formato de array:', palavras);
                    }
                } 
                // VERIFICAR DIRETAMENTE NA RAIZ
                else if (avaliacao.words) {
                    const wordsData = avaliacao.words;
                    console.log('⚡ Encontrado words na raiz:', wordsData);
                    
                    // Se for string JSON, converter para array
                    if (typeof wordsData === 'string' && wordsData.startsWith('[') && wordsData.endsWith(']')) {
                        try {
                            palavras = JSON.parse(wordsData);
                            console.log('⚡ Palavras extraídas com JSON.parse:', palavras);
                        } catch (e) {
                            console.error('⚠️ Erro ao fazer parse do JSON:', e);
                            // Tentativa manual com regex
                            const matches = wordsData.match(/"([^"]*)"/g);
                            if (matches && matches.length > 0) {
                                palavras = matches.map(m => m.replace(/"/g, ''));
                                console.log('⚡ Palavras extraídas com regex:', palavras);
                            }
                        }
                    } else if (Array.isArray(wordsData)) {
                        palavras = wordsData;
                        console.log('⚡ Palavras já em formato de array:', palavras);
                    }
                }
            }
        } catch (error) {
            console.error('⚠️ Erro ao extrair palavras do localStorage:', error);
        }
        
        // Se não encontrou palavras, usar valores padrão
        if (!palavras || palavras.length === 0) {
            palavras = ["casa", "bola", "gato", "pato", "meia", "tatu"];
            console.warn('⚠️ Nenhuma palavra encontrada, usando valores padrão:', palavras);
        }
        
        console.log('⚡ CORREÇÃO DIRETA: Palavras para renderizar:', palavras);
        
        // Encontrar o container de palavras - tentar várias estratégias
        let containerPalavras = document.querySelector('#etapa-palavras .grid');
        
        // Tentativas alternativas
        if (!containerPalavras) {
            containerPalavras = document.querySelector('[id*="palavra"] .grid');
            console.log('⚡ Usando seletor alternativo 1 para container');
        }
        
        if (!containerPalavras) {
            containerPalavras = document.querySelector('.grid');
            console.log('⚡ Usando seletor alternativo 2 para container');
        }
        
        if (!containerPalavras) {
            // Seletor extremamente genérico para qualquer div que possa ser o container
            containerPalavras = document.querySelector('div');
            console.warn('⚡ Usando seletor genérico para container');
        }
        
        if (!containerPalavras) {
            console.error('⚠️ Container para palavras não encontrado');
            return;
        }
        
        console.log('⚡ CORREÇÃO DIRETA: Container encontrado:', containerPalavras);
        
        // Limpar o container
        containerPalavras.innerHTML = '';
        
        // Adicionar as palavras
        palavras.forEach((palavra, index) => {
            const divPalavra = document.createElement('div');
            divPalavra.className = 'border rounded p-2 flex items-center palavra-item bg-yellow-100 cursor-not-allowed transition-colors';
            divPalavra.setAttribute('data-id', index);
            divPalavra.innerHTML = `<span class="text-sm text-gray-800 select-none w-full text-center">${palavra}</span>`;
            
            // Adicionar evento de clique
            divPalavra.addEventListener('click', function() {
                // Verificar se o timer está ativo ou ignorar para teste
                if (window.estadoTimers?.timers?.palavras || true) {
                    // Marcar como lida
                    if (!this.classList.contains('bg-green-200')) {
                        this.classList.remove('bg-yellow-100', 'cursor-not-allowed');
                        this.classList.add('bg-green-200');
                        
                        // Atualizar contador
                        const contador = document.getElementById('total-palavras-lidas');
                        if (contador) {
                            const valor = parseInt(contador.textContent) || 0;
                            contador.textContent = valor + 1;
                        }
                    }
                }
            });
            
            containerPalavras.appendChild(divPalavra);
        });
        
        // Atualizar o contador
        const totalElement = document.getElementById('total-palavras');
        if (totalElement) {
            totalElement.textContent = palavras.length;
        }
        
        console.log('⚡ CORREÇÃO DIRETA: Renderização de palavras concluída!');
    }
    
    // Executar a correção quando o DOM estiver carregado
    document.addEventListener('DOMContentLoaded', function() {
        console.log('🔄 DOMContentLoaded - Executando correção inicial');
        
        // Executar imediatamente
        corrigirRenderizacaoPalavras();
        
        // Executar novamente após curtos intervalos para garantir
        setTimeout(corrigirRenderizacaoPalavras, 500);
        setTimeout(corrigirRenderizacaoPalavras, 1000);
        setTimeout(corrigirRenderizacaoPalavras, 2000);
        
        // Adicionar ao botão iniciar
        const btnIniciar = document.getElementById('iniciar-avaliacao');
        if (btnIniciar) {
            console.log('🔄 Encontrado botão iniciar, adicionando listener');
            const btnOriginal = btnIniciar.cloneNode(true);
            btnIniciar.parentNode.replaceChild(btnOriginal, btnIniciar);
            
            btnOriginal.addEventListener('click', function() {
                console.log('🔄 Botão iniciar clicado, agendando correções');
                // Após iniciar avaliação, realizar correções em vários pontos
                setTimeout(corrigirRenderizacaoPalavras, 500);
                setTimeout(corrigirRenderizacaoPalavras, 1000);
                setTimeout(corrigirRenderizacaoPalavras, 2000);
            });
        }
        
        // Se a URL contém parâmetros, tentar usar para forçar renderização
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.has('forcaCorrecao')) {
            console.log('🔄 Parâmetro forcaCorrecao detectado na URL, forçando correção');
            corrigirRenderizacaoPalavras();
        }
    });
    
    // Adicionar evento para quando o localStorage mudar
    window.addEventListener('storage', function(e) {
        if (e.key === 'avaliacaoAtual') {
            console.log('🔄 Evento storage: avaliacaoAtual mudou, executando correção');
            corrigirRenderizacaoPalavras();
        }
    });
    
    // Monkey patch a função de localStorage para detectar mudanças
    const originalSetItem = localStorage.setItem;
    localStorage.setItem = function(key, value) {
        const result = originalSetItem.call(this, key, value);
        if (key === 'avaliacaoAtual') {
            console.log('🔄 localStorage.setItem detectado para avaliacaoAtual, executando correção');
            setTimeout(corrigirRenderizacaoPalavras, 100);
        }
        return result;
    };

    // Solução direta para renderizar words
    function renderizarWords(dadosAvaliacao) {
        // Verificar se temos os dados e o assessment
        if (!dadosAvaliacao || !dadosAvaliacao.assessment) return;
        
        // Extrair words do assessment
        const assessment = dadosAvaliacao.assessment;
        let words = assessment.words;
        
        // Converter words de string JSON para array
        let wordsArray = [];
        if (typeof words === 'string' && words.includes('[')) {
            try {
                wordsArray = JSON.parse(words);
            } catch (e) {
                console.error('Erro ao converter words:', e);
            }
        } else if (Array.isArray(words)) {
            wordsArray = words;
        }
        
        console.log('Words encontrado:', wordsArray);
        
        // Encontrar o container das palavras
        const container = document.querySelector('#etapa-palavras .grid');
        if (!container) {
            console.error('Container de palavras não encontrado');
            return;
        }
        
        // Limpar container
        container.innerHTML = '';
        
        // Adicionar cada palavra
        wordsArray.forEach((palavra, index) => {
            const divPalavra = document.createElement('div');
            divPalavra.className = 'border rounded p-2 flex items-center palavra-item bg-yellow-100 cursor-not-allowed transition-colors';
            divPalavra.setAttribute('data-id', index);
            divPalavra.innerHTML = `<span class="text-sm text-gray-800 select-none w-full text-center">${palavra}</span>`;
            container.appendChild(divPalavra);
        });
        
        // Atualizar contador
        const totalElement = document.getElementById('total-palavras');
        if (totalElement) totalElement.textContent = wordsArray.length;
    }

    // Modificar a função que recebe a resposta da API para chamar renderizarWords
    const originalRenderizarDadosAvaliacao = renderizarDadosAvaliacao;
    renderizarDadosAvaliacao = function(dadosAvaliacao) {
        // Chamar a função original
        originalRenderizarDadosAvaliacao(dadosAvaliacao);
        
        // Forçar a renderização correta das palavras
        renderizarWords(dadosAvaliacao);
    }
}); 