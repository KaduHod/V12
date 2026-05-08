// @ts-check
/**
 * @typedef {"string" | "number" | "boolean" | "label" } TipoColuna
 * @typedef {"unico" | "lista" | "lista_pai"} TipoEntidade
 * @typedef {"lista" | "link" } TipoFilho
 * @typedef {"padrao" } TipoPai
 * @typedef {"treino" | "exercicio" | "pessoa" | "exercicio_treino" | "treinado"} TiposEntidadesGym
 */
/**
 * @typedef {Object} Coluna
 * @property {string} nome
 * @property {TipoColuna} tipo
 * @property {string} [label=null]
 * @property {boolean} [pk=false]
 * @property {boolean} [hidden=false]
 * @property {boolean|string} [search=false] // todo search deve ser fk
 * @property {string} [fk]
 * @property {Entidade} [entidade_indireta]
 * @property {boolean} [parent]
 * @property {string} [fk_tabela]
 * @property {boolean} [filtro=false]
 */

/**
 * @typedef {Object} FilhoConfig
 * @property {Entidade} entidade
 * @property {TipoFilho} [tipo]
**/

/**
 * @typedef {Object} PaiConfig
 * @property {Entidade} entidade
 * @property {Entidade} [entidade_indireta]
 * @property {TipoPai} [tipo]
**/

/**
 * @typedef {Object} Entidade
 * @property {string} [modulo]
 * @property {string} nome
 * @property {string} http_path_name
 * @property {string} tabela
 * @property {FilhoConfig[]} [filhos]
 * @property {PaiConfig} [pai]
 * @property {TipoEntidade} tipo
 * @property {Coluna[]} colunas
 * @property {boolean} [possui_form]
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
    modulo: "treino",
    possui_form: true,
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
let exercicio_treino = {
    nome: "Exercicio Treino",
    http_path_name: "treino/treino_exercicio",
    tabela: "treino_exercise",
    tipo: "lista"
}

/** @type {Entidade} */
const treinado = {
    nome: "Treinado",
    http_path_name: "treino/treinado",
    tabela: "treinado",
    tipo: "lista",
    colunas: [
        {...DEFAULT_ID, hidden:true},
        {
            nome: "exercise",
            label: "Exercicio",
            tipo: "label",
            fk: "exercise",
            search: "name",
            entidade_indireta: exercicio_treino
        },
        {
            nome: "peso",
            label: "Peso",
            tipo: "number",
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
        }
    ]
}
/** @type {Entidade} */
exercicio_treino = {
    ...exercicio_treino,
    filhos: [
        {
            tipo: "lista",
            entidade: exercicio
        },
        {
            tipo: "link",
            entidade: treinado
        }
    ],
    colunas: [
        {...DEFAULT_ID, hidden:true},
        {
            nome: "treino",
            tipo: "number",
            hidden: true,
            fk: "treino",
            parent: true
        },
        {
            nome: "exercise",
            label: "Exercicio",
            tipo: "number",
            fk: "exercise",
            search: "name",
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
    possui_form: true,
    http_path_name: "treino",
    tipo: "lista",
    modulo: "treino",
    filhos: [
        {
            tipo: "lista",
            entidade: exercicio_treino
        },
        {
            tipo: "link",
            entidade: treinado
        }
    ],
    colunas: [
        DEFAULT_ID,
        {
            nome:"nome",
            label:"Nome",
            tipo:"string",
            filtro: true
        },
        {
            nome: "pessoa",
            label: "Pessoa",
            tipo: "number",
            search: "nome",
            fk: "pessoa",
            filtro: true
        }
    ]
}

/** @type {Entidade} */
const pessoa = {
    nome: "Pessoa",
    tabela: "pessoa",
    http_path_name: "pessoa",
    tipo: "lista",
    modulo: "treino",
    colunas: [
        DEFAULT_ID,
        {
            nome:"nome",
            label:"Nome",
            tipo:"string",
            filtro: true
        }
    ]
}
treinado.filhos = [
    {
        tipo: "link",
        entidade: exercicio_treino
    },
    {
        tipo: "link",
        entidade: treino
    }
]
treinado.pai = {
    tipo: "padrao",
    entidade: treino,
    entidade_indireta: exercicio_treino,
}

/**
    @type {Partial<Record<TiposEntidadesGym, Entidade>>}
*/
export const EntidadesGym = {
    exercicio_treino, pessoa, treino, exercicio, treinado
}
