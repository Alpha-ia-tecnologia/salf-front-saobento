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

    const definirGradeRange = () => {
        const gradeRangeElement = document.getElementById('grade-range');
        if (gradeRangeElement) {
            dadosAvaliacao.gradeRange = gradeRangeElement.value;
            console.log(`Grade Range definido como: ${dadosAvaliacao.gradeRange}`);
            return dadosAvaliacao.gradeRange;
        } else {
            dadosAvaliacao.gradeRange = "RANGE_1_2"; // Valor padrão
            console.warn('Elemento grade-range não encontrado, usando valor padrão');
            return dadosAvaliacao.gradeRange;
        }
    }

    // Função para obter o valor atual do gradeRange
    const obterGradeRange = () => {
        return dadosAvaliacao.gradeRange || definirGradeRange();
    }

    const adicionarPalavras = () => {
        const palavra = novaPalavra.value.trim();
        if (palavra !== '') {
            adicionarItem('palavras', palavra);
            novaPalavra.value = '';
        }
    }

    const adicionarPseudopalavras = () => {
        const pseudopalavra = novaPseudopalavra.value.trim();
        if (pseudopalavra !== '') {
            adicionarItem('pseudopalavras', pseudopalavra);
            novaPseudopalavra.value = '';
        }
    }

    const salvarAvaliacao = () => {
        console.log('Salvando avaliação');
        const token = localStorage.getItem('token');
        const request = fetch('https://salf-salf-api.py5r5i.easypanel.host/api/assessments', {
            method: 'POST',
            body: JSON.stringify(dadosAvaliacao),
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
    }

    const adicionarSentencas = () => {
        const sentenca = novaSentenca.value.trim();
        if (sentenca !== '') {
            adicionarItem('sentencas', sentenca);
            novaSentenca.value = '';
        }
    }

    const adicionarFrases = () => {
        const frase = novaFrase.value.trim();
        if (frase !== '') {
            adicionarItem('frases', frase);
            novaFrase.value = '';
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
        item.className = `${config.classeItem} bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center`;
        item.dataset.valor = texto;
        
        const textoSpan = document.createElement('span');
        textoSpan.textContent = texto;
        item.appendChild(textoSpan);
        
        const botaoRemover = document.createElement('button');
        botaoRemover.className = 'ml-2 text-blue-600 hover:text-blue-800';
        botaoRemover.innerHTML = '<i class="fas fa-times-circle"></i>';
        botaoRemover.onclick = function () {
            removerItem(tipoLista, item);
        };
        
        item.appendChild(botaoRemover);
        config.listaDom.appendChild(item);
    }
    
    const removerItem = (tipoLista, itemElement) => {
        const config = listas[tipoLista];
        const valor = itemElement.dataset.valor;
        
        itemElement.remove();
        
        if (tipoLista === 'frases') {
            dadosAvaliacao[config.propriedade] = dadosAvaliacao[config.propriedade].filter(f => f.text !== valor);
        } else {
            dadosAvaliacao[config.propriedade] = dadosAvaliacao[config.propriedade].filter(p => p !== valor);
        }
        
        console.log(`Item "${valor}" removido da lista ${tipoLista}`);
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
            definirTexto();
            definirNomeDaAvaliacao();
            definirGradeRange();

            salvarAvaliacao();
            
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
        
        setTimeout(() => {
            const gradeRangeSelect = document.getElementById('grade-range');
            if (gradeRangeSelect) {
                dadosAvaliacao.gradeRange = gradeRangeSelect.value;
                
                gradeRangeSelect.addEventListener('change', function() {
                    dadosAvaliacao.gradeRange = this.value;
                    console.log(`Grade Range atualizado para: ${dadosAvaliacao.gradeRange}`);
                });
            }
        }, 100);
    }
    
    // Popular listas com os dados iniciais, se houver
    popularListasDeDados();
    
    // Adicionar seletor de faixa de série ao modal
    adicionarSeletorFaixaSerie();
    
    // Configurar funcionalidade de adicionar questões
    configurarAdicionarQuestoes();
    
    // Inicialização do objeto dadosAvaliacao
    const inicializarDados = () => {
        // Definir valores iniciais
        definirNomeDaAvaliacao();
        definirTexto();
        definirGradeRange();
        
        // Atualizar contadores
        dadosAvaliacao.totalWords = dadosAvaliacao.words.length;
        dadosAvaliacao.totalPseudowords = dadosAvaliacao.pseudowords.length;
        
        console.log('Dados da avaliação inicializados:', dadosAvaliacao);
    };
    
    // Executar inicialização após um breve delay para garantir que todos os elementos estejam carregados
    setTimeout(inicializarDados, 500);
}); 