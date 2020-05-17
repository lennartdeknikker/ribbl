const Utilities = require('./utilities')
const States = require('./states')

function socket(io) {
    let availableRooms = States.availableRooms

    io.on('connection', function(socket){
        socket.emit('change in open rooms', availableRooms)
        console.log('a user connected')

        socket.on('join room', async function(formValues) {   
            const userName = formValues.user
            const roomName = formValues.room

            const roomIndex = availableRooms.findIndex(room => room.roomName === roomName)
            const newUser = await Utilities.createUser(userName, socket.id, false)

            availableRooms[roomIndex].users.push(newUser)
            availableRooms[roomIndex].userTotal++ 

            socket.join(roomName)

            socket.emit('room joined')            
            io.to(roomName).emit('change in users', Utilities.getRoomData(roomName, availableRooms))
            io.emit('change in open rooms', availableRooms)

            console.log(userName, 'joined', roomName)
            console.log('room details', io.sockets.adapter.rooms[roomName])   
        })

        socket.on('create new room', async (formValues) => {
            const roomName = formValues.room
            const rounds = formValues.rounds
            const drawTime = formValues.time
            const userName = formValues.user

            if (!io.sockets.adapter.rooms[roomName]) {
                // add a new room
                const newRoom = await Utilities.createRoom(roomName, rounds, drawTime)
                availableRooms.push(newRoom)
                // push the new user as admin.
                const newUser = await Utilities.createUser(userName, socket.id, true)
                const roomIndex = availableRooms.findIndex(room => room.roomName === roomName)
                availableRooms[roomIndex].users.push(newUser)
                availableRooms[roomIndex].userTotal++
                // add room to dropdown in the join game form.
                
                socket.join(roomName)
                
                io.emit('change in open rooms', availableRooms)
                console.log(`a new room has been created: ${roomName}`)     
                socket.emit('room creation successfull', true)           
            } else socket.emit('room creation successfull', false)
        })

        socket.on('disconnect', function() {
            console.log('user disconnected')            
            availableRooms.forEach(room => {
                room.users.forEach(user => {
                    if (user.id === socket.id) {
                        // if admin, assign new admin
                        if (user.admin === true && room.users.length > 1) room.users[1].admin = true
                        const index = room.users.indexOf(user)
                        // remove user from array
                        room.users.splice(index, 1)
                        // update user total
                        room.userTotal--
                        // tell clients the users file changed          
                        io.to(room.roomName).emit('change in users', Utilities.getRoomData(room.roomName, availableRooms))
                        // delete room if empty
                        if (room.userTotal < 1) {
                            const index = availableRooms.indexOf(room)
                            availableRooms.splice(index, 1)
                        }
                    }
                })
            })
            io.emit('change in open rooms', availableRooms)
        })

        socket.on('ready', (ready) => {
            console.log('ready')
            Utilities.setUserProperty(socket.id, availableRooms, 'ready', ready, io)            
        })

        socket.on('start game', async () => {
            console.log('start game')            
            const room = Utilities.getRoomByUserId(socket.id, availableRooms)
            room.status = 'playing'
            
            io.to(room.roomName).emit('game started', room)          
            io.to(room.roomName).emit('scores changed', room.users)          
            io.emit('change in open rooms', availableRooms)
        })

        socket.on('new message', (message) => {
            const room = Utilities.getRoomByUserId(socket.id, availableRooms)
            const thisUser = Utilities.getUserById(socket.id, room)
            io.to(room.roomName).emit('new message received', thisUser.username, message)
        })
    })
}

module.exports = socket