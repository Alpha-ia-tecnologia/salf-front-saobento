const canvarGraphPizza = document.getElementById('chart-niveis');
const canvarGraphSeries = document.getElementById('chart-series');
const canvaGraphBar = document.getElementById('chart-progressao');
const canvaGraphYear = document.getElementById('chart-evolucao');
const ctxGraphPizza = canvarGraphPizza.getContext('2d');
const ctxGraphSeries = canvarGraphSeries.getContext('2d');
const ctxGraphBar = canvaGraphBar.getContext('2d');
const ctxGraphYear = canvaGraphYear.getContext('2d');

const filtrosRegioes = document.getElementById('regiao');
const escola = document.getElementById('escola');
const grupos = document.getElementById('grupo');
const eventos = document.getElementById('evento');
const filtrosAnoEscolar = document.getElementById('ano-escolar');
const filtrosEvento = document.getElementById('evento');
const cardValue = document.querySelectorAll('.card-value');
const limparFiltros = document.getElementById('limpar-filtros');
const aplicarFiltros = document.getElementById('aplicar-filtros');
limparFiltros.addEventListener("click", () => {
    filtrosRegioes.value = "";
    grupos.value = "";
    // filtrosAnoEscolar.value = "";
    filtrosEvento.value = "";
    escola.value = "";
});
// grupos.disabled = true;
// filtrosAnoEscolar.disabled = true;
// filtrosEvento.disabled = true;
// filtrosRegioes.disabled = true;
// escola.disabled = true;

let groupId = null;
let regionId = null;
let schoolId = null;
let eventId = null;
let schoolYearId = null;
aplicarFiltros.addEventListener("click", async () => {
    const data = await fetch(API_BASE_URL + `/dashboard/analytics?schoolId=${schoolId || ''}&gradeLevel=${schoolYearId || ''}&classGroupId=${groupId || ''}&assessmentEventId=${eventId || ''}`, {
        headers: headers
    });
    const response = await data.json();
    PopularCards(response);
    PopularGraphPizza(response);
    const data2 = await fetch(API_BASE_URL + `/dashboard/performance-by-grade?schoolId=${schoolId || ''}&assessmentEventId=${eventId || ''}`, {
        headers: headers
    });
    const response2 = await data2.json();
    console.log(response2);
    if (response2.gradePerformance.length > 0) {
        PopularGraphSeries(response2.gradePerformance);
    }
    const data3 = await fetch(API_BASE_URL + `/dashboard/yearly-progression?schoolId=${schoolId || ''}&classGroupId=${groupId || ''}&gradeLevel=${schoolYearId || ''}`, {
        headers: headers
    });
    const response3 = await data3.json();
    PopularGraphYear(response3.yearly);
    const data4 = await fetch(API_BASE_URL + `/dashboard/reading-level-evolution?schoolId=${schoolId || ''}&gradeLevel=${schoolYearId || ''}&classGroupId=${groupId || ''}`, {
        headers: headers
    });
    const response4 = await data4.json();
    PopularGraphEvolution(response4.evolution[0]);

});
filtrosRegioes.addEventListener("change", () => {
    regionId = filtrosRegioes.value;
    const schools = cache.schools.filter(item => item.regionId == regionId);
    escola.innerHTML = '<option value="">Selecione a escola</option>';
    schools.forEach(item => {
        const option = document.createElement('option');
        option.value = item.id;
        option.textContent = item.name;
        escola.appendChild(option);
    });
})
grupos.addEventListener("change", () => {
    regionId = filtrosRegioes.value;
    groupId = grupos.value;
    escola.disabled = false;
    escola.innerHTML = '<option value="">Selecione a escola</option>';
    const schools = cache.schools.filter(item => item.groupId == groupId);
    schools.forEach(item => {
        const option = document.createElement('option');
        option.value = item.id;
        option.textContent = item.name;
        escola.appendChild(option);
    });

})
escola.addEventListener("change", () => {
    groupId = grupos.value;
    regionId = filtrosRegioes.value;
    filtrosAnoEscolar.disabled = false;
    // filtrosAnoEscolar.innerHTML = '<option value="">Selecione o ano escolar</option>';
    // const schoolYears = cache.schoolYears.filter(item => item.schoolId == escola.value);
    // schoolYears.forEach(item => {
    //     const option = document.createElement('option');
    //     option.value = item.id;
    //     option.textContent = item.name;
    //     filtrosAnoEscolar.appendChild(option);
    // });
})
filtrosAnoEscolar.addEventListener("change", () => {
    schoolId = escola.value;
    schoolYearId = filtrosAnoEscolar.value;
    filtrosEvento.disabled = false;

})

filtrosEvento.addEventListener("change", () => {
    eventId = filtrosEvento.value;
    filtrosEvento.disabled = false;

})

const cache = {
    schools: [],
    groups: [],
    assessmentEvents: [],
    schoolYears: [],
    regions: []
}

