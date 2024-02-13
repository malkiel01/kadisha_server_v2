const ConnectionPool = require('../../database/server')
const bcrypt = require('bcrypt');
const { generateTokenAndSave, ScanAndRemoveTokens, 
  checkTimerTokens 
} = require('./tokens')

// התחברות למשתמש קיים במערכת
const login = async (req, res) => {
  const { username, password } = req.body
  const pool = ConnectionPool.getInstance()
  let connection;
  try {
    connection = await pool.getConnection()
    connection.query('SELECT * FROM users WHERE username = ?', [username], async (err, results, fields) => {
      if (!err) {
        if (results.length === 0) {
          res.json({ success: false, message: 'שם המשתמש לא קיים.' });
          return;
        }

        const user = results[0];
        const passwordsMatch = await bcrypt.compare(password, user.password);

        if (!passwordsMatch) {
          res.json({ success: false, message: 'הסיסמה אינה נכונה.' });
          return;
        }

        // אם המשתמש קיים והסיסמה נכונה, אז הכניסה אושרה        
        res.json({
          success: true, message: 'כניסה אושרה.',
          // יצירת טוקן מותאם להרשאת המשתמש, ושליחתו לצד לקוח
          token: await generateTokenAndSave(user.permission),
          permission: user.permission
        });
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

// התחברות למשתמש קיים במערכת
const logout = async (req, res) => ScanAndRemoveTokens({req, res}, req.body.token)

// יצירת משתמש במערכת
const createUser = async (req, res) => {
  const pool = ConnectionPool.getInstance()
  const { username, password } = req.body
  let user = false

  let connection;
  try {
    connection = await pool.getConnection()
    const hashedPassword = await bcrypt.hash(password, 10);

    const sql = `INSERT INTO users( username, password, permission, email) VALUES (?,?,'1','052840@gmail.com')`
    await connection.query(sql, [username, hashedPassword])
    // user = true; // אם היצירה הצליחה
    // user = false // ניתן יהיה להפעלה רק אם נרצה התחברות אוטומטית לאחר הרשמה
    if (user) {
      try {
        await connection.query('SELECT * FROM users WHERE username = ?', [username], async (err, results, fields) => {
          if (!err) {
            if (results.length === 0) {
              res.json({ success: false, message: 'שם המשתמש לא קיים.' });
              return;
            }
    
            const user = results[0];
    
            const passwordsMatch = await bcrypt.compare(password, user.password);
    
            if (!passwordsMatch) {
              res.json({ success: false, message: 'הסיסמה אינה נכונה.' });
              return;
            }
    
            // אם המשתמש קיים והסיסמה נכונה, אז הכניסה אושרה
            res.json({ success: true, message: 'כניסה אושרה.' });
          }
      })
      } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'שגיאה בשרת.' });
      }
    }
  } catch (error) {
    console.error(error)
    user = false; // אם היצירה נכשלה
  } finally {
    if (connection) {
      // אחרי שסיימת להשתמש בחיבור, החזר אותו לבריכת החיבורים
      pool.putConnection(connection)
    }
  }
}
// בדיקת סטטוס חיבור במערכת ועדכון לקוח
const checkTimer = async (req, res) => {
  // console.log(req);
  checkTimerTokens(req, res)
}

module.exports = {
    login,
    logout,
    createUser,
    checkTimer
}