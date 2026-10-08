// =====================================================================
// LISTADO DE PRODUCTOS (panel administrador)
// =====================================================================

function formatoPrecioAdmin(valor) {
    return valor.toLocaleString('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 });
}

function renderizarTablaProductos() {
    const productos = obtenerProductos();
    const tbody = document.getElementById('tabla-productos-body');

    tbody.innerHTML = productos.map(p => {
        let stockHtml = p.stock;
        if (p.stock === 0) {
            stockHtml = '<span class="badge-sin-stock">Sin stock</span>';
        } else if (p.stock <= p.stockCritico) {
            stockHtml = '<span class="badge-stock-critico">' + p.stock + ' (crítico)</span>';
        }

        return `
            <tr>
                <td>${p.codigo}</td>
                <td>${p.nombre}</td>
                <td>${p.categoria}</td>
                <td>${formatoPrecioAdmin(p.precio)}</td>
                <td>${stockHtml}</td>
                <td>
                    <div class="acciones-tabla">
                        <a href="producto-detalle.html?codigo=${encodeURIComponent(p.codigo)}" class="accion-ver" title="Ver detalle"><i class="bi bi-eye"></i></a>
                        <a href="producto-form.html?codigo=${encodeURIComponent(p.codigo)}" class="accion-editar solo-admin" title="Editar"><i class="bi bi-pencil"></i></a>
                        <button class="accion-eliminar solo-admin" onclick="eliminarProducto('${p.codigo}')"><i class="bi bi-trash"></i> Eliminar</button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

function eliminarProducto(codigo) {
    if (!confirm('¿Seguro que deseas eliminar el producto ' + codigo + '? Esta acción no se puede deshacer.')) return;
    const productos = obtenerProductos().filter(p => p.codigo !== codigo);
    guardarProductos(productos);
    renderizarTablaProductos();
}

const usuario = requireRole(['Administrador', 'Vendedor']);
if (usuario) {
    renderizarTablaProductos();
    iniciarLayoutAdmin(usuario); // después de la tabla, para ocultar acciones solo-admin al Vendedor
}