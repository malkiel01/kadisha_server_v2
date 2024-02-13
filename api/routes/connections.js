const express = require('express')
const router = express.Router()

const URL_CONTROLER_CONNECTION = '../controllers/connection/connections'

const { login } = require(URL_CONTROLER_CONNECTION)
router.post('/login', login)

const { logout } = require(URL_CONTROLER_CONNECTION)
router.post('/logout', logout)

const { createUser } = require(URL_CONTROLER_CONNECTION)
router.post('/registration', createUser)

const { checkTimer } = require(URL_CONTROLER_CONNECTION)
router.post('/check_token', checkTimer)



module.exports = router