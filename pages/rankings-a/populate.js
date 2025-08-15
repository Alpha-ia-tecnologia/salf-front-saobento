const filterGrupo = document.getElementById('filtro-grupo');
const filterEscola = document.getElementById('filtro-escola');
const filterEvento = document.getElementById('filtro-evento');
const filterRegiao = document.getElementById('filtro-regiao');

document.addEventListener('DOMContentLoaded', async () => {
    await renderRegionsSelect();
    await renderEvent();
})
const options = {
    headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
}
filterRegiao.addEventListener('change', (e) => {
    renderRegion(e.target.value);
    renderGroup(e.target.value);
});

filterGrupo.addEventListener('change', (e) => {
    renderGroup(e.target.value);
});

const renderRegion = async (id) => {
    const response = await fetch(`${API_BASE_URL}/groups?region_id=${id}&limit=1000`,options);
    const data = await response.json();

    filterGrupo.innerHTML = '<option value="">Selecione um grupo</option>';
    data.data.forEach(grupo => {
        const option = document.createElement('option');
        option.value = grupo.id;
        option.textContent = grupo.name;
        filterGrupo.appendChild(option);
    });
}

const renderGroup = async (id) => {
    const response = await fetch(`${API_BASE_URL}/schools?group_id=${id}&limit=1000`,options);
    const data = await response.json();

    filterEscola.innerHTML = '<option value="">Selecione uma escola</option>';
    data.data.forEach(escola => {
        const option = document.createElement('option');
        option.value = escola.id;
        option.textContent = escola.name;
        filterEscola.appendChild(option);
    });
}

const renderEvent = async () => {
    const response = await fetch(`${API_BASE_URL}/assessment-events?limit=1000`,options);
    const data  = await response.json();
    filterEvento.innerHTML = '<option value="">Selecione um evento</option>';
    data.forEach(evento => {
        const option = document.createElement('option');
        option.value = evento.id;
        option.textContent = evento.name;
        filterEvento.appendChild(option);
    });
}

const renderRegionsSelect = async () => {
    const response = await fetch(`${API_BASE_URL}/regions?limit=1000`,options);
    const data = await response.json();

    filterRegiao.innerHTML = '<option value="">Selecione uma região</option>';
    data.data.forEach(regiao => {
        const option = document.createElement('option');
        option.value = regiao.id;
        option.textContent = regiao.name;
        filterRegiao.appendChild(option);
    });
}

