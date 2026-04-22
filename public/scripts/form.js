const FORM = () => document.getElementById('form-<%= entidade.nome %>');
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
        htmx.process(novo_item);
    }
}
export default function loadEvents() {
    const add_item = document.querySelectorAll("button[data-id='adicionar-item'");
    add_item.forEach(e => e.addEventListener('click', adicionar_item));
}