const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('token')}`
}
// const path_base = "https://salf-salf-api2.gkgtsp.easypanel.host/api" // Removido - usando configuração global
async function initialize() {
    const data = await fetch(API_BASE_URL + '/dashboard/analytics', {
        headers: headers
    });
    const response = await data.json();
    PopularCards(response);
    PopularGraphPizza(response);
    const data2 = await fetch(API_BASE_URL + '/dashboard/performance-by-grade', {
        headers: headers
    });
    const response2 = await data2.json();
    PopularGraphSeries(response2.gradePerformance);
    const data3 = await fetch(API_BASE_URL + '/dashboard/yearly-progression', {
        headers: headers
    });
    const response3 = await data3.json();
    PopularGraphYear(response3.yearly);
    const data4 = await fetch(API_BASE_URL + '/dashboard/reading-level-evolution', {
        headers: headers
    });
    const response4 = await data4.json();
    PopularGraphEvolution(response4.evolution[0]);
    PopularFilters();
}
initialize();
function PopularCards({ totalStudents, studentsAssessed, assessmentCompletion, averagePpm, participationRate, comprehensionScore }) {
    const values = [totalStudents, studentsAssessed, participationRate, averagePpm, assessmentCompletion, comprehensionScore];
    cardValue.forEach((card, index) => {
        if (index === 2 || index === 3 || index === 4) {
            card.innerHTML = values[index] + "%";
        } else {
            card.innerHTML = values[index];
        }
    });
}
let pizza = null;
function PopularGraphPizza({ readingLevelDistribution }) {
    if (readingLevelDistribution.length === 0) {
        return;
    }
    const labels = readingLevelDistribution.map(item => item.name);
    const data = readingLevelDistribution.map(item => item.percentage);
    console.log(data);
    console.log(labels);
    if (pizza) {
        pizza.destroy();
    }
    pizza = new Chart(canvarGraphPizza, {
        type: 'pie',
        data: {
            labels: labels || [],
            datasets: [{
                backgroundColor: ['#06c5c8', '#6a06c8', '#06c85e', '#ffe803', 'rgb(255, 16, 16)', "rgb(255, 16, 124)", "rgb(16, 255, 147)"],
                data: data || []
            }],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        boxWidth: 15,
                        font: {
                            size: 10
                        }
                    }
                }
            }
        }
    });
}
let series = null;
function PopularGraphSeries(obj) {
    console.log(obj);

    const labelPerformDefault = obj.map(item => item.grade);
    const data = obj.map(item => {
        return {
            label: item.grade,
            data: item.distribution.map(({ percentage }) => percentage),
            color: Math.floor(Math.random() * 16777215).toString(16),
            yAxisID: 'y',
        }
    }) || [0];
    console.log(data);




    if (series) {
        series.destroy();
    }
    series = new Chart(canvarGraphSeries, {
        type: 'line',
        data: {
            labels: labelPerformDefault,
            datasets: data,
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    id: 'y',
                    type: 'linear',
                }
            }
        }
    });
}
let year = null;
function PopularGraphYear({ previousYear, currentYear }) {
    const labels = [previousYear.year, currentYear.year];
    const data = [previousYear.total, currentYear.total];
    if (data.length === 0) {
        return;
    }
    if (year) {
        year.destroy();
    }
    year = new Chart(canvaGraphBar, {
        type: 'bar',
        data: { labels, datasets: [{ label: 'Total', data: data }] },
        options: {
            responsive: true,
            maintainAspectRatio: false,
        }
    });
}
let evolution = null;
function PopularGraphEvolution({ eventName, distribution }) {
    if (distribution.length === 0 && eventName === null) {
        return;
    }
    const labels = distribution.map(item => item.name);
    const datasets = distribution.map(item => item.percentage);
    console.log(eventName);
    console.log(labels);
    console.log(datasets);
    if (evolution) {
        evolution.destroy();
    }
    evolution = new Chart(canvaGraphYear, {
        type: 'line',
        data: {
            labels,
            datasets: [{
                label: eventName,
                data: datasets
            }]
        },
        options: {
            responsive: true,
        }
    });
}

function PopularFilters() {
    filterRegion();
    filterEvent()
    filterGroup()
    filterSchool()
}

const filterGroup = async (id) => {
    grupos.innerHTML = '<option value="">Selecione um grupo</option>';
    const data = await fetch(API_BASE_URL + `/groups?regionId=${id}`, {
        headers: headers
    });
    const response = await data.json();
    response.data.forEach(item => {
        const option = document.createElement('option');
        option.value = item.id;
        option.textContent = item.name;
        grupos.appendChild(option);
    });

}
const filterRegion = async () => {
    const data = await fetch(API_BASE_URL + `/regions`, {
        headers: headers
    });
    const response = await data.json();
    filtrosEvento.innerHTML = '<option value="">Selecione o evento</option>';
    response.data.forEach(item => {
        const option = document.createElement('option');
        option.value = item.id;
        option.textContent = item.name;
        filtrosRegioes.appendChild(option);
    })
}
const filterSchool = async () => {
    const request = await fetch(API_BASE_URL + `/schools?groupId=${grupos.value}&&regionId=${filtrosRegioes.value}&limit=1000`, {
        headers: headers
    });
    const { data } = await request.json();
    escola.innerHTML = '<option value="">Selecione a escola</option>';
    data.forEach(item => {
        const option = document.createElement('option');
        option.value = item.id;
        option.textContent = item.name;
        escola.appendChild(option);
    }
    );
}

filtrosRegioes.addEventListener("change", () => {
    filterGroup(filtrosRegioes.value);
})
grupos.addEventListener("change", () => {
    filterSchool();
})
/* The code is using JavaScript to add an event listener to the "filtrosAnoEscolar" element. When the
"change" event occurs on this element, the "filterEvent()" function will be called. However, the
code is commented out using "//" and " */
filtrosAnoEscolar.addEventListener("change", () => {
    filterEvent();
})
const filterEvent = async () => {
    const response = await fetch(API_BASE_URL + `/assessment-events?limit=1000`, {
        headers: headers
    });
    const data = await response.json();
    filtrosEvento.innerHTML = '<option value="">Selecione o evento</option>';
    data.forEach(item => {
        const option = document.createElement('option');
        option.value = item.id;
        option.textContent = item.name;
        filtrosEvento.appendChild(option);
    })
}