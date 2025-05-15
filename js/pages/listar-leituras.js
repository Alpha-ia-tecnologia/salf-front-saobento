// Script para listar os testes de leitura

document.addEventListener('DOMContentLoaded', async () => {
    // Referência à tabela
    const tabelaLeituras = document.getElementById('tabela-de-leituras');
    
    // Referência aos elementos de UI
    const loadingIndicator = document.getElementById('loading-indicator') || document.createElement('div');
    const errorMessage = document.getElementById('error-message') || document.createElement('div');
    
    try {
        // Mostrar indicador de carregamento (se existir)
        if (loadingIndicator.style) {
            loadingIndicator.style.display = 'block';
        }
        
        // Esconder mensagem de erro (se existir)
        if (errorMessage.style) {
            errorMessage.style.display = 'none';
        }
        
        // Buscar dados da API
        // const leituras = await fetch(path_base + '/reading-tests', {
        //     headers: headers
        // });
        // const response = await leituras.json();
        // console.log(response)   ;
        
        // Limpar tabela
        tabelaLeituras.innerHTML = '';
        
        // Verificar se há resultados
        if (leituras.length === 0) {
            tabelaLeituras.innerHTML = `
                <tr>
                    <td colspan="7" class="px-6 py-4 text-center text-gray-500">
                        Nenhum teste de leitura encontrado
                    </td>
                </tr>
            `;
            return;
        }
        
        // Preencher tabela com dados
        leituras.forEach(leitura => {
            // Formatação da data
            const data = new Date(leitura.createdAt);
            const dataFormatada = data.toLocaleDateString('pt-BR');
            
            // Criar linha para a tabela
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${leitura.id}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900">${leitura.student.name}</div>
                    <div class="text-sm text-gray-500">Matrícula: ${leitura.student.registrationNumber || 'N/A'}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${leitura.student.classGroup ? `${leitura.student.classGroup.name} (${leitura.student.classGroup.grade})` : 'N/A'}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${dataFormatada}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${leitura.assessment.name || 'N/A'}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getNivelClassColor(leitura.level)}">
                        Nível ${leitura.level || 'N/A'}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <button class="text-blue-600 hover:text-blue-900 btn-visualizar-leitura" data-id="${leitura.id}" title="Visualizar leitura">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="text-red-600 hover:text-red-900 btn-excluir-leitura" data-id="${leitura.id}" title="Excluir leitura">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            
            tabelaLeituras.appendChild(row);
        });
        
        // Configurar eventos para botões
        setupEventListeners();
        
    } catch (error) {
        console.error('Erro ao carregar testes de leitura:', error);
        
        // Exibir mensagem de erro (se o elemento existir)
        if (errorMessage.style) {
            errorMessage.style.display = 'block';
            errorMessage.textContent = `Erro ao carregar testes de leitura: ${error.message}`;
        }
        
        // Exibir mensagem de erro na tabela
        tabelaLeituras.innerHTML = `
            <tr>
                <td colspan="7" class="px-6 py-4 text-center text-red-500">
                    Falha ao carregar testes de leitura. Tente novamente mais tarde.
                </td>
            </tr>
        `;
    } finally {
        // Esconder indicador de carregamento (se existir)
        if (loadingIndicator.style) {
            loadingIndicator.style.display = 'none';
        }
    }
});

// Função para definir cor do nível de leitura
function getNivelClassColor(nivel) {
    switch(nivel) {
        case 1:
            return 'bg-red-100 text-red-800';
        case 2:
            return 'bg-yellow-100 text-yellow-800';
        case 3:
            return 'bg-green-100 text-green-800';
        case 4:
            return 'bg-blue-100 text-blue-800';
        case 5:
            return 'bg-purple-100 text-purple-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
}

// Configurar listeners de eventos para botões
function setupEventListeners() {
    // Botões de visualizar leitura
    document.querySelectorAll('.btn-visualizar-leitura').forEach(button => {
        button.addEventListener('click', (e) => {
            const id = e.currentTarget.getAttribute('data-id');
            window.location.href = `./visualizar.html?id=${id}`;
        });
    });
    
    // Botões de excluir leitura
    document.querySelectorAll('.btn-excluir-leitura').forEach(button => {
        button.addEventListener('click', async (e) => {
            const id = e.currentTarget.getAttribute('data-id');
            
            if (confirm('Tem certeza que deseja excluir este teste de leitura? Esta ação não pode ser desfeita.')) {
                try {
                    await window.ReadingTestAPI.deleteReadingTest(id);
                    alert('Teste de leitura excluído com sucesso!');
                    // Recarregar a página para atualizar a tabela
                    window.location.reload();
                } catch (error) {
                    console.error('Erro ao excluir teste de leitura:', error);
                    alert(`Erro ao excluir teste de leitura: ${error.message}`);
                }
            }
        });
    });
} 