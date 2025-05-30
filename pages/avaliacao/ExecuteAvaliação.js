
// const pathBase = "https://salf-salf-api2.gkgtsp.easypanel.host/api"
const pathBase = "https://salf-salf-api2.gkgtsp.easypanel.host/api"
const btnTimerWords = document.getElementById("iniciar-timer-palavras")
const btnTimerPseudowords = document.getElementById("iniciar-timer-pseudopalavras")
const btnTimerPhrases = document.getElementById("iniciar-timer-frases")
const btnTimerText = document.getElementById("iniciar-timer-texto")
const btnTimerQuestoes = document.getElementById("iniciar-timer-questoes")



// nivel de leitor
const niveisLeitor = {
    nivel0: "NOT_EVALUATED",
    nivel1: "NON_READER",
    nivel2: "SYLLABLE_READER",
    nivel3: "WORD_READER",
    nivel4: "SENTENCE_READER",
    nivel5: "TEXT_READER_WITHOUT_FLUENCY",
    nivel6: "TEXT_READER_WITH_FLUENCY"
}
let calcAbstractPerfil = {
    student: '',
    ra: '',
    Palavras: 0,
    PseudoPalavras: 0,
    Frases: 0,
    Texto: 0,
    Questoes: 0,
    WORDS: 0,
    PSEUDOWORDS: 0,
    PHRASES: 0,
    TEXT: 0,
    QUESTOES: 0,
    desempenhoPalavras: 0,
    desempenhoPseudopalavras: 0,
    desempenhoFrases: 0,
    desempenhoTextos: 0,
    desempenhoQuestoes: 0,
    perfil: niveisLeitor.nivel0

}

