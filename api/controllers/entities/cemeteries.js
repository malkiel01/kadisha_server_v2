const { performDatabaseOperations } = require('../connection/tokens')

const { format } = require('date-fns')
const NAME_TABLE = "cemeteries"

// יצירת רשומה בודדת
const setCemetery = (req, res) => {
  console.log('11', req.body);
  let token = req.body.token
  let query = `INSERT INTO cemeteries(cemeteryNameHe, cemeteryNameEn, nationalInsuranceCode, cemeteryCode, coordinates, address, documents, createDate, inactiveDate, contactName, contactPhoneName, isActive) 
              VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`

  // מציין את התאריך הנוכחי
  const now = new Date();

  try {
    // בודק אם הערך פעיל
    if (req.body['isActive'] === undefined || req.body['isActive'] === true) {
      const formattedDateTime = format(now, 'yyyy-MM-dd HH:mm:ss')

      let data = {
        cemeteryNameHe: req.body.cemeteryNameHe || '',
        cemeteryNameEn: req.body.cemeteryNameEn || '',
        nationalInsuranceCode: req.body.nationalInsuranceCode || '',
        cemeteryCode: req.body.cemeteryCode || '',
        coordinates: req.body.coordinates || '',
        address: req.body.address || '',
        documents: req.body.documents || '',
        createDate: formattedDateTime,
        inactiveDate: formattedDateTime,
        contactName: req.body.contactName || '',
        contactPhoneName: req.body.contactPhoneName || '',
        isActive: true
      }

      // מפנה אותי לדאטה בייס
      performDatabaseOperations(query, data, [token,'setCemetery'], result = (status, result) => {
        res.status(status).send(result)
      })   
    }

      } catch (error) {
      console.error('שגיאה:', error.message)
      res.status(500).send('שגיאה בקבלת חיבור')
  }
}

const setCemeteries = (req, res) => {
  let token = req.body.token;
  let query = `INSERT INTO ${NAME_TABLE}(cemeteryNameHe, cemeteryNameEn, nationalInsuranceCode, cemeteryCode, coordinates, address, documents, createDate, inactiveDate, contactName, contactPhoneName, isActive) 
              VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`;

  // מציין את התאריך הנוכחי
  const now = new Date();
  let tempStatus = 0;
  let tempResult = [];

  try {
    const promises = req.body.cemeteries.map((cemetery) => {
      return new Promise((resolve) => {
        // בודק אם הערך פעיל
        if (cemetery['isActive'] === undefined || cemetery['isActive'] === true) {
          const formattedDateTime = format(now, 'yyyy-MM-dd HH:mm:ss');

          let data = {
            cemeteryNameHe: cemetery.cemeteryNameHe || '',
            cemeteryNameEn: cemetery.cemeteryNameEn || '',
            nationalInsuranceCode: cemetery.nationalInsuranceCode || '',
            cemeteryCode: cemetery.cemeteryCode || '',
            coordinates: cemetery.coordinates || '',
            address: cemetery.address || '',
            documents: cemetery.documents || '',
            createDate: formattedDateTime,
            inactiveDate: formattedDateTime,
            contactName: cemetery.contactName || '',
            contactPhoneName: cemetery.contactPhoneName || '',
            isActive: true,
          };

          // מפנה אותי לדאטה בייס
          performDatabaseOperations(query, data, [token, 'setCemeteries'], (status, result) => {
            tempStatus = status
            tempResult.push(result)
            // console.log(tempStatus, tempResult)
            resolve();
          });
        } else {
          resolve();
        }
      });
    });

    Promise.all(promises)
      .then(() => {
        res.status(tempStatus).send(tempResult);
      })
      .catch((error) => {
        console.error('שגיאה:', error.message);
        res.status(500).send('שגיאה בקבלת חיבור');
      });
  } catch (error) {
    console.error('שגיאה:', error.message);
    res.status(500).send('שגיאה בקבלת חיבור');
  }
}

