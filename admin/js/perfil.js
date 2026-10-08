// =====================================================================
// PERFIL (admin/perfil.html)
// El usuario activo puede editar sus datos personales y su contraseña.
// =====================================================================

function marcarErrorPerfil(campo, mensaje) {
    document.getElementById(campo).classList.add('is-invalid');
    document.getElementById('err-' + campo).textContent = mensaje;
}

function pintarTarjetaPerfil(u) {
    document.getElementById('perfil-nombre').textContent = (u.nombre + ' ' + (u.apellidos || '')).trim();
    document.getElementById('perfil-rol').textContent = u.tipoUsuario;
    
    document.getElementById('perfil-correo').textContent = u.correo;
    document.getElementById('perfil-run').textContent = u.run || '-';
}

function guardarPerfil(evento) {
    evento.preventDefault();
    const campos = ['nombre', 'apellidos', 'telefono', 'direccion', 'clave', 'clave2'];
    campos.forEach(c => {
        document.getElementById(c).classList.remove('is-invalid');
        document.getElementById('err-' + c).textContent = '';
    });

    const datos = {};
    campos.forEach(c => datos[c] = document.getElementById(c).value.trim());
    const resultado = document.getElementById('resultado-perfil');
    let valido = true;

    if (!datos.nombre) { marcarErrorPerfil('nombre', 'El nombre es requerido.'); valido = false; }
    if (!datos.apellidos) { marcarErrorPerfil('apellidos', 'Los apellidos son requeridos.'); valido = false; }
    if (datos.telefono && !/^\+?[\d\s]{8,15}$/.test(datos.telefono)) { marcarErrorPerfil('telefono', 'Teléfono no válido.'); valido = false; }
    if (datos.direccion.length > 300) { marcarErrorPerfil('direccion', 'Máximo 300 caracteres.'); valido = false; }
    if (datos.clave && (datos.clave.length < 4 || datos.clave.length > 10)) { marcarErrorPerfil('clave', 'Debe tener entre 4 y 10 caracteres.'); valido = false; }
    if (datos.clave !== datos.clave2) { marcarErrorPerfil('clave2', 'Las contraseñas no coinciden.'); valido = false; }

    if (!valido) {
        resultado.textContent = 'Revisa los campos marcados en rojo.';
        resultado.style.color = '#e0453d';
        return;
    }

    const usuarios = obtenerUsuarios();
    const actual = usuarios.find(u => u.correo === usuario.correo) || usuario;
    actual.nombre = datos.nombre;
    actual.apellidos = datos.apellidos;
    actual.telefono = datos.telefono;
    actual.direccion = datos.direccion;
    if (datos.clave) actual.clave = datos.clave;
    if (!usuarios.includes(actual)) usuarios.push(actual);
    guardarUsuarios(usuarios);
    localStorage.setItem('usuarioActivo', JSON.stringify(actual));

    document.getElementById('clave').value = '';
    document.getElementById('clave2').value = '';
    pintarTarjetaPerfil(actual);
    iniciarLayoutAdmin(actual);
    resultado.textContent = 'Datos actualizados correctamente.';
    resultado.style.color = '#2e9e5b';
}

const usuario = requireRole(['Administrador', 'Vendedor']);
if (usuario) {
    iniciarLayoutAdmin(usuario);
    const datos = obtenerUsuarios().find(u => u.correo === usuario.correo) || usuario;
    pintarTarjetaPerfil(datos);
    document.getElementById('nombre').value = datos.nombre || '';
    document.getElementById('apellidos').value = datos.apellidos || '';
    document.getElementById('telefono').value = datos.telefono || '';
    document.getElementById('direccion').value = datos.direccion || '';
    document.getElementById('form-perfil').addEventListener('submit', guardarPerfil);
}
