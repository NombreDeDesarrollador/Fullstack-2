// =====================================================================
// MOSTRAR PRODUCTO (admin/producto-detalle.html?codigo=)
// Ficha del producto + ventas calculadas desde las órdenes pagadas.
// =====================================================================

const usuario = requireRole(['Administrador', 'Vendedor']);
if (usuario) {
    iniciarLayoutAdmin(usuario);

    const codigo = new URLSearchParams(window.location.search).get('codigo');
    const producto = codigo ? buscarProductoPorCodigo(codigo) : null;

    if (!producto) {
        document.getElementById('ficha-producto').hidden = true;
        document.getElementById('btn-editar-producto').style.display = 'none';
        document.getElementById('producto-no-encontrado').hidden = false;
    } else {
        let vendidas = 0, ingresos = 0;
        obtenerOrdenes().filter(o => o.estado === 'Pagada').forEach(o => {
            o.items.filter(i => i.codigo === producto.codigo).forEach(i => {
                vendidas += i.cantidad;
                ingresos += i.cantidad * i.precio;
            });
        });

        const descuento = descuentoProducto(producto);
        document.getElementById('titulo-producto').textContent = producto.nombre;
        document.getElementById('det-imagen').src = producto.imagen;
        document.getElementById('det-imagen').alt = producto.nombre;
        document.getElementById('det-codigo').textContent = producto.codigo;
        document.getElementById('det-nombre').textContent = producto.nombre;
        document.getElementById('det-descripcion').textContent = producto.descripcion || 'Sin descripción.';
        document.getElementById('det-marca').textContent = producto.marca || '-';
        document.getElementById('det-categoria').textContent = producto.categoria;
        document.getElementById('det-precio').textContent = formatoPesos(producto.precio);
        document.getElementById('det-oferta').innerHTML = descuento
            ? `<span class="badge-estado pagada">-${descuento}%</span> ${formatoPesos(precioFinal(producto))}`
            : 'No';
        document.getElementById('det-stock').innerHTML = badgeStock(producto) + ' unidades';
        document.getElementById('det-stock-critico').textContent = producto.stockCritico ?? 0;
        document.getElementById('det-vendidas').textContent = vendidas;
        document.getElementById('det-ingresos').textContent = formatoPesos(ingresos);
        document.getElementById('det-ver-tienda').href = '../producto.html?codigo=' + encodeURIComponent(producto.codigo);
        document.getElementById('btn-editar-producto').href = 'producto-form.html?codigo=' + encodeURIComponent(producto.codigo);
    }
}
