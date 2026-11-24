// =====================================================================
// USUARIOS Y AUTENTICACIÓN  (microservicio ms-usuarios)
// La contraseña nunca se guarda en el navegador: se envía al backend, que la compara
// con el hash BCrypt y responde con los tokens JWT.
// =====================================================================
import { api } from './api';
import { obtener, establecer } from './cache';

// ---------- Autenticación ----------
export function iniciarSesion(correo, clave) {
    return api('usuarios', '/auth/login', { method: 'POST', body: { correo, clave }, auth: false });
}

// Registro público: el backend siempre asigna el rol Cliente
export function registrar(datos) {
    const { run, nombre, apellidos, correo, clave, telefono, region, comuna, direccion } = datos;
    return api('usuarios', '/auth/registro', {
        method: 'POST', auth: false,
        body: { run, nombre, apellidos, correo, clave, telefono: telefono || '', region, comuna, direccion }
    });
}

// Cerrar sesión: el backend revoca el refresh token (deja de servir aunque alguien lo copie)
export function cerrarSesion(refreshToken) {
    return api('usuarios', '/auth/logout', { method: 'POST', body: { refreshToken }, auth: false });
}

// Valida el token guardado y devuelve los datos actuales del usuario
export function usuarioActual() {
    return api('usuarios', '/auth/me');
}

export function actualizarMiPerfil(datos) {
    const { nombre, apellidos, telefono, region, comuna, direccion, clave } = datos;
    return api('usuarios', '/usuarios/me', {
        method: 'PUT', body: { nombre, apellidos, telefono: telefono || '', region, comuna, direccion, clave: clave || '' }
    });
}

// ---------- Administración (solo Administrador) ----------
export async function cargarUsuarios() {
    const usuarios = await api('usuarios', '/usuarios');
    establecer('usuarios', usuarios);
    return usuarios;
}

export function obtenerUsuarios() {
    return obtener('usuarios');
}

export function buscarUsuarioPorRun(run) {
    return obtenerUsuarios().find(u => u.run === String(run).toUpperCase()) || null;
}

export function buscarUsuarioPorCorreo(correo) {
    const c = String(correo).toLowerCase();
    return obtenerUsuarios().find(u => u.correo.toLowerCase() === c) || null;
}

function cuerpoUsuario(datos) {
    const { run, nombre, apellidos, correo, clave, telefono, region, comuna, direccion, tipoUsuario, activo } = datos;
    return {
        run, nombre, apellidos, correo, clave: clave || '', telefono: telefono || '', region, comuna, direccion,
        tipoUsuario: tipoUsuario || 'Cliente', activo: activo === undefined ? true : activo
    };
}

export async function crearUsuario(datos) {
    const creado = await api('usuarios', '/usuarios', { method: 'POST', body: cuerpoUsuario(datos) });
    await cargarUsuarios();
    return creado;
}

// Contraseña vacía = el backend mantiene la actual
export async function actualizarUsuario(run, cambios) {
    const actual = buscarUsuarioPorRun(run) || {};
    const actualizado = await api('usuarios', `/usuarios/${encodeURIComponent(run)}`, {
        method: 'PUT', body: cuerpoUsuario({ ...actual, ...cambios, run })
    });
    await cargarUsuarios();
    return actualizado;
}

export async function cambiarEstadoUsuario(run, activo) {
    const actualizado = await api('usuarios', `/usuarios/${encodeURIComponent(run)}/estado`, { method: 'PATCH', body: { activo } });
    await cargarUsuarios();
    return actualizado;
}

export async function eliminarUsuario(run) {
    await api('usuarios', `/usuarios/${encodeURIComponent(run)}`, { method: 'DELETE' });
    await cargarUsuarios();
}
