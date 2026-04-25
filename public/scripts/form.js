const FORM = document.forms['form-principal'];
const ITENS_CONTAINER = () => document.getElementById('itens-container');
function replaceAtributosParaNovoItem(text, id) {
    return text
        .replaceAll(/value="[^"]*"/g, 'value=""')
        .replace(/(<[^>]*hx-get[^>]*class="[^"]*)\bcursor-pointer\b([^"]*")/g, '$1$2')
        .replace(/hx-get="[^"]*"/g, "")
        .replaceAll(/data-item-pk="true">[^<]*</g, "data-item-pk='true'>Novo<")
        .replaceAll(/data-item-label="true">[^<]*</g, ">...<")
        .replaceAll(/data-id="[^"]*"/g, `data-id='${id}'`);
}

function adicionar_item() {
    // Mobile
    const primeiro_item = document.querySelector('div[data-item="true"]');
    if(primeiro_item.innerHTML) {
        const novo_id = "___"+Math.random().toString(36).substring(2, 10);
        const novo_html = replaceAtributosParaNovoItem(primeiro_item.outerHTML, novo_id);
        ITENS_CONTAINER().insertAdjacentHTML('afterbegin', novo_html);
        const novo_item = ITENS_CONTAINER().querySelector(`div[data-id="${novo_id}"]`);
        novo_item.querySelector('input[type="hidden"][name="id[]"]').value = novo_id;
        novo_item.querySelector('input[data-remove-item]').addEventListener('change', gerencia_exluir);
        novo_item.querySelector('input[name="pular_upsert[]"]').value = 'N';
        htmx.process(novo_item);
    }
}
/**
 * Callback para evento de alteração em um checkbox.
 * Atualiza o valor de um input hidden 'excluir[]' conforme o estado do checkbox.
 * @param {Event} event - O objeto de evento do DOM.
 */
function gerencia_exluir(event) {
    event.target.parentNode.querySelector("input[type='hidden'][name='excluir[]']").value = event.target.checked ? 'S' : 'N';
    event.target.closest('div[data-item="true"]').dispatchEvent(new Event('input'))

}

export default function loadEvents() {
    const add_item = document.querySelectorAll("button[data-id='adicionar-item'");
    add_item.forEach(e => e.addEventListener('click', adicionar_item));
    const data_item = () => document.querySelectorAll('div[data-item="true"]');
    data_item().forEach(e => {
        e.addEventListener('input', (event) => {
            if(!e.querySelector('input[name="pular_upsert[]"]')) return;
            const input_modificado = [... e.querySelectorAll('input')].find(input => {
                return input.dataset.valorInicial != undefined && input.dataset.valorInicial != input.value
            })
            e.querySelector('input[name="pular_upsert[]"]').value = input_modificado ? 'N' : 'S';
        });
        e.querySelector('input[data-remove-item]').addEventListener('change', gerencia_exluir)
    });
    document.forms['form-principal'].addEventListener('htmx:configRequest', (e) => {
        const params = e.detail.parameters;
        const indicesParaRemover = [];
        data_item().forEach((container, index) => {
            const pular = container.querySelector('input[name="pular_upsert[]"][value="S"]');
            if (pular) {
                indicesParaRemover.push(index);
            }
        });
        indicesParaRemover.sort((a, b) => b - a);
        indicesParaRemover.forEach(index => {
            Object.keys(params).forEach(key => {
                if (Array.isArray(params[key])) {
                    params[key].splice(index, 1);
                }
            });
        });
    });
}
