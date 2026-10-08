// Página Login: estado del formulario, validación, mensajes de error y redirección por rol
import { screen, fireEvent } from '@testing-library/react';
import React from 'react';
import Login from '../src/pages/tienda/Login';
import { renderConApp } from './helpers';

function escribir(label, valor) {
    fireEvent.change(screen.getByLabelText(label), { target: { value: valor } });
}

describe('Página Login', () => {
    beforeEach(() => localStorage.clear());

    it('muestra los errores de validación al enviar vacío', () => {
        renderConApp(<Login />, { ruta: '/login' });
        fireEvent.click(screen.getByRole('button', { name: 'Ingresar' }));
        expect(screen.getByText('El correo es requerido.')).toBeTruthy();
        expect(screen.getByText('La contraseña es requerida.')).toBeTruthy();
    });

    it('muestra "Correo o contraseña incorrectos" si las credenciales no existen', () => {
        renderConApp(<Login />, { ruta: '/login' });
        escribir('Correo', 'admin@duoc.cl');
        escribir('Contraseña', 'mala123');
        fireEvent.click(screen.getByRole('button', { name: 'Ingresar' }));
        expect(screen.getByTestId('error-login').textContent).toBe('Correo o contraseña incorrectos.');
    });

    it('el Administrador es redirigido al panel', () => {
        renderConApp(<Login />, { ruta: '/login', path: '/login' });
        escribir('Correo', 'admin@duoc.cl');
        escribir('Contraseña', 'admin1');
        fireEvent.click(screen.getByRole('button', { name: 'Ingresar' }));
        expect(screen.getByTestId('ubicacion').textContent).toBe('/admin');
    });

    it('el Cliente es redirigido a la tienda y queda guardada la sesión', () => {
        renderConApp(<Login />, { ruta: '/login', path: '/login' });
        escribir('Correo', 'cliente@gmail.com');
        escribir('Contraseña', 'cliente1');
        fireEvent.click(screen.getByRole('button', { name: 'Ingresar' }));
        expect(screen.getByTestId('ubicacion').textContent).toBe('/');
        expect(JSON.parse(localStorage.getItem('da_sesion')).correo).toBe('cliente@gmail.com');
    });
});
