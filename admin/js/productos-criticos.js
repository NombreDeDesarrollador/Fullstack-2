// =====================================================================
// LISTADO DE PRODUCTOS CRÍTICOS (admin/productos-criticos.html)
// =====================================================================

const usuario = requireRole(['Administrador', 'Vendedor']);
if (usuario) {
    const criticos = obtenerProductos().filter(esProductoCritico)
        .sort((a, b) => a.stock - b.stock);
    const agotados = criticos.filter(p => p.stock === 0).length;

    document.getElementById('resumen-criticos').innerHTML = `
        <div><span>Productos críticos</span><strong>${criticos.length}</strong></div>
        <div><span>Agotados</span><strong class="texto-rojo">${agotados}</strong></div>
        <div><span>Bajo stock crítico</span><strong class="texto-naranjo">${criticos.length - agotados}</strong></div>
    `;

    const tbody = document.getElementById('tabla-criticos-body');
    tbody.innerHTML = criticos.length
        ? criticos.map(p => `
            <tr>
                <td>${escaparHTML(p.codigo)}</td>
                <td>${escaparHTML(p.nombre)}</td>
                <td>${escaparHTML(p.categoria)}</td>
                <td>${p.stock}</td>
                <td>${p.stockCritico}</td>
                <td>${p.stock === 0
                    ? '<span class="badge-sin-stock">Agotado</span>'
                    : '<span class="badge-estado alerta"><i class="bi bi-exclamation-triangle"></i> Reponer</span>'}</td>
                <td>
                    <div class="acciones-tabla">
                        <a href="producto-detalle.html?codigo=${encodeURIComponent(p.codigo)}" class="accion-ver" title="Ver"><i class="bi bi-eye"></i></a>
                        <a href="producto-form.html?codigo=${encodeURIComponent(p.codigo)}" class="accion-editar solo-admin" title="Editar"><i class="bi bi-pencil"></i></a>
                    </div>
                </td>
            </tr>`).join('')
        : '<tr><td colspan="7" class="celda-vacia"><i class="bi bi-check-circle"></i> No hay productos críticos. ¡Todo el inventario está en orden!</td></tr>';

    // Se llama después de dibujar la tabla para ocultar los botones solo-admin al Vendedor
    iniciarLayoutAdmin(usuario);
}
