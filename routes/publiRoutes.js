import express from 'express';
import {
    protect
} from './../controllers/authController.js';
import {
    postCarregaNovaPublicacaoJSON, postPesquisaPublicacaoNumeroProcesso,
    postPesquisaPublicacaoTexto
} from './../controllers/publiController.js';



const publiRouter = express.Router()

// Protege todas as rotas a partir deste Middleware
publiRouter.use(protect);

publiRouter.post('/processo', postPesquisaPublicacaoNumeroProcesso)
publiRouter.post('/texto', postPesquisaPublicacaoTexto)

// Carga de dados permitida apenas para master e admin
//publiRouter.use(restrictTo(['master','admin']));
publiRouter.post('/envia', postCarregaNovaPublicacaoJSON)

export default publiRouter
