const ConnectionPool = require('../../database/server')
const { ConnectionPoolMalfunctionException } = require('../../database/errors')
const crypto = require("crypto")
const { checkPermission } = require('./permission')
const { differenceInSeconds } = require('date-fns')
const { log } = require('console')

const TIMER_TOKEN = 3
const TIMER_DELETE_TOKEN = 60
const MAX_RETRIES = 3

// שאילתא לבדיקת הטוקן ב mysql
 const checkToken = (connection, token) => {
  return new Promise((resolve, reject) => {
    let query = `SELECT * FROM tokens WHERE token = ? AND isActive = true;`
    connection.query(query, [token[0]], (err, results, fields) => {
      if (err) {
        reject(false);
      } else {
        // אם יש תוצאות
        if (results.length > 0) {
          // אפשר להשתמש במידע מהתוצאה בצורה נוחה
          const formattedResults = results.map((row) => ({
            id: row.id,
            token: row.token,
            permission: row.permission,
            data: row.data,
            isActive: row.isActive,
          }))
          // עדכון שעת הטוקן
          if (updateToken(token[0])) {
            // בדיקת הרשאה לשאילתא
            resolve(checkPermission([token[1], formattedResults[0]]));
          } else {
            resolve(false);
          }
        } else {
          // אם לא נמצאו תוצאות
          resolve(false)
        }
      }
    });
  });
}

// בדיקת תקינות הטוקן
async function performDatabaseOperations(query, data = [], token, result) {
  const pool = ConnectionPool.getInstance();
  const values = []
  let connection
  let count = 20

  try {

    while (connection === undefined && (count >= 0)) {
      connection = await pool.getConnection()
      count--
    }

    if (connection) {
      let tokenValid = await checkToken(connection, token)
      for (const key in data) {
        if (data.hasOwnProperty(key)) {
          values.push(data[key]);
        }
      }

      if (tokenValid) {
        // הטוקן תקין, בצע את השאילתה למסד הנתונים
        const results = await executeQueryWithRetry(connection, query, values);

        result(200, results);
      } else {
        // הטוקן לא תקין, החזר מסר תקלה ללקוח
        result(401, 'הטוקן לא תקין');
      }
    }
    else {
      result(500, 'עומס מירבי');
    }
   

  } catch (error) {
    console.error('שגיאה בביצוע הפעולה:', error);
    result(500, 'שגיאה בביצוע הפעולה');
  } finally {
    if (connection) {
      // אחרי שסיימת להשתמש בחיבור, החזר אותו לבריכת החיבורים
      pool.putConnection(connection);
    }
  }
}
// הטוקן תקין, בצע את השאילתה למסד הנתונים
// הפעלת שאילתה באופן אסינכרוני והחזרת התוצאות
// 
function executeQuery(connection, query, values) {
  return new Promise((resolve, reject) => {
       connection.query(query, values, (err, results, fields) => {
      if (err) {
        console.error('שגיאה בביצוע השאילתה:', err);
        reject(err);
      } else {
        resolve(results);
      }
    });
  });
}
// מעטפת אבטחה ובדיקות, ומניעת קריסות לשאילתות executeQuery
async function executeQueryWithRetry(connection, query, values, retries = 0) {
  try {
    return await executeQuery(connection, query, values);
  } catch (error) {
    if (retries < MAX_RETRIES) {
      console.error(`ניסיון ${retries + 1} נכשל, מנסה שוב...`);
      return await executeQuery(connection, query, values, retries + 1);
    } else {
      console.error('חל מספר מרבי של ניסיונות. מוודא כי מסד הנתונים זמין.');
      throw error;
    }
  }
}

// הפונקציה שתייצר טוקן ותשמור אותו במסד הנתונים
async function generateTokenAndSave(permission) {
  // מציין את התאריך הנוכחי
  const now = new Date();
  // יצור טוקן אקראי, לדוגמה באמצעות crypto
  const token = crypto.randomBytes(16).toString('hex');

  // הגדרת השאילתה לשמירת הטוקן
  const sql = 'INSERT INTO tokens (token, permission, date) VALUES (?, ?, ?)';

  // הערכים שיש להכניס לשאילתה
  const values = [token, permission, now]; // נחליף את 'permission_value' בערך המתאים

  // ביצוע שאילתא לרישום טוקן
  const pool = ConnectionPool.getInstance()
  const connection = await pool.getConnection()
  try {
    connection.query(sql, values, (err, results, fields) => {
        // איפוס הטוקן במקרה שגיאה 
        if (err) {
          token = null
        } else {

        }
    })  
  } catch (error) {
    new ConnectionPoolMalfunctionException('error test 139 - Exception', pool)
} finally {
  if (connection) {
    // אחרי שסיימת להשתמש בחיבור, החזר אותו לבריכת החיבורים
    pool.putConnection(connection)
  }
}
  // החזרת הטוקן ללקוח
  return token 
}

