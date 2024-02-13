const express = require('express')
const router = express.Router()

const URL_CONTROLER_CEMETERY = '../../controllers/entities/cemeteries'


// setCemetery,
const { setCemetery } = require(URL_CONTROLER_CEMETERY)
router.post('/addCemetery', setCemetery)

// updateCemetery,
const { updateCemetery } = require(URL_CONTROLER_CEMETERY)
router.post('/updateCemetery', updateCemetery)

// removeCemetery,
const { removeCemetery } = require(URL_CONTROLER_CEMETERY)
router.post('/removeCemetery', removeCemetery)


// setCemeteries,
const { setCemeteries } = require(URL_CONTROLER_CEMETERY)
router.post('/add-cemeteries', setCemeteries)

// getCemeteryById,

const { getCemeteryById } = require(URL_CONTROLER_CEMETERY)
router.post('/getCemeteryById', getCemeteryById);

// getCemeteries,

const { getCemeteries }   = require(URL_CONTROLER_CEMETERY)
router.post('/getCemeteries', getCemeteries)

// updateCemetery,
// updateCemeteries,
// deleteCemetery,
// deleteCemeteries

module.exports = router

