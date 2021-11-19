import dotenv from 'dotenv'
import asyncHandler from 'express-async-handler'
import sendEmail from '../email/sendEmail.js'
import signTokenShortConfirm from '../utils/signTokenShortConfirm.js'
import User from './../models/userModel.js'
import AppError from './../utils/appError.js'
import signToken from './../utils/signToken.js'
import verifyToken from './../utils/verifyToken.js'

dotenv.config()

// register user - send html with email confirm request
export const register = asyncHandler(async (req, res, next) => {
    let { email, name, role } = req.body
    if (!role) {
        role = 'user'
        req.body.role = 'user'
    }

    if (!name) {
        name = email.split('@')[0]
        req.body.name = email.split('@')[0]
    }

    const userExists = await User.findOne({ email })
    if (userExists) {
        return next(new AppError('Email já cadastrado!', 400))
    }

    /// Atenção tokenEmailConfirm não é o user token !!!!
    const tokenEmailConfirm = signTokenShortConfirm({ email, role }, next)

    //console.log('tokenEmailConfirm', tokenEmailConfirm)

    const user = await User.create({
        name,
        email,
        role,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm,
        processos: [],
        isLoggedInUser: false,
        isConfirmedUser: false,
        tokenEmailConfirm,
    })

    if (!user) {
        return next(new AppError('Erro ao gravar o novo usuário', 500))
    }

    // Sends email html confirmation request
    const hostFrontend = 'udex.app/#'
    const url = `${req.protocol}://${hostFrontend}/confirmemail/${tokenEmailConfirm}`
    const to = user.email
    const from = `Contato <${process.env.EMAIL_USER}>` // 'contato@pesquisajus.com'
    const subject = 'Bem vindo ao Udex! - Por favor confirme o seu email - ref: ' + tokenEmailConfirm.substr(-5)
    const text = ''

    const htmlConfirmLink = `<div style="text-align:center; font-weigth: 500; line-height:1.2; color: #5a5a5a; font-family: Montserrat, -apple-system, system-ui, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;', 'Courier New', monospace;">
      <p style="font-size: 1.6rem;"> Olá <strong>${user.name}</strong>!</p>
      <p style="font-size: 1.6rem;">Bem vindo ao Udex!</p>
      <p style="font-size: 1.2rem;">Clique no link abaixo para confirmar o seu email!</p>
      <button style="color:black; font-size:1.2rem;  background-color:#492d7d; padding:10px 15px; border-radius: 4px;"><a style="color:white; text-decoration:none;";  href="${url}">Confirmar E-mail</a></button>
      <p style="font-size: 1.2rem;">Ou, se preferir, copie e cole o link abaixo no navegador:</p>
      <p style="font-size: 1.0rem;"></p>${url}</p>
      <hr>
      <p style="font-size: 1.2rem;">Por favor ignore esta mensagem, caso voce não tenha solicitado este email</p>
    </div>`

    await sendEmail(to, from, subject, text, htmlConfirmLink)

    user.password = undefined

    res.status(201).json({
        status: 'success',
        message: 'O link para confirmação da conta foi enviado para o seu email',
        user: {
            name: user.name,
            email: user.email,
            role: user.role,
        },
    })
})

//Confirms user email in initial registration
export const confirmEmail = asyncHandler(async (req, res, next) => {
    console.log('Entrou no confirmEmail !')

    let token
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1]
    }

    if (!token) {
        return next(new AppError('O token de autorização não é válido!', 401))
    }

    const decoded = verifyToken(token, next) //Synchronous

    const email = decoded.email
    if (!email) {
        return next(new AppError('O email do usuário não foi fornecido no Token!', 400))
    }

    let role = decoded.role;
    if (!role) {
        role = 'user'
    }

    const user = await User.findOne({ email })

    if (!user) {
        return next(new AppError(`Usuário não encontrado para este email ${email}`, 404))
    }

    if (user.isConfirmedUser) {
        return next(new AppError(`Este email já foi confirmado: ${email}`, 404))
    }

    if (token !== user.tokenEmailConfirm) {
        console.log('Token : ', token)
        console.log('tokenEmailConfirm : ', user.tokenEmailConfirm)
        return next(new AppError('Token de autorização não válido! Solicite novo link de confirmação!', 404))
    }

    user.isConfirmedUser = true
    user.tokenEmailConfirm = ''
    await user.save()

    res.status(200).json({
        status: 'success',
        message: 'O email do usuário foi confirmado!',
        user: {
            email: user.email,
        },
    })
})

// receives password change request from external password reset link and confirms it into db
export const resetPassword = asyncHandler(async (req, res, next) => {
    console.log('Entrou no resetPassword !')

    const email = req.email;
    let role = req.role;
    if (!role) {
        role = 'user'
        req.body.role = 'user'
    }

    const user = await User.findOne({ email })

    if (!user) {
        return next(new AppError(`Usuário não encontrado para este email ${email}`, 404))
    }

    const password = req.body.password ?? 'xxxx';
    const passwordConfirm = req.body.passwordConfirm ?? 'zzzz';

    user.password = password;
    user.passwordConfirm = passwordConfirm;
    await user.save();

    //console.log('A senha do usuário foi alterada!')

    res.status(200).json({
        status: 'success',
        message: 'Sua nova senha foi atualizada!',
        user: {
            email: user.email,
        },
    });
});

