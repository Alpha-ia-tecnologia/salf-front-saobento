const chartSeries = document.getElementById('chart-series');

const chart = new Chart(chartSeries, {
    type: 'bar',
    data: {
        labels: ['1º Ano', '2º Ano', '3º Ano', '4º Ano', '5º Ano', '6º Ano', '7º Ano', '8º Ano', '9º Ano'],
        datasets: [{
            label: 'Desempenho',
            data: [10, 20, 30, 40, 50, 60, 70, 80, 90],
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            
            y: {
                beginAtZero: true   
            }
        }
    }
});