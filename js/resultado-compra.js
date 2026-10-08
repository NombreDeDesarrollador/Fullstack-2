// =====================================================================
// RESULTADO DE LA COMPRA (compra-exitosa.html y compra-error.html)
// Lee ?orden= de la URL, busca la orden en js/ordenesDB.js y muestra
// el resumen (datos del cliente, dirección, productos y total).
// =====================================================================

function imagenItemOrden(item) {
    if (item.imagen) return item.imagen;
    const producto = buscarProductoPorCodigo(item.codigo);
    return producto ? producto.imagen : '';
}

document.addEventListener('DOMContentLoaded', function () {
    const numero = new URLSearchParams(window.location.search).get('orden');
    const orden = numero ? buscarOrdenPorNumero(numero) : null;
    const seccion = document.getElementById('resultado-compra');

    if (!orden) {
        seccion.style.display = 'none';
        document.getElementById('mensaje-error').style.display = 'block';
        return;
    }

    document.querySelectorAll('.nro-orden').forEach(el => el.textContent = '#' + orden.numero);
    document.querySelectorAll('.codigo-orden-valor').forEach(el => el.textContent = orden.codigo);

    const valores = {
        'res-nombre': orden.cliente.nombre,
        'res-apellidos': orden.cliente.apellidos,
        'res-correo': orden.cliente.correo,
        'res-calle': orden.direccion.calle,
        'res-departamento': orden.direccion.departamento,
        'res-region': orden.direccion.region,
        'res-comuna': orden.direccion.comuna,
        'res-indicaciones': orden.direccion.indicaciones
    };
    Object.entries(valores).forEach(([id, valor]) => {
        document.getElementById(id).value = valor || '';
    });

    document.getElementById('res-items').innerHTML = orden.items.map(item => `
        <tr>
            <td><img class="miniatura-compra" src="${escaparHTML(imagenItemOrden(item))}" alt="${escaparHTML(item.nombre)}"></td>
            <td>${escaparHTML(item.nombre)}</td>
            <td>${formatCLP(item.precio)}</td>
            <td>${item.cantidad}</td>
            <td>${formatCLP(item.precio * item.cantidad)}</td>
        </tr>
    `).join('');
    document.getElementById('res-total').textContent = formatCLP(orden.total);

    // Motivo del rechazo (solo en compra-error.html)
    const subtitulo = seccion.querySelector('.subtitulo-form');
    if (orden.estado === 'Rechazada' && orden.motivo && seccion.classList.contains('resultado-error')) {
        subtitulo.innerHTML = '<strong>Motivo:</strong> ' + escaparHTML(orden.motivo) + ' Tu carrito sigue guardado, puedes intentarlo nuevamente.';
    }

    // "Enviar boleta por email" (simulado)
    const btnEmail = document.getElementById('btn-enviar-email');
    if (btnEmail) {
        btnEmail.addEventListener('click', function () {
            const aviso = document.getElementById('aviso-email');
            aviso.innerHTML = '<i class="bi bi-check-circle-fill"></i> La boleta fue enviada a <strong>' + escaparHTML(orden.cliente.correo) + '</strong>';
            aviso.hidden = false;
        });
    }
});
