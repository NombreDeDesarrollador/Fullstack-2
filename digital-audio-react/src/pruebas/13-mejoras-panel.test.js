// Mejoras pedidas por el docente:
// permisos por rol, stock del Vendedor, orden por criticidad, estados de envío,
// código de barras y validación de RUN desde 1-9.
import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { validarRun, calcularDv, limpiarRun } from '../utils/validaciones';
import { puede } from '../utils/permisos';
import { actualizarStock, ordenarPorCriticidad, obtenerProducto } from '../services/productosService';
import { cambiarEstadoEnvio, siguientesEstadosEnvio, obtenerOrdenes, buscarOrden } from '../services/ordenesService';
import { productosIniciales } from '../data/productos';
import CodigoBarras, { calcularBarras } from '../components/comunes/CodigoBarras';
import Productos from '../pages/admin/Productos';
import Ordenes from '../pages/admin/Ordenes';
import { renderConApp, clienteDemo } from './helpers';

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
    it('el Vendedor solo puede actualizar stock y estados de pedidos', () => {
        expect(puede(vendedor, 'productos:stock')).toBe(true);
        expect(puede(vendedor, 'ordenes:estado')).toBe(true);
        expect(puede(vendedor, 'productos:editar')).toBe(false);
        expect(puede(vendedor, 'productos:eliminar')).toBe(false);
    });

    it('el Cliente y un usuario sin sesión no tienen permisos del panel', () => {
        expect(puede(clienteDemo, 'productos:stock')).toBe(false);
        expect(puede(null, 'ordenes:estado')).toBe(false);
        expect(puede(admin, 'productos:editar')).toBe(true);
    });
});

describe('Actualizar stock', () => {
    beforeEach(() => localStorage.clear());

    it('el Vendedor actualiza el stock y solo cambia ese campo', () => {
        const antes = obtenerProducto('GA005');
        const despues = actualizarStock('GA005', '7', vendedor);
        expect(despues.stock).toBe(7);
        expect(despues.precio).toBe(antes.precio);
        expect(obtenerProducto('GA005').stock).toBe(7);
    });

    it('un Cliente no puede actualizar stock', () => {
        expect(() => actualizarStock('GA005', 5, clienteDemo)).toThrow('No tienes permiso para realizar esta acción.');
    });

    it('rechaza stock negativo, decimal o vacío', () => {
        expect(() => actualizarStock('GA005', -1, vendedor)).toThrow(/entero mayor o igual a 0/);
        expect(() => actualizarStock('GA005', 2.5, vendedor)).toThrow(/entero/);
        expect(() => actualizarStock('GA005', '', vendedor)).toThrow(/entero/);
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
    beforeEach(() => localStorage.clear());

    it('muestra primero el producto más crítico', () => {
        renderConApp(<Productos />, { usuario: admin });
        const filas = screen.getAllByTestId('fila-producto');
        expect(within(filas[0]).getByText('AC006')).toBeTruthy(); // Afinador de Clip, agotado
        expect(filas[0].className).toContain('table-danger');
    });

    it('el Vendedor ve el botón de stock pero no editar ni eliminar', () => {
        renderConApp(<Productos />, { usuario: vendedor });
        expect(screen.getAllByTitle('Actualizar stock').length).toBe(productosIniciales.length);
        expect(screen.queryAllByTitle('Editar').length).toBe(0);
        expect(screen.queryAllByTitle('Eliminar').length).toBe(0);
    });

    it('el Vendedor repone stock desde el modal y el producto deja de estar primero', async () => {
        renderConApp(<Productos />, { usuario: vendedor });
        fireEvent.click(screen.getByLabelText('Actualizar stock de Guitarra 3/4 Niños'));
        const modal = await screen.findByRole('dialog');
        fireEvent.change(within(modal).getByLabelText('Nuevo stock'), { target: { value: '10' } });
        fireEvent.click(within(modal).getByRole('button', { name: 'Guardar stock' }));
        expect(screen.getByText(/actualizado a 10 unidades/)).toBeTruthy();
        expect(obtenerProducto('GA005').stock).toBe(10);
        expect(within(screen.getAllByTestId('fila-producto')[0]).queryByText('GA005')).toBeNull();
    });

    it('el modal muestra el error si el stock no es válido', async () => {
        renderConApp(<Productos />, { usuario: vendedor });
        fireEvent.click(screen.getByLabelText('Actualizar stock de Guitarra 3/4 Niños'));
        const modal = await screen.findByRole('dialog');
        fireEvent.change(within(modal).getByLabelText('Nuevo stock'), { target: { value: '-3' } });
        fireEvent.click(within(modal).getByRole('button', { name: 'Guardar stock' }));
        expect(within(modal).getByText(/entero mayor o igual a 0/)).toBeTruthy();
        expect(obtenerProducto('GA005').stock).toBe(0);
    });
});

describe('Estado de envío de los pedidos', () => {
    beforeEach(() => localStorage.clear());

    it('las órdenes pagadas tienen estado de envío y las rechazadas no', () => {
        const ordenes = obtenerOrdenes();
        expect(ordenes.filter(o => o.estado === 'Pagada').every(o => !!o.estadoEnvio)).toBe(true);
        expect(buscarOrden(20260920).estadoEnvio).toBeUndefined();
    });

    it('el Vendedor marca un pedido como Entregado', () => {
        const orden = cambiarEstadoEnvio(20261005, 'Entregado', vendedor);
        expect(orden.estadoEnvio).toBe('Entregado');
        expect(buscarOrden(20261005).estadoEnvio).toBe('Entregado');
    });

    it('no permite retroceder, despachar rechazadas ni que un Cliente cambie el estado', () => {
        expect(siguientesEstadosEnvio(buscarOrden(20261002))).toEqual(['Despachado', 'Entregado']);
        expect(() => cambiarEstadoEnvio(20260901, 'Despachado', admin)).toThrow('No se puede volver a un estado anterior.');
        expect(() => cambiarEstadoEnvio(20260920, 'Despachado', admin)).toThrow('Solo se pueden despachar órdenes pagadas.');
        expect(() => cambiarEstadoEnvio(20261005, 'Entregado', clienteDemo)).toThrow(/permiso/);
        expect(() => cambiarEstadoEnvio(20261005, 'Perdido', admin)).toThrow('Estado de envío no válido.');
    });

    it('en el listado de órdenes el Administrador cambia el estado con el selector', () => {
        renderConApp(<Ordenes />, { usuario: admin });
        const selector = screen.getByLabelText('Estado de envío de la orden 20261005');
        fireEvent.change(selector, { target: { value: 'Despachado' } });
        expect(buscarOrden(20261005).estadoEnvio).toBe('Despachado');
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
        expect(() => calcularBarras('ÑANDÚ')).toThrow(/solo acepta/);
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
