// const pathBase = "https://salf-salf-api2.gkgtsp.easypanel.host/api"
const pathBase = "https://salf-salf-api2.gkgtsp.easypanel.host/api"
const btnTimerWords = document.getElementById("iniciar-timer-palavras")
const btnTimerPseudowords = document.getElementById("iniciar-timer-pseudopalavras")
const btnTimerPhrases = document.getElementById("iniciar-timer-frases")
const btnTimerText = document.getElementById("iniciar-timer-texto")

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
        nextStage: document.getElementById("etapa-result"),
        nextEvent: () => {
            setTimeout(endExam, 500)

            stages["etapa-texto"].stage.classList.toggle("hidden")
            stages["etapa-texto"].nextStage.classList.toggle("hidden")
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
    "id": null
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
    const requestGrep = await fetch(pathBase + "/reading-assessments/" + responseJson.assessmentId, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + localStorage.getItem("token")
        }
    })
    const responseJson2 = await requestGrep.json()
    const { name, text, gradeRange, words, pseudowords, phrases, text_id } = responseJson2.assessment
    cacheStage.name = name
    cacheStage.text = text
    cacheStage.gradeRange = gradeRange
    cacheStage.words = JSON.parse(words)
    cacheStage.pseudowords = JSON.parse(pseudowords)
    cacheStage.phrases = phrases.map(phrase => phrase.text
    )

    if (requestGrep.ok) {
        renderStage("etapa-palavras", "words", "#palavras-container", "palavras", "palavras-lidas")
        renderStage("etapa-pseudopalavras", "pseudowords", "#pseudopalavras-container", "pseudopalavras", "pseudopalavras-lidas")
        renderStage("etapa-frases", "phrases", "#frases-container", "frases", "frases-lidas")
        renderStageText("etapa-texto", "text", "text", "linhas", "linhas-lidas")
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
    document.getElementById("total-frases").innerHTML = cacheStage[currentCache].length
    document.getElementById("total-linhas").innerHTML = cacheStage[currentCache].length
    const btn_stage = () => {
        switch (stageBody.stage) {
            case "WORDS":
                return document.getElementById("proximo-etapa-palavras")
            case "PSEUDOWORDS":
                return document.getElementById("proximo-etapa-pseudopalavras")
            case "PHRASES":
                return document.getElementById("proximo-etapa-frases")
        }
    }
    btn_stage().disabled = true
    btn_stage().classList.add("bg-gray-400", "hover:bg-gray-400")
    divStage.innerHTML = ""
    cacheStage[currentCache].forEach(word => {
        const btn = document.createElement("button")
        let max = stages[currentStage].stage.querySelector("#total-" + currentTotal).innerHTML = cacheStage[currentCache].length
        const total = stages[currentStage].stage.querySelector("#total-" + currentRead).innerHTML = stageBody.itemsRead
        btn.classList.add("word", "bg-blue-100", "px-2", "py-1", "rounded", "outline-none", "ml-2", "item-click-" + currentCache)
        btn.addEventListener("click", () => {
            btn.classList.toggle("bg-green-100")
            console.log(stageBody)
            if (btn.classList.contains("bg-green-100")) {
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
    const textMap = cacheStage.text.split(".")

    stages["etapa-texto"].stage.querySelector("#total-linhas").innerHTML = textMap.length
    textMap.forEach(text => {
        const btn = document.createElement("button")
        btn.classList.add("word", "bg-blue-100", "px-2", "py-1", "rounded", "outline-none", "ml-2", "item-click-text")
        btn.disabled = true
        btn.classList.add("bg-gray-400", "hover:bg-gray-400")
        btn.addEventListener("click", () => {
            btn.classList.toggle("bg-green-100")
            if (btn.classList.contains("bg-green-100")) {
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
const timedafault = "00:02"
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
    const btn_stage = () => {
        switch (stageBody.stage) {
            case "WORDS":
                return document.getElementById("proximo-etapa-palavras")
            case "PSEUDOWORDS":
                return document.getElementById("proximo-etapa-pseudopalavras")
            case "PHRASES":
                return document.getElementById("proximo-etapa-frases")
        }
    }
    const interval = setInterval(() => {

        const [minutes, seconds] = timer.innerHTML.split(":")
        let totalSeconds = parseInt(minutes) * 60 + parseInt(seconds)
        totalSeconds--
        timer.innerHTML = `${Math.floor(totalSeconds / 60)}:${totalSeconds % 60}`
        if (totalSeconds === 0 && stageBody.itemsRead > 0) {
            alert("Tempo esgotado, você leu " + stageBody.itemsRead + " palavras")
            btn_stage().disabled = false
            btn_stage().classList.remove("bg-gray-400", "hover:bg-gray-400")
            btnTimerWords.classList.remove("bg-gray-400", "hover:bg-gray-400")
            clearInterval(interval);

        } else if (totalSeconds === 0 && stageBody.itemsRead === 0) {
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
        }
    }
    btn_stage().disabled = true
    btn_stage().classList.add("bg-gray-400", "hover:bg-gray-400")
    const interval = setInterval(() => {

        const [minutes, seconds] = timerText.innerHTML.split(":")
        let totalSeconds = parseInt(minutes) * 60 + parseInt(seconds)
        totalSeconds--
        timerText.innerHTML = `${Math.floor(totalSeconds / 60)}:${totalSeconds % 60}`
        if (totalSeconds === 0 && stageBody.itemsRead > 0) {
            alert("Tempo esgotado")
            btn_stage().disabled = false
            btn_stage().classList.remove("bg-gray-400", "hover:bg-gray-400")
            clearInterval(interval);
        } else if (totalSeconds === 0 && stageBody.itemsRead === 0) {
            alert("Tempo esgotado, você não leu nenhuma palavra")
            forcedEnd("etapa-palavras")
            btnTimerText.classList.remove("bg-gray-400", "hover:bg-gray-400")
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

    const btn_stage = () => {
        switch (stageBody.stage) {
            case "WORDS":
                return document.getElementById("proximo-etapa-palavras")
            case "PSEUDOWORDS":
                return document.getElementById("proximo-etapa-pseudopalavras")
            case "PHRASES":
                return document.getElementById("proximo-etapa-frases")
        }
    }
    btn_stage().disabled = true
    btn_stage().classList.add("bg-gray-400", "hover:bg-gray-400")
    const interval = setInterval(() => {

        const [minutes, seconds] = timerPhrases.innerHTML.split(":")
        let totalSeconds = parseInt(minutes) * 60 + parseInt(seconds)
        totalSeconds--
        timerPhrases.innerHTML = `${Math.floor(totalSeconds / 60)}:${totalSeconds % 60}`
        if (totalSeconds === 0 && stageBody.itemsRead > 0) {
            alert("Tempo esgotado, você leu " + stageBody.itemsRead + " frases")
            btn_stage().disabled = false
            btn_stage().classList.remove("bg-gray-400", "hover:bg-gray-400")
            btnTimerPhrases.disabled = false
            btnTimerPhrases.classList.remove("bg-gray-400", "hover:bg-gray-400")
            clearInterval(interval);

        } else if (totalSeconds === 0 && stageBody.itemsRead === 0) {
            alert("Tempo esgotado, você não leu nenhuma frase")
            forcedEnd("etapa-frases")
            btnTimerPhrases.disabled = false
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

    const btn_stage = () => {
        switch (stageBody.stage) {
            case "WORDS":
                return document.getElementById("proximo-etapa-palavras")
            case "PSEUDOWORDS":
                return document.getElementById("proximo-etapa-pseudopalavras")
            case "PHRASES":
                return document.getElementById("proximo-etapa-frases")
        }
    }
    btn_stage().disabled = true
    btn_stage().classList.add("bg-gray-400", "hover:bg-gray-400")
    const interval = setInterval(() => {

        const [minutes, seconds] = timerPseudowords.innerHTML.split(":")
        let totalSeconds = parseInt(minutes) * 60 + parseInt(seconds)
        totalSeconds--
        timerPseudowords.innerHTML = `${Math.floor(totalSeconds / 60)}:${totalSeconds % 60}`
        if (totalSeconds === 0 && stageBody.itemsRead > 0) {
            alert("Tempo esgotado, você leu " + stageBody.itemsRead + " pseudopalavras")
            btn_stage().disabled = false
            btn_stage().classList.remove("bg-gray-400", "hover:bg-gray-400")
            btnTimerPseudowords.disabled = false
            btnTimerPseudowords.classList.remove("bg-gray-400", "hover:bg-gray-400")
            clearInterval(interval);

        } else if (totalSeconds === 0 && stageBody.itemsRead === 0) {
            alert("Tempo esgotado, você não leu nenhuma pseudopalavra")
            forcedEnd("etapa-pseudopalavras")
            btnTimerPseudowords.disabled = false
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
        btnTimerText.disabled = false
        stages["etapa-palavras"].nextEvent()
    })
    stages["etapa-pseudopalavras"].stage.querySelectorAll("button")[1].addEventListener("click", (e) => {
        nextStage()
        if (stageBody.itemsRead === 0 && stageBody.stage === "PSEUDOWORDS") {
            alert("Você não leu nenhuma pseudopalavra")
            forcedEnd("etapa-pseudopalavras")
            return
        }
        stage = "PHRASES"
        stageBody.itemsRead = 0
        stageBody.totalItems = 0
        stageBody.stage = "PHRASES"
        btnTimerWords.disabled = false
        stages["etapa-pseudopalavras"].nextEvent()
    })
    stages["etapa-frases"].stage.querySelectorAll("button")[1].addEventListener("click", (e) => {
        nextStage()
        if (stageBody.itemsRead === 0 && stageBody.stage === "PHRASES") {
            alert("Você não leu nenhuma frase")
            forcedEnd("etapa-frases")
            return
        }
        stage = "TEXT"
        stageBody.itemsRead = 0
        stageBody.totalItems = 0
        stageBody.stage = "TEXT"
        btnTimerPseudowords.disabled = false
        stages["etapa-frases"].nextEvent()
    })
    stages["etapa-texto"].stage.querySelectorAll("button")[1].addEventListener("click", (e) => {
        nextStage()
        if (stageBody.itemsRead === 0 && stageBody.stage === "TEXT") {
            alert("Você não leu nenhuma linha")
            forcedEnd("etapa-texto")
            return
        }
        stageBody.itemsRead = 0
        stageBody.totalItems = 0
        stage = "TEXT"
        btnTimerPhrases.disabled = false
        stages["etapa-texto"].nextEvent()
    })
    stages["etapa-result"].stage.querySelectorAll("button")[0].addEventListener("click", () => {
        stages["etapa-result"].nextEvent()
        endExam()
    })


})

