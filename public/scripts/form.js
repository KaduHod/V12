
const form = () => document.getElementById('form-<%= entidade.nome %>');
const desktopContainer = () => document.getElementById('itens-container-desktop');
const mobileContainer  = () => document.getElementById('itens-container-mobile');
const isMobile = () => window.innerWidth < 768;
function replaceAtributosParaNovoItem(text) {
    return text
            .replaceAll(/value="[^"]*"/g, 'value')
            .replaceAll(/hx-\w+="[^"]*"/g, "")
            .replaceAll(/data-item-pk="true">[^<]*</g, "><")
            .replaceAll(/data-item-label="true">[^<]*</g, "><");
}
function adicionar_item(e) {
    // Mobile
    const primeiro_item_mobile = document.querySelector('div[data-mobile-item="true"]');
    const primeiro_item_desktop = document.querySelector('tr[data-desktop-item="true"]');
    if(primeiro_item_mobile.innerHTML && primeiro_item_desktop.innerHTML) {
        mobileContainer().innerHTML += replaceAtributosParaNovoItem(primeiro_item_mobile.outerHTML);
        desktopContainer().innerHTML += replaceAtributosParaNovoItem(primeiro_item_desktop.outerHTML);
    }
}
export default function loadEvents() {
    const addItem = document.getElementById("adicionar-item");
    addItem.addEventListener('click', adicionar_item);
}