// קבלת רשומה בודדת באמצעות איידי
const getCemeteryById = (req, res) => {
  let token = req.body.params.token
  let id = req.body.params.id
  let query = `SELECT * FROM ${NAME_TABLE} WHERE id = ?`;

  try {
      performDatabaseOperations(query, [id], [token,'getCemeteryById'], result = (status, result) => {
          res.status(status).send(result);
      })
  } catch (error) {
      console.error('שגיאה:', error.message);
      res.status(500).send('שגיאה בקבלת חיבור');
  }
}

// קבלת כל הרשומות
const getCemeteries = (req, res) => {
  let token = req.body.token
  let id = req.body.id
  let query = `SELECT * FROM ${NAME_TABLE} WHERE isActive = true`;

  console.log(token, id);
  try {
      performDatabaseOperations(query, [], [token,'getCemeteries'], result = (status, result) => {
          res.status(status).send(result);
      })
  } catch (error) {
      console.error('שגיאה:', error.message);
      res.status(500).send('שגיאה בקבלת חיבור');
  }
}

// עדכון רשומה בודדת
// טרם בוצע
const updateCemetery = (req, res) => {
  let token = req.body.token;
  let query = `
    UPDATE cemeteries
    SET
      cemeteryNameHe = ?,
      cemeteryNameEn = ?,
      nationalInsuranceCode = ?,
      cemeteryCode = ?,
      coordinates = ?,
      address = ?,
      documents = ?,
      inactiveDate = ?,
      contactName = ?,
      contactPhoneName = ?,
      isActive = ?
    WHERE id = ?`;

  // מציין את התאריך הנוכחי
  const now = new Date();

  try {
    // בודק אם הערך פעיל
    if (req.body['isActive'] === undefined || req.body['isActive']) {
      const formattedDateTime = format(now, 'yyyy-MM-dd HH:mm:ss');

      let data = [
        req.body.cemeteryNameHe || '',
        req.body.cemeteryNameEn || '',
        req.body.nationalInsuranceCode || '',
        req.body.cemeteryCode || '',
        req.body.coordinates || '',
        req.body.address || '',
        req.body.documents || '',
        formattedDateTime,
        req.body.contactName || '',
        req.body.contactPhoneName || '',
        true, // assuming isActive is always true for an update, change if needed
        req.body.id || '' // replace with the actual field that holds the ID
      ];
      console.log('22', data);

      // מפנה אותי לדאטה בייס
      performDatabaseOperations(query, data, [token, 'updateCemetery'], (status, result) => {
        res.status(status).send(result);
      });
    }
  } catch (error) {
    console.error('שגיאה:', error.message);
    res.status(500).send('שגיאה בקבלת חיבור');
  }
}

// עדכון מקבץ רשומות
// טרם בוצע
const updateCemeteries = (req, res) => {

}

// מחיקת רשומה בודדת
// טרם בוצע
const removeCemetery = (req, res) => {
  console.log(req.body.token)
  let token = req.body.token;
  let query = `
    UPDATE cemeteries
    SET
      inactiveDate = ?,
      isActive = 0
    WHERE id = ?`;

  // מציין את התאריך הנוכחי
  const now = new Date();

  try {
    // בודק אם הערך פעיל
    if (req.body['isActive'] === undefined || req.body['isActive'] === true) {
      const formattedDateTime = format(now, 'yyyy-MM-dd HH:mm:ss');

      let data = [
        formattedDateTime,
        req.body.id || '' // replace with the actual field that holds the ID
      ];
      // מפנה אותי לדאטה בייס
      performDatabaseOperations(query, data, [token, 'removeCemetery'], (status, result) => {
        res.status(status).send(result);
      });
    }
  } catch (error) {
    console.error('שגיאה:', error.message);
    res.status(500).send('שגיאה בקבלת חיבור');
  }
}

// מחיקת מקבץ רשומות
// טרם בוצע
const deleteCemeteries = (req, res) => {

}

module.exports = {
  setCemetery,
  setCemeteries,
  getCemeteryById,
  getCemeteries,
  updateCemetery,
  updateCemeteries,
  removeCemetery,
  deleteCemeteries
}