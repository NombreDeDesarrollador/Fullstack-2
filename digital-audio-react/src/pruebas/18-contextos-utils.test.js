// Ramas que el informe de cobertura marcaba en rojo: contextos usados fuera de su proveedor,
// sesión leída desde localStorage, formatos con valores inválidos, componentes con props opcionales
// y funciones de categorías.
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { CartProvider, useCarrito } from '../context/CartContext';
import { formatoCLP, formatoFecha, formatoFechaLarga } from '../utils/formato';
import BarrasReporte from '../components/admin/BarrasReporte';
import StatCard from '../components/admin/StatCard';
import EstadoEnvioBadge from '../components/comunes/EstadoEnvioBadge';
import { categoriaPorSlug, crearCategoria, obtenerCategorias } from '../services/productosService';
import { guardar, leer, eliminar } from '../services/storage';
import { validarProducto } from '../utils/validaciones';
import { productoDemo, adminDemo } from './helpers';

// Componentes de prueba que usan los hooks y muestran su estado
function PanelSesion() {
    const { usuario, login, logout, actualizarPerfil, esPersonal } = useAuth();
    return (
        <div>
            <span data-testid="usuario">{usuario ? usuario.nombre : 'invitado'}</span>
            <span data-testid="personal">{String(esPersonal)}</span>
            <button onClick={() => login('admin@duoc.cl', 'admin1')}>entrar</button>
            <button onClick={() => login('admin@duoc.cl', 'mala')}>clave mala</button>
            <button onClick={() => actualizarPerfil({ nombre: 'Jefa' })}>renombrar</button>
            <button onClick={logout}>salir</button>
        </div>
    );
}

function PanelCarrito() {
    const { cantidad, total, agregar, eliminar: quitar, vaciar } = useCarrito();
    const [resultado, setResultado] = React.useState('');
    return (
        <div>
            <span data-testid="cantidad">{cantidad}</span>
            <span data-testid="total">{total}</span>
            <span data-testid="resultado">{resultado}</span>
            <button onClick={() => setResultado(String(agregar(productoDemo)))}>agregar</button>
            <button onClick={() => quitar(productoDemo.codigo)}>quitar</button>
            <button onClick={vaciar}>vaciar</button>
        </div>
    );
}

