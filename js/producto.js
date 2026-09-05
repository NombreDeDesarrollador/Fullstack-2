document.addEventListener('DOMContentLoaded', () => {
    const idProducto = new URLSearchParams(window.location.search).get('id');
    const producto = baseDeDatos[idProducto];
    const contenedorProducto = document.getElementById('contenedor-producto');
    const mensajeError = document.getElementById('mensaje-error');

    if (!producto) {
        if (contenedorProducto) contenedorProducto.style.display = 'none';
        if (mensajeError) mensajeError.style.display = 'block';
        return;
    }

    const formateadorPesos = new Intl.NumberFormat('es-CL', {
        style: 'currency',
        currency: 'CLP',
        minimumFractionDigits: 0
    });

    document.getElementById('prod-codigo').textContent = idProducto;
    document.getElementById('prod-nombre').textContent = producto.nombre;
    document.getElementById('prod-marca').textContent = producto.marca;
    document.getElementById('prod-precio').textContent = formateadorPesos.format(producto.precio);
    document.getElementById('prod-desc').textContent = producto.descripcion;
    document.getElementById('prod-img').src = producto.img;
    document.getElementById('prod-img').alt = producto.nombre;
    document.title = `${producto.nombre} - Digital Sounds`;

    const elementoStock = document.querySelector('.stock');
    const botonComprar = document.querySelector('.btn-comprar');

    if (producto.stock > 0) {
        elementoStock.innerHTML = `<i class="bi bi-check-circle-fill"></i> Stock: ${producto.stock} unidades`;
        elementoStock.style.backgroundColor = '#d4edda';
        elementoStock.style.color = '#155724';
    } else {
        elementoStock.innerHTML = '<i class="bi bi-x-circle-fill"></i> Producto Agotado';
        elementoStock.style.backgroundColor = '#f8d7da';
        elementoStock.style.color = '#721c24';
        botonComprar.disabled = true;
        botonComprar.innerHTML = '<i class="bi bi-cart-x"></i> Sin stock';
    }
});
