/**
 * Arquivo responsável por manipular a interface de criação de testes de leitura
 */

document.addEventListener('DOMContentLoaded', function () {
    console.log('Script de criação de testes de leitura carregado');

    const btnSalvarAvaliacao = document.getElementById('btn-salvar-avaliacao');
    const nomeAvaliacao = document.getElementById('nome-avaliacao');
    const textoAvaliacao = document.getElementById('texto-avaliacao');
    const palavras = document.getElementById('adicionar-palavra');
    const pseudopalavras = document.getElementById('adicionar-pseudopalavra');
    const novaPalavra = document.getElementById('nova-palavra');
    const novaPseudopalavra = document.getElementById('nova-pseudopalavra');
    const novaFrase = document.getElementById('nova-frase');
    const novaSentenca = document.getElementById('nova-sentenca');
    const adicionarSentenca = document.getElementById('adicionar-sentenca');
    const adicionarFrase = document.getElementById('adicionar-frase');

    const listas = {
        palavras: {
            listaDom: document.getElementById('lista-palavras'),
            inputDom: novaPalavra,
            classeItem: 'palavra-item',
            propriedade: 'words'
        },
        pseudopalavras: {
            listaDom: document.getElementById('lista-pseudopalavras'),
            inputDom: novaPseudopalavra,
            classeItem: 'pseudopalavra-item',
            propriedade: 'pseudowords'
        },
        sentencas: {
            listaDom: document.getElementById('lista-sentencas'),
            inputDom: novaSentenca,
            classeItem: 'sentenca-item',
            propriedade: 'sentences'
        },
        frases: {
            listaDom: document.getElementById('lista-frases'),
            inputDom: novaFrase,
            classeItem: 'frase-item',
            propriedade: 'phrases'
        }
    };

    const dadosAvaliacao = {
        name: null,
        words: [],
        pseudowords: [],
        gradeRange: null,
        totalWords: 0,
        totalPseudowords: 0,
        sentences: [],
        phrases: [],
        text: null,
        questions: [],
    }

    const definirNomeDaAvaliacao = () => {
        const avaliacao = nomeAvaliacao.value;
        dadosAvaliacao.name = avaliacao;
    }

    const definirTexto = () => {
        const texto = textoAvaliacao.value.trim();
        dadosAvaliacao.text = texto;
    }

    const adicionarPalavras = () => {
        const entrada = novaPalavra.value.trim();
        if (entrada !== '') {
            // Dividir a entrada por vírgulas para permitir adição múltipla
            const palavras = entrada.split(',').map(p => p.trim()).filter(p => p !== '');
            
            // Adicionar cada palavra individualmente
            palavras.forEach(palavra => {
                if (!dadosAvaliacao.words.includes(palavra)) {
                    adicionarItem('palavras', palavra);
                }
            });
            
            novaPalavra.value = '';
            novaPalavra.focus();
        }
    }

    const adicionarPseudopalavras = () => {
        const entrada = novaPseudopalavra.value.trim();
        if (entrada !== '') {
            // Dividir a entrada por vírgulas para permitir adição múltipla
            const pseudopalavras = entrada.split(',').map(p => p.trim()).filter(p => p !== '');
            
            // Adicionar cada pseudopalavra individualmente
            pseudopalavras.forEach(pseudopalavra => {
                if (!dadosAvaliacao.pseudowords.includes(pseudopalavra)) {
                    adicionarItem('pseudopalavras', pseudopalavra);
                }
            });
            
            novaPseudopalavra.value = '';
            novaPseudopalavra.focus();
        }
    }

    const adicionarSentencas = () => {
        const entrada = novaSentenca.value.trim();
        if (entrada !== '') {
            // Dividir a entrada por vírgulas para permitir adição múltipla
            const sentencas = entrada.split(',').map(s => s.trim()).filter(s => s !== '');
            
            // Adicionar cada sentença individualmente
            sentencas.forEach(sentenca => {
                if (!dadosAvaliacao.sentences.includes(sentenca)) {
                    adicionarItem('sentencas', sentenca);
                }
            });
            
            novaSentenca.value = '';
            novaSentenca.focus();
        }
    }

    const adicionarFrases = () => {
        const entrada = novaFrase.value.trim();
        if (entrada !== '') {
            // Dividir a entrada por pontos para permitir adição múltipla
            // Preservar os pontos no final das frases
            const frases = entrada.split('.').map(f => f.trim()).filter(f => f !== '');
            
            // Adicionar cada frase individualmente (adicionando o ponto final se não existir)
            frases.forEach(frase => {
                // Adicionar ponto final se não tiver
                if (!/[.!?]$/.test(frase)) {
                    frase = frase + '.';
                }
                
                const fraseExiste = dadosAvaliacao.phrases.some(f => 
                    (typeof f === 'object' && f.text === frase) || f === frase
                );
                
                if (!fraseExiste) {
                    adicionarItem('frases', frase);
                }
            });
            
            novaFrase.value = '';
            novaFrase.focus();
        }
    }

    const adicionarItem = (tipoLista, texto) => {
        const config = listas[tipoLista];
        
        if (!config || !config.listaDom) {
            console.warn(`Lista ${tipoLista} não encontrada`);
            return;
        }
        
        if (tipoLista === 'frases') {
            dadosAvaliacao[config.propriedade].push({ text: texto });
        } else {
            dadosAvaliacao[config.propriedade].push(texto);
        }
        
        const item = document.createElement('div');
        item.className = `${config.classeItem} bg-white border border-gray-300 px-3 py-1 rounded-full text-sm flex items-center hover:bg-blue-100 cursor-pointer transition-colors select-none`;
        item.dataset.valor = texto;
        item.dataset.selecionado = "false";
        
        const checkbox = document.createElement('span');
        checkbox.className = 'inline-block w-4 h-4 border border-gray-400 rounded mr-2 flex-shrink-0 transition-colors';
        checkbox.innerHTML = '<i class="fas fa-check text-white text-xs hidden"></i>';
        
        const textoSpan = document.createElement('span');
        textoSpan.textContent = texto;
        textoSpan.className = 'flex-grow';
        
        item.appendChild(checkbox);
        item.appendChild(textoSpan);
        
        item.addEventListener('click', function(e) {
            if (e.target.closest('button.btn-remover')) return;
            
            if (item.dataset.selecionado === "false") {
                item.dataset.selecionado = "true";
                item.classList.remove('bg-white', 'hover:bg-blue-100');
                item.classList.add('bg-green-100');
                checkbox.classList.add('bg-green-500');
                checkbox.classList.remove('border-gray-400');
                checkbox.querySelector('i').classList.remove('hidden');
            } else {
                item.dataset.selecionado = "false";
                item.classList.remove('bg-green-100');
                item.classList.add('bg-white', 'hover:bg-blue-100');
                checkbox.classList.remove('bg-green-500');
                checkbox.classList.add('border-gray-400');
                checkbox.querySelector('i').classList.add('hidden');
            }
            
            atualizarContagemSelecionados(tipoLista);
        });
        
        const botaoRemover = document.createElement('button');
        botaoRemover.className = 'ml-2 text-gray-500 hover:text-red-600 btn-remover flex-shrink-0';
        botaoRemover.innerHTML = '<i class="fas fa-times-circle"></i>';
        botaoRemover.onclick = function (e) {
            e.stopPropagation();
            removerItem(tipoLista, item);
        };
        
        item.appendChild(botaoRemover);
        config.listaDom.appendChild(item);
        
        atualizarContagemSelecionados(tipoLista);
        
        return item;
    }
    
    const removerItem = (tipoLista, itemElement) => {
        const config = listas[tipoLista];
        const valor = itemElement.dataset.valor;
        
        // Remover do DOM
        itemElement.remove();
        
        // Remover do modelo de dados com base no tipo de lista
        if (tipoLista === 'frases') {
            // Para frases, remove objetos com propriedade text igual ao valor
            dadosAvaliacao[config.propriedade] = dadosAvaliacao[config.propriedade].filter(f => {
                if (typeof f === 'object' && f.text === valor) {
                    return false;
                }
                return f !== valor;
            });
        } else {
            // Para outros tipos, remove strings diretamente
            dadosAvaliacao[config.propriedade] = dadosAvaliacao[config.propriedade].filter(p => p !== valor);
        }
        
        // Atualizar totalWords e totalPseudowords se necessário
        if (tipoLista === 'palavras') {
            dadosAvaliacao.totalWords = dadosAvaliacao.words.length;
        } else if (tipoLista === 'pseudopalavras') {
            dadosAvaliacao.totalPseudowords = dadosAvaliacao.pseudowords.length;
        }
        
        console.log(`Item "${valor}" removido da lista ${tipoLista}`);
        
        // Atualizar contagem de itens selecionados
        atualizarContagemSelecionados(tipoLista);
    }
    
    const limparLista = (tipoLista) => {
        const config = listas[tipoLista];
        if (!config || !config.listaDom) return;
        
        while (config.listaDom.firstChild) {
            config.listaDom.removeChild(config.listaDom.firstChild);
        }
        
        if (tipoLista === 'frases') {
            dadosAvaliacao[config.propriedade] = [];
        } else {
            dadosAvaliacao[config.propriedade] = [];
        }
        
        console.log(`Lista ${tipoLista} limpa`);
    }

    const criarBotaoLimparLista = (tipoLista) => {
        const config = listas[tipoLista];
        if (!config || !config.listaDom) return;
        
        const container = config.listaDom.parentElement;
        if (!container) return;
        
        if (container.querySelector('.btn-limpar-lista')) return;
        
        const botaoLimpar = document.createElement('button');
        botaoLimpar.className = 'btn-limpar-lista text-sm text-red-600 hover:text-red-800 absolute top-2 right-2';
        botaoLimpar.innerHTML = '<i class="fas fa-trash-alt mr-1"></i>Limpar tudo';
        botaoLimpar.onclick = function() {
            if (confirm(`Tem certeza que deseja remover todos os itens da lista?`)) {
                limparLista(tipoLista);
            }
        };
        
        container.style.position = 'relative';
        
        container.appendChild(botaoLimpar);
    }

    Object.keys(listas).forEach(tipoLista => {
        criarBotaoLimparLista(tipoLista);
    });

    window.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            if (document.activeElement === novaPalavra) {
                adicionarPalavras();
                e.preventDefault();
            } else if (document.activeElement === novaPseudopalavra) {
                adicionarPseudopalavras();
                e.preventDefault();
            } else if (document.activeElement === novaSentenca) {
                adicionarSentencas();
                e.preventDefault();
            } else if (document.activeElement === novaFrase) {
                adicionarFrases();
                e.preventDefault();
            }
        }
    });

    
    if (palavras) palavras.addEventListener('click', adicionarPalavras);
    if (pseudopalavras) pseudopalavras.addEventListener('click', adicionarPseudopalavras);
    if (adicionarSentenca) adicionarSentenca.addEventListener('click', adicionarSentencas);
    if (adicionarFrase) adicionarFrase.addEventListener('click', adicionarFrases);

    const popularListasDeDados = () => {
        Object.keys(listas).forEach(tipoLista => {
            limparLista(tipoLista);
        });
        
        dadosAvaliacao.words.forEach(palavra => {
            adicionarItem('palavras', palavra);
        });
        
        dadosAvaliacao.pseudowords.forEach(pseudopalavra => {
            adicionarItem('pseudopalavras', pseudopalavra);
        });
        
        dadosAvaliacao.sentences.forEach(sentenca => {
            adicionarItem('sentencas', sentenca);
        });
        
        dadosAvaliacao.phrases.forEach(frase => {
            if (typeof frase === 'object' && frase.text) {
                adicionarItem('frases', frase.text);
            } else if (typeof frase === 'string') {
                adicionarItem('frases', frase);
            }
        });
    }

    if (btnSalvarAvaliacao) {
        btnSalvarAvaliacao.addEventListener('click', (e) => {
            e.preventDefault();
            dadosAvaliacao.totalWords = dadosAvaliacao.words.length;
            dadosAvaliacao.totalPseudowords = dadosAvaliacao.pseudowords.length;
            adicionarSeletorFaixaSerie();
            definirTexto();
            definirNomeDaAvaliacao();
            
            // Atualizar arrays com apenas os itens selecionados
            const palavrasSelecionadas = obterItensSelecionados('palavras');
            const pseudopalavrasSelecionadas = obterItensSelecionados('pseudopalavras');
            const sentencasSelecionadas = obterItensSelecionados('sentencas');
            const frasesSelecionadas = obterItensSelecionados('frases');
            
            // Se existirem itens selecionados, usar esses em vez de todos os itens
            if (palavrasSelecionadas.length > 0) {
                dadosAvaliacao.words = palavrasSelecionadas;
                dadosAvaliacao.totalWords = palavrasSelecionadas.length;
            }
            
            if (pseudopalavrasSelecionadas.length > 0) {
                dadosAvaliacao.pseudowords = pseudopalavrasSelecionadas;
                dadosAvaliacao.totalPseudowords = pseudopalavrasSelecionadas.length;
            }
            
            if (sentencasSelecionadas.length > 0) {
                dadosAvaliacao.sentences = sentencasSelecionadas;
            }
            
            if (frasesSelecionadas.length > 0) {
                dadosAvaliacao.phrases = frasesSelecionadas.map(frase => ({ text: frase }));
            }
            
            // Adicionar questões ao objeto dadosAvaliacao
            const questoesElements = document.querySelectorAll('#container-questoes .questao:not(.questao-template)');
            dadosAvaliacao.questions = Array.from(questoesElements).map(questaoEl => {
                const enunciado = questaoEl.querySelector('.enunciado-questao').value;
                const opcoes = Array.from(questaoEl.querySelectorAll('.opcao-container')).map(opt => 
                    opt.querySelector('.texto-opcao').value
                );
                
                return {
                    text: enunciado,
                    options: opcoes,
                };
            });
            
            console.log('Dados da avaliação:', dadosAvaliacao);
        });
    }


    configurarAdicionarQuestoes();

    function configurarAdicionarQuestoes() {
        const btnAdicionarQuestao = document.getElementById('adicionar-questao');
        const templateQuestao = document.getElementById('template-questao');
        const containerQuestoes = document.getElementById('container-questoes');

        let contadorQuestoes = 0;

        if (!btnAdicionarQuestao || !templateQuestao || !containerQuestoes) {
            console.warn('Elementos para adicionar questões não encontrados');
            return;
        }

        console.log('Configurando funcionalidade de adicionar questões');

        btnAdicionarQuestao.addEventListener('click', () => {
            adicionarNovaQuestao();
        });

        function adicionarNovaQuestao(questaoData = null) {
            contadorQuestoes++;

            const novaQuestao = templateQuestao.cloneNode(true);
            novaQuestao.classList.remove('questao-template', 'hidden');
            novaQuestao.classList.add('questao');
            novaQuestao.id = `questao-${contadorQuestoes}`;

            const enunciadoQuestao = novaQuestao.querySelector('.enunciado-questao');
            const opcoesContainer = novaQuestao.querySelectorAll('.opcao-container');
            const textosOpcoes = novaQuestao.querySelectorAll('.texto-opcao');
            const respostasCorretas = novaQuestao.querySelectorAll('.resposta-correta');

            respostasCorretas.forEach(radio => {
                radio.name = `resposta-correta-${contadorQuestoes}`;
            });

            if (questaoData) {
                enunciadoQuestao.value = questaoData.enunciado || '';

                textosOpcoes.forEach((input, index) => {
                    if (questaoData.opcoes && questaoData.opcoes[index]) {
                        input.value = questaoData.opcoes[index];
                    }
                });

                if (questaoData.respostaCorreta !== undefined &&
                    respostasCorretas[questaoData.respostaCorreta]) {
                    respostasCorretas[questaoData.respostaCorreta].checked = true;
                }
            }

            const btnRemoverQuestao = novaQuestao.querySelector('.btn-remover-questao');
            if (btnRemoverQuestao) {
                btnRemoverQuestao.addEventListener('click', function () {
                    novaQuestao.remove();
                    
                    const questoes = document.querySelectorAll('#container-questoes .questao:not(.questao-template)');
                    if (questoes.length === 0) {
                        const semQuestoes = document.getElementById('sem-questoes');
                        if (semQuestoes) {
                            semQuestoes.classList.remove('hidden');
                        }
                    }
                });
            }

            const botoesRemoverOpcao = novaQuestao.querySelectorAll('.btn-remover-opcao');
            botoesRemoverOpcao.forEach(btn => {
                btn.addEventListener('click', function () {
                    const opcoes = novaQuestao.querySelectorAll('.opcao-container');
                    if (opcoes.length <= 2) {
                        alert('É necessário ter pelo menos 2 alternativas.');
                        return;
                    }

                    this.closest('.opcao-container').remove();
                });
            });

            const btnAdicionarOpcao = novaQuestao.querySelector('.btn-adicionar-opcao');
            if (btnAdicionarOpcao) {
                btnAdicionarOpcao.addEventListener('click', function () {
                    adicionarNovaOpcao(novaQuestao, contadorQuestoes);
                });
            }

            containerQuestoes.appendChild(novaQuestao);

            const semQuestoes = document.getElementById('sem-questoes');
            if (semQuestoes) {
                semQuestoes.classList.add('hidden');
            }

            console.log(`Questão ${contadorQuestoes} adicionada`);
            return novaQuestao;
        }

        function adicionarNovaOpcao(questaoEl, questaoId) {
            const opcoesContainer = questaoEl.querySelectorAll('.opcao-container');
            if (opcoesContainer.length === 0) {
                console.error('Nenhuma opção encontrada para clonar');
                return;
            }

            const ultimaOpcao = opcoesContainer[opcoesContainer.length - 1];
            const novaOpcao = ultimaOpcao.cloneNode(true);

            const inputTexto = novaOpcao.querySelector('.texto-opcao');
            if (inputTexto) {
                inputTexto.value = '';
                inputTexto.placeholder = `Alternativa ${String.fromCharCode(65 + opcoesContainer.length)}`;
            }

            const radioButton = novaOpcao.querySelector('.resposta-correta');
            if (radioButton) {
                radioButton.checked = false;
                radioButton.name = `resposta-correta-${questaoId}`;
            }

            const btnRemover = novaOpcao.querySelector('.btn-remover-opcao');
            if (btnRemover) {
                btnRemover.addEventListener('click', function () {
                    const opcoes = questaoEl.querySelectorAll('.opcao-container');
                    if (opcoes.length <= 2) {
                        alert('É necessário ter pelo menos 2 alternativas.');
                        return;
                    }
                    novaOpcao.remove();
                });
            }

            const btnAdicionarOpcao = questaoEl.querySelector('.btn-adicionar-opcao');
            if (btnAdicionarOpcao) {
                btnAdicionarOpcao.parentNode.insertBefore(novaOpcao, btnAdicionarOpcao);
            } else {
                const container = questaoEl.querySelector('.space-y-2');
                if (container) {
                    container.appendChild(novaOpcao);
                }
            }

            console.log(`Nova opção adicionada à questão ${questaoId}`);
        }
    }

    function adicionarSeletorFaixaSerie() {
        const nomeAvaliacaoField = document.getElementById('nome-avaliacao');
        if (!nomeAvaliacaoField) {
            console.warn('Campo nome-avaliacao não encontrado');
            return;
        }

        const gradeRangeDiv = document.createElement('div');
        gradeRangeDiv.classList.add('mt-4');

        gradeRangeDiv.innerHTML = `
            <label for="grade-range" class="block text-sm font-medium text-gray-700 mb-1">Faixa de Série</label>
            <select id="grade-range" name="grade-range" required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="RANGE_1_2">1º e 2º anos</option>
                <option value="RANGE_3_5">3º ao 5º ano</option>
                <option value="RANGE_6_9">6º ao 9º ano</option>
            </select>
            <p class="text-xs text-gray-500 mt-1">Selecione a faixa de série para a qual este teste é destinado</p>
        `;

        nomeAvaliacaoField.parentNode.after(gradeRangeDiv);
        console.log('Seletor de faixa de série adicionado');
    }

    popularListasDeDados();

    /**
     * Atualiza a contagem de itens selecionados para uma lista
     */
    const atualizarContagemSelecionados = (tipoLista) => {
        const config = listas[tipoLista];
        if (!config || !config.listaDom) return;
        
        // Encontrar o container da lista
        const container = config.listaDom.parentElement;
        if (!container) return;
        
        // Verificar se já existe o contador
        let contador = container.querySelector('.contador-selecionados');
        if (!contador) {
            // Criar o contador se não existir
            contador = document.createElement('div');
            contador.className = 'contador-selecionados text-xs text-gray-600 mt-2';
            container.appendChild(contador);
        }
        
        // Contar itens selecionados
        const total = config.listaDom.querySelectorAll(`.${config.classeItem}`).length;
        const selecionados = config.listaDom.querySelectorAll(`.${config.classeItem}[data-selecionado="true"]`).length;
        
        // Atualizar o texto
        contador.textContent = `Selecionados: ${selecionados} de ${total}`;
    }
    
    /**
     * Obtém os itens selecionados de uma lista
     */
    const obterItensSelecionados = (tipoLista) => {
        const config = listas[tipoLista];
        if (!config || !config.listaDom) return [];
        
        // Obter todos os itens selecionados
        const itensSelecionados = Array.from(
            config.listaDom.querySelectorAll(`.${config.classeItem}[data-selecionado="true"]`)
        ).map(item => item.dataset.valor);
        
        return itensSelecionados;
    }
    
    /**
     * Seleciona todos os itens de uma lista
     */
    const selecionarTodos = (tipoLista) => {
        const config = listas[tipoLista];
        if (!config || !config.listaDom) return;
        
        // Selecionar todos os itens
        config.listaDom.querySelectorAll(`.${config.classeItem}`).forEach(item => {
            item.dataset.selecionado = "true";
            item.classList.remove('bg-white', 'hover:bg-blue-100');
            item.classList.add('bg-green-100');
            
            const checkbox = item.querySelector('span:first-child');
            if (checkbox) {
                checkbox.classList.add('bg-green-500');
                checkbox.classList.remove('border-gray-400');
                checkbox.querySelector('i')?.classList.remove('hidden');
            }
        });
        
        // Atualizar contagem
        atualizarContagemSelecionados(tipoLista);
    }
    
    /**
     * Desmarca todos os itens de uma lista
     */
    const desmarcarTodos = (tipoLista) => {
        const config = listas[tipoLista];
        if (!config || !config.listaDom) return;
        
        // Desmarcar todos os itens
        config.listaDom.querySelectorAll(`.${config.classeItem}`).forEach(item => {
            item.dataset.selecionado = "false";
            item.classList.remove('bg-green-100');
            item.classList.add('bg-white', 'hover:bg-blue-100');
            
            const checkbox = item.querySelector('span:first-child');
            if (checkbox) {
                checkbox.classList.remove('bg-green-500');
                checkbox.classList.add('border-gray-400');
                checkbox.querySelector('i')?.classList.add('hidden');
            }
        });
        
        // Atualizar contagem
        atualizarContagemSelecionados(tipoLista);
    }

    /**
     * Adicionar botões de ação para as listas (Selecionar Todos/Desmarcar Todos)
     */
    function adicionarBotoesAcaoLista(tipoLista) {
        const config = listas[tipoLista];
        if (!config || !config.listaDom) return;
        
        // Encontrar o container da lista
        const container = config.listaDom.parentElement;
        if (!container) return;
        
        // Verificar se já existem os botões
        if (container.querySelector('.botoes-acao-lista')) return;
        
        // Criar container de botões
        const botoesContainer = document.createElement('div');
        botoesContainer.className = 'botoes-acao-lista flex space-x-2 mt-2';
        
        // Botão Selecionar Todos
        const btnSelecionarTodos = document.createElement('button');
        btnSelecionarTodos.type = 'button';
        btnSelecionarTodos.className = 'text-xs text-blue-600 hover:text-blue-800 flex items-center';
        btnSelecionarTodos.innerHTML = '<i class="fas fa-check-square mr-1"></i> Selecionar Todos';
        btnSelecionarTodos.onclick = () => selecionarTodos(tipoLista);
        
        // Botão Desmarcar Todos
        const btnDesmarcarTodos = document.createElement('button');
        btnDesmarcarTodos.type = 'button';
        btnDesmarcarTodos.className = 'text-xs text-gray-600 hover:text-gray-800 flex items-center';
        btnDesmarcarTodos.innerHTML = '<i class="fas fa-square mr-1"></i> Desmarcar Todos';
        btnDesmarcarTodos.onclick = () => desmarcarTodos(tipoLista);
        
        // Adicionar botões ao container
        botoesContainer.appendChild(btnSelecionarTodos);
        botoesContainer.appendChild(btnDesmarcarTodos);
        
        // Adicionar container após a lista
        container.appendChild(botoesContainer);
    }
    
    // Adicionar botões de ação para todas as listas
    Object.keys(listas).forEach(tipoLista => {
        adicionarBotoesAcaoLista(tipoLista);
    });
}); 