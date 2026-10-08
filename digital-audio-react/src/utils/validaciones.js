// =====================================================================
// VALIDACIONES DE FORMULARIOS (funciones puras, fáciles de probar)
// Cada validar*() recibe los datos y devuelve un objeto { campo: mensaje }.
// Si el objeto está vacío, el formulario es válido.
// =====================================================================

export const DOMINIOS_PERMITIDOS = ['duoc.cl', 'profesor.duoc.cl', 'gmail.com'];

// RUN chileno sin puntos ni guion, con dígito verificador (ej: 19011029K)
export function validarRun(run) {
    const valor = String(run || '').trim().toUpperCase();
    if (valor.length < 7 || valor.length > 9) return false;
    const cuerpo = valor.slice(0, -1);
    const dv = valor.slice(-1);
    if (!/^\d+$/.test(cuerpo)) return false;

    let suma = 0;
    let multiplo = 2;
    for (let i = cuerpo.length - 1; i >= 0; i--) {
        suma += Number(cuerpo[i]) * multiplo;
        multiplo = multiplo === 7 ? 2 : multiplo + 1;
    }
    const resto = 11 - (suma % 11);
    const esperado = resto === 11 ? '0' : resto === 10 ? 'K' : String(resto);
    return dv === esperado;
}

export function esCorreoValido(correo) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(correo || '').trim());
}

export function esDominioPermitido(correo) {
    return DOMINIOS_PERMITIDOS.includes(String(correo || '').split('@')[1]);
}

export function esValido(errores) {
    return Object.keys(errores).length === 0;
}

export function validarLogin({ correo, clave }) {
    const errores = {};
    if (!correo) errores.correo = 'El correo es requerido.';
    else if (correo.length > 100) errores.correo = 'Máximo 100 caracteres.';
    else if (!esDominioPermitido(correo)) errores.correo = 'Solo se aceptan correos @duoc.cl, @profesor.duoc.cl o @gmail.com.';

    if (!clave) errores.clave = 'La contraseña es requerida.';
    else if (clave.length < 4 || clave.length > 10) errores.clave = 'Debe tener entre 4 y 10 caracteres.';
    return errores;
}

// Sirve para el registro (tienda) y para nuevo/editar usuario (admin).
// opciones.edicion = true -> RUN no se valida y la clave es opcional.
export function validarUsuario(datos, opciones = {}) {
    const errores = {};
    const { edicion = false, confirmar = false } = opciones;

    if (!edicion) {
        if (!datos.run) errores.run = 'El RUN es requerido.';
        else if (!validarRun(datos.run)) errores.run = 'El RUN ingresado no es válido.';
    }

    if (!datos.nombre) errores.nombre = 'El nombre es requerido.';
    else if (datos.nombre.length > 50) errores.nombre = 'Máximo 50 caracteres.';

    if (!datos.apellidos) errores.apellidos = 'Los apellidos son requeridos.';
    else if (datos.apellidos.length > 100) errores.apellidos = 'Máximo 100 caracteres.';

    if (!datos.correo) errores.correo = 'El correo es requerido.';
    else if (datos.correo.length > 100) errores.correo = 'Máximo 100 caracteres.';
    else if (!esDominioPermitido(datos.correo)) errores.correo = 'Solo se aceptan correos @duoc.cl, @profesor.duoc.cl o @gmail.com.';

    if (confirmar && datos.correo2 !== datos.correo) errores.correo2 = 'Los correos no coinciden.';

    if (!edicion || datos.clave) {
        if (!datos.clave) errores.clave = 'La contraseña es requerida.';
        else if (datos.clave.length < 4 || datos.clave.length > 10) errores.clave = 'Debe tener entre 4 y 10 caracteres.';
    }
    if (confirmar && datos.clave2 !== datos.clave) errores.clave2 = 'Las contraseñas no coinciden.';

    if (datos.telefono && !/^\+?[\d\s]{8,15}$/.test(datos.telefono)) errores.telefono = 'Teléfono no válido.';

    if (!datos.region || !datos.comuna) errores.region = 'Selecciona región y comuna.';

    if (!datos.direccion) errores.direccion = 'La dirección es requerida.';
    else if (datos.direccion.length > 300) errores.direccion = 'Máximo 300 caracteres.';
    return errores;
}

export function validarProducto(datos) {
    const errores = {};
    if (!datos.codigo) errores.codigo = 'El código es requerido.';
    else if (datos.codigo.length < 3) errores.codigo = 'Mínimo 3 caracteres.';

    if (!datos.nombre) errores.nombre = 'El nombre es requerido.';
    else if (datos.nombre.length > 100) errores.nombre = 'Máximo 100 caracteres.';

    if (datos.descripcion && datos.descripcion.length > 500) errores.descripcion = 'Máximo 500 caracteres.';

    if (datos.precio === '' || datos.precio === undefined || isNaN(Number(datos.precio))) errores.precio = 'El precio es requerido.';
    else if (Number(datos.precio) < 0) errores.precio = 'El precio no puede ser negativo.';

    if (datos.stock === '' || datos.stock === undefined || isNaN(Number(datos.stock))) errores.stock = 'El stock es requerido.';
    else if (Number(datos.stock) < 0 || !Number.isInteger(Number(datos.stock))) errores.stock = 'Debe ser un entero mayor o igual a 0.';

    if (datos.stockCritico !== '' && datos.stockCritico !== undefined &&
        (Number(datos.stockCritico) < 0 || !Number.isInteger(Number(datos.stockCritico)))) {
        errores.stockCritico = 'Debe ser un entero mayor o igual a 0.';
    }

    if (!datos.categoria) errores.categoria = 'Selecciona una categoría.';
    return errores;
}

export function validarCheckout(datos) {
    const errores = {};
    if (!datos.nombre) errores.nombre = 'El nombre es requerido.';
    if (!datos.apellidos) errores.apellidos = 'Los apellidos son requeridos.';
    if (!datos.correo) errores.correo = 'El correo es requerido.';
    else if (!esCorreoValido(datos.correo)) errores.correo = 'Ingresa un correo válido.';
    if (!datos.calle) errores.calle = 'La calle es requerida.';
    if (!datos.region) errores.region = 'Selecciona una región.';
    if (!datos.comuna) errores.comuna = 'Selecciona una comuna.';
    return errores;
}

export function validarContacto(datos) {
    const errores = {};
    if (!datos.nombre) errores.nombre = 'El nombre es requerido.';
    else if (datos.nombre.length > 100) errores.nombre = 'Máximo 100 caracteres.';
    if (datos.correo && (datos.correo.length > 100 || !esDominioPermitido(datos.correo))) {
        errores.correo = 'Solo se aceptan correos @duoc.cl, @profesor.duoc.cl o @gmail.com.';
    }
    if (!datos.comentario) errores.comentario = 'El comentario es requerido.';
    else if (datos.comentario.length > 500) errores.comentario = 'Máximo 500 caracteres.';
    return errores;
}
