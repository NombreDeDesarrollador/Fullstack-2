// =====================================================================
// PERSISTENCIA: envoltorio de localStorage
// Todos los servicios guardan y leen a través de estas dos funciones,
// así es fácil reemplazarlas por un mock en las pruebas.
// =====================================================================

export function leer(clave, valorPorDefecto) {
    try {
        const texto = window.localStorage.getItem(clave);
        return texto === null ? valorPorDefecto : JSON.parse(texto);
    } catch (e) {
        return valorPorDefecto;
    }
}

export function guardar(clave, valor) {
    try {
        window.localStorage.setItem(clave, JSON.stringify(valor));
    } catch (e) {
        // Sin almacenamiento disponible (modo privado): la app sigue funcionando en memoria
    }
}

export function eliminar(clave) {
    try { window.localStorage.removeItem(clave); } catch (e) { /* sin almacenamiento */ }
}
