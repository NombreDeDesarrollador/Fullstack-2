// Panel administrador: lógica de reportes/filtros y permisos por rol en los componentes
import React from 'react';
import { screen, fireEvent, within } from '@testing-library/react';
import { calcularReporte } from '../src/pages/admin/Reportes';
import { filtrarOrdenes } from '../src/pages/admin/Ordenes';
import { ordenarProductos } from '../src/pages/tienda/Catalogo';
import { opcionesPorRol } from '../src/components/admin/AdminLayout';
import Productos from '../src/pages/admin/Productos';
import { ordenesIniciales } from '../src/data/ordenes';
import { productosIniciales } from '../src/data/productos';
import { renderConApp, clienteDemo } from './helpers';

const ordenes = ordenesIniciales.map(o => ({ ...o, total: o.items.reduce((s, i) => s + i.precio * i.cantidad, 0) }));
const admin = { ...clienteDemo, run: '444444444', nombre: 'Administrador', tipoUsuario: 'Administrador' };
const vendedor = { ...clienteDemo, run: '222222222', nombre: 'Vendedor', tipoUsuario: 'Vendedor' };

describe('Panel administrador', () => {
    beforeEach(() => localStorage.clear());

    it('calcularReporte solo considera órdenes pagadas', () => {
        const r = calcularReporte(ordenes, productosIniciales);
        expect(r.cantidadPagadas).toBe(4);
        expect(r.ventas).toBe(ordenes.filter(o => o.estado === 'Pagada').reduce((s, o) => s + o.total, 0));
        expect(r.topProductos[0].nombre).toBe('Cable Instrumento 3m');
        expect(r.porMes.map(m => m.etiqueta)).toEqual(['2026-09', '2026-10']);
    });

    it('filtrarOrdenes busca por cliente y por estado', () => {
        expect(filtrarOrdenes(ordenes, 'valentina', '').length).toBe(1);
        expect(filtrarOrdenes(ordenes, '', 'Rechazada')[0].numero).toBe(20260920);
        expect(filtrarOrdenes(ordenes, '2026100', 'Pagada').length).toBe(2);
    });

    it('ordenarProductos ordena por precio final sin modificar la lista original', () => {
        const lista = productosIniciales.slice(0, 5);
        const asc = ordenarProductos(lista, 'precio-asc');
        expect(asc[0].precio).toBeLessThanOrEqual(asc[4].precio);
        expect(lista[0].codigo).toBe('GA001');
    });

    it('el menú del Vendedor no incluye Usuarios, Categorías ni Reportes', () => {
        const textos = opcionesPorRol('Vendedor').map(o => o.texto);
        expect(textos).toEqual(['Dashboard', 'Órdenes', 'Productos', 'Perfil']);
        expect(opcionesPorRol('Administrador').length).toBe(7);
    });

    it('el Vendedor ve los productos pero no los botones de crear/editar', () => {
        renderConApp(<Productos />, { usuario: vendedor });
        expect(screen.getByText('Guitarra Acústica Folk')).toBeTruthy();
        expect(screen.queryByText('Nuevo producto')).toBeNull();
        expect(screen.queryAllByTitle('Editar').length).toBe(0);
    });

    it('el Administrador puede eliminar un producto confirmando en el modal', async () => {
        renderConApp(<Productos />, { usuario: admin });
        fireEvent.change(screen.getByLabelText('Buscar producto'), { target: { value: 'Folk' } });
        expect(screen.getAllByTitle('Eliminar').length).toBe(1);
        fireEvent.click(screen.getByTitle('Eliminar'));
        const modal = await screen.findByRole('dialog');
        fireEvent.click(within(modal).getByRole('button', { name: 'Eliminar' }));
        expect(screen.queryByText('Guitarra Acústica Folk')).toBeNull();
    });
});
