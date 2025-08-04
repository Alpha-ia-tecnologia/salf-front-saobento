const btnExportar1 = document.getElementById('btn-exportar-1');
const url = btnExportar1.getAttribute('data-url');
const typeExternDash = btnExportar1.getAttribute('data-typeExternDash');

const traducoes = {
    Ano: "Ano",
    Total: "Total",
    Improved: "Melhoraram",
    Maintained: "Mantiveram",
    Regressed: "Regrediram",
    TotalCompared: "Total Comparado",
    ImprovedPercentage: "% Melhoraram",
    MaintainedPercentage: "% Mantiveram",
    RegressedPercentage: "% Regrediram",
    school: "Escola",
    "Leitores com fluência": "Leitores com fluência",
    "readingLevel": "Nível de leitura"
  };
  
btnExportar1.addEventListener('click', async () => {
    const dados = await Dashboard();
});

const schoolIdExp = document.getElementById('escola');
const eventIdExp = document.getElementById('evento');
const gradeIdExp = document.getElementById('ano-escolar');
const grupoIdExp = document.getElementById('grupo');
const regionIdExp = document.getElementById('regiao');



const Dashboard = async () => {
    const analyticsRequest = await fetch(url.concat('/analytics?schoolId=' + schoolIdExp.value + '&eventId=' + eventIdExp.value + '&gradeId=' + gradeIdExp.value), {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    });
    const perfomanceByGradeRequest = await fetch(url.concat('/performance-by-grade?schoolId=' + schoolIdExp.value + '&eventId=' + eventIdExp.value), {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    })

    const performanceByEventRequest = await fetch(url.concat('/reading-level-evolution?schoolId=' + schoolIdExp.value + '&eventId=' + eventIdExp.value), {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    })
    const readingLevelDistributionRequest = await fetch(url.concat('/reading-level-distribution?schoolId=' + schoolIdExp.value + '&eventId=' + eventIdExp.value + "&gradeLevel=" + gradeIdExp.value), {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    })
    const yearlyProgressionRequest = await fetch(url.concat('/yearly-progression?schoolId=' + schoolIdExp.value + '&grupoId=' + grupoIdExp.value + "&gradeLevel=" + gradeIdExp.value), {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    })
    const rankingsSchoolRequest = await fetch(url.concat('/school-ranking?schoolId=' + schoolIdExp.value + '&grupoId=' + grupoIdExp.value + "&gradeLevel=" + gradeIdExp.value + "&eventId=" + eventIdExp.value + "&regionId=" + regionIdExp.value), {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    })

    const rakingAlunoRequest = await fetch(url.concat('/student-ranking?schoolId=' + schoolIdExp.value + '&grupoId=' + grupoIdExp.value + "&gradeLevel=" + gradeIdExp.value + "&eventId=" + eventIdExp.value + "&regionId=" + regionIdExp.value + "&limit=2000"), {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    })

    const rankingRegionRequest = await fetch(url.concat('/ranking-by-region?schoolId=' + schoolIdExp.value + '&grupoId=' + grupoIdExp.value + "&gradeLevel=" + gradeIdExp.value + "&eventId=" + eventIdExp.value + "&regionId=" + regionIdExp.value + "&limit=2000"), {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    })
    const data = (await Promise.all([analyticsRequest,
        perfomanceByGradeRequest,
        readingLevelDistributionRequest,
        performanceByEventRequest,
        yearlyProgressionRequest,
        rankingsSchoolRequest,
        rakingAlunoRequest,
        rankingRegionRequest
    ])).map(async (item) => await item.json());
    const analytics = await data[0];
    const perfomanceByGrade = await data[1];
    const readingLevelDistribution = await data[2];
    const performanceByEvent = await data[3];
    const yearlyProgression = await data[4];
    const rankingsSchool = await data[5];
    const rakingAluno = await data[6];
    const rankingRegion = await data[7];
    const objectAnalytics = {
        totalStudents: analytics.totalStudents,
        studentsAssessed: analytics.studentsAssessed,
        assessmentCompletion: analytics.assessmentCompletion,
        averagePpm: analytics.averagePpm,
        participationRate: analytics.participationRate,
        comprehensionScore: analytics.comprehensionScore
    };


    const objectPerfomanceByGrade = transformarDistribuicaoEmTabela(perfomanceByGrade.gradePerformance, "grade")
    const objectPerformanceByEvent = transformarDistribuicaoEmTabela(performanceByEvent.evolution, "event")

    const objectRankingsSchool = rankingsSchool.data.map((item) => {
        return {
            escola: item.school,
            "Leitores com fluência": item.count,
        }})
    const objectRankingsStudent = rakingAluno.data.map((item) => {
        return {
            nome: item.student,
            "Nível de leitura": niveisLeitores[item.readingLevel],
            "Escola": item.school,
            "Série": item.grade,
            "Evento": item.event,
            "Região": item.region,
            "Grupo": item.group,
        }})

    const objectRankingRegion = rankingRegion.map((item) => {
        return {
            "Região": item.region,
            "Leitores com fluência": item.percentage + "%",
        }})

    const objectReadingLevelDistribution = readingLevelDistribution.distribution.map((item) => {
        return {
            nivel: item.name,
            quantídade: item.percentage + "%"
        }
    })

    let objectYearlyProgression = gerarTabelaComparada(yearlyProgression);
    objectYearlyProgression = traduzirCabecalhos(objectYearlyProgression, traducoes);

    console.log(objectPerfomanceByGrade);
    const indicadores = Object.entries(objectAnalytics).map(([key, value]) => ({
        indicadores: formatar(key),
        valores: value
    }));

    const planilhas = [
        { data: indicadores, name: "Resumo" },
        { data: objectPerfomanceByGrade, name: "Desempenho por série" },
        { data: objectReadingLevelDistribution, name: "Distribuição de leitura" },
        { data: objectPerformanceByEvent, name: "Desempenho por evento" },
        { data: objectYearlyProgression, name: "Evolução anual" },
        { data: objectRankingsSchool, name: "Rankings" },
        { data: objectRankingsStudent, name: "Rankings aluno" },
        { data: objectRankingRegion, name: "Rankings região" }
    ]

    exportar(planilhas)
}


