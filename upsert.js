import pool from "./database/conn.js";
/**
 * Performs an upsert (insert or update) operation for a given entity.
 * @param {import('./entidades.js').Entidade} entidade - The entity definition.
 * @param {Object} body - The request body (express req.body) containing column values.
    * @returns {Promise<any[]>} The result of the database operation.
 */
export async function upsert_lista(entidade, body) {
    let querys = {};
    let query = "";
    let argumentos = {};
    body.id.forEach((id, index) => {
        let argumentos_curr = [];
        if(body.pular_upsert[index] == 'S') return;
        if(id[0] != '_' && body.excluir && body.excluir[index] == 'S') {
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
        } else if(body.excluir[index] != 'S') {
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
    const conn = await pool.promise().getConnection();
    const promises = [];
    let result = null;
    try {
        await conn.beginTransaction();
        Object.keys(querys).forEach(id => {
            promises.push(conn.query(querys[id], argumentos[id]));
        })
        result = await Promise.all(promises);
        await conn.commit();
    } catch (error) {
        console.log(error)
        await conn.rollback();
    } finally {
        return result;
    }
}
