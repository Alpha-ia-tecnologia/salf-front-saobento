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
    randerRankingsEscola(data.data);
})
// btnFiltrar.addEventListener('click', async (e) => {
//     e.preventDefault();
//     const regiao = document.getElementById('filtro-regiao').value;
//     const grupo = document.getElementById('filtro-grupo').value;
//     const escola = document.getElementById('filtro-escola').value;
//     const evento = document.getElementById('evento').value;

// });

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