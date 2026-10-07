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
