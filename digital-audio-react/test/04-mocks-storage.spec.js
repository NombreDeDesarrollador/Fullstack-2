// USO DE MOCKS: se reemplaza localStorage con espías de Jasmine para aislar
// los servicios del almacenamiento real y verificar cómo lo usan.
import { leer, guardar } from '../src/services/storage';
import { obtenerOrdenes } from '../src/services/ordenesService';

describe('Persistencia con mocks de localStorage', () => {
    afterEach(() => localStorage.clear());

    it('guardar() serializa a JSON y llama a setItem con la clave correcta', () => {
        const espiaSet = spyOn(Storage.prototype, 'setItem');
        guardar('prueba', { a: 1 });
        expect(espiaSet).toHaveBeenCalledOnceWith('prueba', '{"a":1}');
    });

    it('leer() devuelve el valor por defecto si localStorage falla', () => {
        spyOn(Storage.prototype, 'getItem').and.throwError('Almacenamiento bloqueado');
        expect(leer('carrito', [])).toEqual([]);
    });

    it('obtenerOrdenes() usa los datos simulados que entrega el mock', () => {
        const ordenFalsa = { numero: 1, estado: 'Pagada', estadoEnvio: 'Despachado', cliente: { correo: 'x@gmail.com' }, items: [], total: 0 };
        const espiaGet = spyOn(Storage.prototype, 'getItem').and.returnValue(JSON.stringify([ordenFalsa]));
        const ordenes = obtenerOrdenes();
        expect(espiaGet).toHaveBeenCalledWith('da_ordenes');
        expect(ordenes).toEqual([ordenFalsa]);
    });

    it('si no hay datos guardados, carga las órdenes iniciales y las guarda una vez', () => {
        spyOn(Storage.prototype, 'getItem').and.returnValue(null);
        const espiaSet = spyOn(Storage.prototype, 'setItem');
        expect(obtenerOrdenes().length).toBe(5);
        expect(espiaSet).toHaveBeenCalledTimes(1);
    });
});