const body = ({ Palavras, PseudoPalavras, Frases, Texto, WORDS, PSEUDOWORDS, PHRASES, TEXT, perfil, status }) => {
    return {
        "studentId": cacheStage.studentId,
        "assessmentEventId": cacheStage.eventId,
        "assessmentId": cacheStage.avaId,
        "wordsRead": WORDS,
        "wordsTotal": Palavras,
        "pseudowordsRead": PSEUDOWORDS,
        "pseudowordsTotal": PseudoPalavras,
        "phrasesRead": PHRASES,
        "phrasesTotal": Frases,
        "textLinesRead": TEXT,
        "textLinesTotal": Texto,
        "readingLevel": perfil || niveisLeitor.nivel0,
        "ppm": 0,
        "completed": status || false,
        "completedStages": completedStages,
        "correctAnswers": 1
    }
}
const setModel = (perfil) => {
    perfil.desempenhoFrases = calcPercentual(calcAbstractPerfil.Frases, calcAbstractPerfil.PHRASES, "frases").toFixed(2)
    perfil.desempenhoPalavras = calcPercentual(calcAbstractPerfil.Palavras, calcAbstractPerfil.WORDS, "palavras").toFixed(2)
    perfil.desempenhoPseudopalavras = calcPercentual(calcAbstractPerfil.PseudoPalavras, calcAbstractPerfil.PSEUDOWORDS, "pseudopalavras").toFixed(2)
    perfil.desempenhoTextos = calcPercentual(calcAbstractPerfil.Texto, calcAbstractPerfil.TEXT, "textos").toFixed(2)
    localStorage.setItem("model", JSON.stringify(perfil))

}
const completedStages = []
const stages = {
    "selecao-avaliacao": {
        stage: document.getElementById("selecao-avaliacao"),
        nextStage: document.getElementById("etapa-palavras"),
        nextEvent: () => {
            stages["selecao-avaliacao"].stage.classList.toggle("hidden")
            stages["selecao-avaliacao"].nextStage.classList.toggle("hidden")
            calcAbstractPerfil.progress = 0
            calcAbstractPerfil.completedStages = []
            calcAbstractPerfil.stage = ""
            calcAbstractPerfil.ra = ""
            calcAbstractPerfil.student = ""
            calcAbstractPerfil.Palavras = 0
            calcAbstractPerfil.PseudoPalavras = 0
            calcAbstractPerfil.Frases = 0
            calcAbstractPerfil.Texto = 0
            calcAbstractPerfil.Questoes = 0
            calcAbstractPerfil.WORDS = 0
            calcAbstractPerfil.PSEUDOWORDS = 0
            calcAbstractPerfil.PHRASES = 0
            calcAbstractPerfil.TEXT = 0
            calcAbstractPerfil.QUESTOES = 0
            calcAbstractPerfil.perfil = niveisLeitor.nivel0
            calcAbstractPerfil.status = false
            calcAbstractPerfil.desempenhoPalavras = 0
            calcAbstractPerfil.desempenhoPseudopalavras = 0
            calcAbstractPerfil.desempenhoFrases = 0
            calcAbstractPerfil.desempenhoTextos = 0
            calcAbstractPerfil.desempenhoQuestoes = 0
            localStorage.removeItem("model")
            localStorage.removeItem("id")
        }
    },
    "etapa-palavras": {
        stage: document.getElementById("etapa-palavras"),
        nextStage: document.getElementById("etapa-pseudopalavras"),
        nextEvent: () => {
            const condicaoNivel0 = stageBody.itemsRead === 0;
            const condicaoNivel1 = stageBody.itemsRead > 0 && stageBody.itemsRead <= 10;
            console.log(condicaoNivel0 + " " + condicaoNivel1)
            completedStages.push("WORDS")
            if (condicaoNivel0) {
                alert("Você não leu a quantidade minimo, infelizmente classificaremos como não avaliado")
                forcedEnd(stages["etapa-palavras"], body(calcAbstractPerfil))
            }
            else if (condicaoNivel1) {
                alert("Você não atendeu requisito minimo, infelizmente classificaremos como não leitor")
                calcAbstractPerfil.perfil = niveisLeitor.nivel1
                forcedEnd(stages["etapa-palavras"], body(calcAbstractPerfil))
            } else {
                stages["etapa-palavras"].stage.classList.toggle("hidden")
                stages["etapa-palavras"].nextStage.classList.toggle("hidden")
            }
            console.log(calcAbstractPerfil)
            clear()
        }
    },
    "etapa-pseudopalavras": {
        stage: document.getElementById("etapa-pseudopalavras"),
        nextStage: document.getElementById("etapa-frases"),
        nextEvent: (palavras, pseudopalavras, stage = "PSEUDOPALAVRAS") => {
            const { WORDS } = calcAbstractPerfil
            const condicaoNivel3 = (WORDS <= 35) || (stageBody.itemsRead <= 12);
            completedStages.push("PSEUDWORDS")
            if (condicaoNivel3) {
                const condicaoNivel2 = (WORDS <= 25) || (stageBody.itemsRead <= 6);
                if (condicaoNivel2) {
                    alert("Você não atendeu requisito minimo, infelizmente classificaremos como leitor de silabas")
                    calcAbstractPerfil.perfil = niveisLeitor.nivel2
                    forcedEnd(stages["etapa-pseudopalavras"], body(calcAbstractPerfil))
                } else {
                    alert("Você não atendeu requisito minimo, infelizmente classificaremos como leitor de palavras")
                    calcAbstractPerfil.perfil = niveisLeitor.nivel3
                    forcedEnd(stages["etapa-pseudopalavras"], body(calcAbstractPerfil))
                }
            }
            else {
                stages["etapa-pseudopalavras"].stage.classList.toggle("hidden")
                stages["etapa-pseudopalavras"].nextStage.classList.toggle("hidden")
            }
            clear()

        }
    },
    "etapa-frases": {
        stage: document.getElementById("etapa-frases"),
        nextStage: document.getElementById("etapa-texto"),
        nextEvent: () => {
            const { WORDS, PSEUDOWORDS } = calcAbstractPerfil
            const condicaoNivel4 = ((WORDS <= 44) || (PSEUDOWORDS <= 18)) || (stageBody.itemsRead === 0)
            completedStages.push("PHRASES")
            if (condicaoNivel4) {

                alert("Você não atendeu algum requisito minimo, infelizmente classificaremos como leitor de frases")
                calcAbstractPerfil.perfil = niveisLeitor.nivel4
                forcedEnd(stages["etapa-frases"], body(calcAbstractPerfil))
            } else {
                stages["etapa-frases"].stage.classList.toggle("hidden")
                stages["etapa-frases"].nextStage.classList.toggle("hidden")
            }
            clear()

        }
    },
    "etapa-texto": {
        stage: document.getElementById("etapa-texto"),
        nextStage: document.getElementById("etapa-questoes"),
        nextEvent: () => {


            completedStages.push("TEXT")
            stages["etapa-texto"].stage.classList.toggle("hidden")
            stages["etapa-texto"].nextStage.classList.toggle("hidden")
            renderStageQuestoes()

        }
    },
    "etapa-questoes": {
        stage: document.getElementById("etapa-questoes"),
        nextStage: document.getElementById("etapa-result"),
        nextEvent: () => {
            // setTimeout(endExam, 500)

            const { WORDS, PSEUDOWORDS, TEXT } = calcAbstractPerfil
            const condicaoNivel5 = ((WORDS <= 60) || (PSEUDOWORDS <= 24)) || (TEXT !== calcAbstractPerfil.Texto) || (Object.values(baforeId).filter(e => e.isCorrect === true).length === 0)
            completedStages.push("QUESTIONS")
            calcAbstractPerfil.progress = completedStages.length / 6
            if (condicaoNivel5) {
                alert("Você não atendeu algum requisito minimo, infelizmente classificaremos como leitor sem fluencia")
                calcAbstractPerfil.perfil = niveisLeitor.nivel5
                forcedEnd(stages["etapa-questoes"], body(calcAbstractPerfil))
            } else {
                alert("Você atendeu os requisitos o classificaremos com leitor com fluencia")
                calcAbstractPerfil.perfil = niveisLeitor.nivel6
                calcAbstractPerfil.status = true
                forcedEnd(stages["etapa-questoes"], body(calcAbstractPerfil))
            }
        }
    },
    "etapa-result": {
        stage: document.getElementById("etapa-result"),
        nextStage: document.getElementById("selecao-avaliacao"),
        nextEvent: () => {

            stages["etapa-result"].stage.classList.toggle("hidden")
            stages["etapa-result"].nextStage.classList.toggle("hidden")
        }
    }
}
const cacheStage = {
    "name": "",
    "text": "",
    "gradeRange": "",
    "words": [],
    "pseudowords": [],
    "phrases": [],
    "text_id": "",
    "id": null,
    "questions": []
}

