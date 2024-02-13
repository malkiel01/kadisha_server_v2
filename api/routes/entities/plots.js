const express = require('express')
const router = express.Router()

const URL_CONTROLER_PLOT = '../../controllers/entities/plots'

// setPlots,
const { setPlots } = require(URL_CONTROLER_PLOT)
router.post('/addPlot', setPlots)

const { getPlots }   = require(URL_CONTROLER_PLOT)
router.post('/getPlots', getPlots)

module.exports = router

