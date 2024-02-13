const express = require('express')
const router = express.Router()

const URL_CONTROLER_AREA_GRAVE = '../../controllers/entities/areaGraves'

// setAreaGraves,
const { setAreaGraves } = require(URL_CONTROLER_AREA_GRAVE)
router.post('/addAreaGrave', setAreaGraves)

const { getAreaGraves }   = require(URL_CONTROLER_AREA_GRAVE)
router.post('/getAreaGraves', getAreaGraves)

module.exports = router

