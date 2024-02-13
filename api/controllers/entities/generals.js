const { performDatabaseOperations } = require('../connection/tokens')

const { format } = require('date-fns')

// קבלת כל הרשומות
const getGenerals = (req, res, nameTable, nameFunction) => {
    let token = req.body.token
    let id = req.body.id
  
    let query = `SELECT * FROM ${nameTable} WHERE isActive = true`;
    
    console.log(token, id);
    try {
      performDatabaseOperations(query, [], [token,nameFunction], result = (status, result) => {
        res.status(status).send(result);
      })
    } catch (error) {
      console.error('שגיאה:', error.message);
      res.status(500).send('שגיאה בקבלת חיבור');
    }
  }

// יצירת רשומה בודדת
const setGenerals = (req, res, nameTable, nameFunction) => {
  console.log('33', req.body);
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

  let query = `INSERT INTO ${nameTable}(${columns.join(',')}) VALUES (${placeholders})`;

  console.log("Query: ", query);
  console.log("Values: ", values);

  try {
    if (req.body['isActive'] === undefined || req.body['isActive'] === true) {
      // מפנה אותי לדאטה בייס
      performDatabaseOperations(query, values, [token, nameFunction], result = (status, result) => {
        res.status(status).send(result);
      });
    }
  } catch (error) {
    console.error('שגיאה:', error.message);
    res.status(500).send('שגיאה בקבלת חיבור');
  }
}

module.exports = {
  setGenerals,
  getGenerals
}