// Configuración global de Jest (Create React App la carga antes de cada archivo de prueba).
// jsdom no implementa estas APIs del navegador, así que se reemplazan por funciones simuladas (mocks).
window.scrollTo = () => {};
window.print = () => {};
// React Bootstrap (Offcanvas) consulta media queries para saber el tamaño de pantalla
window.matchMedia = window.matchMedia || (() => ({
    matches: false, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {}
}));

// Backend falso: cada prueba parte con los mismos datos y fetch simulado (ver pruebas/servidorFalso.js)
const { instalarServidorFalso } = require('./pruebas/servidorFalso');
beforeEach(() => {
    window.localStorage.clear();
    instalarServidorFalso();
});

// La app pide datos al backend apenas se monta (SincronizarDatos). En las pruebas que no esperan
// esas respuestas, React avisa "not wrapped in act(...)". No es un error: se filtra para no ensuciar la salida.
// (beforeEach porque la configuración "restoreMocks" restaura los espías después de cada prueba)
const errorOriginal = console.error;
beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation((mensaje, ...resto) => {
        if (typeof mensaje === 'string' && mensaje.includes('not wrapped in act')) return;
        errorOriginal(mensaje, ...resto);
    });
});
