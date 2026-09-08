function ejecutarBusqueda(input) {
    const termino = input.value.trim();
    const destino = termino ? `catalogo.html?buscar=${encodeURIComponent(termino)}` : 'catalogo.html';
    window.location.href = destino;
}

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.buscador-header').forEach(buscador => {
        const input = buscador.querySelector('input');
        const boton = buscador.querySelector('button');
        if (!input || !boton) return;

        const terminoActual = new URLSearchParams(window.location.search).get('buscar');
        if (terminoActual) input.value = terminoActual;

        boton.addEventListener('click', () => ejecutarBusqueda(input));
        input.addEventListener('keydown', event => {
            if (event.key === 'Enter') ejecutarBusqueda(input);
        });
    });
});
