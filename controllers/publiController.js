import { Client } from '@elastic/elasticsearch'
import asyncHandler from 'express-async-handler'
import fs, { promises as Fs } from 'fs'
import AppError from '../utils/appError.js'

const elastic_import_data_path = process.env.ELASTIC_IMPORT_DATA_PATH || '/home/dados'
const elastic_indice_base_name = process.env.ELASTIC_INDICE_BASE_NAME || 'publicacoes_'

const client = new Client({
    node: 'http://pesquisajus.vps-kinghost.net:9200',
    auth: {
        username: 'elastic',
        password: 'd0tXI8wXTZSxqxIpwDWc',
    },
})


// Rota: '/v1/publicacao/processo'
export const postPesquisaPublicacaoNumeroProcesso = asyncHandler(async (req, res, next) => {
    //console.log('Entrou no publiController.postPesquisaPublicacaoNumeroProcesso !')
    const email = req.email;
    const role = req.role;

    const processo = req.body.processo

    //0013431-62.2021.8.21.7000
    let codigo_estado_tribunal = processo.substr(16, 20)
    codigo_estado_tribunal = codigo_estado_tribunal.substr(0, 4)
    //console.log('codigo_estado_tribunal: ', codigo_estado_tribunal)
    let uf = 'rs'
    let tribunal = 'tj'
    if (codigo_estado_tribunal === '8.21') {
        uf = 'rs'
        tribunal = 'tj'
    } else {
        if (codigo_estado_tribunal === '8.19') {
            uf = 'rj'
            tribunal = 'tj'
        } else {
            return next(new AppError('O processo é de um Tribunal ainda não atendido pelo sistema!', 401))
        }
    }

    const elasticIndiceName = elastic_indice_base_name + tribunal + uf

    // console.log('elastic_import_data_path: ', elastic_import_data_path)
    // console.log('elastic_indice_base_name: ', elastic_indice_base_name)
    // console.log('elasticIndiceName       : ', elasticIndiceName)
    // console.log('processo                : ', processo)

    const result = await client.search({
        index: elasticIndiceName,
        body: {
            query: { match: { processo: processo } },
            size: 50,
            sort: [{ diario: 'desc' }],
        },
    })

    let arr_publicacoes = []
    if (result) {
        arr_publicacoes = result.body.hits.hits
    }

    let publicacoes = []
    for (const publicacao of arr_publicacoes) {
        publicacoes.push(publicacao['_source'])
    }

    res.status(200).json({
        status: 'success',
        message: `Processo pesquisado ${processo}`,
        data: {
            publicacoes,
        },
    })
})


// Rota: '/v1/publicacao/texto'
export const postPesquisaPublicacaoTexto = asyncHandler(async (req, res, next) => {
    //console.log('Entrou no publiController.postPesquisaPublicacaoTexto !')
    const email = req.email;
    const role = req.role;

    const texto = req.body.texto
    const uf = (req.body.uf ?? 'rs').toLowerCase()
    const tribunal = (req.body.tribunal ?? 'tj').toLowerCase()
    const elasticIndiceName = elastic_indice_base_name + tribunal + uf

    const result = await client.search({
        index: elasticIndiceName,
        body: {
            query: { match_phrase: { decisao: texto } },
            size: 1000,
            sort: [{ diario: 'desc' }],
        },
    })

    let arr_publicacoes = []
    if (result) {
        arr_publicacoes = result.body.hits.hits
    }

    let publicacoes = []
    for (const publicacao of arr_publicacoes) {
        publicacoes.push(publicacao['_source'])
    }

    res.status(200).json({
        status: 'success',
        message: `Texto pesquisado: ${texto}`,
        data: {
            publicacoes,
        },
    })
})


// Rota: /v1/publicacao/envia
// Rotina de carga do diario json no banco de dados elasticsearch
export const postCarregaNovaPublicacaoJSON = asyncHandler(async (req, res, next) => {
    //console.log('Entrou no postCarregaNovaPublicacaoJSON !')
    const email = req.email;
    const role = req.role;

    if ((role !== 'user') && (role !== 'master') && (role !== 'admin')) {
        return next(new AppError('Operação não autorizada para este usuário!', 400))
    }

    const uf = req.body.uf
    const tribunal = req.body.tribunal
    const nomeArquivoJSON = req.body.nomeArquivoJSON
    const dadosArquivoJSON = req.body.dadosArquivoJSON

    const elasticIndiceName = elastic_indice_base_name + tribunal + uf
    const pathArquivoJSON = elastic_import_data_path + '/' + uf + '/' + tribunal + '/'
    const fullNomeArquivoJSON = pathArquivoJSON + nomeArquivoJSON

    console.log('elastic_import_data_path: ', elastic_import_data_path)
    console.log('elastic_indice_base_name: ', elastic_indice_base_name)
    console.log('elasticIndiceName       : ', elasticIndiceName)
    console.log('fullNomeArquivoJSON     : ', fullNomeArquivoJSON)
    console.log('dadosArquivoJSON        : ', dadosArquivoJSON)

    // Grava arquivo dadosArquivoJSON no diretório do servidor
    const gravaresult = await Fs.writeFile(fullNomeArquivoJSON, dadosArquivoJSON)
    //console.log(gravaresult)

    const testaExistenciaArquivo = async (fullNomeArquivoJSON) => {
        try {
            await Fs.access(fullNomeArquivoJSON)
            console.log('leu o arquivo json')
            return true
        } catch {
            return false
        }
    }

    const isArquivo = await testaExistenciaArquivo(fullNomeArquivoJSON)

    console.log('isarquivo: ', isArquivo)
    if (isArquivo === false) {
        return next(new AppError(('O arquivo ' + fullNomeArquivoJSON + ' não foi encontrado !'), 401))
    }

    const publicacoesRaw = fs.readFileSync(fullNomeArquivoJSON, 'utf8')
    const publicacoes = JSON.parse(publicacoesRaw);


    // Insere o arquivo json publicacoes no elasticsearch index

    async function* generator() {
        for (const docs of publicacoes) {
            yield docs
        }
    }

    const result = await client.helpers.bulk({
        datasource: generator(),
        onDocument(docs) {
            return {
                index: { _index: elasticIndiceName }
            }
        }
    })

    //console.log(result)

    const resMensagem = 'O arquivo ' + fullNomeArquivoJSON + ' foi incluido no banco de dados !'
    res.status(200).json({
        message: resMensagem,
        result: true //result,
    })

})


export default {
    postPesquisaPublicacaoNumeroProcesso,
    postPesquisaPublicacaoTexto,
    postCarregaNovaPublicacaoJSON,
}
