// @ts-check
/**
 * @typedef {"string" | "number" | "boolean" | "label" } TipoColuna
 * @typedef {"unico" | "lista" } TipoEntidade
 * @typedef {"treino" | "exercicio" | "pessoa" | "exercicio_treino"} TiposEntidadesGym
 */
/**
 * @typedef {Object} Coluna
 * @property {string} nome
 * @property {TipoColuna} tipo
 * @property {string} [label=null]
 * @property {boolean} [pk=false]
 * @property {boolean} [hidden=false]
 * @property {boolean} [search=false]
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


/** @type {Coluna} */
const DEFAULT_ID = {
    nome:"id",
    label:"ID",
    tipo:"number",
    pk: true
}

/** @type {Entidade} */
const exercicio = {
    nome: "Exercício",
    http_path_name: "treino/exercicio",
    tabela: "exercise",
    tipo: "lista",
    colunas: [
        DEFAULT_ID,
        {
            nome:"name",
            label:"Nome",
            tipo:"string",
        }
    ]
}

/** @type {Entidade} */
const exercicio_treino = {
    nome: "Exercicio Treino",
    http_path_name: "treino/treino_exercicio",
    tabela: "treino_exercise",
    tipo: "lista",
    colunas: [
        DEFAULT_ID,
        {
            nome: "treino",
            tipo: "number",
            hidden: true,
            fk: true,
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
        DEFAULT_ID,
        {
            nome:"nome",
            label:"Nome",
            tipo:"string",
        },
        {
            nome: "pessoa",
            label: "Pessoa",
            tipo: "number",
            search: true,
            fk: true
        }
    ]
}
/** @type {Entidade} */
const pessoa = {
    nome: "Pessoa",
    tabela: "pessoa",
    http_path_name: "pessoa",
    tipo: "lista",
    colunas: [
        DEFAULT_ID,
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
    exercicio_treino, pessoa, treino, exercicio
}
