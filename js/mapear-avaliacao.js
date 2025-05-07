/**
 * Mapeia os dados da avaliação da API para o formato utilizado na aplicação
 * @param {Object} avaliacaoAPI - Objeto da avaliação retornado pela API
 * @returns {Object} Objeto da avaliação no formato utilizado pela aplicação
 */
function mapearAvaliacao(avaliacaoAPI) {
    // Se a entrada for um array, usar o primeiro item
    const avaliacao = Array.isArray(avaliacaoAPI) ? avaliacaoAPI[0] : avaliacaoAPI;
    
    if (!avaliacao) {
        console.error("Dados de avaliação inválidos");
        return null;
    }
    
    // Mapear o objeto para o formato esperado pela aplicação
    return {
        id: avaliacao.id,
        studentId: avaliacao.studentId,
        student: avaliacao.student ? {
            id: avaliacao.student.id,
            name: avaliacao.student.name,
            registrationNumber: avaliacao.student.registrationNumber
        } : null,
        assessmentEventId: avaliacao.assessmentEventId,
        assessmentEvent: avaliacao.assessmentEvent ? {
            id: avaliacao.assessmentEvent.id,
            name: avaliacao.assessmentEvent.name,
            status: avaliacao.assessmentEvent.status
        } : null,
        readingTestId: avaliacao.readingTestId,
        readingTest: avaliacao.readingTest ? {
            id: avaliacao.readingTest.id,
            name: avaliacao.readingTest.name,
            gradeRange: avaliacao.readingTest.gradeRange,
            // Adicionar os itens para avaliação de leitura
            words: gerarLista(40, "palavras"), // Lista de palavras (mock se não existir)
            pseudowords: gerarLista(30, "pseudopalavras"), // Lista de pseudopalavras (mock se não existir)
            sentences: gerarLista(10, "frases", true), // Lista de frases (mock se não existir)
            text: gerarTextoMock() // Texto para leitura (mock se não existir)
        } : null,
        date: avaliacao.date || new Date().toISOString(),
        wordsRead: avaliacao.wordsRead || 0,
        wordsTotal: avaliacao.wordsTotal || 40,
        pseudowordsRead: avaliacao.pseudowordsRead || 0,
        pseudowordsTotal: avaliacao.pseudowordsTotal || 30,
        sentencesRead: avaliacao.sentencesRead || 0,
        sentencesTotal: avaliacao.sentencesTotal || 10,
        textLinesRead: avaliacao.textLinesRead || 0,
        textLinesTotal: avaliacao.textLinesTotal || 15,
        readingLevel: avaliacao.readingLevel || "WORD_READER",
        ppm: avaliacao.ppm || 0,
        completed: avaliacao.completed || false,
        completedStages: avaliacao.completedStages || [],
        answers: avaliacao.answers || [],
        createdAt: avaliacao.createdAt || new Date().toISOString(),
        updatedAt: avaliacao.updatedAt || new Date().toISOString()
    };
}

/**
 * Gera uma lista de palavras, pseudopalavras ou frases para mock de dados
 * @param {number} quantidade - Quantidade de itens a gerar
 * @param {string} tipo - Tipo de lista ('palavras', 'pseudopalavras' ou 'frases')
 * @param {boolean} frases - Indica se deve gerar frases completas
 * @returns {Array} Lista de itens gerados
 */
function gerarLista(quantidade, tipo, frases = false) {
    // Listas de exemplo para cada tipo
    const exemplosPalavras = [
        "casa", "bola", "gato", "mesa", "livro", "pato", "fogo", "roda", "vela", "mala",
        "lobo", "rato", "sapo", "faca", "pipa", "dedo", "moto", "suco", "bota", "lua",
        "pele", "cama", "papel", "terra", "água", "boca", "ponte", "porta", "rede", "sol",
        "folha", "vento", "nuvem", "chuva", "praia", "vidro", "barco", "peixe", "rosa", "dente"
    ];
    
    const exemplosPseudopalavras = [
        "dalu", "fema", "pilo", "sati", "beco", "vota", "mipe", "catu", "lemi", "rano",
        "bagi", "pute", "seco", "vilo", "fota", "zema", "neri", "joba", "tibe", "cuna",
        "larpo", "bestu", "pilda", "vamil", "torpa", "sertu", "ganso", "finpo", "melfa", "darno"
    ];
    
    const exemplosFrases = [
        "O menino corre no parque.",
        "A menina gosta de sorvete.",
        "O gato subiu na árvore.",
        "Minha mãe fez um bolo gostoso.",
        "O cachorro late para o carteiro.",
        "As crianças brincam na escola.",
        "O sol brilha no céu azul.",
        "Eu gosto de ler livros de aventura.",
        "Meu pai dirige um carro vermelho.",
        "A professora ensina matemática."
    ];
    
    // Escolher a lista de exemplos apropriada
    let exemplos;
    if (frases) {
        exemplos = exemplosFrases;
    } else if (tipo === 'pseudopalavras') {
        exemplos = exemplosPseudopalavras;
    } else {
        exemplos = exemplosPalavras;
    }
    
    // Verificar se temos exemplos suficientes
    if (exemplos.length < quantidade) {
        // Repetir exemplos se necessário
        const repeticoes = Math.ceil(quantidade / exemplos.length);
        const listaExpandida = [];
        for (let i = 0; i < repeticoes; i++) {
            listaExpandida.push(...exemplos);
        }
        exemplos = listaExpandida;
    }
    
    // Retornar a quantidade solicitada
    return exemplos.slice(0, quantidade);
}

/**
 * Gera um texto para mock de dados
 * @returns {string} Texto gerado para leitura
 */
function gerarTextoMock() {
    return "A menina de cabelos dourados caminhava pela floresta. Era uma linda manhã de primavera, e as flores coloridas enfeitavam o caminho. Ela carregava uma cesta com frutas frescas para sua avó. O sol brilhava entre as folhas das árvores, criando sombras dançantes no chão. Enquanto andava, a menina cantarolava uma doce melodia que sua mãe lhe ensinou. Os pássaros, encantados com a canção, acompanhavam com seus trinados. De repente, ela encontrou um pequeno coelho branco parado no meio da trilha. Seus olhos eram vermelhos como rubis e suas orelhas compridas tremiam levemente. A menina sorriu e ofereceu uma cenoura da sua cesta. O coelho hesitou por um momento, mas logo aceitou o presente, pegando a cenoura com suas patas dianteiras. Agradecido, ele saltitou ao lado da menina por um tempo, como se quisesse fazer companhia. Mais adiante, encontraram um riacho de águas cristalinas. A menina parou para beber um pouco de água fresca e descansar sob a sombra de um grande carvalho.";
} 