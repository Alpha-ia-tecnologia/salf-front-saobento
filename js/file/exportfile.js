const page = document.querySelector("body")
const token = localStorage.getItem("token")
dayjs.extend(dayjs_plugin_utc); // ativa o suporte a UTC


var opt = {
    margin: 1,
    filename: 'myfile.pdf',
    image: { type: 'pdf', quality: 0.98 },
    html2canvas: { scale: 1 },
    jsPDF: { unit: 'mm', format: 'letter', orientation: 'portrait' }
};
const cacheFactorys = {
    header: null,
    palavrasPage: null,
    frasesPage: null,
    pseudopalavrasPage: null,
    text: null
}
async function loaderCache() {
    const id = localStorage.getItem('id')
    const request = await fetch(`https://api.salf.maximizaedu.com/api/assessments
/${id}`, {
        headers: {
            "Authorization": `Bearer ${token}`
        }
    })
    if (!request.ok) return
    const data = await request.json()
    const { createdAt, name, words, phrases, pseudowords, text, questions } = data;

    const formatted = dayjs.utc(createdAt).format('DD/MM/YYYY');

    cacheFactorys.header = { data: formatted, nome: name };
    cacheFactorys.palavrasPage = { words };
    cacheFactorys.frasesPage = { phrases };
    cacheFactorys.pseudopalavrasPage = { pseudowords };
    cacheFactorys.text = { text };
    cacheFactorys.questions = { questions };
    factoryPdfExport()

}
loaderCache()



const factoryPdfExport = () => {
    const loadHeader = factoryPageHeader(cacheFactorys.header)
    const loadPalavras = factoryPagePalavras(cacheFactorys.palavrasPage)
    const loadFrases = factoryPageFrases(cacheFactorys.frasesPage)
    const loadPseudopalavras = factoryPagePseudopalavras(cacheFactorys.pseudopalavrasPage)
    const loadText = factoryPageText(cacheFactorys.text)
    const loadQuestions = factoryPageQuestions(cacheFactorys.questions)
    const htmlPage = `
    <main>
    <section class="example component">
            ${loadHeader}   
            <h4>FOLHA 1 - EXEMPLOS E INSTRUÇÕES </h4>
            <h4>ORIENTAÇÕES PARA O ALUNO:</h4>
            <p>
                Olá! Vamos fazer uma atividade de leitura juntos. Primeiro, vamos praticar com estas três palavras
                exemplo. Leia cada uma em voz alta.
            </p>
            <b>
                OBS : leia-se da esquerda para direita
            </b>
            <h4>
                <h4>Exemplo : </h4>
            </h4>
            <table>
                <div class="table">
                    <div class="item">
                        <b>
                            BANANA
                        </b>
                    </div>
                    <div class="item">
                        <b>
                            BANANA
                        </b>
                    </div>
                    <div class="item">
                        <b>
                            BANANA
                        </b>
                    </div>
                    <div class="item">
                        <b>
                            BANANA
                        </b>
                    </div>
                    <div class="item">
                        <b>
                            BANANA
                        </b>
                    </div>
                    <div class="item">
                        <b>
                            BANANA
                        </b>
                    </div>
                </div>
            </table>
            <hr>
    </section>
    ${loadPalavras}
    ${loadFrases}
    ${loadPseudopalavras}
    ${loadText}
    ${loadQuestions}
    </main>
    `

    page.innerHTML = htmlPage
    const opt = {
        margin:       1,
        filename:     'myfile.pdf',
        image:        { type: 'pdf', quality: 0.98 },
        html2canvas:  { scale: 1 },
        jsPDF:        {
          unit: 'mm',
          format: 'letter',            // <<< Mude de 'letter' para 'a4'
          orientation: 'portrait'
        },
        pagebreak: {
          mode: ['css', 'legacy'],
          before: '.component'     // quebre sempre ANTES de cada .component
        }
    }
      html2pdf()
        .from(document.body)
        .set(opt)
        .toPdf()
        .get('pdf')
        .then(pdf => {
            const total = pdf.internal.getNumberOfPages();
            for (let i = total; i >= 1; i--) {
                if (i % 2 !== 0) {
                    pdf.deletePage(i);
                }
            }
        })
        .save(`${cacheFactorys.header.nome} - ${cacheFactorys.header.data}.pdf`);
        setTimeout(() => {
            location.href = location.origin + '/pages/avaliacao/listar.html'
        },500)
}

const factoryPagePalavras = ({ words }) => {
    const wordsPage = words ?
        `
            <section class="words component a4-page">
            <h4>FOLHA 2 - Leitura de palavras </h4>
            <h4>ORIENTAÇÕES PARA O ALUNO:</h4>
            <p>
                Agora, você vai ler palavras em voz alta. Comece pela primeira palavra e siga a direção da seta.
                Leia com atenção, sem pressa. Não se preocupe se errar, apenas continue lendo.
            <h4>
                Por exemplo:
            </h4>
            <ul>
                <li>
                    <b>
                        Se estiver escrito "CASA", você deve ler "casa".
                    </b>
                </li>
                <li>
                    <b>
                        Se estiver escrito "BOLINHA", você deve ler "bolinha".
                    </b>
                </li>
            </ul>
            </p>
            <div class="table">
                ${words.map(word => `
                        <div class="item">
                            <b>
                                ${word}
                            </b>
                        </div>
                    `).join('')
        }
            </div>
            <hr>
        </section>
    ` : ''
    return wordsPage
}

