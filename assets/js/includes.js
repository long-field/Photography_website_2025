document.addEventListener('DOMContentLoaded', () => {
    includeHTML();
});

function includeHTML() {
    const elements = document.querySelectorAll('[data-include]');
    elements.forEach(el => {
        const file = el.getAttribute('data-include');
        fetch(file)
            .then(response => {
                if (!response.ok) throw new Error(`Failed to fetch ${file}`);
                return response.text();
            })
            .then(data => el.innerHTML = data)
            .catch(err => console.error(err));
    });
}
