const filterGrupo = document.getElementById('grupo');
const filterEscola = document.getElementById('escola');
const filterRegiao = document.getElementById('regiao');

onload = async () => {
    loadRegioes();
}

filterRegiao.addEventListener('change', (e) => {
    if(e.target.value) {
        filterGrupo.disabled = false;
        loadGrupos(e.target.value);
    } 
});

filterGrupo.addEventListener('change', (e) => {
    if(e.target.value) {
        filterEscola.disabled = false;
        loadEscolas(e.target.value);
    }
});

const loadGrupos = async (id) => {    
    const response = await fetch(`https://salf-salf-api2.gkgtsp.easypanel.host/api/groups?region_id=${id}&limit=1000`);
    const data = await response.json()
    filterGrupo.innerHTML = '<option value="">Todos os grupos</option>';
    data.data.forEach(item => {
        const option = document.createElement('option');
        option.value = item.id;
        option.textContent = item.name;
        filterGrupo.appendChild(option);
    }); 
}

const loadEscolas = async (id) => {
    const response = await fetch(`https://salf-salf-api2.gkgtsp.easypanel.host/api/schools?group_id=${id}&limit=1000`);
    const data = await response.json();
    filterEscola.innerHTML = '<option value="">Todas as escolas</option>';
    data.data.forEach(item => {
        const option = document.createElement('option');
        option.value = item.id;
        option.textContent = item.name;     
        filterEscola.appendChild(option);
    });
}

const loadRegioes = async () => {
    const response = await fetch('https://salf-salf-api2.gkgtsp.easypanel.host/api/regions?limit=1000');
    const data = await response.json();
    data.data.forEach(item => {
        const option = document.createElement('option');
        option.value = item.id;
        option.textContent = item.name;     
        filterRegiao.appendChild(option);
    });
}

