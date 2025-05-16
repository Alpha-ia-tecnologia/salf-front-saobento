/**
 * Script simplificado para inicializar os campos de filtro com valores padrão
 */
document.addEventListener('DOMContentLoaded', function() {
// Configuração da URL base da API
const API_BASE_URL = "https://salf-salf-api2.gkgtsp.easypanel.host/api";

    // Elementos do DOM - apenas os três filtros básicos
const alunoSelect = document.getElementById("aluno");
const eventoSelect = document.getElementById("evento-avaliacao");
    const testeSelect = document.getElementById("teste-leitura");
    
    // Inicializar os filtros com valores padrão
    async function inicializarFiltros() {
        // Limpar e preencher campos com opções padrão
        const aluno = await fetch(`${API_BASE_URL}/students`, {
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        }).then(res => res.json());

        testeSelect.innerHTML = '<option value="">Selecione um teste</option>';
        eventoSelect.innerHTML = '<option value="">Selecione um evento</option>';
    alunoSelect.innerHTML = '<option value="">Selecione um aluno</option>';
    
        const evento = await fetch(`${API_BASE_URL}/assessment-events`, {
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        }).then(res => res.json());
        
        evento.assessments.forEach(teste => {
            const option = document.createElement('option');
            option.value = teste.id;
            option.textContent = teste.name || `Teste ${teste.id}`;
            testeSelect.appendChild(option);
        });

        evento.forEach(evento => {
            console.log(evento);
                const option = document.createElement('option');
                option.value = evento.id;
            option.textContent = evento.name || `Evento ${evento.id}`;
                eventoSelect.appendChild(option);
            });
            
        aluno.forEach(aluno => {
            console.log(aluno);
            const option = document.createElement('option');
            option.value = aluno.id;
            option.textContent = aluno.name || `Aluno ${aluno.id}`;
            alunoSelect.appendChild(option);
        });
        
        
        
        // if (alunoSelect) {
        //     alunoSelect.innerHTML = '<option value="">Selecione um aluno</option>';
        //     const opcaoAluno = document.createElement('option');
        //     opcaoAluno.value = "1";
        //     opcaoAluno.textContent = "Aluno ID 1";
        //     alunoSelect.appendChild(opcaoAluno);
        //     alunoSelect.value = "1";
        // }
        
        // if (eventoSelect) {
        //     eventoSelect.innerHTML = '<option value="">Selecione um evento</option>';
        //     const opcaoEvento = document.createElement('option');
        //     opcaoEvento.value = "1";
        //     opcaoEvento.textContent = "Evento ID 1";
        //     eventoSelect.appendChild(opcaoEvento);
        //     eventoSelect.value = "1";
        // }
        
        // if (testeSelect) {
        //     testeSelect.innerHTML = '<option value="">Selecione um teste</option>';
        //     const opcaoTeste = document.createElement('option');
        //     opcaoTeste.value = "1";
        //     opcaoTeste.textContent = "Teste ID 1";
        //     testeSelect.appendChild(opcaoTeste);
        //     testeSelect.value = "1";
        // }
    }
    
    // Verificar se os elementos existem antes de inicializar
    if (alunoSelect && eventoSelect && testeSelect) {
        inicializarFiltros();
        console.log("Filtros inicializados com valores padrão");
    } else {
        console.warn("Alguns elementos de filtro não foram encontrados");
    }
    
    // Tentar carregar dados reais da API (opcional)
    // Alunos
    fetch(`${API_BASE_URL}/students`, {
        headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    })
    .then(response => response.ok ? response.json() : Promise.reject('Erro ao carregar alunos'))
    .then(alunos => {
        if (alunos.length > 0 && alunoSelect) {
            // Manter a opção default como primeira
            const defaultOption = alunoSelect.options[0];
            const staticOption = alunoSelect.options[1];
            
            alunoSelect.innerHTML = '';
            alunoSelect.appendChild(defaultOption);
            alunoSelect.appendChild(staticOption); // Manter opção ID 1
            
            // Adicionar opções da API
                alunos.forEach(aluno => {
                if (aluno.id !== 1) { // Evitar duplicar a opção ID 1
                    const option = document.createElement('option');
                    option.value = aluno.id;
                    option.textContent = aluno.name || `Aluno ${aluno.id}`;
                    alunoSelect.appendChild(option);
                }
            });
            
            // Selecionar valor padrão
            alunoSelect.value = "1";
        }
    })
    .catch(error => console.warn("Não foi possível carregar alunos da API:", error));
    
    // Eventos
    fetch(`${API_BASE_URL}/assessment-events`, {
        headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    })
    .then(response => response.ok ? response.json() : Promise.reject('Erro ao carregar eventos'))
    .then(eventos => {
        if (eventos.length > 0 && eventoSelect) {
            // Manter a opção default como primeira
            const defaultOption = eventoSelect.options[0];
            const staticOption = eventoSelect.options[1];
            
            eventoSelect.innerHTML = '';
            eventoSelect.appendChild(defaultOption);
            eventoSelect.appendChild(staticOption); // Manter opção ID 1
            
            // Adicionar opções da API
            eventos.forEach(evento => {
                if (evento.id !== 1) { // Evitar duplicar a opção ID 1
                    const option = document.createElement('option');
                    option.value = evento.id;
                    option.textContent = evento.name || `Evento ${evento.id}`;
                    eventoSelect.appendChild(option);
                }
            });
            
            // Selecionar valor padrão
            eventoSelect.value = "1";
        }
    })
    .catch(error => console.warn("Não foi possível carregar eventos da API:", error));
    
    // // Testes
    // fetch(`${API_BASE_URL}/reading-tests`, {
    //     headers: {
    //         'Accept': 'application/json',
    //         'Authorization': `Bearer ${localStorage.getItem('token')}`
    //     }
    // })
    // .then(response => response.ok ? response.json() : Promise.reject('Erro ao carregar testes'))
    // .then(testes => {
    //     if (testes.length > 0 && testeSelect) {
    //         // Manter a opção default como primeira
    //         const defaultOption = testeSelect.options[0];
    //         const staticOption = testeSelect.options[1];
            
    //         testeSelect.innerHTML = '';
    //         testeSelect.appendChild(defaultOption);
    //         testeSelect.appendChild(staticOption); // Manter opção ID 1
            
    //         // Adicionar opções da API
    //         testes.forEach(teste => {
    //             if (teste.id !== 1) { // Evitar duplicar a opção ID 1
    //                 const option = document.createElement('option');
    //                 option.value = teste.id;
    //                 option.textContent = teste.name || `Teste ${teste.id}`;
    //                 testeSelect.appendChild(option);
    //             }
    //         });
            
    //         // Selecionar valor padrão
    //         testeSelect.value = "1";
    //     }
    // })
    // .catch(error => console.warn("Não foi possível carregar testes da API:", error));
});