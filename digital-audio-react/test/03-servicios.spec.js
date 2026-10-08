// Pruebas del archivo de datos y sus funciones CRUD (persisten en localStorage)
import {
    obtenerProductos, obtenerProducto, crearProducto, actualizarProducto, eliminarProducto,
    precioFinal, descuentoProducto, productosCriticos, renombrarCategoria, eliminarCategoria, obtenerCategorias, buscarProductos, slugCategoria
} from '../src/services/productosService';
import { crearOrden, obtenerOrdenes, ordenesPorCorreo } from '../src/services/ordenesService';
import { autenticar, crearUsuario, actualizarUsuario, buscarUsuarioPorRun } from '../src/services/usuariosService';

describe('Servicios CRUD (fuente de datos simulada)', () => {
    beforeEach(() => localStorage.clear());

    describe('productosService', () => {
        it('lee los 51 productos iniciales y busca por código', () => {
            expect(obtenerProductos().length).toBe(51);
            expect(obtenerProducto('GE001').marca).toBe('Squier');
            expect(obtenerProducto('NO-EXISTE')).toBeNull();
        });

        it('crea, actualiza y elimina un producto', () => {
            crearProducto({ codigo: 'TEST1', nombre: 'Producto test', categoria: 'Accesorios', precio: 1000, stock: 5 });
            expect(obtenerProducto('TEST1').stockCritico).toBe(0);
            actualizarProducto('TEST1', { precio: 2000 });
            expect(obtenerProducto('TEST1').precio).toBe(2000);
            expect(eliminarProducto('TEST1')).toBeTrue();
            expect(obtenerProducto('TEST1')).toBeNull();
        });

        it('lanza error si el código ya existe', () => {
            expect(() => crearProducto({ codigo: 'ge001', nombre: 'Duplicado' })).toThrowError('Ya existe un producto con ese código.');
        });

        it('aplica descuentos de oferta y detecta productos críticos', () => {
            const strato = obtenerProducto('GE001');
            expect(descuentoProducto(strato)).toBe(20);
            expect(precioFinal(strato)).toBe(175992);
            expect(productosCriticos().every(p => p.stock === 0 || p.stock <= p.stockCritico)).toBeTrue();
        });

        it('busca sin importar tildes ni mayúsculas', () => {
            expect(buscarProductos('ELECTRICA').length).toBeGreaterThan(3);
            expect(slugCategoria('Guitarras Eléctricas')).toBe('guitarras-electricas');
        });

        it('al renombrar una categoría mueve sus productos y no deja eliminarla si tiene productos', () => {
            renombrarCategoria('Micrófonos', 'Micrófonos y Voces');
            expect(obtenerCategorias()).toContain('Micrófonos y Voces');
            expect(obtenerProducto('MI001').categoria).toBe('Micrófonos y Voces');
            expect(() => eliminarCategoria('Micrófonos y Voces')).toThrow();
        });
    });

    describe('ordenesService', () => {
        it('crea órdenes con número correlativo y total calculado', () => {
            const cantidadInicial = obtenerOrdenes().length;
            const orden = crearOrden({
                estado: 'Pagada', cliente: { nombre: 'Ana', apellidos: 'Soto', correo: 'ana@gmail.com' }, direccion: {},
                items: [{ codigo: 'AC001', nombre: 'Cuerdas', precio: 8990, cantidad: 2 }]
            });
            expect(orden.numero).toBe(20261006);
            expect(orden.total).toBe(17980);
            expect(obtenerOrdenes().length).toBe(cantidadInicial + 1);
            expect(ordenesPorCorreo('ANA@gmail.com').length).toBe(1);
        });
    });

    describe('usuariosService', () => {
        it('autentica solo con correo y clave correctos', () => {
            expect(autenticar('admin@duoc.cl', 'admin1').tipoUsuario).toBe('Administrador');
            expect(autenticar('admin@duoc.cl', 'malaclave')).toBeNull();
        });

        it('no permite RUN repetido y mantiene la clave si se edita sin contraseña', () => {
            expect(() => crearUsuario({ run: '333333333', correo: 'otro@gmail.com' })).toThrowError('Ya existe un usuario con ese RUN.');
            actualizarUsuario('333333333', { nombre: 'Cliente Editado', clave: '' });
            expect(buscarUsuarioPorRun('333333333').clave).toBe('cliente1');
            expect(buscarUsuarioPorRun('333333333').nombre).toBe('Cliente Editado');
        });
    });
});
