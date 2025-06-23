const chartProgressao = document.getElementById('chart-progressao');
let chart;
const randerChartProgressao = (object) => {

    const labelsExternos = object.map(item => item.region);
    const datasetsInterno = object.map(item => {
        return {
            label: item.region,
            data: item.percentage,
        }
    });
    if(chart){
        chart.destroy();
    }
    const ctx = chartProgressao.getContext('2d');
        chart = new Chart(ctx, {
        type: 'bar',
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    suggestedMax: 100,
                    ticks: {
                        stepSize: 20,
                        callback: function (value, index, values) {
                            return value + '%';
                        }
                    },
                }
            }
        },

        plugins: {
            legend: { display: false },
            tooltip: {
                callbacks: {
                    label: ctx => `Total: ${ctx.raw}`
                }
            }
        },
        data: {
            labels: labelsExternos,
            datasets: [{
                label: 'Ranking das regiões com maior número de leitores fluentes',
                data: datasetsInterno.map(item => item.data),
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }]
        }
    });
}
const randerRankingsEscola = (data) => {
    const body = document.getElementById('tbody');
    body.innerHTML = '';
    data.forEach(item => {
        const tr = document.createElement('tr');
        tr.classList.add('bg-white', 'divide-y', 'divide-gray-200', 'text-gray-900', 'text-sm', 'font-medium', "text-center");
        tr.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap text-left">${item.school}</td>
            <td class="px-6 py-4 whitespace-nowrap text-left">${item.count}</td>
        `;
        body.appendChild(tr);
    });
}


document.addEventListener('DOMContentLoaded', async () => {
    const btnFiltrar = document.getElementById('aplicar-filtros');
    const response = await fetch(`https://salf-salf-api2.gkgtsp.easypanel.host/api/dashboard/school-ranking`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    });
    const response2 = await fetch(`https://salf-salf-api2.gkgtsp.easypanel.host/api/dashboard/ranking-by-region`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    });
    const data = await response.json();
    const data2 = await response2.json();
    randerChartProgressao(data2);
    randerRankingsEscola(data.data);

    btnFiltrar.addEventListener('click', async (e) => {
        e.preventDefault();
        const regiao = document.getElementById('regiao').value;
        const grupo = document.getElementById('grupo').value;
        console.log(regiao, grupo); 
        const response = await fetch(`https://salf-salf-api2.gkgtsp.easypanel.host/api/dashboard/school-ranking?region=${regiao}&group=${grupo}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        }); 
        const data = await response.json();
        randerRankingsEscola(data.data);
        const response2 = await fetch(`https://salf-salf-api2.gkgtsp.easypanel.host/api/dashboard/ranking-by-region?region=${regiao}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        const data2 = await response2.json();
        randerChartProgressao(data2);
    });




})




