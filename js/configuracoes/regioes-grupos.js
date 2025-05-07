// Script para gerenciamento de regiões e grupos

document.addEventListener('DOMContentLoaded', function() {
    // Elementos das abas
    const tabRegioes = document.getElementById('tab-regioes');
    const tabGrupos = document.getElementById('tab-grupos');
    const secaoRegioes = document.getElementById('secao-regioes');
    const secaoGrupos = document.getElementById('secao-grupos');
    
    // Elementos do formulário de regiões
    const formRegiao = document.getElementById('form-regiao');
    const nomeRegiao = document.getElementById('nome-regiao');
    const descricaoRegiao = document.getElementById('descricao-regiao');
    
    // Elementos do formulário de grupos
    const formGrupo = document.getElementById('form-grupo');
    const nomeGrupo = document.getElementById('nome-grupo');
    const descricaoGrupo = document.getElementById('descricao-grupo');
    const regiaoGrupo = document.getElementById('regiao-grupo');
    
    // Elementos das tabelas
    const tabelaRegioes = document.getElementById('tabela-regioes');
    const tabelaGrupos = document.getElementById('tabela-grupos');
    
    // Inicializar
    init();
    
    /**
     * Inicializa a página
     */
    function init() {
        // Configurar alternância entre abas
        configurarAbas();
        
        // Carregar dados iniciais
        carregarRegioes();
        carregarGrupos();
        
        // Configurar eventos de formulários
        configurarFormularios();
    }
    
    /**
     * Configura a alternância entre as abas
     */
    function configurarAbas() {
        tabRegioes.addEventListener('click', function() {
            // Ativar aba de regiões
            tabRegioes.classList.add('border-blue-500', 'text-blue-600');
            tabRegioes.classList.remove('border-transparent', 'text-gray-500');
            
            // Desativar aba de grupos
            tabGrupos.classList.add('border-transparent', 'text-gray-500');
            tabGrupos.classList.remove('border-blue-500', 'text-blue-600');
            
            // Mostrar/ocultar seções
            secaoRegioes.classList.remove('hidden');
            secaoGrupos.classList.add('hidden');
        });
        
        tabGrupos.addEventListener('click', function() {
            // Ativar aba de grupos
            tabGrupos.classList.add('border-blue-500', 'text-blue-600');
            tabGrupos.classList.remove('border-transparent', 'text-gray-500');
            
            // Desativar aba de regiões
            tabRegioes.classList.add('border-transparent', 'text-gray-500');
            tabRegioes.classList.remove('border-blue-500', 'text-blue-600');
            
            // Mostrar/ocultar seções
            secaoGrupos.classList.remove('hidden');
            secaoRegioes.classList.add('hidden');
            
            // Recarregar regiões para o select
            carregarRegioesParaSelect();
        });
    }
    
    /**
     * Configura os eventos dos formulários
     */
    function configurarFormularios() {
        // Formulário de regiões
        formRegiao.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Validar dados
            if (!nomeRegiao.value.trim()) {
                alert('Por favor, informe o nome da região');
                return;
            }
            
            try {
                // Preparar dados
                const dados = {
                    name: nomeRegiao.value.trim(),
                    description: descricaoRegiao.value.trim()
                };
                
                // Enviar para API
                await window.RegionsGroupsAPI.createRegion(dados);
                
                // Limpar formulário
                formRegiao.reset();
                
                // Atualizar lista
                carregarRegioes();
                
                // Mensagem de sucesso
                alert('Região criada com sucesso!');
            } catch (error) {
                console.error('Erro ao criar região:', error);
                alert(`Erro ao criar região: ${error.message}`);
            }
        });
        
        // Formulário de grupos
        formGrupo.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Validar dados
            if (!nomeGrupo.value.trim()) {
                alert('Por favor, informe o nome do grupo');
                return;
            }
            
            if (!regiaoGrupo.value) {
                alert('Por favor, selecione uma região');
                return;
            }
            
            try {
                // Preparar dados
                const dados = {
                    name: nomeGrupo.value.trim(),
                    description: descricaoGrupo.value.trim(),
                    regionId: parseInt(regiaoGrupo.value)
                };
                
                // Enviar para API
                await window.RegionsGroupsAPI.createGroup(dados);
                
                // Limpar formulário
                formGrupo.reset();
                
                // Atualizar lista
                carregarGrupos();
                
                // Mensagem de sucesso
                alert('Grupo criado com sucesso!');
            } catch (error) {
                console.error('Erro ao criar grupo:', error);
                alert(`Erro ao criar grupo: ${error.message}`);
            }
        });
    }
    
    /**
     * Carrega as regiões da API e exibe na tabela
     */
    async function carregarRegioes() {
        try {
            // Mostrar indicador de carregamento
            tabelaRegioes.innerHTML = `
                <tr>
                    <td colspan="4" class="px-6 py-4 text-center text-gray-500">
                        <i class="fas fa-spinner fa-spin mr-2"></i> Carregando regiões...
                    </td>
                </tr>
            `;
            
            // Buscar regiões da API
            const regioes = await window.RegionsGroupsAPI.getAllRegions();
            
            // Verificar se há regiões
            if (regioes.length === 0) {
                tabelaRegioes.innerHTML = `
                    <tr>
                        <td colspan="4" class="px-6 py-4 text-center text-gray-500">
                            Nenhuma região cadastrada
                        </td>
                    </tr>
                `;
                return;
            }
            
            // Limpar tabela
            tabelaRegioes.innerHTML = '';
            
            // Adicionar regiões à tabela
            regioes.forEach(regiao => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ${regiao.id}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <div class="text-sm font-medium text-gray-900">${regiao.name}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ${regiao.description || ''}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button class="text-red-600 hover:text-red-900 excluir-regiao" data-id="${regiao.id}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                `;
                tabelaRegioes.appendChild(tr);
            });
            
            // Adicionar eventos aos botões de exclusão
            document.querySelectorAll('.excluir-regiao').forEach(btn => {
                btn.addEventListener('click', function() {
                    const id = this.getAttribute('data-id');
                    if (confirm('Tem certeza que deseja excluir esta região? Todos os grupos associados também serão excluídos.')) {
                        // Aqui implementaríamos a função de exclusão, mas não existe na API fornecida
                        alert('Funcionalidade de exclusão não implementada na API');
                    }
                });
            });
        } catch (error) {
            console.error('Erro ao carregar regiões:', error);
            tabelaRegioes.innerHTML = `
                <tr>
                    <td colspan="4" class="px-6 py-4 text-center text-red-500">
                        Erro ao carregar regiões: ${error.message}
                    </td>
                </tr>
            `;
        }
    }
    
    /**
     * Carrega os grupos da API e exibe na tabela
     */
    async function carregarGrupos() {
        try {
            // Mostrar indicador de carregamento
            tabelaGrupos.innerHTML = `
                <tr>
                    <td colspan="4" class="px-6 py-4 text-center text-gray-500">
                        <i class="fas fa-spinner fa-spin mr-2"></i> Carregando grupos...
                    </td>
                </tr>
            `;
            
            // Buscar grupos da API
            const grupos = await window.RegionsGroupsAPI.getAllGroups();
            
            // Verificar se há grupos
            if (grupos.length === 0) {
                tabelaGrupos.innerHTML = `
                    <tr>
                        <td colspan="4" class="px-6 py-4 text-center text-gray-500">
                            Nenhum grupo cadastrado
                        </td>
                    </tr>
                `;
                return;
            }
            
            // Buscar regiões para referência
            const regioes = await window.RegionsGroupsAPI.getAllRegions();
            const regioesMap = new Map(regioes.map(r => [r.id, r]));
            
            // Limpar tabela
            tabelaGrupos.innerHTML = '';
            
            // Adicionar grupos à tabela
            grupos.forEach(grupo => {
                const regiao = regioesMap.get(grupo.regionId);
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ${grupo.id}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <div class="text-sm font-medium text-gray-900">${grupo.name}</div>
                        <div class="text-xs text-gray-500">${grupo.description || ''}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ${regiao ? regiao.name : 'Região não encontrada'}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button class="text-red-600 hover:text-red-900 excluir-grupo" data-id="${grupo.id}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                `;
                tabelaGrupos.appendChild(tr);
            });
            
            // Adicionar eventos aos botões de exclusão
            document.querySelectorAll('.excluir-grupo').forEach(btn => {
                btn.addEventListener('click', function() {
                    const id = this.getAttribute('data-id');
                    if (confirm('Tem certeza que deseja excluir este grupo?')) {
                        // Aqui implementaríamos a função de exclusão, mas não existe na API fornecida
                        alert('Funcionalidade de exclusão não implementada na API');
                    }
                });
            });
        } catch (error) {
            console.error('Erro ao carregar grupos:', error);
            tabelaGrupos.innerHTML = `
                <tr>
                    <td colspan="4" class="px-6 py-4 text-center text-red-500">
                        Erro ao carregar grupos: ${error.message}
                    </td>
                </tr>
            `;
        }
    }
    
    /**
     * Carrega as regiões para o select no formulário de grupos
     */
    async function carregarRegioesParaSelect() {
        try {
            // Limpar select
            regiaoGrupo.innerHTML = '<option value="">Carregando regiões...</option>';
            
            // Buscar regiões da API
            const regioes = await window.RegionsGroupsAPI.getAllRegions();
            
            // Verificar se há regiões
            if (regioes.length === 0) {
                regiaoGrupo.innerHTML = '<option value="">Nenhuma região disponível</option>';
                return;
            }
            
            // Adicionar opção padrão
            regiaoGrupo.innerHTML = '<option value="">Selecione uma região</option>';
            
            // Adicionar regiões ao select
            regioes.forEach(regiao => {
                const option = document.createElement('option');
                option.value = regiao.id;
                option.textContent = regiao.name;
                regiaoGrupo.appendChild(option);
            });
        } catch (error) {
            console.error('Erro ao carregar regiões para select:', error);
            regiaoGrupo.innerHTML = '<option value="">Erro ao carregar regiões</option>';
        }
    }
}); 