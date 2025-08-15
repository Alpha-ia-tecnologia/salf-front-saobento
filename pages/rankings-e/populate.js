const filterGrupo = document.getElementById('grupo');
const filterRegiao = document.getElementById('regiao');

onload = async () => {
    renderRegionsSelect();
}
const options = {
    headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
}
filterRegiao.addEventListener('change', (e) => {
        filterGrupo.disabled = false;
        renderRegion(e.target.value);
});


const renderRegion = async (id) => {
    const response = await fetch(`${API_BASE_URL}/groups?region_id=${id}&limit=1000`,options);
    const data = await response.json();

    filterGrupo.innerHTML = '<option value="">Todos os grupos</option>';
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

    filterEscola.innerHTML = '<option value="">Todas as escolas</option>';
    data.data.forEach(escola => {
        const option = document.createElement('option');
        option.value = escola.id;
        option.textContent = escola.name;
        filterEscola.appendChild(option);
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

