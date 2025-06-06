const modalResult = document.getElementById('btn-modal-result')
const resultElement = document.getElementById('etapa-result')
const queryIdEvent = localStorage.getItem('queryId')
const modal = document.getElementById('modalResult')
const voltar = document.getElementById('btn-voltar-dashboard')
const novoAvaliacao  = document.getElementById("btn-nova-avaliacao")
novoAvaliacao.addEventListener("click",() => {

    location.reload()
})
voltar.addEventListener('click',() => {
    window.location.href = location.origin + 'pages/dashboard/dashboard.html'
})

modalResult.addEventListener('click',async () => {
    const modal = document.getElementById('modalResult')
    modal.classList.remove('hidden')
    resultElement.classList.toggle('hidden')
    getResult()
})
const cache = {
    result: null,
}
document.getElementById('closeModal').addEventListener('click',() => {
    resultElement.classList.toggle('hidden')
    modal.classList.add('hidden')
    cache.result = null
    localStorage.removeItem('id')
})

const getResult = async () => {
  // const url = `https://salf-salf-api2.gkgtsp.easypanel.host/api/reading-assessments/${localStorage.getItem('id')}/result`
    // const response = await fetch(url, {
    //     headers: {
    //         'Content-Type': 'application/json',
    //         'Authorization': `Bearer ${localStorage.getItem('token')}`
    //     }
    // })
    const data =  localStorage.getItem("model")
    applyResult(JSON.parse(data))
    cache.result = data
}
const applyResult = ({ perfil ,student , desempenhoQuestoes   , desempenhoPalavras, desempenhoPseudopalavras, desempenhoFrases,  desempenhoTextos, desempenhoQuestoes}) => {
    const niveisLeitores = {
        NOT_EVALUATED: 'Não avaliado',
        NON_READER: 'Não leitor',
        SYLLABLE_READER: 'Leitor de sílabas',
        WORD_READER: 'Leitor de palavras',
        SENTENCE_READER: 'Leitor de frases',
        TEXT_READER_WITHOUT_FLUENCY: 'Leitor de texto sem fluência',
        TEXT_READER_WITH_FLUENCY: 'Leitor de texto com fluência'
    }
    const studentName = document.getElementById('resultado-aluno-nome')
    const studentLevel = document.getElementById('nivel-leitor-sugerido')
    const studentProgressPalavras = document.getElementById('nivel-progresso-palavras')
    const studentProgressPseudopalavras = document.getElementById('nivel-progresso-pseudopalavras')
    const studentProgressFrases = document.getElementById('nivel-progresso-frases')
    const studentProgressTexto = document.getElementById('nivel-progresso-texto')
    const studentProgressQuestoes = document.getElementById('nivel-progresso-questoes')
    studentName.textContent = student
    studentLevel.textContent = niveisLeitores[perfil]
    studentProgressPalavras.style.width = `${desempenhoPalavras || 0}%`
    studentProgressPalavras.textContent = `${desempenhoPalavras || 0}%`
    studentProgressPseudopalavras.style.width = `${desempenhoPseudopalavras || 0}%`
    studentProgressPseudopalavras.textContent = `${desempenhoPseudopalavras || 0}%`
    studentProgressFrases.style.width = `${desempenhoFrases || 0}%`
    studentProgressFrases.textContent = `${desempenhoFrases || 0}%`
    studentProgressTexto.style.width = `${desempenhoTextos || 0}%`
    studentProgressTexto.textContent = `${desempenhoTextos || 0}%`
    studentProgressQuestoes.style.width = `${desempenhoQuestoes || 0}%`
    studentProgressQuestoes.textContent = `${desempenhoQuestoes || 0}%`
}   


