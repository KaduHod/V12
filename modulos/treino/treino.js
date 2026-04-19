import e from "express";
import { EntidadesGym } from "../../entidades.js";
import pool from "../../database/conn.js";
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
    let argumentos = [];
    let where = [];
    let where_q = "";
    let page = 'motor/form/form'
    if(req.query.filtro) {
        if(req.query.pessoa) {
            argumentos.push(req.query.pessoa)
            where.push(" p.id = ?")
        }
        if(req.query.nome) {
            argumentos.push(req.query.nome)
            where.push(" t.nome = ?")
        }
        page = 'motor/form/itens_container'
    }
    if(where.length > 0) {
        where_q = " and " + where.join("and");
    }
    query += where_q
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
