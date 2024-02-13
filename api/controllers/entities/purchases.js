const { performDatabaseOperations } = require('../connection/tokens')
const { getGenerals, setGenerals } = require('./generals')

const { format } = require('date-fns')

// יצירת רשומה בודדת
const setPurchases = (req, res) => {
    const nameTable = "purchases"
    const nameFunction = "setPurchases"
    setGenerals(req, res,nameTable,nameFunction)
}


// קבלת כל הרשומות
const getPurchases = (req, res) => {
  const nameTable = "purchases"
  const nameFunction = "getPurchases"
  getGenerals(req, res,nameTable,nameFunction)
}

module.exports = {
  getPurchases,
  setPurchases
}