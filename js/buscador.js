const buscador = document.getElementById('buscador-instrumentos');
const resultadoBusqueda = document.getElementById('resultado-busqueda');
const categorias = document.querySelectorAll('.categoria-bloque');

function normalizarTexto(texto) {
    return texto.toLocaleLowerCase('es').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function filtrarInstrumentos() {
    const busqueda = normalizarTexto(buscador.value.trim());
    let instrumentosVisibles = 0;

    categorias.forEach((categoria) => {
        let resultadosEnCategoria = 0;

        categoria.querySelectorAll('.producto-card').forEach((producto) => {
            const nombre = producto.querySelector('h4')?.textContent || '';
            const coincide = normalizarTexto(nombre).includes(busqueda);

            producto.hidden = !coincide;
            if (coincide) {
                resultadosEnCategoria += 1;
            }
        });

        categoria.hidden = resultadosEnCategoria === 0;
        instrumentosVisibles += resultadosEnCategoria;
    });

    if (busqueda && instrumentosVisibles === 0) {
        resultadoBusqueda.textContent = 'No se encontraron instrumentos con ese nombre.';
    } else if (busqueda) {
        resultadoBusqueda.textContent = `${instrumentosVisibles} instrumento${instrumentosVisibles === 1 ? '' : 's'} encontrado${instrumentosVisibles === 1 ? '' : 's'}.`;
    } else {
        resultadoBusqueda.textContent = '';
    }
}

buscador.addEventListener('input', filtrarInstrumentos);
