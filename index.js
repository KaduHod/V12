// @ts-check
import { EntidadesGym } from "./entidades.js";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import morgan from "morgan";
import { loadEnvFile } from "process";
import treino_router from "./modulos/treino/treino.js";
import pessoa_router from "./modulos/treino/pessoa.js";
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
app.use("/treino", treino_router)
app.use("/pessoa", pessoa_router)
try {
    app.listen(PORT, () => {
        console.log(`Aplicacao rodando :${PORT}`)
    });
} catch (error) {
    console.error(error)
}

process.on('SIGINT', () => {
    pool.end();
    process.exit(0);
});
