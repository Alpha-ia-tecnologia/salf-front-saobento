const chartSeries = document.getElementById('chart-series');
const btnFiltrar = document.getElementById('btn-filtrar');
const tbody = document.getElementById('tbody');
let filters = false
onload = async() => {   
    const response = await fetch(`https://salf-salf-api2.gkgtsp.easypanel.host/api/dashboard/student-ranking`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    });
    const data = await response.json();
    randerRanking(data);
}
btnFiltrar.addEventListener('click', async (e) => {
    e.preventDefault();
    const regiao = document.getElementById('filtro-regiao').value;
    const grupo = document.getElementById('filtro-grupo').value;
    const escola = document.getElementById('filtro-escola').value;
    const evento = document.getElementById('evento').value;
    if (regiao && grupo && escola && evento) {
        console.log(regiao, grupo, escola, evento);
        console.log(typeof regiao, typeof grupo, typeof escola, typeof evento);
        const response = await fetch(`https://salf-salf-api2.gkgtsp.easypanel.host/api/dashboard/student-ranking?region=${regiao}&group=${grupo}&school_id=${escola}&assessmentEventId=${evento}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        const data = await response.json() ;
        randerRanking(data);
    }
});
const niveisLeitores = {
    NOT_EVALUATED: 'Não avaliado',
    NON_READER: 'Não leitor',
    SYLLABLE_READER: 'Leitor de sílabas',
    WORD_READER: 'Leitor de palavras',
    SENTENCE_READER: 'Leitor de frases',
    TEXT_READER_WITHOUT_FLUENCY: 'Leitor de texto sem fluência',
    TEXT_READER_WITH_FLUENCY: 'Leitor de texto com fluência'
}
const randerRanking = (data) => {
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
            <td class="px-6 py-4 whitespace-nowrap">${item.studentId}</td>
            <td class="px-6 py-4 whitespace-nowrap">${item.student}</td>
            <td class="px-6 py-4 whitespace-nowrap">${item.school}</td>
            <td class="px-6 py-4 whitespace-nowrap">${item.region}</td>
            <td class="px-6 py-4 whitespace-nowrap">${item.group}</td>
            <td class="px-6 py-4 whitespace-nowrap">${niveisLeitores[item.readingLevel]}</td>
        `;
        body.appendChild(tr);
    });

}