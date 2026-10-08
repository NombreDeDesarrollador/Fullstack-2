// Flujo de compra: carrito -> checkout -> resultado (integración de componentes y contexto)
import React from 'react';
import { screen, fireEvent } from '@testing-library/react';
import Carrito from '../src/pages/tienda/Carrito';
import Checkout from '../src/pages/tienda/Checkout';
import CompraResultado from '../src/pages/tienda/CompraResultado';
import { renderConApp, clienteDemo } from './helpers';

const itemGuardado = { codigo: 'AC001', nombre: 'Cuerdas Guitarra Eléctrica 09-42', precio: 8990, imagen: 'c.png', stock: 50, cantidad: 2 };

describe('Flujo de compra', () => {
    beforeEach(() => localStorage.clear());

    it('el carrito vacío muestra el mensaje correspondiente', () => {
        renderConApp(<Carrito />);
        expect(screen.getByTestId('carrito-vacio')).toBeTruthy();
    });

    it('el carrito suma, resta y vacía productos', () => {
        localStorage.setItem('da_carrito', JSON.stringify([itemGuardado]));
        renderConApp(<Carrito />);
        expect(screen.getByTestId('total-carrito').textContent).toBe('$17.980');
        fireEvent.click(screen.getByLabelText('Agregar una unidad'));
        expect(screen.getByTestId('total-carrito').textContent).toBe('$26.970');
        fireEvent.click(screen.getByText('Vaciar carrito'));
        expect(screen.getByTestId('carrito-vacio')).toBeTruthy();
    });

    it('el checkout completa los datos del cliente con sesión iniciada', () => {
        localStorage.setItem('da_carrito', JSON.stringify([itemGuardado]));
        renderConApp(<Checkout />, { usuario: clienteDemo });
        expect(screen.getByLabelText(/^Nombre/).value).toBe('Cliente');
        expect(screen.getByLabelText(/^Correo/).value).toBe('cliente@gmail.com');
        expect(screen.getByLabelText(/^Comuna/).value).toBe('Viña del Mar');
    });

    it('un pago exitoso crea la orden, descuenta stock, vacía el carrito y redirige', () => {
        localStorage.setItem('da_carrito', JSON.stringify([itemGuardado]));
        renderConApp(<Checkout />, { usuario: clienteDemo, ruta: '/checkout', path: '/checkout' });
        fireEvent.click(screen.getByRole('button', { name: /Pagar ahora/ }));
        expect(screen.getByTestId('ubicacion').textContent).toBe('/compra/exito/20261006');
        expect(JSON.parse(localStorage.getItem('da_carrito'))).toEqual([]);
        expect(JSON.parse(localStorage.getItem('da_productos')).find(p => p.codigo === 'AC001').stock).toBe(48);
    });

    it('simular pago rechazado lleva a la vista de error y mantiene el carrito', () => {
        localStorage.setItem('da_carrito', JSON.stringify([itemGuardado]));
        renderConApp(<Checkout />, { usuario: clienteDemo, ruta: '/checkout', path: '/checkout' });
        fireEvent.click(screen.getByLabelText(/Simular pago rechazado/));
        fireEvent.click(screen.getByRole('button', { name: /Pagar ahora/ }));
        expect(screen.getByTestId('ubicacion').textContent).toBe('/compra/error/20261006');
        expect(JSON.parse(localStorage.getItem('da_carrito')).length).toBe(1);
    });

    it('CompraResultado cambia título y acciones según la prop exito', () => {
        const espiaPrint = spyOn(window, 'print'); // mock: evita abrir el diálogo de impresión
        renderConApp(<CompraResultado exito />, { ruta: '/compra/exito/20261002', path: '/compra/exito/:numero' });
        expect(screen.getByText(/Se ha realizado la compra/)).toBeTruthy();
        fireEvent.click(screen.getByText('Imprimir boleta en PDF'));
        expect(espiaPrint).toHaveBeenCalled();
        fireEvent.click(screen.getByText('Enviar boleta por email'));
        expect(screen.getByText(/La boleta fue enviada a/)).toBeTruthy();
    });

    it('la vista de error muestra el motivo y el botón para reintentar', () => {
        renderConApp(<CompraResultado exito={false} />, { ruta: '/compra/error/20260920', path: '/compra/error/:numero' });
        expect(screen.getByText(/No se pudo realizar el pago/)).toBeTruthy();
        expect(screen.getByText('VOLVER A REALIZAR EL PAGO').getAttribute('href')).toBe('/checkout');
    });
});
