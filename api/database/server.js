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
        if (connection) {
          return connection
        } else {
          throw new ConnectionPoolMalfunctionException('תקלה בקבלת החיבור', this)
        }
      } catch (error) {
        console.error('שגיאה בפונקציה getConnection:')

      }
    }  

    async putConnection(connection) {
      try {
          await this.closeConnection(connection);
          this.replaceFailedConnection()
      } catch (err) {
      if (this.connections.length < MAX_CONNECTIONS) {
          new ConnectionPoolMalfunctionException('תקלה בפתיחת החיבור', this)
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
        }
        //  else if (this.connections.length < MAX_CONNECTIONS) {
        //   this.newCreateConnection()   
        // }
        while (this.connections.length < MAX_CONNECTIONS) {
          this.newCreateConnection()  
        }
    }
    newCreateConnection() {
      if (this.connections.length < MAX_CONNECTIONS) {
        // // יצירת חיבור חדש
        const newConnection = this.createConnection();

        // // הוספת החיבור החדש למערך החיבורים
        this.connections.push(newConnection)          
      }
    }

    async closeConnection(connection) {
      return new Promise(async (resolve, reject) => {
          connection.end(async err => {
              try {
                  if (err) {
                    console.error('closeConnection err: ',this.connections.length)
                      // יצירת השגיאה עם מידע נוסף
                      const error = new ConnectionPoolMalfunctionException('error close Connection - Exception', this)
                      reject(error)
                  } else {
                      // החיבור הושלם בהצלחה
                      resolve();
                  }
              } catch (err) {
                const error = new ConnectionPoolMalfunctionException('תקלה בסגירת החיבור', this)
                reject(error);
              }
          });
      });
    }

    async closeAllConnections() {
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
    constructor(message, fun) {
      super(message,fun);

        // console.log('---------------------------------------------------------------------------------------------------------------------')
        console.log(message)

        while (fun.connections.length < MAX_CONNECTIONS) {
          // // יצירת חיבור חדש
          // console.log('יצירת חיבור חדש:');
          const newConnection = fun.createConnection();

          // // הוספת החיבור החדש למערך החיבורים
          fun.connections.push(newConnection)          
        }

        // console.log('---------------------------------------------------------------------------------------------------------------------')
    }
}

