const express = require('express')
const router = express.Router()
const Database = require('../scripts/database')

/* GET home page. */
router.get('/', function(req, res) {    
    Database.getCurrentScores(renderPageWithScores)
    function renderPageWithScores(scores) {
        scores.sort((a,b) => a.averageAmountOfClicks - b.averageAmountOfClicks)
        scores.map(score => {
            if (Math.floor(score.averageAmountOfClicks) !== score.averageAmountOfClicks)
                score.averageAmountOfClicks = (Math.round(score.averageAmountOfClicks * 100) / 100).toFixed(2)
        })
        res.render('results', { title: 'results', results: scores})
    }
})

module.exports = router
