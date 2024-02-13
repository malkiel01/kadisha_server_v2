const { performDatabaseOperations } = require('../connection/tokens')
const { getGenerals, setGenerals } = require('./generals')

const { format } = require('date-fns')

// יצירת רשומה בודדת
const setBurials = (req, res) => {
    const nameTable = "burials"
    const nameFunction = "setBurials"
    setGenerals(req, res,nameTable,nameFunction)
}


// קבלת כל הרשומות
const getBurials = (req, res) => {
  const nameTable = "burials"
  const nameFunction = "getBurials"
  getGenerals(req, res,nameTable,nameFunction)
}

module.exports = {
  getBurials,
  setBurials
}