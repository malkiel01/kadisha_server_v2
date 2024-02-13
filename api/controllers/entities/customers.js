const { performDatabaseOperations } = require('../connection/tokens')
const { getGenerals, setGenerals } = require('./generals')

const { format } = require('date-fns')

// יצירת רשומה בודדת
const setCustomers = (req, res) => {
    const nameTable = "customers"
    const nameFunction = "setCustomers"
    setGenerals(req, res,nameTable,nameFunction)
}


// קבלת כל הרשומות
const getCustomers = (req, res) => {
  const nameTable = "customers"
  const nameFunction = "getCustomers"
  getGenerals(req, res,nameTable,nameFunction)
}

module.exports = {
  getCustomers,
  setCustomers
}