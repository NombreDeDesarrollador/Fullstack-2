// Componente ProductCard: renderizado con props, estado interno y eventos
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ProductCard from '../src/components/tienda/ProductCard';
import ProductGrid from '../src/components/tienda/ProductGrid';
import { productoDemo } from './helpers';

function renderCard(producto, onAgregar) {
    return render(<MemoryRouter><ProductCard producto={producto} onAgregar={onAgregar} /></MemoryRouter>);
}

describe('ProductCard', () => {
    it('renderiza nombre, marca, código e imagen recibidos por props', () => {
        renderCard({ ...productoDemo, codigo: 'XX01' }, () => true);
        expect(screen.getByText('Guitarra Eléctrica Stratocaster')).toBeTruthy();
        expect(screen.getByText('Squier')).toBeTruthy();
        expect(screen.getByText('XX01')).toBeTruthy();
        expect(screen.getByAltText('Guitarra Eléctrica Stratocaster').getAttribute('src')).toBe('guitarra.png');
    });

    it('muestra el descuento cuando el producto está en oferta (renderizado condicional)', () => {
        renderCard(productoDemo, () => true); // GE001 tiene 20% de descuento
        expect(screen.getByText('-20%')).toBeTruthy();
        expect(screen.getByText('$175.992')).toBeTruthy();
    });

    it('al hacer clic llama a onAgregar con el producto y cambia el texto del botón (estado)', () => {
        const onAgregar = jasmine.createSpy('onAgregar').and.returnValue(true);
        renderCard(productoDemo, onAgregar);
        fireEvent.click(screen.getByRole('button', { name: /añadir al carrito/i }));
        expect(onAgregar).toHaveBeenCalledOnceWith(productoDemo);
        expect(screen.getByRole('button').textContent).toContain('Agregado');
    });

    it('si onAgregar devuelve false avisa que no hay más unidades', () => {
        renderCard(productoDemo, jasmine.createSpy().and.returnValue(false));
        fireEvent.click(screen.getByRole('button'));
        expect(screen.getByRole('button').textContent).toBe('Sin más unidades');
    });

    it('deshabilita el botón cuando no hay stock', () => {
        renderCard({ ...productoDemo, stock: 0 }, () => true);
        const boton = screen.getByRole('button');
        expect(boton.disabled).toBeTrue();
        expect(boton.textContent).toBe('Sin stock');
    });
});

describe('ProductGrid', () => {
    it('renderiza una tarjeta por cada producto de la lista', () => {
        const lista = [productoDemo, { ...productoDemo, codigo: 'A2', nombre: 'Otro' }, { ...productoDemo, codigo: 'A3', nombre: 'Tercero' }];
        render(<MemoryRouter><ProductGrid productos={lista} onAgregar={() => true} /></MemoryRouter>);
        expect(screen.getAllByRole('button', { name: /añadir/i }).length).toBe(3);
    });

    it('muestra el mensaje vacío solo cuando no hay productos', () => {
        render(<MemoryRouter><ProductGrid productos={[]} onAgregar={() => true} mensajeVacio="Nada por aquí" /></MemoryRouter>);
        expect(screen.getByTestId('sin-productos').textContent).toBe('Nada por aquí');
    });
});
