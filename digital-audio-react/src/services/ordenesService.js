// =====================================================================
// CRUD DE ÓRDENES / BOLETAS (fuente de datos: src/data/ordenes.js)
// =====================================================================
import { ordenesIniciales } from '../data/ordenes';
import { leer, guardar } from './storage';

const CLAVE_ORDENES = 'da_ordenes';

export function totalOrden(orden) {
    return orden.items.reduce((suma, item) => suma + item.precio * item.cantidad, 0);
}

export function cantidadUnidades(orden) {
    return orden.items.reduce((suma, item) => suma + item.cantidad, 0);
}

export function obtenerOrdenes() {
    const guardadas = leer(CLAVE_ORDENES, null);
    if (Array.isArray(guardadas)) return guardadas;
    const iniciales = ordenesIniciales.map(o => ({ ...o, total: totalOrden(o) }));
    guardar(CLAVE_ORDENES, iniciales);
    return iniciales;
}

export function buscarOrden(numero) {
    return obtenerOrdenes().find(o => String(o.numero) === String(numero)) || null;
}

export function ordenesPorCorreo(correo) {
    const c = String(correo || '').toLowerCase();
    return obtenerOrdenes()
        .filter(o => o.cliente.correo.toLowerCase() === c)
        .sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
}

// Crea la orden con número correlativo. datos: { estado, cliente, direccion, items, medioPago, motivo }
export function crearOrden(datos) {
    const ordenes = obtenerOrdenes();
    const numero = ordenes.reduce((max, o) => Math.max(max, Number(o.numero)), 0) + 1;
    const orden = { numero, codigo: 'ORDER' + numero, fecha: new Date().toISOString(), ...datos };
    orden.total = totalOrden(orden);
    guardar(CLAVE_ORDENES, [...ordenes, orden]);
    return orden;
}
