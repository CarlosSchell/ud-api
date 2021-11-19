import asyncHandler from 'express-async-handler';
import sendEmail from '../email/sendEmail.js';

export const welcomepage = (req, res, next) => {
    res.status(200).json({
        status: 'success',
        message: 'Api do Udex! - Versao - 13 de Novembro de 2021- 14:00hs',
    })
}

export const enviaEmailContato = asyncHandler(async (req, res, next) => {

    const { name, email, message } = req.body

    const from = 'contato@udex.app'
    const to = 'contato@udex.app'
    const subject = 'Contato de ' + name + ' - ' + email
    const text = subject + '//n' + message
    const html = message

    await sendEmail(to, from, subject, text, html).catch(console.error)

    res.status(201).json({
        status: 'success',
        message: 'O email de contato foi enviado!',
        user: {
            name,
            email,
            message,
        },
    })
})

export default {
    welcomepage,
    enviaEmailContato,
}
