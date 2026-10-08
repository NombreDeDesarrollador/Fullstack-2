// =====================================================================
// DASHBOARD (admin/home.html)
// Tarjetas de resumen, accesos rápidos y últimas órdenes.
// =====================================================================

const usuario = requireRole(['Administrador', 'Vendedor']);
if (usuario) {
    iniciarLayoutAdmin(usuario);
    document.getElementById('saludo-nombre').textContent = usuario.nombre || usuario.correo;

    const productos = obtenerProductos();
    const ordenes = obtenerOrdenes();
    const pagadas = ordenes.filter(o => o.estado === 'Pagada');
    const ventas = pagadas.reduce((suma, o) => suma + o.total, 0);
    const criticos = productos.filter(esProductoCritico);

    document.getElementById('stat-compras').textContent = pagadas.length;
    document.getElementById('stat-compras-detalle').textContent = 'Ventas totales: ' + formatoPesos(ventas);

    document.getElementById('stat-productos').textContent = productos.length;
    document.getElementById('stat-productos-detalle').textContent =
        'Inventario actual: ' + productos.reduce((suma, p) => suma + p.stock, 0) + ' unidades';

    if (usuario.tipoUsuario === 'Administrador') {
        const usuarios = obtenerUsuarios();
        document.getElementById('stat-usuarios').textContent = usuarios.length;
        document.getElementById('stat-usuarios-detalle').textContent =
            'Clientes: ' + usuarios.filter(u => u.tipoUsuario === 'Cliente').length;
    }

    if (criticos.length) {
        const alerta = document.getElementById('alerta-criticos');
        alerta.innerHTML = `<i class="bi bi-exclamation-triangle-fill"></i>
            Hay <strong>${criticos.length}</strong> producto${criticos.length === 1 ? '' : 's'} con stock crítico o agotado.
            <a href="productos-criticos.html">Revisar listado</a>`;
        alerta.hidden = false;
    }

    const ultimas = ordenes.slice().sort((a, b) => new Date(b.fecha) - new Date(a.fecha)).slice(0, 5);
    document.getElementById('tabla-ultimas-ordenes').innerHTML = ultimas.length
        ? ultimas.map(o => `
            <tr>
                <td><a href="boleta.html?numero=${o.numero}" class="enlace-admin">#${o.numero}</a></td>
                <td>${formatoFecha(o.fecha)}</td>
                <td>${escaparHTML(o.cliente.nombre + ' ' + o.cliente.apellidos)}</td>
                <td>${formatoPesos(o.total)}</td>
                <td>${badgeEstado(o.estado)}</td>
            </tr>`).join('')
        : '<tr><td colspan="5" class="celda-vacia">Aún no hay órdenes.</td></tr>';
}
