// =====================================================================
// MOSTRAR USUARIO + HISTORIAL DE COMPRAS (admin/usuario-detalle.html?run=)
// =====================================================================

const usuario = requireRole(['Administrador']);
if (usuario) {
    iniciarLayoutAdmin(usuario);

    const run = new URLSearchParams(window.location.search).get('run');
    const u = run ? buscarUsuarioPorRun(run) : null;

    if (!u) {
        document.getElementById('contenido-usuario').hidden = true;
        document.getElementById('btn-editar-usuario').style.display = 'none';
        document.getElementById('usuario-no-encontrado').hidden = false;
    } else {
        document.getElementById('det-nombre').textContent = (u.nombre + ' ' + (u.apellidos || '')).trim();
        document.getElementById('det-rol').textContent = u.tipoUsuario;
        document.getElementById('det-run').textContent = u.run || '-';
        document.getElementById('det-correo').textContent = u.correo;
        document.getElementById('det-telefono').textContent = u.telefono || '-';
        document.getElementById('det-region').textContent = u.region || '-';
        document.getElementById('det-comuna').textContent = u.comuna || '-';
        document.getElementById('det-direccion').textContent = u.direccion || '-';
        document.getElementById('btn-editar-usuario').href = 'usuario-form.html?run=' + encodeURIComponent(u.run);

        const historial = ordenesPorCorreo(u.correo).sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
        const gastado = historial.filter(o => o.estado === 'Pagada').reduce((s, o) => s + o.total, 0);
        document.getElementById('historial-resumen').textContent =
            historial.length + ' compra' + (historial.length === 1 ? '' : 's') + ' · Total gastado: ' + formatoPesos(gastado);

        document.getElementById('tabla-historial-body').innerHTML = historial.length
            ? historial.map(o => `
                <tr>
                    <td><strong>#${o.numero}</strong></td>
                    <td>${formatoFecha(o.fecha)}</td>
                    <td>${o.items.map(i => escaparHTML(i.nombre) + ' x' + i.cantidad).join('<br>')}</td>
                    <td>${formatoPesos(o.total)}</td>
                    <td>${badgeEstado(o.estado)}</td>
                    <td><a href="boleta.html?numero=${o.numero}" class="accion-ver"><i class="bi bi-eye"></i> Boleta</a></td>
                </tr>`).join('')
            : '<tr><td colspan="6" class="celda-vacia">Este usuario aún no registra compras.</td></tr>';
    }
}
