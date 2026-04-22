import pool from "./database/conn.js";
/**
 * Performs an upsert (insert or update) operation for a given entity.
 * @param {import('./entidades.js').Entidade} entidade - The entity definition.
 * @param {Object} body - The request body (express req.body) containing column values.
 * @returns {Promise<Object>} The result of the database operation.
 */
export async function upsert_lista(entidade, body) {
    let querys = {};
    let query = "";
    let argumentos = {};
    body.id.forEach((id, index) => {
        let argumentos_curr = [];
        if(body.excluir && body.excluir[index]) {
            query = `update ${entidade.tabela} set deleted_at = now() where id = ?`;
            argumentos_curr = [id];
            querys[id] = query;
        } else if(id && id[0] != "_") {
            let values = Object.keys(body)
                .filter((coluna) => entidade.colunas.find(c => c.nome == coluna && !c.pk))
                .map((coluna) => {
                    argumentos_curr.push(body[coluna][index]);
                    return `${coluna} = ?`
                })
            argumentos_curr.push(id);
            let update = `update ${entidade.tabela} set ` + values.join(", ") + ` where id = ?`;
            querys[id] = update;
        } else {
            let colunas = Object.keys(body)
                .filter((coluna) => entidade.colunas.find(c => c.nome == coluna && !c.pk))
                .map((coluna) => {
                    argumentos_curr.push(body[coluna][index]);
                    return coluna;
                });
            let insert = `insert into ${entidade.tabela} (${colunas.join(", ")}) values (${colunas.map(() => "?").join(", ")})`;
            querys[id] = insert;
        }
        argumentos[id] = argumentos_curr;
    })
    const promises = [];
    Object.keys(querys).forEach(id => {
        promises.push(pool.promise().query(querys[id], argumentos[id]));
    })
    return promises;
}
