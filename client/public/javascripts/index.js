// HTML ELEMENTS
const startButton = document.getElementById('start-button')
const readyButton = document.getElementById('ready-button')
const userList = document.getElementById('user-list')
const otherPlayersArticle = document.getElementById('other-players-article')
const noPlayersArticle = document.getElementById('no-players-article')
const chatInput = document.getElementById('chat-input')
const messagesList = document.getElementById('messages-list')

// EVENT LISTENERS
readyButton.addEventListener('click', readyButtonHandler)
startButton.addEventListener('click', startButtonHandler)
chatInput.addEventListener

//EVENT HANDLERS
function readyButtonHandler() {
    const ready = readyButton.dataset.ready === 'true'

    socket.emit('ready', !ready)
    this.innerText = ready ? 'Click here when you\'re ready' : 'Wait for the admin to start the game...'
    readyButton.dataset.ready = !ready
}

function startButtonHandler() {
    if (startButton.dataset.ready) {        
        socket.emit('ready', true)
        socket.emit('start game')    
        console.log('start game')        
    }
}

//SOCKET EVENTS

// eslint-disable-next-line no-undef
const socket = io()

socket.on('connect', () => {
    console.log('connected')    
})

socket.on('change in open rooms', (availableRooms) => {
    updateRoomList(availableRooms)
})

socket.on('room creation successfull', (success) => {
    if (success) {
        changeVisibleSectionTo('waiting-room-section')
    }
})

socket.on('room joined', () => {
    changeVisibleSectionTo('waiting-room-section')
})

socket.on('change in users', (roomData) => {
    console.log('change in users')

    // check if this user is admin
    const admin = isAdmin(roomData.users)
    
    // update the user list
    updateUserList(roomData.users)

    // if user is admin, show start button and hide ready button
    if (admin) {
        makeVisible(startButton, true)
        makeVisible(readyButton, false)
    } else {
        makeVisible(startButton, false)
        makeVisible(readyButton, true)
    }

    // if user is admin and alone, or admin and everyone is ready, enable the start button
    if ((admin && everyoneReady(roomData.users)) || (admin && roomData.users.length <= 1)) {
        startButton.dataset.ready = true
        startButton.classList.remove('inactive')
        startButton.innerText = 'Start game'
    } else {
        startButton.dataset.ready = false
        startButton.classList.add('inactive')
        startButton.innerText = 'Wait for all players to get ready...'
    }
})

socket.on('game started', (roomData) => {
    console.log(roomData)
    changeVisibleSectionTo('game-room-section')
})

socket.on('new message received', (user, message) => {
    const newLi = document.createElement('li')
    newLi.innerText = `${user}: ${message}`
    messagesList.appendChild(newLi)
})

// HELPER FUNCTIONS

function updateRoomList(rooms) {
    const joinForm = document.getElementById('form-join-game')
    const roomSelectElement = document.getElementById('select-room')
    roomSelectElement.innerHTML = ''
    console.log(rooms)
    let anyRoomWaiting = false
    for (let room of rooms) {
        if (room.status === 'waiting for players') {
            anyRoomWaiting = true
            let newOption = document.createElement('option')
            const playerText =  room.userTotal === 1 ? 'player' : 'players'
            const optionText = `${room.roomName} ( ${room.userTotal} ${playerText})`
            newOption.value = room.roomName
            newOption.innerText = optionText
            roomSelectElement.appendChild(newOption)
        }
    }
    anyRoomWaiting ? joinForm.classList.remove('hidden') : joinForm.classList.add('hidden')
}

function updateUserList(users) {
    userList.innerHTML = ''
    if (users.length <= 1) {
        otherPlayersArticle.classList.add('hidden')
        noPlayersArticle.classList.remove('hidden')
    } else {
        otherPlayersArticle.classList.remove('hidden')
        noPlayersArticle.classList.add('hidden')
        for (let user of users) {
            if (user.id !== socket.id) {
                const newLi = document.createElement('li')
                const readyText = user.admin ? '(admin)' : user.ready ? '(ready)' : '(not ready)'
                if (user.admin || user.ready) newLi.classList.add('user-ready')
                newLi.innerText = `${user.username} ${readyText}`        
                userList.appendChild(newLi)
            } 
        }
    }
}

function changeVisibleSectionTo(sectionName) {
    const sections = document.querySelectorAll('section')
    for (let section of sections) {
        if (section.id === sectionName) {
            section.classList.remove('hidden')
        } else section.classList.add('hidden')
    }
}

function makeVisible(element, visible) {
    visible ? element.classList.remove('hidden') : element.classList.add('hidden')
}

// checker functions
function isAdmin(users) {
    const admin = users.find(user => user.admin === true)    
    return admin.id === socket.id
}

function everyoneReady(users) {
    let everyoneReady = true
    for (let user of users) {
        if (user.ready === false && user.admin !== true) everyoneReady = false
    }
    return everyoneReady
}


// FORM VALIDATION
const forms = document.querySelectorAll('form')
forms.forEach(form => {
    form.addEventListener('submit', () => validateForm(form))
})

function validateForm(form) {
    event.preventDefault()
    if (validate(form)) handleForm(form)
}

function validate(form) {
    console.log('validating')
    
    const formElements = form.querySelectorAll('textarea, input')
    let allIsRight = true
    for (const element of formElements) {
        const value = element.value
        if (!value) {
            event.preventDefault()
            element.placeholder = 'Sorry, this field is required.'
            element.classList.add('wrong-input')
            allIsRight = false
        }
    }
    return allIsRight ? true : false
}


function handleForm() {
    if (event.target.id === 'form-new-game') {
        const formValues = extractFormValues(event.target)
        socket.emit('create new room', formValues)
    }
    if (event.target.id === 'form-join-game') {
        const formValues = extractFormValues(event.target)
        socket.emit('join room', formValues)
    }
    if (event.target.id === 'form-chat') {
        const formValues = extractFormValues(event.target)
        socket.emit('new message', formValues.message)
        chatInput.value = ''
    }
    
}

function extractFormValues(form) {
    const formValues = {}
    for (let i = 0; i < form.length; i++) {
        if (form[i].name) formValues[form[i].name] = form[i].value
    }
    return formValues
}