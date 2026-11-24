// Generado a partir de src/pruebas/20-integracion-api.test.js (misma prueba, sintaxis Jasmine para Karma)
// EV3: integración con el backend (sesión JWT, restricciones por rol y nuevas acciones del panel)
import React from 'react';
import { screen, fireEvent, within} from '@testing-library/react';
import { waitFor } from './helpers';
import Boleta from '../src/pages/admin/Boleta';
import Usuarios from '../src/pages/admin/Usuarios';
import CompraResultado from '../src/pages/tienda/CompraResultado';
import { renderConApp, renderApp, adminDemo, vendedorDemo, clienteDemo } from './helpers';
import { datosServidor, prepararDatos } from '../src/pruebas/servidorFalso';
import { limpiar } from '../src/services/cache';

describe('Integración frontend - backend (EV3)', () => {
    describe('Sesión persistente y rutas protegidas', () => {
        it('al recargar con sesión de Administrador valida el token y entra al panel', async () => {
            renderApp('/admin', adminDemo);
            await waitFor(() => expect(fetch.calls.allArgs().some(([url]) => url.endsWith('/usuarios'))).toBe(true));
            expect(screen.getByTestId('ubicacion').textContent).toBe('/admin');
        });

        it('sin sesión, el checkout redirige al login y recuerda a dónde quería ir', async () => {
            renderApp('/checkout');
            await waitFor(() => expect(screen.getByTestId('ubicacion').textContent).toBe('/login'));
            expect(screen.getByText('Inicia sesión para continuar.')).toBeTruthy();
        });

        it('un Vendedor que intenta abrir /admin/usuarios vuelve al dashboard', () => {
            renderApp('/admin/usuarios', vendedorDemo);
            expect(screen.getByTestId('ubicacion').textContent).toBe('/admin');
        });

        it('el Vendedor no pide la lista de usuarios al backend (no tiene permiso)', async () => {
            renderApp('/admin', vendedorDemo);
            await waitFor(() => expect(fetch.calls.allArgs().some(([url]) => url.endsWith('/pedidos'))).toBe(true));
            expect(fetch.calls.allArgs().some(([url]) => url.endsWith('/api/v1/usuarios'))).toBe(false);
        });

        it('si el backend no responde muestra el aviso de conexión', async () => {
            window.fetch = jasmine.createSpy().and.callFake(() => Promise.reject(new TypeError('Failed to fetch')));
            renderApp('/');
            expect(await screen.findByTestId('aviso-conexion')).toBeTruthy();
        });
    });

    describe('Acciones nuevas del panel', () => {
        it('el Administrador anula un pedido pagado desde la boleta (DELETE /pedidos/{numero})', async () => {
            renderConApp(<Boleta />, { usuario: adminDemo, ruta: '/admin/ordenes/20261005', path: '/admin/ordenes/:numero' });
            fireEvent.click(screen.getByRole('button', { name: /Anular/ }));
            const modal = await screen.findByRole('dialog');
            expect(within(modal).getByText(/vuelven al stock/)).toBeTruthy();
            fireEvent.click(within(modal).getByRole('button', { name: 'Anular pedido' }));
            await waitFor(() => expect(screen.getByTestId('ubicacion').textContent).toBe('/admin/ordenes'));
            expect(datosServidor().ordenes.some(o => o.numero === 20261005)).toBe(false);
        });

        it('el Vendedor no ve el botón Anular y un pedido entregado no se puede anular', () => {
            const { unmount } = renderConApp(<Boleta />, { usuario: vendedorDemo, ruta: '/admin/ordenes/20261005', path: '/admin/ordenes/:numero' });
            expect(screen.queryByRole('button', { name: /Anular/ })).toBeNull();
            // El Vendedor ve el estado de envío como etiqueta, sin el selector para cambiarlo
            expect(screen.queryByLabelText('Estado de envío de la orden 20261005')).toBeNull();
            expect(screen.getAllByText('En preparación').length).toBeGreaterThan(0);
            unmount();
            renderConApp(<Boleta />, { usuario: adminDemo, ruta: '/admin/ordenes/20260901', path: '/admin/ordenes/:numero' });
            expect(screen.queryByRole('button', { name: /Anular/ })).toBeNull();
        });

        it('si el backend rechaza la anulación muestra el mensaje', async () => {
            prepararDatos(db => { db.ordenes.find(o => o.numero === 20261005).estadoEnvio = 'Despachado'; });
            renderConApp(<Boleta />, { usuario: adminDemo, ruta: '/admin/ordenes/20261005', path: '/admin/ordenes/:numero' });
            datosServidor().ordenes.find(o => o.numero === 20261005).estadoEnvio = 'Entregado'; // cambió en el servidor
            fireEvent.click(screen.getByRole('button', { name: /Anular/ }));
            fireEvent.click(within(await screen.findByRole('dialog')).getByRole('button', { name: 'Anular pedido' }));
            expect(await screen.findByText('No se puede eliminar un pedido que ya fue entregado.')).toBeTruthy();
        });

        it('mientras no llegan las órdenes la boleta muestra "Cargando..."', () => {
            limpiar(['ordenes']);
            renderConApp(<Boleta />, { usuario: adminDemo, ruta: '/admin/ordenes/20261005', path: '/admin/ordenes/:numero' });
            expect(screen.getByRole('status').textContent).toContain('Cargando');
        });

        it('el Administrador desactiva y reactiva a un usuario (PATCH /usuarios/{run}/estado)', async () => {
            renderConApp(<Usuarios />, { usuario: adminDemo });
            fireEvent.click(screen.getByLabelText('Desactivar a Cliente'));
            await waitFor(() => expect(within(screen.getByText('cliente@gmail.com').closest('tr')).getByText('Inactivo')).toBeTruthy());
            expect(datosServidor().usuarios.find(u => u.run === '187654327').activo).toBe(false);
            fireEvent.click(screen.getByLabelText('Activar a Cliente'));
            await waitFor(() => expect(within(screen.getByText('cliente@gmail.com').closest('tr')).getByText('Activo')).toBeTruthy());
        });

        it('si el backend rechaza eliminar un usuario muestra el error', async () => {
            renderConApp(<Usuarios />, { usuario: adminDemo });
            datosServidor().usuarios = datosServidor().usuarios.filter(u => u.run !== '172345670'); // ya no existe en el servidor
            fireEvent.click(within(screen.getByText('vendedor@duoc.cl').closest('tr')).getByTitle('Eliminar'));
            fireEvent.click(within(await screen.findByRole('dialog')).getByRole('button', { name: 'Eliminar' }));
            expect(await screen.findByText('Usuario no encontrado.')).toBeTruthy();
        });
    });

    describe('Resultado de compra después de recargar la página', () => {
        it('si el pedido no está en memoria lo pide a ms-pedidos (GET /pedidos/{numero})', async () => {
            limpiar(['ordenes']);
            renderConApp(<CompraResultado exito />, { usuario: clienteDemo, ruta: '/compra/exito/20260901', path: '/compra/exito/:numero' });
            expect(screen.getByRole('status').textContent).toContain('Buscando tu pedido');
            expect(await screen.findByText(/Se ha realizado la compra/)).toBeTruthy();
            expect(screen.getByText(/Estado del pedido/)).toBeTruthy();
        });

        it('un cliente no puede ver el pedido de otra persona (403)', async () => {
            limpiar(['ordenes']);
            renderConApp(<CompraResultado exito />, { usuario: clienteDemo, ruta: '/compra/exito/20260912', path: '/compra/exito/:numero' });
            expect(await screen.findByText('Orden no encontrada')).toBeTruthy();
        });
    });
});
