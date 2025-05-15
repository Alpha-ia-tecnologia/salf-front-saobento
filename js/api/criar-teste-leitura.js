// /**
//  * Arquivo responsável por manipular a interface de criação de testes de leitura
//  */

// document.addEventListener('DOMContentLoaded', function () {
//     console.log('Script de criação de testes de leitura carregado');
    
//     const nomeAvaliacao = document.getElementById('nome-avaliacao');
//     const textoAvaliacao = document.getElementById('texto-avaliacao');
//     const btnPalavras = document.getElementById('adicionar-palavra');
//     const btnPseudopalavras = document.getElementById('adicionar-pseudopalavra');
//     const novaPalavra = document.getElementById('nova-palavra');
//     const novaPseudopalavra = document.getElementById('nova-pseudopalavra');
//     const novaFrase = document.getElementById('nova-frase');
//     const btnAdicionarFrase = document.getElementById('adicionar-frase');

//     // Aguardar o DOM estar completamente carregado para referenciar o botão
//     setTimeout(() => {
//         const btnSalvarAvaliacao = document.getElementById('btn-salvar-avaliacao-e-enviar');
//         console.log('Botão salvar encontrado:', btnSalvarAvaliacao);
        
//         if (btnSalvarAvaliacao) {
//             btnSalvarAvaliacao.addEventListener('click', async(e) => {
//                 e.preventDefault();
//                 console.log('Botão salvar clicado!');
//                 dadosAvaliacao.totalWords = dadosAvaliacao.words.length;
//                 dadosAvaliacao.totalPseudowords = dadosAvaliacao.pseudowords.length;
//                 adicionarSeletorFaixaSerie();
//                 definirTexto();
//                 definirNomeDaAvaliacao();
//                 definirFaixaSerie();
//                 console.log('Dados da avaliação a serem enviados:', dadosAvaliacao);
                
//                 const token = localStorage.getItem('token');
//                 try {
//                     const request = await fetch('https://api.salf.maximizaedu.com/api/assessments
', {
//                         method: 'POST',
//                         body: JSON.stringify(dadosAvaliacao),
//                         headers: {
//                             'Content-Type': 'application/json',
//                             'Authorization': `Bearer ${token}`
//                         }
//                     });

//                     if(request.ok) {
//                         alert('Avaliação criada com sucesso');
//                         window.location.reload();
//                     } else {
//                         const errorData = await request.json().catch(() => ({}));
//                         console.error('Erro na resposta:', errorData);
//                         alert('Erro ao criar avaliação. Verifique o console para mais detalhes.');
//                     }
//                 } catch (error) {
//                     console.error('Erro ao enviar dados:', error);
//                     alert('Erro ao criar avaliação. Verifique sua conexão e tente novamente.');
//                 }
                
//                 // Atualizar as frases para o formato esperado pela API
//                 if (dadosAvaliacao.phrases.length > 0) {
//                     // Garantir que todas as frases estão no formato de objeto
//                     dadosAvaliacao.phrases = dadosAvaliacao.phrases.map(frase => {
//                         if (typeof frase === 'string') {
//                             return { text: frase };
//                         }
//                         return frase;
//                     });
//                 }
                
//                 // Adicionar questões ao objeto dadosAvaliacao
//                 const questoesElements = document.querySelectorAll('#container-questoes .questao:not(.questao-template)');
//                 dadosAvaliacao.questions = Array.from(questoesElements).map(questaoEl => {
//                     const enunciado = questaoEl.querySelector('.enunciado-questao').value;
//                     const opcoes = Array.from(questaoEl.querySelectorAll('.opcao-container')).map(opt => 
//                         opt.querySelector('.texto-opcao').value
//                     );
                    
//                     return {
//                         text: enunciado,
//                         options: opcoes,
//                     };
//                 });
                
//                 console.log('Dados da avaliação:', dadosAvaliacao);
//             });
//         } else {
//             console.error('Botão de salvar avaliação não encontrado! Verifique o ID no HTML.');
//         }
//     }, 500);  // Pequeno delay para garantir que o DOM está totalmente carregado

//     const listas = {
//         palavras: {
//             listaDom: document.getElementById('lista-palavras'),
//             inputDom: novaPalavra,
//             classeItem: 'palavra-item',
//             propriedade: 'words'
//         },
//         pseudopalavras: {
//             listaDom: document.getElementById('lista-pseudopalavras'),
//             inputDom: novaPseudopalavra,
//             classeItem: 'pseudopalavra-item',
//             propriedade: 'pseudowords'
//         },
//         frases: {
//             listaDom: document.getElementById('lista-frases'),
//             inputDom: novaFrase,
//             classeItem: 'frase-item',
//             propriedade: 'phrases'
//         }
//     };


