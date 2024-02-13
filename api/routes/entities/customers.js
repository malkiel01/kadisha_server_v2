const express = require('express')
const router = express.Router()

const URL_CONTROLER_AREA_GRAVE = '../../controllers/entities/customers'

// setAreaGraves,
const { setCustomers } = require(URL_CONTROLER_AREA_GRAVE)
router.post('/addCustomer', setCustomers)

const { getCustomers }   = require(URL_CONTROLER_AREA_GRAVE)
router.post('/getCustomers', getCustomers)

module.exports = router