const examGet = async () => {
    const RequestSave = await fetch(pathBase + "/reading-assessments", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        body: JSON.stringify({
            "studentId": document.getElementById('aluno').value ? Number.parseInt(document.getElementById('aluno').value) : () => {
                throw new Error("Student ID is required")
            },
            "assessmentEventId": document.getElementById('evento-avaliacao').value ? Number.parseInt(document.getElementById('evento-avaliacao').value) : () => {
                throw new Error("Assessment Event ID is required")
            },
            "assessmentId": document.getElementById('teste-leitura').value ? Number.parseInt(document.getElementById('teste-leitura').value) : () => {
                throw new Error("Assessment ID is required")
            }
        })
    }).then(response => {
        if (!response.ok) {
            alert(response.json().error)
            throw new Error("Failed to create assessment")
            return
        }
        return response.json()
    })
    const responseJson = await RequestSave
    calcAbstractPerfil.ra = responseJson.student.registrationNumber
    calcAbstractPerfil.student = responseJson.student.name
    cacheStage.id = responseJson.id
    cacheStage.avaId = responseJson.assessment.id
    cacheStage.studentId = responseJson.student.id
    cacheStage.eventId = responseJson.assessmentEventId
    localStorage.setItem('id', responseJson.id)
    const requestGrep = await fetch(pathBase + "/assessments/" + Number.parseInt(cacheStage.avaId), {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + localStorage.getItem("token")
        }
    })
    const responseJson2 = await requestGrep.json()
    const { name, text, gradeRange, words, pseudowords, phrases, questions } = await responseJson2
    cacheStage.questions = questions
    cacheStage.name = name
    cacheStage.text = text
    cacheStage.gradeRange = gradeRange
    cacheStage.words = words
    cacheStage.pseudowords = pseudowords
    cacheStage.phrases = phrases ? phrases.map(phrase => phrase.text) : []

    calcAbstractPerfil.Palavras = cacheStage.words.length;
    calcAbstractPerfil.PseudoPalavras = cacheStage.pseudowords.length;
    calcAbstractPerfil.Texto = cacheStage.text.split(",").length;
    calcAbstractPerfil.Frases = cacheStage.phrases.length;
    calcAbstractPerfil.Questoes = cacheStage.questions.length;



    if (requestGrep.ok) {
        renderStage("etapa-palavras", "words", "#palavras-container", "palavras", "palavras-lidas")
        renderStage("etapa-pseudopalavras", "pseudowords", "#pseudopalavras-container", "pseudopalavras", "pseudopalavras-lidas")
        renderStage("etapa-frases", "phrases", "#frases-container", "frases", "frases-lidas")
        renderStageText("etapa-texto", "text", "text", "linhas", "linhas-lidas")
        renderStageQuestoes()
    }
}

