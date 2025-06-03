// Script para editar avaliação

document.addEventListener('DOMContentLoaded', () => {
  // Verificar se já existem botões de edição e adicionar event listeners
  adicionarEventListenersEditarAvaliacao();
  
  // Configurar botões de adicionar itens
  configurarBotoesAdicionarItens();
});

// Função para adicionar event listeners aos botões de editar avaliação
function adicionarEventListenersEditarAvaliacao() {
  const botoesEditar = document.querySelectorAll('.btn-editar-avaliacao');
  
  botoesEditar.forEach(botao => {
    botao.addEventListener('click', (e) => {
      const id = e.currentTarget.getAttribute('data-id');
      abrirModalEditarAvaliacao(id);
    });
  });
}

// Função para abrir o modal de edição com os dados da avaliação
async function abrirModalEditarAvaliacao(id) {
  try {
    // Inicializar arrays para evitar problemas com botões de remover
    window.palavrasAdicionadas = [];
    window.pseudopalavrasAdicionadas = [];
    window.frasesAdicionadas = [];
    window.avaliacaoAtual = null; // Armazenar dados completos da avaliação
    localStorage.setItem('id', id);
    
    // Buscar dados da avaliação
    let path_base = 'https://salf-salf-api2.gkgtsp.easypanel.host/api';
    let headers = {
        'Authorization': `Bearer ${getAuthToken()}`,
        'Content-Type': 'application/json'
    };
    const avaliacao = await fetch(path_base + `/assessments/${id}`, {
        headers: headers
    });
    const response = await avaliacao.json();
    window.palavrasAdicionadas = response.words;
    window.pseudopalavrasAdicionadas = response.pseudowords;
    window.frasesAdicionadas = response.phrases.map(frase => frase.text);
    window.questoesAdicionadas = response.questions;
    window.nomeAvaliacao = response.name;
    window.textoAvaliacao = response.text;
    
    // Armazenar dados completos da avaliação
    window.avaliacaoAtual = response;
    console.log(window.avaliacaoAtual)
    
    // Referências aos elementos do modal
    const modal = document.getElementById('modal-avaliacao');
    const tituloModal = modal.querySelector('h3');
    const formAvaliacao = document.getElementById('form-avaliacao');
    const btnSalvar = document.getElementById('btn-salvar-avaliacao');
    
    // Atualizar título do modal
    tituloModal.textContent = 'Editar Avaliação';
    
    // Preencher o formulário com os dados da avaliação
    document.getElementById('nome-avaliacao').value = response.name || '';
    
    // Preencher o texto
    const textoAvaliacao = document.getElementById('texto-avaliacao');
    textoAvaliacao.value = response.text || '';
    
    // Atualizar contagem de palavras
    const contagemPalavras = document.getElementById('contagem-palavras');
    const texto = textoAvaliacao.value.trim();
    const palavras = texto === '' ? 0 : texto.split(/\s+/).length;
    contagemPalavras.textContent = palavras;
    
    // Mudar cor baseado na contagem
    if (palavras < 150 || palavras > 180) {
      contagemPalavras.classList.add('text-red-500');
      contagemPalavras.classList.remove('text-green-500');
    } else {
      contagemPalavras.classList.add('text-green-500');
      contagemPalavras.classList.remove('text-red-500');
    }
    
    // Limpar listas existentes
    const listaPalavras = document.getElementById('lista-palavras');
    const listaPseudopalavras = document.getElementById('lista-pseudopalavras');
    const listaFrases = document.getElementById('lista-frases');
    
    listaPalavras.innerHTML = '';
    listaPseudopalavras.innerHTML = '';
    listaFrases.innerHTML = '';
    
    // Adicionar palavras, se houverem
    if (response.words && response.words.length > 0) {
      response.words.forEach(palavra => {
        adicionarPalavraAoDOM(palavra);
        window.palavrasAdicionadas.push(palavra);
      });
    }
    
    // Adicionar pseudopalavras, se houverem
    if (response.pseudowords && response.pseudowords.length > 0) {
      response.pseudowords.forEach(pseudopalavra => {
        adicionarPseudopalavraAoDOM(pseudopalavra);
        window.pseudopalavrasAdicionadas.push(pseudopalavra);
      });
    }
    
    // Adicionar frases, se houverem
    if (response.phrases && response.phrases.length > 0) {
      response.phrases.forEach(frase => {
        const texto = frase.text || frase;
        adicionarFraseAoDOM(texto);
        window.frasesAdicionadas.push(texto);
      });
    }
    
    // Limpar questões existentes
    const containerQuestoes = document.getElementById('container-questoes');
    const semQuestoes = document.getElementById('sem-questoes');
    
    // Remover questões existentes, exceto o template
    containerQuestoes.querySelectorAll('.questao:not(.questao-template)').forEach(el => el.remove());
    
    // Mostrar "sem questões" se não houver questões
    if (!response.questions || response.questions.length === 0) {
      semQuestoes.classList.remove('hidden');
    } else {
      semQuestoes.classList.add('hidden');
      
      // Adicionar questões
      response.questions.forEach(questao => {
        adicionarQuestaoExistente(questao);
      });
    }
    
    // Armazenar ID da avaliação sendo editada
    formAvaliacao.setAttribute('data-editing-id', id);
    
    // Atualizar evento de submit do formulário
    formAvaliacao.onsubmit = async (e) => {
      e.preventDefault();
      await salvarEdicaoAvaliacao(id);
    };
    
    // Mostrar o modal
    modal.classList.remove('hidden');
    
  } catch (error) {
    console.error('Erro ao carregar avaliação para edição:', error);
    alert(`Erro ao carregar avaliação: ${error.message}`);
  }
}

