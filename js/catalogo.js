function buscarProducto() {
    var input = document.getElementById('buscarProducto');
    var resultado = document.getElementById('resultado-busqueda');

    if (input.value.trim() === '') {
        input.style.borderColor = 'red';
        resultado.innerHTML = 'Escribe algo para buscar';
        resultado.style.color = 'red';
        return;
    }

    input.style.borderColor = '';
    resultado.innerHTML = 'Buscando: "' + input.value.trim() + '"...';
    resultado.style.color = 'green';
}

// Referencia al contenedor en el HTML
const contenedorCatalogo = document.getElementById('contenedor-catalogo');

// Formateador de pesos chilenos
const formateadorPesos = new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0
});

function normalizarTexto(texto) {
    return texto
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLocaleLowerCase();
}

if (contenedorCatalogo) {
    const parametros = new URLSearchParams(window.location.search);
    const categoriaSolicitada = parametros.get('cat');
    const terminoBusqueda = normalizarTexto((parametros.get('buscar') || '').trim());
    const filtrosCategoria = {
        guitarras: producto => producto.categoria.startsWith('Guitarras'),
        bajos: producto => producto.categoria === 'Bajos Eléctricos',
        teclados: producto => producto.categoria === 'Teclados y Pianos',
        baterias: producto => producto.categoria === 'Baterías',
        amplificadores: producto => producto.categoria === 'Amplificadores',
        pedales: producto => producto.categoria === 'Pedales de Efectos',
        microfonos: producto => producto.categoria === 'Micrófonos',
        estudio: producto => producto.categoria === 'Estudio y Grabación',
        accesorios: producto => producto.categoria === 'Accesorios'
    };

    const filtroSeleccionado = filtrosCategoria[categoriaSolicitada];
    const categorias = {};

    for (const codigo in baseDeDatos) {
        const producto = baseDeDatos[codigo];
        if (filtroSeleccionado && !filtroSeleccionado(producto)) continue;
        if (terminoBusqueda && !normalizarTexto(producto.nombre).includes(terminoBusqueda)) continue;
        if (!categorias[producto.categoria]) categorias[producto.categoria] = [];
        categorias[producto.categoria].push({ codigo, producto });
    }

    const categoriasEncontradas = Object.entries(categorias);
    contenedorCatalogo.innerHTML = categoriasEncontradas.length ? categoriasEncontradas.map(([categoria, productos]) => `
        <section class="categoria-bloque">
            <h2>${categoria}</h2>
            <div class="galeria-catalogo">
                ${productos.map(({ codigo, producto }) => `
                    <a href="producto.html?id=${codigo}" class="enlace-tarjeta">
                        <div class="producto-card">
                            <img src="${producto.img}" alt="${producto.nombre}">
                            <span class="codigo">${codigo}</span>
                            <h4>${producto.nombre}</h4>
                            <p><strong>Marca:</strong> ${producto.marca}</p>
                            <p class="desc">${producto.descripcion}</p>
                            <p><strong>${formateadorPesos.format(producto.precio)}</strong></p>
                        </div>
                    </a>
                `).join('')}
            </div>
        </section>
    `).join('') : '<p class="sin-resultados">No encontramos productos con ese nombre.</p>';
}