//     const definirNomeDaAvaliacao = () => {
//         const avaliacao = nomeAvaliacao.value;
//         dadosAvaliacao.name = avaliacao;
//     };

//     const definirTexto = () => {
//         const texto = textoAvaliacao.value.trim();
//         dadosAvaliacao.text = texto;
//     };

//     const definirFaixaSerie = () => {
//         const gradeRangeSelector = document.getElementById('grade-range');
//         if (gradeRangeSelector) {
//             dadosAvaliacao.gradeRange = gradeRangeSelector.value;
//         }
//     };

//     // Função para adicionar palavras
//     const adicionarPalavras = () => {
//         const entrada = novaPalavra.value.trim();
//         if (entrada !== '') {
//             // Dividir a entrada por vírgulas para permitir adição múltipla
//             const palavras = entrada.split(',').map(p => p.trim()).filter(p => p !== '');
            
//             // Adicionar cada palavra individualmente
//             palavras.forEach(palavra => {
//                 if (!dadosAvaliacao.words.includes(palavra)) {
//                     adicionarItem('palavras', palavra);
//                     console.log(`Palavra "${palavra}" adicionada ao dadosAvaliacao.words`);
//                 } else {
//                     console.log(`Palavra "${palavra}" já existe na lista`);
//                 }
//             });
            
//             // Atualizar contador total
//             dadosAvaliacao.totalWords = dadosAvaliacao.words.length;
//             console.log(`Total de palavras: ${dadosAvaliacao.totalWords}`);
            
//             novaPalavra.value = '';
//             novaPalavra.focus();
//         }
//     };

//     // Função para adicionar pseudopalavras
//     const adicionarPseudopalavras = () => {
//         const entrada = novaPseudopalavra.value.trim();
//         if (entrada !== '') {
//             // Dividir a entrada por vírgulas para permitir adição múltipla
//             const pseudopalavras = entrada.split(',').map(p => p.trim()).filter(p => p !== '');
            
//             // Adicionar cada pseudopalavra individualmente
//             pseudopalavras.forEach(pseudopalavra => {
//                 if (!dadosAvaliacao.pseudowords.includes(pseudopalavra)) {
//                     adicionarItem('pseudopalavras', pseudopalavra);
//                     console.log(`Pseudopalavra "${pseudopalavra}" adicionada ao dadosAvaliacao.pseudowords`);
//                 } else {
//                     console.log(`Pseudopalavra "${pseudopalavra}" já existe na lista`);
//                 }
//             });
            
//             // Atualizar contador total
//             dadosAvaliacao.totalPseudowords = dadosAvaliacao.pseudowords.length;
//             console.log(`Total de pseudopalavras: ${dadosAvaliacao.totalPseudowords}`);
            
//             novaPseudopalavra.value = '';
//             novaPseudopalavra.focus();
//         }
//     };

//     // Função para adicionar frases
//     const adicionarFrases = () => {
//         const entrada = novaFrase.value.trim();
//         if (entrada !== '') {
//             // Dividir a entrada por pontos para permitir adição múltipla
//             // Preservar os pontos no final das frases
//             const frases = entrada.split('.').map(f => f.trim()).filter(f => f !== '');
            
//             // Adicionar cada frase individualmente (adicionando o ponto final se não existir)
//             frases.forEach(frase => {
//                 // Adicionar ponto final se não tiver
//                 if (!/[.!?]$/.test(frase)) {
//                     frase = frase + '.';
//                 }
                
//                 const fraseExiste = dadosAvaliacao.phrases.some(f => 
//                     (typeof f === 'object' && f.text === frase) || f === frase
//                 );
                
//                 if (!fraseExiste) {
//                     adicionarItem('frases', frase);
//                     console.log(`Frase "${frase}" adicionada ao dadosAvaliacao.phrases`);
//                 } else {
//                     console.log(`Frase "${frase}" já existe na lista`);
//                 }
//             });
            
//             console.log(`Total de frases: ${dadosAvaliacao.phrases.length}`);
            
//             novaFrase.value = '';
//             novaFrase.focus();
//         }
//     };

//     // Função para adicionar um item à lista
//     const adicionarItem = (tipoLista, texto) => {
//         const config = listas[tipoLista];
        
//         if (!config || !config.listaDom) {
//             console.warn(`Lista ${tipoLista} não encontrada`);
//             return;
//         }
        
//         // Adicionar ao objeto dadosAvaliacao
//         if (tipoLista === 'frases') {
//             dadosAvaliacao[config.propriedade].push({ text: texto });
//         } else {
//             dadosAvaliacao[config.propriedade].push(texto);
//         }
        