// receives password change request and confirms it into db
export const changePassword = asyncHandler(async (req, res, next) => {
    const email = req.email;
    const password = req.body.password ?? 'xxxx';
    const passwordConfirm = req.body.passwordConfirm ?? 'zzzz';

    const user = await User.findOne({ email });

    if (!user) {
        return next(new AppError(`Usuário não encontrado para este email ${email}`, 404));
    }

    user.password = password;
    user.passwordConfirm = passwordConfirm;

    await user.save();

    res.status(200).json({
        status: 'success',
        message: 'Sua nova senha foi atualizada!',
        user: {
            email: user.email,
        },
    });
});

//
export const login = asyncHandler(async (req, res, next) => {
    const { email, password } = req.body
    if (!email || !password) {
        return next(new AppError('Por favor entre com o email e a senha!', 400))
    }

    const user = await User.findOne({ email })

    if (!user || !(await user.matchPassword(password, user.password))) {
        return next(new AppError('O email ou a senha estão incorretos !', 401))
    }

    const role = user.role ?? 'user';
    const userName = user.name ?? 'Usuário';
    const processos = user.processos ?? [];

    if (user.isConfirmedUser === false) {
        return next(new AppError('Voce ainda não confirmou a sua conta!. Verifique a sua caixa de email!', 401))
    }
    const isConfirmedUser = true

    if (isConfirmedUser === false) {

    }
    const token = signToken({ email, role }, next)

    // Temporário: Grava o token no registro do usuário !ele.
    const data = await User.findOneAndUpdate({ email }, { token, isConfirmedUser }, { new: true })
    if (!data) {
        return next(new AppError('Erro ao gravar o login do usuário', 500))
    }
    //console.log(data);
    //-----

    res.status(201).json({
        status: 'success',
        message: 'O login foi bem sucedido !',
        data: {
            name: userName,
            email: email,
            role: role,
            token: token,
            processos: processos,
        },
    })
})

////
export const logout = (req, res) => {
    // res.cookie('jwt', 'loggedout', {
    //   expires: new Date(Date.now() + 10 * 1000),
    //   httpOnly: true,
    // })
    // isLoggedInUser = false
    res.status(200).json({ status: 'success' })

    // acessar user database e setar flags
}


// middleware de proteção de rotas - baseado apenas no Bearer Token - não valida o usuário no db.
export const protect = asyncHandler(async (req, res, next) => {
    console.log('Entrou no auth.protect');

    let token
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1]
    }

    if (!token) {
        return next(new AppError('O token de autorização não é válido!', 401))
    }

    const decoded = verifyToken(token, next) //Synchronous

    const email = decoded.email
    if (!email) {
        return next(new AppError('O email do usuário não foi fornecido no Token!', 400))
    }

    let role = decoded.role;
    if (!role) {
        role = 'user'
        //return next(new AppError('Protect: O tipo do usuário não foi fornecido no Token!', 400))
    }

    // const user = await User.findOne({ email })

    // if (!user) {
    //     return next(new AppError('Usuário não encontrado para este email!', 401))
    // }


    // 4) Put extracted token data in the req (not in the body !!!)
    req.email = email;
    req.role = role;

    // console.log('Inside protect : req.email : ', req.email);
    // console.log('Inside protect : req.role  : ', req.role);

    // 5) Grant access to protected route.
    // req.user = currentUser;
    // res.locals.user = currentUser;

    // console.log('req.user : ', req.user);
    // console.log('res.locals.user : ', res.locals.user);

    next();
});

//
export const restrictTo = (roles) => {
    console.log(roles)

    return (req, res, next) => {
        // roles ['admin', 'master']
        //console.log(req.role)

        if (!roles.includes(req.role)) {
            // console.log((roles.includes(req.role)))

            return next(new AppError('You do not have permission to perform this action', 403))

            // Alternative Error Handling
            // res.status(403).json({
            //   status: 'fail',
            //   message: 'Voce não tem permissão para fazer esta operação',
            //   role: req.role
            // })
        }

        next()
    }
}

