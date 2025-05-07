document.addEventListener('DOMContentLoaded', function() {
    // Verificar se o usuário está autenticado
    const token = localStorage.getItem('token');
    if (!token) {
        console.log("Token não encontrado no dashboard, redirecionando para login");
        window.location.href = '../../../login.html';
        return;
    }
    
    // URL base da API
    const API_BASE_URL = "https://salf-salf-api.py5r5i.easypanel.host/api";
    
    // Headers padrão para requisições à API
    const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    };
    
    // Adicionar interceptador para tratar erros de autenticação global
    window.addEventListener('error', function(e) {
        // Se o erro estiver relacionado a um erro de rede, pode ser um problema de autenticação
        if (e.error && e.error.name === 'TypeError' && e.error.message.includes('fetch')) {
            console.warn('Possível erro de rede/autenticação detectado');
        }
    });
    
    // Log para debugging - mostrar como o sistema está configurado
    console.log("Sistema inicializado com:");
    console.log("- URL Base da API:", API_BASE_URL);
    console.log("- Autenticação:", token ? "Token presente" : "Sem token");
    
    /*
     * Estrutura do corpo JSON para os filtros:
     * {
     *   "regions": ["Norte", "Sul"], // Valores dos filtros de região (filtroRegiao)
     *   "groups": ["Municipal", "Estadual"], // Valores dos filtros de grupo (filtroGrupo)
     *   "schools": [{ id: 1, name: "Escola X", region: "Norte", group: "Municipal" }], // Escolas (filtroEscola)
     *   "schoolYears": [1, 2, 3], // Anos escolares (filtroAnoEscolar)
     *   "assessmentEvents": [{ id: 1, name: "Evento X" }] // Eventos de avaliação (filtroEvento)
     * }
     */
    
    // Referências aos elementos de filtro
    const filtroRegiao = document.getElementById('regiao');
    const filtroGrupo = document.getElementById('grupo');
    const filtroEscola = document.getElementById('escola');
    const filtroAnoEscolar = document.getElementById('ano-escolar');
    const filtroEvento = document.getElementById('evento');
    
    // Limpar todos os filtros para deixá-los só com a opção default
    limparFiltrosParaDefault();
    
    // Botões de ação
    const btnAplicarFiltros = document.getElementById('aplicar-filtros');
    const btnLimparFiltros = document.getElementById('limpar-filtros');
    
    // Inicializar os dados e os gráficos
    loadDashboardData();
    
    // Carregar dados de distribuição de níveis de leitura
    loadReadingLevelDistribution();
    
    // Carregar dados de desempenho por série
    loadPerformanceByGrade();
    
    // Carregar dados de evolução dos níveis de leitura
    loadReadingLevelEvolution();
    
    // Carregar dados de progressão anual
    loadYearlyProgression();
    
    // Carregar dados dos filtros
    loadFilterData();
    
    // Event Listeners
    if (filtroRegiao) {
        filtroRegiao.addEventListener('change', function() {
            atualizarFiltroEscolas();
        });
    }
    
    if (filtroGrupo) {
        filtroGrupo.addEventListener('change', function() {
            atualizarFiltroEscolas();
        });
    }
    
    if (btnAplicarFiltros) {
        btnAplicarFiltros.addEventListener('click', function() {
            aplicarFiltros();
        });
    }
    
    if (btnLimparFiltros) {
        btnLimparFiltros.addEventListener('click', function() {
            limparFiltros();
        });
    }
    
    // Função para limpar todos os filtros para o estado default
    function limparFiltrosParaDefault() {
        // Lista de todos os filtros
        const filtros = [filtroRegiao, filtroGrupo, filtroEscola, filtroAnoEscolar, filtroEvento];
        
        // Para cada filtro, remover todas as opções exceto a primeira (default)
        filtros.forEach(filtro => {
            if (filtro) {
                // Manter apenas a primeira opção (default)
                while (filtro.options.length > 1) {
                    filtro.remove(1);
                }
                // Selecionar a opção default
                filtro.selectedIndex = 0;
            }
        });
        
        console.log("Todos os filtros foram resetados para o estado default");
    }
    
    // Função para carregar dados dos filtros
    async function loadFilterData() {
        try {
            console.log("Carregando opções de filtro...");
            
            // Dados predefinidos para os filtros caso a API não retorne valores
            const defaultFilterData = {
                regions: ["test"],
                groups: ["test"],
                schools: [
                    {
                        id: 1,
                        name: "Maria Santos",
                        region: "test",
                        group: "test"
                    }
                ],
                schoolYears: [],
                assessmentEvents: [
                    {
                        id: 1,
                        name: "Nome do Evento"
                    }
                ]
            };
            
            // Buscar todas as opções de filtro de uma só vez
            let filterData = null; // Inicializar como null para que os filtros fiquem vazios se a API falhar
            
            try {
                const filterResponse = await fetch(`${API_BASE_URL}/dashboard/filter-options`, {
                    method: 'GET',
                    headers: headers
                });
                
                if (filterResponse.ok) {
                    const apiData = await filterResponse.json();
                    // Se a API retornar dados válidos, use-os
                    if (apiData) {
                        filterData = apiData;
                    }
                } else {
                    console.warn("API retornou status não-OK. Os filtros permanecerão vazios.");
                    return; // Sair da função e manter os filtros vazios
                }
            } catch (error) {
                console.warn("Erro ao buscar dados da API. Os filtros permanecerão vazios:", error);
                return; // Sair da função e manter os filtros vazios
            }
            
            // Se não houver dados, não prosseguir com o preenchimento dos filtros
            if (!filterData) {
                console.warn("Nenhum dado disponível para preencher os filtros");
                return;
            }
            
            console.log("Dados de filtro a serem usados:", filterData);
            
            /* 
             * Mapeamento dos campos para os selects HTML:
             * 
             * filterData.regions → select#regiao (Regiões)
             * filterData.groups → select#grupo (Grupos)
             * filterData.schools → select#escola (Escolas)
             * filterData.schoolYears → select#ano-escolar (Anos Escolares)
             * filterData.assessmentEvents → select#evento (Eventos de Avaliação)
             */
            
            // 1. Regiões (regions → select#regiao)
            if (filterData.regions && filterData.regions.length > 0) {
                console.log(`Preenchendo select 'regiao' com ${filterData.regions.length} opções`);
                populateFilter(filtroRegiao, filterData.regions);
            }
            
            // 2. Grupos (groups → select#grupo)
            if (filterData.groups && filterData.groups.length > 0) {
                console.log(`Preenchendo select 'grupo' com ${filterData.groups.length} opções`);
                populateFilter(filtroGrupo, filterData.groups);
            }
            
            // 3. Escolas (schools → select#escola)
            if (filterData.schools && filterData.schools.length > 0) {
                console.log(`Preenchendo select 'escola' com ${filterData.schools.length} opções`);
                populateSchoolFilter(filterData.schools);
            }
            
            // 4. Anos Escolares (schoolYears → select#ano-escolar)
            if (filterData.schoolYears && filterData.schoolYears.length > 0) {
                console.log(`Preenchendo select 'ano-escolar' com ${filterData.schoolYears.length} opções`);
                populateGradeLevelFilter(filterData.schoolYears);
            }
            
            // 5. Eventos de Avaliação (assessmentEvents → select#evento)
            if (filterData.assessmentEvents && filterData.assessmentEvents.length > 0) {
                console.log(`Preenchendo select 'evento' com ${filterData.assessmentEvents.length} opções`);
                populateEventFilter(filterData.assessmentEvents);
            }
        } catch (error) {
            console.error("Erro ao carregar dados dos filtros:", error);
        }
    }
    
    // Preencher o filtro de escolas (Campo 'schools' → select#escola)
    function populateSchoolFilter(schools) {
        if (!filtroEscola) {
            console.warn("Elemento select#escola não encontrado");
            return;
        }
        
        console.log("Preenchendo select de escolas com:", schools);
        
        // Limpar opções atuais, mantendo a opção default
        while (filtroEscola.options.length > 1) {
            filtroEscola.remove(1);
        }
        
        // Adicionar as escolas ao select
        schools.forEach(school => {
            const option = document.createElement('option');
            option.value = school.id;
            option.textContent = school.name;
            
            // Adicionar informações extras como atributos de dados se disponíveis
            if (school.region) {
                option.dataset.region = school.region;
            }
            if (school.group) {
                option.dataset.group = school.group;
            }
            
            filtroEscola.appendChild(option);
        });
    }
    
    // Preencher o filtro de ano escolar (Campo 'schoolYears' → select#ano-escolar)
    function populateGradeLevelFilter(schoolYears) {
        if (!filtroAnoEscolar) {
            console.warn("Elemento select#ano-escolar não encontrado");
            return;
        }
        
        console.log("Preenchendo select de anos escolares com:", schoolYears);
        
        // Limpar opções atuais, mantendo a opção default
        while (filtroAnoEscolar.options.length > 1) {
            filtroAnoEscolar.remove(1);
        }
        
        // Adicionar os anos escolares ao select
        schoolYears.forEach(year => {
            const option = document.createElement('option');
            option.value = year;
            option.textContent = year + "º Ano";
            filtroAnoEscolar.appendChild(option);
        });
    }
    
    // Preencher o filtro de eventos (Campo 'assessmentEvents' → select#evento)
    function populateEventFilter(events) {
        if (!filtroEvento) {
            console.warn("Elemento select#evento não encontrado");
            return;
        }
        
        console.log("Preenchendo select de eventos com:", events);
        
        // Limpar opções atuais, mantendo a opção default
        while (filtroEvento.options.length > 1) {
            filtroEvento.remove(1);
        }
        
        // Adicionar os eventos ao select
        events.forEach(event => {
            const option = document.createElement('option');
            option.value = event.id;
            option.textContent = event.name;
            filtroEvento.appendChild(option);
        });
    }
    
    // Função auxiliar para preencher filtros genéricos:
    // - Campo 'regions' → select#regiao
    // - Campo 'groups' → select#grupo
    function populateFilter(filterElement, options) {
        if (!filterElement) {
            console.warn("Elemento select não encontrado");
            return;
        }
        
        console.log(`Preenchendo select com id=${filterElement.id} com:`, options);
        
        // Limpar opções atuais, mantendo a opção default
        while (filterElement.options.length > 1) {
            filterElement.remove(1);
        }
        
        // Adicionar as opções ao select
        options.forEach(optionValue => {
            const option = document.createElement('option');
            option.value = optionValue;
            option.textContent = optionValue;
            filterElement.appendChild(option);
        });
    }
    
    // Atualizar o filtro de escolas com base nos outros filtros
    function atualizarFiltroEscolas() {
        const regiaoSelecionada = filtroRegiao.value;
        const grupoSelecionado = filtroGrupo.value;
        
        console.log(`Atualizando filtro de escolas com região="${regiaoSelecionada}" e grupo="${grupoSelecionado}"`);
        
        // Limpar o filtro de escolas antes de carregar novos dados
        if (filtroEscola) {
            // Manter apenas a primeira opção (default)
            while (filtroEscola.options.length > 1) {
                filtroEscola.remove(1);
            }
            // Selecionar a opção default
            filtroEscola.selectedIndex = 0;
        }
        
        // Se não houver filtros selecionados, não fazer requisição
        if (!regiaoSelecionada && !grupoSelecionado) {
            console.log("Nenhum filtro selecionado, mantendo filtro de escolas vazio");
            return;
        }
        
        // Montar a URL com parâmetros de consulta
        let url = `${API_BASE_URL}/dashboard/filter-options`;
        let params = [];
        if (regiaoSelecionada) params.push(`region=${encodeURIComponent(regiaoSelecionada)}`);
        if (grupoSelecionado) params.push(`group=${encodeURIComponent(grupoSelecionado)}`);
        if (params.length > 0) {
            url += '?' + params.join('&');
        }
        
        // Fazer a requisição à API
        fetch(url, {
            method: 'GET',
            headers: headers
        })
        .then(response => {
            if (response.ok) {
                return response.json();
            }
            console.warn("API retornou status não-OK. O filtro de escolas permanecerá vazio.");
            return { schools: [] }; // Retornar array vazio
        })
        .then(data => {
            if (data.schools && data.schools.length > 0) {
                populateSchoolFilter(data.schools);
            } else {
                console.log("Nenhuma escola encontrada com os filtros aplicados.");
                // Não fazer nada, manter o filtro vazio
            }
        })
        .catch(error => {
            console.error("Erro ao filtrar escolas:", error);
            // Não usar dados predefinidos, manter o filtro vazio
        });
    }
    
    // Função para aplicar filtros aos dados do dashboard
    function aplicarFiltros() {
        // Capturar valores dos filtros
        const filtros = {
            regiao: filtroRegiao.value,
            grupo: filtroGrupo.value,
            escola: filtroEscola.value,
            anoEscolar: filtroAnoEscolar.value,
            turma: document.getElementById('turma') ? document.getElementById('turma').value : '',
            evento: filtroEvento.value
        };
        
        // Exibir os filtros aplicados no console
        console.log('Filtros aplicados:', filtros);
        
        // Montar a string de query com base nos filtros para a API
        // Usando os nomes de parâmetros exatos conforme a documentação
        let queryParams = [];
        if (filtros.escola) queryParams.push(`schoolId=${filtros.escola}`);
        if (filtros.anoEscolar) queryParams.push(`gradeLevel=${filtros.anoEscolar}`);
        if (filtros.turma) queryParams.push(`classGroupId=${filtros.turma}`);
        if (filtros.evento) queryParams.push(`assessmentEventId=${filtros.evento}`);
        
        const queryString = queryParams.join('&');
        
        // Buscar os dados filtrados
        loadDashboardData(queryString);
        
        // Buscar dados específicos para o gráfico de distribuição de níveis de leitura
        loadReadingLevelDistribution(queryString);
        
        // Buscar dados específicos para o gráfico de desempenho por série
        loadPerformanceByGrade(queryString);
        
        // Buscar dados específicos para o gráfico de evolução dos níveis de leitura
        loadReadingLevelEvolution(queryString);
        
        // Buscar dados específicos para o gráfico de progressão anual
        loadYearlyProgression(queryString);
    }
    
    // Nova função para carregar dados de evolução dos níveis de leitura
    async function loadReadingLevelEvolution(queryString = '') {
        try {
            // Debug - verificar se a função está sendo chamada
            console.log("🔍 Iniciando carregamento de dados de evolução dos níveis de leitura...");
            
            // Mostrar indicador de carregamento
            showLoading(true);
            
            // URL específica para dados de evolução dos níveis de leitura
            const url = `${API_BASE_URL}/dashboard/reading-level-evolution${queryString ? '?' + queryString : ''}`;
            console.log("📡 URL para dados de evolução:", url);
            
            // Configuração da requisição
            const requestOptions = {
                method: 'GET',
                headers: headers
            };
            
            console.log("🔑 Headers da requisição:", JSON.stringify(headers));
            
            // Fetch dados
            console.log("⏳ Iniciando requisição para dados de evolução...");
            const response = await fetch(url, requestOptions);
            console.log("✓ Resposta recebida. Status:", response.status);
            
            if (!response.ok) {
                // Verificar se é um erro de autenticação
                if (response.status === 401 || response.status === 403) {
                    console.error("❌ Erro de autenticação:", response.status);
                    
                    // Limpar dados de autenticação e redirecionar para login
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    
                    alert('Sua sessão expirou. Por favor, faça login novamente.');
                    window.location.href = '../../../login.html';
                    return;
                }
                
                throw new Error(`Erro ao buscar dados de evolução: ${response.status} ${response.statusText}`);
            }
            
            const evolutionData = await response.json();
            console.log("📊 Dados de evolução recebidos:", evolutionData);
            
            // Verificar se os dados estão no formato esperado
            if (!evolutionData || !evolutionData.evolution || !evolutionData.evolution.length) {
                console.warn("⚠️ Formato de dados inválido ou ausente:", evolutionData);
                // Usar dados de exemplo
                evolutionData = { evolution: getExampleEvolutionData() };
                console.log("🔄 Usando dados de exemplo:", evolutionData);
            }
            
            // Atualizar o gráfico de linha com os dados recebidos
            console.log("🎨 Atualizando gráfico de evolução dos níveis de leitura...");
            updateReadingLevelEvolutionChart(evolutionData);
            console.log("✓ Gráfico de evolução atualizado com sucesso!");
            
            // Esconder indicador de carregamento
            showLoading(false);
        } catch (error) {
            console.error("❌ Erro ao carregar dados de evolução:", error);
            // Usar dados de exemplo em caso de erro
            const exampleData = { evolution: getExampleEvolutionData() };
            console.log("🔄 Usando dados de exemplo devido a erro:", exampleData);
            updateReadingLevelEvolutionChart(exampleData);
            showLoading(false);
        }
    }
    
    // Função para atualizar o gráfico de evolução dos níveis de leitura
    function updateReadingLevelEvolutionChart(data) {
        if (!data || !data.evolution || !data.evolution.length) {
            console.warn('Dados de evolução não encontrados ou vazios');
            // Usar dados de exemplo se não houver dados reais
            data = { evolution: getExampleEvolutionData() };
        }
        
        const ctxEvolucao = document.getElementById('chart-evolucao');
        if (!ctxEvolucao) {
            console.warn('Elemento #chart-evolucao não encontrado');
            return;
        }
        
        // Verificar se já existe um gráfico e destruí-lo
        let existingChart = Chart.getChart(ctxEvolucao);
        if (existingChart) {
            existingChart.destroy();
        }
        
        // Extrair dados do formato fornecido pela API
        const evolutionData = data.evolution;
        
        // Extrair nomes dos eventos para os labels do eixo X
        const labels = evolutionData.map(event => event.eventName);
        
        // Mapear níveis para datasets
        const levelDatasets = {};
        const colors = {
            1: { border: '#FF6384', background: 'rgba(255, 99, 132, 0.1)' },  // Não Leitor
            2: { border: '#36A2EB', background: 'rgba(54, 162, 235, 0.1)' },  // Leitor de Sílabas
            3: { border: '#FFCE56', background: 'rgba(255, 206, 86, 0.1)' },  // Leitor de Palavras
            4: { border: '#4BC0C0', background: 'rgba(75, 192, 192, 0.1)' },  // Leitor de Frases
            5: { border: '#9966FF', background: 'rgba(153, 102, 255, 0.1)' }, // Leitor de Texto sem Fluência
            6: { border: '#FF9F40', background: 'rgba(255, 159, 64, 0.1)' }   // Leitor de Texto com Fluência
        };
        
        // Inicializar datasets para cada nível
        for (let i = 1; i <= 6; i++) {
            levelDatasets[i] = {
                data: [],
                label: '',
                borderColor: colors[i].border,
                backgroundColor: colors[i].background,
                fill: true,
                tension: 0.4
            };
        }
        
        // Preencher os dados para cada evento e nível
        evolutionData.forEach(event => {
            event.distribution.forEach(item => {
                if (levelDatasets[item.level]) {
                    levelDatasets[item.level].data.push(item.percentage);
                    levelDatasets[item.level].label = item.name;
                }
            });
        });
        
        // Converter o objeto de datasets em um array
        const datasets = Object.values(levelDatasets).filter(dataset => dataset.label);
        
        // Estrutura de dados para o gráfico de evolução
        const evolucaoData = {
            labels: labels,
            datasets: datasets
        };
        
        new Chart(ctxEvolucao, {
            type: 'line',
            data: evolucaoData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                            callback: function(value) {
                                return value + '%';
                            }
                        }
                    }
                },
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            boxWidth: 12,
                            font: {
                                size: 10
                            }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            title: function(tooltipItem) {
                                return 'Evento: ' + tooltipItem[0].label;
                            },
                            label: function(context) {
                                return context.dataset.label + ': ' + context.raw + '%';
                            }
                        }
                    }
                }
            }
        });
    }

    // Dados de exemplo para o gráfico de evolução dos níveis de leitura
    function getExampleEvolutionData() {
        // Array de eventos com distribuição de níveis
        return [
            {
                eventId: 1,
                eventName: "Avaliação Diagnóstica",
                distribution: [
                    { level: 1, name: "Não Leitor", percentage: 30 },
                    { level: 2, name: "Leitor de Sílabas", percentage: 25 },
                    { level: 3, name: "Leitor de Palavras", percentage: 20 },
                    { level: 4, name: "Leitor de Frases", percentage: 15 },
                    { level: 5, name: "Leitor de Texto sem Fluência", percentage: 7 },
                    { level: 6, name: "Leitor de Texto com Fluência", percentage: 3 }
                ]
            },
            {
                eventId: 2,
                eventName: "Avaliação Formativa 1",
                distribution: [
                    { level: 1, name: "Não Leitor", percentage: 25 },
                    { level: 2, name: "Leitor de Sílabas", percentage: 22 },
                    { level: 3, name: "Leitor de Palavras", percentage: 20 },
                    { level: 4, name: "Leitor de Frases", percentage: 18 },
                    { level: 5, name: "Leitor de Texto sem Fluência", percentage: 10 },
                    { level: 6, name: "Leitor de Texto com Fluência", percentage: 5 }
                ]
            },
            {
                eventId: 3,
                eventName: "Avaliação Formativa 2",
                distribution: [
                    { level: 1, name: "Não Leitor", percentage: 20 },
                    { level: 2, name: "Leitor de Sílabas", percentage: 20 },
                    { level: 3, name: "Leitor de Palavras", percentage: 18 },
                    { level: 4, name: "Leitor de Frases", percentage: 20 },
                    { level: 5, name: "Leitor de Texto sem Fluência", percentage: 12 },
                    { level: 6, name: "Leitor de Texto com Fluência", percentage: 10 }
                ]
            },
            {
                eventId: 4,
                eventName: "Avaliação Final",
                distribution: [
                    { level: 1, name: "Não Leitor", percentage: 15 },
                    { level: 2, name: "Leitor de Sílabas", percentage: 18 },
                    { level: 3, name: "Leitor de Palavras", percentage: 17 },
                    { level: 4, name: "Leitor de Frases", percentage: 20 },
                    { level: 5, name: "Leitor de Texto sem Fluência", percentage: 15 },
                    { level: 6, name: "Leitor de Texto com Fluência", percentage: 15 }
                ]
            }
        ];
    }
    
    // Nova função para carregar dados de desempenho por série
    async function loadPerformanceByGrade(queryString = '') {
        try {
            // Debug - verificar se a função está sendo chamada
            console.log("🔍 Iniciando carregamento de dados de desempenho por série...");
            
            // Mostrar indicador de carregamento
            showLoading(true);
            
            // URL específica para dados de desempenho por série
            const url = `${API_BASE_URL}/dashboard/performance-by-grade${queryString ? '?' + queryString : ''}`;
            console.log("📡 URL para dados de desempenho por série:", url);
            
            // Configuração da requisição
            const requestOptions = {
                method: 'GET',
                headers: headers
            };
            
            console.log("🔑 Headers da requisição:", JSON.stringify(headers));
            
            // Fetch dados
            console.log("⏳ Iniciando requisição para dados de desempenho por série...");
            const response = await fetch(url, requestOptions);
            console.log("✓ Resposta recebida. Status:", response.status);
            
            if (!response.ok) {
                // Verificar se é um erro de autenticação
                if (response.status === 401 || response.status === 403) {
                    console.error("❌ Erro de autenticação:", response.status);
                    
                    // Limpar dados de autenticação e redirecionar para login
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    
                    alert('Sua sessão expirou. Por favor, faça login novamente.');
                    window.location.href = '../../../login.html';
                    return;
                }
                
                throw new Error(`Erro ao buscar dados de desempenho por série: ${response.status} ${response.statusText}`);
            }
            
            const performanceData = await response.json();
            console.log("📊 Dados de desempenho por série recebidos:", performanceData);
            
            // Verificar se os dados estão no formato esperado
            if (!performanceData || !performanceData.gradePerformance) {
                console.warn("⚠️ Formato de dados inválido ou ausente:", performanceData);
                // Usar dados de exemplo
                performanceData = { gradePerformance: getExampleGradePerformanceData() };
                console.log("🔄 Usando dados de exemplo:", performanceData);
            }
            
            // Atualizar o gráfico de barras com os dados recebidos
            console.log("🎨 Atualizando gráfico de desempenho por série...");
            updatePerformanceByGradeChart(performanceData);
            console.log("✓ Gráfico de desempenho por série atualizado com sucesso!");
            
            // Esconder indicador de carregamento
            showLoading(false);
        } catch (error) {
            console.error("❌ Erro ao carregar dados de desempenho por série:", error);
            // Usar dados de exemplo em caso de erro
            const exampleData = { gradePerformance: getExampleGradePerformanceData() };
            console.log("🔄 Usando dados de exemplo devido a erro:", exampleData);
            updatePerformanceByGradeChart(exampleData);
            showLoading(false);
        }
    }
    
    // Função para atualizar o gráfico de desempenho por série
    function updatePerformanceByGradeChart(data) {
        if (!data || !data.gradePerformance) {
            console.warn('Dados de desempenho por série não encontrados');
            // Usar dados de exemplo se não houver dados reais
            data = { gradePerformance: getExampleGradePerformanceData() };
        }
        
    const ctxSeries = document.getElementById('chart-series');
        if (!ctxSeries) {
            console.warn('Elemento #chart-series não encontrado');
            return;
        }
        
        // Verificar se já existe um gráfico e destruí-lo
        let existingChart = Chart.getChart(ctxSeries);
        if (existingChart) {
            existingChart.destroy();
        }
        
        // Extrair dados do formato fornecido pela API
        // Assumindo que o formato dos dados pode precisar de transformação
        const gradeData = data.gradePerformance;
        
        // Cores para os diferentes níveis de leitura
        const colors = [
            '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'
        ];
        
        // Estrutura de dados para o gráfico de séries
        const seriesData = {
                labels: ['1º Ano', '2º Ano', '3º Ano', '4º Ano', '5º Ano', '6º Ano', '7º Ano', '8º Ano', '9º Ano'],
                datasets: [
                    {
                        label: 'Não Leitor',
                    data: gradeData.map(grade => grade?.notReader || 0),
                    backgroundColor: colors[0]
                    },
                    {
                        label: 'Leitor de Sílabas',
                    data: gradeData.map(grade => grade?.syllableReader || 0),
                    backgroundColor: colors[1]
                    },
                    {
                        label: 'Leitor de Palavras',
                    data: gradeData.map(grade => grade?.wordReader || 0),
                    backgroundColor: colors[2]
                    },
                    {
                        label: 'Leitor de Frases',
                    data: gradeData.map(grade => grade?.sentenceReader || 0),
                    backgroundColor: colors[3]
                    },
                    {
                        label: 'Leitor de Texto sem Fluência',
                    data: gradeData.map(grade => grade?.textReaderWithoutFluency || 0),
                    backgroundColor: colors[4]
                    },
                    {
                        label: 'Leitor de Texto com Fluência',
                    data: gradeData.map(grade => grade?.textReaderWithFluency || 0),
                    backgroundColor: colors[5]
                }
            ]
        };
        
        new Chart(ctxSeries, {
            type: 'bar',
            data: seriesData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        stacked: true,
                    },
                    y: {
                        stacked: true,
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                            callback: function(value) {
                                return value + '%';
                            }
                        }
                    }
                },
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            boxWidth: 12,
                            font: {
                                size: 10
                            }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `${context.dataset.label}: ${context.raw}%`;
                            }
                        }
                    }
                }
            }
        });
    }

    // Dados de exemplo para o gráfico de desempenho por série
    function getExampleGradePerformanceData() {
        // Retorna um array com dados de exemplo para cada série
        return [
            {
                grade: "1º Ano",
                notReader: 40,
                syllableReader: 30,
                wordReader: 20,
                sentenceReader: 10,
                textReaderWithoutFluency: 0,
                textReaderWithFluency: 0
            },
            {
                grade: "2º Ano",
                notReader: 25,
                syllableReader: 35,
                wordReader: 25,
                sentenceReader: 10,
                textReaderWithoutFluency: 5,
                textReaderWithFluency: 0
            },
            {
                grade: "3º Ano",
                notReader: 15,
                syllableReader: 25,
                wordReader: 30,
                sentenceReader: 20,
                textReaderWithoutFluency: 5,
                textReaderWithFluency: 5
            },
            {
                grade: "4º Ano",
                notReader: 10,
                syllableReader: 20,
                wordReader: 20,
                sentenceReader: 25,
                textReaderWithoutFluency: 15,
                textReaderWithFluency: 10
            },
            {
                grade: "5º Ano",
                notReader: 5,
                syllableReader: 15,
                wordReader: 15,
                sentenceReader: 20,
                textReaderWithoutFluency: 20,
                textReaderWithFluency: 25
            },
            {
                grade: "6º Ano",
                notReader: 4,
                syllableReader: 12,
                wordReader: 14,
                sentenceReader: 18,
                textReaderWithoutFluency: 22,
                textReaderWithFluency: 30
            },
            {
                grade: "7º Ano",
                notReader: 3,
                syllableReader: 10,
                wordReader: 12,
                sentenceReader: 16,
                textReaderWithoutFluency: 24,
                textReaderWithFluency: 35
            },
            {
                grade: "8º Ano",
                notReader: 2,
                syllableReader: 8,
                wordReader: 10,
                sentenceReader: 15,
                textReaderWithoutFluency: 25,
                textReaderWithFluency: 40
            },
            {
                grade: "9º Ano",
                notReader: 1,
                syllableReader: 5,
                wordReader: 8,
                sentenceReader: 14,
                textReaderWithoutFluency: 27,
                textReaderWithFluency: 45
            }
        ];
    }
    
    // Função para inicializar ou atualizar os gráficos
    function initCharts(data) {
        console.log("Inicializando outros componentes de dashboard com dados:", data);
        // Todos os gráficos agora são processados por funções dedicadas
    }
    
    // Nova função para carregar dados específicos para o gráfico de distribuição de níveis de leitura
    async function loadReadingLevelDistribution(queryString = '') {
        try {
            // Debug - verificar se a função está sendo chamada
            console.log("🔍 Iniciando carregamento de dados de distribuição de níveis de leitura...");
            
            // Mostrar indicador de carregamento
            showLoading(true);
            
            // URL específica para dados de distribuição de níveis de leitura
            const url = `${API_BASE_URL}/dashboard/reading-level-distribution${queryString ? '?' + queryString : ''}`;
            console.log("📡 URL para dados de distribuição:", url);
            
            // Configuração da requisição
            const requestOptions = {
                method: 'GET',
                headers: headers
            };
            
            console.log("🔑 Headers da requisição:", JSON.stringify(headers));
            
            // Fetch dados
            console.log("⏳ Iniciando requisição para dados de distribuição...");
            const response = await fetch(url, requestOptions);
            console.log("✓ Resposta recebida. Status:", response.status);
            
            if (!response.ok) {
                // Verificar se é um erro de autenticação
                if (response.status === 401 || response.status === 403) {
                    console.error("❌ Erro de autenticação:", response.status);
                    
                    // Limpar dados de autenticação e redirecionar para login
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    
                    alert('Sua sessão expirou. Por favor, faça login novamente.');
                    window.location.href = '../../../login.html';
                    return;
                }
                
                throw new Error(`Erro ao buscar dados de distribuição: ${response.status} ${response.statusText}`);
            }
            
            const distributionData = await response.json();
            console.log("📊 Dados de distribuição recebidos:", distributionData);
            
            // Verificar se os dados estão no formato esperado
            if (!distributionData || !distributionData.distribution) {
                console.warn("⚠️ Formato de dados inválido ou ausente:", distributionData);
                // Usar dados de exemplo
                distributionData = { distribution: getExampleDistributionData() };
                console.log("🔄 Usando dados de exemplo:", distributionData);
            }
            
            // Atualizar o gráfico de pizza com os dados recebidos
            console.log("🎨 Atualizando gráfico de níveis de leitura...");
            updateReadingLevelChart(distributionData);
            console.log("✓ Gráfico de níveis de leitura atualizado com sucesso!");
            
            // Esconder indicador de carregamento
            showLoading(false);
        } catch (error) {
            console.error("❌ Erro ao carregar dados de distribuição:", error);
            // Usar dados de exemplo em caso de erro
            const exampleData = { distribution: getExampleDistributionData() };
            console.log("🔄 Usando dados de exemplo devido a erro:", exampleData);
            updateReadingLevelChart(exampleData);
            showLoading(false);
        }
    }
    
    // Função para atualizar apenas o gráfico de distribuição de níveis de leitura
    function updateReadingLevelChart(data) {
        if (!data || !data.distribution) {
            console.warn('Dados de distribuição não encontrados');
            // Usar dados de exemplo se não houver dados reais
            data = { distribution: getExampleDistributionData() };
        }
        
        const ctxNiveis = document.getElementById('chart-niveis');
        if (!ctxNiveis) {
            console.warn('Elemento #chart-niveis não encontrado');
            return;
        }
        
        // Verificar se já existe um gráfico e destruí-lo
        let existingChart = Chart.getChart(ctxNiveis);
        if (existingChart) {
            existingChart.destroy();
        }
        
        // Extrair dados do formato fornecido pela API
        const labels = [];
        const values = [];
        const colors = [
            '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#4CAF50'
        ];
        
        // Processar o array de distribuição
        data.distribution.forEach((item, index) => {
            if (item && item.name) {
                labels.push(item.name);
                values.push(ensureValidNumber(item.count, 0));
            }
        });
        
        console.log('Dados processados para o gráfico de níveis:', { labels, values });
        
        // Estrutura de dados para o gráfico de níveis
        const niveisData = {
            labels: labels,
            datasets: [{
                data: values,
                backgroundColor: colors.slice(0, labels.length)
            }]
        };
        
        new Chart(ctxNiveis, {
            type: 'pie',
            data: niveisData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                        labels: {
                            boxWidth: 15,
                            font: {
                                size: 10
                            }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const value = context.raw || 0;
                                const total = context.dataset.data.reduce((sum, val) => sum + val, 0) || 1;
                                const percentage = ((value / total) * 100).toFixed(1);
                                return `${context.label}: ${value} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
    }

    // Dados de exemplo para o gráfico de distribuição de níveis de leitura
    function getExampleDistributionData() {
        return [
            { level: 0, name: "Não Avaliado", count: 5 },
            { level: 1, name: "Não Leitor", count: 15 },
            { level: 2, name: "Leitor de Sílabas", count: 20 },
            { level: 3, name: "Leitor de Palavras", count: 25 },
            { level: 4, name: "Leitor de Frases", count: 15 },
            { level: 5, name: "Leitor de Texto sem Fluência", count: 10 },
            { level: 6, name: "Leitor de Texto com Fluência", count: 10 }
        ];
    }
    
    // Nova função para carregar dados de progressão anual
    async function loadYearlyProgression(queryString = '') {
        try {
            // Debug - verificar se a função está sendo chamada
            console.log("🔍 Iniciando carregamento de dados de progressão anual...");
            
            // Mostrar indicador de carregamento
            showLoading(true);
            
            // URL específica para dados de progressão anual
            const url = `${API_BASE_URL}/dashboard/yearly-progression${queryString ? '?' + queryString : ''}`;
            console.log("📡 URL para dados de progressão anual:", url);
            
            // Configuração da requisição
            const requestOptions = {
                method: 'GET',
                headers: headers
            };
            
            console.log("🔑 Headers da requisição:", JSON.stringify(headers));
            
            // Fetch dados
            console.log("⏳ Iniciando requisição para dados de progressão anual...");
            const response = await fetch(url, requestOptions);
            console.log("✓ Resposta recebida. Status:", response.status);
            
            if (!response.ok) {
                // Verificar se é um erro de autenticação
                if (response.status === 401 || response.status === 403) {
                    console.error("❌ Erro de autenticação:", response.status);
                    
                    // Limpar dados de autenticação e redirecionar para login
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    
                    alert('Sua sessão expirou. Por favor, faça login novamente.');
                    window.location.href = '../../../login.html';
                    return;
                }
                
                throw new Error(`Erro ao buscar dados de progressão anual: ${response.status} ${response.statusText}`);
            }
            
            const progressionData = await response.json();
            console.log("📊 Dados de progressão anual recebidos:", progressionData);
            
            // Verificar se os dados estão no formato esperado
            if (!progressionData || !progressionData.yearly) {
                console.warn("⚠️ Formato de dados inválido ou ausente:", progressionData);
                // Usar dados de exemplo
                progressionData = { yearly: getExampleYearlyProgressionData() };
                console.log("🔄 Usando dados de exemplo:", progressionData);
            }
            
            // Atualizar o gráfico de barras com os dados recebidos
            console.log("🎨 Atualizando gráfico de progressão anual...");
            updateYearlyProgressionChart(progressionData);
            console.log("✓ Gráfico de progressão anual atualizado com sucesso!");
            
            // Esconder indicador de carregamento
            showLoading(false);
        } catch (error) {
            console.error("❌ Erro ao carregar dados de progressão anual:", error);
            // Usar dados de exemplo em caso de erro
            const exampleData = { yearly: getExampleYearlyProgressionData() };
            console.log("🔄 Usando dados de exemplo devido a erro:", exampleData);
            updateYearlyProgressionChart(exampleData);
            showLoading(false);
        }
    }
    
    // Função para atualizar o gráfico de progressão anual
    function updateYearlyProgressionChart(data) {
        if (!data || !data.yearly) {
            console.warn('Dados de progressão anual não encontrados');
            // Usar dados de exemplo se não houver dados reais
            data = { yearly: getExampleYearlyProgressionData() };
        }
        
    const ctxProgressao = document.getElementById('chart-progressao');
        if (!ctxProgressao) {
            console.warn('Elemento #chart-progressao não encontrado');
            return;
        }
        
        // Verificar se já existe um gráfico e destruí-lo
        let existingChart = Chart.getChart(ctxProgressao);
        if (existingChart) {
            existingChart.destroy();
        }
        
        // Extrair dados do formato fornecido pela API
        const yearlyData = data.yearly;
        const currentYear = yearlyData.currentYear;
        const previousYear = yearlyData.previousYear;
        
        // Verificar se temos dados válidos para comparação
        if (!currentYear || !currentYear.comparedToLastYear) {
            console.warn('Dados de comparação entre anos não encontrados');
            return;
        }
        
        // Extrair as porcentagens de melhoria, manutenção e regressão
        const comparisonData = currentYear.comparedToLastYear;
        const improvedPercentage = comparisonData.improvedPercentage || 0;
        const maintainedPercentage = comparisonData.maintainedPercentage || 0;
        const regressedPercentage = comparisonData.regressedPercentage || 0;
        
        // Criar rótulos para os anos (ex: "2024" e "2025")
        const labels = [previousYear.year.toString(), currentYear.year.toString()];
        
        // Estrutura de dados para o gráfico de progressão
        const progressaoData = {
            labels: labels,
                datasets: [
                    {
                        label: 'Alunos que Subiram de Nível',
                    data: [0, improvedPercentage],
                        backgroundColor: '#4CAF50'
                    },
                    {
                        label: 'Alunos que Mantiveram o Nível',
                    data: [0, maintainedPercentage],
                        backgroundColor: '#FFC107'
                    },
                    {
                        label: 'Alunos que Regrediram',
                    data: [0, regressedPercentage],
                        backgroundColor: '#F44336'
                    }
                ]
        };
        
        // Criar gráfico de barras
        new Chart(ctxProgressao, {
            type: 'bar',
            data: progressaoData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        stacked: true,
                    },
                    y: {
                        stacked: true,
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                            callback: function(value) {
                                return value + '%';
                            }
                        }
                    }
                },
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            boxWidth: 12,
                            font: {
                                size: 10
                            }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `${context.dataset.label}: ${context.raw}%`;
                            }
                        }
                    }
                }
            }
        });
    }
    
    // Dados de exemplo para o gráfico de progressão anual
    function getExampleYearlyProgressionData() {
        return {
            currentYear: {
                year: new Date().getFullYear(),
                total: 500,
                comparedToLastYear: {
                    improved: 225,
                    maintained: 200,
                    regressed: 75,
                    totalCompared: 500,
                    improvedPercentage: 45,
                    maintainedPercentage: 40,
                    regressedPercentage: 15
                }
            },
            previousYear: {
                year: new Date().getFullYear() - 1,
                total: 450
            }
        };
    }
    
    // Limpar filtros
    function limparFiltros() {
        // Resetar todos os filtros para seus valores padrão
        limparFiltrosParaDefault();
        
        // Recarregar as opções de escolas
        loadFilterData();
        
        // Recarregar os dados sem filtros
        loadDashboardData();
        
        // Recarregar dados de distribuição de níveis de leitura
        loadReadingLevelDistribution();
        
        // Recarregar dados de desempenho por série
        loadPerformanceByGrade();
        
        // Recarregar dados de evolução dos níveis de leitura
        loadReadingLevelEvolution();
        
        // Recarregar dados de progressão anual
        loadYearlyProgression();
    }
    
    // Carregar dados do dashboard da API
    async function loadDashboardData(queryString = '') {
        try {
            // Mostrar indicador de carregamento
            showLoading(true);
            
            // URL base para analytics
            const url = `${API_BASE_URL}/dashboard/analytics${queryString ? '?' + queryString : ''}`;
            console.log("Buscando dados do dashboard de:", url);
            
            // Configuração da requisição
            const requestOptions = {
                method: 'GET',
                headers: headers
            };
            
            // Fetch dados do dashboard
            const response = await fetch(url, requestOptions);
            
            if (!response.ok) {
                // Verificar se é um erro de autenticação
                if (response.status === 401 || response.status === 403) {
                    console.error("Erro de autenticação:", response.status);
                    
                    // Limpar dados de autenticação e redirecionar para login
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    
                    alert('Sua sessão expirou. Por favor, faça login novamente.');
                    window.location.href = '../../../login.html';
                    return;
                }
                
                throw new Error(`Erro ao buscar dados do dashboard: ${response.status} ${response.statusText}`);
            }
            
            const dashboardData = await response.json();
            console.log("Dados do dashboard recebidos:", dashboardData);
            
            // Verificar a presença dos campos críticos
            console.log("Verificando campos principais:");
            console.log("- totalStudents:", dashboardData.totalStudents);
            console.log("- studentsAssessed:", dashboardData.studentsAssessed);
            console.log("- participationRate:", dashboardData.participationRate);
            console.log("- averagePpm:", dashboardData.averagePpm);
            console.log("- comprehensionScore:", dashboardData.comprehensionScore);
            
            // Atualizar os cards com os dados recebidos
            updateDashboardCards(dashboardData);
            
            // Esconder indicador de carregamento
            showLoading(false);
        } catch (error) {
            console.error("Erro ao carregar dados do dashboard:", error);
            // Esconder indicador de carregamento mesmo em caso de erro
            showLoading(false);
            
            // Usar dados de exemplo em caso de erro
            const exampleData = getExampleData();
            updateDashboardCards(exampleData);
            
            // Exibir mensagem de erro para o usuário
            alert('Erro ao carregar dados do dashboard. Usando dados de exemplo.');
        }
    }
    
    // Função para atualizar os cartões do dashboard com dados reais
    function updateDashboardCards(data) {
        console.log('Atualizando cartões do dashboard com dados:', data);
        
        if (!data) {
            console.warn('Dados não encontrados para atualizar os cartões');
            data = getExampleData(); // Usar dados de exemplo se não houver dados
        }
        
        // Forçar a atualização dos valores do cartão com dados do exemplo para testes
        // Remova ou comente esta linha em produção
        let totalStudents = data.totalStudents;
        let studentsAssessed = data.studentsAssessed;
        
        // Logs para depuração
        console.log('------- DETALHES DA ATUALIZAÇÃO DOS CARTÕES -------');
        console.log('totalStudents (bruto):', totalStudents, typeof totalStudents);
        console.log('studentsAssessed (bruto):', studentsAssessed, typeof studentsAssessed);
        console.log('participationRate (bruto):', data.participationRate, typeof data.participationRate);
        console.log('averagePpm (bruto):', data.averagePpm, typeof data.averagePpm);
        console.log('comprehensionScore (bruto):', data.comprehensionScore, typeof data.comprehensionScore);
        console.log('---------------------------------------------------');
        
        // Garantir que todos os valores sejam números válidos ou fornecer valores padrão
        totalStudents = ensureValidNumber(totalStudents, 0);
        studentsAssessed = ensureValidNumber(studentsAssessed, 0);
        const participationRate = ensureValidNumber(data.participationRate, 0);
        const averagePpm = ensureValidNumber(data.averagePpm, 0);
        const comprehensionScore = ensureValidNumber(data.comprehensionScore, 0);
        
        // Verificar a presença de cada elemento antes de tentar atualizar
        
        // Atualizar cartão de total de alunos
        const totalStudentsCard = document.getElementById('card-total-students');
        if (totalStudentsCard) {
            const valueElement = totalStudentsCard.querySelector('.card-value');
            if (valueElement) {
                valueElement.textContent = formatNumber(totalStudents);
                console.log('Card total de alunos atualizado:', totalStudents);
            } else {
                console.warn('Elemento .card-value não encontrado dentro de #card-total-students');
            }
        } else {
            console.warn('Card total de alunos (#card-total-students) não encontrado no DOM');
        }
        
        // Atualizar cartão de alunos avaliados
        const studentsAssessedCard = document.getElementById('card-students-assessed');
        if (studentsAssessedCard) {
            const valueElement = studentsAssessedCard.querySelector('.card-value');
            if (valueElement) {
                valueElement.textContent = formatNumber(studentsAssessed);
                console.log('Card alunos avaliados atualizado:', studentsAssessed);
            } else {
                console.warn('Elemento .card-value não encontrado dentro de #card-students-assessed');
            }
        } else {
            console.warn('Card alunos avaliados (#card-students-assessed) não encontrado no DOM');
        }
        
        // Atualizar cartão de taxa de participação
        const participationRateCard = document.getElementById('card-participation-rate');
        if (participationRateCard) {
            const valueElement = participationRateCard.querySelector('.card-value');
            if (valueElement) {
                // Garantir que o valor seja um número entre 0 e 1 antes de calcular a porcentagem
                const percentage = participationRate <= 1 ? Math.round(participationRate * 100) : Math.round(participationRate);
                valueElement.textContent = `${percentage}%`;
                console.log('Card taxa de participação atualizado:', percentage);
            } else {
                console.warn('Elemento .card-value não encontrado dentro de #card-participation-rate');
            }
        } else {
            console.warn('Card taxa de participação não encontrado');
        }
        
        // Atualizar cartão de média de palavras por minuto
        const avgWpmCard = document.getElementById('card-avg-wpm');
        if (avgWpmCard) {
            const valueElement = avgWpmCard.querySelector('.card-value');
            if (valueElement) {
                valueElement.textContent = formatNumber(averagePpm);
                console.log('Card média de PPM atualizado:', averagePpm);
            } else {
                console.warn('Elemento .card-value não encontrado dentro de #card-avg-wpm');
            }
        } else {
            console.warn('Card média de PPM não encontrado');
        }
        
        // Atualizar cartão de taxa de compreensão
        const comprehensionRateCard = document.getElementById('card-comprehension-rate');
        if (comprehensionRateCard) {
            const valueElement = comprehensionRateCard.querySelector('.card-value');
            if (valueElement) {
                // Garantir que o valor seja um número entre 0 e 1 antes de calcular a porcentagem
                const percentage = comprehensionScore <= 1 ? Math.round(comprehensionScore * 100) : Math.round(comprehensionScore);
                valueElement.textContent = `${percentage}%`;
                console.log('Card taxa de compreensão atualizado:', percentage);
            } else {
                console.warn('Elemento .card-value não encontrado dentro de #card-comprehension-rate');
            }
        } else {
            console.warn('Card taxa de compreensão não encontrado');
        }
        
        // Inicializar ou atualizar os gráficos
        initCharts(data);
    }
    
    // Função auxiliar para garantir que o valor seja um número válido
    function ensureValidNumber(value, defaultValue = 0) {
        // Se o valor for undefined, null, ou não for um número válido (NaN)
        if (value === undefined || value === null || isNaN(Number(value))) {
            console.warn(`Valor inválido detectado: ${value} (${typeof value}), usando valor padrão: ${defaultValue}`);
            return defaultValue;
        }
        
        // Converter para número se for uma string numérica
        return typeof value === 'string' ? Number(value) : value;
    }
    
    // Função auxiliar para formatar números
    function formatNumber(num) {
        // Garantir que o valor seja um número válido
        if (num === undefined || num === null || isNaN(Number(num))) {
            console.warn(`Tentativa de formatar um número inválido: ${num} (${typeof num}), retornando 0`);
            return '0';
        }
        
        // Converter para número se for uma string
        const numValue = typeof num === 'string' ? Number(num) : num;
        
        try {
            return numValue.toLocaleString('pt-BR');
        } catch (error) {
            console.error('Erro ao formatar número:', error);
            return numValue.toString();
        }
    }
    
    // Função para mostrar/esconder indicador de carregamento
    function showLoading(isLoading) {
        // Implementação simplificada - em uma versão real, 
        // poderíamos adicionar um elemento de spinner ou overlay
        document.body.style.cursor = isLoading ? 'wait' : 'default';
        
        // Adicionar ou remover classe de loading em cards e gráficos
        const cards = document.querySelectorAll('.card-value');
        cards.forEach(card => {
            if (isLoading) {
                card.classList.add('opacity-50');
            } else {
                card.classList.remove('opacity-50');
            }
        });
    }
});

// Função para retornar dados de exemplo quando a API não retorna dados
function getExampleData() {
    return {
        totalStudents: 500,
        studentsAssessed: 350,
        participationRate: 0.87,
        averagePpm: 78,
        comprehensionScore: 0.65,
        readingLevelDistribution: {
            NOT_EVALUATED: 5,
            SYLLABLE_READER: 15,
            WORD_READER: 20,
            SENTENCE_READER: 25,
            TEXT_READER_WITHOUT_FLUENCY: 15,
            TEXT_READER_WITH_FLUENCY: 20
        },
        events: [
            {name: 'Avaliação Diagnóstica'},
            {name: 'Avaliação Formativa 1'},
            {name: 'Avaliação Formativa 2'},
            {name: 'Avaliação Final'}
        ],
        eventTrends: [
            {
                NOT_EVALUATED: 30,
                SYLLABLE_READER: 25,
                WORD_READER: 20,
                SENTENCE_READER: 15,
                TEXT_READER_WITHOUT_FLUENCY: 7,
                TEXT_READER_WITH_FLUENCY: 3
            },
            {
                NOT_EVALUATED: 25,
                SYLLABLE_READER: 22,
                WORD_READER: 20,
                SENTENCE_READER: 18,
                TEXT_READER_WITHOUT_FLUENCY: 10,
                TEXT_READER_WITH_FLUENCY: 5
            },
            {
                NOT_EVALUATED: 20,
                SYLLABLE_READER: 20,
                WORD_READER: 18,
                SENTENCE_READER: 20,
                TEXT_READER_WITHOUT_FLUENCY: 12,
                TEXT_READER_WITH_FLUENCY: 10
            },
            {
                NOT_EVALUATED: 15,
                SYLLABLE_READER: 18,
                WORD_READER: 17,
                SENTENCE_READER: 20,
                TEXT_READER_WITHOUT_FLUENCY: 15,
                TEXT_READER_WITH_FLUENCY: 15
            }
        ],
        progressionYears: ['2022', '2023'],
        progressionData: {
            improved: [35, 45],
            maintained: [55, 40],
            regressed: [10, 15]
        }
    };
} 