
import express from 'express'

import  { welcomepage, enviaEmailContato } from './../controllers/generalController.js'

const generalRoutes = express.Router()

generalRoutes.get('/welcome', welcomepage)
generalRoutes.post('/enviaemail', enviaEmailContato)

export default generalRoutes
