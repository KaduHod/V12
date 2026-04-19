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
app.get('/pessoa', async (req, res) => {
    const entidade = EntidadesGym.pessoa;
    const [itens] = await pool.promise().query("SELECT * FROM pessoa");
    res.render('motor/form/form', {
        entidade,
        layout: false,
        itens: itens,
        entidades: EntidadesGym
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
