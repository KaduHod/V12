import e from "express";
import { EntidadesGym } from "../../entidades.js";
import pool from "../../database/conn.js";
import { gerar_filtro_sql_entidade, montar_paginacao, montar_query_total } from "../../filtro.js";
import { ITENS_POR_PAGINA } from "../../config.js";
import { carregar_entidades } from "../../carregar_antidades.js";
import { upsert_entidade, upsert_lista } from "../../upsert.js";
const treino_router = e.Router();

/** @type {import('express').RequestHandler} */
const search = async (req, res) => {
    let argumentos = [];
    let query = '';
    switch (req.query.coluna) {
        case 'pessoa':
            query = `select p.id as value, p.nome as label from pessoa p
            WHERE p.nome COLLATE utf8mb4_0900_ai_ci LIKE CONCAT('%', ?, '%') and deleted_at is null
            group by p.nome, p.id
            order by p.id`
            argumentos = [req.body.busca]
            break;
        case 'exercise':
            query = `select e.id as value, e.name as label from search_exercise e
            WHERE e.descr_like COLLATE utf8mb4_0900_ai_ci LIKE CONCAT('%', ?, '%')
            group by e.id, e.name
            order by e.id
            `
            argumentos = [req.body.busca]
            break;
        default:
            break;
    }
    const [ itens ] = await pool.promise().query(query, argumentos)
    res.render('motor/search_options', {
        layout: false,
        itens,
    });
}
/** @type {import('express').RequestHandler} */
const index = async (req, res) => {
    const entidade = EntidadesGym.treino;
    let pagina = req.query.pagina ?? 1;
    pagina = parseInt(pagina);
    let query = `SELECT t.*, p.id as pessoa_id, p.nome as pessoa
                    FROM treino t
                left join pessoa p on p.id = t.pessoa_id and p.deleted_at is null
                where t.deleted_at is null
    `;
    let page = 'motor/form/form'
    let argumentos = []
    if(req.query.filtro) {
        page = 'motor/form/itens_container';
        const filtro = gerar_filtro_sql_entidade(entidade, req.query, {pessoa: "p", treino: "t"})
        if(filtro.sql) {
            page = 'motor/form/itens_container';
            query += ' and ' + filtro.sql;
            argumentos = filtro.argumentos;
        }
    }

    const [itens, itens_tot] = await Promise.all([
        pool.promise().query(montar_paginacao(query, pagina), argumentos),
        pool.promise().query(montar_query_total(query), argumentos)
    ]).then((results) => [results[0][0], results[1][0]]);

    res.render(page, {
        layout: false,
        total: itens_tot[0].total,
        pagina,
        entidade,
        itens,
        itens_por_pagina: ITENS_POR_PAGINA,
        entidades: EntidadesGym
    });
}
/** @type {import('express').RequestHandler} */
const exercicio = async (req, res) => {
    const entidade = EntidadesGym.exercicio;
    const [ itens ] = await pool.promise().query(`SELECT * FROM exercise`)
    res.render('motor/form/form', {
        layout: false,
        entidade,
        itens,
        entidades: EntidadesGym
    });
}

/** @type {import('express').RequestHandler} */
const treino_exercicio = async (req, res) => {
    const entidade = EntidadesGym.exercicio_treino;
    const [ itens ] = await pool.promise().query(`SELECT * FROM treino_exercise`)
    res.render('motor/form/form', {
        layout: false,
        entidade,
        itens,
        entidades: EntidadesGym
    });
}
/** @type {import('express').RequestHandler} */
const treino_form = async (req, res) => {
    const id = req.params.id
    const entidade = EntidadesGym.treino;
    const itens = await carregar_entidades(pool, entidade, id);
    if(!itens) {
        res.status(400);
        return;
    }
    res.render('motor/form/form_entidade', {
        layout: false,
        entidade,
        itens,
        entidades: EntidadesGym
    });

}
/** @type {import('express').RequestHandler} */
const exercicio_form = async (req, res) => {
    const id = req.params.id
    const entidade = EntidadesGym.exercicio;
    const itens = await carregar_entidades(pool, entidade, id);
    if(!itens) {
        res.status(400);
        return;
    }
    res.render('motor/form/form_entidade', {
        layout: false,
        entidade,
        itens,
        entidades: EntidadesGym
    });

}

/** @type {import('express').RequestHandler} */
const treino_lista_upsert = async (req, res) => {
    const entidade = EntidadesGym.treino;
    await upsert_lista(entidade, req.body, EntidadesGym);
    return index(req, res);
}

/** @type {import('express').RequestHandler} */
const treino_upsert = async (req, res) => {
    const entidade = EntidadesGym.treino;
    await upsert_entidade(entidade, req.body)
    await treino_form(req, res)
}
/** @type {import('express').RequestHandler} */
const treinado_form = async (req, res) => {
    const id = req.params.id
    const entidade = {...EntidadesGym.treino};
    entidade.filhos = [
        { tipo: "lista", entidade: EntidadesGym.treinado }
    ]
    const itens = await carregar_entidades(pool, entidade, id);
    if(!itens) {
        res.status(400);
        return;
    }
    res.render('motor/form/form_entidade', {
        layout: false,
        entidade,
        itens,
        entidades: EntidadesGym
    });
}

treino_router.get("/", index);
treino_router.post("/search", search);
treino_router.get("/exercicio", exercicio);
treino_router.get("/exercicio/:id", exercicio_form);
treino_router.get("/treino_exercicio", treino_exercicio);
treino_router.post("/treino_exercicio/search", search);
treino_router.get("/treinado/:id", treinado_form);
treino_router.get("/:id", treino_form);
treino_router.post("/", treino_lista_upsert);
treino_router.post("/:id", treino_upsert);
export default treino_router;
