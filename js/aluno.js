
document.addEventListener('DOMContentLoaded', function () {
    let cacheData = {
        regiao: null,
        grupo: null,
        serie: null,
        classGroupId: null

    }
    let paginaAtual = 1;

    // Referências aos elementos
    const btnNovoAluno = document.getElementById('btn-novo-aluno');
    const btnImportarAlunos = document.getElementById('btn-importar-alunos');
    const modalAluno = document.getElementById('modal-aluno');
    const modalImportar = document.getElementById('modal-importar');
    const fecharModal = document.getElementById('fechar-modal');
    const fecharModalImportar = document.getElementById('fechar-modal-importar');
    const cancelarAluno = document.getElementById('cancelar-aluno');
    const cancelarImportar = document.getElementById('cancelar-importar');
    const formAluno = document.getElementById('form-aluno');
    const formImportar = document.getElementById('form-importar');
    const regiaoSelect = document.getElementById('filtro-regiao');
    const grupoSelect = document.getElementById('filtro-grupo');
    const escolaSelect = document.getElementById('filtro-escola');
    const turmaSelect = document.getElementById('filtro-turma');
    const escolaFormSelect = document.getElementById('escola-aluno-form');
    const turmaFormSelect = document.getElementById('turma-aluno-form');
    const fileUpload = document.getElementById('file-upload');
    const arquivoSelecionado = document.getElementById('arquivo-selecionado');
    const nomeArquivo = document.getElementById('nome-arquivo');
    const pesquisa = document.getElementById('pesquisa')
    // Dados de controle
    let alunos = [];
    let filtroRegiaoId = '';
    let filtroGrupoId = '';
    let filtroEscolaId = '';
    let filtroTurmaId = '';

    // API endpoints - agora vem da configuração global
    // const API_BASE_URL = 'https://salf-salf-api2.gkgtsp.easypanel.host/api'; // Removido - usando configuração global

    // Token de autenticação (mock)
    const token = localStorage.getItem('token');

    // Event Listeners
    btnNovoAluno.addEventListener('click', abrirModalAluno);
    btnImportarAlunos.addEventListener('click', abrirModalImportar);
    fecharModal.addEventListener('click', fecharModalAluno);
    fecharModalImportar.addEventListener('click', fecharModalImportacao);
    cancelarAluno.addEventListener('click', fecharModalAluno);
    cancelarImportar.addEventListener('click', fecharModalImportacao);
    formAluno.addEventListener('submit', salvarAluno);
    formImportar.addEventListener('submit', importarAlunos);
    
    // Event listeners para filtros
    regiaoSelect.addEventListener('change', function () {
        filtroRegiaoId = this.value;
        carregarGruposParaFiltro(filtroRegiaoId);
        carregarEscolasParaFiltro(filtroGrupoId);
        // Limpar os filtros subsequentes
        grupoSelect.value = '';
        escolaSelect.value = '';
        turmaSelect.value = '';
        filtroGrupoId = '';
        filtroEscolaId = '';
        filtroTurmaId = '';
        carregarAlunos();
    });

    grupoSelect.addEventListener('change', function () {
        filtroGrupoId = this.value;
        carregarEscolasParaFiltro(filtroGrupoId);
        // Limpar os filtros subsequentes
        escolaSelect.value = '';
        turmaSelect.value = '';
        filtroEscolaId = '';
        filtroTurmaId = '';
        carregarAlunos();
    });

    escolaSelect.addEventListener('change', function () {
        filtroEscolaId = this.value;
        carregarTurmasParaFiltro(filtroEscolaId);
        // Limpar o filtro de turma
        turmaSelect.value = '';
        filtroTurmaId = '';
        carregarAlunos();
    });

    turmaSelect.addEventListener('change', function () {
        filtroTurmaId = this.value;
        carregarAlunos();
    });

    pesquisa.addEventListener("change",() => {
        atualizarTabela()
    })

    turmaFormSelect.addEventListener('change', async function () {
        filtroTurmaId = this.value;
        const request = await fetch(`${window.API_BASE_URL}/class-groups/${filtroTurmaId}`, {
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        })
            .then(res => res.json())
            .then(cache => {
                cacheData.regiao = cache.school.regionId;
                cacheData.grupo = cache.school.groupId;
                cacheData.serie = cache.grade;
                cacheData.classGroupId = cache.id;
                console.log(cacheData);
            });

        carregarAlunos();
    });

    // Event listeners no formulário
    escolaFormSelect.addEventListener('change', carregarTurmasParaFormulario);


    fileUpload.addEventListener('change', exibirNomeArquivo);

    // Inicializar dados
    carregarRegioes();
    carregarAlunos();

    // Funções

    /**
     * Carrega as regiões para o filtro
     */
    function carregarRegioes() {
        fetch(`${window.API_BASE_URL}/regions`, {
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Erro ao buscar regiões');
                }
                return response.json();
            })
            .then(regioes => {
                // Preencher select de regiões do filtro
                regiaoSelect.innerHTML = '<option value="">Todas as regiões</option>';
                regioes.data.forEach(regiao => {
                    const option = document.createElement('option');
                    option.value = regiao.id;
                    option.textContent = regiao.name;
                    regiaoSelect.appendChild(option);
                });
            })
            .catch(error => {
                console.error('Erro ao carregar regiões:', error);
                alert('Erro ao carregar regiões. Por favor, tente novamente.');
            });
    }

    /**
     * Carrega os grupos para o filtro com base na região selecionada
     * @param {string} regiaoId - ID da região selecionada
     */
    function carregarGruposParaFiltro(regiaoId = '') {
        // URL da requisição
        let url = `${API_BASE_URL}/groups`;
        if (regiaoId) {
            url += `?regionId=${regiaoId}`;
        }

        // Carregar grupos para o filtro
        fetch(url, {
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Erro ao buscar grupos');
                }
                return response.json();
            })
            .then(grupos => {
                // Preencher select de grupos do filtro
                grupoSelect.innerHTML = '<option value="">Todos os grupos</option>';
                grupos.data.forEach(grupo => {
                    const option = document.createElement('option');
                    option.value = grupo.id;
                    option.textContent = grupo.name;
                    grupoSelect.appendChild(option);
                });
            })
            .catch(error => {
                console.error('Erro ao carregar grupos:', error);
                alert('Erro ao carregar grupos. Por favor, tente novamente.');
            });
    }

    function carregarEscolasParaFiltro(grupoId = '') {
        // URL da requisição
        let url = `${API_BASE_URL}/schools`;

        // Adicionar parâmetros de filtro
        let params = [];
        params.push(`regionId=${filtroRegiaoId}`);
        params.push(`groupId=${grupoId}`);

        // Adicionar parâmetros à URL
        if (params.length > 0) {
            url += `?${params.join('&')}`;
        }

        // Carregar escolas para o filtro
        fetch(url, {
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Erro ao buscar escolas');
                }
                return response.json();
            })
            .then(escolas => {
                // Preencher select de escolas do filtro
                escolaSelect.innerHTML = '<option value="">Todas as escolas</option>';
                escolas.data.forEach(escola => {
                    const option = document.createElement('option');
                    option.value = escola.id;
                    option.textContent = escola.name;
                    escolaSelect.appendChild(option);
                });

                // Preencher select de escolas do formulário
                escolaFormSelect.innerHTML = '<option value="">Selecione uma escola</option>';
                escolas.data.forEach(escola => {
                    const option = document.createElement('option');
                    option.value = escola.id;
                    option.textContent = escola.name;
                    escolaFormSelect.appendChild(option);
                });
            })
            .catch(error => {
                console.error('Erro ao carregar escolas:', error);
                alert('Erro ao carregar escolas. Por favor, tente novamente.');
            });
    }

    function carregarTurmasParaFiltro(escolaId = '') {
        // URL da requisição
        let url = `${API_BASE_URL}/class-groups`;

        // Adicionar parâmetros de filtro
        let params = [];
        if (filtroRegiaoId) params.push(`regionId=${filtroRegiaoId}`);
        if (filtroGrupoId) params.push(`groupId=${filtroGrupoId}`);
        if (escolaId) params.push(`schoolId=${escolaId}`);

        // Adicionar parâmetros à URL
        if (params.length > 0) {
            url += `?${params.join('&')}`;
        }

        // Carregar turmas para o filtro
        fetch(url, {
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Erro ao buscar turmas');
                }
                return response.json();
            })
            .then(turmas => {
                // Preencher select de turmas do filtro
                turmaSelect.innerHTML = '<option value="">Todas as turmas</option>';
                turmas.data.forEach(turma => {
                    const option = document.createElement('option');
                    option.value = turma.id;
                    option.textContent = `${turma.name}`;
                    turmaSelect.appendChild(option);
                });
            })
            .catch(error => {
                console.error('Erro ao carregar turmas:', error);
                alert('Erro ao carregar turmas. Por favor, tente novamente.');
            });
    }
    const btnPagina = document.getElementById('btn-page');
    const btnPaginaAnterior = document.getElementById('btn-page-anterior');
    const btnPaginaProximo = document.getElementById('btn-page-proximo');
    btnPaginaAnterior.addEventListener('click', function () {
        btnPagina.textContent = paginaAtual - 1;
        paginaAtual = Number.parseInt(btnPagina.textContent);
        carregarAlunos();
    });
    btnPaginaProximo.addEventListener('click', function () {
        btnPagina.textContent = paginaAtual + 1;
        paginaAtual = Number.parseInt(btnPagina.textContent);
        carregarAlunos();
    });
    function carregarAlunos() {
        // Construir URL com parâmetros de filtro
        let url = `${API_BASE_URL}/students?page=${paginaAtual || 1}&`;

        // Adicionar filtros se existirem
         url += `regionId=${filtroRegiaoId}&`;
        url += `groupId=${filtroGrupoId}&`;
        url += `schoolId=${filtroEscolaId}&`;
        url += `classGroupId=${filtroTurmaId}&`;

        // Remover o último '&' se existir
        url = url.endsWith('&') ? url.slice(0, -1) : url;
        url = url.endsWith('?') ? url.slice(0, -1) : url;

        fetch(url, {
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Erro ao buscar alunos');
                }
                return response.json();
            })
            .then(({ data }) => {
                alunos = data;
                atualizarTabela();
            })
            .catch(error => {
                console.error('Erro ao carregar alunos:', error);
                alert('Erro ao carregar alunos. Por favor, tente novamente.');
            });
    }

    async function abrirModalAluno() {
        modalAluno.classList.remove('hidden');

        // Resetar o formulário
        formAluno.reset();
        formAluno.removeAttribute('data-editing-id');

        // Resetar o título do modal
        const modalTitle = modalAluno.querySelector('h3');
        modalTitle.textContent = 'Novo Aluno';

        const escolas = await fetch(`${API_BASE_URL}/schools?limit=1000`, {
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        }).then(res => res.json());

        escolaFormSelect.innerHTML = '<option value="">Selecione uma escola</option>';
        escolas.data.forEach(escola => {
            const option = document.createElement('option');
            option.value = escola.id;
            option.textContent = escola.name;
            escolaFormSelect.appendChild(option);
        });


        const turmas = await fetch(`${API_BASE_URL}/class-groups`, {
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        }).then(res => res.json());

        const regioes = await fetch(`${API_BASE_URL}/regions`, {
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        }).then(res => res.json());

        const grupos = await fetch(`${API_BASE_URL}/groups`, {
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        }).then(res => res.json());





        turmas.data.forEach(turma => {
            const option = document.createElement('option');
            option.value = turma.id;
            option.textContent = `${turma.name} (${turma.gradeLevel})`;
            turmaFormSelect.appendChild(option);
        });

        // Resetar o botão de submit
        const btnSubmit = formAluno.querySelector('button[type="submit"]');
        btnSubmit.textContent = 'Salvar';
    }

    function carregarGruposParaFormulario(regiaoId = '') {
        // Limpar select de grupos


        // URL da requisição

    }

    function abrirModalImportar() {
        modalImportar.classList.remove('hidden');
        arquivoSelecionado.classList.add('hidden');
        nomeArquivo.textContent = '';
    }

    function fecharModalAluno() {
        modalAluno.classList.add('hidden');
        formAluno.reset();
    }

    function fecharModalImportacao() {
        modalImportar.classList.add('hidden');
        formImportar.reset();
    }

    function carregarTurmasParaFormulario() {
        const formEscolaId = escolaFormSelect.value;
        turmaFormSelect.innerHTML = '<option value="">Selecione uma turma</option>';

        if (!formEscolaId) return;

        fetch(`${API_BASE_URL}/class-groups?schoolId=${formEscolaId}`, {
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Erro ao buscar turmas');
                }
                return response.json();
            })
            .then(turmas => {
                turmas.data.forEach(turma => {
                    const option = document.createElement('option');
                    option.value = turma.id;
                    option.textContent = `${turma.name}`;
                    turmaFormSelect.appendChild(option);
                });
            })
            .catch(error => {
                console.error('Erro ao carregar turmas:', error);
                alert('Erro ao carregar turmas. Por favor, tente novamente.');
            });
    }

    function exibirNomeArquivo() {
        if (fileUpload.files.length > 0) {
            arquivoSelecionado.classList.remove('hidden');
            nomeArquivo.textContent = fileUpload.files[0].name;
        } else {
            arquivoSelecionado.classList.add('hidden');
            nomeArquivo.textContent = '';
        }
    }

    function salvarAluno(e) {
        e.preventDefault();

        const formEscolaId = escolaFormSelect.value;
        const formTurmaId = turmaFormSelect.value;
        const nomeAluno = document.getElementById('nome-aluno').value;
        const matriculaAluno = document.getElementById('matricula-aluno').value;

        if (!formEscolaId || !formTurmaId || !nomeAluno || !matriculaAluno) {
            alert('Por favor, preencha todos os campos obrigatórios.');
            return;
        }

        // Criar objeto de dados do aluno
        const dadosAluno = {
            name: nomeAluno,
            registrationNumber: matriculaAluno,
            classGroupId: parseInt(formTurmaId),
            regionId: cacheData.regiao,
            groupId: cacheData.grupo,
            schoolId: parseInt(formEscolaId),
            grade: cacheData.serie
        };

        // Verificar se estamos editando ou criando um novo aluno
        const idEditing = formAluno.getAttribute('data-editing-id');

        if (idEditing) {
            // Editando um aluno existente
            fetch(`${API_BASE_URL}/students/${idEditing}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(dadosAluno)
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Erro ao atualizar aluno');
                    }
                    return response.json();
                })
                .then(data => {
                    alert('Aluno atualizado com sucesso!');
                    fecharModalAluno();
                    carregarAlunos();
                })
                .catch(error => {
                    console.error('Erro ao atualizar aluno:', error);
                    alert('Erro ao atualizar aluno. Por favor, tente novamente.');
                });
        } else {
            // Criando um novo aluno
            fetch(`${API_BASE_URL}/students`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(dadosAluno)
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Erro ao cadastrar aluno');
                    }
                    return response.json();
                })
                .then(data => {
                    alert('Aluno cadastrado com sucesso!');
                    fecharModalAluno();
                    carregarAlunos();
                })
                .catch(error => {
                    console.error('Erro ao cadastrar aluno:', error);
                    alert('Erro ao cadastrar aluno. Por favor, tente novamente.');
                });
        }
    }

    function importarAlunos(e) {
        e.preventDefault();

        if (!fileUpload.files.length) {
            alert('Por favor, selecione um arquivo para importar.');
            return;
        }

        const formData = new FormData();
        formData.append('file', fileUpload.files[0]);

        fetch(`${window.API_BASE_URL}/students/import`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Erro ao importar alunos');
                }
                return response.json();
            })
            .then(data => {
                alert(`Importação realizada com sucesso! ${data.length || 'Vários'} alunos foram importados.`);
                fecharModalImportacao();
                carregarAlunos();
            })
            .catch(error => {
                console.error('Erro ao importar alunos:', error);
                alert('Erro ao importar alunos. Por favor, tente novamente.');
            });
    }

    function atualizarTabela() {
        const tbody = document.querySelector('table tbody');
        tbody.innerHTML = '';

        // Filtrar alunos baseado na 
        let alunosFiltrados = [...alunos];
        const valor = pesquisa?.value?.toLowerCase() || '';

        if (valor) {
            alunosFiltrados = alunosFiltrados.filter(aluno =>
                aluno.name.toLowerCase().includes(valor) ||
                aluno.registrationNumber.toLowerCase().includes(valor)
            );
        }

        // Verificar se há alunos para exibir
        if (alunosFiltrados.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="px-6 py-4 text-center text-gray-500">
                        Nenhum aluno encontrado com os filtros selecionados
                    </td>
                </tr>
            `;
            return;
        }

        // Exibir alunos filtrados
        alunosFiltrados.forEach(aluno => {
            const tr = document.createElement('tr');
            tr.setAttribute('data-id', aluno.id);
            tr.setAttribute('data-classgroup-id', aluno.classGroupId);

            tr.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${aluno.id}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900">${aluno.name || 'sem nome'}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${aluno.classGroup?.grade || 'sem serie'}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${aluno.classGroup?.name || 'sem turma'}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${aluno?.school?.name || 'sem escola'}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button class="text-yellow-600 hover:text-yellow-900 mr-3 btn-editar" data-id="${aluno.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="text-red-600 hover:text-red-900 btn-excluir" data-id="${aluno.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });

        // Atualizar contador de resultados
        const resultadosMsg = document.querySelector('.bg-white.px-4.py-3 .text-sm.text-gray-700');
        if (resultadosMsg) {
            resultadosMsg.innerHTML = `
                Mostrando <span class="font-medium">1</span> a <span class="font-medium">${alunosFiltrados.length}</span> de <span class="font-medium">${alunos.length}</span> resultados
            `;
        }

        // Configurar eventos dos botões
        configurarBotoes();
    }

    function configurarBotoes() {
        // Botões de editar
        document.querySelectorAll('.btn-editar').forEach(btn => {
            btn.addEventListener('click', function () {
                const id = parseInt(this.getAttribute('data-id'));
                editarAluno(id);
            });
        });

        // Botões de excluir
        document.querySelectorAll('.btn-excluir').forEach(btn => {
            btn.addEventListener('click', function () {
                const id = parseInt(this.getAttribute('data-id'));
                excluirAluno(id);
            });
        });
    }

    async function editarAluno(id) {
        try {
            // Buscar dados completos do aluno
            const aluno = await fetch(`${API_BASE_URL}/students/${id}`, {
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            }).then(response => {
                if (!response.ok) {
                    throw new Error('Erro ao buscar dados do aluno');
                }
                return response.json();
            });

            // Abrir o modal
            modalAluno.classList.remove('hidden');

            // Resetar o formulário
            formAluno.reset();

            // Modificar o formulário para modo de edição
            formAluno.setAttribute('data-editing-id', id);

            // Modificar o título do modal
            const modalTitle = modalAluno.querySelector('h3');
            modalTitle.textContent = 'Editar Aluno';

            // Limpar selects
            escolaFormSelect.innerHTML = '<option value="">Selecione uma escola</option>';
            turmaFormSelect.innerHTML = '<option value="">Selecione uma turma</option>';


            // Preencher select de regiões

            // Selecionar região do aluno

            // Carregar grupos da região selecionada

            // Selecionar grupo do aluno

            // Carregar escolas
            const escolas = await fetch(`${API_BASE_URL}/schools`, {
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            }).then(res => res.json());

            // Preencher select de escolas
            escolas.data.forEach(escola => {
                const option = document.createElement('option');
                option.value = escola.id;
                option.textContent = escola.name;
                escolaFormSelect.appendChild(option);
            });

            // Selecionar escola do aluno
            escolaFormSelect.value = aluno.schoolId || '';

            // Carregar turmas da escola selecionada
            const turmas = await fetch(`${API_BASE_URL}/class-groups?schoolId=${aluno.schoolId}`, {
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            }).then(res => res.json());

            // Preencher select de turmas
            turmas.data.forEach(turma => {
                const option = document.createElement('option');
                option.value = turma.id;
                option.textContent = `${turma.name} (${turma.gradeLevel})`;
                turmaFormSelect.appendChild(option);
            });

            // Selecionar turma do aluno
            turmaFormSelect.value = aluno.classGroupId || '';

            // Preencher outros campos
            document.getElementById('nome-aluno').value = aluno.name || '';
            document.getElementById('matricula-aluno').value = aluno.registrationNumber || '';

            // Modificar o botão de submit
            const btnSubmit = formAluno.querySelector('button[type="submit"]');
            btnSubmit.textContent = 'Atualizar';
        } catch (error) {
            console.error('Erro ao editar aluno:', error);
            alert('Erro ao buscar dados do aluno. Por favor, tente novamente.');
        }
    }

    function excluirAluno(id) {
        if (confirm('Tem certeza que deseja excluir este aluno?')) {
            fetch(`${window.API_BASE_URL}/students/${id}`, {
                method: 'DELETE',
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            })
        }
    }
})
