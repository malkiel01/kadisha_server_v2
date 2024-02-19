const express = require('express')
const cors = require('cors');
const app = express()
app.use(cors());


// Imported
const connectionsRouter = require('./api/routes/connections')
const cemeteriesRouter = require('./api/routes/entities/cemeteries')
const blocksRouter = require('./api/routes/entities/blocks')
const plotsRouter = require('./api/routes/entities/plots')
const areaGravesRouter = require('./api/routes/entities/areaGraves')

const customersRouter = require('./api/routes/entities/customers')
const purchasesRouter = require('./api/routes/entities/purchases')
const burialsRouter = require('./api/routes/entities/burials')

const documentsRouter = require('./api/routes/entities/documents')

// הגדרת גודל מקסימלי לגוף הבקשה ל־50 מגהבייט
app.use(express.json({ limit: '500mb' }));
app.use(express.urlencoded({ limit: '500mb', extended: false }));

// CORS
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*")
    res.header("Access-Control-Allow-Headers", "Origin, X-Requestet-With, Content-Type, Accept, Authorization")
    if (req.method === "OPTIONS") {
        res.header("Access-Control-Allow-Methods", "PUT, POST, PATCH, DELETE, GET")
        return res.status(200).json({})
        
    }
    next()
})

// Router
app.use('/connection', connectionsRouter)
app.use('/api/cemeteries', cemeteriesRouter)
app.use('/api/blocks', blocksRouter)
app.use('/api/plots', plotsRouter)
app.use('/api/areaGraves', areaGravesRouter)

app.use('/api/customers', customersRouter)
app.use('/api/purchases', purchasesRouter)
app.use('/api/burials', burialsRouter)

app.use('/api/documents', documentsRouter)

// Router Error
app.use((req, res, next) => {
    const error = new Error('Not Found')
    console.log(error);
    error.status = 404
    next(error)
})

app.use((error, req, res, next) => {
    res.status(error.status || 500)
    res.json({
        error: {
            message : error.message
        }
    })
    if (error) {
        console.log(error);
    }
})

module.exports = app