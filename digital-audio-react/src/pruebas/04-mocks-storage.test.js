// USO DE MOCKS: se reemplaza localStorage con espías de Jasmine para aislar
// los servicios del almacenamiento real y verificar cómo lo usan.
import { leer, guardar } from '../services/storage';
import { obtenerOrdenes } from '../services/ordenesService';

describe('Persistencia con mocks de localStorage', () => {
    afterEach(() => localStorage.clear());

    it('guardar() serializa a JSON y llama a setItem con la clave correcta', () => {
        const espiaSet = jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {});
        guardar('prueba', { a: 1 });
        expect(espiaSet).toHaveBeenCalledTimes(1);
        expect(espiaSet).toHaveBeenCalledWith('prueba', '{"a":1}');
    });

    it('leer() devuelve el valor por defecto si localStorage falla', () => {
        jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('Almacenamiento bloqueado'); });
        expect(leer('carrito', [])).toEqual([]);
    });

    it('obtenerOrdenes() usa los datos simulados que entrega el mock', () => {
        const ordenFalsa = { numero: 1, estado: 'Pagada', estadoEnvio: 'Despachado', cliente: { correo: 'x@gmail.com' }, items: [], total: 0 };
        const espiaGet = jest.spyOn(Storage.prototype, 'getItem').mockReturnValue(JSON.stringify([ordenFalsa]));
        const ordenes = obtenerOrdenes();
        expect(espiaGet).toHaveBeenCalledWith('da_ordenes');
        expect(ordenes).toEqual([ordenFalsa]);
    });

    it('si no hay datos guardados, carga las órdenes iniciales y las guarda una vez', () => {
        jest.spyOn(Storage.prototype, 'getItem').mockReturnValue(null);
        const espiaSet = jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {});
        expect(obtenerOrdenes().length).toBe(5);
        expect(espiaSet).toHaveBeenCalledTimes(1);
    });
});
