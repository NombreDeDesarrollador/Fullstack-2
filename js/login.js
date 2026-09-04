function validarLogin() {
    var usuario = document.querySelector('input[type="text"]');
    var clave = document.querySelector('input[type="password"]');
    var resultado = document.getElementById('resultado-login');

    usuario.style.borderColor = '';
    clave.style.borderColor = '';

    if (usuario.value.trim() === '' || clave.value.trim() === '') {
        if (usuario.value.trim() === '') usuario.style.borderColor = 'red';
        if (clave.value.trim() === '') clave.style.borderColor = 'red';
        resultado.innerHTML = 'Debes completar usuario y contraseña';
        resultado.style.color = 'red';
        return false;
    }

    var usuariosValidos = [
        { user: 'sound', pass: '1234' }
    ];

    var esValido = usuariosValidos.some(function(u) {
        return u.user === usuario.value.trim() && u.pass === clave.value.trim();
    });

    if (esValido) {
        resultado.innerHTML = 'Bienvenido, acceso correcto';
        resultado.style.color = 'green';
        setTimeout(function() {
            window.location.href = 'proyecto.html';
        }, 1000);
        return true;
    } else {
        usuario.style.borderColor = 'red';
        clave.style.borderColor = 'red';
        resultado.innerHTML = 'Usuario o contraseña incorrectos';
        resultado.style.color = 'red';
        return false;
    }
}