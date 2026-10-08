// Componente reutilizable de formulario: props, evento onChange y error condicional
import React, { useState } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import CampoFormulario from '../src/components/comunes/CampoFormulario';
import EstadoBadge from '../src/components/comunes/EstadoBadge';
import StatCard from '../src/components/admin/StatCard';

// Componente de prueba que guarda el valor en su estado
function FormularioPrueba() {
    const [valor, setValor] = useState('');
    return (
        <>
            <CampoFormulario id="nombre" label="Nombre" requerido valor={valor} onChange={setValor} />
            <p data-testid="eco">{valor}</p>
        </>
    );
}

describe('CampoFormulario', () => {
    it('asocia el label al input y marca el campo requerido', () => {
        render(<CampoFormulario id="correo" label="Correo" requerido valor="" onChange={() => {}} />);
        expect(screen.getByLabelText(/Correo/)).toBeTruthy();
        expect(screen.getByText('*')).toBeTruthy();
    });

    it('actualiza el estado del padre cuando el usuario escribe', () => {
        render(<FormularioPrueba />);
        fireEvent.change(screen.getByLabelText(/Nombre/), { target: { value: 'Luciano' } });
        expect(screen.getByTestId('eco').textContent).toBe('Luciano');
        expect(screen.getByLabelText(/Nombre/).value).toBe('Luciano');
    });

    it('muestra el mensaje de error solo cuando recibe la prop error', () => {
        const { rerender } = render(<CampoFormulario id="clave" label="Clave" valor="" onChange={() => {}} />);
        expect(screen.queryByText('Campo inválido')).toBeNull();
        rerender(<CampoFormulario id="clave" label="Clave" valor="" onChange={() => {}} error="Campo inválido" />);
        expect(screen.getByText('Campo inválido')).toBeTruthy();
        expect(screen.getByLabelText('Clave').classList).toContain('is-invalid');
    });
});

describe('Componentes de presentación', () => {
    it('EstadoBadge usa verde para Pagada y rojo para Rechazada', () => {
        const { rerender, container } = render(<EstadoBadge estado="Pagada" />);
        expect(container.querySelector('.badge').classList).toContain('bg-success');
        rerender(<EstadoBadge estado="Rechazada" />);
        expect(container.querySelector('.badge').classList).toContain('bg-danger');
    });

    it('StatCard muestra título, valor y detalle recibidos por props', () => {
        render(<StatCard titulo="Compras" valor={5} detalle="Ventas: $100" variante="success" />);
        expect(screen.getByText('Compras')).toBeTruthy();
        expect(screen.getByTestId('stat-valor').textContent).toBe('5');
        expect(screen.getByText('Ventas: $100')).toBeTruthy();
    });
});
