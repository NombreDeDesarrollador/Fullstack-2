function marcarErrorContacto(campo, mensaje) {
    document.getElementById(campo).style.borderColor = 'red';
    document.getElementById('err-' + campo).textContent = mensaje;
}

function limpiarErroresContacto(campos) {
    campos.forEach(campo => {
        document.getElementById(campo).style.borderColor = '';
        document.getElementById('err-' + campo).textContent = '';
    });
}

function validarContacto() {
    const campos = ['contacto-nombre', 'contacto-correo', 'contacto-comentario'];
    limpiarErroresContacto(campos);

    const nombre = document.getElementById('contacto-nombre').value.trim();
    const correo = document.getElementById('contacto-correo').value.trim();
    const comentario = document.getElementById('contacto-comentario').value.trim();
    const resultado = document.getElementById('resultado-contacto');

    const dominiosPermitidos = ['duoc.cl', 'profesor.duoc.cl', 'gmail.com'];
    const dominioCorreo = correo.split('@')[1];
    let valido = true;

    if (!nombre) { marcarErrorContacto('contacto-nombre', 'El nombre es requerido.'); valido = false; }
    else if (nombre.length > 100) { marcarErrorContacto('contacto-nombre', 'Máximo 100 caracteres.'); valido = false; }

    if (correo) {
        if (correo.length > 100) { marcarErrorContacto('contacto-correo', 'Máximo 100 caracteres.'); valido = false; }
        else if (!dominiosPermitidos.includes(dominioCorreo)) { marcarErrorContacto('contacto-correo', 'Solo se aceptan correos @duoc.cl, @profesor.duoc.cl o @gmail.com.'); valido = false; }
    }

    if (!comentario) { marcarErrorContacto('contacto-comentario', 'El comentario es requerido.'); valido = false; }
    else if (comentario.length > 500) { marcarErrorContacto('contacto-comentario', 'Máximo 500 caracteres.'); valido = false; }

    if (!valido) {
        resultado.textContent = 'Revisa los campos marcados en rojo.';
        resultado.style.color = 'red';
        return false;
    }

    resultado.textContent = '¡Gracias por tu mensaje! Te responderemos pronto.';
    resultado.style.color = 'green';
    setTimeout(() => window.location.href = 'proyecto.html', 1500);
    return true;
}
