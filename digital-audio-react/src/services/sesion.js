// =====================================================================
// SESIÓN (tokens JWT) EN EL NAVEGADOR
// - accessToken: dura 15 min y viaja en el header Authorization de cada petición.
// - refreshToken: valor aleatorio (no JWT) de un solo uso, dura 7 días y solo sirve para pedir un par nuevo.
// Se guardan en localStorage para que la sesión sobreviva a una recarga de página.
// El rol que se usa en pantalla viene del backend (no se puede "inventar" en el navegador:
// aunque alguien edite localStorage, el backend valida la firma del token en cada petición).
// =====================================================================
import { leer, guardar, eliminar } from './storage';

const CLAVE_SESION = 'da_sesion';
const oyentes = new Set();

// Guarda la respuesta de /auth/login, /auth/registro o /auth/refresh
export function guardarSesion({ accessToken, refreshToken, usuario }) {
    guardar(CLAVE_SESION, { accessToken, refreshToken, usuario });
    notificar();
}

export function leerSesion() {
    const sesion = leer(CLAVE_SESION, null);
    return sesion && sesion.accessToken && sesion.usuario ? sesion : null;
}

export function actualizarUsuarioSesion(usuario) {
    const sesion = leerSesion();
    if (sesion) guardarSesion({ ...sesion, usuario });
}

export function borrarSesion() {
    eliminar(CLAVE_SESION);
    notificar();
}

// Permite que AuthContext se entere cuando la sesión cambia o expira (ej: falló la renovación)
export function suscribirSesion(fn) {
    oyentes.add(fn);
    return () => oyentes.delete(fn);
}

function notificar() {
    oyentes.forEach(fn => fn(leerSesion()));
}

// Lee el payload del JWT (sin verificar la firma: eso lo hace el backend)
export function leerPayload(token) {
    try {
        const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
        const json = decodeURIComponent(atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
        return JSON.parse(json);
    } catch (e) {
        return null;
    }
}

// true si el token ya venció o vence en los próximos `margenSegundos`
export function tokenExpirado(token, margenSegundos = 30) {
    const payload = token ? leerPayload(token) : null;
    if (!payload || !payload.exp) return true;
    return payload.exp * 1000 <= Date.now() + margenSegundos * 1000;
}
