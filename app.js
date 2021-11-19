import compression from 'compression'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import express from 'express'
import mongoSanitize from 'express-mongo-sanitize'
import rateLimit from 'express-rate-limit'
import helmet from 'helmet'
import hpp from 'hpp'
import morgan from 'morgan'
//import ipfilter from 'express-ipfilter'
// import  fs from 'fs'
import path from 'path'
import xss from 'xss-clean'
import globalErrorHandler from './controllers/errorController.js'
import generalRouter from './routes/generalRoutes.js'
import publiRouter from './routes/publiRoutes.js'
import userRouter from './routes/userRoutes.js'
import AppError from './utils/appError.js'

// Start express app
const app = express()

// app.enable('trust proxy')
// const __dirname = path.resolve()

// 1) GLOBAL MIDDLEWARES
app.use(cors())

// Allow the following IPs : 'https://udex.app' => 'https://177.153.50.90' / LocalComputer : '189.6.214.17'
// const ips = ['177.153.50.90', '189.6.214.17']
// app.use(ipfilter(ips))

// Access-Control-Allow-Origin *
// 177.153.50.9 // 189.6.214.17
// 'https://www.udex.app',  'https://udex.app/#/', 'https://udex.web10f69.kinghost.net','https://189.6.214.17'
//app.use(cors({ origin: ['https://udex.app'] }))

// app.options('/api/v1/tours/:id', cors())

//app.options('*', cors()) // allow complex requests - put, patch, delete -> uses preflight request - OPTION

// Serving static files

const __dirname = path.resolve();
console.log('App dirname : ', __dirname)

//  /home/api-pesquisajus/apps_nodejs
//  /home/api-pesquisajus/www/public/tjrs
app.use(express.static(path.join(__dirname, 'public')))

// Set security HTTP headers
app.use(helmet())

// Development logging
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'))
}

if (process.env.NODE_ENV === 'production') {
    app.use(morgan('dev'))
}

// Limit requests from same API
const limiter = rateLimit({
    max: 100000,
    windowMs: 60 * 60 * 1000,
    message: 'Too many requests from this IP, please try again in an hour!',
})
app.use('/', limiter)

// // Stripe webhook, BEFORE body-parser, because stripe needs the body as stream
// app.post(
//   '/webhook-checkout',
//   bodyParser.raw({ type: 'application/json' }),
//   bookingController.webhookCheckout
// );

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '50mb' }))
// app.use(express.urlencoded({ limit: '50mb' }))
app.use(express.urlencoded({ extended: true, limit: '50mb' }))

app.use(cookieParser())

// Data sanitization against NoSQL query injection
app.use(mongoSanitize())

// Data sanitization against XSS
app.use(xss())

// Prevent parameter pollution
app.use(hpp())

// app.use(
//   hpp({
//     whitelist: [
//       'duration',
//       'ratingsQuantity',
//       'ratingsAverage',
//       'maxGroupSize',
//       'difficulty',
//       'price'
//     ]
//   })
// );

app.use(compression())

// Test middleware
app.use((req, res, next) => {
    req.requestTime = new Date().toISOString()
    // console.log(req.cookies);
    // console.log('Passou pelo middleware : ', new Date().toISOString());
    next()
})

// 3) ROUTES
app.use('/v1/geral', generalRouter)
app.use('/v1/users', userRouter)
//app.use('/v1/processo', procRouter)
app.use('/v1/publicacao', publiRouter)

app.all('*', (req, res, next) => {
    next(new AppError(`Erro no servidor - 404 - Url ${req.originalUrl} não encontrada`, 404))
})

app.use(globalErrorHandler)

export default app
