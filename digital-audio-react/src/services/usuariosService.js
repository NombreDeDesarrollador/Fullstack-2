// =====================================================================
// CRUD DE USUARIOS (fuente de datos: src/data/usuarios.js)
// =====================================================================
import { usuariosIniciales } from '../data/usuarios';
import { leer, guardar } from './storage';

const CLAVE_USUARIOS = 'da_usuarios';

export function obtenerUsuarios() {
    const guardados = leer(CLAVE_USUARIOS, null);
    if (Array.isArray(guardados)) return guardados;
    guardar(CLAVE_USUARIOS, usuariosIniciales);
    return usuariosIniciales.map(u => ({ ...u }));
}

export function buscarUsuarioPorRun(run) {
    return obtenerUsuarios().find(u => u.run === String(run).toUpperCase()) || null;
}

export function buscarUsuarioPorCorreo(correo) {
    const c = String(correo).toLowerCase();
    return obtenerUsuarios().find(u => u.correo.toLowerCase() === c) || null;
}

export function crearUsuario(datos) {
    const run = String(datos.run).toUpperCase();
    if (buscarUsuarioPorRun(run)) throw new Error('Ya existe un usuario con ese RUN.');
    if (buscarUsuarioPorCorreo(datos.correo)) throw new Error('Ya existe un usuario con ese correo.');
    const nuevo = { telefono: '', region: '', comuna: '', direccion: '', tipoUsuario: 'Cliente', ...datos, run };
    guardar(CLAVE_USUARIOS, [...obtenerUsuarios(), nuevo]);
    return nuevo;
}

export function actualizarUsuario(run, cambios) {
    let actualizado = null;
    const usuarios = obtenerUsuarios().map(u => {
        if (u.run !== run) return u;
        actualizado = { ...u, ...cambios, run };
        if (!cambios.clave) actualizado.clave = u.clave; // contraseña vacía = mantener la actual
        return actualizado;
    });
    if (!actualizado) throw new Error('Usuario no encontrado.');
    guardar(CLAVE_USUARIOS, usuarios);
    return actualizado;
}

export function eliminarUsuario(run) {
    guardar(CLAVE_USUARIOS, obtenerUsuarios().filter(u => u.run !== run));
}

// Devuelve el usuario si correo y clave coinciden, o null
export function autenticar(correo, clave) {
    const usuario = buscarUsuarioPorCorreo(correo);
    return usuario && usuario.clave === clave ? usuario : null;
}
