/**
 * Arquivo responsável por manipular a criação de testes de leitura através da API
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('Script de criação de testes de leitura carregado');
    
    // Adicionar seletor de faixa de série ao modal
    adicionarSeletorFaixaSerie();
    
    // Referência ao botão de salvar avaliação
    const btnSalvarAvaliacao = document.getElementById('btn-salvar-avaliacao');
    const formAvaliacao = document.getElementById('form-avaliacao');
    
    // Adicionar botão para criar teste pré-definido
    adicionarBotaoCriarTestePredefinido();
    
    // Adicionar botão para enviar teste diretamente
    adicionarBotaoEnviarTesteDireto();
    
    // Configurar funcionalidade de adicionar questões
    configurarAdicionarQuestoes();
    
    if (formAvaliacao && btnSalvarAvaliacao) {
        console.log('Form e botão de salvar encontrados, adicionando listeners');
        
        // Adicionar evento de clique direto ao botão
        btnSalvarAvaliacao.addEventListener('click', async function(event) {
            event.preventDefault();
            console.log('Botão de salvar clicado');
            
            try {
                await enviarTesteParaAPI();
            } catch (error) {
                console.error('Erro ao enviar teste:', error);
                alert(`Erro ao salvar o teste de leitura: ${error.message}`);
            }
        });
        
        // Adicionar evento de submit ao formulário
        formAvaliacao.addEventListener('submit', async function(event) {
            event.preventDefault();
            console.log('Formulário submetido');
            
            try {
                await enviarTesteParaAPI();
            } catch (error) {
                console.error('Erro ao enviar teste:', error);
                alert(`Erro ao salvar o teste de leitura: ${error.message}`);
            }
        });
    } else {
        console.warn('Form ou botão de salvar não encontrados');
    }
    
    /**
     * Configura a funcionalidade para adicionar múltiplas questões
     */
    function configurarAdicionarQuestoes() {
        // Referências aos elementos
        const btnAdicionarQuestao = document.getElementById('adicionar-questao');
        const templateQuestao = document.getElementById('template-questao');
        const containerQuestoes = document.getElementById('container-questoes');
        
        // Variáveis para controle
        let contadorQuestoes = 0;
        
        // Verificar se os elementos necessários existem
        if (!btnAdicionarQuestao || !templateQuestao || !containerQuestoes) {
            console.warn('Elementos para adicionar questões não encontrados');
            return;
        }
        
        console.log('Configurando funcionalidade de adicionar questões');
        
        // Adicionar evento de clique ao botão
        btnAdicionarQuestao.addEventListener('click', () => {
            adicionarNovaQuestao();
        });
        
        /**
         * Adiciona uma nova questão ao formulário
         * @param {Object} questaoData - Dados da questão (opcional para pré-preenchimento)
         */
        function adicionarNovaQuestao(questaoData = null) {
            contadorQuestoes++;
            
            // Clonar o template
            const novaQuestao = templateQuestao.cloneNode(true);
            novaQuestao.classList.remove('questao-template', 'hidden');
            novaQuestao.classList.add('questao');
            novaQuestao.id = `questao-${contadorQuestoes}`;
            
            // Configurar os inputs da questão
            const enunciadoQuestao = novaQuestao.querySelector('.enunciado-questao');
            const opcoesContainer = novaQuestao.querySelectorAll('.opcao-container');
            const textosOpcoes = novaQuestao.querySelectorAll('.texto-opcao');
            const respostasCorretas = novaQuestao.querySelectorAll('.resposta-correta');
            
            // Atualizar nome dos radio buttons para o grupo específico da questão
            respostasCorretas.forEach(radio => {
                radio.name = `resposta-correta-${contadorQuestoes}`;
            });
            
            // Preencher dados se existirem
            if (questaoData) {
                enunciadoQuestao.value = questaoData.enunciado || '';
                
                // Preencher opções existentes
                textosOpcoes.forEach((input, index) => {
                    if (questaoData.opcoes && questaoData.opcoes[index]) {
                        input.value = questaoData.opcoes[index];
                    }
                });
                
                // Marcar a resposta correta
                if (questaoData.respostaCorreta !== undefined && 
                    respostasCorretas[questaoData.respostaCorreta]) {
                    respostasCorretas[questaoData.respostaCorreta].checked = true;
                }
            }
            
            // Adicionar eventos para remoção da questão
            const btnRemoverQuestao = novaQuestao.querySelector('.btn-remover-questao');
            if (btnRemoverQuestao) {
                btnRemoverQuestao.addEventListener('click', function() {
                    novaQuestao.remove();
                });
            }
            
            // Adicionar eventos para remoção de opções
            const botoesRemoverOpcao = novaQuestao.querySelectorAll('.btn-remover-opcao');
            botoesRemoverOpcao.forEach(btn => {
                btn.addEventListener('click', function() {
                    // Não remover se tiver apenas 2 opções
                    const opcoes = novaQuestao.querySelectorAll('.opcao-container');
                    if (opcoes.length <= 2) {
                        alert('É necessário ter pelo menos 2 alternativas.');
                        return;
                    }
                    
                    // Remover a opção
                    this.closest('.opcao-container').remove();
                });
            });
            
            // Adicionar evento para adicionar novas opções
            const btnAdicionarOpcao = novaQuestao.querySelector('.btn-adicionar-opcao');
            if (btnAdicionarOpcao) {
                btnAdicionarOpcao.addEventListener('click', function() {
                    adicionarNovaOpcao(novaQuestao, contadorQuestoes);
                });
            }
            
            // Adicionar a questão ao container
            containerQuestoes.appendChild(novaQuestao);
            
            // Remover aviso de "sem questões" se existir
            const semQuestoes = document.getElementById('sem-questoes');
            if (semQuestoes) {
                semQuestoes.classList.add('hidden');
            }
            
            console.log(`Questão ${contadorQuestoes} adicionada`);
            return novaQuestao;
        }
        
        /**
         * Adiciona uma nova opção a uma questão existente
         * @param {HTMLElement} questaoEl - Elemento da questão
         * @param {number} questaoId - ID da questão
         */
        function adicionarNovaOpcao(questaoEl, questaoId) {
            // Pegar última opção para clonar
            const opcoesContainer = questaoEl.querySelectorAll('.opcao-container');
            if (opcoesContainer.length === 0) {
                console.error('Nenhuma opção encontrada para clonar');
                return;
            }
            
            // Clonar a última opção
            const ultimaOpcao = opcoesContainer[opcoesContainer.length - 1];
            const novaOpcao = ultimaOpcao.cloneNode(true);
            
            // Limpar o texto
            const inputTexto = novaOpcao.querySelector('.texto-opcao');
            if (inputTexto) {
                inputTexto.value = '';
                inputTexto.placeholder = `Alternativa ${String.fromCharCode(65 + opcoesContainer.length)}`;
            }
            
            // Configurar radio button
            const radioButton = novaOpcao.querySelector('.resposta-correta');
            if (radioButton) {
                radioButton.checked = false;
                radioButton.name = `resposta-correta-${questaoId}`;
            }
            
            // Adicionar evento para remover a opção
            const btnRemover = novaOpcao.querySelector('.btn-remover-opcao');
            if (btnRemover) {
                btnRemover.addEventListener('click', function() {
                    const opcoes = questaoEl.querySelectorAll('.opcao-container');
                    if (opcoes.length <= 2) {
                        alert('É necessário ter pelo menos 2 alternativas.');
                        return;
                    }
                    novaOpcao.remove();
                });
            }
            
            // Adicionar a nova opção antes do botão de adicionar
            const btnAdicionarOpcao = questaoEl.querySelector('.btn-adicionar-opcao');
            if (btnAdicionarOpcao) {
                btnAdicionarOpcao.parentNode.insertBefore(novaOpcao, btnAdicionarOpcao);
            } else {
                // Adicionar ao final do container de opções
                const container = questaoEl.querySelector('.space-y-2');
                if (container) {
                    container.appendChild(novaOpcao);
                }
            }
            
            console.log(`Nova opção adicionada à questão ${questaoId}`);
        }
    }
    
    /**
     * Adiciona um campo de seleção para a faixa de série
     */
    function adicionarSeletorFaixaSerie() {
        const nomeAvaliacaoField = document.getElementById('nome-avaliacao');
        if (!nomeAvaliacaoField) {
            console.warn('Campo nome-avaliacao não encontrado');
            return;
        }
        
        // Criar o elemento de seleção após o campo de nome
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
        
        // Inserir após o campo de nome
        nomeAvaliacaoField.parentNode.after(gradeRangeDiv);
        console.log('Seletor de faixa de série adicionado');
    }
    
    /**
     * Adiciona um botão para criar um teste pré-definido
     */
    function adicionarBotaoCriarTestePredefinido() {
        const botoesContainer = document.querySelector('.modal-footer');
        if (!botoesContainer) {
            console.warn('Container de botões do modal não encontrado');
            return;
        }
        
        // Criar o botão de teste pré-definido
        const btnTestePredefinido = document.createElement('button');
        btnTestePredefinido.type = 'button';
        btnTestePredefinido.id = 'btn-teste-predefinido';
        btnTestePredefinido.classList.add('px-4', 'py-2', 'bg-green-600', 'text-white', 'rounded', 'hover:bg-green-700', 'transition', 'mr-2');
        btnTestePredefinido.textContent = 'Criar Teste Pré-definido';
        
        // Adicionar evento de clique
        btnTestePredefinido.addEventListener('click', async function() {
            try {
                await criarTestePredefinido();
            } catch (error) {
                console.error('Erro ao criar teste pré-definido:', error);
                alert(`Erro ao criar teste pré-definido: ${error.message}`);
            }
        });
        
        // Inserir no início do container
        botoesContainer.prepend(btnTestePredefinido);
        console.log('Botão de teste pré-definido adicionado');
    }
    
    /**
     * Adiciona um botão para enviar teste diretamente com o body fornecido
     */
    function adicionarBotaoEnviarTesteDireto() {
        const botoesContainer = document.querySelector('.modal-footer');
        if (!botoesContainer) {
            console.warn('Container de botões do modal não encontrado');
            return;
        }
        
        // Criar o botão de envio direto
        const btnEnviarDireto = document.createElement('button');
        btnEnviarDireto.type = 'button';
        btnEnviarDireto.id = 'btn-enviar-direto';
        btnEnviarDireto.classList.add('px-4', 'py-2', 'bg-purple-600', 'text-white', 'rounded', 'hover:bg-purple-700', 'transition', 'mr-2');
        btnEnviarDireto.textContent = 'Enviar Teste Direto';
        
        // Adicionar evento de clique
        btnEnviarDireto.addEventListener('click', async function() {
            try {
                await enviarTesteDireto();
            } catch (error) {
                console.error('Erro ao enviar teste direto:', error);
                alert(`Erro ao enviar teste direto: ${error.message}`);
            }
        });
        
        // Inserir no início do container
        botoesContainer.prepend(btnEnviarDireto);
        console.log('Botão de envio direto adicionado');
    }
    
    /**
     * Envia um teste diretamente para a API com o body fornecido
     * @returns {Promise<Object>} Os dados da resposta da API
     */
    async function enviarTesteDireto() {
        console.log('Enviando teste diretamente para API');
        
        // Body fornecido para a requisição
        const bodyDireto = {
            name: "Teste de Leitura - 1º ao 3º Ano",
            gradeRange: "RANGE_3_5",
            words: [
                "casa",
                "bola",
                "gato"
            ],
            pseudowords: [
                "tasi",
                "mupa",
                "dala"
            ],
            sentences: [
                "O menino joga bola.",
                "A casa é grande."
            ],
            text: "Era uma vez um menino que gostava muito de ler...",
            interpretationQuestions: [
                {
                    question: "Quem é o personagem principal da história?",
                    correctAnswer: "O menino",
                    options: [
                        "O menino",
                        "A menina",
                        "O cachorro",
                        "O professor"
                    ]
                }
            ]
        };
        
        // Obter token de autenticação
        const token = localStorage.getItem('token');
        
        // Configurar cabeçalhos para requisições
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : ''
        };
        
        // Enviar dados para a API
        const url = 'https://salf-salf-api.py5r5i.easypanel.host/api/reading-tests';
        console.log(`Enviando POST direto para ${url}`);
        
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(bodyDireto)
            });
            
            console.log('Resposta recebida:', response);
            
            // Verificar se a requisição foi bem-sucedida
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `Erro ${response.status}: ${response.statusText}`);
            }
            
            alert('Teste enviado diretamente com sucesso!');
            
            // Fechar o modal após o envio bem-sucedido
            const modalAvaliacao = document.getElementById('modal-avaliacao');
            if (modalAvaliacao) {
                modalAvaliacao.classList.add('hidden');
            }
            
            // Recarregar a página para exibir o novo teste
            window.location.reload();
            
            // Retornar os dados da resposta
            return await response.json();
        } catch (error) {
            console.error('Erro na requisição direta:', error);
            throw error;
        }
    }
    
    /**
     * Cria um teste de leitura com dados pré-definidos
     * @returns {Promise<Object>} Os dados da resposta da API
     */
    async function criarTestePredefinido() {
        console.log('Criando teste pré-definido');
        
        // Dados pré-definidos do teste
        const testePredefinido = {
            name: "Teste de Leitura - 1º ao 3º Ano",
            gradeRange: "RANGE_3_5",
            words: [
                "casa",
                "bola",
                "gato"
            ],
            pseudowords: [
                "tasi",
                "mupa",
                "dala"
            ],
            sentences: [
                "O menino joga bola.",
                "A casa é grande."
            ],
            text: "Era uma vez um menino que gostava muito de ler...",
            interpretationQuestions: [
                {
                    question: "Quem é o personagem principal da história?",
                    correctAnswer: "O menino",
                    options: [
                        "O menino",
                        "A menina",
                        "O cachorro",
                        "O professor"
                    ]
                }
            ]
        };
        
        // Obter token de autenticação
        const token = localStorage.getItem('token');
        
        // Configurar cabeçalhos para requisições
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : ''
        };
        
        // Enviar dados para a API
        const url = 'https://salf-salf-api.py5r5i.easypanel.host/api/reading-tests';
        console.log(`Enviando POST para ${url} com dados pré-definidos:`, testePredefinido);
        
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(testePredefinido)
            });
            
            console.log('Resposta recebida:', response);
            
            // Verificar se a requisição foi bem-sucedida
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `Erro ${response.status}: ${response.statusText}`);
            }
            
            alert('Teste de leitura pré-definido criado com sucesso!');
            
            // Recarregar a página para exibir o novo teste
            // window.location.reload();
            
            // Retornar os dados da resposta
            return await response.json();
        } catch (error) {
            console.error('Erro na requisição:', error);
            throw error;
        }
    }
    
    /**
     * Envia os dados do teste para a API
     * @returns {Promise<Object>} Os dados da resposta da API
     */
    async function enviarTesteParaAPI() {
        console.log('Iniciando envio do teste para API');
        
        // Obter valores dos campos
        const nome = document.getElementById('nome-avaliacao').value;
        if (!nome) {
            throw new Error('O nome da avaliação é obrigatório');
        }
        
        // Obter a faixa de série selecionada
        const gradeRangeElement = document.getElementById('grade-range');
        const gradeRange = gradeRangeElement ? gradeRangeElement.value : "RANGE_1_2";
        
        // Obter palavras diretamente dos elementos do DOM
        let palavras = [];
        const palavrasContainer = document.getElementById('container-palavras');
        if (palavrasContainer) {
            const palavrasElements = palavrasContainer.querySelectorAll('.palavra-item');
            palavras = Array.from(palavrasElements).map(el => el.textContent.trim());
        } else {
            // Tentar acessar as variáveis globais como fallback
            palavras = window.palavrasAdicionadas || [];
        }
        
        // Obter pseudopalavras diretamente dos elementos do DOM
        let pseudopalavras = [];
        const pseudopalavrasContainer = document.getElementById('container-pseudopalavras');
        if (pseudopalavrasContainer) {
            const pseudopalavrasElements = pseudopalavrasContainer.querySelectorAll('.pseudopalavra-item');
            pseudopalavras = Array.from(pseudopalavrasElements).map(el => el.textContent.trim());
        } else {
            // Tentar acessar as variáveis globais como fallback
            pseudopalavras = window.pseudopalavrasAdicionadas || [];
        }
        
        // Obter frases diretamente dos elementos do DOM
        let frases = [];
        const frasesContainer = document.getElementById('container-frases');
        if (frasesContainer) {
            const frasesElements = frasesContainer.querySelectorAll('.frase-item');
            frases = Array.from(frasesElements).map(el => el.textContent.trim());
        } else {
            // Tentar acessar as variáveis globais como fallback
            frases = window.frasesAdicionadas || [];
        }
        
        // Verificar se os dados estão vazios e tentar capturar de outro lugar
        if (palavras.length === 0) {
            const palavrasInput = document.getElementById('input-palavras');
            if (palavrasInput && palavrasInput.value) {
                palavras = palavrasInput.value.split('\n').filter(p => p.trim() !== '');
            }
        }
        
        if (pseudopalavras.length === 0) {
            const pseudopalavrasInput = document.getElementById('input-pseudopalavras');
            if (pseudopalavrasInput && pseudopalavrasInput.value) {
                pseudopalavras = pseudopalavrasInput.value.split('\n').filter(p => p.trim() !== '');
            }
        }
        
        if (frases.length === 0) {
            const frasesInput = document.getElementById('input-frases');
            if (frasesInput && frasesInput.value) {
                frases = frasesInput.value.split('\n').filter(f => f.trim() !== '');
            }
        }
        
        // Se ainda estiver vazio, usar dados padrão de exemplo
        if (palavras.length === 0) {
            palavras = ["casa", "bola", "gato"];
            console.warn('Usando palavras padrão pois não foi possível encontrar palavras adicionadas');
        }
        
        if (pseudopalavras.length === 0) {
            pseudopalavras = ["tasi", "mupa", "dala"];
            console.warn('Usando pseudopalavras padrão pois não foi possível encontrar pseudopalavras adicionadas');
        }
        
        if (frases.length === 0) {
            frases = ["O menino joga bola.", "A casa é grande."];
            console.warn('Usando frases padrão pois não foi possível encontrar frases adicionadas');
        }
        
        console.log('Palavras adicionadas:', palavras);
        console.log('Pseudopalavras adicionadas:', pseudopalavras);
        console.log('Frases adicionadas:', frases);
        
        // Obter texto
        const textoElement = document.getElementById('texto-avaliacao');
        const texto = textoElement ? textoElement.value : '';
        
        // Se o texto estiver vazio, usar texto padrão
        const textoFinal = texto && texto.trim() !== '' ? 
            texto : 
            "Era uma vez um menino que gostava muito de ler...";
            
        if (texto === '') {
            console.warn('Usando texto padrão pois o campo está vazio');
        }
        
        // Obter questões de interpretação
        const questoesElements = document.querySelectorAll('#container-questoes .questao:not(.questao-template)');
        const questoes = Array.from(questoesElements).map(questaoEl => {
            // Obter enunciado
            const enunciado = questaoEl.querySelector('.enunciado-questao').value;
            
            // Obter as opções
            const opcoesElements = questaoEl.querySelectorAll('.opcao-container');
            const opcoes = Array.from(opcoesElements).map(opt => opt.querySelector('.texto-opcao').value);
            
            // Obter a resposta correta
            const respostaCorretaIndex = Array.from(opcoesElements).findIndex(
                opt => opt.querySelector('.resposta-correta').checked
            );
            const respostaCorreta = respostaCorretaIndex >= 0 ? opcoes[respostaCorretaIndex] : '';
            
            return {
                text: enunciado,
                options: opcoes
            };
        });
        console.log(`${questoes.length} questões encontradas:`, questoes);
        
        // Se não houver questões, adicionar uma questão padrão
        if (questoes.length === 0) {
            questoes.push({
                text: "Quem é o personagem principal da história?",
                options: ["O menino", "A menina", "O cachorro", "O professor"]
            });
            console.warn('Usando questão padrão pois nenhuma questão foi adicionada');
        }
        
        // Validar dados antes de enviar (mínimo necessário)
        if (palavras.length === 0) {
            throw new Error('Adicione pelo menos uma palavra ao teste');
        }
        
        if (pseudopalavras.length === 0) {
            throw new Error('Adicione pelo menos uma pseudopalavra ao teste');
        }
        
        if (frases.length === 0) {
            throw new Error('Adicione pelo menos uma frase ao teste');
        }
        
        if (!textoFinal || textoFinal.trim() === '') {
            throw new Error('Adicione um texto ao teste');
        }
        
        // Validar questões
        questoes.forEach((questao, index) => {
            if (!questao.text) {
                throw new Error(`A questão ${index + 1} não possui enunciado`);
            }
            
            if (questao.options.length < 2) {
                throw new Error(`A questão ${index + 1} deve ter pelo menos 2 alternativas`);
            }
            
     
        });
        
        // Montar o corpo da requisição
        const dadosEnvio = {
            name: nome,
            text: textoFinal,
            totalWords: palavras.length,
            totalPseudowords: pseudopalavras.length,
            gradeRange: gradeRange,
            words: palavras,
            pseudowords: pseudopalavras,
            sentences: frases,
            assessmentEventId: 1,
            phrases: frases.map(frase => ({ text: frase })),
            questions: questoes.map(questao => ({
                text: questao.text || questao.enunciado,
                options: questao.options || questao.opcoes
            }))
        };

        console.log(dadosEnvio)
        
        console.log('Dados a serem enviados:', dadosEnvio);
        
        // Obter token de autenticação
        const token = localStorage.getItem('token');
        
        // Configurar cabeçalhos para requisições
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : ''
        };
        
        // Enviar dados para a API
        const url = 'https://salf-salf-api.py5r5i.easypanel.host/api/assessments';
        console.log(`Enviando POST para ${url}`);
        
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(dadosEnvio)
            });
            
            console.log('Resposta recebida:', response);
            
            // Verificar se a requisição foi bem-sucedida
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `Erro ${response.status}: ${response.statusText}`);
            }
            
            alert('Teste de leitura salvo com sucesso!');
            
            // Fechar o modal após o envio bem-sucedido
            const modalAvaliacao = document.getElementById('modal-avaliacao');
            if (modalAvaliacao) {
                modalAvaliacao.classList.add('hidden');
            }
            
            // Recarregar a página para exibir o novo teste
            window.location.reload();
            
            // Retornar os dados da resposta
            return await response.json();
        } catch (error) {
            console.error('Erro na requisição:', error);
            throw error;
        }
    }
}); 