// Configuración global de Karma/Jasmine (equivale a src/setupTests.js de Jest):
// antes de cada prueba se limpia localStorage y se instala el backend falso (fetch simulado).
import { instalarServidorFalso } from '../src/pruebas/servidorFalso';

window.scrollTo = () => {};

beforeEach(() => {
    window.localStorage.clear();
    instalarServidorFalso();
});

describe('Configuración de pruebas', () => {
    it('el backend falso responde el catálogo', async () => {
        const respuesta = await fetch('http://localhost:8082/api/v1/productos');
        expect(JSON.parse(await respuesta.text()).length).toBe(51);
    });
});
