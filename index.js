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
    res.render("pages/home", {titulo:"teste", nome: "carlos"})
})

try {
    app.listen(PORT, () => {
        console.log(`Aplicacao rodando :${PORT}`)
    });
} catch (error) {
    console.error(error)
}


