const express = require('express')
const router = express.Router()

const URL_CONTROLER_BLOCK = '../../controllers/entities/blocks'

const { setBlocks } = require(URL_CONTROLER_BLOCK)
router.post('/addBlock', setBlocks)

const { getBlocks }   = require(URL_CONTROLER_BLOCK)
router.post('/getBlocks', getBlocks)


module.exports = router