const stageBody = {
    "stage": null,
    "itemsRead": 0,
    "totalItems": 0
}

const endExam = async () => {
    const endpoint = `/reading-assessments/${cacheStage.id}/finalize`
    const RequestSave = await fetch(pathBase + endpoint, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
    })
    stageBody.itemsRead = 0
    document.getElementById("palavras-container").innerHTML = ""
    document.getElementById("pseudopalavras-container").innerHTML = ""
    document.getElementById("frases-container").innerHTML = ""
    document.getElementById("texto-container").innerHTML = ""
    timer.innerHTML = timedafault
    timerText.innerHTML = timedafault
    timerPhrases.innerHTML = timedafault
    timerPseudowords.innerHTML = timedafault

}

const renderStage = (currentStage, currentCache, currentContainer, currentTotal, currentRead) => {
    const divStage = stages[currentStage].stage.querySelector(currentContainer)
    divStage.innerHTML = ""
    document.getElementById("total-frases").innerHTML = cacheStage[currentCache].length
    document.getElementById("total-linhas").innerHTML = cacheStage[currentCache].length

    btn_stage().disabled = true
    btn_stage().classList.add("bg-gray-400", "hover:bg-gray-400")
    cacheStage[currentCache].forEach(word => {
        const btn = document.createElement("button")
        let max = stages[currentStage].stage.querySelector("#total-" + currentTotal).innerHTML = cacheStage[currentCache].length
        const total = stages[currentStage].stage.querySelector("#total-" + currentRead).innerHTML = stageBody.itemsRead

        btn.classList.add("word", "bg-blue-500", "px-2", "py-1", "rounded", "outline-none", "ml-2", "item-click-" + currentCache)
        btn.addEventListener("click", () => {
            btn.classList.toggle("bg-green-300")
            console.log(stageBody)
            if (btn.classList.contains("bg-green-300")) {
                stageBody.itemsRead++
                document.querySelector("#total-" + currentRead).innerHTML = stageBody.itemsRead

            } else {
                stageBody.itemsRead--
                document.querySelector("#total-" + currentRead).innerHTML = stageBody.itemsRead
            }
        })
        btn.disabled = true
        btn.classList.add("bg-gray-400", "hover:bg-gray-400")
        btn.innerHTML = word

        divStage.append(btn)
    })
}
const renderStageText = () => {
    const divStage = stages["etapa-texto"].stage.querySelector("#texto-container")
    const textMap = cacheStage.text.split(",")

    stages["etapa-texto"].stage.querySelector("#total-linhas").innerHTML = textMap.length
    textMap.forEach(text => {
        const btn = document.createElement("button")
        btn.classList.add("word", "bg-blue-200", "px-2", "py-1", "rounded", "outline-none", "ml-2", "item-click-text")
        btn.disabled = true
        btn.classList.add("bg-gray-400", "hover:bg-gray-400")
        btn.addEventListener("click", () => {
            btn.classList.toggle("bg-green-300")
            if (btn.classList.contains("bg-green-300")) {
                stageBody.itemsRead++
                document.querySelector("#total-linhas-lidas").innerHTML = stageBody.itemsRead
            } else {
                stageBody.itemsRead--
                document.querySelector("#total-linhas-lidas").innerHTML = stageBody.itemsRead
            }
        })
        btn.innerHTML = text
        divStage.append(btn)
    })

}

//perfil de leitor

let calcPercentual = (maxima, usada, tipo) => maxima ? usada / maxima * 100 : Error("Divisão por zero : não possue perfil" + tipo)

