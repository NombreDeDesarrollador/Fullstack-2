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

function renderizarCatalogo() {
    const contenedor = document.getElementById('contenedor-catalogo');
    if (!contenedor) return;

    const productos = obtenerProductos();

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