function gerarTabelaComparada(dados) {
    const tabela = [];

    // Ano atual
    const atual = dados.yearly.currentYear;
    tabela.push({
        Ano: atual.year,
        Total: atual.total,
        Improved: atual.comparedToLastYear?.improved ?? "-",
        Maintained: atual.comparedToLastYear?.maintained ?? "-",
        Regressed: atual.comparedToLastYear?.regressed ?? "-",
        TotalCompared: atual.comparedToLastYear?.totalCompared ?? "-",
        ImprovedPercentage: atual.comparedToLastYear?.improvedPercentage ?? "-",
        MaintainedPercentage: atual.comparedToLastYear?.maintainedPercentage ?? "-",
        RegressedPercentage: atual.comparedToLastYear?.regressedPercentage ?? "-"
    });

    // Ano anterior (sem comparações)
    const anterior = dados.yearly.previousYear;
    tabela.push({
        Ano: anterior.year,
        Total: anterior.total,
        Improved: "-",
        Maintained: "-",
        Regressed: "-",
        TotalCompared: "-",
        ImprovedPercentage: "-",
        MaintainedPercentage: "-",
        RegressedPercentage: "-"
    });

    return tabela;
}
const formatar = (dados) => {
    const traducao = {
        "totalStudents": "Total de alunos",
        "studentsAssessed": "Alunos avaliados",
        "assessmentCompletion": "Avaliação concluída",
        "averagePpm": "Média PPM",
        "participationRate": "Participação",
        "comprehensionScore": "Compreensão"
    }
    return traducao[dados]
}

const exportar = async (planilhas) => {

    const wb = XLSX.utils.book_new();
    for (const dados of planilhas) {
        // Converte para planilha
        const ws = XLSX.utils.json_to_sheet(dados.data);
        // ws.A1.s = {
        //     font: {
        //         bold: true
        //     }
        // }


        ws['!cols'] = Object.keys(dados.data[0]).map(key => {
            const max = Math.max(
                key.length,
                ...dados.data.map(r => (r[key] ? r[key].toString().length : 0))
            );
            return { wch: max + 2 };
        });
        // Cria um workbook
        XLSX.utils.book_append_sheet(wb, ws, dados.name);

        // Gera e baixa o arquivo
    }
    XLSX.writeFile(wb, "Relatorio.xlsx");
}

function transformarDistribuicaoEmTabela(dados, type) {
    // Primeiro, pegar todos os nomes únicos das categorias (colunas)
    const colunas = [
        ...new Set(
            dados.flatMap(item =>
                item.distribution.map(d => d.name)
            )
        )
    ];

    // Agora, montar cada linha
    const tabela = dados.map(item => {
        const linha = type === "grade" ? { Série: item.grade } : { Evento: item.eventName };
        colunas.forEach(nomeColuna => {
            const dist = item.distribution.find(d => d.name === nomeColuna);
            linha[nomeColuna] = dist ? dist.percentage : 0;
        });
        return linha;
    });

    return tabela;
}

function traduzirCabecalhos(tabela, traducoes) {
    return tabela.map(linha => {
      const novaLinha = {};
      for (const chave in linha) {
        const novaChave = traducoes[chave] || chave; // se não tiver tradução, mantém o original
        novaLinha[novaChave] = linha[chave];
      }
      return novaLinha;
    });
  }

  const niveisLeitores = {
    NOT_EVALUATED: 'Não avaliado',
    NON_READER: 'Não leitor',
    SYLLABLE_READER: 'Leitor de sílabas',
    WORD_READER: 'Leitor de palavras',
    SENTENCE_READER: 'Leitor de frases',
    TEXT_READER_WITHOUT_FLUENCY: 'Leitor de texto sem fluência',
    TEXT_READER_WITH_FLUENCY: 'Leitor de texto com fluência'
}