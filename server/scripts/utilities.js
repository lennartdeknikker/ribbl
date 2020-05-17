const Utilities = {
    createUser(username, id, isAdmin) {
        return {
            username: username,
            id: id,
            score: 0,
            admin: isAdmin,
            ready: false
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
            drawTime: drawTime,
            status: 'waiting for players',
            winner: {}
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
}

module.exports = Utilities
