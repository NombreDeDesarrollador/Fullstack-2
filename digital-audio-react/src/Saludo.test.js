// Pruebas del ejemplo de la guía con Jest + React Testing Library.
// Con solo la primera prueba, Saludo.js queda con 50% de ramas cubiertas (falta el caso "sin nombre");
// la segunda prueba cubre esa rama y lleva el archivo al 100%.
import { render, screen } from '@testing-library/react';
import Saludo from './Saludo';

test('muestra saludo con nombre', () => {
    render(<Saludo nombre="Pedro" />);
    expect(screen.getByText('Hola, Pedro')).toBeTruthy();
});

test('muestra saludo de invitado cuando no recibe nombre', () => {
    render(<Saludo />);
    expect(screen.getByText('Bienvenido, invitado')).toBeTruthy();
});
