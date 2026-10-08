// =====================================================================
// ÓRDENES / BOLETAS (admin/ordenes.html)
// Listado con búsqueda y filtro por estado. Cada fila enlaza a la boleta.
// =====================================================================

function renderizarResumenOrdenes(ordenes) {
    const pagadas = ordenes.filter(o => o.estado === 'Pagada');
    const monto = pagadas.reduce((suma, o) => suma + o.total, 0);
    document.getElementById('resumen-ordenes').innerHTML = `
        <div><span>Total órdenes</span><strong>${ordenes.length}</strong></div>
        <div><span>Pagadas</span><strong class="texto-verde">${pagadas.length}</strong></div>
        <div><span>Rechazadas</span><strong class="texto-rojo">${ordenes.length - pagadas.length}</strong></div>
        <div><span>Monto vendido</span><strong>${formatoPesos(monto)}</strong></div>
    `;
}

function renderizarTablaOrdenes() {
    const termino = document.getElementById('buscar-orden').value.trim().toLowerCase();
    const estado = document.getElementById('filtro-estado').value;

    const ordenes = obtenerOrdenes()
        .filter(o => !estado || o.estado === estado)
        .filter(o => !termino ||
            String(o.numero).includes(termino) ||
            (o.cliente.nombre + ' ' + o.cliente.apellidos).toLowerCase().includes(termino) ||
            o.cliente.correo.toLowerCase().includes(termino))
        .sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

    const tbody = document.getElementById('tabla-ordenes-body');
    if (ordenes.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="celda-vacia">No se encontraron órdenes.</td></tr>';
        return;
    }

    tbody.innerHTML = ordenes.map(o => `
        <tr>
            <td><strong>#${o.numero}</strong></td>
            <td>${formatoFecha(o.fecha)}</td>
            <td>${escaparHTML(o.cliente.nombre + ' ' + o.cliente.apellidos)}<br><span class="texto-suave">${escaparHTML(o.cliente.correo)}</span></td>
            <td>${cantidadItems(o)} u.</td>
            <td>${formatoPesos(o.total)}</td>
            <td>${badgeEstado(o.estado)}</td>
            <td><a href="boleta.html?numero=${o.numero}" class="accion-ver" title="Ver boleta"><i class="bi bi-eye"></i> Ver boleta</a></td>
        </tr>
    `).join('');
}

const usuario = requireRole(['Administrador', 'Vendedor']);
if (usuario) {
    iniciarLayoutAdmin(usuario);
    renderizarResumenOrdenes(obtenerOrdenes());
    renderizarTablaOrdenes();
    document.getElementById('buscar-orden').addEventListener('input', renderizarTablaOrdenes);
    document.getElementById('filtro-estado').addEventListener('change', renderizarTablaOrdenes);
}
