// =====================================================================
// LÓGICA DEL DETALLE DE PRODUCTO
// Lee el parámetro ?codigo= de la URL, busca el producto en la
// "base de datos" (js/baseDeDatos.js) y rellena la vista.
// También agrega el producto al carrito guardado en localStorage.
// =====================================================================

function formatoPrecioProd(valor) {
    return valor.toLocaleString('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 });
}

function obtenerCarrito() {
    const carrito = localStorage.getItem('carrito');
    return carrito ? JSON.parse(carrito) : [];
}

function guardarCarrito(carrito) {
    localStorage.setItem('carrito', JSON.stringify(carrito));
}

function agregarAlCarrito(producto) {
    const carrito = obtenerCarrito();
    const existente = carrito.find(item => item.codigo === producto.codigo);

    if (existente) {
        existente.cantidad += 1;
    } else {
        carrito.push({
            codigo: producto.codigo,
            nombre: producto.nombre,
            precio: producto.precio,
            imagen: producto.imagen,
            cantidad: 1
        });
    }

    guardarCarrito(carrito);
    alert('"' + producto.nombre + '" fue añadido al carrito.');
}

document.addEventListener('DOMContentLoaded', function () {
    const params = new URLSearchParams(window.location.search);
    const codigo = params.get('codigo');
    const producto = codigo ? buscarProductoPorCodigo(codigo) : null;

    const contenedor = document.getElementById('contenedor-producto');
    const mensajeError = document.getElementById('mensaje-error');

    if (!producto) {
        contenedor.style.display = 'none';
        mensajeError.style.display = 'block';
        return;
    }

    document.getElementById('prod-img').src = producto.imagen;
    document.getElementById('prod-img').alt = producto.nombre;
    document.getElementById('prod-codigo').textContent = producto.codigo;
    document.getElementById('prod-nombre').textContent = producto.nombre;
    document.getElementById('prod-marca').textContent = producto.marca;
    document.getElementById('prod-precio').textContent = formatoPrecioProd(producto.precio);
    document.getElementById('prod-desc').textContent = producto.descripcion;

    const spanStock = document.querySelector('.stock');
    if (producto.stock === 0) {
        spanStock.innerHTML = '<i class="bi bi-x-circle-fill"></i> Sin stock';
        spanStock.style.color = '#c0392b';
    } else if (producto.stock <= producto.stockCritico) {
        spanStock.innerHTML = '<i class="bi bi-exclamation-triangle-fill"></i> ¡Últimas unidades! (' + producto.stock + ')';
        spanStock.style.color = '#e67e22';
    }

    const btnComprar = document.querySelector('.btn-comprar');
    if (producto.stock === 0) {
        btnComprar.disabled = true;
        btnComprar.textContent = 'Sin stock';
    } else {
        btnComprar.addEventListener('click', function () {
            agregarAlCarrito(producto);
        });
    }
});
