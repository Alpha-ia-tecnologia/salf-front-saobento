
const roles = {
    'ADMIN': ['dashboard', 'usuario', 'aluno', 'avaliacao', 'resultado', 'relatorio'],
    'COORDINATOR': ['dashboard', 'usuario', 'aluno', "escola", "regiao-grupo", "turma"],
    'APPLICATOR': ['avaliacao', 'resultado'],
    'MANAGER': ['dashboard'],
}

const verifyRole = (role) => {
    if (roles[role].includes(window.location.pathname.split('/').pop())) {
        return roles[role][0];
    }
    return window.location.href = window.origin + '/401.html';
}

const redirectRole = (role) => {
    if (roles[role]) {
        window.location.href = window.origin + `/pages/${verifyRole(role)}/listar.html`;
    }
     
}
document.addEventListener('DOMContentLoaded', () => {
    const user = JSON.parse(localStorage.getItem('user'));
    redirectRole(user.role);

});