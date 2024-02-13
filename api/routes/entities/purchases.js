const express = require('express')
const router = express.Router()

const URL_CONTROLER_AREA_GRAVE = '../../controllers/entities/purchases'

// setPurchases,
const { setPurchases } = require(URL_CONTROLER_AREA_GRAVE)
router.post('/addPurchase', setPurchases)

const { getPurchases }   = require(URL_CONTROLER_AREA_GRAVE)
router.post('/getPurchases', getPurchases)

module.exports = router

