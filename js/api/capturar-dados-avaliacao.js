/**
 * Função responsável por capturar os dados do formulário de avaliação
 * e enviar para a API
 */

/**
 * Captura os dados do formulário e envia para a API
 * @returns {Promise<Object>} Promise com a resposta da API
 */
function capturarEEnviarDadosFormulario() {
    // Captura os dados do formulário
    const dadosFormulario = {
        nome: document.getElementById('nome-avaliacao').value,
        gradeRange: document.getElementById('grade-range')?.value || "RANGE_1_2",
        palavras: Array.from(document.querySelectorAll('#lista-palavras .palavra-item')).map(el => el.textContent.trim()),
        pseudopalavras: Array.from(document.querySelectorAll('#lista-pseudopalavras .pseudopalavra-item')).map(el => el.textContent.trim()),
        frases: Array.from(document.querySelectorAll('#lista-frases .frase-item')).map(el => el.textContent.trim()),
        texto: document.getElementById('texto-avaliacao').value,
        questoes: Array.from(document.querySelectorAll('#container-questoes .questao:not(.questao-template)')).map(questaoEl => {
            const enunciado = questaoEl.querySelector('.enunciado-questao').value;
            const opcoes = Array.from(questaoEl.querySelectorAll('.opcao-container')).map(opt => opt.querySelector('.texto-opcao').value);
            const respostaCorretaIndex = Array.from(questaoEl.querySelectorAll('.opcao-container')).findIndex(
                opt => opt.querySelector('.resposta-correta').checked
            );
            
            return {
                enunciado,
                opcoes,
                respostaCorretaIndex
            };
        })
    };
    
    // Prepara os dados para envio para a API
    const dadosParaAPI = {
        name: dadosFormulario.nome,
        text: dadosFormulario.texto,
        totalWords: dadosFormulario.palavras.length,
        totalPseudowords: dadosFormulario.pseudopalavras.length,
        gradeRange: dadosFormulario.gradeRange,
        words: dadosFormulario.palavras,
        pseudowords: dadosFormulario.pseudopalavras,
        assessmentEventId: 1,
        phrases: dadosFormulario.frases.map(frase => ({ text: frase })),
        questions: dadosFormulario.questoes.map(questao => ({
            text: questao.enunciado,
            options: questao.opcoes
        }))
    };
    
    // Obtém o token de autenticação
    const token = localStorage.getItem('token');
    
    // Configura os cabeçalhos para a requisição
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
    };
    
    // URL da API
    const url = 'https://salf-salf-api.py5r5i.easypanel.host/api/assessments';
    
    // Envia os dados para a API
    return fetch(url, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(dadosParaAPI)
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(err => {
                throw new Error(err.message || `Erro ${response.status}: ${response.statusText}`);
            });
        }
        return response.json();
    });
} 