describe('Contextos, utilidades y casos de borde', () => {
    beforeEach(() => localStorage.clear());

    describe('AuthContext', () => {
        it('useAuth fuera de <AuthProvider> lanza un error claro', () => {
            jest.spyOn(console, 'error').mockImplementation(() => {});
            expect(() => render(<PanelSesion />)).toThrow('useAuth debe usarse dentro de <AuthProvider>');
        });

        it('recupera la sesión guardada en localStorage al iniciar', () => {
            localStorage.setItem('da_sesion', JSON.stringify(adminDemo));
            render(<AuthProvider><PanelSesion /></AuthProvider>);
            expect(screen.getByTestId('usuario').textContent).toBe('Administrador');
            expect(screen.getByTestId('personal').textContent).toBe('true');
        });

        it('login correcto guarda la sesión, actualizarPerfil la modifica y logout la elimina', () => {
            render(<AuthProvider><PanelSesion /></AuthProvider>);
            expect(screen.getByTestId('usuario').textContent).toBe('invitado');

            fireEvent.click(screen.getByText('clave mala'));
            expect(screen.getByTestId('usuario').textContent).toBe('invitado');

            fireEvent.click(screen.getByText('entrar'));
            expect(screen.getByTestId('usuario').textContent).toBe('Administrador');

            fireEvent.click(screen.getByText('renombrar'));
            expect(screen.getByTestId('usuario').textContent).toBe('Jefa');
            expect(JSON.parse(localStorage.getItem('da_sesion')).nombre).toBe('Jefa');

            fireEvent.click(screen.getByText('salir'));
            expect(screen.getByTestId('usuario').textContent).toBe('invitado');
            expect(localStorage.getItem('da_sesion')).toBeNull();
        });
    });

    describe('CartContext', () => {
        it('useCarrito fuera de <CartProvider> lanza un error claro', () => {
            jest.spyOn(console, 'error').mockImplementation(() => {});
            expect(() => render(<PanelCarrito />)).toThrow('useCarrito debe usarse dentro de <CartProvider>');
        });

        it('agregar respeta el stock, aplica el precio de oferta y persiste en localStorage', () => {
            render(<CartProvider><PanelCarrito /></CartProvider>);
            for (let i = 0; i < productoDemo.stock; i++) fireEvent.click(screen.getByText('agregar'));
            expect(screen.getByTestId('resultado').textContent).toBe('true');
            fireEvent.click(screen.getByText('agregar')); // supera el stock (3)
            expect(screen.getByTestId('resultado').textContent).toBe('false');
            expect(screen.getByTestId('cantidad').textContent).toBe('3');
            // GE001 tiene 20% de descuento: 219.990 -> 175.992
            expect(screen.getByTestId('total').textContent).toBe(String(175992 * 3));
            expect(JSON.parse(localStorage.getItem('da_carrito'))[0].cantidad).toBe(3);

            fireEvent.click(screen.getByText('quitar'));
            expect(screen.getByTestId('cantidad').textContent).toBe('0');
            fireEvent.click(screen.getByText('agregar'));
            fireEvent.click(screen.getByText('vaciar'));
            expect(screen.getByTestId('cantidad').textContent).toBe('0');
        });
    });

    describe('formato.js', () => {
        it('formatoCLP usa separador de miles y trata valores inválidos como 0', () => {
            expect(formatoCLP(1234567)).toBe('$1.234.567');
            expect(formatoCLP('no es número')).toBe('$0');
            expect(formatoCLP(undefined)).toBe('$0');
        });

        it('formatoFecha devuelve "-" con una fecha inválida', () => {
            expect(formatoFecha('fecha-mala')).toBe('-');
            expect(formatoFecha('2026-09-01T12:30:00')).toContain('01-09-2026');
        });

        it('formatoFechaLarga acepta fechas cortas (AAAA-MM-DD) y fechas con hora', () => {
            expect(formatoFechaLarga('2026-09-18')).toContain('septiembre');
            expect(formatoFechaLarga('2026-10-01T10:00:00')).toContain('octubre');
        });
    });

    describe('Componentes con props opcionales', () => {
        it('BarrasReporte sin datos muestra "Sin datos." y con datos usa el formato recibido', () => {
            const { rerender } = render(<BarrasReporte datos={[]} />);
            expect(screen.getByText('Sin datos.')).toBeTruthy();
            rerender(<BarrasReporte datos={[{ etiqueta: 'Guitarras', valor: 10 }, { etiqueta: 'Bajos', valor: 5 }]} formato={v => `${v} u.`} />);
            expect(screen.getByText('10 u.')).toBeTruthy();
            expect(screen.getAllByRole('progressbar').length).toBe(2);
        });

        it('BarrasReporte sin función de formato muestra el valor tal cual', () => {
            render(<BarrasReporte datos={[{ etiqueta: 'Pedales', valor: 7 }]} />);
            expect(screen.getByText('7')).toBeTruthy();
        });

        it('StatCard "warning" usa texto oscuro y funciona sin icono ni detalle', () => {
            const { container } = render(<StatCard titulo="Ticket" valor="$10" variante="warning" />);
            expect(container.querySelector('.text-dark')).toBeTruthy();
            expect(container.querySelector('i.bi')).toBeNull();
            expect(container.querySelector('small')).toBeNull();
        });

        it('StatCard usa "primary" por defecto', () => {
            const { container } = render(<StatCard titulo="Ventas" valor={5} />);
            expect(container.querySelector('.bg-primary')).toBeTruthy();
        });

        it('EstadoEnvioBadge sin estado (orden rechazada) muestra un guion y con un estado desconocido usa el estilo base', () => {
            const { container, rerender } = render(<EstadoEnvioBadge />);
            expect(container.textContent).toBe('—');
            rerender(<EstadoEnvioBadge estado="Extraviado" />);
            expect(screen.getByTestId('estado-envio').className).toContain('bg-secondary');
        });
    });

    describe('validarProducto (casos límite)', () => {
        const base = { codigo: 'AB1', nombre: 'Producto', categoria: 'Accesorios', precio: 1000, stock: 2 };

        it('rechaza un stock crítico negativo o decimal, y acepta 0 o vacío', () => {
            expect(validarProducto({ ...base, stockCritico: -1 }).stockCritico).toBe('Debe ser un entero mayor o igual a 0.');
            expect(validarProducto({ ...base, stockCritico: 1.5 }).stockCritico).toBe('Debe ser un entero mayor o igual a 0.');
            expect(validarProducto({ ...base, stockCritico: 0 }).stockCritico).toBeUndefined();
            expect(validarProducto({ ...base, stockCritico: '' }).stockCritico).toBeUndefined();
        });

        it('valida largos de código, nombre y descripción, y precio o stock negativos', () => {
            const e = validarProducto({ ...base, codigo: 'AB', nombre: 'x'.repeat(101), descripcion: 'x'.repeat(501), precio: -5, stock: 1.2 });
            expect(e.codigo).toBe('Mínimo 3 caracteres.');
            expect(e.nombre).toBe('Máximo 100 caracteres.');
            expect(e.descripcion).toBe('Máximo 500 caracteres.');
            expect(e.precio).toBe('El precio no puede ser negativo.');
            expect(e.stock).toBe('Debe ser un entero mayor o igual a 0.');
        });
    });

    describe('Categorías y storage', () => {
        it('categoriaPorSlug encuentra la categoría o devuelve null', () => {
            expect(categoriaPorSlug('microfonos')).toBe('Micrófonos');
            expect(categoriaPorSlug('no-existe')).toBeNull();
        });

        it('crearCategoria agrega una nueva y rechaza duplicados sin importar mayúsculas', () => {
            crearCategoria('Vinilos');
            expect(obtenerCategorias()).toContain('Vinilos');
            expect(() => crearCategoria('VINILOS')).toThrow('Ya existe una categoría con ese nombre.');
        });

        it('eliminar() borra la clave y no falla si localStorage está bloqueado', () => {
            guardar('prueba', { a: 1 });
            eliminar('prueba');
            expect(leer('prueba', 'vacío')).toBe('vacío');
            jest.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => { throw new Error('bloqueado'); });
            expect(() => eliminar('prueba')).not.toThrow();
        });
    });
});
