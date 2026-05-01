/**
 * @param {import('./entidades.js').Entidade} entidade - entidade
 */

export function montar_query_entidade(entidade) {
    const {joins, colunas} = entidade.colunas.filter(c => c.fk).reduce((acc, col) => {
        const nome_tabela = col.fk_tabela ? col.fk_tabela : col.fk;
        const fk_pai = `${col.fk ?? col.nome}_id`;
        let coluna = "";
        if(col.search && typeof col.search != "boolean" || col.label) {
            coluna = `${nome_tabela}.${col.search} as ${col.nome}, ${nome_tabela}.id as ${col.nome}_id`;
        } else {
            coluna = `${nome_tabela}.id as ${col.nome}_id`;
        }
        const join = `left join ${nome_tabela} ${nome_tabela} on ${nome_tabela}.id = ${entidade.tabela}.${fk_pai} and ${nome_tabela}.deleted_at is null`;
        acc.colunas.push(coluna);
        acc.joins.push(join);
        return acc;
    }, {joins:[], colunas:[]});

    const campos_entidade = entidade.colunas.filter(c => !c.fk).map(c => `${entidade.tabela}.${c.nome} as ${c.nome}`).join(', ');
    const sql = `
        SELECT ${campos_entidade}, ${colunas.join(', ')}
        FROM ${entidade.tabela}
        ${joins.join('\n ')}
        WHERE 1=1 and ${entidade.tabela}.deleted_at is null
    `;
    return sql
}


/**
    @typedef {Object} itens_entidade
    @property {string} sql
**/
/**
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
        const itens = {}
        itens.filhos = {};
        const promises = [pool.promise().query(sql_pai, [id]).then(([rows]) => itens[entidade_pai.nome] = rows[0])];

        entidade_pai.filhos.forEach(filho => {
            let query_filho = montar_query_entidade(filho)
                .replace("WHERE 1=1", `WHERE 1=1 and ${filho.tabela}.${entidade_pai.tabela}_id = ?`);
            promises.push(
                pool.promise().query(query_filho, [id]).then(([rows]) => itens.filhos[filho.nome] = rows)
            );
        })
        await Promise.all(promises);
        return itens
    } catch (error) {
        console.log(error)
    }
    return null
}
