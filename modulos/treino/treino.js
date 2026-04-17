import e from "express";
import { EntidadesGym } from "../../entidades.js";
import pool from "../../database/conn.js";
const treino_router = e.Router();
/** @type {import('express').RequestHandler} */
const index = async (req, res) => {
    const entidade = EntidadesGym.treino;
    // Dados de exemplo para a lista (pode ser array vazio inicialmente)
    const [ itens ] = await pool.promise().query(`SELECT t.*, p.nome as pessoa FROM treino t left join pessoa p on p.id = t.pessoa_id`)
    res.render('motor/form', {
        entidade,
        itens,
        entidades: EntidadesGym
    });

}
/** @type {import('express').RequestHandler} */
const exercicio = async (req, res) => {
    const entidade = EntidadesGym.exercicio;
    const [ itens ] = await pool.promise().query(`SELECT * FROM exercise`)
    res.render('motor/form', {
        entidade,
        itens,
        entidades: EntidadesGym
    });
}

/** @type {import('express').RequestHandler} */
const treino_exercicio = async (req, res) => {
    const entidade = EntidadesGym.exercicio_treino;
    const [ itens ] = await pool.promise().query(`SELECT * FROM treino_exercise`)
    res.render('motor/form', {
        entidade,
        itens,
        entidades: EntidadesGym
    });
}

treino_router.get("/", index);
treino_router.get("/exercicio", exercicio);
treino_router.get("/treino_exercicio", treino_exercicio);
export default treino_router;
