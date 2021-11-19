import dotenv from 'dotenv'
import fs from 'fs'
import https from 'https'
import mongoose from 'mongoose'
// const app_host = process.env.APP_HOST
// console.log('Domínio do Servidor : ', app_host)
import app from './app.js'

// process.on('uncaughtException', (err) => {
//   console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...')
//   console.log(err.name, err.message)
//   process.exit(1)
// })

dotenv.config()

const DB = 'mongodb://api-pesquisaju01:api-pesquisaju01-mongodb@mongodb.api-pesquisajus.com.br:27017/api-pesquisaju01'

// process.env.DATABASE

// .replace(
//   '<PASSWORD>',
//   process.env.DATABASE_PASSWORD
// )

// removed useNewUrlParser, useUnifiedTopology, useFindAndModify, and useCreateIndex 

mongoose
    .connect(DB)
    .then(() => console.log('DB connection successful! : ', DB))

const port = process.env.PORT || 3000

https.createServer({
    key: fs.readFileSync('./privkey.pem'),
    cert: fs.readFileSync('./fullchain.pem')
}, app)
    .listen(port, function () {
        console.log(`App running on port ${port}...`)
    })

// const server = app.listen(port, () => {
//   console.log(`App running on port ${port}...`)
// })

process.on('unhandledRejection', (err) => {
    console.log('UNHANDLED REJECTION! 💥 Shutting down...')
    console.log(err.name, err.message)
    server.close(() => {
        process.exit(1)
    })
})

process.on('SIGTERM', () => {
    console.log('👋 SIGTERM RECEIVED. Shutting down gracefully')
    server.close(() => {
        console.log('💥 Process terminated!')
    })
})
