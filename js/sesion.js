// =====================================================================
// SESIÓN EN EL HEADER DE LA TIENDA
// Si hay un usuario con sesión iniciada, el enlace "Cuenta" se cambia
// por su nombre y lo lleva a su lugar según el rol:
//  - Cliente            -> mi-cuenta.html (perfil y mis compras)
//  - Administrador/Vendedor -> admin/home.html (panel con sus acciones)
// =====================================================================

function obtenerUsuarioActivo() {
    try { return JSON.parse(localStorage.getItem('usuarioActivo')); } catch (e) { return null; }
}

function cerrarSesionTienda() {
    localStorage.removeItem('usuarioActivo');
    window.location.href = 'proyecto.html';
}

document.addEventListener('DOMContentLoaded', function () {
    const usuario = obtenerUsuarioActivo();
    const enlaceCuenta = document.querySelector('.iconos-header a[href="login.html"]');
    if (!usuario || !enlaceCuenta) return;

    const esPersonal = usuario.tipoUsuario === 'Administrador' || usuario.tipoUsuario === 'Vendedor';
    const nombre = (usuario.nombre || usuario.correo || 'Mi cuenta').split(' ')[0];

    enlaceCuenta.href = esPersonal ? 'admin/home.html' : 'mi-cuenta.html';
    enlaceCuenta.title = esPersonal ? 'Ir al panel de ' + usuario.tipoUsuario : 'Ver mi perfil y mis compras';
    enlaceCuenta.classList.add('cuenta-activa');
    enlaceCuenta.innerHTML = `<i class="bi ${esPersonal ? 'bi-speedometer2' : 'bi-person-check'}"></i><span></span>`;
    enlaceCuenta.querySelector('span').textContent = nombre;

    const salir = document.createElement('a');
    salir.href = '#';
    salir.title = 'Cerrar sesión';
    salir.innerHTML = '<i class="bi bi-box-arrow-right"></i><span>Salir</span>';
    salir.addEventListener('click', function (e) {
        e.preventDefault();
        cerrarSesionTienda();
    });
    enlaceCuenta.insertAdjacentElement('afterend', salir);
});
