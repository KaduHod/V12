import e from "express";
import { EntidadesGym } from "../../entidades.js";
import pool from "../../database/conn.js";
import { gerarFiltroSqlEntidade } from "../../filtro.js";
const treino_router = e.Router();

/** @type {import('express').RequestHandler} */
const search = async (req, res) => {
    let argumentos = [];
    let query = '';
    switch (req.query.coluna) {
        case 'pessoa':
            query = `select p.id as value, p.nome as label from pessoa p
            WHERE p.nome COLLATE utf8mb4_0900_ai_ci LIKE CONCAT('%', ?, '%')
            group by p.nome, p.id
            order by p.id`
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
    let query = "SELECT t.*, p.id as pessoa_id, p.nome as pessoa FROM treino t left join pessoa p on p.id = t.pessoa_id where 1=1";
    let page = 'motor/form/form'
    let argumentos = []
    if(req.query.filtro) {
        page = 'motor/form/itens_container';
        const filtro = gerarFiltroSqlEntidade(entidade, req.query, {pessoa: "p", treino: "t"})
        if(filtro.sql) {
            page = 'motor/form/itens_container';
            query += ' and ' + filtro.sql;
            argumentos = filtro.argumentos;
        }
    }
    console.log(query)
    const [ itens ] = await pool.promise().query(query, argumentos)

    res.render(page, {
        layout: false,
        entidade,
        itens,
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

treino_router.get("/", index);
treino_router.post("/search", search);
treino_router.get("/exercicio", exercicio);
treino_router.get("/treino_exercicio", treino_exercicio);
export default treino_router;
