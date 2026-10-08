// =====================================================================
// FORMULARIO NUEVO / EDITAR USUARIO (panel administrador)
// Reglas (mismas que el registro de la tienda):
//  - RUN: requerido, válido (dígito verificador), sin repetir.
//  - Nombre: requerido, máx 50. Apellidos: requerido, máx 100.
//  - Correo: requerido, máx 100, dominios @duoc.cl, @profesor.duoc.cl o @gmail.com, sin repetir.
//  - Contraseña: entre 4 y 10 caracteres (al editar es opcional).
//  - Tipo de usuario: requerido. Dirección: requerida, máx 300.
// =====================================================================

let modoEdicionUsuario = false;

function marcarErrorUsuario(campo, mensaje) {
    const input = document.getElementById(campo);
    if (input) input.classList.add('is-invalid');
    const error = document.getElementById('err-' + campo);
    if (error) error.textContent = mensaje;
}

function limpiarErroresUsuario(campos) {
    campos.forEach(campo => {
        const input = document.getElementById(campo);
        if (input) input.classList.remove('is-invalid');
        const error = document.getElementById('err-' + campo);
        if (error) error.textContent = '';
    });
}

function cargarUsuarioParaEditar(run) {
    const u = buscarUsuarioPorRun(run);
    if (!u) return;

    modoEdicionUsuario = true;
    document.getElementById('titulo-pagina').textContent = 'Editar Usuario - Panel Administrador';
    document.getElementById('titulo-form').textContent = 'Editar Usuario: ' + (u.nombre || u.correo);
    document.getElementById('ayuda-clave').textContent = '(déjala en blanco para mantener la actual)';

    document.getElementById('run-original').value = u.run;
    document.getElementById('run').value = u.run;
    document.getElementById('run').disabled = true; // el RUN es la llave del usuario
    document.getElementById('fechaNacimiento').value = u.fechaNacimiento || '';
    document.getElementById('nombre').value = u.nombre || '';
    document.getElementById('apellidos').value = u.apellidos || '';
    document.getElementById('correo').value = u.correo || '';
    document.getElementById('tipoUsuario').value = u.tipoUsuario || 'Cliente';
    document.getElementById('direccion').value = u.direccion || '';

    const selectRegion = document.getElementById('region');
    if (u.region) {
        selectRegion.value = u.region;
        selectRegion.dispatchEvent(new Event('change'));
        document.getElementById('comuna').value = u.comuna || '';
    }
}

function guardarFormularioUsuario() {
    const campos = ['run', 'nombre', 'apellidos', 'correo', 'clave', 'tipoUsuario', 'direccion'];
    limpiarErroresUsuario(campos);

    const run = document.getElementById('run').value.trim().toUpperCase();
    const nombre = document.getElementById('nombre').value.trim();
    const apellidos = document.getElementById('apellidos').value.trim();
    const correo = document.getElementById('correo').value.trim();
    const clave = document.getElementById('clave').value;
    const tipoUsuario = document.getElementById('tipoUsuario').value;
    const region = document.getElementById('region').value;
    const comuna = document.getElementById('comuna').value;
    const direccion = document.getElementById('direccion').value.trim();
    const fechaNacimiento = document.getElementById('fechaNacimiento').value;
    const runOriginal = document.getElementById('run-original').value;
    const resultado = document.getElementById('resultado-usuario');

    const dominiosPermitidos = ['duoc.cl', 'profesor.duoc.cl', 'gmail.com'];
    let valido = true;

    if (!modoEdicionUsuario) {
        if (!run) { marcarErrorUsuario('run', 'El RUN es requerido.'); valido = false; }
        else if (!validarRun(run)) { marcarErrorUsuario('run', 'El RUN ingresado no es válido.'); valido = false; }
        else if (buscarUsuarioPorRun(run)) { marcarErrorUsuario('run', 'Ya existe un usuario con ese RUN.'); valido = false; }
    }

    if (!nombre) { marcarErrorUsuario('nombre', 'El nombre es requerido.'); valido = false; }
    else if (nombre.length > 50) { marcarErrorUsuario('nombre', 'Máximo 50 caracteres.'); valido = false; }

    if (!apellidos) { marcarErrorUsuario('apellidos', 'Los apellidos son requeridos.'); valido = false; }
    else if (apellidos.length > 100) { marcarErrorUsuario('apellidos', 'Máximo 100 caracteres.'); valido = false; }

    if (!correo) { marcarErrorUsuario('correo', 'El correo es requerido.'); valido = false; }
    else if (correo.length > 100) { marcarErrorUsuario('correo', 'Máximo 100 caracteres.'); valido = false; }
    else if (!dominiosPermitidos.includes(correo.split('@')[1])) { marcarErrorUsuario('correo', 'Solo se aceptan correos @duoc.cl, @profesor.duoc.cl o @gmail.com.'); valido = false; }
    else {
        const otro = buscarUsuarioPorCorreo(correo);
        if (otro && otro.run !== runOriginal) { marcarErrorUsuario('correo', 'Ya existe un usuario con ese correo.'); valido = false; }
    }

    if (!modoEdicionUsuario || clave) {
        if (!clave) { marcarErrorUsuario('clave', 'La contraseña es requerida.'); valido = false; }
        else if (clave.length < 4 || clave.length > 10) { marcarErrorUsuario('clave', 'Debe tener entre 4 y 10 caracteres.'); valido = false; }
    }

    if (!tipoUsuario) { marcarErrorUsuario('tipoUsuario', 'Selecciona el tipo de usuario.'); valido = false; }

    if (!direccion) { marcarErrorUsuario('direccion', 'La dirección es requerida.'); valido = false; }
    else if (direccion.length > 300) { marcarErrorUsuario('direccion', 'Máximo 300 caracteres.'); valido = false; }

    if (!valido) {
        resultado.textContent = 'Revisa los campos marcados en rojo.';
        resultado.style.color = '#e0453d';
        return false;
    }

    const usuarios = obtenerUsuarios();
    if (modoEdicionUsuario) {
        const u = usuarios.find(x => x.run === runOriginal);
        Object.assign(u, { nombre, apellidos, correo, tipoUsuario, region, comuna, direccion, fechaNacimiento });
        if (clave) u.clave = clave;
    } else {
        usuarios.push({ run, nombre, apellidos, correo, clave, telefono: '', region, comuna, direccion, fechaNacimiento, tipoUsuario });
    }
    guardarUsuarios(usuarios);

    resultado.textContent = modoEdicionUsuario ? 'Usuario actualizado correctamente.' : 'Usuario creado correctamente.';
    resultado.style.color = '#2e9e5b';
    setTimeout(() => window.location.href = 'usuarios.html', 1000);
    return true;
}

const usuario = requireRole(['Administrador']);
if (usuario) {
    iniciarLayoutAdmin(usuario);
    // Se espera a que js/regiones.js llene los <select> de región y comuna
    document.addEventListener('DOMContentLoaded', function () {
        const run = new URLSearchParams(window.location.search).get('run');
        if (run) cargarUsuarioParaEditar(run);
    });
}
