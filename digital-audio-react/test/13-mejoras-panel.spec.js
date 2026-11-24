// Generado a partir de src/pruebas/13-mejoras-panel.test.js (misma prueba, sintaxis Jasmine para Karma)
// Mejoras pedidas por el docente:
// permisos por rol, stock del Vendedor, orden por criticidad, estados de envío,
// código de barras y validación de RUN desde 1-9.
import React from 'react';
import { render, screen, fireEvent, within} from '@testing-library/react';
import { waitFor } from './helpers';
import { validarRun, calcularDv, limpiarRun } from '../src/utils/validaciones';
import { puede } from '../src/utils/permisos';
import { actualizarStock, ordenarPorCriticidad, obtenerProducto } from '../src/services/productosService';
import { cambiarEstadoEnvio, siguientesEstadosEnvio, obtenerOrdenes, buscarOrden } from '../src/services/ordenesService';
import { productosIniciales } from '../src/data/productos';
import CodigoBarras, { calcularBarras } from '../src/components/comunes/CodigoBarras';
import Productos from '../src/pages/admin/Productos';
import Ordenes from '../src/pages/admin/Ordenes';
import { renderConApp, clienteDemo } from './helpers';
import { iniciarSesionFalsa } from '../src/pruebas/servidorFalso';

const admin = { ...clienteDemo, run: '156782343', nombre: 'Administrador', tipoUsuario: 'Administrador' };
const vendedor = { ...clienteDemo, run: '172345670', nombre: 'Vendedor', tipoUsuario: 'Vendedor' };

describe('Validación de RUN (módulo 11, desde 1-9)', () => {
    it('acepta RUN válidos con o sin puntos y guion', () => {
        expect(validarRun('19.011.029-K')).toBe(true);
        expect(validarRun('19011029-k')).toBe(true);
        expect(validarRun('12345678-5')).toBe(true);
        expect(validarRun('9.876.543-3')).toBe(true);
    });

    it('acepta el RUN 1-9 y otros RUN cortos válidos', () => {
        expect(validarRun('1-9')).toBe(true);
        expect(validarRun('19')).toBe(true);
        expect(validarRun('2-7')).toBe(true);
        expect(validarRun('1-8')).toBe(false); // mismo cuerpo, DV incorrecto
    });

    it('rechaza DV distinto de 0-9 o K, ceros a la izquierda y cuerpos de más de 8 dígitos', () => {
        expect(validarRun('12345678-X')).toBe(false);
        expect(validarRun('0-0')).toBe(false);
        expect(validarRun('01-9')).toBe(false);
        expect(validarRun('123456789-' + calcularDv('123456789'))).toBe(false);
        expect(validarRun('-9')).toBe(false);
    });

    it('calcularDv y limpiarRun funcionan por separado', () => {
        expect(calcularDv('1')).toBe('9');
        expect(calcularDv('19011029')).toBe('K');
        expect(calcularDv('17234567')).toBe('0');
        expect(limpiarRun(' 19.011.029-k ')).toBe('19011029K');
    });
});

describe('Permisos por rol', () => {
    it('el Vendedor solo visualiza: no tiene ninguna acción de modificación (Anexo 1)', () => {
        ['productos:crear', 'productos:editar', 'productos:eliminar', 'productos:stock',
            'ordenes:estado', 'ordenes:eliminar', 'usuarios:gestionar', 'reportes:ver']
            .forEach(accion => expect(puede(vendedor, accion)).toBe(false));
        expect(puede(admin, 'productos:stock')).toBe(true);
        expect(puede(admin, 'ordenes:estado')).toBe(true);
    });

    it('el Cliente y un usuario sin sesión no tienen permisos del panel', () => {
        expect(puede(clienteDemo, 'productos:stock')).toBe(false);
        expect(puede(null, 'ordenes:estado')).toBe(false);
        expect(puede(admin, 'productos:editar')).toBe(true);
    });
});

