import express from 'express'
import {
    changePassword, confirmEmail, login, logout, protect, register, resetPassword, sendResetEmailLink, sendResetPasswordLink
} from './../controllers/authController.js'
import { getProcessos, gravaProcessos } from './../controllers/procController.js'
import { getAllUsers, getOneUser } from './../controllers/userController.js'


const userRoutes = express.Router()

// Unprotected Routes 
userRoutes.post('/register', register);
userRoutes.post('/login', login);
userRoutes.post('/sendresetpasswordLink/', sendResetPasswordLink);
userRoutes.post('/sendresetemailLink/', sendResetEmailLink);
userRoutes.post('/logout', logout)

// Protege todas as rotas a partir deste Middleware
userRoutes.use(protect);

userRoutes.route('/oneuser').get(getOneUser);
userRoutes.post('/confirmemail', confirmEmail);
userRoutes.post('/changepassword', changePassword);
userRoutes.post('/resetpassword/', resetPassword);

userRoutes.get('/getprocessos', getProcessos);
userRoutes.post('/gravaprocessos', gravaProcessos);

// userController - Admin only
userRoutes.route('/allusers').get(getAllUsers);


export default userRoutes

//  Protect all routes after this middleware
//  router.use(protect)
//  Protected routes - after user login
//  router.post('/users/profile', userProfile)
//  Restrict all routes after this middleware
//  router.use(restrictTo(['user','premium','master','admin']));
//  Admin only
//  router.patch('/updateMyPassword', updateMyPassword)
// router.patch(
//   '/updateMe',
//   userController.uploadUserPhoto,
//   userController.resizeUserPhoto,
//   userController.updateMe
// );
// router.delete('/deleteMe', userController.deleteMe)
// router.use(restrictTo(['user','premium','master','admin']))
// router.route('/').get(getAllUsers)
// .post(userController.createUser);
//  router.route('/:id').get(getOneUser)
// .patch(userController.updateUser)
// .delete(userController.deleteUser);

// const multer = require('multer')
// const diretorio = '../www/public/dados/tjrs'
// const storage = multer.diskStorage({
//     destination: (re, file, cb) => {
//       cb(null, diretorio)
//     },
//     filename: (req, file, cb) => {
//       const { originalname } = file
//       cb(null, originalname)
//     },
//   })
//   const upload = multer({ storage })
