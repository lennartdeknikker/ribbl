const mongoose = require('mongoose')
const Scores = require('../models/scores')

const Database = {
    addNewData(destinationFromGame, newClicksArray) {        
        mongoose.connect(process.env.MONGO_URL, {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false})
        const db = mongoose.connection

        db.on('error', console.error.bind(console, 'connection error:'))
        db.once('open', function() {
            // we're connected!
            console.log('we are connected')
            
            Database.onConnection(destinationFromGame, newClicksArray)            
        })
    },
    async onConnection(destinationFromGame, newClicksArray) {
        const oldScores = await Database.getOldScores()
        const newScoresValue = Database.createNewScoresValue(oldScores, destinationFromGame, newClicksArray)
        await Database.updateScores(newScoresValue)
    },
    async getOldScores() {
        const query = { name: 'totalArray' }
        const oldScores = await Scores.findOne(query, function (err, scores) {
            if (scores) {
                return scores          
            } 
        })
        return oldScores
    },
    async getCurrentScores(callback) {
        mongoose.connect(process.env.MONGO_URL, {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false})
        const db = mongoose.connection

        db.on('error', console.error.bind(console, 'connection error:'))
        db.once('open', async function() {
            const currentScores = await Database.getOldScores()
            callback(currentScores.scores)
        })
    },
    async updateScores(newScoresValue) {
        const query = { name: 'totalArray' }
        const change = { scores: newScoresValue }

        const newScores = await Scores.findOneAndUpdate(query, change, {new:true}, function(err) {
            if (err) return console.error(err)
        })
        return newScores
    },
    resetScoreValues() {
        let newScoresValue = []
        Destinations.forEach(destination => {
            let newScore = {
                country: destination.name,
                averageAmountOfClicks: 0,
                timesPlayed: 0
            }
            newScoresValue.push(newScore)
        })
        return newScoresValue
    },
    createNewScoresValue(oldScores, destinationFromGame, clicksArrayFromGame) {
        const newScoresValues = oldScores.scores
        let oldTimesPlayed
        let oldAverage

        const scoreToUpdate = newScoresValues.find(score => {
            if (score.country === destinationFromGame) {
                oldTimesPlayed = score.timesPlayed
                oldAverage = score.averageAmountOfClicks
                return true
            }
        })        

        let newTimesPlayed = clicksArrayFromGame.length
        let newAverage = clicksArrayFromGame.reduce((a,b) => a + b, 0) / newTimesPlayed

        let totalTimesPlayed = oldTimesPlayed + newTimesPlayed
        let totalAverage = (oldTimesPlayed * oldAverage + newTimesPlayed * newAverage) / totalTimesPlayed

        scoreToUpdate.averageAmountOfClicks = totalAverage
        scoreToUpdate.timesPlayed = totalTimesPlayed
        
        return newScoresValues
    }
}

module.exports = Database