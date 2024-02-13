const mysql = require('mysql')
const { 
  ConnectionPoolMalfunctionException,
  RenewedAttemptAtReceivingConnection
} = require('./errors')


const DATABASE_URL = process.env.HOST;
const USERNAME = process.env.USER;
const PASSWORD = process.env.PASSWORD;
const DATABASE_NAME = process.env.DATABASE;
const MAX_CONNECTIONS = 5


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
        if (this.connections.length > ( MAX_CONNECTIONS - 1)) {
          console.log('high: ', this.connections.length - ( MAX_CONNECTIONS - 1))
          for (let i = 0; i < (this.connections.length - ( MAX_CONNECTIONS - 1)); i++) {
            this.connections.shift()  
          }
        }

        if (connection) {
          return connection
        }
      } catch (error) {
        console.error('שגיאה בפונקציה getConnection:')


      }
    }  

    async putConnection(connection) {
      try {
          await this.closeConnection(connection);
          this.replaceFailedConnection();
          // console.log(this.connections.map(c => c.state), this.connections.length)
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
      } else {
          this.connections.push(this.createConnection())
          // console.error('לא נמצא חיבור להחלפה.');
      }


      // if (this.connections.length < MAX_CONNECTIONS) {
      //   new ConnectionPoolMalfunctionException('חוסר במלאי החיבורים', this)
      // }
  }

async closeConnection(connection) {
  return new Promise(async (resolve, reject) => {
      connection.end(async err => {
          try {
              if (err) {
                console.error('closeConnection err: ',this.connections.length)

                let error = err
                if (this.connections.length < MAX_CONNECTIONS) {
                  // הוספת פרטי החיבור לשגיאה
                  const connectionDetails = {
                    host: connection.config.host,
                    user: connection.config.user,
                    database: connection.config.database
                  }
                  error = new ConnectionPoolMalfunctionException('error close Connection - Exception', this)
                }
                  reject(error)
              } else {
                  // החיבור הושלם בהצלחה
                  resolve();
              }
          } catch (err) {
            let error = err
            if (this.connections.length < MAX_CONNECTIONS) {
              error = ConnectionPoolMalfunctionException('error 2 close Connection - Exception', this)
            }
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
  


