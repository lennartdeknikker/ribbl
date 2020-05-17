const Words = require('./words.json')

const Utilities = {
    createUser(username, id, isAdmin) {
        return {
            username: username,
            id: id,
            score: 0,
            admin: isAdmin,
            ready: false,
            position: 0
        }
    },
    async createRoom(roomName, rounds, drawTime) {        
        let newRoom = {
            roomName: roomName,
            userTotal: 0,
            users: [],
            playedWords: [],
            messages: [],
            rounds: rounds,
            currentRound: 1,
            drawTime: drawTime,
            status: 'waiting for players',
            winner: {},
            turn: 0,
            currentWord: '',
            timer: drawTime,
            interval: {}
        }
        return newRoom
    },
    getRoomData(roomName, roomsFile) {
        const roomIndex = roomsFile.findIndex(room => room.roomName === roomName)
        return roomsFile[roomIndex]
    },
    getRoomByUserId(id, roomsFile) {
        let result = -1
        roomsFile.forEach(room => {
            room.users.forEach(user => {
                if (user.id === id) {
                    result = room
                }
            })
        })
        return result
    },    
    getUserById(socketID, room) {
        let foundUser = []
        room.users.forEach(user => {
            if (user.id === socketID) {
                foundUser = user
            }
        })
        return foundUser
    },    
    getUserByPosition(position, room) {
        let foundUser = []
        room.users.forEach(user => {
            if (user.position === position) {
                foundUser = user
            }
        })
        return foundUser
    },
    setUserProperty(id, roomsFile, property, newValue, io) {
        let newRoomdata = []
        roomsFile.forEach(room => {
            room.users.forEach(user => {
                if (user.id === id) {
                    newValue === 'increment' ? user[property] = user[property] + 1 : user[property] = newValue
                    newRoomdata = Utilities.getRoomData(room.roomName, roomsFile)                    
                    io.to(room.roomName).emit('change in users', newRoomdata)
                }
            })
        })
    },
    getRandomWords(amount = 3) {
        let words = []
        for (let i = 0; i < amount; i++) {
            const randomIndex = Math.floor(Math.random() * Words.words.length)
            words.push(Words.words[randomIndex]) 
        }
        return words
    }
}

module.exports = Utilities
