// Utilidad para renderizar componentes con Router + sesión + carrito
import React from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import { CartProvider } from '../context/CartContext';
import App from '../App';

// Activa el comportamiento de React Router v7 (evita advertencias en la consola)
export const FUTURO = { v7_startTransition: true, v7_relativeSplatPath: true };

// Muestra la ruta actual para comprobar redirecciones
export function UbicacionActual() {
    const location = useLocation();
    return <div data-testid="ubicacion">{location.pathname}</div>;
}

export function renderConApp(ui, { ruta = '/', usuario = null, path = '*' } = {}) {
    return render(
        <MemoryRouter initialEntries={[ruta]} future={FUTURO}>
            <AuthProvider usuarioInicial={usuario}>
                <CartProvider>
                    <Routes>
                        <Route path={path} element={ui} />
                        {path !== '*' && <Route path="*" element={null} />}
                    </Routes>
                    <UbicacionActual />
                </CartProvider>
            </AuthProvider>
        </MemoryRouter>
    );
}

export const productoDemo = {
    codigo: 'GE001', nombre: 'Guitarra Eléctrica Stratocaster', marca: 'Squier', categoria: 'Guitarras Eléctricas',
    precio: 219990, stock: 3, stockCritico: 1, descripcion: 'Guitarra de prueba', imagen: 'guitarra.png'
};

export const clienteDemo = {
    run: '187654327', nombre: 'Cliente', apellidos: 'Demo', correo: 'cliente@gmail.com', clave: 'cliente1',
    telefono: '', region: 'Región de Valparaíso', comuna: 'Viña del Mar', direccion: 'Av. Siempre Viva 123', tipoUsuario: 'Cliente'
};

// Renderiza la aplicación completa (todas las rutas de App.jsx) partiendo en "ruta"
export function renderApp(ruta = '/', usuario = null) {
    return render(
        <MemoryRouter initialEntries={[ruta]} future={FUTURO}>
            <AuthProvider usuarioInicial={usuario}>
                <CartProvider>
                    <App />
                    <UbicacionActual />
                </CartProvider>
            </AuthProvider>
        </MemoryRouter>
    );
}

export const adminDemo = { ...clienteDemo, run: '156782343', nombre: 'Administrador', apellidos: 'Sistema', correo: 'admin@duoc.cl', clave: 'admin1', tipoUsuario: 'Administrador' };
export const vendedorDemo = { ...clienteDemo, run: '172345670', nombre: 'Vendedor', apellidos: 'Tienda', correo: 'vendedor@duoc.cl', clave: 'venta1', tipoUsuario: 'Vendedor' };
