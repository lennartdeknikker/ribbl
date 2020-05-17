const express = require('express')
const router = express.Router()
const States = require('../scripts/states')

/* GET home page. */
router.get('/', async function(req, res) {
    let availableRooms = []

    // filter for rooms that are still open and only save their name and amount of users in availableRooms
    States.availableRooms.forEach(room => {
        if (room.status === 'waiting for players') {
            const availableRoom = {
                roomName: room.roomName,
                userTotal: room.userTotal
            }
            availableRooms.push(availableRoom)
        }
    })
    
    // render the index page.
    res.render('index', { title: '', rooms: availableRooms })
})

module.exports = router
