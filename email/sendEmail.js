'use strict'
import dotenv from 'dotenv'
import nodemailer from 'nodemailer'

dotenv.config()

let user = process.env.EMAIL_USER
let pass = process.env.EMAIL_PASS

// create reusable transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
    host: 'smtp-vip.kinghost.net',
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
        user,
        pass,
    },
})

// Do manual do Nodemailer:
// let info = await transporter.sendMail({
//     from: '"Fred Foo 👻" <foo@example.com>', // sender address
//     to: "bar@example.com, baz@example.com", // list of receivers
//     subject: "Hello ✔", // Subject line
//     text: "Hello world?", // plain text body
//     html: "<b>Hello world?</b>", // html body
// });

// sendEmail(to, from, subject, text, htmlConfirmLink, url)
// async..await is not allowed in global scope, must use a wrapper

const sendEmail = async (to, from, subject, text, html) => {
    console.log("Dentro do sendEmail")
    console.log('to      :', to)
    console.log('from    :', from)
    console.log('subject :', subject)
    console.log('text    :', text)
    try {
        let info = await transporter.sendMail({
            to: to,
            from: from,
            subject: subject,
            text: text,
            html: html,
        })
        console.log('Message sent: %s', info.messageId)
    } catch {
        console.log(error)
    }

}

export default sendEmail