//         // Verificar se foi adicionado corretamente
//         if (tipoLista === 'palavras') {
//             if (!dadosAvaliacao.words.includes(texto)) {
//                 console.error(`Erro: A palavra "${texto}" não foi adicionada a dadosAvaliacao.words`);
//             }
//         } else if (tipoLista === 'pseudopalavras') {
//             if (!dadosAvaliacao.pseudowords.includes(texto)) {
//                 console.error(`Erro: A pseudopalavra "${texto}" não foi adicionada a dadosAvaliacao.pseudowords`);
//             }
//         } else if (tipoLista === 'frases') {
//             const fraseAdicionada = dadosAvaliacao.phrases.some(f => 
//                 (typeof f === 'object' && f.text === texto) || f === texto
//             );
//             if (!fraseAdicionada) {
//                 console.error(`Erro: A frase "${texto}" não foi adicionada a dadosAvaliacao.phrases`);
//             }
//         }
        
//         // Criar elemento visual na lista
//         const item = document.createElement('div');
//         item.className = `${config.classeItem} bg-white border border-gray-300 px-3 py-1 rounded-full text-sm flex items-center hover:bg-gray-100 transition-colors select-none`;
//         item.dataset.valor = texto;
        
//         const textoSpan = document.createElement('span');
//         textoSpan.textContent = texto;
//         textoSpan.className = 'flex-grow';
        
//         item.appendChild(textoSpan);
        
//         const botaoRemover = document.createElement('button');
//         botaoRemover.className = 'ml-2 text-gray-500 hover:text-red-600 btn-remover flex-shrink-0';
//         botaoRemover.innerHTML = '<i class="fas fa-times-circle"></i>';
//         botaoRemover.onclick = function (e) {
//             e.stopPropagation();
//             removerItem(tipoLista, item);
//         };
        
//         item.appendChild(botaoRemover);
//         config.listaDom.appendChild(item);
        
//         // Atualizar contagem visual se existir
//         atualizarContagemVisual(tipoLista);
        
//         return item;
//     };
    
//     // Função para remover um item da lista
//     const removerItem = (tipoLista, itemElement) => {
//         const config = listas[tipoLista];
//         const valor = itemElement.dataset.valor;
        
//         // Remover do DOM
//         itemElement.remove();
        
//         // Remover do modelo de dados com base no tipo de lista
//         if (tipoLista === 'frases') {
//             // Para frases, remove objetos com propriedade text igual ao valor
//             dadosAvaliacao[config.propriedade] = dadosAvaliacao[config.propriedade].filter(f => {
//                 if (typeof f === 'object' && f.text === valor) {
//                     return false;
//                 }
//                 return f !== valor;
//             });
//         } else {
//             // Para outros tipos, remove strings diretamente
//             dadosAvaliacao[config.propriedade] = dadosAvaliacao[config.propriedade].filter(p => p !== valor);
//         }
        
//         // Atualizar totalWords e totalPseudowords se necessário
//         if (tipoLista === 'palavras') {
//             dadosAvaliacao.totalWords = dadosAvaliacao.words.length;
//         } else if (tipoLista === 'pseudopalavras') {
//             dadosAvaliacao.totalPseudowords = dadosAvaliacao.pseudowords.length;
//         }
        
//         console.log(`Item "${valor}" removido da lista ${tipoLista}`);
        
//         // Atualizar contagem visual
//         atualizarContagemVisual(tipoLista);
//     };
    
//     // Função para limpar uma lista
//     const limparLista = (tipoLista) => {
//         const config = listas[tipoLista];
//         if (!config || !config.listaDom) return;
        
//         while (config.listaDom.firstChild) {
//             config.listaDom.removeChild(config.listaDom.firstChild);
//         }
        
//         if (tipoLista === 'frases') {
//             dadosAvaliacao[config.propriedade] = [];
//         } else {
//             dadosAvaliacao[config.propriedade] = [];
//         }
        
//         // Atualizar contadores totais
//         if (tipoLista === 'palavras') {
//             dadosAvaliacao.totalWords = 0;
//         } else if (tipoLista === 'pseudopalavras') {
//             dadosAvaliacao.totalPseudowords = 0;
//         }
        
//         // Atualizar contagem visual
//         atualizarContagemVisual(tipoLista);
        
//         console.log(`Lista ${tipoLista} limpa`);
//     };

//     // Função para criar botão de limpar lista
//     const criarBotaoLimparLista = (tipoLista) => {
//         const config = listas[tipoLista];
//         if (!config || !config.listaDom) return;
        
//         const container = config.listaDom.parentElement;
//         if (!container) return;
        
