// =====================================================================
// PERMISOS POR ROL (RBAC)
// Un solo lugar define qué rol puede hacer cada acción. Los componentes lo
// usan para mostrar u ocultar botones y los servicios lo usan para validar
// la acción, así un Vendedor no puede saltarse la regla aunque fuerce la URL.
// Según el Anexo 1 de la pauta, el Vendedor SOLO VISUALIZA productos y órdenes:
// no tiene ninguna acción de modificación (el backend responde 403 si lo intenta).
// =====================================================================

export const PERMISOS = {
    'productos:crear': ['Administrador'],
    'productos:editar': ['Administrador'],
    'productos:eliminar': ['Administrador'],
    'productos:stock': ['Administrador'],               // actualizar stock
    'ordenes:estado': ['Administrador'],                // cambiar el estado de envío de un pedido
    'ordenes:eliminar': ['Administrador'],               // anular un pedido (repone stock)
    'usuarios:gestionar': ['Administrador'],             // crear, editar, desactivar y eliminar usuarios
    'reportes:ver': ['Administrador']
};

// true si el usuario (con sesión) tiene permiso para la acción
export function puede(usuario, accion) {
    return !!usuario && (PERMISOS[accion] || []).includes(usuario.tipoUsuario);
}

// Lanza un error si el usuario no tiene permiso (se usa dentro de los servicios)
export function exigirPermiso(usuario, accion) {
    if (!puede(usuario, accion)) throw new Error('No tienes permiso para realizar esta acción.');
}