// עדכון הארכת זמן לטוקן פעיל
async function updateToken(token) {
  return new Promise(async (resolve) => {
    const now = new Date();
    const updateQuery = `
      UPDATE tokens
      SET date = ?
      WHERE token = ? AND isActive = true
    `;
    const values = [now, token];

    const pool = ConnectionPool.getInstance();
    let connection;

    try {
      connection = await pool.getConnection()

      connection.query(updateQuery, values, (err, results, fields) => {
        if (err) {
          console.error('שגיאה בביצוע השאילתה:', err);
          resolve(null);
        } else {
          resolve(token);
        }
      })
    } catch (error) {
      // new ConnectionPoolMalfunctionException('error tokens 177 - Exception', pool)
      resolve(null);
    } finally {
      if (connection) {
        // אחרי שסיימת להשתמש בחיבור, החזר אותו לבריכת החיבורים
        pool.putConnection(connection)
      }
    }
  });
}

// --------------------------------------------------------
// פונקציה לבדוק ולהסיר את הטוקנים שפג תוקפם
async function ScanAndRemoveTokens({req, res},token) {

  const pool = ConnectionPool.getInstance()
  let connection;
  try {
    connection = await pool.getConnection()
  // בצע בדיקה ועדכון לטבלת הטוקנים
  const updateQuery = `
    UPDATE tokens
    SET isActive = false
    WHERE token = ?
  `;

  connection.query(updateQuery, [token], (error, results) => {
    if (!error) {
      res.status(200).json({ success: true, message: 'The system has disconnected...' })
    }
  })
  } catch (error) {
    console.error(error)
    res.status(500).json({ success: false, message: 'שגיאה בשרת.' })
  } finally {
    if (connection) {
      // אחרי שסיימת להשתמש בחיבור, החזר אותו לבריכת החיבורים
      pool.putConnection(connection)
    }
  }
}

// פונקציה לבדוק ולהסיר את הטוקנים שפג תוקפם
async function checkTokens() {
  const pool = ConnectionPool.getInstance()
  let connection;
  
  try {
    connection = await pool.getConnection()

    // בודק אם התקבל חיבור
    if (connection) {
      // חשב את הזמן של שעה לפני כדי לבדוק טוקנים
      const oneHourAgo = new Date(); // מציין את התאריך הנוכחי
      oneHourAgo.setMinutes(oneHourAgo.getMinutes() - 50) // מחיקת טוקן בדקות
      // oneHourAgo.setHours(oneHourAgo.getHours() - 1) // מחיקת טוקן בשעות
  
      // בצע בדיקה ועדכון לטבלת הטוקנים
      const updateQuery = `UPDATE tokens SET isActive = false WHERE date < ? AND isActive = true`;
  
      connection.query({ sql: updateQuery, timeout: 60_000 }, [oneHourAgo], (error, results) => {
        if (!error && results.length > 0) {
          console.log(`עודכנו ${results.affectedRows} רשומות`);
        }
      })  
    }
    } catch (error) {
      console.error('err step test: ', error)
    } finally {
      if (connection) {
        // אחרי שסיימת להשתמש בחיבור, החזר אותו לבריכת החיבורים
        pool.putConnection(connection)
      }
    }
}

// ניתוק התחברות לקוח לאחר זמן שהות
async function checkTimerTokens(req, res) {
  const { token } = req.body;

  const pool = ConnectionPool.getInstance();
  let connection = null
  try {
    connection = await pool.getConnection();

    // חשב את הזמן של שעה לפני כדי לבדוק טוקנים
    const oneHourAgo = new Date(); // מציין את התאריך הנוכחי
    oneHourAgo.setMinutes(oneHourAgo.getMinutes() - TIMER_DELETE_TOKEN); // מחיקת טוקן בדקות

    // בצע בדיקה ועדכון לטבלת הטוקנים
    const updateQuery = `SELECT * FROM tokens WHERE token = ? AND date > ? AND isActive = true`;

    try {
      const results = await executeQueryWithRetry(connection, updateQuery, [token, oneHourAgo]);
      // בודק אם קיים טוקן ואם הוא לקראת סיום
      if (results.length > 0) {
        try {
          const startDate = new Date(oneHourAgo);
          const endDate = new Date(results[0].date);

          const difference = differenceInSeconds(endDate, startDate);
          // הטוקן תקין ואין צורך בתגובה
          res.status(200).json({ success: true, message: 'חיבור תקין', timer: difference });
        } catch (error) {
          res.status(500).json({ success: false, message: 'שגיאה בשרת.' });
        }
      } else {
        res.status(200).json({ success: false, message: 'התנתק' });
      }
    } catch (error) {
      console.error('שגיאה בבדיקת הטוקן:', error);
      // טיפול בשגיאה - נסיון חוזר או פעולות נוספות
      res.status(500).json({ success: false, message: 'שגיאה בבדיקת הטוקן.' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'שגיאה בשרת.' });
  } finally {
    // אחרי שסיימת להשתמש בחיבור, החזר אותו לבריכת החיבורים
    pool.putConnection(connection)
  }
}

try {
  // הפעל את הפונקציה לבדוק ולעדכן את הטוקנים
  setInterval(checkTokens, TIMER_TOKEN * 1000); // 60,000 מילי-שניות = 60 שניות
} catch (error) {
  console.log('setInterval(checkTokens, TIMER_TOKEN * 1000)')
}
// ------------------------------------------------------

module.exports = {
    performDatabaseOperations,
    generateTokenAndSave,
    ScanAndRemoveTokens,
    checkTimerTokens
}