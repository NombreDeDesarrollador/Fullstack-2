// =====================================================================
// MOSTRAR BOLETA (admin/boleta.html?numero=)
// =====================================================================

const usuario = requireRole(['Administrador', 'Vendedor']);
if (usuario) {
    iniciarLayoutAdmin(usuario);

    const numero = new URLSearchParams(window.location.search).get('numero');
    const orden = numero ? buscarOrdenPorNumero(numero) : null;

    if (!orden) {
        document.getElementById('boleta').hidden = true;
        document.getElementById('boleta-no-encontrada').hidden = false;
    } else {
        const d = orden.direccion;
        document.getElementById('boleta-numero').textContent = 'N° ' + orden.numero;
        document.getElementById('boleta-estado').innerHTML = badgeEstado(orden.estado);
        document.getElementById('boleta-cliente').textContent = orden.cliente.nombre + ' ' + orden.cliente.apellidos;
        document.getElementById('boleta-correo').textContent = orden.cliente.correo;
        document.getElementById('boleta-direccion').textContent =
            d.calle + (d.departamento ? ', ' + d.departamento : '') + ' — ' + d.comuna + ', ' + d.region;
        document.getElementById('boleta-indicaciones').textContent = d.indicaciones ? 'Indicaciones: ' + d.indicaciones : '';
        document.getElementById('boleta-fecha').textContent = formatoFecha(orden.fecha);
        document.getElementById('boleta-codigo').textContent = orden.codigo;
        document.getElementById('boleta-medio').textContent = orden.medioPago || 'Webpay';

        document.getElementById('boleta-items').innerHTML = orden.items.map(item => `
            <tr>
                <td>${escaparHTML(item.codigo)}</td>
                <td>${escaparHTML(item.nombre)}</td>
                <td>${formatoPesos(item.precio)}</td>
                <td>${item.cantidad}</td>
                <td>${formatoPesos(item.precio * item.cantidad)}</td>
            </tr>`).join('');

        // Los precios incluyen IVA: se desglosa neto + IVA
        const neto = Math.round(orden.total / 1.19);
        document.getElementById('boleta-neto').textContent = formatoPesos(neto);
        document.getElementById('boleta-iva').textContent = formatoPesos(orden.total - neto);
        document.getElementById('boleta-total').textContent = formatoPesos(orden.total);
        if (orden.estado !== 'Pagada') {
            document.getElementById('boleta-motivo').textContent =
                'Pago rechazado' + (orden.motivo ? ': ' + orden.motivo : '.') + ' Esta boleta no es válida como comprobante.';
        }
    }
}