describe('Actualizar stock', () => {
    it('el Administrador actualiza el stock (PATCH) y solo cambia ese campo', async () => {
        iniciarSesionFalsa(admin);
        const antes = obtenerProducto('GA005');
        const despues = await actualizarStock('GA005', '7', admin);
        expect(despues.stock).toBe(7);
        expect(despues.precio).toBe(antes.precio);
        expect(obtenerProducto('GA005').stock).toBe(7);
    });

    it('un Vendedor o un Cliente no pueden actualizar stock (ni siquiera llega a llamar a la API)', async () => {
        await expectAsync(actualizarStock('GA005', 5, vendedor)).toBeRejectedWithError(/No tienes permiso para realizar esta acción\./);
        await expectAsync(actualizarStock('GA005', 5, clienteDemo)).toBeRejectedWithError(/No tienes permiso para realizar esta acción\./);
        expect(fetch).not.toHaveBeenCalled();
    });

    it('si el Vendedor llama directo a la API, el backend responde 403', async () => {
        iniciarSesionFalsa(vendedor);
        const respuesta = await fetch('http://localhost:8082/api/v1/productos/GA005/stock', {
            method: 'PATCH', headers: { Authorization: `Bearer ${JSON.parse(localStorage.getItem('da_sesion')).accessToken}` },
            body: JSON.stringify({ stock: 9 })
        });
        expect(respuesta.status).toBe(403);
    });

    it('rechaza stock negativo, decimal o vacío', async () => {
        await expectAsync(actualizarStock('GA005', -1, admin)).toBeRejectedWithError(/entero mayor o igual a 0/);
        await expectAsync(actualizarStock('GA005', 2.5, admin)).toBeRejectedWithError(/entero/);
        await expectAsync(actualizarStock('GA005', '', admin)).toBeRejectedWithError(/entero/);
    });
});

describe('Orden por criticidad', () => {
    it('pone primero los agotados, luego los críticos y al final el resto', () => {
        const ordenados = ordenarPorCriticidad(productosIniciales);
        // 3 agotados (ordenados por nombre) y después BA002 (stock 1, crítico 1)
        expect(ordenados.slice(0, 4).map(p => p.codigo)).toEqual(['AC006', 'GA005', 'TC003', 'BA002']);
        expect(ordenados[ordenados.length - 1].stock).toBeGreaterThan(0);
        expect(productosIniciales[0].codigo).toBe('GA001'); // no modifica la lista original
    });
});

describe('Listado de productos según el rol', () => {
    it('muestra primero el producto más crítico', () => {
        renderConApp(<Productos />, { usuario: admin });
        const filas = screen.getAllByTestId('fila-producto');
        expect(within(filas[0]).getByText('AC006')).toBeTruthy(); // Afinador de Clip, agotado
        expect(filas[0].className).toContain('table-danger');
    });

    it('el Vendedor solo ve la lista: sin botones de stock, editar, eliminar ni nuevo producto', () => {
        renderConApp(<Productos />, { usuario: vendedor });
        expect(screen.getAllByTestId('fila-producto').length).toBe(productosIniciales.length);
        expect(screen.queryAllByTitle('Actualizar stock').length).toBe(0);
        expect(screen.queryAllByTitle('Editar').length).toBe(0);
        expect(screen.queryAllByTitle('Eliminar').length).toBe(0);
        expect(screen.queryByText(/Nuevo producto/)).toBeNull();
    });

    it('el Administrador repone stock desde el modal y el producto deja de estar primero', async () => {
        renderConApp(<Productos />, { usuario: admin });
        fireEvent.click(screen.getByLabelText('Actualizar stock de Guitarra 3/4 Niños'));
        const modal = await screen.findByRole('dialog');
        fireEvent.change(within(modal).getByLabelText('Nuevo stock'), { target: { value: '10' } });
        fireEvent.click(within(modal).getByRole('button', { name: 'Guardar stock' }));
        expect(await screen.findByText(/actualizado a 10 unidades/)).toBeTruthy();
        expect(obtenerProducto('GA005').stock).toBe(10);
        expect(within(screen.getAllByTestId('fila-producto')[0]).queryByText('GA005')).toBeNull();
    });

    it('el modal muestra el error si el stock no es válido', async () => {
        renderConApp(<Productos />, { usuario: admin });
        fireEvent.click(screen.getByLabelText('Actualizar stock de Guitarra 3/4 Niños'));
        const modal = await screen.findByRole('dialog');
        fireEvent.change(within(modal).getByLabelText('Nuevo stock'), { target: { value: '-3' } });
        fireEvent.click(within(modal).getByRole('button', { name: 'Guardar stock' }));
        expect(await within(modal).findByText(/entero mayor o igual a 0/)).toBeTruthy();
        expect(obtenerProducto('GA005').stock).toBe(0);
    });
});

