// =====================================================================
// MI CUENTA (mi-cuenta.html) - solo para clientes con sesión iniciada
// Muestra sus datos (editables) y el listado de sus compras.
// =====================================================================

function formatoPesosCuenta(valor) {
    return (Number(valor) || 0).toLocaleString('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 });
}

function usuarioGuardado() {
    const activo = obtenerUsuarioActivo(); // js/sesion.js
    return obtenerUsuarios().find(u => u.correo === activo.correo) || activo;
}

function pintarDatosPerfil(u) {
    document.getElementById('cuenta-saludo').textContent = u.nombre || u.correo;
    document.getElementById('dato-nombre').textContent = ((u.nombre || '') + ' ' + (u.apellidos || '')).trim() || '-';
    document.getElementById('dato-correo').textContent = u.correo || '-';
    document.getElementById('dato-run').textContent = u.run || '-';
    document.getElementById('dato-telefono').textContent = u.telefono || '-';
    const ubicacion = [u.comuna, u.region].filter(Boolean).join(', ');
    document.getElementById('dato-direccion').textContent = (u.direccion || '-') + (ubicacion ? ' — ' + ubicacion : '');
}

function mostrarFormularioPerfil(mostrar) {
    document.getElementById('datos-perfil').hidden = mostrar;
    document.getElementById('form-perfil-cliente').hidden = !mostrar;
    document.getElementById('btn-editar-perfil').hidden = mostrar;
    document.getElementById('aviso-perfil').hidden = true;
    if (mostrar) {
        const u = usuarioGuardado();
        ['nombre', 'apellidos', 'telefono', 'direccion'].forEach(c => {
            document.getElementById(c).value = u[c] || '';
            document.getElementById(c).classList.remove('is-invalid');
            document.getElementById('err-' + c).textContent = '';
        });
    }
}

function guardarPerfilCliente(evento) {
    evento.preventDefault();
    const datos = {};
    ['nombre', 'apellidos', 'telefono', 'direccion'].forEach(c => {
        datos[c] = document.getElementById(c).value.trim();
        document.getElementById(c).classList.remove('is-invalid');
        document.getElementById('err-' + c).textContent = '';
    });

    const errores = {};
    if (!datos.nombre) errores.nombre = 'El nombre es requerido.';
    if (!datos.apellidos) errores.apellidos = 'Los apellidos son requeridos.';
    if (datos.telefono && !/^\+?[\d\s]{8,15}$/.test(datos.telefono)) errores.telefono = 'Teléfono no válido.';
    if (!datos.direccion) errores.direccion = 'La dirección es requerida.';

    if (Object.keys(errores).length) {
        Object.entries(errores).forEach(([c, msg]) => {
            document.getElementById(c).classList.add('is-invalid');
            document.getElementById('err-' + c).textContent = msg;
        });
        return;
    }

    const usuarios = obtenerUsuarios();
    const activo = obtenerUsuarioActivo();
    const u = usuarios.find(x => x.correo === activo.correo);
    Object.assign(u || activo, datos);
    if (u) guardarUsuarios(usuarios);
    localStorage.setItem('usuarioActivo', JSON.stringify(u || activo));

    pintarDatosPerfil(u || activo);
    mostrarFormularioPerfil(false);
    const aviso = document.getElementById('aviso-perfil');
    aviso.textContent = 'Tus datos se guardaron correctamente.';
    aviso.hidden = false;
}

function pintarMisCompras(correo) {
    const compras = ordenesPorCorreo(correo).sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    const lista = document.getElementById('lista-compras');
    const pagadas = compras.filter(o => o.estado === 'Pagada');

    document.getElementById('resumen-compras').textContent = compras.length
        ? pagadas.length + ' pagada' + (pagadas.length === 1 ? '' : 's') + ' · ' + formatoPesosCuenta(pagadas.reduce((s, o) => s + o.total, 0))
        : '';

    if (!compras.length) {
        lista.innerHTML = '<li class="compra-vacia">Aún no tienes compras. <a href="catalogo.html">Ir al catálogo</a></li>';
        return;
    }

    lista.innerHTML = compras.map(o => {
        const pagada = o.estado === 'Pagada';
        const destino = (pagada ? 'compra-exitosa.html' : 'compra-error.html') + '?orden=' + o.numero;
        const unidades = o.items.reduce((s, i) => s + i.cantidad, 0);
        return `
            <li>
                <div>
                    <strong>Orden #${o.numero}</strong>
                    <span class="texto-tenue">${formatoFecha(o.fecha)} · ${unidades} producto${unidades === 1 ? '' : 's'}</span>
                </div>
                <div class="compra-derecha">
                    <span class="estado-simple ${pagada ? 'ok' : 'error'}">${o.estado}</span>
                    <strong>${formatoPesosCuenta(o.total)}</strong>
                    <a href="${destino}" class="enlace-simple">Ver detalle</a>
                </div>
            </li>`;
    }).join('');
}

// Sin sesión -> login. Administrador/Vendedor -> su panel.
(function () {
    const activo = obtenerUsuarioActivo();
    if (!activo) { window.location.href = 'login.html'; return; }
    if (activo.tipoUsuario === 'Administrador' || activo.tipoUsuario === 'Vendedor') {
        window.location.href = 'admin/perfil.html';
        return;
    }
    document.addEventListener('DOMContentLoaded', function () {
        const u = usuarioGuardado();
        pintarDatosPerfil(u);
        pintarMisCompras(u.correo);
        document.getElementById('btn-editar-perfil').addEventListener('click', () => mostrarFormularioPerfil(true));
        document.getElementById('btn-cancelar-perfil').addEventListener('click', () => mostrarFormularioPerfil(false));
        document.getElementById('form-perfil-cliente').addEventListener('submit', guardarPerfilCliente);
    });
})();
