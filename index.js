const http = require('http')
const port = 3001

const app = require('./app')

// app.post('/connection/login', (req, res) => {
//   // הגוף של הפונקציה שמטפלת בבקשה
//   console.log('3456776543');
// });

// app.listen(port, () => {
//   console.log(`Server listening at http://localhost:${port}`);
// });



const server = http.createServer(app)

server.listen(port)