let baforeId = {

};
const renderStageQuestoes = () => {
    const divStage = stages["etapa-questoes"].stage.querySelector("#questoes-container")
    console.log(cacheStage.questions)
    divStage.innerHTML = ""
    cacheStage.questions.forEach(({ text }) => {
  
        const struct = `
        <div class="enunciado bg-blue-50 p-2 rounded-lg">
        <p>${text}</p>
        </div>
        <div class="opcoes gap-2 p-2 rounded-lg mt-2">
            <p>O aluno respondeu certo ?</p>
            <input class="bg-blue-500 text-white px-4 py-2 rounded-lg" type="checkbox" onclick='addQuest()'/>
        </div>
        `


        divStage.innerHTML += struct
    })
}

let quest = true
function addQuest(){
    if(quest){
        calcAbstractPerfil.Questoes++
        quest = false
    }
    else{
        calcAbstractPerfil.Questoes--
        quest = true
    }

}

const nextStageQuestoes = async () => {
    const endpoint = `/reading-assessments/answers`
    baforeId = Object.values(baforeId)
    const requestUnion = baforeId.map(async (answer) => {
        await fetch(pathBase + endpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + localStorage.getItem("token")
            },
            body: JSON.stringify(answer)
        })
        return response.json()
    })
    const response = await Promise.all(requestUnion)


}
const forcedEnd = async (actualStage, bodyCase) => {
    console.log(calcAbstractPerfil)
    setModel(calcAbstractPerfil)
    actualStage.stage.classList.toggle("hidden")
    stages["etapa-result"].stage.classList.toggle("hidden")
    const endpoint = `/reading-assessments/${cacheStage.id || 1}`
    await fetch(pathBase + endpoint, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        body: JSON.stringify(bodyCase)
    })
}
const nextStage = async () => {
    // const endpoint = `/reading-assessments/${cacheStage.id}/stage`
    // await fetch(pathBase + endpoint, {
    //     method: "PUT",
    //     headers: {
    //         "Content-Type": "application/json",
    //         "Authorization": "Bearer " + localStorage.getItem("token")
    //     },
    //     body: JSON.stringify({
    //         "stage": stageBody.stage,
    //         "itemsRead": stageBody.itemsRead,
    //         "totalItems": stageBody.totalItems
    //     })
    // })

    calcAbstractPerfil[stageBody.stage] = stageBody.itemsRead
}
const clear = () => {
    stageBody.itemsRead = 0
    stageBody.totalItems = 0
}
let stage = stageBody.stage || "WORDS"
const timer = document.getElementById("timer-palavras")
const timerText = document.getElementById("timer-texto")
const timerPhrases = document.getElementById("timer-frases")
const timerPseudowords = document.getElementById("timer-pseudopalavras")
const timedafault = "00:20"
const btn_stage = () => {
    switch (stageBody.stage) {
        case "WORDS":
            return document.getElementById("proximo-etapa-palavras")
        case "PSEUDOWORDS":
            return document.getElementById("proximo-etapa-pseudopalavras")
        case "PHRASES":
            return document.getElementById("proximo-etapa-frases")
        case "TEXT":
            return document.getElementById("proximo-etapa-texto")
        case "QUESTOES":
            return document.getElementById("proximo-etapa-questoes")
    }
}
const disableStage = (stage) => {
    const itemsClick = document.querySelectorAll(".item-click-" + stage)
    itemsClick.forEach(item => {
        item.disabled = true
        item.classList.add("bg-gray-400", "hover:bg-gray-400")
    })
}
btnTimerWords.addEventListener("click", () => {
    stageBody.totalItems = cacheStage.words.length
    const itemsClick = document.querySelectorAll(".item-click-words")
    itemsClick.forEach(item => {
        item.disabled = false
        item.classList.remove("bg-gray-400", "hover:bg-gray-400")

    })
    timer.innerHTML = timedafault
    btnTimerWords.disabled = true
    btnTimerWords.classList.add("bg-gray-400", "hover:bg-gray-400")
    const interval = setInterval(() => {

        const [minutes, seconds] = timer.innerHTML.split(":")
        let totalSeconds = parseInt(minutes) * 60 + parseInt(seconds)
        totalSeconds--
        timer.innerHTML = `${Math.floor(totalSeconds / 60)}:${totalSeconds % 60}`
        if (totalSeconds <= 0) {
            alert("Tempo esgotado, você leu " + stageBody.itemsRead + " palavras")
            btn_stage().disabled = false
            btn_stage().classList.remove("bg-gray-400", "hover:bg-gray-400")
            btn_stage().classList.add("bg-green-400", "hover:bg-green-700")
            btnTimerWords.disabled = true
            disableStage("words")

            btnTimerWords.classList.remove("bg-gray-400", "hover:bg-gray-400")
            clearInterval(interval);

        }
    }, 1000)

})
btnTimerText.addEventListener("click", () => {
    stageBody.totalItems = cacheStage.text.length
    timerText.innerHTML = timedafault
    btnTimerText.disabled = true
    btnTimerText.classList.add("bg-gray-400", "hover:bg-gray-400")
    const itemsClick = document.querySelectorAll(".item-click-text")
    itemsClick.forEach(item => {
        item.disabled = false
        item.classList.remove("bg-gray-400", "hover:bg-gray-400")
    })


    btn_stage().disabled = true
    btn_stage().classList.add("bg-gray-400", "hover:bg-gray-400")
    const interval = setInterval(() => {

        const [minutes, seconds] = timerText.innerHTML.split(":")
        let totalSeconds = parseInt(minutes) * 60 + parseInt(seconds)
        totalSeconds--
        timerText.innerHTML = `${Math.floor(totalSeconds / 60)}:${totalSeconds % 60}`
        if (totalSeconds <= 0) {
            alert("Tempo esgotado")
            disableStage("text")
            btnTimerText.disabled = true
            btn_stage().disabled = false
            btn_stage().classList.remove("bg-gray-400", "hover:bg-gray-400")
            btn_stage().classList.add("bg-green-400", "hover:bg-green-700")

            clearInterval(interval);
        }

    }, 1000)
})
btnTimerPhrases.addEventListener("click", () => {
    stageBody.totalItems = cacheStage.phrases.length
    timerPhrases.innerHTML = timedafault
    btnTimerPhrases.disabled = true
    btnTimerPhrases.classList.add("bg-gray-400", "hover:bg-gray-400")
    const itemsClick = document.querySelectorAll(".item-click-phrases")
    itemsClick.forEach(item => {
        item.disabled = false
        item.classList.remove("bg-gray-400", "hover:bg-gray-400")
    })

    btn_stage().disabled = true
    btn_stage().classList.add("bg-gray-400", "hover:bg-gray-400")
    const interval = setInterval(() => {
        btnTimerPhrases.disabled = true

        const [minutes, seconds] = timerPhrases.innerHTML.split(":")
        let totalSeconds = parseInt(minutes) * 60 + parseInt(seconds)
        totalSeconds--
        timerPhrases.innerHTML = `${Math.floor(totalSeconds / 60)}:${totalSeconds % 60}`
        if (totalSeconds === 0) {
            alert("Tempo esgotado, você leu " + stageBody.itemsRead + " frases")
            btn_stage().disabled = false
            disableStage("phrases")
            btn_stage().classList.remove("bg-gray-400", "hover:bg-gray-400")
            btn_stage().classList.add("bg-green-400", "hover:bg-green-400")

            btnTimerPhrases.disabled = true
            btnTimerPhrases.classList.remove("bg-gray-400", "hover:bg-gray-400")
            clearInterval(interval);

        }

    }, 1000)
})
btnTimerPseudowords.addEventListener("click", () => {
    stageBody.totalItems = cacheStage.pseudowords.length
    timerPseudowords.innerHTML = timedafault
    btnTimerPseudowords.disabled = true
    btnTimerPseudowords.classList.add("bg-gray-400", "hover:bg-gray-400")
    const itemsClick = document.querySelectorAll(".item-click-pseudowords")
    itemsClick.forEach(item => {
        item.disabled = false
        item.classList.remove("bg-gray-400", "hover:bg-gray-400")
    })


    btn_stage().disabled = true
    btnTimerPseudowords.disabled = true
    btn_stage().classList.add("bg-gray-400", "hover:bg-gray-400")
    const interval = setInterval(() => {

        const [minutes, seconds] = timerPseudowords.innerHTML.split(":")
        let totalSeconds = parseInt(minutes) * 60 + parseInt(seconds)
        totalSeconds--
        timerPseudowords.innerHTML = `${Math.floor(totalSeconds / 60)}:${totalSeconds % 60}`
        if (totalSeconds === 0) {
            alert("Tempo esgotado, você leu " + stageBody.itemsRead + " pseudopalavras")
            btn_stage().disabled = false
            disableStage("pseudowords")
            btn_stage().classList.remove("bg-gray-400", "hover:bg-gray-400")
            btn_stage().classList.add("bg-green-400", "hover:bg-green-700")

            btnTimerPseudowords.classList.remove("bg-gray-400", "hover:bg-gray-400")

            clearInterval(interval);

        }
    }, 1000)

})

