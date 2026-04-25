document.addEventListener('htmx:afterSwap', (e) => {
    if (!e.target.matches('[data-search-dropdown]')) return;

    const dropdown = e.target;
    const field    = dropdown.closest('[data-search-field]');

    dropdown.querySelectorAll('li').forEach(li => {
        li.addEventListener('click', () => {
            field.querySelector('[data-search-input]').value  = li.textContent.trim();
            field.querySelector('[data-search-hidden]').value = li.dataset.value;
            dropdown.classList.add('hidden');
        });
    });

    dropdown.classList.remove('hidden');
});

document.addEventListener('focusout', (e) => {
    const field = e.target.closest('[data-search-field]');
    if (!field) return;
    const data_item_container = field.closest('div[data-item="true"]');
    if(data_item_container) {
        data_item_container.dispatchEvent(new Event('input'));
    }

    // relatedTarget é o elemento que VAI receber o foco
    // se ainda estiver dentro do field, não fecha
    if (field.contains(e.relatedTarget)) return;

    field.querySelector('[data-search-dropdown]').classList.add('hidden');
});
