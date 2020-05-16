const express = require('express')
const router = express.Router()
const States = require('../scripts/states')
const Utilities = require('../scripts/utilities')

/* GET home page. */
router.get('/', async function(req, res) {
    const roomName = req.query.room
    const userName = req.query.user
    const roomsFile = States.availableRooms    
    const room = Utilities.getRoomData(roomName, roomsFile)
    if (room && room.status !== 'waiting for players') {
        res.render('error', { title: 'wiki-game', error: 'Sorry, you can\'t enter this room right now. They already started playing. '})
    } else {
        res.render('room', { title: `wiki-game | ${roomName}`, room: roomName, user: userName})
    }
})

module.exports = router
