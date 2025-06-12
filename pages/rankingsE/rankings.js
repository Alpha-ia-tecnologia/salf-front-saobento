const chartSeries = document.getElementById('chart-series');
const btnFiltrar = document.getElementById('btn-filtrar');
let filters = false
document.addEventListener('DOMContentLoaded', async () => {
    const response = await fetch(`https://salf-salf-api2.gkgtsp.easypanel.host/api/dashboard/school-ranking`, {
        method: 'GET',
        headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
    });
    const data = await response.json();
    randerRankingsEscola(data);
})
// btnFiltrar.addEventListener('click', async (e) => {
//     e.preventDefault();
//     const regiao = document.getElementById('filtro-regiao').value;
//     const grupo = document.getElementById('filtro-grupo').value;
//     const escola = document.getElementById('filtro-escola').value;
//     const evento = document.getElementById('evento').value;

// });

const randerRankingsEscola = (data) => {
    const labels = data.map(item => item.school)
    const datas = data.map(item => item.count)
    console.log(data)
    const config = {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Ranking das escolas',
                data: datas,
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    }
    new Chart(chartSeries, config)
}