const mysql = require('mysql')


const DATABASE_URL = process.env.HOST;
const USERNAME = process.env.USER;
const PASSWORD = process.env.PASSWORD;
const DATABASE_NAME = process.env.DATABASE;
const MAX_CONNECTIONS = 5;

class ConnectionPool {
    constructor() {
      this.connections = new Array(MAX_CONNECTIONS).fill().map(() => this.createConnection())
    }
  

    createConnection() {
      try {
            return mysql.createConnection({
              host: "mbe-plus.com",
              user: "mbeplusc_test",
              password: "Gxfv16be",
              database:  "mbeplusc_kadisha_v1",
              timezone: 'UTC',
              timeout: 60000 // 60 שניות - דוגמה להגדרה של תקורת זמן ארוכה יותר
        })
      } catch (error) {
        console.error('שגיאה ביצירת חיבור:')
      }
  }

    async getConnection() {
      console.log('getConnection: ',this.connections.length)
      try {
        const connection = this.connections.shift()
        if (this.connections.length < ( MAX_CONNECTIONS - 1)) {
          console.log('rr hii');
          const connectionDetails = {
            host: connection.config.host,
            user: connection.config.user,
            database: connection.config.database
        };
          new ConnectionPoolMalfunctionException('error get Connection - Exception', connectionDetails, this)
        }
        

        if (connection) {
          return connection;
        } else {
          console.log('yyyy');
          // throw new ConnectionPoolMalfunctionException('No available connections in the pool!');
        }
      } catch (error) {
        console.error('שגיאה בפונקציה getConnection:')

      }
    }  

    async putConnection(connection) {
      try {
          await this.closeConnection(connection);
          this.replaceFailedConnection();
          console.log(this.connections.map(c => c.state))
          console.log(this.connections.length);
      } catch (err) {
      if (this.connections.length > MAX_CONNECTIONS) {
          // הוספת פרטי החיבור לשגיאה
          const connectionDetails = {
            host: connection.config.host,
            user: connection.config.user,
            database: connection.config.database
          }
          new ConnectionPoolMalfunctionException('תקלה בפתיחת החיבור', connectionDetails, this)
        }
      }
  }
    replaceFailedConnection() {
      // מצא את החיבור שנכשל
      const failedConnectionIndex = this.connections.findIndex(connection => !connection._protocol);

      if (failedConnectionIndex !== -1) {
          // סגור את החיבור הישן
          const failedConnection = this.connections.splice(failedConnectionIndex, 1)[0];
          this.closeConnection(failedConnection);

          // יצירת חיבור חדש
          const newConnection = this.createConnection();
          this.connections.push(newConnection);

          console.log('מספר החיבורים לאחר החלפה:', this.connections.length);
      } else {
          this.connections.push(this.createConnection())
          // console.error('לא נמצא חיבור להחלפה.');
      }


      if (this.connections.length < MAX_CONNECTIONS) {
        // הוספת פרטי החיבור לשגיאה
        const connectionDetails = {
          host: connection.config.host,
          user: connection.config.user,
          database: connection.config.database
        }
        new ConnectionPoolMalfunctionException('חוסר במלאי החיבורים', connectionDetails, this)
      }
  }

async closeConnection(connection) {
  return new Promise(async (resolve, reject) => {
      connection.end(async err => {
          try {
              if (err) {
                console.error('closeConnection err: ',this.connections.length)

                //   // הוספת פרטי החיבור לשגיאה
                  const connectionDetails = {
                      host: connection.config.host,
                      user: connection.config.user,
                      database: connection.config.database
                  };

                  // יצירת השגיאה עם מידע נוסף
                  const error = new ConnectionPoolMalfunctionException('error close Connection - Exception', connectionDetails, this)
                  reject(error)
              } else {
                  // החיבור הושלם בהצלחה
                  resolve();
              }
          } catch (err) {

            // הוספת פרטי החיבור לשגיאה
            const connectionDetails = {
                host: connection.config.host,
                user: connection.config.user,
                database: connection.config.database
            };

            const error = new ConnectionPoolMalfunctionException('תקלה בסגירת החיבור', connectionDetails, this)
            reject(error);
          }
      });
  });
}

    async closeAllConnections() {
      // console.log('closeAllConnections')
      for (const connection of this.connections) {
        try {
          await new Promise((resolve, reject) => {
            connection.end(err => {
              if (err) {
                reject(new ConnectionPoolMalfunctionException(err.message));
              } else {
                resolve();
              }
            });
          });
        } catch (err) {
          throw new ConnectionPoolMalfunctionException(err.message);
        }
      }
      this.connections.length = 0;
    }
  
    static getInstance() {
      if (!this.instance) {
        this.instance = new ConnectionPool()
      }
      return this.instance;
    }
  }
  
  module.exports = ConnectionPool;
  



  class ConnectionPoolMalfunctionException extends Error {
    constructor(message, connectionDetails, fun) {
      super(message,fun);
        // this.name = 'ConnectionPoolMalfunctionException';

        // הוספת מידע נוסף לשגיאה
        this.connectionDetails = connectionDetails;

        console.log('---------------------------------------------------------------------------------------------------------------------')
        // console.log(connectionDetails)
        console.log(message)

            // console.error(`שגיאה בסגירת החיבור: ${JSON.stringify(connectionDetails)}`);

            // // יצירת חיבור חדש
            console.log('יצירת חיבור חדש:');
            const newConnection = fun.createConnection();

            // // הוספת החיבור החדש למערך החיבורים
            fun.connections.push(newConnection);

        console.log('---------------------------------------------------------------------------------------------------------------------')
    }
}