const filterIsEmpty = () => {
    const filterSchool = document.getElementById('escola')
    const filterEvent = document.getElementById('evento-avaliacao')
    const filterTest = document.getElementById('teste-leitura')
    const filterStudent = document.getElementById('aluno')
    if (!filterSchool.value || !filterEvent.value || !filterTest.value || !filterStudent.value) {
        alert("Todos os filtros são obrigatórios")
        throw new Error("Todos os filtros são obrigatórios")
    }
}
document.addEventListener("DOMContentLoaded", function () {
    const btnTimerWords = document.getElementById("iniciar-timer-palavras")
    const btnTimerPseudowords = document.getElementById("iniciar-timer-pseudopalavras")
    const btnTimerPhrases = document.getElementById("iniciar-timer-frases")
    const btnTimerText = document.getElementById("iniciar-timer-texto")

    let palavras = 0
    stages["selecao-avaliacao"].stage.querySelector("button").addEventListener("click", (e) => {
        filterIsEmpty()
        examGet()
        stage = "WORDS"
        stageBody.itemsRead = 0
        stageBody.totalItems = 0
        stageBody.stage = "WORDS"
        btn_stage().disabled = true
        stages["selecao-avaliacao"].nextEvent();
    })

    stages["etapa-palavras"].stage.querySelectorAll("button")[1].addEventListener("click", (e) => {
        nextStage()
        if (stageBody.itemsRead === 0 && stageBody.stage === "WORDS") {
            alert("Você não leu nenhuma palavra")
            forcedEnd(stages["etapa-palavras"], body(calcAbstractPerfil))
            return
        }
        palavras = stageBody.itemsRead
        stage = "PSEUDOWORDS"
        stageBody.stage = "PSEUDOWORDS"
        btn_stage().disabled = true
        btn_stage().classList.remove("bg-green-600", "hover:bg-green-700")
        btn_stage().classList.add("bg-gray-400", "hover:bg-gray-400")
        btnTimerText.disabled = false
        stages["etapa-palavras"].nextEvent()
    })
    stages["etapa-pseudopalavras"].stage.querySelectorAll("button")[1].addEventListener("click", (e) => {
        nextStage()
        stage = "PHRASES"

        stageBody.stage = "PHRASES"
        btnTimerWords.disabled = false
        btn_stage().disabled = true
        btn_stage().classList.remove("bg-green-600", "hover:bg-green-700")
        btn_stage().classList.add("bg-gray-400", "hover:bg-gray-400")
        stages["etapa-pseudopalavras"].nextEvent(palavras, stageBody.itemsRead)
    })
    stages["etapa-frases"].stage.querySelectorAll("button")[1].addEventListener("click", (e) => {
        nextStage()

        stage = "TEXT"

        stageBody.stage = "TEXT"
        btn_stage().disabled = true
        btn_stage().classList.remove("bg-green-600", "hover:bg-green-700")
        btn_stage().classList.add("bg-gray-400", "hover:bg-gray-400")

        btnTimerPseudowords.disabled = false
        stages["etapa-frases"].nextEvent()
    })
    stages["etapa-texto"].stage.querySelectorAll("button")[1].addEventListener("click", (e) => {
        nextStage()
        stage = "QUESTOES"
        stageBody.stage = "QUESTOES"
        stages["etapa-texto"].nextEvent()
    })
    stages["etapa-questoes"].stage.querySelectorAll("button")[0].addEventListener("click", () => {
        stageBody.stage = "QUESTOES"
        stage = "QUESTOES"
        stageBody.totalItems = cacheStage.questions.length
        stageBody.itemsRead = 0
        stages["etapa-questoes"].nextEvent()
    })



})