describe('Estado de envío de los pedidos', () => {
    it('las órdenes pagadas tienen estado de envío y las rechazadas no', () => {
        const ordenes = obtenerOrdenes();
        expect(ordenes.filter(o => o.estado === 'Pagada').every(o => !!o.estadoEnvio)).toBe(true);
        expect(buscarOrden(20260920).estadoEnvio).toBeFalsy();
    });

    it('el Vendedor no puede cambiar el estado de envío (solo lo visualiza)', async () => {
        await expectAsync(cambiarEstadoEnvio(20261005, 'Entregado', vendedor)).toBeRejectedWithError(/permiso/);
    });

    it('el Administrador marca un pedido como Entregado', async () => {
        iniciarSesionFalsa(admin);
        const orden = await cambiarEstadoEnvio(20261005, 'Entregado', admin);
        expect(orden.estadoEnvio).toBe('Entregado');
        expect(buscarOrden(20261005).estadoEnvio).toBe('Entregado');
    });

    it('no permite retroceder, despachar rechazadas ni que un Cliente cambie el estado', async () => {
        iniciarSesionFalsa(admin);
        expect(siguientesEstadosEnvio(buscarOrden(20261002))).toEqual(['Despachado', 'Entregado']);
        await expectAsync(cambiarEstadoEnvio(20260901, 'Despachado', admin)).toBeRejectedWithError(/No se puede volver a un estado anterior\./);
        await expectAsync(cambiarEstadoEnvio(20260920, 'Despachado', admin)).toBeRejectedWithError(/Solo se pueden despachar órdenes pagadas\./);
        await expectAsync(cambiarEstadoEnvio(20261005, 'Entregado', clienteDemo)).toBeRejectedWithError(/permiso/);
        await expectAsync(cambiarEstadoEnvio(20261005, 'Perdido', admin)).toBeRejectedWithError(/Estado de envío no válido\./);
    });

    it('en el listado de órdenes el Administrador cambia el estado con el selector', async () => {
        renderConApp(<Ordenes />, { usuario: admin });
        const selector = screen.getByLabelText('Estado de envío de la orden 20261005');
        fireEvent.change(selector, { target: { value: 'Despachado' } });
        await waitFor(() => expect(buscarOrden(20261005).estadoEnvio).toBe('Despachado'));
        expect(screen.getByLabelText('Estado de envío de la orden 20261005').value).toBe('Despachado');
    });

    it('una orden ya entregada se muestra como badge, sin selector', () => {
        renderConApp(<Ordenes />, { usuario: vendedor });
        expect(screen.queryByLabelText('Estado de envío de la orden 20260901')).toBeNull();
        expect(screen.getAllByText('Entregado').length).toBeGreaterThan(0);
    });
});

describe('Código de barras (Code 39)', () => {
    it('genera 5 barras por carácter, incluyendo los asteriscos de inicio y fin', () => {
        const { barras, anchoTotal } = calcularBarras('GE001');
        expect(barras.length).toBe((5 + 2) * 5);
        expect(anchoTotal).toBeGreaterThan(0);
    });

    it('no acepta caracteres fuera del estándar', () => {
        expect(() => calcularBarras('ÑANDÚ')).toThrowError(/solo acepta/);
        expect(() => calcularBarras('')).toThrow();
    });

    it('el componente dibuja el SVG con el texto y avisa si el código no es válido', () => {
        const { container, rerender } = render(<CodigoBarras valor="order20261002" />);
        expect(screen.getByRole('img').getAttribute('aria-label')).toBe('Código de barras order20261002');
        expect(container.querySelectorAll('rect').length).toBe((13 + 2) * 5);
        expect(screen.getByText('ORDER20261002')).toBeTruthy();
        rerender(<CodigoBarras valor="¿?" />);
        expect(screen.getByText('Código no válido')).toBeTruthy();
    });
});
