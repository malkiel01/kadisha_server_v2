const express = require('express')
const router = express.Router()

const URL_CONTROLER_PDF = '../../controllers/plagin/pdf'

const { createPDFconsular } = require(URL_CONTROLER_PDF)
router.post('/consular', createPDFconsular)


module.exports = router

