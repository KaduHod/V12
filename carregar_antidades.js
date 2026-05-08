/**
* @param {import('./entidades.js').Entidade} entidade - entidade
*/

export function montar_query_entidade(entidade) {
    let { joins, colunas_de_joins } = entidade.colunas
        .filter((c) => c.fk)
        .reduce(
            (acc, col) => {
                const nome_tabela = col.fk_tabela ? col.fk_tabela : col.fk;
                let coluna = "";
                if ((col.search && typeof col.search != "boolean") || col.label) {
                    coluna = `${nome_tabela}.${col.search} as ${col.nome}, ${nome_tabela}.id as ${col.nome}_id`;
                } else {
                    coluna = `${nome_tabela}.id as ${col.nome}_id`;
                }
                if(col.entidade_indireta) {
                    const entidade_indireta = col.entidade_indireta;
                    acc.joins.push(`join ${entidade_indireta.tabela} on ${entidade_indireta.tabela}.id = ${entidade.tabela}.${entidade_indireta.tabela}_id and ${entidade_indireta.tabela}.deleted_at is null`)
                    acc.joins.push(`join ${nome_tabela} on ${nome_tabela}.id = ${entidade_indireta.tabela}.${nome_tabela}_id and ${nome_tabela}.deleted_at is null`)
                } else {
                    const fk_pai = `${col.fk ?? col.nome}_id`;
                    const join = `left join ${nome_tabela} ${nome_tabela} on ${nome_tabela}.id = ${entidade.tabela}.${fk_pai} and ${nome_tabela}.deleted_at is null`;
                    acc.colunas_de_joins.push(coluna);
                    acc.joins.push(join);
                }
                return acc;
            },
            { joins: [], colunas_de_joins: [] },
        );

    if(entidade.pai && entidade.pai.tipo == 'padrao' && entidade.pai.entidade_indireta) {
        const entidade_pai = entidade.pai.entidade;
        const entidade_indireta = entidade.pai.entidade_indireta;
        const join_entidade_indireta = `join ${entidade_indireta.tabela} on ${entidade_indireta.tabela}.id = ${entidade.tabela}.${entidade_indireta.tabela}_id and ${entidade_indireta.tabela}.deleted_at is null`;
        if(!joins.includes(join_entidade_indireta)) {
            joins.push(`join ${entidade_indireta.tabela} on ${entidade_indireta.tabela}.id = ${entidade.tabela}.${entidade_indireta.tabela}_id and ${entidade_indireta.tabela}.deleted_at is null`)
        }
        joins.push(`join ${entidade_pai.tabela} on ${entidade_pai.tabela}.id = ${entidade_indireta.tabela}.${entidade_pai.tabela}_id and ${entidade_pai.tabela}.deleted_at is null`)
    }
    const campos_entidade = entidade.colunas
        .filter((c) => !c.fk)
        .map((c) => `${entidade.tabela}.${c.nome} as ${c.nome}`);
    const cols = [...campos_entidade, ...colunas_de_joins].join(', ');
    const sql = `
    SELECT ${cols}
    FROM ${entidade.tabela}
    ${joins.join("\n ")}
    WHERE 1=1 and ${entidade.tabela}.deleted_at is null
    `;
    return sql;
}

/**
* @typedef {Object} itens_entidade
* @property {string} sql
* @param {import('mysql').Pool} pool - Conexao com o banco
* @param {import('./entidades.js').Entidade} entidade_pai - entidade pai
* @param {number} id - filtro id da entidade pai
* Returns {Promise<itens_entidade>}
*/
export async function carregar_entidades(pool, entidade_pai, id) {
    try {
        // carrega itens do pai
        let sql_pai = montar_query_entidade(entidade_pai);
        sql_pai += ` and ${entidade_pai.tabela}.id = ?`;

        /** @type {Record<string, Record<string, any | any[]>>} **/
            const itens = {};
        itens.filhos = {};
        const promises = [
            pool
            .promise()
            .query(sql_pai, [id])
            .then(([rows]) => (itens[entidade_pai.nome] = rows[0])),
        ];

        if(entidade_pai.filhos  && entidade_pai.filhos.length > 0) {
            entidade_pai.filhos.forEach((filho) => {
                if(filho.tipo === 'link') return;
                let replace = `WHERE 1=1 and ${filho.entidade.tabela}.${entidade_pai.tabela}_id = ?`;
                if(filho.entidade.pai && filho.entidade.pai.entidade_indireta) {
                    const entidade_indireta = filho.entidade.pai.entidade_indireta;
                    const entidade_pai = filho.entidade.pai.entidade;
                    replace = `WHERE 1=1 and ${entidade_indireta.tabela}.${entidade_pai.tabela}_id = ?`;
                }
                let query_filho = montar_query_entidade(filho.entidade).replace("WHERE 1=1", replace);
                promises.push(
                    pool
                    .promise()
                    .query(query_filho, [id])
                    .then(([rows]) => (itens.filhos[filho.entidade.nome] = rows)),
                );
            });
        }
        await Promise.all(promises);
        return itens;
    } catch (error) {
        console.log(error);
    }
    return null;
}
