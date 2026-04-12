// @ts-check
/**
 * @typedef {"string" | "number" | "boolean"} TipoColuna
 * @typedef {"treino" | "exercise" } TiposEntidadesGym
 */
/**
 * @typedef {Object} Coluna
 * @property {string} nome
 * @property {TipoColuna} tipo
 * @property {boolean} [pk=false]
 * @property {boolean|string} [fk=false]
 */

/**
 * @typedef {Object} Entidade
 * @property {string} nome
 * @property {string} tabela
 * @property {Coluna[]} colunas
 */

/** @type {Entidade} */
const treino = {
    nome: "treino",
    tabela: "treino_exercise",
    colunas: [
        {
            nome: "treino",
            tipo: "number",
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
            tipo: "number",
        },
        {
            nome: "repetições",
            tipo: "number",
        },
        {
            nome: "descanso",
            tipo: "number",
        }
    ]
}

/**
    @type {Partial<Record<TiposEntidadesGym, Entidade>>}
*/
export const EntidadesGym = {
    treino,
}
