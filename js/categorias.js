// =====================================================================
// VISTA CATEGORÍAS (categorias.html)
// Muestra una tarjeta por categoría y, debajo, los productos de la
// categoría seleccionada (?cat=slug). Reutiliza crearTarjetaProducto()
// de js/catalogo.js para que las tarjetas se vean igual que en el catálogo.
// =====================================================================

function iconoCategoria(nombre) {
    const iconos = {
        'Guitarras Acústicas': 'bi-music-note-beamed',
        'Guitarras Eléctricas': 'bi-lightning-charge',
        'Bajos Eléctricos': 'bi-soundwave',
        'Baterías': 'bi-disc',
        'Teclados y Pianos': 'bi-piano',
        'Amplificadores': 'bi-speaker',
        'Micrófonos': 'bi-mic',
        'Pedales de Efectos': 'bi-sliders',
        'Accesorios': 'bi-bag',
        'Estudio y Grabación': 'bi-headphones'
    };
    return iconos[nombre] || 'bi-tag';
}

function renderizarCategorias() {
    const grid = document.getElementById('categorias-grid');
    if (!grid) return;

    const productos = obtenerProductos();
    const categorias = obtenerCategorias();
    const params = new URLSearchParams(window.location.search);
    const slugSeleccionado = params.get('cat') || slugCategoria(categorias[0]);

    grid.innerHTML = categorias.map(categoria => {
        const deCategoria = productos.filter(p => p.categoria === categoria);
        const imagen = deCategoria.length ? deCategoria[0].imagen : '';
        const slug = slugCategoria(categoria);
        return `
            <a href="categorias.html?cat=${slug}#categoria-seleccionada" class="tarjeta-categoria ${slug === slugSeleccionado ? 'activa' : ''}">
                ${imagen
                    ? `<img src="${escaparHTML(imagen)}" alt="${escaparHTML(categoria)}">`
                    : `<i class="bi ${iconoCategoria(categoria)} icono-categoria"></i>`}
                <span class="nombre-categoria">${escaparHTML(categoria)}</span>
                <span class="cantidad-categoria">${deCategoria.length} producto${deCategoria.length === 1 ? '' : 's'}</span>
            </a>
        `;
    }).join('');

    const categoriaActual = categorias.find(c => slugCategoria(c) === slugSeleccionado) || categorias[0];
    const productosCategoria = productos.filter(p => p.categoria === categoriaActual);

    document.getElementById('titulo-categoria').innerHTML =
        `<i class="bi ${iconoCategoria(categoriaActual)}"></i> ${escaparHTML(categoriaActual)}`;
    document.getElementById('cantidad-categoria').textContent =
        productosCategoria.length + ' producto' + (productosCategoria.length === 1 ? '' : 's');

    const contenedor = document.getElementById('productos-categoria');
    contenedor.innerHTML = productosCategoria.length
        ? productosCategoria.map(crearTarjetaProducto).join('')
        : '<p class="sin-resultados">Aún no hay productos en esta categoría.</p>';
}

document.addEventListener('DOMContentLoaded', renderizarCategorias);
