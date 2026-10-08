// Pruebas de la lógica de estado del carrito (reducer)
import { carritoReducer, ACCIONES, totalCarrito, cantidadCarrito } from '../src/context/carritoReducer';
import { formatoCLP } from '../src/utils/formato';

const pedal = { codigo: 'PE001', nombre: 'Pedal Distorsión', precio: 69990, imagen: 'p.png', stock: 2 };
const cable = { codigo: 'AC007', nombre: 'Cable', precio: 19990, imagen: 'c.png', stock: 10 };

describe('carritoReducer', () => {
    it('agrega un producto nuevo con cantidad 1 y suma si ya existe', () => {
        let estado = carritoReducer([], { type: ACCIONES.AGREGAR, producto: pedal });
        expect(estado.length).toBe(1);
        expect(estado[0].cantidad).toBe(1);
        estado = carritoReducer(estado, { type: ACCIONES.AGREGAR, producto: pedal });
        expect(estado[0].cantidad).toBe(2);
    });

    it('no permite superar el stock disponible', () => {
        let estado = [{ ...pedal, cantidad: 2 }];
        estado = carritoReducer(estado, { type: ACCIONES.AGREGAR, producto: pedal });
        expect(estado[0].cantidad).toBe(2);
        estado = carritoReducer(estado, { type: ACCIONES.CAMBIAR_CANTIDAD, codigo: 'PE001', delta: 1 });
        expect(estado[0].cantidad).toBe(2);
    });

    it('elimina el item cuando la cantidad llega a 0', () => {
        const estado = carritoReducer([{ ...pedal, cantidad: 1 }], { type: ACCIONES.CAMBIAR_CANTIDAD, codigo: 'PE001', delta: -1 });
        expect(estado).toEqual([]);
    });

    it('elimina, vacía y no cambia con acciones desconocidas', () => {
        const inicial = [{ ...pedal, cantidad: 1 }, { ...cable, cantidad: 3 }];
        expect(carritoReducer(inicial, { type: ACCIONES.ELIMINAR, codigo: 'PE001' }).map(i => i.codigo)).toEqual(['AC007']);
        expect(carritoReducer(inicial, { type: ACCIONES.VACIAR })).toEqual([]);
        expect(carritoReducer(inicial, { type: 'OTRA' })).toBe(inicial);
    });

    it('calcula total y cantidad de unidades', () => {
        const items = [{ ...pedal, cantidad: 2 }, { ...cable, cantidad: 3 }];
        expect(totalCarrito(items)).toBe(69990 * 2 + 19990 * 3);
        expect(cantidadCarrito(items)).toBe(5);
        expect(formatoCLP(totalCarrito(items))).toBe('$199.950');
    });
});
