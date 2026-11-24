// =====================================================================
// PEDIDOS / ÓRDENES  (microservicio ms-pedidos)
// El Cliente solo recibe sus pedidos (/pedidos/mios); Administrador y Vendedor reciben todos.
// Al crear un pedido el navegador envía solo códigos y cantidades: el backend calcula
// precios, descuenta el stock y decide si queda Pagada o Rechazada.
// =====================================================================
import { api } from './api';
import { obtener, establecer } from './cache';
import { exigirPermiso } from '../utils/permisos';

// Estados de envío de un pedido pagado, en el orden en que avanzan
export const ESTADOS_ENVIO = ['En preparación', 'Despachado', 'Entregado'];
export const TIPOS_ENTREGA = ['Despacho a domicilio', 'Retiro en tienda'];

const esPersonal = (usuario) => !!usuario && ['Administrador', 'Vendedor'].includes(usuario.tipoUsuario);

export function totalOrden(orden) {
    return orden.items.reduce((suma, item) => suma + item.precio * item.cantidad, 0);
}

export function cantidadUnidades(orden) {
    return orden.items.reduce((suma, item) => suma + item.cantidad, 0);
}

// ---------- Carga desde la API ----------
export async function cargarOrdenes(usuario) {
    if (!usuario) {
        establecer('ordenes', []);
        return [];
    }
    const ordenes = await api('pedidos', esPersonal(usuario) ? '/pedidos' : '/pedidos/mios');
    establecer('ordenes', ordenes);
    return ordenes;
}

// Trae un pedido puntual (ej: al recargar la página de compra exitosa) y lo agrega a la caché
export async function cargarOrden(numero) {
    const orden = await api('pedidos', `/pedidos/${encodeURIComponent(numero)}`);
    guardarEnCache(orden);
    return orden;
}

function guardarEnCache(orden) {
    const otras = obtenerOrdenes().filter(o => String(o.numero) !== String(orden.numero));
    establecer('ordenes', [orden, ...otras]);
}

// ---------- Leer (desde la caché) ----------
export function obtenerOrdenes() {
    return obtener('ordenes');
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

// ---------- Crear (Cliente) ----------
// datos: { cliente: {nombre, apellidos}, direccion, tipoEntrega, medioPago, items: [{codigo, cantidad}], simularRechazo }
export async function crearOrden(datos) {
    const orden = await api('pedidos', '/pedidos', {
        method: 'POST',
        body: {
            cliente: { nombre: datos.cliente.nombre, apellidos: datos.cliente.apellidos },
            direccion: datos.direccion,
            tipoEntrega: datos.tipoEntrega || TIPOS_ENTREGA[0],
            medioPago: datos.medioPago,
            items: datos.items.map(({ codigo, cantidad }) => ({ codigo, cantidad })),
            simularRechazo: !!datos.simularRechazo
        }
    });
    guardarEnCache(orden);
    return orden;
}

// Estados a los que puede pasar una orden: el actual y los siguientes (no se retrocede).
export function siguientesEstadosEnvio(orden) {
    if (orden.estado !== 'Pagada') return [];
    return ESTADOS_ENVIO.slice(Math.max(0, ESTADOS_ENVIO.indexOf(orden.estadoEnvio)));
}

// Cambia el estado de envío (Administrador y Vendedor). El backend repite todas las validaciones.
export async function cambiarEstadoEnvio(numero, nuevoEstado, usuario) {
    exigirPermiso(usuario, 'ordenes:estado');
    if (!ESTADOS_ENVIO.includes(nuevoEstado)) throw new Error('Estado de envío no válido.');
    const actualizada = await api('pedidos', `/pedidos/${encodeURIComponent(numero)}/estado-envio`, {
        method: 'PATCH', body: { estadoEnvio: nuevoEstado }
    });
    guardarEnCache(actualizada);
    return actualizada;
}

// Anula un pedido (solo Administrador). Si estaba pagado, el backend repone el stock.
export async function eliminarOrden(numero, usuario) {
    exigirPermiso(usuario, 'ordenes:eliminar');
    await api('pedidos', `/pedidos/${encodeURIComponent(numero)}`, { method: 'DELETE' });
    establecer('ordenes', obtenerOrdenes().filter(o => String(o.numero) !== String(numero)));
}
