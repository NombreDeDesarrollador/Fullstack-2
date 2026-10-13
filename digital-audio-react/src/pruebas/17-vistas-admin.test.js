// Vistas del panel que no tenían pruebas: Dashboard, Boleta, Categorías, Usuarios,
// Detalle de usuario, Perfil, Detalle de producto y Productos críticos.
import { screen, fireEvent, act, within } from '@testing-library/react';
import Dashboard from '../pages/admin/Dashboard';
import Boleta from '../pages/admin/Boleta';
import CategoriasAdmin from '../pages/admin/Categorias';
import CategoriaForm from '../pages/admin/CategoriaForm';
import Usuarios from '../pages/admin/Usuarios';
import UsuarioDetalle from '../pages/admin/UsuarioDetalle';
import Perfil from '../pages/admin/Perfil';
import ProductoDetalleAdmin from '../pages/admin/ProductoDetalle';
import ProductosCriticos from '../pages/admin/ProductosCriticos';
import { obtenerCategorias, crearCategoria, obtenerProducto, productosCriticos, obtenerProductos, actualizarProducto } from '../services/productosService';
import { obtenerUsuarios, crearUsuario } from '../services/usuariosService';
import { renderConApp, adminDemo, vendedorDemo } from './helpers';

describe('Vistas del panel administrativo', () => {
    beforeEach(() => localStorage.clear());

    describe('Dashboard', () => {
        it('el Administrador ve compras, productos, usuarios y las últimas 5 órdenes', () => {
            renderConApp(<Dashboard />, { usuario: adminDemo });
            expect(screen.getByText('¡Hola, Administrador! Resumen de las actividades.')).toBeTruthy();
            expect(screen.getAllByText('Usuarios').length).toBe(2); // indicador + acceso rápido
            expect(screen.getByText(/productos con stock crítico o agotado/)).toBeTruthy();
            const filas = within(screen.getByRole('table')).getAllByRole('row');
            expect(filas.length).toBe(1 + 5); // encabezado + 5 órdenes
            // La orden más reciente va primero
            expect(within(filas[1]).getByText('#20261005')).toBeTruthy();
        });

        it('el Vendedor no ve el indicador de usuarios', () => {
            renderConApp(<Dashboard />, { usuario: vendedorDemo });
            expect(screen.queryByText('Usuarios')).toBeNull();
        });

        it('sin productos críticos no muestra la alerta', () => {
            obtenerProductos().forEach(p => actualizarProducto(p.codigo, { stock: 50, stockCritico: 1 }));
            renderConApp(<Dashboard />, { usuario: adminDemo });
            expect(screen.queryByText(/productos con stock crítico/)).toBeNull();
        });
    });

    describe('Boleta', () => {
        const abrir = (numero, usuario = adminDemo) =>
            renderConApp(<Boleta />, { usuario, ruta: `/admin/ordenes/${numero}`, path: '/admin/ordenes/:numero' });

        it('una boleta pagada muestra neto, IVA, total, selector de envío y código de barras', () => {
            abrir(20261005);
            expect(screen.getByText('N° 20261005')).toBeTruthy();
            expect(screen.getByText('IVA (19%)')).toBeTruthy();
            const selector = screen.getByLabelText('Estado de envío de la orden 20261005');
            fireEvent.change(selector, { target: { value: 'Despachado' } });
            expect(selector.value).toBe('Despachado');
            expect(document.querySelector('svg')).toBeTruthy();
        });

        it('una boleta rechazada muestra el motivo y no permite cambiar el envío', () => {
            abrir(20260920);
            expect(screen.getByText(/Pago rechazado:/)).toBeTruthy();
            expect(screen.queryByLabelText(/Estado de envío/)).toBeNull();
        });

        it('el botón Imprimir llama a window.print (mock)', () => {
            const espiaPrint = jest.spyOn(window, 'print').mockImplementation(() => {});
            abrir(20260901);
            fireEvent.click(screen.getByRole('button', { name: /Imprimir/ }));
            expect(espiaPrint).toHaveBeenCalledTimes(1);
        });

        it('si la boleta no existe lo indica', () => {
            abrir(1);
            expect(screen.getByText('No se encontró la boleta.')).toBeTruthy();
        });
    });

    describe('Categorías', () => {
        it('lista las categorías con su cantidad de productos y solo deja eliminar las vacías', () => {
            crearCategoria('Vinilos');
            renderConApp(<CategoriasAdmin />, { usuario: adminDemo });
            const fila = screen.getByText('Vinilos').closest('tr');
            const eliminar = within(fila).getByTitle('Eliminar');
            expect(eliminar.disabled).toBe(false);
            const filaConProductos = screen.getByText('Micrófonos').closest('tr');
            expect(within(filaConProductos).getByTitle('Eliminar').disabled).toBe(true);

            fireEvent.click(eliminar);
            expect(screen.queryByText('Vinilos')).toBeNull();
            expect(obtenerCategorias()).not.toContain('Vinilos');
        });

        describe('formulario de categoría', () => {
            afterEach(() => jest.useRealTimers());
            const nueva = () => renderConApp(<CategoriaForm />, { usuario: adminDemo, ruta: '/admin/categorias/nueva', path: '/admin/categorias/nueva' });
            const guardar = () => fireEvent.click(screen.getByRole('button', { name: 'Guardar categoría' }));

            it('valida nombre vacío, largo y repetido', () => {
                nueva();
                guardar();
                expect(screen.getByText('El nombre es requerido.')).toBeTruthy();
                fireEvent.change(screen.getByLabelText(/Nombre de la categoría/), { target: { value: 'x'.repeat(51) } });
                guardar();
                expect(screen.getByText('Máximo 50 caracteres.')).toBeTruthy();
                fireEvent.change(screen.getByLabelText(/Nombre de la categoría/), { target: { value: 'accesorios' } });
                guardar();
                expect(screen.getByText('Ya existe una categoría con ese nombre.')).toBeTruthy();
            });

            it('crea la categoría y vuelve al listado', () => {
                jest.useFakeTimers();
                nueva();
                fireEvent.change(screen.getByLabelText(/Nombre de la categoría/), { target: { value: 'Vinilos' } });
                guardar();
                expect(screen.getByText('Categoría guardada correctamente.')).toBeTruthy();
                expect(obtenerCategorias()).toContain('Vinilos');
                act(() => jest.advanceTimersByTime(700));
                expect(screen.getByTestId('ubicacion').textContent).toBe('/admin/categorias');
            });

            it('al editar renombra la categoría y mueve sus productos', () => {
                renderConApp(<CategoriaForm />, { usuario: adminDemo, ruta: '/admin/categorias/Micr%C3%B3fonos/editar', path: '/admin/categorias/:nombre/editar' });
                expect(screen.getByText('Editar categoría: Micrófonos')).toBeTruthy();
                expect(screen.getByText(/sus productos se moverán/)).toBeTruthy();
                fireEvent.change(screen.getByLabelText(/Nombre de la categoría/), { target: { value: 'Micrófonos y Voces' } });
                guardar();
                expect(obtenerProducto('MI001').categoria).toBe('Micrófonos y Voces');
            });
        });
    });

    describe('Usuarios', () => {
        it('filtra por rol y no permite eliminarse a sí mismo', () => {
            renderConApp(<Usuarios />, { usuario: adminDemo });
            expect(screen.getAllByRole('row').length).toBe(1 + obtenerUsuarios().length);
            fireEvent.change(screen.getByLabelText('Filtrar por rol'), { target: { value: 'Vendedor' } });
            expect(screen.getAllByRole('row').length).toBe(2);
            fireEvent.change(screen.getByLabelText('Filtrar por rol'), { target: { value: '' } });
            const filaPropia = screen.getByText('admin@duoc.cl').closest('tr');
            expect(within(filaPropia).getByTitle('Eliminar').disabled).toBe(true);
        });

        it('pide confirmación antes de eliminar y "Cancelar" no borra nada', async () => {
            renderConApp(<Usuarios />, { usuario: adminDemo });
            const total = obtenerUsuarios().length;
            const filaCliente = screen.getByText('cliente@gmail.com').closest('tr');

            fireEvent.click(within(filaCliente).getByTitle('Eliminar'));
            fireEvent.click(await screen.findByRole('button', { name: 'Cancelar' }));
            expect(obtenerUsuarios().length).toBe(total);

            fireEvent.click(within(filaCliente).getByTitle('Eliminar'));
            const modal = await screen.findByRole('dialog');
            expect(within(modal).getByText(/¿Eliminar a/)).toBeTruthy();
            fireEvent.click(within(modal).getByRole('button', { name: 'Eliminar' }));
            expect(obtenerUsuarios().length).toBe(total - 1);
            expect(screen.queryByText('cliente@gmail.com')).toBeNull();
        });
    });

    describe('Detalle de usuario', () => {
        const abrir = (run) => renderConApp(<UsuarioDetalle />, { usuario: adminDemo, ruta: `/admin/usuarios/${run}`, path: '/admin/usuarios/:run' });

        it('muestra la ficha y el historial de compras con el total gastado', () => {
            abrir('187654327');
            expect(screen.getByText('Historial de compras')).toBeTruthy();
            expect(screen.getByText('#20260901')).toBeTruthy();
            expect(screen.getByText(/2 compras · Total gastado/)).toBeTruthy();
        });

        it('un usuario sin compras muestra el mensaje y uno inexistente avisa', () => {
            crearUsuario({ run: '111111111', nombre: 'Sin', apellidos: 'Compras', correo: 'sin@gmail.com', clave: 'abcd', tipoUsuario: 'Cliente', region: '', comuna: '', direccion: '' });
            const { unmount } = abrir('111111111');
            expect(screen.getByText('Este usuario aún no registra compras.')).toBeTruthy();
            unmount();
            abrir('999');
            expect(screen.getByText('El usuario no existe.')).toBeTruthy();
        });
    });

    describe('Perfil del personal', () => {
        const abrir = () => renderConApp(<Perfil />, { usuario: vendedorDemo });
        const guardar = () => fireEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }));

        it('valida nombre, apellidos, teléfono y contraseñas', () => {
            abrir();
            fireEvent.change(screen.getByLabelText('Nombre'), { target: { value: '' } });
            fireEvent.change(screen.getByLabelText('Apellidos'), { target: { value: '' } });
            fireEvent.change(screen.getByLabelText(/^Teléfono/), { target: { value: '12' } });
            fireEvent.change(screen.getByLabelText(/^Nueva contraseña/), { target: { value: 'abc' } });
            guardar();
            expect(screen.getByText('El nombre es requerido.')).toBeTruthy();
            expect(screen.getByText('Los apellidos son requeridos.')).toBeTruthy();
            expect(screen.getByText('Teléfono no válido.')).toBeTruthy();
            expect(screen.getByText('Debe tener entre 4 y 10 caracteres.')).toBeTruthy();
            expect(screen.getByText('Las contraseñas no coinciden.')).toBeTruthy();
        });

        it('guarda los datos y la nueva contraseña', () => {
            abrir();
            fireEvent.change(screen.getByLabelText('Nombre'), { target: { value: 'Vendedora' } });
            fireEvent.change(screen.getByLabelText(/^Nueva contraseña/), { target: { value: 'nueva1' } });
            fireEvent.change(screen.getByLabelText('Confirmar contraseña'), { target: { value: 'nueva1' } });
            guardar();
            expect(screen.getByText('Datos actualizados correctamente.')).toBeTruthy();
            const guardado = obtenerUsuarios().find(u => u.run === vendedorDemo.run);
            expect(guardado.nombre).toBe('Vendedora');
            expect(guardado.clave).toBe('nueva1');
            expect(screen.getByLabelText(/^Nueva contraseña/).value).toBe('');
        });
    });

    describe('Detalle de producto (panel)', () => {
        const abrir = (codigo, usuario = adminDemo) =>
            renderConApp(<ProductoDetalleAdmin />, { usuario, ruta: `/admin/productos/${codigo}`, path: '/admin/productos/:codigo' });

        it('muestra oferta, ventas e ingresos, y el Administrador puede editar', () => {
            abrir('GE001');
            expect(screen.getByText(/-20% →/)).toBeTruthy();
            expect(screen.getByText('Unidades vendidas')).toBeTruthy();
            expect(screen.getByRole('link', { name: /Editar producto/ })).toBeTruthy();
        });

        it('el Vendedor no ve el botón de editar y un producto sin oferta dice "No"', () => {
            abrir('AC001', vendedorDemo);
            expect(screen.queryByRole('link', { name: /Editar producto/ })).toBeNull();
            expect(screen.getByText('No')).toBeTruthy();
        });

        it('si el producto no existe lo indica', () => {
            abrir('NOPE');
            expect(screen.getByText('El producto no existe.')).toBeTruthy();
        });
    });

    describe('Productos críticos', () => {
        it('lista agotados y bajo stock crítico; el Vendedor puede reponer stock pero no editar', async () => {
            renderConApp(<ProductosCriticos />, { usuario: vendedorDemo });
            const antes = productosCriticos().length;
            expect(screen.getAllByText('Agotado').length).toBeGreaterThan(0);
            expect(screen.queryAllByRole('link').filter(a => a.getAttribute('href').endsWith('/editar')).length).toBe(0);

            const fila = screen.getByText('GA005').closest('tr');
            fireEvent.click(within(fila).getByTitle('Reponer stock'));
            fireEvent.change(await screen.findByLabelText('Nuevo stock'), { target: { value: '20' } });
            fireEvent.click(screen.getByRole('button', { name: 'Guardar stock' }));
            expect(obtenerProducto('GA005').stock).toBe(20);
            expect(productosCriticos().length).toBe(antes - 1);
            expect(screen.queryByText('GA005')).toBeNull();
        });

        it('el Administrador también ve el enlace para editar', () => {
            renderConApp(<ProductosCriticos />, { usuario: adminDemo });
            expect(screen.queryAllByRole('link').some(a => a.getAttribute('href').endsWith('/editar'))).toBe(true);
        });

        it('sin productos críticos muestra el mensaje vacío', () => {
            obtenerProductos().forEach(p => actualizarProducto(p.codigo, { stock: 50, stockCritico: 1 }));
            renderConApp(<ProductosCriticos />, { usuario: adminDemo });
            expect(screen.getByText('No hay productos críticos.')).toBeTruthy();
        });
    });
});
