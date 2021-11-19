import asyncHandler from 'express-async-handler'
import User from './../models/userModel.js'
import AppError from './../utils/appError.js'

// Rota: '/v1/processo/oneuser'
export const getOneUser = asyncHandler(async (req, res, next) => {
    console.log('entrou no user.getOneUser')

    const email = req.email;
    const role = req.role;

    // console.log('email: ', email)
    // console.log('role: ', role)

    let query = User.findOne({ email: email })
    const user = await query
    if (!user) {
        return next(new AppError(`Usuário não encontrado para este email ${email}`, 404))
    }

    console.log('user: ', user)

    res.status(200).json({
        status: 'success',
        user: {
            name: user.name,
            email: user.email,
            role: user.role,
            isConfirmeduser: user.isConfirmedUser,
            processos: user.processos ?? [],
        },
    })
})

// Rota: '/v1/processo/allusers'
export const getAllUsers = asyncHandler(async (req, res, next) => {
    console.log('entrou no user.getAllUsers')
    let query = User.find({})
    const user = await query
    res.status(200).json({
        status: 'success',
        users: user,
    })
})

export default { getOneUser, getAllUsers }


    // // let token
    // // if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    // //     token = req.headers.authorization.split(' ')[1]
    // // }

    // // if (!token) {
    // //     return next(new AppError('O token de autorização não é válido!', 401))
    // // }

    // // const decoded = verifyToken(token, next) //Synchronous
    // // const email = decoded.email

    // // if (!email) {
    // //     return next(new AppError('O email do usuário não foi fornecido!', 400))
    // // }

    // // const user = await User.findOne({ email })

    // // if (!user) {
    // //     return next(new AppError('Usuário não encontrado para este email!', 401))
    // // }


// const { uploadUserPhoto, resizeUserPhoto } = require('./../utils/uploadUserPhoto.js')

// // @desc    Auth user & get token
// // @route   POST /api/users/login
// // @access  Public
// const getMe = (req, res, next) => {
//     console.log(req.params)
//     //req.params.email = req.user.email
//     next()
// }

// const updateMe = asyncHandler(async (req, res, next) => {
//     // 1) Create error if user POSTs password data
//     if (req.body.password || req.body.passwordConfirm) {
//         return next(new AppError('This route is not for password updates. Please use /updateMyPassword.', 400))
//     }

//     // 2) Filtered out unwanted fields names that are not allowed to be updated
//     const filteredBody = filterObj(req.body, 'name', 'email')
//     if (req.file) filteredBody.photo = req.file.filename

//     // 3) Update user document
//     const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
//         new: true,
//         runValidators: true,
//     })

//     res.status(200).json({
//         status: 'success',
//         data: {
//             user: updatedUser,
//         },
//     })
// })

// const deleteMe = asyncHandler(async (req, res, next) => {
//     await User.findByIdAndUpdate(req.user.id, { active: false })

//     res.status(204).json({
//         status: 'success',
//         data: null,
//     })
// })

// const createUser = (req, res) => {
//     res.status(500).json({
//         status: 'error',
//         message: 'This route is not defined! Please use /signup instead',
//     })
// }




// const filterObj = (obj, ...allowedFields) => {
//   const newObj = {};
//   Object.keys(obj).forEach(el => {
//     if (allowedFields.includes(el)) newObj[el] = obj[el];
//   });
//   return newObj;
// };

// "user": {
//   "photo": "default.jpg",
//   "role": "user",
//   "isConfirmedUser": true,
//   "processos": [],
//   "_id": "60fb17e1feacf9db9fd2c711",
//   "name": "chsnani@gmail.com",
//   "email": "chsnani@gmail.com",
//   "password": "$2a$12$TNFt3VAgJWOhZDqydO.e.OIVl/Kr6fqPc2VTRZ1y0i2zShVVK7Dk.",
//   "tokenEmailConfirm": "",
//   "createdAt": "2021-07-23T19:26:25.579Z",
//   "updatedAt": "2021-07-23T21:19:29.764Z",
//   "__v": 0,
//   "token": "eyJhbGciOiJSUzUxMiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImNoc25hbmlAZ21haWwuY29tIiwicm9sZSI6InVzZXIiLCJpYXQiOjE2MjcwNzUxNjksImV4cCI6MTYyNzkzOTE2OX0.fqI1vm1c-VcKURASgTqTtvaMbgULFSx2m9SsoGo7ldT8W8yKApUGBPsxUej5xa4PDhl1yXr98XUrpA2nHlMaTkfKqJAiZdAPJuMXFKZZj_aeIxchPNcPENKAoq47OIuKdlNKCWfL8Kjp8u7fv0Z6qUw6bkYSOTDRY3TZYXf5bYRs3wxx8p3PO_W-se1L3a3WKXCE3gRBh0eS5d4OaKjWlFo_0MPV5QEqXszWA7q261Yfva-rYetqA8J_YoqG1W8XwgQw8FFFMnMZgvRWm3Yf_FAKCWVuR77Mig2JsbaZSFpkQMy9fB93B9iUOhsDHuwMOFvi5skOKIIYUGD67S-gfQ"
// }
