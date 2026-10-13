// Configuración global de Jest (Create React App la carga antes de cada archivo de prueba).
// jsdom no implementa estas APIs del navegador, así que se reemplazan por funciones simuladas (mocks).
window.scrollTo = () => {};
window.print = () => {};
// React Bootstrap (Offcanvas) consulta media queries para saber el tamaño de pantalla
window.matchMedia = window.matchMedia || (() => ({
    matches: false, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {}
}));
