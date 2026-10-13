// Segunda iteración guiada por el informe de cobertura: líneas que seguían sin ejecutarse
// (vista Reportes, eliminación de productos, campos opcionales del Checkout, stock insuficiente,
// "Ir a pagar" del carrito y cierre de sesión del Cliente dentro de la app completa).
import { screen, fireEvent, within } from '@testing-library/react';
import Reportes from '../pages/admin/Reportes';
import Productos from '../pages/admin/Productos';
import Checkout from '../pages/tienda/Checkout';
import Carrito from '../pages/tienda/Carrito';
import { obtenerProducto, actualizarProducto } from '../services/productosService';
import { buscarOrden, obtenerOrdenes } from '../services/ordenesService';
import { renderConApp, renderApp, clienteDemo, adminDemo } from './helpers';

const itemGuardado = { codigo: 'AC001', nombre: 'Cuerdas Guitarra Eléctrica 09-42', precio: 8990, imagen: 'c.png', stock: 50, cantidad: 2 };

describe('Casos de borde detectados con el informe de cobertura', () => {
    beforeEach(() => localStorage.clear());

    it('la vista Reportes muestra indicadores, barras por categoría y mes, top de productos e inventario', () => {
        const espiaPrint = jest.spyOn(window, 'print').mockImplementation(() => {});
        renderConApp(<Reportes />, { usuario: adminDemo });
        expect(screen.getByText('Ventas totales')).toBeTruthy();
        expect(screen.getByText('Ticket promedio')).toBeTruthy();
        expect(screen.getByText('Septiembre de 2026')).toBeTruthy();
        expect(screen.getByText('Productos más vendidos')).toBeTruthy();
        expect(screen.getByText('Inventario por categoría')).toBeTruthy();
        fireEvent.click(screen.getByRole('button', { name: /Imprimir/ }));
        expect(espiaPrint).toHaveBeenCalled();
    });

    it('el Administrador elimina un producto después de confirmar en el modal', async () => {
        renderConApp(<Productos />, { usuario: adminDemo });
        const fila = screen.getByText('GE001').closest('tr');
        fireEvent.click(within(fila).getByTitle('Eliminar'));
        const modal = await screen.findByRole('dialog');
        expect(within(modal).getByText(/Esta acción no se puede deshacer/)).toBeTruthy();
        fireEvent.click(within(modal).getByRole('button', { name: 'Eliminar' }));
        expect(obtenerProducto('GE001')).toBeNull();
        expect(screen.queryByText('GE001')).toBeNull();
    });

    it('el Checkout guarda departamento, indicaciones y medio de pago elegidos', () => {
        localStorage.setItem('da_carrito', JSON.stringify([itemGuardado]));
        renderConApp(<Checkout />, { usuario: clienteDemo, ruta: '/checkout', path: '/checkout' });
        fireEvent.change(screen.getByLabelText(/^Departamento/), { target: { value: '603' } });
        fireEvent.change(screen.getByLabelText(/^Indicaciones/), { target: { value: 'Edificio azul' } });
        fireEvent.click(screen.getByLabelText('Transferencia'));
        fireEvent.click(screen.getByRole('button', { name: /Pagar ahora/ }));

        const orden = obtenerOrdenes().slice(-1)[0];
        expect(orden.estado).toBe('Pagada');
        expect(orden.medioPago).toBe('Transferencia');
        expect(orden.direccion.departamento).toBe('603');
        expect(orden.direccion.indicaciones).toBe('Edificio azul');
    });

    it('si el stock cambió antes de pagar, la orden se rechaza por stock insuficiente', () => {
        localStorage.setItem('da_carrito', JSON.stringify([itemGuardado]));
        actualizarProducto('AC001', { stock: 1 });
        renderConApp(<Checkout />, { usuario: clienteDemo, ruta: '/checkout', path: '/checkout' });
        fireEvent.click(screen.getByRole('button', { name: /Pagar ahora/ }));

        const numero = screen.getByTestId('ubicacion').textContent.split('/').pop();
        expect(screen.getByTestId('ubicacion').textContent).toContain('/compra/error/');
        expect(buscarOrden(numero).motivo).toBe('Stock insuficiente para Cuerdas Guitarra Eléctrica 09-42.');
        // El carrito se mantiene para reintentar
        expect(JSON.parse(localStorage.getItem('da_carrito')).length).toBe(1);
    });

    it('"Ir a pagar" del carrito lleva al checkout', () => {
        localStorage.setItem('da_carrito', JSON.stringify([itemGuardado]));
        renderConApp(<Carrito />, { ruta: '/carrito', path: '/carrito' });
        fireEvent.click(screen.getByRole('button', { name: /Ir a pagar/ }));
        expect(screen.getByTestId('ubicacion').textContent).toBe('/checkout');
    });

    it('el Cliente cierra sesión desde Mi cuenta: se borra la sesión y sale de la página protegida', () => {
        localStorage.setItem('da_sesion', JSON.stringify(clienteDemo));
        renderApp('/mi-cuenta', clienteDemo);
        expect(screen.getByText('Hola, Cliente')).toBeTruthy();
        fireEvent.click(screen.getAllByRole('button', { name: 'Cerrar sesión' }).pop());
        expect(screen.getByTestId('ubicacion').textContent).not.toBe('/mi-cuenta');
        expect(screen.queryByText('Hola, Cliente')).toBeNull();
        expect(localStorage.getItem('da_sesion')).toBeNull();
    });
});
