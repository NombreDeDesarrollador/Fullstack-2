// =====================================================================
// VISTA OFERTAS (ofertas.html)
// Lista los productos que tienen descuento (ver ofertasProductos en
// js/baseDeDatos.js). Permite filtrar por categoría, ordenar y
// agregar directamente al carrito con el precio rebajado.
// =====================================================================

function formatoPrecioOferta(valor) {
    return valor.toLocaleString('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 });
}

function productosEnOferta() {
    return obtenerProductos().filter(p => descuentoProducto(p) > 0);
}

function crearTarjetaOferta(producto) {
    const descuento = descuentoProducto(producto);
    const sinStock = getStock(producto.codigo, producto.stock) <= 0;
    return `
        <div class="tarjeta-oferta">
            <span class="badge-descuento">-${descuento}%</span>
            <a href="producto.html?codigo=${encodeURIComponent(producto.codigo)}" class="enlace-tarjeta">
                <img src="${escaparHTML(producto.imagen)}" alt="${escaparHTML(producto.nombre)}">
                <span class="marca-oferta">${escaparHTML(producto.marca)}</span>
                <h3>${escaparHTML(producto.nombre)}</h3>
            </a>
            <div class="precios-oferta">
                <span class="precio-anterior">${formatoPrecioOferta(producto.precio)}</span>
                <span class="precio-oferta">${formatoPrecioOferta(precioFinal(producto))}</span>
            </div>
            <p class="ahorro-oferta">Ahorras ${formatoPrecioOferta(producto.precio - precioFinal(producto))}</p>
            <button class="btn-anadir" data-codigo="${escaparHTML(producto.codigo)}" ${sinStock ? 'disabled' : ''}>
                <i class="bi bi-cart-plus"></i> ${sinStock ? 'Sin stock' : 'Añadir al carrito'}
            </button>
        </div>
    `;
}

function renderizarOfertas() {
    const grilla = document.getElementById('grilla-ofertas');
    const categoria = document.getElementById('filtro-categoria-ofertas').value;
    const orden = document.getElementById('orden-ofertas').value;

    let lista = productosEnOferta().filter(p => !categoria || p.categoria === categoria);

    if (orden === 'descuento') lista.sort((a, b) => descuentoProducto(b) - descuentoProducto(a));
    if (orden === 'precio-asc') lista.sort((a, b) => precioFinal(a) - precioFinal(b));
    if (orden === 'precio-desc') lista.sort((a, b) => precioFinal(b) - precioFinal(a));

    document.getElementById('contador-ofertas').textContent =
        lista.length + ' producto' + (lista.length === 1 ? '' : 's') + ' en oferta';

    grilla.innerHTML = lista.length
        ? lista.map(crearTarjetaOferta).join('')
        : '<p class="sin-resultados">No hay ofertas en esta categoría por ahora.</p>';
}

document.addEventListener('DOMContentLoaded', function () {
    const ofertas = productosEnOferta();
    const maximo = ofertas.reduce((max, p) => Math.max(max, descuentoProducto(p)), 0);
    document.getElementById('max-descuento').textContent = maximo + '%';

    const selectCategoria = document.getElementById('filtro-categoria-ofertas');
    const categorias = [...new Set(ofertas.map(p => p.categoria))];
    selectCategoria.innerHTML += categorias.map(c => `<option value="${escaparHTML(c)}">${escaparHTML(c)}</option>`).join('');

    selectCategoria.addEventListener('change', renderizarOfertas);
    document.getElementById('orden-ofertas').addEventListener('change', renderizarOfertas);

    // Un solo listener para todos los botones "Añadir" (delegación de eventos)
    document.getElementById('grilla-ofertas').addEventListener('click', function (e) {
        const boton = e.target.closest('.btn-anadir');
        if (!boton) return;
        const producto = buscarProductoPorCodigo(boton.dataset.codigo);
        if (!producto) return;
        const agregado = addToCarrito({
            id: producto.codigo,
            name: producto.nombre,
            price: precioFinal(producto),
            image: producto.imagen,
            stock: producto.stock
        });
        if (agregado) {
            boton.innerHTML = '<i class="bi bi-check-lg"></i> Agregado';
            boton.classList.add('agregado');
            setTimeout(() => {
                boton.innerHTML = '<i class="bi bi-cart-plus"></i> Añadir al carrito';
                boton.classList.remove('agregado');
            }, 1200);
        }
    });

    renderizarOfertas();
});
