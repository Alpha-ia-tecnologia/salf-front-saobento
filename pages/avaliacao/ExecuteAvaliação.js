
// const pathBase = "https://salf-salf-api2.gkgtsp.easypanel.host/api"
const pathBase = "https://salf-salf-api2.gkgtsp.easypanel.host/api"
const btnTimerWords = document.getElementById("iniciar-timer-palavras")
const btnTimerPseudowords = document.getElementById("iniciar-timer-pseudopalavras")
const btnTimerPhrases = document.getElementById("iniciar-timer-frases")
const btnTimerText = document.getElementById("iniciar-timer-texto")
const btnTimerQuestoes = document.getElementById("iniciar-timer-questoes")

const stages = {
    "selecao-avaliacao": {
        stage: document.getElementById("selecao-avaliacao"),
        nextStage: document.getElementById("etapa-palavras"),
        nextEvent: () => {
            stages["selecao-avaliacao"].stage.classList.toggle("hidden")
            stages["selecao-avaliacao"].nextStage.classList.toggle("hidden")
        }
    },
    "etapa-palavras": {
        stage: document.getElementById("etapa-palavras"),
        nextStage: document.getElementById("etapa-pseudopalavras"),
        nextEvent: () => {
            stages["etapa-palavras"].stage.classList.toggle("hidden")
            stages["etapa-palavras"].nextStage.classList.toggle("hidden")
        }
    },
    "etapa-pseudopalavras": {
        stage: document.getElementById("etapa-pseudopalavras"),
        nextStage: document.getElementById("etapa-frases"),
        nextEvent: () => {
            stages["etapa-pseudopalavras"].stage.classList.toggle("hidden")
            stages["etapa-pseudopalavras"].nextStage.classList.toggle("hidden")
        }
    },
    "etapa-frases": {
        stage: document.getElementById("etapa-frases"),
        nextStage: document.getElementById("etapa-texto"),
        nextEvent: () => {
            stages["etapa-frases"].stage.classList.toggle("hidden")
            stages["etapa-frases"].nextStage.classList.toggle("hidden")
        }
    },
    "etapa-texto": {
        stage: document.getElementById("etapa-texto"),
        nextStage: document.getElementById("etapa-questoes"),
        nextEvent: () => {

            stages["etapa-texto"].stage.classList.toggle("hidden")
            stages["etapa-texto"].nextStage.classList.toggle("hidden")
        }
    },
    "etapa-questoes": {
        stage: document.getElementById("etapa-questoes"),
        nextStage: document.getElementById("etapa-result"),
        nextEvent: () => {
            // setTimeout(endExam, 500)
            stages["etapa-questoes"].stage.classList.toggle("hidden")
            stages["etapa-questoes"].nextStage.classList.toggle("hidden")
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
    cacheStage.id = responseJson.id
    localStorage.setItem('id', responseJson.id)
    const requestGrep = await fetch(pathBase + "/reading-assessments/" + localStorage.getItem('id'), {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + localStorage.getItem("token")
        }
    })
    const responseJson2 = await requestGrep.json()
    const { name, text, gradeRange, words, pseudowords, phrases, questions } = responseJson2.assessment
    cacheStage.name = name
    cacheStage.text = text
    cacheStage.gradeRange = gradeRange
    cacheStage.words = JSON.parse(words)
    cacheStage.pseudowords = JSON.parse(pseudowords)
    cacheStage.phrases = phrases.map(phrase => phrase.text)
    cacheStage.questions = questions

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

let baforeId = {

};
const renderStageQuestoes = () => {
    const divStage = stages["etapa-questoes"].stage.querySelector("#questoes-container")
    divStage.innerHTML = ""
    cacheStage.questions.forEach(({ id, text, options }) => {
        const btn = document.createElement("fieldset")


        const opcoes = options.map(option => {
            return { idQuest: id, opcao: option }
        })
        const optionsNew = opcoes.map(option => {
            return `
                <p class="bg-blue-50 flex  grid grid-cols-3 content-center items-center justify-between px-4 py-2 rounded-lg mt-2" data-id="${option.idQuest}">
                <span>${option.opcao}</span> 
                <input type="radio" name="questao-${id}" class="w-4 h-4" onclick=""> 
                <select name="correta" id="questao" class="border-1 border-blue-300 rounded-lg h-8 px-2">
                    <option value="false">Errada</option>
                    <option value="true">Correta</option>
                </select>
                </p>
            `
        }).join("")
        const struct = `
        <div class="enunciado bg-blue-50 p-2 rounded-lg" data-id="${id}">
        <p>${text}</p>
        </div>
        <div class="opcoes gap-2 p-2 rounded-lg mt-2">
        ${optionsNew}
        </div>
        `

        btn.innerHTML = struct
        btn.querySelectorAll("input[type='radio']").forEach(radio => {
            radio.addEventListener("click", (e) => {
                const idQuest = Number.parseInt(e.target.parentNode.dataset.id)
                const Quest = e.target.parentNode
                baforeId[idQuest] = {
                    "readingAssessmentId": Number.parseInt(localStorage.getItem("id")),
                    "questionId": idQuest,
                    "answer": Quest.querySelector("span").textContent,
                    "isCorrect": Quest.querySelector("select").value
                }

                console.log(baforeId)
            })
        })

        btn.querySelectorAll("select").forEach(select => {
            select.addEventListener("change", (e) => {
                const idQuest = e.target.parentNode.dataset.id
                const Quest = e.target.parentNode
                baforeId[idQuest] = {
                    "readingAssessmentId": localStorage.getItem("id"),
                    "questionId": idQuest,
                    "answer": Quest.querySelector("span").textContent,
                    "isCorrect": Boolean(Quest.querySelector("select").value)
                }
            })
        })
        divStage.append(btn)
    })
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
const forcedEnd = async (actualStage) => {
    stages[actualStage].stage.classList.add("hidden")
    stages["etapa-result"].stage.classList.remove("hidden")
    const endpoint = `/reading-assessments/${cacheStage.id || 1}/finalize`
    const RequestSave = await fetch(pathBase + endpoint, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
    })
}
const nextStage = async () => {
    const endpoint = `/reading-assessments/${cacheStage.id}/stage`
    await fetch(pathBase + endpoint, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        body: JSON.stringify({
            "stage": stageBody.stage,
            "itemsRead": stageBody.itemsRead,
            "totalItems": stageBody.totalItems
        })
    })
}
let stage = stageBody.stage || "WORDS"
const timer = document.getElementById("timer-palavras")
const timerText = document.getElementById("timer-texto")
const timerPhrases = document.getElementById("timer-frases")
const timerPseudowords = document.getElementById("timer-pseudopalavras")
const timerQuestoes = document.getElementById("timer-questoes")
const timedafault = "1:00"
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
        if (totalSeconds <= 0 && stageBody.itemsRead > 0) {
            alert("Tempo esgotado, você leu " + stageBody.itemsRead + " palavras")
            btn_stage().disabled = false
            btn_stage().classList.remove("bg-gray-400", "hover:bg-gray-400")
            btn_stage().classList.add("bg-green-400", "hover:bg-green-700")
            btnTimerWords.disabled = true
            disableStage("words")

            btnTimerWords.classList.remove("bg-gray-400", "hover:bg-gray-400")
            clearInterval(interval);

        } else if (totalSeconds <= 0 && stageBody.itemsRead <= 0) {
            alert("Tempo esgotado, você não leu nenhuma palavra")
            forcedEnd("etapa-palavras")
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
btnTimerQuestoes.addEventListener("click", () => {

    // btn_stage().disabled = false
    // btn_stage().classList.remove("bg-gray-400", "hover:bg-gray-400")
    timerQuestoes.innerHTML = timedafault
    btn_stage().disabled = true
    btn_stage().classList.add("bg-gray-400", "hover:bg-gray-400")
    const interval = setInterval(() => {

        const [minutes, seconds] = timerQuestoes.innerHTML.split(":")
        let totalSeconds = parseInt(minutes) * 60 + parseInt(seconds)
        totalSeconds--
        timerQuestoes.innerHTML = `${Math.floor(totalSeconds / 60)}:${totalSeconds % 60}`
        btnTimerQuestoes.disabled = true
        btnTimerQuestoes.classList.add("bg-gray-400", "hover:bg-gray-400")
        if (totalSeconds <= 0) {
            alert("Tempo esgotado")
            disableStage("questoes")
            btn_stage().disabled = false
            console.log(btn_stage())
            btn_stage().classList.remove("bg-gray-400", "hover:bg-gray-400")
            btn_stage().classList.add("bg-green-400", "hover:bg-green-700")
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
            forcedEnd("etapa-palavras")
            return
        }
        stageBody.itemsRead = 0
        stage = "PSEUDOWORDS"
        stageBody.totalItems = 0
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
        stageBody.itemsRead = 0
        stageBody.totalItems = 0
        stageBody.stage = "PHRASES"
        btnTimerWords.disabled = false
        btn_stage().disabled = true
        btn_stage().classList.remove("bg-green-600", "hover:bg-green-700")
        btn_stage().classList.add("bg-gray-400", "hover:bg-gray-400")
        stages["etapa-pseudopalavras"].nextEvent()
    })
    stages["etapa-frases"].stage.querySelectorAll("button")[1].addEventListener("click", (e) => {
        nextStage()

        stage = "TEXT"
        stageBody.itemsRead = 0
        stageBody.totalItems = 0
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
        btn_stage().disabled = true
        btn_stage().classList.remove("bg-green-600", "hover:bg-green-700")
        btn_stage().classList.add("bg-gray-400", "hover:bg-gray-400")
        stageBody.itemsRead = 0
        stageBody.totalItems = 0
        btnTimerPhrases.disabled = false
        stages["etapa-texto"].nextEvent()
    })
    stages["etapa-questoes"].stage.querySelectorAll("button")[1].addEventListener("click", () => {
        stageBody.stage = "QUESTOES"
        stage = "QUESTOES"
        stageBody.totalItems = cacheStage.questions.length
        stageBody.itemsRead = 0
        btn_stage().classList.remove("bg-gray-400", "hover:bg-gray-400")
        btn_stage().classList.add("bg-green-400", "hover:bg-green-700")
        btnTimerQuestoes.disabled = false
        nextStageQuestoes()
        stages["etapa-questoes"].nextEvent()
    })



})
