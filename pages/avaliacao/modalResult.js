const modalResult = document.getElementById('btn-modal-result')
const resultElement = document.getElementById('etapa-result')
const queryIdEvent = localStorage.getItem('queryId')
const modal = document.getElementById('modalResult')
const voltar = document.getElementById('btn-voltar-dashboard')
voltar.addEventListener('click',() => {
    window.location.href = location.origin + '/dashboard/dashboard.html'
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
    const url = `https://api.salf.maximizaedu.com/api/reading-assessments/${localStorage.getItem('id')}/result`
    const response = await fetch(url, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    })
    const data = await response.json()
    applyResult(data)
    cache.result = await data
}
const applyResult = ({ readingLevel, ppm, description, recommendations, progress, wordAccuracy, pseudowordAccuracy, phraseAccuracy, textAccuracy }) => {
    const niveisLeitor = {
        NOT_EVALUATED: 'Não avaliado',
        NON_READER: 'Não leitor',
        SYLLABLE_READER: 'Leitor de sílabas',
        WORD_READER: 'Leitor de palavras',
        SENTENCE_READER: 'Leitor de frases',
        TEXT_READER_WITHOUT_FLUENCY: 'Leitor de texto sem fluência',
        TEXT_READER_WITH_FLUENCY: 'Leitor de texto com fluência'
    }
    const studentName = document.getElementById('resultado-aluno-nome')
    const studentGrade = document.getElementById('resultado-serie')
    const studentLevel = document.getElementById('nivel-leitor-sugerido')
    const studentDescription = document.getElementById('descricao-nivel')
    const studentProgress = document.getElementById('nivel-progresso')
    const studentRecommendations = document.getElementById('nivel-observacao')
    const studentProgressPalavras = document.getElementById('nivel-progresso-palavras')
    const studentProgressPseudopalavras = document.getElementById('nivel-progresso-pseudopalavras')

    studentName.textContent = localStorage.getItem('aluno').replaceAll('"', '')
    studentGrade.textContent = localStorage.getItem('turma').replaceAll('"', '')
    studentLevel.textContent = niveisLeitor[readingLevel]
    studentDescription.textContent = description
    studentProgress.style.width = `${progress || 0}%`
    studentRecommendations.textContent = recommendations
    studentProgressPalavras.style.width = `${wordAccuracy || 0}%`
    studentProgressPalavras.textContent = `${wordAccuracy || 0}%`
    studentProgressPseudopalavras.style.width = `${pseudowordAccuracy || 0}%`
    studentProgressPseudopalavras.textContent = `${pseudowordAccuracy || 0}%`
}   