//         if (container.querySelector('.btn-limpar-lista')) return;
        
//         const botaoLimpar = document.createElement('button');
//         botaoLimpar.className = 'btn-limpar-lista text-sm text-red-600 hover:text-red-800 absolute top-2 right-2';
//         botaoLimpar.innerHTML = '<i class="fas fa-trash-alt mr-1"></i>Limpar tudo';
//         botaoLimpar.onclick = function() {
//             if (confirm(`Tem certeza que deseja remover todos os itens da lista?`)) {
//                 limparLista(tipoLista);
//             }
//         };
        
//         container.style.position = 'relative';
        
//         container.appendChild(botaoLimpar);
//     };

//     // Atualizar contagem visual de itens por tipo
//     const atualizarContagemVisual = (tipoLista) => {
//         const config = listas[tipoLista];
//         if (!config || !config.listaDom) return;
        
//         // Encontrar ou criar elemento para exibir contagem
//         let contadorEl = document.querySelector(`.contador-${tipoLista}`);
//         if (!contadorEl) {
//             const containerLista = config.listaDom.parentElement;
//             if (containerLista) {
//                 contadorEl = document.createElement('div');
//                 contadorEl.className = `contador-${tipoLista} text-xs text-gray-600 mt-2 ml-2`;
//                 containerLista.insertAdjacentElement('afterend', contadorEl);
//             }
//         }
        
//         if (contadorEl) {
//             // Calcular total
//             let total = 0;
//             if (tipoLista === 'palavras') {
//                 total = dadosAvaliacao.words.length;
//                 contadorEl.textContent = `Total de palavras: ${total}`;
//             } else if (tipoLista === 'pseudopalavras') {
//                 total = dadosAvaliacao.pseudowords.length;
//                 contadorEl.textContent = `Total de pseudopalavras: ${total}`;
//             } else if (tipoLista === 'frases') {
//                 total = dadosAvaliacao.phrases.length;
//                 contadorEl.textContent = `Total de frases: ${total}`;
//             }
            
//             // Adicionar classes visuais baseadas na quantidade
//             contadorEl.classList.remove('text-green-600', 'text-yellow-600', 'text-red-600');
//             if (total > 0) {
//                 contadorEl.classList.add('text-green-600');
//             }
//         }
//     };
    
//     // Atualizar contagens visuais para todos os tipos
//     const atualizarTodasContagens = () => {
//         Object.keys(listas).forEach(tipoLista => {
//             atualizarContagemVisual(tipoLista);
//         });
//     };

//     // Criar botões de limpar para cada lista
//     Object.keys(listas).forEach(tipoLista => {
//         criarBotaoLimparLista(tipoLista);
//     });

//     // Adicionar event listeners para os botões
//     btnPalavras.addEventListener('click', adicionarPalavras);
//     btnPseudopalavras.addEventListener('click', adicionarPseudopalavras);
//     btnAdicionarFrase.addEventListener('click', adicionarFrases);

//     // Adicionar event listeners para tecla Enter nos campos de texto
//     window.addEventListener("keydown", (e) => {
//         if (e.key === "Enter") {
//             if (document.activeElement === novaPalavra) {
//                 adicionarPalavras();
//                 e.preventDefault();
//             } else if (document.activeElement === novaPseudopalavra) {
//                 adicionarPseudopalavras();
//                 e.preventDefault();
//             } else if (document.activeElement === novaFrase) {
//                 adicionarFrases();
//                 e.preventDefault();
//             }
//         }
//     });

//     // Função para popular as listas com dados existentes
//     const popularListasDeDados = () => {
//         Object.keys(listas).forEach(tipoLista => {
//             limparLista(tipoLista);
//         });
        
//         dadosAvaliacao.words.forEach(palavra => {
//             adicionarItem('palavras', palavra);
//         });
        
//         dadosAvaliacao.pseudowords.forEach(pseudopalavra => {
//             adicionarItem('pseudopalavras', pseudopalavra);
//         });
        
//         dadosAvaliacao.phrases.forEach(frase => {
//             if (typeof frase === 'object' && frase.text) {
//                 adicionarItem('frases', frase.text);
//             } else if (typeof frase === 'string') {
//                 adicionarItem('frases', frase);
//             }
//         });
        
//         // Atualizar todos os contadores visuais
//         atualizarTodasContagens();
        
//         console.log('Listas de dados populadas:', {
//             palavras: dadosAvaliacao.words.length,
//             pseudopalavras: dadosAvaliacao.pseudowords.length,
//             frases: dadosAvaliacao.phrases.length
//         });
//     };

//     // Configurar funcionalidade de adicionar questões
    