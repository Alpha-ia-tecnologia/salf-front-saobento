const btnExportar = document.getElementById('btn-exportar');
btnExportar.addEventListener('click', () => {
    exportar();
});
const exportar = () => {

const dados = [
    { nome: "João", idade: 30, email: "joao@email.com" },
    { nome: "Maria", idade: 25, email: "maria@email.com" }
  ];

  // Converte para planilha
  const ws = XLSX.utils.json_to_sheet(dados);

  // Cria um workbook
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Pessoas");

  // Gera e baixa o arquivo
  XLSX.writeFile(wb, "planilha.xlsx");
}