// Função para adicionar palavra ao DOM
function adicionarPalavraAoDOM(palavra) {
  const listaPalavras = document.getElementById('lista-palavras');
  
  const div = document.createElement('div');
  div.className = 'bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center';
  div.innerHTML = `
    ${palavra}
    <button type="button" class="ml-2 text-blue-600 hover:text-blue-800" data-palavra="${palavra}">
      <i class="fas fa-times-circle"></i>
    </button>
  `;
  
  div.querySelector('button').addEventListener('click', function() {
    const palavraParaRemover = this.getAttribute('data-palavra');
    
    // Verificar se o array existe antes de usar filter
    if (window.palavrasAdicionadas) {
      window.palavrasAdicionadas = window.palavrasAdicionadas.filter(p => p !== palavraParaRemover);
    } else {
      console.warn('Array palavrasAdicionadas não está definido');
      window.palavrasAdicionadas = [];
    }
    
    div.remove();
  });
  
  listaPalavras.appendChild(div);
}

// Função para adicionar pseudopalavra ao DOM
function adicionarPseudopalavraAoDOM(pseudopalavra) {
  const listaPseudopalavras = document.getElementById('lista-pseudopalavras');
  
  const div = document.createElement('div');
  div.className = 'bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm flex items-center';
  div.innerHTML = `
    ${pseudopalavra}
    <button type="button" class="ml-2 text-purple-600 hover:text-purple-800" data-pseudopalavra="${pseudopalavra}">
      <i class="fas fa-times-circle"></i>
    </button>
  `;
  
  div.querySelector('button').addEventListener('click', function() {
    const pseudopalavraParaRemover = this.getAttribute('data-pseudopalavra');
    
    // Verificar se o array existe antes de usar filter
    if (window.pseudopalavrasAdicionadas) {
      window.pseudopalavrasAdicionadas = window.pseudopalavrasAdicionadas.filter(p => p !== pseudopalavraParaRemover);
    } else {
      console.warn('Array pseudopalavrasAdicionadas não está definido');
      window.pseudopalavrasAdicionadas = [];
    }
    
    div.remove();
  });
  
  listaPseudopalavras.appendChild(div);
}

// Função para adicionar frase ao DOM
function adicionarFraseAoDOM(frase) {
  const listaFrases = document.getElementById('lista-frases');
  
  const div = document.createElement('div');
  div.className = 'bg-green-100 text-green-800 px-3 py-2 rounded-md text-sm flex items-center justify-between';
  div.innerHTML = `
    <span class="flex-1">${frase}</span>
    <button type="button" class="ml-2 text-green-600 hover:text-green-800" data-frase="${frase}">
      <i class="fas fa-times-circle"></i>
    </button>
  `;
  
  div.querySelector('button').addEventListener('click', function() {
    const fraseParaRemover = this.getAttribute('data-frase');
    
    // Verificar se o array existe antes de usar filter
    if (window.frasesAdicionadas) {
      window.frasesAdicionadas = window.frasesAdicionadas.filter(f => f !== fraseParaRemover);
    } else {
      console.warn('Array frasesAdicionadas não está definido');
      window.frasesAdicionadas = [];
    }
    
    div.remove();
  });
  
  listaFrases.appendChild(div);
}

