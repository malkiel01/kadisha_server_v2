
class ConnectionPoolMalfunctionException extends Error {
    constructor(message, ConnectionPool) {
      super(message, ConnectionPool)

        console.log('---------------------------------------------------------------------------------------------------------------------')
        console.log(message)

            if (ConnectionPool.connections.length < ConnectionPool.MAX_CONNECTIONS) {
              // יצירת חיבור חדש
              console.log('יצירת חיבור חדש:');
              const newConnection = ConnectionPool.createConnection();
              // הוספת החיבור החדש למערך החיבורים
              ConnectionPool.connections.push(newConnection);
              
            }

        console.log('---------------------------------------------------------------------------------------------------------------------')
    }
}

module.exports = {
    ConnectionPoolMalfunctionException
}

// module.exports = {
//     ConnectionPoolMalfunctionException
// }







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
