// La función validarRun() ahora vive en js/validaciones.js (compartida con el admin)

function marcarError(campo, mensaje) {
    const input = document.getElementById(campo);
    const error = document.getElementById('err-' + campo);
    if (input) input.classList.add('is-invalid');
    if (error) error.textContent = mensaje;
}

function limpiarErrores(campos) {
    campos.forEach(campo => {
        document.getElementById(campo).classList.remove('is-invalid');
        const error = document.getElementById('err-' + campo);
        if (error) error.textContent = '';
    });
}

function validarRegistro() {
    const campos = ['run', 'nombre', 'apellidos', 'correo', 'correo2', 'clave', 'clave2', 'region', 'direccion'];
    limpiarErrores(campos);

    const run = document.getElementById('run').value.trim();
    const nombre = document.getElementById('nombre').value.trim();
    const apellidos = document.getElementById('apellidos').value.trim();
    const correo = document.getElementById('correo').value.trim();
    const correo2 = document.getElementById('correo2').value.trim();
    const clave = document.getElementById('clave').value;
    const clave2 = document.getElementById('clave2').value;
    const region = document.getElementById('region').value;
    const comuna = document.getElementById('comuna').value;
    const direccion = document.getElementById('direccion').value.trim();

    const resultado = document.getElementById('resultado-registro');
    let valido = true;

    const dominiosPermitidos = ['duoc.cl', 'profesor.duoc.cl', 'gmail.com'];
    const dominioCorreo = correo.split('@')[1];

    if (!run) { marcarError('run', 'El RUN es requerido.'); valido = false; }
    else if (!validarRun(run)) { marcarError('run', 'El RUN ingresado no es válido.'); valido = false; }

    if (!nombre) { marcarError('nombre', 'El nombre es requerido.'); valido = false; }
    else if (nombre.length > 50) { marcarError('nombre', 'Máximo 50 caracteres.'); valido = false; }

    if (!apellidos) { marcarError('apellidos', 'Los apellidos son requeridos.'); valido = false; }
    else if (apellidos.length > 100) { marcarError('apellidos', 'Máximo 100 caracteres.'); valido = false; }

    if (!correo) { marcarError('correo', 'El correo es requerido.'); valido = false; }
    else if (correo.length > 100) { marcarError('correo', 'Máximo 100 caracteres.'); valido = false; }
    else if (!dominiosPermitidos.includes(dominioCorreo)) { marcarError('correo', 'Solo se aceptan correos @duoc.cl, @profesor.duoc.cl o @gmail.com.'); valido = false; }

    if (correo2 !== correo || !correo2) { marcarError('correo2', 'Los correos no coinciden.'); valido = false; }

    if (!clave) { marcarError('clave', 'La contraseña es requerida.'); valido = false; }
    else if (clave.length < 4 || clave.length > 10) { marcarError('clave', 'Debe tener entre 4 y 10 caracteres.'); valido = false; }

    if (clave2 !== clave || !clave2) { marcarError('clave2', 'Las contraseñas no coinciden.'); valido = false; }

    if (!region || !comuna) { marcarError('region', 'Selecciona región y comuna.'); valido = false; }

    if (!direccion) { marcarError('direccion', 'La dirección es requerida.'); valido = false; }
    else if (direccion.length > 300) { marcarError('direccion', 'Máximo 300 caracteres.'); valido = false; }

    if (!valido) {
        resultado.innerHTML = 'Revisa los campos marcados en rojo.';
        resultado.style.color = 'red';
        return false;
    }

    // El registro solo se valida: no se guarda en la base de datos.
    resultado.innerHTML = '¡Registro validado correctamente! Redirigiendo al inicio de sesión...';
    resultado.style.color = 'green';
    setTimeout(() => window.location.href = 'login.html', 1500);
    return true;
}