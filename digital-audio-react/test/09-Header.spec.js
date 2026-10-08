// Header: muestra "Iniciar sesión" o el nombre del usuario según la sesión,
// lleva a cada rol a su lugar y refleja la cantidad del carrito.
import React from 'react';
import { screen, fireEvent } from '@testing-library/react';
import Header from '../src/components/layout/Header';
import RutaProtegida from '../src/components/comunes/RutaProtegida';
import { renderConApp, clienteDemo } from './helpers';

describe('Header y sesión', () => {
    beforeEach(() => localStorage.clear());

    it('sin sesión muestra el botón Iniciar sesión', () => {
        renderConApp(<Header />);
        expect(screen.getByText('Iniciar sesión')).toBeTruthy();
    });

    it('con sesión de Cliente muestra su nombre y el enlace a Mi perfil', () => {
        renderConApp(<Header />, { usuario: clienteDemo });
        expect(screen.queryByText('Iniciar sesión')).toBeNull();
        fireEvent.click(screen.getByText('Cliente', { selector: 'span' }));
        expect(screen.getByText('Mi perfil').getAttribute('href')).toBe('/mi-cuenta');
    });

    it('con sesión de Vendedor el menú lleva al panel', () => {
        renderConApp(<Header />, { usuario: { ...clienteDemo, nombre: 'Vendedor', tipoUsuario: 'Vendedor' } });
        fireEvent.click(screen.getByText('Vendedor', { selector: 'span' }));
        expect(screen.getByText('Ir al panel').getAttribute('href')).toBe('/admin');
    });

    it('el badge refleja las unidades guardadas en el carrito', () => {
        localStorage.setItem('da_carrito', JSON.stringify([{ codigo: 'A', nombre: 'A', precio: 1000, stock: 9, cantidad: 3 }]));
        renderConApp(<Header />);
        expect(screen.getByTestId('badge-carrito').textContent).toBe('3');
    });

    it('el buscador navega al catálogo con el texto buscado', () => {
        renderConApp(<Header />, { path: '/' });
        fireEvent.change(screen.getByLabelText('Buscar productos'), { target: { value: 'pedal' } });
        fireEvent.click(screen.getByLabelText('Buscar'));
        expect(screen.getByTestId('ubicacion').textContent).toBe('/catalogo');
    });
});

describe('RutaProtegida', () => {
    it('sin sesión redirige al login', () => {
        renderConApp(<RutaProtegida roles={['Administrador']}><p>Secreto</p></RutaProtegida>, { ruta: '/admin', path: '/admin' });
        expect(screen.queryByText('Secreto')).toBeNull();
        expect(screen.getByTestId('ubicacion').textContent).toBe('/login');
    });

    it('un Cliente no puede entrar al panel', () => {
        renderConApp(<RutaProtegida roles={['Administrador']}><p>Secreto</p></RutaProtegida>, { ruta: '/admin', path: '/admin', usuario: clienteDemo });
        expect(screen.getByTestId('ubicacion').textContent).toBe('/');
    });

    it('con el rol correcto muestra el contenido', () => {
        renderConApp(<RutaProtegida roles={['Cliente']}><p>Mi cuenta</p></RutaProtegida>, { usuario: clienteDemo });
        expect(screen.getByText('Mi cuenta')).toBeTruthy();
    });
});
