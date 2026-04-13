// @ts-check
import { EntidadesGym } from "./entidades.js";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import morgan from "morgan";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
app.use(morgan("dev"))
const PORT = 3000;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "../public")));

app.get('/', (req, res) => {
    res.render('pages/home', {
        titulo: "Home",
        entidades: EntidadesGym
    });
})
app.get('/treino', (req, res) => {
    const entidade = EntidadesGym.treino;

    // Dados de exemplo para a lista (pode ser array vazio inicialmente)
    const itens = [
        {
            treino: 1,
            exercicio: 101,
            series: 3,
            "repetições": 10,
            descanso: 60
        },
        {
            treino: 2,
            exercicio: 102,
            series: 4,
            "repetições": 12,
            descanso: 45
        }
    ];

    res.render('pages/treinos', {
        entidade,
        itens,
        titulo: "Treinos",
        entidades: EntidadesGym
    });
})

try {
    app.listen(PORT, () => {
        console.log(`Aplicacao rodando :${PORT}`)
    });
} catch (error) {
    console.error(error)
}