//   class ConnectionPoolMalfunctionException extends Error {
//     constructor(message) {
//         super(message);
//         this.name = 'ConnectionPoolMalfunctionException';
//     }
// }

// function throwConnectionPoolException(message) {
//     throw new ConnectionPoolMalfunctionException(message);
// }

// // שימוש בפונקציה:
// try {
//     // הפעולה או הקוד שבו יכולה להתרחש שגיאה
    // throwConnectionPoolException('No available connections in the pool!');
// } catch (error) {
//     console.error('שגיאה:', error.message);
//     // פעולות נוספות לתפיסת השגיאה, אם יש צורך
// }


// -------------------
// const mysql = require('mysql')
// const { 
//   ConnectionPoolMalfunctionException,
//   RenewedAttemptAtReceivingConnection
// } = require('./errors').default


// const DATABASE_URL = process.env.HOST;
// const USERNAME = process.env.USER;
// const PASSWORD = process.env.PASSWORD;
// const DATABASE_NAME = process.env.DATABASE;
// const MAX_CONNECTIONS = 5


// class ConnectionPool {
//     constructor() {
//       this.connections = new Array(MAX_CONNECTIONS).fill().map(() => this.createConnection())
//     }
  

//     // שלב 1
//     // יצירת חיבור - ללא תלות רשת
//     createConnection() {
//       try {
//             return mysql.createConnection({
//               host: "mbe-plus.com",
//               user: "mbeplusc_test",
//               password: "Gxfv16be",
//               database:  "mbeplusc_kadisha_v1",
//               timezone: 'UTC',
//               timeout: 60000 // 60 שניות - דוגמה להגדרה של תקורת זמן ארוכה יותר
//         })
//       } catch (error) {
//         console.error('שגיאה ביצירת חיבור:')
//       }
//   }


//   // לגישה מבחוץ
//   // קבלת חיבורים
//   // שלב 2
//   async getConnection() {
//     console.log('getConnection: ',this.connections.length)
//     try {
//       const connection = this.connections.shift()

//       if (connection) {
//         return connection
//       }
//     } catch (error) {
//       // לא התקבל חיבור
//       console.log('err getConnection: ',this.connections.length)
//       console.error('אל לבקתה רוביח')
//     }
//   }  

//   // לגישה מבחוץ
//   // החזרת חיבורים וניתוקם
//   // שלב 3
//   async putConnection(connection) {
//     try {
//         await this.closeConnection(connection)
//         this.replaceFailedConnection()
//     } catch (err) {
//     if (this.connections.length < MAX_CONNECTIONS) {
//         new ConnectionPoolMalfunctionException('תקלה בפתיחת החיבור', this)
//       }
//     }
//   }
//   // פנימי בתוך שלב 3
//   // בודק מלאי חיבורים
//   // דרוש בדיקה שלי
//   replaceFailedConnection() {
//     // מצא את החיבור שנכשל
//     const failedConnectionIndex = this.connections.findIndex(connection => !connection._protocol)

//     if (failedConnectionIndex !== -1) {
//         // סגור את החיבור הישן
//         const failedConnection = this.connections.splice(failedConnectionIndex, 1)[0];
//         this.closeConnection(failedConnection);

//         // יצירת חיבור חדש אם חסר במלאי
//         if (this.connections.length < MAX_CONNECTIONS) {
//           const newConnection = this.createConnection()
//           this.connections.push(newConnection)
//           console.log('מספר החיבורים לאחר החלפה:', this.connections.length)
//         }

//     } else {
//       if (this.connections.length < MAX_CONNECTIONS) {
//         this.connections.push(this.createConnection())
//       }
//     }
//   }

//   // פנימי מתוך שלב 3
//   // סוגר את החיבור לפני החזרתו למלאי
//   async closeConnection(connection) {
//     return new Promise(async (resolve, reject) => {
//         connection.end(async err => {
//             try {
//                 // אם לא הצליח לסיים את החיבור מכל סיבה, משלים חיבור כדי שלא ייחסר
//                 if (err) {
//                   let error = err
//                   if (this.connections.length < MAX_CONNECTIONS) {
//                     console.log(err)
//                     error = new ConnectionPoolMalfunctionException('error close Connection - Exception', this)
//                   }
//                     reject(error)
//                 } else {
//                     // החיבור הושלם בהצלחה
//                     resolve();
//                 }
//             } catch (err) {
//               // אם לא הצליח לסיים את החיבור מכל סיבה, משלים חיבור כדי שלא ייחסר
//               let error = err
//               if (this.connections.length < MAX_CONNECTIONS) {
//                 error = ConnectionPoolMalfunctionException('error 2 close Connection - Exception', this)
//               }
//               reject(error);
//             }
//         });
//     });
//   }

//   // קבלת מופע חיבורים
//   // כניסה ראשית 
//   static getInstance() {
//     if (!this.instance) {
//       this.instance = new ConnectionPool()
//     }
//     return this.instance;
//   }
// }
  

// try {
//   // הפעל את הפונקציה לבדוק אם חסרים חיבורים
//   setInterval(() => {
//     if (this.connections.length < MAX_CONNECTIONS) {

//       for (let i = 0; i < (MAX_CONNECTIONS - this.connections.length); i++) {
//         // יצירת חיבור חדש
//         console.log('יצירת חיבור חדש:');
//         const newConnection = this.createConnection();
//         // הוספת החיבור החדש למערך החיבורים
//         this.connections.push(newConnection);
//       }

      
//     }
//   },100_000)
// } catch (error) {
//   console.log('setInterval(checkTokens, TIMER_TOKEN * 1000)')
// }


//   module.exports = ConnectionPool;
  


