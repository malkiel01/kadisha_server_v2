const express = require('express')
const router = express.Router()

const URL_CONTROLER_AREA_GRAVE = '../../controllers/entities/burials'

// setBurials,
const { setBurials } = require(URL_CONTROLER_AREA_GRAVE)
router.post('/addBurial', setBurials)

const { getBurials }   = require(URL_CONTROLER_AREA_GRAVE)
router.post('/getBurials', getBurials)

module.exports = router

