// Pruebas de los servicios que llaman a la API REST (fetch simulado con el backend falso)
import {
    obtenerProductos, obtenerProducto, crearProducto, actualizarProducto, eliminarProducto, actualizarStock,
    precioFinal, descuentoProducto, productosCriticos, renombrarCategoria, eliminarCategoria, obtenerCategorias,
    buscarProductos, slugCategoria, cargarProductos
} from '../services/productosService';
import { crearOrden, obtenerOrdenes, ordenesPorCorreo, cargarOrdenes, cambiarEstadoEnvio, eliminarOrden } from '../services/ordenesService';
import { iniciarSesion, crearUsuario, actualizarUsuario, buscarUsuarioPorRun, cambiarEstadoUsuario } from '../services/usuariosService';
import { iniciarSesionFalsa } from './servidorFalso';
import { adminDemo, clienteDemo, vendedorDemo } from './helpers';

describe('Servicios conectados a la API REST', () => {
    describe('productosService (ms-productos)', () => {
        it('carga los 51 productos desde GET /api/v1/productos y busca por código', async () => {
            await cargarProductos();
            expect(fetch).toHaveBeenCalledWith('http://localhost:8082/api/v1/productos', expect.objectContaining({ method: 'GET' }));
            expect(obtenerProductos().length).toBe(51);
            expect(obtenerProducto('GE001').marca).toBe('Squier');
            expect(obtenerProducto('NO-EXISTE')).toBeNull();
        });

        it('el Administrador crea, actualiza y elimina un producto (envía el token Bearer)', async () => {
            iniciarSesionFalsa(adminDemo);
            await crearProducto({ codigo: 'TEST1', nombre: 'Producto test', categoria: 'Accesorios', precio: 1000, stock: 5 });
            const [, opciones] = fetch.mock.calls.find(([url, o]) => url.endsWith('/productos') && o.method === 'POST');
            expect(opciones.headers.Authorization).toMatch(/^Bearer /);
            expect(obtenerProducto('TEST1').stockCritico).toBe(0);

            await actualizarProducto('TEST1', { precio: 2000 });
            expect(obtenerProducto('TEST1').precio).toBe(2000);
            expect(await eliminarProducto('TEST1')).toBe(true);
            expect(obtenerProducto('TEST1')).toBeNull();
        });

        it('muestra el mensaje del backend si el código ya existe (409)', async () => {
            iniciarSesionFalsa(adminDemo);
            await expect(crearProducto({ codigo: 'ge001', nombre: 'Duplicado', categoria: 'Accesorios', precio: 1, stock: 1 }))
                .rejects.toThrow('Ya existe un producto con ese código.');
        });

        it('sin sesión el backend responde 401 al intentar crear', async () => {
            await expect(crearProducto({ codigo: 'X01', nombre: 'X', categoria: 'Accesorios', precio: 1, stock: 1 }))
                .rejects.toMatchObject({ status: 401 });
        });

        it('el Vendedor solo visualiza: el backend le responde 403 al editar (Anexo 1)', async () => {
            iniciarSesionFalsa(vendedorDemo);
            await expect(actualizarProducto('GE001', { precio: 1 })).rejects.toMatchObject({ status: 403 });
            iniciarSesionFalsa(adminDemo);
            await actualizarStock('GE001', 9, adminDemo);
            expect(obtenerProducto('GE001').stock).toBe(9);
        });

        it('aplica descuentos de oferta y detecta productos críticos', () => {
            const strato = obtenerProducto('GE001');
            expect(descuentoProducto(strato)).toBe(20);
            expect(precioFinal(strato)).toBe(175992);
            expect(precioFinal({ precio: 1000, descuento: 10 })).toBe(900);
            expect(productosCriticos().every(p => p.stock === 0 || p.stock <= p.stockCritico)).toBe(true);
        });

        it('busca sin importar tildes ni mayúsculas', () => {
            expect(buscarProductos('ELECTRICA').length).toBeGreaterThan(3);
            expect(slugCategoria('Guitarras Eléctricas')).toBe('guitarras-electricas');
        });

        it('al renombrar una categoría sus productos la siguen y no deja eliminarla si tiene productos', async () => {
            iniciarSesionFalsa(adminDemo);
            await renombrarCategoria('Micrófonos', 'Micrófonos y Voces');
            expect(obtenerCategorias()).toContain('Micrófonos y Voces');
            expect(obtenerProducto('MI001').categoria).toBe('Micrófonos y Voces');
            await expect(eliminarCategoria('Micrófonos y Voces')).rejects.toThrow();
        });
    });

    describe('ordenesService (ms-pedidos)', () => {
        it('el cliente solo recibe sus pedidos (GET /pedidos/mios)', async () => {
            iniciarSesionFalsa(clienteDemo);
            await cargarOrdenes(clienteDemo);
            expect(fetch.mock.calls.some(([url]) => url.endsWith('/pedidos/mios'))).toBe(true);
            expect(obtenerOrdenes().every(o => o.cliente.correo === clienteDemo.correo)).toBe(true);
        });

        it('crea un pedido: el backend calcula el total con el precio de oferta y descuenta stock', async () => {
            iniciarSesionFalsa(clienteDemo);
            const stockAntes = obtenerProducto('AC001').stock;
            const orden = await crearOrden({
                cliente: { nombre: 'Cliente', apellidos: 'Demo' }, direccion: { calle: 'Calle 1', region: 'R', comuna: 'C' },
                medioPago: 'Webpay', items: [{ codigo: 'AC001', nombre: 'Cuerdas', precio: 1, cantidad: 2 }]
            });
            expect(orden.estado).toBe('Pagada');
            expect(orden.total).toBe(precioFinal(obtenerProducto('AC001')) * 2); // ignora el precio enviado por el navegador
            expect(ordenesPorCorreo('CLIENTE@gmail.com')[0].numero).toBe(orden.numero);
            await cargarProductos();
            expect(obtenerProducto('AC001').stock).toBe(stockAntes - 2);
        });

        it('el Administrador avanza el estado de envío y el backend no deja retroceder', async () => {
            iniciarSesionFalsa(adminDemo);
            await cargarOrdenes(adminDemo);
            const enCamino = obtenerOrdenes().find(o => o.estadoEnvio === 'Despachado');
            await expect(cambiarEstadoEnvio(enCamino.numero, 'En preparación', adminDemo)).rejects.toThrow('No se puede volver a un estado anterior.');
            const actualizada = await cambiarEstadoEnvio(enCamino.numero, 'Entregado', adminDemo);
            expect(actualizada.estadoEnvio).toBe('Entregado');
        });

        it('solo el Administrador puede anular pedidos', async () => {
            const pendiente = obtenerOrdenes().find(o => o.estado === 'Rechazada');
            await expect(eliminarOrden(pendiente.numero, vendedorDemo)).rejects.toThrow('No tienes permiso');
            iniciarSesionFalsa(adminDemo);
            await eliminarOrden(pendiente.numero, adminDemo);
            expect(obtenerOrdenes().some(o => o.numero === pendiente.numero)).toBe(false);
        });
    });

    describe('usuariosService (ms-usuarios)', () => {
        it('el login devuelve tokens solo con correo y clave correctos', async () => {
            const respuesta = await iniciarSesion('admin@duoc.cl', 'admin1');
            expect(respuesta.usuario.tipoUsuario).toBe('Administrador');
            expect(respuesta.accessToken).toBeTruthy();
            expect(respuesta.usuario.clave).toBeUndefined(); // la contraseña nunca llega al navegador
            await expect(iniciarSesion('admin@duoc.cl', 'malaclave')).rejects.toThrow('Correo o contraseña incorrectos.');
        });

        it('no permite RUN repetido, edita datos y desactiva usuarios', async () => {
            iniciarSesionFalsa(adminDemo);
            await expect(crearUsuario({ ...clienteDemo, correo: 'otro@gmail.com' })).rejects.toThrow('Ya existe un usuario con ese RUN.');
            await actualizarUsuario('187654327', { nombre: 'Cliente Editado', clave: '' });
            expect(buscarUsuarioPorRun('187654327').nombre).toBe('Cliente Editado');
            await cambiarEstadoUsuario('187654327', false);
            expect(buscarUsuarioPorRun('187654327').activo).toBe(false);
            await expect(iniciarSesion('cliente@gmail.com', 'cliente1')).rejects.toThrow('Tu cuenta está desactivada');
        });
    });
});
