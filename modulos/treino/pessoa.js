import e from "express";
import pool from "../../database/conn.js";
import ejsLayout from "express-ejs-layouts";
import { importa_entidades_gym } from "../../entidades.js";
import { ITENS_POR_PAGINA } from "../../config.js";
import { upsert_entidade, upsert_lista } from "../../upsert.js";
import { gerar_filtro_sql_entidade, montar_paginacao, montar_query_total } from "../../filtro.js";
const pessoa_router = e.Router();

/**
 * Função para obter pessoas do banco de dados com paginação e filtros.
 * @param {Object} req - Objeto de requisição Express.
 * @param {Object} res - Objeto de resposta Express.
 * @returns {Promise<void>}
 */
const get_pessoa = async (req, res) => {
    const entidade = importa_entidades_gym().pessoa;
    let pagina = req.query.pagina ?? 1;
    pagina = parseInt(pagina);
    let query = "SELECT * FROM pessoa p where deleted_at is null";
    let argumentos = []
    let page = 'motor/form/form'
    if(req.query.filtro) {
        page = 'motor/form/itens_container';
        const filtro = gerar_filtro_sql_entidade(entidade, req.query, {pessoa: "p"})
        if(filtro.sql) {
            query += ' and ' + filtro.sql;
        }
        if(filtro.argumentos) {
            argumentos = filtro.argumentos
        }
    }
    const [itens, itens_tot] = await Promise.all([
        pool.promise().query(montar_paginacao(query, pagina), argumentos),
        pool.promise().query(montar_query_total(query), argumentos)
    ]).then((results) => [results[0][0], results[1][0]]);
    res.render(page, {
        entidade,
        layout: false,
        itens: itens,
        entidades: entidade,
        pagina,
        total: itens_tot[0].total,
        itens_por_pagina: ITENS_POR_PAGINA,
    });
}
pessoa_router.post('/pessoa', async (req, res) => {
    const entidade = importa_entidades_gym().pessoa;
    await upsert_lista(entidade, req.body)
    return get_pessoa(req, res);
})
pessoa_router.get('/', get_pessoa)


export default pessoa_router;
