// Formulario de contacto: validación y limpieza del estado tras enviar
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Contacto from '../src/pages/tienda/Contacto';

describe('Formulario de Contacto', () => {
    it('muestra errores si se envía vacío y no muestra el aviso de éxito', () => {
        render(<Contacto />);
        fireEvent.click(screen.getByRole('button', { name: 'Enviar mensaje' }));
        expect(screen.getByText('El nombre es requerido.')).toBeTruthy();
        expect(screen.getByText('El comentario es requerido.')).toBeTruthy();
        expect(screen.queryByText(/Tu mensaje fue enviado/)).toBeNull();
    });

    it('rechaza correos de dominios no permitidos', () => {
        render(<Contacto />);
        fireEvent.change(screen.getByLabelText(/Correo/), { target: { value: 'ana@yahoo.com' } });
        fireEvent.click(screen.getByRole('button', { name: 'Enviar mensaje' }));
        expect(screen.getByText(/Solo se aceptan correos/)).toBeTruthy();
    });

    it('con datos válidos muestra el éxito y limpia los campos', () => {
        render(<Contacto />);
        fireEvent.change(screen.getByLabelText(/Nombre completo/), { target: { value: 'Ana Soto' } });
        fireEvent.change(screen.getByLabelText(/Comentario/), { target: { value: '¿Tienen guitarras zurdas?' } });
        fireEvent.click(screen.getByRole('button', { name: 'Enviar mensaje' }));
        expect(screen.getByText(/Tu mensaje fue enviado/)).toBeTruthy();
        expect(screen.getByLabelText(/Nombre completo/).value).toBe('');
    });
});
