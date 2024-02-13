const { performDatabaseOperations } = require('../connection/tokens')

const { format } = require('date-fns')
const NAME_TABLE = "blocks"
const NAME_FUNCTION = "getBlocks"

// יצירת רשומה בודדת
// פונקציה גנרית ליצירת רשומות בטבלאות שונות
const setGenericRecord = (req, res, tableName, operationName) => {
  console.log('22', req.body);
  let token = req.body.token;

  // יצירת רשימה של שמות העמודות וערכיהם
  let columns = [];
  let values = [];
  for (let key in req.body) {
    if (req.body.hasOwnProperty(key) && key !== 'token' && key !== 'isActive') {
      columns.push(key);
      values.push(req.body[key]);
    }
  }

  // הוספת העמודות הקבועות
  columns.push('isActive', 'createdDate', 'updateDate', 'inactiveDate');
  const now = new Date();
  const formattedDateTime = format(now, 'yyyy-MM-dd HH:mm:ss');
  values.push(true, formattedDateTime, formattedDateTime, formattedDateTime);

  let placeholders = values.map(() => '?').join(',');

  let query = `INSERT INTO ${NAME_TABLE}(${columns.join(',')}) VALUES (${placeholders})`;

  try {
    if (req.body['isActive'] === undefined || req.body['isActive'] === true) {
      // מפנה אותי לדאטה בייס
      performDatabaseOperations(query, values, [token, NAME_FUNCTION], result = (status, result) => {
        res.status(status).send(result);
      });
    }
  } catch (error) {
    console.error('שגיאה:', error.message);
    res.status(500).send('שגיאה בקבלת חיבור');
  }
};


// קבלת כל הרשומות
const getBlocks = (req, res) => {
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

module.exports = {
  getBlocks,
  setGenericRecord
}