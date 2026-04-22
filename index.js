// @ts-check
import { EntidadesGym } from "./entidades.js";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import morgan from "morgan";
import { loadEnvFile } from "process";
import treino_router from "./modulos/treino/treino.js";
import pool from "./database/conn.js";
import ejsLayout from "express-ejs-layouts";
import { gerar_filtro_sql_entidade, montar_paginacao, montar_query_total } from "./filtro.js";
import { ITENS_POR_PAGINA } from "./config.js";
import { upsert_lista } from "./upsert.js";

loadEnvFile()
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
app.use(morgan("dev"))
const PORT = 3000;
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(ejsLayout);
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));

app.get('/', async (req, res) => {
    res.render('pages/home', {
        titulo: "Home",
        entidades: EntidadesGym
    });
})
app.post('/pessoa', async (req, res) => {
    await upsert_lista(EntidadesGym.pessoa, req.body)
    return res.redirect('/pessoa')
})
app.get('/pessoa', async (req, res) => {
    const entidade = EntidadesGym.pessoa;
    let pagina = req.query.pagina ?? 1;
    pagina = parseInt(pagina);
    let query = "SELECT * FROM pessoa p where 1=1";
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
        entidades: EntidadesGym,
        pagina,
        total: itens_tot[0].total,
        itens_por_pagina: ITENS_POR_PAGINA,
    });
})
app.use("/treino", treino_router)
try {
    app.listen(PORT, () => {
        console.log(`Aplicacao rodando :${PORT}`)
    });
} catch (error) {
    console.error(error)
}

process.on('SIGINT', async () => {
    await mysql.end();
    process.exit(0);
});
