window.addEventListener("submit", (e) => {
    e.preventDefault()
})

window.addEventListener("click", (e) => {
    if(e.target.id == "submitCreateTask") {
        const form = document.getElementById("boardForm")

        const data = new FormData(form);

        let obj = {
            name: data.get("name"),
            board: data.get("board"),
            category: data.get("category")
        }

        const request = new XMLHttpRequest()

        request.onreadystatechange = (e) => {
            if(request.readyState === 4) {
                let response = request.response
                if(response.length) {
                    response = JSON.parse(request.response)

                    for(const err in response) {
                        console.log(`[${err}]: ${response[err].msg}`)
                    }

                    if(request.status == 200) {
                        form.reset()
                        
                        const tasksList = document.getElementsByClassName("tasks")[0]

                        tasksList.insertAdjacentHTML("afterbegin", 
                            `
                            <li class="task" data-id="${response.id}">
                                <div class="colorSorting" data-task-color-id="${response.id}" style="background-color: #000"></div>
                                <div class="taskComplete"></div>
                                <strong>${response.name}</strong>
                                <div class="taskSort"></div>
                            </li>
                            `
                        )

                        closeModal("createTaskModal")
                    }

                    if(request.status == 400) {
                        console.log(response)
                    }
                }
            }
        };

        request.open("POST", "http://localhost:3000/api/tasks/create", true)

        request.setRequestHeader("Content-Type", "application/json")

        const formObj = JSON.stringify(obj)

        request.send(formObj)
    }

    if(e.target.className == "createTask") {
        displayModal("createTaskModal")
    }

    if(e.target.className == "closeModal closeCreateTaskModal") {
        closeModal("createTaskModal")
    }

    if(e.target.className == "taskComplete") {
        let taskID = e.target.parentElement.getAttribute("data-id")

        let obj = {
            id: taskID
        }

        const request = new XMLHttpRequest()

        request.onreadystatechange = (e) => {
            if(request.readyState === 4) {
                let response = request.response
                if(response.length) {
                    response = JSON.parse(request.response)

                    for(const err in response) {
                        console.log(`[${err}]: ${response[err].msg}`)
                    }

                    if(request.status == 200) {
                        const tasksList = document.getElementsByClassName("tasks")[0]

                        const task = tasksList.querySelector(`[data-id="${taskID}"]`)
                        task.remove()
                    }

                    if(request.status == 400) {
                        console.log(response)
                    }
                }
            }
        };

        request.open("POST", "http://localhost:3000/api/tasks/complete", true)

        request.setRequestHeader("Content-Type", "application/json")

        const dataObj = JSON.stringify(obj)

        request.send(dataObj)
    }

    if(e.target.className == "colorSorting") {
        localStorage.setItem("taskID", e.target.getAttribute("data-task-color-id"))

        displayModal("updateTaskColorModal")
    }

    if(e.target.className == "closeModal closeUpdateTaskColorModal") {
        closeModal("updateTaskColorModal")
    }

    if(e.target.id == "updateTaskColor") {
        const form = document.getElementById("updateColorForm")
        const taskID = localStorage.getItem("taskID")
        const data = new FormData(form);

        let obj = {
            id: taskID,
            color: data.get("color"),
        }

        const request = new XMLHttpRequest()

        request.onreadystatechange = (e) => {
            if(request.readyState === 4) {
                let response = request.response
                if(response.length) {
                    response = JSON.parse(request.response)

                    for(const err in response) {
                        console.log(`[${err}]: ${response[err].msg}`)
                    }

                    if(request.status == 200) {
                        form.reset()
                        
                        const colorBoxes = document.querySelectorAll(`[data-task-color-id="${taskID}"]`)
                        colorBoxes[0].style.backgroundColor = "#" + data.get("color")

                        closeModal("updateTaskColorModal")
                    }

                    if(request.status == 400) {
                        console.log(response)
                    }
                }
            }
        };

        request.open("POST", "http://localhost:3000/api/tasks/updateColor", true)

        request.setRequestHeader("Content-Type", "application/json")

        const formObj = JSON.stringify(obj)

        request.send(formObj)
    }
})

document.addEventListener("DOMContentLoaded", function(event) { 
    const multiSelect = document.getElementsByClassName("multiSelect")
    for(const mSel of multiSelect) {
        const mSelInput = mSel.getElementsByClassName("multiSelectTrigger")[0]
        const mSelOptions = mSel.getElementsByClassName("multiSelectOptions")[0]

        mSelInput.addEventListener("focus", (e) => {
            mSelOptions.style.display = "flex"
            mSelInput.value = ""
        })

        mSelInput.addEventListener("blur", (e) => {
            setTimeout(() => {
                mSelOptions.style.display = "none"
            }, 100)
        })

        mSelInput.addEventListener("keyup", (e) => {
            if(mSelOptions.style.display == "none") return

            for(const mSelOption of mSelOptions.children) {
                if(!mSelOption.outerText.toLowerCase().includes(mSelInput.value.toLowerCase())) {
                    mSelOption.style.display = "none"
                } else {
                    mSelOption.style.display = "block"
                }

                if(mSelInput.value.length <= 1) {
                    mSelOption.style.display = "block"
                }
            }
        })

        for(const mSelOption of mSelOptions.children) {
            mSelOption.addEventListener("click", (e) => {
                mSelInput.value = e.target.outerText
            })
        }
    }
});