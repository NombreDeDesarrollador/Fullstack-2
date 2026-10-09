// =====================================================================
// CRUD DE ÓRDENES / BOLETAS (fuente de datos: src/data/ordenes.js)
// =====================================================================
import { ordenesIniciales } from '../data/ordenes';
import { leer, guardar } from './storage';
import { exigirPermiso } from '../utils/permisos';

const CLAVE_ORDENES = 'da_ordenes';

// Estados de envío de un pedido pagado, en el orden en que avanzan
export const ESTADOS_ENVIO = ['En preparación', 'Despachado', 'Entregado'];

// Las órdenes pagadas siempre tienen estado de envío (parten "En preparación").
// Las rechazadas no se despachan, así que no tienen.
function conEstadoEnvio(orden) {
    if (orden.estado !== 'Pagada') return orden;
    return { ...orden, estadoEnvio: orden.estadoEnvio || ESTADOS_ENVIO[0] };
}

export function totalOrden(orden) {
    return orden.items.reduce((suma, item) => suma + item.precio * item.cantidad, 0);
}

export function cantidadUnidades(orden) {
    return orden.items.reduce((suma, item) => suma + item.cantidad, 0);
}

export function obtenerOrdenes() {
    const guardadas = leer(CLAVE_ORDENES, null);
    if (Array.isArray(guardadas)) return guardadas.map(conEstadoEnvio);
    const iniciales = ordenesIniciales.map(o => conEstadoEnvio({ ...o, total: totalOrden(o) }));
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
    const orden = conEstadoEnvio({ numero, codigo: 'ORDER' + numero, fecha: new Date().toISOString(), ...datos });
    orden.total = totalOrden(orden);
    guardar(CLAVE_ORDENES, [...ordenes, orden]);
    return orden;
}

// Estados a los que puede pasar una orden: el actual y los siguientes (no se retrocede).
export function siguientesEstadosEnvio(orden) {
    if (orden.estado !== 'Pagada') return [];
    return ESTADOS_ENVIO.slice(ESTADOS_ENVIO.indexOf(orden.estadoEnvio));
}

// Cambia el estado de envío. Solo Administrador y Vendedor; valida que la orden
// esté pagada, que el estado exista y que no se retroceda (ej: Entregado -> Despachado).
export function cambiarEstadoEnvio(numero, nuevoEstado, usuario) {
    exigirPermiso(usuario, 'ordenes:estado');
    if (!ESTADOS_ENVIO.includes(nuevoEstado)) throw new Error('Estado de envío no válido.');
    let actualizada = null;
    const ordenes = obtenerOrdenes().map(o => {
        if (String(o.numero) !== String(numero)) return o;
        if (o.estado !== 'Pagada') throw new Error('Solo se pueden despachar órdenes pagadas.');
        if (!siguientesEstadosEnvio(o).includes(nuevoEstado)) throw new Error('No se puede volver a un estado anterior.');
        actualizada = { ...o, estadoEnvio: nuevoEstado };
        return actualizada;
    });
    if (!actualizada) throw new Error('Orden no encontrada.');
    guardar(CLAVE_ORDENES, ordenes);
    return actualizada;
}
