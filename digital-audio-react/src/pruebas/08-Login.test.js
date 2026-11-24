// Página Login: estado del formulario, validación, mensaje de error del backend y redirección por rol
import { screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import Login from '../pages/tienda/Login';
import { renderConApp } from './helpers';

function escribir(label, valor) {
    fireEvent.change(screen.getByLabelText(label), { target: { value: valor } });
}

describe('Página Login', () => {
    it('muestra los errores de validación al enviar vacío', () => {
        renderConApp(<Login />, { ruta: '/login' });
        fireEvent.click(screen.getByRole('button', { name: 'Ingresar' }));
        expect(screen.getByText('El correo es requerido.')).toBeTruthy();
        expect(screen.getByText('La contraseña es requerida.')).toBeTruthy();
    });

    it('muestra "Correo o contraseña incorrectos" (401 del backend) si las credenciales no existen', async () => {
        renderConApp(<Login />, { ruta: '/login' });
        escribir('Correo', 'admin@duoc.cl');
        escribir('Contraseña', 'mala123');
        fireEvent.click(screen.getByRole('button', { name: 'Ingresar' }));
        expect((await screen.findByTestId('error-login')).textContent).toBe('Correo o contraseña incorrectos.');
    });

    it('el Administrador es redirigido al panel', async () => {
        renderConApp(<Login />, { ruta: '/login', path: '/login' });
        escribir('Correo', 'admin@duoc.cl');
        escribir('Contraseña', 'admin1');
        fireEvent.click(screen.getByRole('button', { name: 'Ingresar' }));
        await waitFor(() => expect(screen.getByTestId('ubicacion').textContent).toBe('/admin'));
    });

    it('el Cliente es redirigido a la tienda y quedan guardados los tokens', async () => {
        renderConApp(<Login />, { ruta: '/login', path: '/login' });
        escribir('Correo', 'cliente@gmail.com');
        escribir('Contraseña', 'cliente1');
        fireEvent.click(screen.getByRole('button', { name: 'Ingresar' }));
        await waitFor(() => expect(screen.getByTestId('ubicacion').textContent).toBe('/'));
        const sesion = JSON.parse(localStorage.getItem('da_sesion'));
        expect(sesion.usuario.correo).toBe('cliente@gmail.com');
        expect(sesion.accessToken).toBeTruthy();
        expect(sesion.usuario.clave).toBeUndefined();
    });
});
