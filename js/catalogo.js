// =====================================================================
// LÓGICA DEL CATÁLOGO
// Lee el arreglo "productos" (js/baseDeDatos.js) y arma la vista
// agrupada por categoría, con tarjeta y enlace al detalle del producto.
// =====================================================================

function formatoPrecio(valor) {
    return valor.toLocaleString('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 });
}

function crearTarjetaProducto(producto) {
    const sinStock = producto.stock === 0;
    return `
        <a href="producto.html?codigo=${producto.codigo}" class="enlace-tarjeta">
            <div class="producto-card">
                <span class="codigo">${producto.codigo}</span>
                <img src="${producto.imagen}" alt="${producto.nombre}">
                <h4>${producto.nombre}</h4>
                <p><strong>${formatoPrecio(producto.precio)}</strong></p>
                <p class="desc">${producto.marca}</p>
                ${sinStock ? '<p class="desc" style="color:#c0392b;font-weight:600;">Sin stock</p>' : ''}
            </div>
        </a>
    `;
}

function normalizarTexto(texto) {
    return texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase();
}

// Filtros por categoría (parámetro ?cat= que usan los enlaces de proyecto.html)
const filtrosCategoria = {
    guitarras: p => p.categoria.startsWith('Guitarras'),
    bajos: p => p.categoria === 'Bajos Eléctricos',
    teclados: p => p.categoria === 'Teclados y Pianos',
    baterias: p => p.categoria === 'Baterías',
    amplificadores: p => p.categoria === 'Amplificadores',
    pedales: p => p.categoria === 'Pedales de Efectos',
    microfonos: p => p.categoria === 'Micrófonos',
    estudio: p => p.categoria === 'Estudio y Grabación',
    accesorios: p => p.categoria === 'Accesorios'
};

function renderizarCatalogo() {
    const contenedor = document.getElementById('contenedor-catalogo');
    if (!contenedor) return;

    const parametros = new URLSearchParams(window.location.search);
    const filtroCategoria = filtrosCategoria[parametros.get('cat')];
    const termino = normalizarTexto((parametros.get('buscar') || '').trim());

    const productos = obtenerProductos().filter(p =>
        (!filtroCategoria || filtroCategoria(p)) &&
        (!termino || normalizarTexto(p.nombre).includes(termino))
    );

    if (productos.length === 0) {
        contenedor.innerHTML = '<p class="sin-resultados">No se encontraron productos.</p>';
        return;
    }

<<<<<<< HEAD
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
=======
    // Agrupar productos por categoría
    const categorias = [...new Set(productos.map(p => p.categoria))];

    let html = '';
    categorias.forEach(categoria => {
        const productosCategoria = productos.filter(p => p.categoria === categoria);
        html += `
            <div class="categoria-bloque">
                <h2>${categoria}</h2>
                <div class="galeria-catalogo">
                    ${productosCategoria.map(crearTarjetaProducto).join('')}
                </div>
            </div>
        `;
    });

    contenedor.innerHTML = html;
}

document.addEventListener('DOMContentLoaded', renderizarCatalogo);
>>>>>>> main
