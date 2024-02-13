const { performDatabaseOperations } = require('../connection/tokens')
const { getGenerals, setGenerals } = require('./generals')

const { format } = require('date-fns')

// יצירת רשומה בודדת
const setAreaGraves = (req, res) => {
    const nameTable = "areaGraves"
    const nameFunction = "setAreaGraves"
    setGenerals(req, res,nameTable,nameFunction)
}


// קבלת כל הרשומות
const getAreaGraves = (req, res) => {
  const nameTable = "areaGraves"
  const nameFunction = "getAreaGraves"
  getGenerals(req, res,nameTable,nameFunction)
}

module.exports = {
  getAreaGraves,
  setAreaGraves
}