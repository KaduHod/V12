// @ts-check
/**
 * @typedef {"string" | "number" | "boolean"} TipoColuna
 * @typedef {"unico" | "lista" } TipoEntidade
 * @typedef {"treino" | "exercise" | "pessoa" | "exercicio_treino"} TiposEntidadesGym
 */
/**
 * @typedef {Object} Coluna
 * @property {string} nome
 * @property {TipoColuna} tipo
 * @property {string} [label=null]
 * @property {boolean} [pk=false]
 * @property {boolean} [hidden=false]
 * @property {boolean|string} [fk=false]
 */

/**
 * @typedef {Object} Entidade
 * @property {string} nome
 * @property {string} http_path_name
 * @property {string} tabela
 * @property {TipoEntidade} tipo
 * @property {Coluna[]} colunas
 */

/** @type {Entidade} */
const exercicio_treino = {
    nome: "Exercicio Treino",
    http_path_name: "treino/exercicio",
    tabela: "treino_exercise",
    tipo: "lista",
    colunas: [
        {
            nome: "treino",
            tipo: "number",
            hidden: true,
            pk: true,
            fk: false,
        },
        {
            nome: "exercicio",
            tipo: "number",
            fk: "exercise"
        },
        {
            nome: "series",
            label: "Séries",
            tipo: "number",
        },
        {
            nome: "repeticoes",
            label: "Repetições",
            tipo: "string",
        },
        {
            label: "Descanso",
            nome: "descanso_sec",
            tipo: "number",
        }
    ]
}

/** @type {Entidade} */
const treino = {
    nome: "Treino",
    tabela: "treino",
    http_path_name: "treino",
    tipo: "lista",
    colunas: [
        {
            nome:"id",
            label:"ID",
            tipo:"number",
            pk: true
        },
        {
            nome:"nome",
            label:"Nome",
            tipo:"string",
        },
    ]
}
/** @type {Entidade} */
const pessoa = {
    nome: "Pessoa",
    tabela: "pessoa",
    http_path_name: "pessoa",
    tipo: "lista",
    colunas: [
        {
            nome:"nome",
            label:"Nome",
            tipo:"string",
        }
    ]
}

/**
    @type {Partial<Record<TiposEntidadesGym, Entidade>>}
*/
export const EntidadesGym = {
    exercicio_treino, pessoa, treino
}