// Função para adicionar questão existente
function adicionarQuestaoExistente(questao) {
  const containerQuestoes = document.getElementById('container-questoes');
  const templateQuestao = document.getElementById('template-questao');
  const semQuestoes = document.getElementById('sem-questoes');
  
  // Esconder a mensagem "sem questões"
  semQuestoes.classList.add('hidden');
  
  // Clonar o template
  const novaQuestao = templateQuestao.cloneNode(true);
  novaQuestao.classList.remove('hidden', 'questao-template');
  novaQuestao.classList.add('questao');
  
  // Atribuir ID único à questão
  const questaoId = Date.now();
  novaQuestao.id = `questao-${questaoId}`;
  
  // Preencher o enunciado
  const enunciado = novaQuestao.querySelector('.enunciado-questao');
  enunciado.value = questao.text || '';
  
  // Limpar as opções padrão
  const opcoesContainer = novaQuestao.querySelectorAll('.opcao-container');
  opcoesContainer.forEach(opcao => opcao.remove());
  
  // Atualizar nome do grupo de radio buttons
  const radioName = `resposta-correta-${questaoId}`;
  
  // Adicionar opções da questão
  if (questao.options && questao.options.length > 0) {
    questao.options.forEach((opcao, index) => {
      const opcaoContainer = document.createElement('div');
      opcaoContainer.className = 'opcao-container flex items-center';
      opcaoContainer.innerHTML = `
        <input type="radio" name="${radioName}" class="resposta-correta mr-2 h-4 w-4">
        <input type="text" class="texto-opcao flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
          value="${opcao}">
        <button type="button" class="btn-remover-opcao ml-2 text-red-500 hover:text-red-700">
          <i class="fas fa-times"></i>
        </button>
      `;
      
      // Adicionar event listener para o botão de remover
      opcaoContainer.querySelector('.btn-remover-opcao').addEventListener('click', function() {
        opcaoContainer.remove();
      });
      
      // Adicionar elemento ao container de opções
      novaQuestao.appendChild(opcaoContainer);
    });
    
    // Selecionar a primeira opção como correta por padrão (pode ser ajustado depois)
    const primeiroRadio = novaQuestao.querySelector('.resposta-correta');
    if (primeiroRadio) {
      primeiroRadio.checked = true;
    }
  }
  
  // Criar e adicionar botão para adicionar mais opções
  const btnAdicionarOpcao = document.createElement('button');
  btnAdicionarOpcao.type = 'button';
  btnAdicionarOpcao.className = 'btn-adicionar-opcao text-sm text-blue-600 hover:text-blue-800 mt-2';
  btnAdicionarOpcao.innerHTML = '<i class="fas fa-plus mr-1"></i> Adicionar alternativa';
  
  btnAdicionarOpcao.addEventListener('click', function() {
    const opcaoContainer = document.createElement('div');
    opcaoContainer.className = 'opcao-container flex items-center mt-2';
    opcaoContainer.innerHTML = `
      <input type="radio" name="${radioName}" class="resposta-correta mr-2 h-4 w-4">
      <input type="text" class="texto-opcao flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
        placeholder="Nova alternativa">
      <button type="button" class="btn-remover-opcao ml-2 text-red-500 hover:text-red-700">
        <i class="fas fa-times"></i>
      </button>
    `;
    
    // Adicionar event listener para o botão de remover
    opcaoContainer.querySelector('.btn-remover-opcao').addEventListener('click', function() {
      opcaoContainer.remove();
    });
    
    // Inserir antes do botão de adicionar opção
    novaQuestao.insertBefore(opcaoContainer, btnAdicionarOpcao);
  });
  
  novaQuestao.appendChild(btnAdicionarOpcao);
  
  // Configurar botão de remover questão
  novaQuestao.querySelector('.btn-remover-questao').addEventListener('click', function() {
    novaQuestao.remove();
    
    // Mostrar mensagem "sem questões" se não houver mais questões
    if (containerQuestoes.querySelectorAll('.questao').length === 0) {
      semQuestoes.classList.remove('hidden');
    }
  });
  
  // Adicionar a nova questão ao container
  containerQuestoes.appendChild(novaQuestao);
}

