const { performDatabaseOperations } = require('../connection/tokens')
const { getGenerals, setGenerals } = require('./generals')

const { format } = require('date-fns')

// יצירת רשומה בודדת
const setBlocks = (req, res) => {
    const nameTable = "blocks"
    const nameFunction = "setBlocks"
    setGenerals(req, res,nameTable,nameFunction)
}


// קבלת כל הרשומות
const getBlocks = (req, res) => {
  const nameTable = "blocks"
  const nameFunction = "getBlocks"
  getGenerals(req, res,nameTable,nameFunction)
}

module.exports = {
  getBlocks,
  setBlocks
}







const getBlocks2 = (req, res) => {
  let token = req.body.token
  let id = req.body.id

  let query = `SELECT * FROM ${NAME_TABLE} WHERE isActive = true`;
  
  console.log(token, id);
  try {
    performDatabaseOperations(query, [], [token,'getBlocks'], result = (status, result) => {
      res.status(status).send(result);
    })
  } catch (error) {
    console.error('שגיאה:', error.message);
    res.status(500).send('שגיאה בקבלת חיבור');
  }
}

const setBlocks2 = (req, res) => {
  console.log('22',req.body);
  let token = req.body.token;
  let query = `INSERT INTO ${NAME_TABLE}(blockNameHe, blockNameEn, blockLocation, nationalInsuranceCode, blockCode, comments, coordinates ,documentsList, cemeteryId ,isActive, createdDate, updateDate, inactiveDate) 
              VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`;

  // מציין את התאריך הנוכחי
  const now = new Date();
  
  try {
    // בודק אם הערך פעיל
    if (req.body['isActive'] === undefined || req.body['isActive'] === true) {
      const formattedDateTime = format(now, 'yyyy-MM-dd HH:mm:ss')

      let data = {
            blockNameHe: req.body.blockNameHe || '', 
            blockNameEn: req.body.blockNameEn || '', 
            blockLocation: req.body.blockLocation || '', 
            nationalInsuranceCode: req.body.nationalInsuranceCode || '', 
            blockCode: req.body.blockCode || '', 
            comments: req.body.comments || '', 
            coordinates: req.body.coordinates || '',
            documentsList: req.body.documentsList || '', 
            cemeteryId: req.body.cemeteryId || '',
            isActive: true, 
            createdDate: formattedDateTime, 
            updateDate: formattedDateTime, 
            inactiveDate: formattedDateTime,
      }

      // מפנה אותי לדאטה בייס
      performDatabaseOperations(query, data, [token,'setBlocks'], result = (status, result) => {
        res.status(status).send(result)
      }) 
    }
  } catch (error) {
    console.error('שגיאה:', error.message)
    res.status(500).send('שגיאה בקבלת חיבור')
  }
}