const factoryPageFrases = ({ phrases }) => {
    const frasesPage = phrases ? `
         <section class="phrases component a4-page">
            <h4>FOLHA 4 - LEITURA DE FRASES</h4>
            <h4>ORIENTAÇÕES PARA O ALUNO:</h4>
            <p>Agora, você vai ler algumas frases em voz alta. Leia com atenção, respeitando os pontos, as
                vírgulas e os pontos de exclamação. Tente ler como se estivesse contando algo para um amigo.
            </p>
            <h4>Por exemplo :</h4>
            <ul>
                <li>Se estiver escrito "O menino jogou bola.", você deve ler com entonação de final de frase.</li>
                <li>Se estiver escrito "Que dia bonito!", você deve ler com entonação de exclamação.</li>
            </ul>
            <ol>
                ${phrases.map(phrase => `
                    <li>
                        <b>
                            ${phrase.text || ''}
                        </b>
                    </li>
                `).join('')
        }
            </ol>
            <hr>
        </section>
    ` : ''
    return frasesPage
}
const factoryPagePseudopalavras = ({ pseudowords }) => {
    const pseudopalavrasPage = pseudowords ? `
        <section class="pseudo component a4-page">
            <h4>FOLHA 3 - LEITURA DE PSEUDOPALAVRAS</h4>
            <h4>ORIENTAÇÕES PARA O ALUNO:</h4>
            <p>
                Estas são palavras inventadas, que não existem de verdade. Mesmo assim, tente lê-las em voz alta,
                como se fossem palavras normais. Siga a direção da seta e leia o melhor que puder.
            <h4>
                Por exemplo:
            </h4>
            <ul>
                <li>
                    <b>
                        Se estiver escrito "PIMELA", você deve ler "pimela", mesmo que essa palavra não exista.
                    </b>
                </li>
                <li>
                    <b>
                        Se estiver escrito "ZATUDO", você deve ler "zatudo", mesmo que essa palavra não exista.
                    </b>
                </li>
            </ul>
            </p>
            
                <div class="table">
                        ${pseudowords.map(pseudoword => `
                            <div class="item">
                                <b>
                                    ${pseudoword || ''}
                                </b>
                            </div>
                        `).join('')
        }
                </div>
            <hr>
        </section>
    ` : ''
    return pseudopalavrasPage
}
const factoryPageHeader = ({ nome, data }) => {
    const header = `
    <header>
        <h1 class="conteinerNameExam" id="ExamName">
            ${nome || 'sem nome'}
        </h1>
    <div class="data" id="data">
        <h4>
            <span>data :</span>
            ${data || 'sem data'}
        </h4>
    </div>
    <hr>
    </header>
    `
    return header
    // page.innerHTML = header

}

const factoryPageText = ({ text }) => {
    const textPage = text ? `
        <section class="text component a4-page">
        <h4>FOLHA 5 - LEITURA DE TEXTO</h4>
            <h4>ORIENTAÇÕES PARA O ALUNO:</h4>
            <p>
                Por último, você vai ler uma história completa. Leia em voz alta, com atenção, respeitando a
                pontuação. Após a leitura, eu farei algumas perguntas sobre a história, então tente entender o que
                está acontecendo. Não tenha pressa, leia no seu ritmo.
            </p>
            <h4>
                Por exemplo, eu poderei perguntar:
            </h4>
            <ul>
                <li>
                    <b>
                        "Quem são os personagens principais do texto?"
                    </b>
                </li>
                <li>
                    <b>
                        "O que aconteceu com a personagem Bia no final da história?"
                    </b>
                </li>
            </ul>
            <fieldset>
                <h3>Title</h5>
                    <div class="textConteiner">
                        ${text}
                    </div>
            </fieldset>
        </section>
    ` : ''
    return textPage
}

const factoryPageQuestions = ({ questions }) => {
    const questionsPage = questions && questions.length > 0 ? `
        <section class="question component">
            <h4>FOLHA 6 - QUESTÕES DE COMPREENSÃO DE TEXTO</h4>
            <p>
                <b>
                    Agora que você terminou de ler o texto "O mistério do casarão", vou fazer algumas perguntas
                    para ver se você entendeu a história. Para cada pergunta, vou ler quatro alternativas. Você deve
                    escolher a alternativa que melhor responde à pergunta.
                </b>
            </p>

            <div class="content-quests">
                ${questions.map((question, i) => `
                <div class="quest">
                    <h3>
                        Questao ${i + 1}°
                    </h3>
                    <h4>
                        ${question.text}
                    </h4>
                    <ol>
                        ${question.options.map(option => `
                            <li>${option}</li>
                        `).join('')
        }
                    </ol>
                </div>
                `).join('')
        }
            </div>
        </section>
    ` : ''
    return questionsPage
}
