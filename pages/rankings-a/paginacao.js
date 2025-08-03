const niveisLeitores = {
    NOT_EVALUATED: 'Não avaliado',
    NON_READER: 'Não leitor',
    SYLLABLE_READER: 'Leitor de sílabas',
    WORD_READER: 'Leitor de palavras',
    SENTENCE_READER: 'Leitor de frases',
    TEXT_READER_WITHOUT_FLUENCY: 'Leitor de texto sem fluência',
    TEXT_READER_WITH_FLUENCY: 'Leitor de texto com fluência'
}
document.addEventListener('DOMContentLoaded', () => {
    const btnPageAnterior = document.getElementById('btn-page-anterior');
    const btnPageProxima = document.getElementById('btn-page-proximo');
    const btnPage = document.getElementById('btn-page');
    let page = 1;
    btnPageAnterior.addEventListener('click', () => {
        btnPage.textContent = page;
        if (page >= 1) {
            page--;
            requestPageRanking();
        }

    });

    btnPageProxima.addEventListener('click', () => {
        btnPage.textContent = page;
        page++;
        requestPageRanking();
    });

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
                <td class="px-6 py-4 whitespace-nowrap">${item.student}</td>
                <td class="px-6 py-4 whitespace-nowrap">${item.school}</td>
                <td class="px-6 py-4 whitespace-nowrap">${item.region}</td>
                <td class="px-6 py-4 whitespace-nowrap">${item.group}</td>
                <td class="px-6 py-4 whitespace-nowrap">${niveisLeitores[item.readingLevel]}</td>
            `;
            body.appendChild(tr);
        });

    }

    const requestPageRanking = async () => {
        const response = await fetch(`${window.API_BASE_URL}/dashboard/student-ranking?page=${page}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        const { data } = await response.json();
        randerRanking(data);
    }


});


