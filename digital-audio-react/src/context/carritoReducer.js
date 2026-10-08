// =====================================================================
// LÓGICA DEL CARRITO (reducer puro, sin React, fácil de probar)
// Estado: arreglo de items { codigo, nombre, precio, imagen, stock, cantidad }
// =====================================================================

export const ACCIONES = {
    AGREGAR: 'AGREGAR',
    CAMBIAR_CANTIDAD: 'CAMBIAR_CANTIDAD',
    ELIMINAR: 'ELIMINAR',
    VACIAR: 'VACIAR'
};

export function carritoReducer(estado, accion) {
    switch (accion.type) {
        case ACCIONES.AGREGAR: {
            const p = accion.producto;
            const existente = estado.find(i => i.codigo === p.codigo);
            const cantidadActual = existente ? existente.cantidad : 0;
            if (cantidadActual + 1 > p.stock) return estado; // sin stock suficiente
            if (existente) {
                return estado.map(i => (i.codigo === p.codigo ? { ...i, cantidad: i.cantidad + 1 } : i));
            }
            return [...estado, { codigo: p.codigo, nombre: p.nombre, precio: p.precio, imagen: p.imagen, stock: p.stock, cantidad: 1 }];
        }
        case ACCIONES.CAMBIAR_CANTIDAD: {
            const { codigo, delta } = accion;
            return estado
                .map(i => {
                    if (i.codigo !== codigo) return i;
                    const nueva = i.cantidad + delta;
                    return nueva > i.stock ? i : { ...i, cantidad: nueva };
                })
                .filter(i => i.cantidad > 0);
        }
        case ACCIONES.ELIMINAR:
            return estado.filter(i => i.codigo !== accion.codigo);
        case ACCIONES.VACIAR:
            return [];
        default:
            return estado;
    }
}

export function totalCarrito(items) {
    return items.reduce((suma, i) => suma + i.precio * i.cantidad, 0);
}

export function cantidadCarrito(items) {
    return items.reduce((suma, i) => suma + i.cantidad, 0);
}
