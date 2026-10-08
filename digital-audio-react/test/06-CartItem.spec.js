// Componente CartItem: props y eventos hacia el padre
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import CartItem from '../src/components/tienda/CartItem';

const item = { codigo: 'PE001', nombre: 'Pedal Distorsión', precio: 69990, imagen: 'p.png', stock: 2, cantidad: 1 };

describe('CartItem', () => {
    let onCambiarCantidad;
    let onEliminar;

    beforeEach(() => {
        onCambiarCantidad = jasmine.createSpy('onCambiarCantidad');
        onEliminar = jasmine.createSpy('onEliminar');
    });

    it('muestra nombre, cantidad y subtotal', () => {
        render(<CartItem item={{ ...item, cantidad: 2 }} onCambiarCantidad={onCambiarCantidad} onEliminar={onEliminar} />);
        expect(screen.getByText('Pedal Distorsión')).toBeTruthy();
        expect(screen.getByTestId('cantidad').textContent).toBe('2');
        expect(screen.getByText('$139.980')).toBeTruthy();
    });

    it('los botones + y − envían el código y el cambio de cantidad', () => {
        render(<CartItem item={item} onCambiarCantidad={onCambiarCantidad} onEliminar={onEliminar} />);
        fireEvent.click(screen.getByLabelText('Agregar una unidad'));
        fireEvent.click(screen.getByLabelText('Quitar una unidad'));
        expect(onCambiarCantidad.calls.allArgs()).toEqual([['PE001', 1], ['PE001', -1]]);
    });

    it('Eliminar llama a onEliminar y + se deshabilita al llegar al stock', () => {
        render(<CartItem item={{ ...item, cantidad: 2 }} onCambiarCantidad={onCambiarCantidad} onEliminar={onEliminar} />);
        fireEvent.click(screen.getByText('Eliminar'));
        expect(onEliminar).toHaveBeenCalledWith('PE001');
        expect(screen.getByLabelText('Agregar una unidad').disabled).toBeTrue();
    });
});
