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
    filtrosAnoEscolar.value = "";
    filtrosEvento.value = "";
    escola.value = "";
});
grupos.disabled = true;
filtrosAnoEscolar.disabled = true;
filtrosEvento.disabled = true;
filtrosRegioes.disabled = true;
escola.disabled = true;

let groupId = null;
let regionId = null;
let schoolId = null;
let eventId = null;
let schoolYearId = null;
aplicarFiltros.addEventListener("click", async () => {
    const data = await fetch(path_base + `/dashboard/analytics?schoolId=${schoolId || ''}&gradeLevel=${schoolYearId || ''}&classGroupId=${groupId || ''}&assessmentEventId=${eventId || ''}`, {
        headers: headers
    });
    const response = await data.json();
    PopularCards(response);
    PopularGraphPizza(response);
    const data2 = await fetch(path_base + `/dashboard/performance-by-grade?schoolId=${schoolId || ''}&assessmentEventId=${eventId || ''}`, {
        headers: headers
    });
    const response2 = await data2.json();
    if (response2.gradePerformance.length > 0) {
        PopularGraphSeries(response2.gradePerformance[0]);
    }
    const data3 = await fetch(path_base + `/dashboard/yearly-progression?schoolId=${schoolId || ''}&classGroupId=${groupId || ''}&gradeLevel=${schoolYearId || ''}`, {
        headers: headers
    });
    const response3 = await data3.json();
    PopularGraphYear(response3.yearly);
    const data4 = await fetch(path_base + `/dashboard/reading-level-evolution?schoolId=${schoolId || ''}&gradeLevel=${schoolYearId || ''}&classGroupId=${groupId || ''}`, {
        headers: headers
    });
    const response4 = await data4.json();
    PopularGraphEvolution(response4.evolution[0]);

});
filtrosRegioes.addEventListener("change", () => {
    regionId = filtrosRegioes.value;
    if (regionId != "" && groupId != "") {
        const schools = cache.schools.filter(item => item.regionId == regionId);
        escola.innerHTML = '<option value="">Selecione a escola</option>';
        schools.forEach(item => {
            const option = document.createElement('option');
            option.value = item.id;
            option.textContent = item.name;
            escola.appendChild(option);
        });
    }
})
grupos.addEventListener("change", () => {
    regionId = filtrosRegioes.value;
    groupId = grupos.value;
    if (regionId != "" && groupId != "") {
        escola.disabled = false;
        escola.innerHTML = '<option value="">Selecione a escola</option>';
        cache.schools.forEach(item => {
            const option = document.createElement('option');
            option.value = item.id;
            option.textContent = item.name;
            escola.appendChild(option);
        });
    }
})
escola.addEventListener("change", () => {
    groupId = grupos.value;
    regionId = filtrosRegioes.value;
    if (groupId != "" && regionId != "") {
        filtrosAnoEscolar.disabled = false;
    }
})
filtrosAnoEscolar.addEventListener("change", () => {
    schoolId = escola.value;
    schoolYearId = filtrosAnoEscolar.value;
    if (schoolId != "" && groupId != "" && regionId != "" && schoolYearId != "") {
        filtrosEvento.disabled = false;
    }
})

filtrosEvento.addEventListener("change", () => {
    eventId = filtrosEvento.value;
    if (eventId != "" && schoolId != "" && groupId != "" && regionId != "" && schoolYearId != "") {
        filtrosEvento.disabled = false;
    }
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
const path_base = "https://salf-salf-api2.gkgtsp.easypanel.host/api"
async function initialize() {
    const data = await fetch(path_base + '/dashboard/analytics', {
        headers: headers
    });
    const response = await data.json();
    PopularCards(response);
    PopularGraphPizza(response);
    const data2 = await fetch(path_base + '/dashboard/performance-by-grade', {
        headers: headers
    });
    const response2 = await data2.json();
    // PopularGraphSeries(response2.gradePerformance[0]);
    const data3 = await fetch(path_base + '/dashboard/yearly-progression', {
        headers: headers
    });
    const response3 = await data3.json();
    PopularGraphYear(response3.yearly);
    const data4 = await fetch(path_base + '/dashboard/reading-level-evolution', {
        headers: headers
    });
    const response4 = await data4.json();
    PopularGraphEvolution(response4.evolution[0]);
    PopularFilters();
}
initialize();
function PopularCards({ totalStudents, studentsAssessed, assessmentCompletion, averagePpm, participationRate, comprehensionScore }) {
    const values = [totalStudents, studentsAssessed, assessmentCompletion, averagePpm, participationRate, comprehensionScore];
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
                label: 'My First dataset',
                backgroundColor: ['#06c5c8', '#6a06c8', '#06c85e', '#ffe803'],
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
function PopularGraphSeries({ distribution, grade }) {
    if (distribution === undefined && distribution.length === 0 && grade === null) {
        distribution = [];
    }
    const labels = distribution.map(item => item.name) || ["não informado"];
    const data = distribution.map(item => item.percentage) || [0];

    if (series) {
        series.destroy();
    }
    series = new Chart(canvarGraphSeries, {
        type: 'bar',
        data: {
            labels,
            datasets: [{
                label: grade,
                data,
                backgroundColor: 'rgba(255, 99, 133, 0.93)',
                borderColor: 'rgba(255, 99, 132, 1)',
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
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
        data: { labels, datasets: [{ label: 'Total', data }] },
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

}

const filterGroup = async (id) => {
    grupos.innerHTML = '<option value="">Selecione o grupo</option>';
    grupos.disabled = false
    const data = await fetch(path_base + `/groups?regionId=${id}`, {
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
    const data = await fetch(path_base + `/regions`, {
        headers: headers
    });
    filtrosRegioes.disabled = false;
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
    const request = await fetch(path_base + `/schools?groupId=${grupos.value}&&regionId=${filtrosRegioes.value}`, {
        headers: headers
    });
    const {data} = await request.json();
    escola.innerHTML = '<option value="">Selecione o ano escolar</option>';
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
filtrosAnoEscolar.addEventListener("change", () => {
    filterEvent();
})
const filterEvent = async () => {
    const response = await fetch(path_base + `/assessment-events`, {
        headers: headers
    });
    const data = await response.json();
    data.forEach(item => {
        const option = document.createElement('option');
        option.value = item.id;
        option.textContent = item.name;
        filtrosEvento.appendChild(option);
    })
}