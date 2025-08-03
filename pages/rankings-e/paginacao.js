
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
    const randerRankingsEscola = (data) => {
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
                <td class="px-6 py-4 whitespace-nowrap text-left">${item.school}</td>
                <td class="px-6 py-4 whitespace-nowrap text-left">${item.count}</td>
     
            `;
            body.appendChild(tr);
        });
    }

    const requestPageRanking = async () => {
        const response = await fetch(`${window.API_BASE_URL}/dashboard/school-ranking?page=${page}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        const { data } = await response.json();
        randerRankingsEscola(data);
    }


});

