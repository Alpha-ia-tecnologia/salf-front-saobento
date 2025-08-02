let filters = false
const chartSeries = document.getElementById('chart-series');
const tbody = document.getElementById('tbody');
const btnFiltrar = document.getElementById('btn-filtrar');
const regiao = document.getElementById('filtro-regiao');
const grupo = document.getElementById('filtro-grupo');
const escola = document.getElementById('filtro-escola');
const evento = document.getElementById('filtro-evento');
document.addEventListener('DOMContentLoaded', async () => {
    const response = await fetch(`${window.API_BASE_URL}/dashboard/student-ranking`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    });
    const { data } = await response.json();
    renderRankingAlunos(data);

    btnFiltrar.addEventListener('click', async (e) => {
        e.preventDefault();

        console.log(regiao, grupo);
        const response = await fetch(`${window.API_BASE_URL}/dashboard/student-ranking?region=${regiao.value}&group=${grupo.value}&school_id=${escola.value}&assessmentEventId=${evento.value}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        const { data } = await response.json();
        renderRankingAlunos(data);
    });
})
const niveisLeitores = {
    NOT_EVALUATED: 'Não avaliado',
    NON_READER: 'Não leitor',
    SYLLABLE_READER: 'Leitor de sílabas',
    WORD_READER: 'Leitor de palavras',
    SENTENCE_READER: 'Leitor de frases',
    TEXT_READER_WITHOUT_FLUENCY: 'Leitor de texto sem fluência',
    TEXT_READER_WITH_FLUENCY: 'Leitor de texto com fluência'
}
const renderRankingAlunos = (data) => {
    const body = document.getElementById('tbody');
    body.innerHTML = '';
    data.forEach(item => {
        const tr = document.createElement('tr');
        tr.classList.add('bg-white',
            'divide-y',
            'divide-gray-200',
            'text-gray-900',
            'text-sm',
            'font-medium',
            "text-center");
        tr.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap">${item.student}</td>
            <td class="px-6 py-4 whitespace-nowrap">${item.school}</td>
            <td class="px-6 py-4 whitespace-nowrap">${item.region}</td>
            <td class="px-6 py-4 whitespace-nowrap">${item.group}</td>
            <td class="px-6 py-4 whitespace-nowrap">${niveisLeitores[item.readingLevel]}</td>
        `;
        body.appendChild(tr);
    });

}

