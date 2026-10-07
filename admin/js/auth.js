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
    if (nombreEl) nombreEl.textContent = usuario.nombre || usuario.correo;

    const rolEl = document.getElementById('admin-usuario-rol');
    if (rolEl) rolEl.textContent = usuario.tipoUsuario;

    if (usuario.tipoUsuario === 'Vendedor') {
        // El vendedor no debe ver el módulo de Usuarios ni botones de gestión
        document.querySelectorAll('.solo-admin').forEach(el => el.style.display = 'none');
    }
}
