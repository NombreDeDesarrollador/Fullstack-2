// ----- Validación RUN chileno (sin puntos ni guion, ej: 19011022K) -----
function validarRun(run) {
    run = run.trim().toUpperCase();
    if (run.length < 7 || run.length > 9) return false;
    const cuerpo = run.slice(0, -1);
    const dv = run.slice(-1);
    if (!/^\d+$/.test(cuerpo)) return false;

    let suma = 0, multiplo = 2;
    for (let i = cuerpo.length - 1; i >= 0; i--) {
        suma += parseInt(cuerpo[i]) * multiplo;
        multiplo = multiplo === 7 ? 2 : multiplo + 1;
    }
    const resto = 11 - (suma % 11);
    const dvEsperado = resto === 11 ? '0' : resto === 10 ? 'K' : String(resto);
    return dv === dvEsperado;
}

function marcarError(campo, mensaje) {
    const input = document.getElementById(campo);
    const error = document.getElementById('err-' + campo);
    input.classList.add('is-invalid');
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
    const campos = ['run', 'nombre', 'apellidos', 'correo', 'correo2', 'clave', 'clave2', 'direccion'];
    limpiarErrores(campos);

    const run = document.getElementById('run').value.trim();
    const nombre = document.getElementById('nombre').value.trim();
    const apellidos = document.getElementById('apellidos').value.trim();
    const correo = document.getElementById('correo').value.trim();
    const correo2 = document.getElementById('correo2').value.trim();
    const clave = document.getElementById('clave').value;
    const clave2 = document.getElementById('clave2').value;
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

    if (!direccion) { marcarError('direccion', 'La dirección es requerida.'); valido = false; }
    else if (direccion.length > 300) { marcarError('direccion', 'Máximo 300 caracteres.'); valido = false; }

    if (!valido) {
        resultado.innerHTML = 'Revisa los campos marcados en rojo.';
        resultado.style.color = 'red';
        return false;
    }

    resultado.innerHTML = '¡Gracias por registrarte! Redirigiendo al inicio...';
    resultado.style.color = 'green';
    setTimeout(() => window.location.href = 'proyecto.html', 1500);
    return true;
}