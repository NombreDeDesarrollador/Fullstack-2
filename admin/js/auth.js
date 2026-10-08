// =====================================================================
// AUTENTICACIÓN Y ROLES DEL PANEL ADMINISTRADOR
// Roles del sistema:
//  - Administrador: acceso total (productos y usuarios).
//  - Vendedor: solo puede ver el listado y detalle de productos.
//  - Cliente: no tiene acceso al panel administrador.
// =====================================================================

function usuarioActivo() {
    const data = localStorage.getItem('usuarioActivo');
    return data ? JSON.parse(data) : null;
}

// Redirige al login si no hay sesión o el rol no está permitido en esta página.
// Devuelve el usuario activo si todo está OK.
function requireRole(rolesPermitidos) {
    const usuario = usuarioActivo();
    if (!usuario || !rolesPermitidos.includes(usuario.tipoUsuario)) {
        window.location.href = '../login.html';
        return null;
    }
    return usuario;
}

function cerrarSesion() {
    localStorage.removeItem('usuarioActivo');
    window.location.href = '../login.html';
}

// Ajusta el menú lateral y el nombre visible según el rol del usuario activo.
function iniciarLayoutAdmin(usuario) {
    const nombreEl = document.getElementById('admin-usuario-nombre');
    if (nombreEl) {
        // El nombre lleva al perfil del usuario (Administrador o Vendedor)
        nombreEl.innerHTML = '<a href="perfil.html" class="enlace-perfil" title="Ver mi perfil"></a>';
        nombreEl.firstChild.textContent = usuario.nombre || usuario.correo;
    }

    const rolEl = document.getElementById('admin-usuario-rol');
    if (rolEl) rolEl.textContent = usuario.tipoUsuario;

    if (usuario.tipoUsuario === 'Vendedor') {
        // El vendedor no debe ver el módulo de Usuarios ni botones de gestión
        document.querySelectorAll('.solo-admin').forEach(el => el.style.display = 'none');
    }
}


// ---------- Utilidades compartidas por las vistas del panel ----------

function formatoPesos(valor) {
    return (Number(valor) || 0).toLocaleString('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 });
}

function badgeEstado(estado) {
    const clase = estado === 'Pagada' ? 'pagada' : 'rechazada';
    const icono = estado === 'Pagada' ? 'bi-check-circle' : 'bi-x-circle';
    return `<span class="badge-estado ${clase}"><i class="bi ${icono}"></i> ${escaparHTML(estado)}</span>`;
}

function badgeStock(producto) {
    if (producto.stock === 0) return '<span class="badge-sin-stock">Sin stock</span>';
    if (producto.stock <= producto.stockCritico) return '<span class="badge-stock-critico">' + producto.stock + ' (crítico)</span>';
    return String(producto.stock);
}

function esProductoCritico(producto) {
    return producto.stock === 0 || producto.stock <= producto.stockCritico;
}

function cantidadItems(orden) {
    return orden.items.reduce((suma, item) => suma + item.cantidad, 0);
}

function inicialesDe(usuario) {
    const texto = ((usuario.nombre || '') + ' ' + (usuario.apellidos || '')).trim() || usuario.correo || '?';
    return texto.split(/\s+/).slice(0, 2).map(p => p[0]).join('').toUpperCase();
}
