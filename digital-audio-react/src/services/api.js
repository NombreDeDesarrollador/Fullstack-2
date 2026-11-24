// =====================================================================
// CLIENTE HTTP HACIA LOS MICROSERVICIOS (fetch)
// Cada microservicio tiene su URL (se configuran en el archivo .env):
//   ms-usuarios  -> login, registro, usuarios      (puerto 8081)
//   ms-productos -> catálogo, categorías y stock   (puerto 8082)
//   ms-pedidos   -> pedidos y estados de envío     (puerto 8083)
// Funciones de este archivo:
//   1. Agregar "Authorization: Bearer <token>" a las peticiones privadas.
//   2. Renovar el token automáticamente si venció (refresh token).
//   3. Transformar los errores JSON del backend en un Error con el mensaje para el usuario.
// =====================================================================
import { leerSesion, guardarSesion, borrarSesion, tokenExpirado } from './sesion';

export const SERVICIOS = {
    usuarios: process.env.REACT_APP_API_USUARIOS || 'http://localhost:8081',
    productos: process.env.REACT_APP_API_PRODUCTOS || 'http://localhost:8082',
    pedidos: process.env.REACT_APP_API_PEDIDOS || 'http://localhost:8083'
};

export const API_V1 = '/api/v1';

// Error con el código HTTP y el detalle por campo que devuelve el backend
export class ApiError extends Error {
    constructor(mensaje, status, errores = null) {
        super(mensaje);
        this.name = 'ApiError';
        this.status = status;
        this.errores = errores;
    }
}

// Si varias peticiones detectan el token vencido a la vez, todas esperan la MISMA renovación
let renovacionEnCurso = null;

export function renovarSesion() {
    if (renovacionEnCurso) return renovacionEnCurso;
    const sesion = leerSesion();
    // El refresh token es opaco (no es JWT): solo el backend sabe si sigue vigente
    if (!sesion || !sesion.refreshToken) {
        borrarSesion();
        return Promise.reject(new ApiError('Tu sesión expiró. Vuelve a iniciar sesión.', 401));
    }
    renovacionEnCurso = enviar('usuarios', '/auth/refresh', { method: 'POST', body: { refreshToken: sesion.refreshToken }, auth: false })
        .then(respuesta => { guardarSesion(respuesta); return respuesta; })
        .catch(error => { borrarSesion(); throw error; })
        .finally(() => { renovacionEnCurso = null; });
    return renovacionEnCurso;
}

// Devuelve un access token vigente (lo renueva antes de usarlo si está por vencer)
async function tokenVigente() {
    const sesion = leerSesion();
    if (!sesion) return null;
    if (!tokenExpirado(sesion.accessToken)) return sesion.accessToken;
    const nueva = await renovarSesion();
    return nueva.accessToken;
}

async function enviar(servicio, ruta, { method = 'GET', body, auth = true, token = null } = {}) {
    const headers = { Accept: 'application/json' };
    if (body !== undefined) headers['Content-Type'] = 'application/json';
    if (auth && token) headers.Authorization = `Bearer ${token}`;

    let respuesta;
    try {
        respuesta = await fetch(`${SERVICIOS[servicio]}${API_V1}${ruta}`, {
            method,
            headers,
            body: body !== undefined ? JSON.stringify(body) : undefined
        });
    } catch (e) {
        throw new ApiError('No se pudo conectar con el servidor. Revisa que el backend esté encendido.', 0);
    }

    if (respuesta.status === 204) return null;
    const texto = await respuesta.text();
    let datos = null;
    try { datos = texto ? JSON.parse(texto) : null; } catch (e) { datos = null; }

    if (!respuesta.ok) {
        const mensaje = (datos && datos.mensaje) || `Error ${respuesta.status} en el servidor.`;
        throw new ApiError(mensaje, respuesta.status, datos && datos.errores);
    }
    return datos;
}

/**
 * Petición a un microservicio.
 * @param {'usuarios'|'productos'|'pedidos'} servicio
 * @param {string} ruta  ej: '/productos', '/pedidos/mios'
 * @param {{method?: string, body?: any, auth?: boolean}} opciones auth=false para rutas públicas
 */
export async function api(servicio, ruta, opciones = {}) {
    const { auth = true } = opciones;
    const token = auth ? await tokenVigente() : null;
    try {
        return await enviar(servicio, ruta, { ...opciones, auth, token });
    } catch (error) {
        // 401 con sesión: el token pudo ser revocado o expirar justo ahora -> se renueva y se reintenta una vez
        if (error.status === 401 && auth && token) {
            const nueva = await renovarSesion();
            return enviar(servicio, ruta, { ...opciones, auth, token: nueva.accessToken });
        }
        throw error;
    }
}