//sendResetEmailLink envia email para o usuário fazer confirmação do seu email
export const sendResetEmailLink = asyncHandler(async (req, res, next) => {
    //console.log('Entrou no sendResetEmailLink');

    const email = req.body.email;

    const user = await User.findOne({ email })
    if (!user) {
        return next(new AppError('Não foi encontrado usuário para este endereço de email!', 404))
    }

    // Verify if the User  isConfirmedUser
    if (user.isConfirmedUser === true) {
        return next(new AppError('O email do usuário já foi confirmado!', 404))
    }

    if (user.isConfirmedUser !== true) {
        // 2) Generate the reset token
        // Atenção tokenEmailConfirm não é o user token !!!!

        const role = user.role ?? 'user';

        const tokenEmailConfirm = signTokenShortConfirm({ email, role }, next)

        user.tokenEmailConfirm = tokenEmailConfirm
        user.save()

        // envia email com o link para reset password
        const hostFrontend = 'udex.app/#'
        const url = `${req.protocol}://${hostFrontend}/confirmemail/${tokenEmailConfirm}`

        const to = user.email
        const from = `Contato <${process.env.EMAIL_USER}>` // 'contato@pesquisajus.com'
        const subject = 'Udex - Confirmação de Email - Por favor confirme o link - ref: ' + tokenEmailConfirm.substr(-5)
        const text = ''

        const htmlConfirmLink = `<div style="text-align:center; font-weigth: 500; line-height:1.2; color: #5a5a5a; font-family: Montserrat, -apple-system, system-ui, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;', 'Courier New', monospace;">
        <p style="font-size: 1.6rem;"> Olá <strong>${user.name}</strong>!</p>
        <p style="font-size: 1.6rem;">Bem vindo ao Udex!</p>
        <p style="font-size: 1.2rem;">Clique no link abaixo para confirmar o seu email!</p>
        <button style="color:black; font-size:1.2rem;  background-color:#492d7d; padding:10px 15px; border-radius: 4px;"><a style="color:white; text-decoration:none;";  href="${url}">Confirmar Email</a></button>
        <p style="font-size: 1.2rem;">Ou, se preferir, copie e cole o link abaixo no navegador:</p>
        <p style="font-size: 1.0rem;"></p>${url}</p>
        <hr>
        <p style="font-size: 1.2rem;">Por favor ignore esta mensagem, caso voce não tenha solicitado este email</p>
      </div>`

        await sendEmail(to, from, subject, text, htmlConfirmLink)

        res.status(200).json({
            status: 'success',
            message: 'O link para confirmação da conta foi enviado para o seu email',
            user: {
                name: user.name,
                email: user.email,
                role: user.role,
            },
        })
    }
})

//sendResetPasswordLink envia email para o usuário fazer alteração de senha
export const sendResetPasswordLink = asyncHandler(async (req, res, next) => {
    //console.log('Entrou no sendResetPasswordLink');
    const email = req.body.email;
    const user = await User.findOne({ email })

    if (!user) {
        return next(new AppError('Não foi encontrado usuário para este endereço de email!', 404))
    }

    // Verify if the User  isConfirmedUser
    if (user.isConfirmedUser !== true) {
        return next(new AppError('O email do usuário não foi confirmado!', 404))
    }

    if (user.isConfirmedUser === true) {
        // 2) Generate the reset token
        // Atenção tokenEmailConfirm não é o user token !!!!

        const role = user.role ?? 'user';
        const tokenPasswordConfirm = signTokenShortConfirm({ email, role }, next)

        user.tokenPasswordConfirm = tokenPasswordConfirm
        user.save()

        // envia email com o link para reset password
        const hostFrontend = 'udex.app/#'
        const url = `${req.protocol}://${hostFrontend}/resetpassword/${tokenPasswordConfirm}`

        const to = user.email
        const from = `Contato <${process.env.EMAIL_USER}>` // 'contato@pesquisajus.com'
        const subject = 'Udex - Alteração de Senha - Por favor confirme o link - ref: ' + tokenPasswordConfirm.substr(-5)
        const text = ''

        const htmlConfirmLink = `<div style="text-align:center; font-weigth: 500; line-height:1.2; color: #5a5a5a; font-family: Montserrat, -apple-system, system-ui, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;', 'Courier New', monospace;">
        <p style="font-size: 1.6rem;"> Olá <strong>${user.name}</strong>!</p>
        <p style="font-size: 1.4rem;">Voce solicitou uma alteração na sua senha do Udex!</p>
        <p style="font-size: 1.2rem;">Clique no link abaixo para alterar a senha.</p>
        <button style="color:black; font-size:1.2rem;  background-color:#492d7d; padding:10px 15px; border-radius: 4px;"><a style="color:white; text-decoration:none;";  href="${url}">Alterar Senha</a></button>
        <p style="font-size: 1.2rem;">Ou, se preferir, copie e cole o link abaixo no navegador:</p>
        <p style="font-size: 1.0rem;"></p>${url}</p>
        <hr>
        <p style="font-size: 1.2rem;">Por favor ignore esta mensagem, caso voce não tenha solicitado este email</p>
      </div>`

        await sendEmail(to, from, subject, text, htmlConfirmLink)

        res.status(200).json({
            status: 'success',
            message: 'O link para a alteração de senha foi enviado para o seu email',
        })
    }
})

export default {
    register,
    confirmEmail,
    changePassword,
    login,
    logout,
    protect,
    restrictTo,
    sendResetEmailLink,
    sendResetPasswordLink,
    resetPassword, // send html link with reset password request
}


// Index
// 030 - register, - register user - send html with email confirm request
// 104 - confirmEmail, - confirms user email in initial registration
// 152 - changePassword, - receives password change request and confirms it into db
// 206 - login,
// 273 - logout,
// 262 - protect,
// 312 - restrictTo,
//   - sendResetemailLink
// 398 - sendResetPasswordLink, - send html with password confirm request