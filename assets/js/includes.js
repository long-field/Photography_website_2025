document.addEventListener('DOMContentLoaded', () => {
    includeHTML();
});

function includeHTML() {
    const elements = document.querySelectorAll('[data-include]');
    let loadedCount = 0;
    const total = elements.length;

    if (total === 0) {
        document.dispatchEvent(new Event('includesLoaded'));
        return;
    }

    elements.forEach(el => {
        const file = el.getAttribute('data-include');
        fetch(file)
            .then(response => {
                if (!response.ok) throw new Error(`Failed to fetch ${file}`);
                return response.text();
            })
            .then(data => {
                el.innerHTML = data;
                loadedCount++;
                if (loadedCount === total) {
                    document.dispatchEvent(new Event('includesLoaded'));
                }
            })
            .catch(err => {
                console.error(err);
                loadedCount++;
                if (loadedCount === total) {
                    document.dispatchEvent(new Event('includesLoaded'));
                }
            });
    });
}