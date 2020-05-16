const mongoose = require('mongoose')

const scoreSchema = new mongoose.Schema({
    name: String,
    scores: Object
})


const Scores = mongoose.model('scores', scoreSchema)

module.exports = Scores