// Função para salvar a edição da avaliação
async function salvarEdicaoAvaliacao(id) {
  try {
    // Referências aos elementos do formulário
    const nomeAvaliacao = document.getElementById('nome-avaliacao').value;
    const textoAvaliacao = document.getElementById('texto-avaliacao').value;
    
    // Validar dados
    if (nomeAvaliacao.trim() === '') {
      alert('Por favor, informe o nome da avaliação.');
      return;
    }
    
    if (window.palavrasAdicionadas.length === 0) {
      alert('Por favor, adicione pelo menos uma palavra à avaliação.');
      return;
    }
    
    if (window.pseudopalavrasAdicionadas.length === 0) {
      alert('Por favor, adicione pelo menos uma pseudopalavra à avaliação.');
      return;
    }
    
    if (textoAvaliacao.trim() === '') {
      alert('Por favor, adicione o texto para a avaliação.');
      return;
    }
    
    // Coletar dados das questões
    const questoes = [];
    document.querySelectorAll('.questao:not(.questao-template)').forEach(questaoEl => {
      const enunciado = questaoEl.querySelector('.enunciado-questao').value;
      const opcoes = [];
      let respostaCorreta = null;
      
      questaoEl.querySelectorAll('.opcao-container').forEach((opcaoEl, index) => {
        const texto = opcaoEl.querySelector('.texto-opcao').value;
        const selecionada = opcaoEl.querySelector('.resposta-correta').checked;
        
        if (texto.trim()) {
          opcoes.push(texto);
          if (selecionada) {
            respostaCorreta = index;
          }
        }
      });
      
      if (enunciado.trim() && opcoes.length >= 2 && respostaCorreta !== null) {
        questoes.push({
          text: enunciado,
          options: opcoes,
          correctOption: respostaCorreta
        });
      }
    });
    
    // Criar objeto de dados para a API mantendo dados existentes
    const avaliacaoAtual = window.avaliacaoAtual || {};
    const dadosAvaliacao = {
      ...avaliacaoAtual, // Manter outros dados existentes
      name: nomeAvaliacao,
      text: textoAvaliacao,
      words: window.palavrasAdicionadas,
      pseudowords: window.pseudopalavrasAdicionadas,
      phrases: window.frasesAdicionadas.map(texto => ({ text: texto })),
      questions: questoes,
      totalWords: window.palavrasAdicionadas.length,
      totalPseudowords: window.pseudopalavrasAdicionadas.length,
      updatedAt: new Date().toISOString()
    };

    // Configurar a requisição PUT
    const path_base = 'https://salf-salf-api2.gkgtsp.easypanel.host/api';
    const url = `${path_base}/assessments/${id}`;
    const headers = {
      'Authorization': `Bearer ${getAuthToken()}`,
      'Content-Type': 'application/json'
    };

    // Fazer a requisição PUT
    const response = await fetch(url, {
      method: 'PUT',
      headers: headers,
      body: JSON.stringify(dadosAvaliacao)
    });

    // Verificar se a resposta foi bem sucedida
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Erro ao atualizar avaliação');
    }

    // Processar resposta
    const responseData = await response.json();
    console.log('Avaliação atualizada:', responseData);
    
    // Fechar o modal
    const modal = document.getElementById('modal-avaliacao');
    modal.classList.add('hidden');
    
    // Mostrar mensagem de sucesso
    alert('Avaliação atualizada com sucesso!');
    
    // Recarregar lista de avaliações
    if (typeof carregarAvaliacoes === 'function') {
      carregarAvaliacoes();
    } else {
      // Recarregar a página se a função não existir
      window.location.reload();
    }
  } catch (error) {
    console.error('Erro ao salvar avaliação:', error);
    alert(`Erro ao salvar avaliação: ${error.message}`);
  }
}

