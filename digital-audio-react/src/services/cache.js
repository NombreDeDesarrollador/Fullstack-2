// =====================================================================
// CACHÉ EN MEMORIA DE LOS DATOS DEL BACKEND
// Los datos se piden a la API una vez (al abrir la app o al iniciar sesión) y se guardan aquí.
// Las vistas los leen de forma síncrona y se vuelven a dibujar cuando cambian (useDatos).
// Después de crear/editar/eliminar algo, el servicio vuelve a pedir la lista al backend,
// así la pantalla siempre muestra lo que está guardado en la base de datos.
// =====================================================================
import { useSyncExternalStore } from 'react';

const VACIO = () => ({
    datos: { productos: [], categorias: [], ordenes: [], usuarios: [] },
    cargado: { productos: false, categorias: false, ordenes: false, usuarios: false },
    error: ''
});

let estado = VACIO();
let version = 0;
const oyentes = new Set();

function avisar() {
    version += 1;
    oyentes.forEach(fn => fn());
}

export function obtener(clave) {
    return estado.datos[clave];
}

export function establecer(clave, valor) {
    estado.datos[clave] = valor;
    estado.cargado[clave] = true;
    estado.error = '';
    avisar();
}

export function estaCargado(clave) {
    return estado.cargado[clave];
}

export function registrarError(mensaje) {
    estado.error = mensaje;
    avisar();
}

export function errorCarga() {
    return estado.error;
}

// Borra datos privados (al cerrar sesión). Sin argumentos borra todo.
export function limpiar(claves) {
    if (!claves) {
        estado = VACIO();
    } else {
        claves.forEach(c => {
            estado.datos[c] = [];
            estado.cargado[c] = false;
        });
    }
    avisar();
}

function suscribir(fn) {
    oyentes.add(fn);
    return () => oyentes.delete(fn);
}

function leerVersion() {
    return version;
}

// Hook: la vista que lo llama se vuelve a dibujar cada vez que cambia la caché
export function useDatos() {
    return useSyncExternalStore(suscribir, leerVersion, leerVersion);
}
