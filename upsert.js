import pool from "./database/conn.js";

/**
 * Constrói as queries e argumentos para um upsert de lista (múltiplos registros).
 * Processa cada entrada em `body.id` gerando comandos INSERT, UPDATE ou DELETE.
 * @param {import('./entidades.js').Entidade} entidade - A definição da entidade.
 * @param {Object} body - O corpo da requisição com arrays de valores (mesmo formato de upsert_lista).
 * @param {any} [parent_id] - Id do pai se houver se houver
 * @returns {{ querys: Record<string, string>, argumentos: Record<string, any[]> }}
 *   Objeto com `querys` (chave = id) e `argumentos` (chave = id, array de argumentos para a query).
 */
export function build_upsert_querys(entidade, body, parent_id = null) {
    let querys = {};
    let argumentos = {};
    body.id.forEach((id, index) => {
        let argumentos_curr = [];
        let colunas = [];
        if (body.pular_upsert && body.pular_upsert[index] === 'S') return;
        if (id && id[0] !== '_' && body.excluir && body.excluir[index] === 'S') {
            // DELETE
            querys[id] = `update ${entidade.tabela} set deleted_at = now() where id = ?`;
            argumentos_curr = [id];
        } else if (id && id[0] !== '_') {
            for (let [prop, valor] of Object.entries(body)) {
                const coluna_entidade = entidade.colunas.find(c => (c.nome == prop) || (c.fk && prop.endsWith('_id') && prop.replace('_id', '') == c.nome));
                if(!coluna_entidade || coluna_entidade.pk) continue;
                if(coluna_entidade.fk) {
                    argumentos_curr.push(coluna_entidade.parent ? parent_id : valor[index]);
                    colunas.push(coluna_entidade.nome + '_id = ?');
                } else {
                    argumentos_curr.push(valor[index]);
                    colunas.push(coluna_entidade.nome + ' = ?');
                }
            }
            argumentos_curr.push(id);
            querys[id] = `update ${entidade.tabela} set ${colunas.join(", ")} where id = ?`;
        } else if (!body.excluir || body.excluir[index] !== 'S') {
            for (let [prop, valor] of Object.entries(body)) {
                const coluna_entidade = entidade.colunas.find(c => (c.nome == prop) || (c.fk && prop.endsWith('_id') && prop.replace('_id', '') == c.nome));
                if(!coluna_entidade || coluna_entidade.pk) continue;
                if(coluna_entidade.fk) {
                    argumentos_curr.push(coluna_entidade.parent ? parent_id : valor[index]);
                    colunas.push(coluna_entidade.nome + '_id');
                } else {
                    argumentos_curr.push(valor[index]);
                    colunas.push(coluna_entidade.nome);
                }
            }
            const placeholders = colunas.map(() => '?').join(', ');
            querys[id] = `insert into ${entidade.tabela} (${colunas.join(", ")}) values (${placeholders})`;
        }
        argumentos[id] = argumentos_curr;
    });

    return { querys, argumentos };
}



/**
 * Performs an upsert (insert or update) operation for a given entity.
 * @param {import('./entidades.js').Entidade} entidade - The entity definition.
 * @param {Object} body - The request body (express req.body) containing column values.
    * @returns {Promise<any[]>} The result of the database operation.
 */
export async function upsert_lista(entidade, body) {
    const { querys, argumentos } = build_upsert_querys(entidade, body);
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

/**
 * Performs an upsert (insert or update) operation for a given entity.
 * @param {import('./entidades.js').Entidade} entidade - The entity definition.
 * @param {Object} body - The request body (express req.body) containing column values.
 * @returns {Promise<any[]>} The result of the database operation.
 */
export async function upsert_entidade(entidade, body) {
    let querys = {0:""};
    let argumentos = {0:[]};
    // tratar entidade pai
    let colunas_query_entidade_pai = Object.keys(body).map((coluna) => {
        if(['filhos', 'id'].indexOf(coluna) > -1) return null;
        const coluna_entidade = entidade.colunas.find(c => c.nome == coluna || (c.fk && coluna.replace('_id', '') == c.nome));
        if(coluna_entidade.fk) {
            argumentos[0].push(body[coluna]);
            return coluna_entidade.nome + '_id = ?';
        } else {
            argumentos[0].push(body[coluna]);
            return coluna_entidade.nome + ' = ?';
        }
    }).filter(q => q);
    querys[0] = `update ${entidade.tabela} set ${colunas_query_entidade_pai.join(", ")} where id = ?`;
    argumentos[0].push(body.id);
    if(body.filhos) {
        Object.keys(body.filhos).forEach((filho, i) => {
            const entidade_filho = entidade.filhos.find(entidade_filho => entidade_filho.tabela == filho);
            if(!entidade_filho) return;
            let config_filhos = build_upsert_querys(entidade_filho, body.filhos[filho][i], body.id);
            querys = {...querys, ...config_filhos.querys};
            argumentos = {...argumentos, ...config_filhos.argumentos};
        })
    }
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
