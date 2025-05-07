// Script para editar eventos de avaliação

// Esperar que outros scripts sejam carregados primeiro
window.addEventListener('load', () => {
  // Verificar se a tabela de eventos existe
  const tabelaEventos = document.getElementById('tabela-eventos');
  if (!tabelaEventos) {
    console.warn('Tabela de eventos não encontrada');
    return;
  }

  // Adicionar observador de mudanças no DOM para capturar novos botões de edição
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
        // Verificar se foram adicionados novos botões de edição
        setTimeout(() => adicionarEventListenersEditarEvento(), 50);
      }
    });
  });

  // Configurar observador para monitorar mudanças na tabela
  observer.observe(tabelaEventos, { childList: true, subtree: true });

  // Também adicionar listeners para os botões que já existem
  setTimeout(() => adicionarEventListenersEditarEvento(), 100);
  
  // Corrigir a função original após um breve atraso
  setTimeout(() => corrigirEventListenersTabelaEventos(), 200);
});

/**
 * Adiciona event listeners aos botões de editar evento
 */
function adicionarEventListenersEditarEvento() {
  const botoesEditar = document.querySelectorAll('.editar-evento');
  console.log(`Encontrados ${botoesEditar.length} botões de editar evento`);

  botoesEditar.forEach(botao => {
    // Verificar se o botão já tem um atributo processado para evitar duplicação
    if (botao.getAttribute('data-processado') === 'true') {
      return;
    }
    
    // Marcar como processado
    botao.setAttribute('data-processado', 'true');
    
    // Adicionar event listener
    botao.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      
      const id = parseInt(this.getAttribute('data-id'));
      console.log(`Botão editar evento clicado para o ID: ${id}`);
      
      // Chamar a função para editar evento
      if (typeof editarEvento === 'function') {
        editarEvento(id);
      } else {
        console.error('Função editarEvento não está definida');
        alert('Função de edição de evento não está disponível');
      }
    });
  });
}

/**
 * Corrige a função adicionarEventListenersTabelaEventos 
 */
function corrigirEventListenersTabelaEventos() {
  // Verificar se a função original existe no escopo global
  if (typeof window.adicionarEventListenersTabelaEventos === 'function') {
    console.log('Corrigindo função adicionarEventListenersTabelaEventos');
    
    // Salvar a função original
    const funcaoOriginal = window.adicionarEventListenersTabelaEventos;
    
    // Sobrescrever a função
    window.adicionarEventListenersTabelaEventos = function() {
      console.log('Função adicionarEventListenersTabelaEventos corrigida sendo executada');
      
      // Remover todos os event listeners dos botões de editar
      document.querySelectorAll('.editar-evento').forEach(btn => {
        const novoBtn = btn.cloneNode(true);
        if (btn.parentNode) {
          btn.parentNode.replaceChild(novoBtn, btn);
        }
      });
      
      // Chamar a função original para configurar os listeners de excluir
      funcaoOriginal();
      
      // Adicionar novamente os event listeners de edição corretamente
      adicionarEventListenersEditarEvento();
    };
    
    // Executar a função corrigida se já houver botões
    if (document.querySelectorAll('.editar-evento').length > 0) {
      window.adicionarEventListenersTabelaEventos();
    }
  } else {
    console.warn('Função adicionarEventListenersTabelaEventos não encontrada para correção');
  }
} 