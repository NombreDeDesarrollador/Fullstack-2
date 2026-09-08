// =====================================================================
// VALIDACIÓN DE INICIO DE SESIÓN
// Reglas de negocio (pauta):
//  - Correo: requerido, máx 100 caracteres, solo dominios permitidos.
//  - Contraseña: requerida, entre 4 y 10 caracteres.
// Además revisa contra los usuarios guardados en localStorage
// (los que se registraron en registro.html).
// =====================================================================

function marcarErrorLogin(campo, mensaje) {
    document.getElementById(campo).classList.add('is-invalid');
    document.getElementById('err-' + campo).textContent = mensaje;
}

function limpiarErroresLogin(campos) {
    campos.forEach(campo => {
        document.getElementById(campo).classList.remove('is-invalid');
        document.getElementById('err-' + campo).textContent = '';
    });
}

function validarLogin() {
    const campos = ['login-correo', 'login-clave'];
    limpiarErroresLogin(campos);

    const correo = document.getElementById('login-correo').value.trim();
    const clave = document.getElementById('login-clave').value;
    const resultado = document.getElementById('resultado-login');

    const dominiosPermitidos = ['duoc.cl', 'profesor.duoc.cl', 'gmail.com'];
    const dominioCorreo = correo.split('@')[1];
    let valido = true;

    if (!correo) {
        marcarErrorLogin('login-correo', 'El correo es requerido.');
        valido = false;
    } else if (correo.length > 100) {
        marcarErrorLogin('login-correo', 'Máximo 100 caracteres.');
        valido = false;
    } else if (!dominiosPermitidos.includes(dominioCorreo)) {
        marcarErrorLogin('login-correo', 'Solo se aceptan correos @duoc.cl, @profesor.duoc.cl o @gmail.com.');
        valido = false;
    }

    if (!clave) {
        marcarErrorLogin('login-clave', 'La contraseña es requerida.');
        valido = false;
    } else if (clave.length < 4 || clave.length > 10) {
        marcarErrorLogin('login-clave', 'Debe tener entre 4 y 10 caracteres.');
        valido = false;
    }

    if (!valido) {
        resultado.innerHTML = 'Revisa los campos marcados en rojo.';
        resultado.style.color = 'red';
        return false;
    }

    // Usuarios de la base de datos (usuariosDB.js ya la precarga con
    // Administrador y Vendedor de ejemplo, además de los registrados).
    const usuarios = obtenerUsuarios();

    const usuarioEncontrado = usuarios.find(u => u.correo === correo && u.clave === clave);

    if (usuarioEncontrado) {
        localStorage.setItem('usuarioActivo', JSON.stringify(usuarioEncontrado));
        resultado.innerHTML = 'Bienvenido, ' + (usuarioEncontrado.nombre || usuarioEncontrado.correo) + '. Acceso correcto.';
        resultado.style.color = 'green';
        const esAdminOVendedor = usuarioEncontrado.tipoUsuario === 'Administrador' || usuarioEncontrado.tipoUsuario === 'Vendedor';
        setTimeout(function () {
            window.location.href = esAdminOVendedor ? 'admin/home.html' : 'proyecto.html';
        }, 1000);
        return true;
    } else {
        marcarErrorLogin('login-correo', '');
        marcarErrorLogin('login-clave', '');
        resultado.innerHTML = 'Correo o contraseña incorrectos.';
        resultado.style.color = 'red';
        return false;
    }
}