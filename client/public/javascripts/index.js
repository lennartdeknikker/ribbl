//SOCKET EVENTS

// eslint-disable-next-line no-undef
const socket = io()

socket.on('connect', () => {
    console.log('connected')    
})

socket.on('change in open rooms', (availableRooms) => {
    updateRoomList(availableRooms)
})

function updateRoomList(rooms) {
    const joinForm = document.getElementById('form-join-game')
    rooms.length > 0 ? joinForm.classList.remove('hidden') : joinForm.classList.add('hidden')
    const roomSelectElement = document.getElementById('select-room')
    roomSelectElement.innerHTML = ''
    console.log(rooms)
    
    for (let room of rooms) {
        let newOption = document.createElement('option')
        const playerText =  room.userTotal === 1 ? 'player' : 'players'
        const optionText = `${room.roomName} ( ${room.userTotal} ${playerText})`
        newOption.value = room.roomName
        newOption.innerText = optionText
        roomSelectElement.appendChild(newOption)
    }
}


// FORM VALIDATION
const forms = document.querySelectorAll('form')
forms.forEach(form => {
    form.addEventListener('submit', () => validateForm(form))
})

function validateForm(form) {
    event.preventDefault()
    if (validate(form)) form.submit()
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