// Função para configurar botões de adicionar novos itens
function configurarBotoesAdicionarItens() {
  // Botão para adicionar palavra
  const btnAdicionarPalavra = document.getElementById('adicionar-palavra');
  const inputNovaPalavra = document.getElementById('nova-palavra');
  
  if (btnAdicionarPalavra && inputNovaPalavra) {
    btnAdicionarPalavra.addEventListener('click', (e) => {
      e.preventDefault();
      adicionarNovaPalavra();
    });
    
    // Também permitir adicionar com Enter
    inputNovaPalavra.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        adicionarNovaPalavra();
      }
    });
  }
  
  // Botão para adicionar pseudopalavra
  const btnAdicionarPseudopalavra = document.getElementById('adicionar-pseudopalavra');
  const inputNovaPseudopalavra = document.getElementById('nova-pseudopalavra');
  
  if (btnAdicionarPseudopalavra && inputNovaPseudopalavra) {
    btnAdicionarPseudopalavra.addEventListener('click', (e) => {
      e.preventDefault();
      adicionarNovaPseudopalavra();
    });
    
    // Também permitir adicionar com Enter
    inputNovaPseudopalavra.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        adicionarNovaPseudopalavra();
      }
    });
  }
  
  // Botão para adicionar frase
  const btnAdicionarFrase = document.getElementById('adicionar-frase');
  const inputNovaFrase = document.getElementById('nova-frase');
  
  if (btnAdicionarFrase && inputNovaFrase) {
    btnAdicionarFrase.addEventListener('click', (e) => {
      e.preventDefault();
      adicionarNovaFrase();
    });
    
    // Também permitir adicionar com Enter
    inputNovaFrase.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        adicionarNovaFrase();
      }
    });
  }
}

// Função para adicionar nova palavra
function adicionarNovaPalavra() {
  const inputNovaPalavra = document.getElementById('nova-palavra');
  const palavra = inputNovaPalavra.value.trim();
  
  if (palavra === '') {
    return;
  }
  
  // Garantir que o array existe
  if (!window.palavrasAdicionadas) {
    window.palavrasAdicionadas = [];
  }
  
  // Verificar se a palavra já existe
  if (window.palavrasAdicionadas.includes(palavra)) {
    alert('Esta palavra já foi adicionada.');
    return;
  }
  
  // Adicionar ao DOM e ao array
  adicionarPalavraAoDOM(palavra);
  window.palavrasAdicionadas.push(palavra);
  
  // Limpar o input
  inputNovaPalavra.value = '';
  inputNovaPalavra.focus();
}

// Função para adicionar nova pseudopalavra
function adicionarNovaPseudopalavra() {
  const inputNovaPseudopalavra = document.getElementById('nova-pseudopalavra');
  const pseudopalavra = inputNovaPseudopalavra.value.trim();
  
  if (pseudopalavra === '') {
    return;
  }
  
  // Garantir que o array existe
  if (!window.pseudopalavrasAdicionadas) {
    window.pseudopalavrasAdicionadas = [];
  }
  
  // Verificar se a pseudopalavra já existe
  if (window.pseudopalavrasAdicionadas.includes(pseudopalavra)) {
    alert('Esta pseudopalavra já foi adicionada.');
    return;
  }
  
  // Adicionar ao DOM e ao array
  adicionarPseudopalavraAoDOM(pseudopalavra);
  window.pseudopalavrasAdicionadas.push(pseudopalavra);
  
  // Limpar o input
  inputNovaPseudopalavra.value = '';
  inputNovaPseudopalavra.focus();
}

// Função para adicionar nova frase
function adicionarNovaFrase() {
  const inputNovaFrase = document.getElementById('nova-frase');
  const frase = inputNovaFrase.value.trim();
  
  if (frase === '') {
    return;
  }
  
  // Adicionar ponto final se não tiver
  let fraseFormatada = frase;
  if (!/[.!?]$/.test(fraseFormatada)) {
    fraseFormatada = fraseFormatada + '.';
  }
  
  // Garantir que o array existe
  if (!window.frasesAdicionadas) {
    window.frasesAdicionadas = [];
  }
  
  // Verificar se a frase já existe
  if (window.frasesAdicionadas.includes(fraseFormatada)) {
    alert('Esta frase já foi adicionada.');
    return;
  }
  
  // Adicionar ao DOM e ao array
  adicionarFraseAoDOM(fraseFormatada);
  window.frasesAdicionadas.push(fraseFormatada);
  
  // Limpar o input
  inputNovaFrase.value = '';
  inputNovaFrase.focus();
} 