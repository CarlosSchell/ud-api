import  jwt  from 'jsonwebtoken'
import  AppError from './../utils/appError.js'

const verifyToken = (token, next) => {
    console.log('entrou no Verify Token');
    //const tokenKey = fs.readFileSync('private.key')
    // Algoritmo RSA 512 - Chaves com 1024 bits de tamanho

    let tokenDecoded
    try {
        tokenDecoded = jwt.verify(token, process.env.JWT_PUBLIC, {
            algorithm: ['RS256'],
        });
    } catch (err) {
        console.log('entrou no catch do Verify');
        return next(new AppError('Resultado da verificação: Token inválido! : ' + err.message, 500));         // - ' + err.message, 500))
    }
    console.log('saiu do Verify Token');

    return tokenDecoded
}

export default verifyToken
