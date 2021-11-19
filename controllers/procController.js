
import asyncHandler from 'express-async-handler'
import User from './../models/userModel.js'
import AppError from './../utils/appError.js'


// Obtem do db a lista de processos do Usuário
export const getProcessos = asyncHandler(async (req, res, next) => {
    //console.log('Entrou no getProcessos !')
    const email = req.email;
    const role = req.role;

    const user = await User.findOne({ email })

    if (!user) {
        return next(new AppError('Usuário não encontrado para este email!', 401))
    }

    let processos
    if (user.processos) {
        processos = user.processos
    } else {
        processos = []
    }

    res.status(200).json({
        status: 'success',
        message: 'Foram enviados os dados dos processos do usuário !',
        data: {
            email,
            processos,
        },
    })
})


// Grava no db a lista de processos do Usuário
export const gravaProcessos = asyncHandler(async (req, res, next) => {
    //console.log('Entrou no procController.gravaProcessos !')
    const email = req.email;
    const role = req.role;

    let user = await User.findOne({ email })

    if (!user) {
        return next(new AppError('Usuário não encontrado para este email!', 401))
    }

    let processos

    if (req.body.processos) {
        processos = req.body.processos
    } else {
        processos = []
    }

    user = await User.findOneAndUpdate({ email }, { processos }, { new: true })

    res.status(200).json({
        status: 'success',
        message: 'Foram gravados os dados dos processos!',
        processos,
        user: {
            email: email,
            processos: processos,
        },
    })
})

export default {
    getProcessos,
    gravaProcessos,
}

// const fs = require('fs')
// const Path = require('path')
// const dotenv = require('dotenv')
// const open = require('fs/promises/open')

    // uploadJson,
    // downloadFile,
    // getPrimeiroUltimoDiario,
    // getTodosOsDiarios,

// Obs: Esta função não está sendo utilizada atualmente!
// Obs: Este código na verdade não recebe o arquivo, apenas envia um resposta - Verificar !!!
// Recebe um arquivo json enviado pelo requisitante.
// const uploadJson = asyncHandler(async (req, res, next) => {
//     res.status(200).json({
//         status: 'success',
//         message: `Arquivo Json enviado`,
//     })
// })

// Obs: Esta função não está sendo utilizada atualmente!
// Envia um arquivo para o requisitante (json, txt, csv ou pdf)
// const downloadFile = asyncHandler(async (req, res, next) => {
//     const email = req.email;
//     const role = req.role;

//     // console.log('req: ', req)

//     const arquivo = req.body.arquivo
//     //const arquivo = 'arquivo'
//     const extensao = req.body.extensao
//     //const extensao = 'csv'

//     const diretorio_dados = '/home/api-pesquisajus/www/public/dados/tjrs/'
//     console.log('--------------------------------------------------')
//     // const nomeArquivo = Path.resolve(__dirname, 'public', (arquivo + '.' + extensao))
//     // const nomeArquivo = Path.resolve('/home/api-pesquisajus/apps_nodejs/public', (arquivo + '.' + extensao))
//     const nomeArquivo = Path.resolve(diretorio_dados, arquivo + '.' + extensao)
//     //const nomeArquivo = Path.resolve('/home/api-pesquisajus/apps_nodejs/', 'public', (arquivo + '.' + extensao))
//     console.log('arquivo1: ', arquivo)
//     console.log('extensao: ', extensao)
//     console.log(' __dirname : ', __dirname)
//     //nomeArquivo = diretorio + arquivo + '.' + extensao
//     console.log('path       : ', Path.resolve(__dirname, '', arquivo + '.' + extensao))
//     console.log('nomeArquivo : ', nomeArquivo)
//     console.log('--------------------------------------------------')

//     fs.access(nomeArquivo, fs.F_OK, (err) => {
//         if (!err) {
//             const file = fs.createReadStream(nomeArquivo)
//             const stat = fs.statSync(nomeArquivo)

//             let MIME_TYPE = 'text/plain'
//             res.setHeader('Content-Length', stat.size)
//             if (extensao === 'pdf') {
//                 MIME_TYPE = 'application/pdf'
//             }
//             if (extensao === 'txt') {
//                 MIME_TYPE = 'text/plain'
//             }
//             if (extensao === 'csv') {
//                 MIME_TYPE = 'text/csv'
//             }
//             if (extensao === 'json') {
//                 MIME_TYPE = 'application/json'
//             }
//             res.setHeader('Content-Type', MIME_TYPE)
//             //res.setHeader('Content-Disposition', 'attachment; filename=arquivo.pdf');
//             file.pipe(res)
//         } else {
//             console.log(err)
//             res.status(500).json({
//                 status: 'fail',
//                 message: `Arquivo ${arquivo + '.' + extensao} não encontrado`,
//             })
//         }
//     })
// })

// // Obs: Esta função não está sendo utilizada atualmente!
// // Obtem a data do primeiro e do ultimo registro do db
// const getPrimeiroUltimoDiario = asyncHandler(async (req, res, next) => {
//     console.log('Entrou no getPrimeiroUltimoDiario !')

//     // console.log('Diario: ', Diario)

//     const primeiroDiario = await Diario.find({}).sort({ diario: 1 }).limit(1) //   db.getCollection('diarios').find({})
//     //Diario.find({}) // .sort({ diario: 1}).limit(1)

//     const ultimoDiario = await Diario.find({}).sort({ diario: -1 }).limit(1)

//     console.log('primeiroDiario ', primeiroDiario)
//     console.log('ultimoDiario ', ultimoDiario)

//     let dataPrimeiroDiario = '00/00/0000'
//     let dataUltimoDiario = '00/00/0000'
//     if (primeiroDiario) {
//         dataPrimeiroDiario = primeiroDiario[0].dia + '/' + primeiroDiario[0].mes + '/' + primeiroDiario[0].ano
//     }

//     if (ultimoDiario) {
//         dataUltimoDiario = ultimoDiario[0].dia + '/' + ultimoDiario[0].mes + '/' + ultimoDiario[0].ano
//     }

//     res.status(200).json({
//         status: 'success',
//         message: `Periodo dos Dados: ${dataPrimeiroDiario} a ${dataUltimoDiario}`,
//         data: {
//             dataPrimeiroDiario,
//             dataUltimoDiario,
//         },
//     })
// })


// // Obs: Esta função não está sendo utilizada atualmente!
// // Obtem uma lista de todos os diarios gravados no db
// const getTodosOsDiarios = asyncHandler(async (req, res, next) => {
//     console.log('Entrou no getTodosOsDiarios !')
//     const diarios = await Diario.find({}).sort({ diario: -1 }) //   db.getCollection('diarios').find({})
//     console.log('diarios ', diarios)

//     res.status(200).json({
//         status: 'success',
//         message: `Lista dos Diarios`,
//         data: {
//             diarios,
//         },
//     })
// })