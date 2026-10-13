// Vistas públicas que no tenían pruebas: Inicio, Ofertas, Categorías, Detalle de producto,
// Blog (listado y artículo) y Mi cuenta del Cliente.
import { screen, fireEvent } from '@testing-library/react';
import Home from '../pages/tienda/Home';
import Ofertas from '../pages/tienda/Ofertas';
import Categorias from '../pages/tienda/Categorias';
import ProductoDetalle from '../pages/tienda/ProductoDetalle';
import Blogs from '../pages/tienda/Blogs';
import BlogDetalle from '../pages/tienda/BlogDetalle';
import MiCuenta from '../pages/tienda/MiCuenta';
import { productosEnOferta, precioFinal, actualizarProducto } from '../services/productosService';
import { renderConApp, clienteDemo } from './helpers';

// Nombres de los productos mostrados en una grilla, en orden
const nombresEnGrilla = () => screen.getAllByRole('heading', { level: 3 }).filter(h => h.querySelector('a')).map(h => h.textContent);
const carrito = () => JSON.parse(localStorage.getItem('da_carrito'));

describe('Vistas de la tienda', () => {
    beforeEach(() => localStorage.clear());

    describe('Inicio (Home)', () => {
        it('muestra el carrusel, las categorías y 4 ofertas destacadas ordenadas por descuento', () => {
            renderConApp(<Home />);
            expect(screen.getByText('Encuentra tu sonido')).toBeTruthy();
            expect(screen.getByText('¿Por qué Digital Audio?')).toBeTruthy();
            expect(nombresEnGrilla().length).toBe(4);
            // PE002 tiene el mayor descuento (30%)
            expect(nombresEnGrilla()[0]).toBe(productosEnOferta().find(p => p.codigo === 'PE002').nombre);
        });

        it('el botón "Añadir al carrito" de una oferta la guarda en el carrito', () => {
            renderConApp(<Home />);
            fireEvent.click(screen.getAllByRole('button', { name: /Añadir al carrito/ })[0]);
            expect(carrito()[0].codigo).toBe('PE002');
        });
    });

    describe('Ofertas', () => {
        it('lista todos los productos en oferta y el mayor descuento en el banner', () => {
            renderConApp(<Ofertas />);
            expect(screen.getByText(`${productosEnOferta().length} productos en oferta`)).toBeTruthy();
            expect(screen.getByText('30%')).toBeTruthy();
        });

        it('cambia el orden según el selector (menor y mayor precio)', () => {
            renderConApp(<Ofertas />);
            const porPrecio = [...productosEnOferta()].sort((a, b) => precioFinal(a) - precioFinal(b));

            fireEvent.change(screen.getByLabelText('Ordenar por'), { target: { value: 'precio-asc' } });
            expect(nombresEnGrilla()[0]).toBe(porPrecio[0].nombre);

            fireEvent.change(screen.getByLabelText('Ordenar por'), { target: { value: 'precio-desc' } });
            expect(nombresEnGrilla()[0]).toBe(porPrecio[porPrecio.length - 1].nombre);
        });
    });

    describe('Categorías', () => {
        it('muestra los productos de la categoría indicada en la URL', () => {
            renderConApp(<Categorias />, { ruta: '/categorias/microfonos', path: '/categorias/:slug' });
            expect(screen.getByRole('heading', { level: 2, name: 'Micrófonos' })).toBeTruthy();
            expect(document.querySelector('[aria-current="true"]').textContent).toContain('Micrófonos');
        });

        it('si el slug no existe, muestra la primera categoría', () => {
            renderConApp(<Categorias />, { ruta: '/categorias/no-existe', path: '/categorias/:slug' });
            expect(screen.getByRole('heading', { level: 2, name: 'Guitarras Acústicas' })).toBeTruthy();
        });
    });

    describe('Detalle de producto', () => {
        const abrir = (codigo) => renderConApp(<ProductoDetalle />, { ruta: `/producto/${codigo}`, path: '/producto/:codigo' });

        it('muestra los datos, el estado de stock y productos relacionados', () => {
            abrir('GE001');
            expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('Guitarra Eléctrica Stratocaster');
            expect(screen.getByText('En stock')).toBeTruthy();
            expect(screen.getByText('También te puede interesar')).toBeTruthy();
        });

        it('al añadir muestra un mensaje de éxito y al superar el stock un aviso', () => {
            actualizarProducto('GE001', { stock: 1, stockCritico: 0 });
            abrir('GE001');
            const boton = screen.getAllByRole('button', { name: /Añadir al carrito/ })[0]; // el primero es el del producto
            fireEvent.click(boton);
            expect(screen.getByText(/fue añadido al carrito/)).toBeTruthy();
            fireEvent.click(boton);
            expect(screen.getByText('No hay más unidades disponibles de este producto.')).toBeTruthy();
            // El aviso se puede cerrar
            fireEvent.click(screen.getByLabelText('Close alert'));
            expect(screen.queryByText('No hay más unidades disponibles de este producto.')).toBeNull();
        });

        it('indica "Sin stock" (botón deshabilitado) y "Últimas unidades" según el stock', () => {
            const { unmount } = abrir('GA005'); // stock 0
            expect(screen.getAllByText('Sin stock').length).toBeGreaterThan(0);
            expect(screen.getAllByRole('button', { name: /Añadir al carrito/ })[0].disabled).toBe(true);
            unmount();
            actualizarProducto('GE001', { stock: 1, stockCritico: 2 });
            abrir('GE001');
            expect(screen.getByText('¡Últimas unidades! (1)')).toBeTruthy();
        });

        it('si el código no existe muestra "Producto no encontrado"', () => {
            abrir('XX999');
            expect(screen.getByText('Producto no encontrado')).toBeTruthy();
        });
    });

    describe('Blog', () => {
        it('el listado muestra una tarjeta por artículo', () => {
            renderConApp(<Blogs />);
            expect(screen.getAllByRole('link', { name: /Leer artículo/ }).length).toBe(2);
        });

        it('el artículo muestra subtítulos, listas, productos recomendados y "Sigue leyendo"', () => {
            renderConApp(<BlogDetalle />, { ruta: '/blogs/1', path: '/blogs/:id' });
            expect(screen.getByText('Guitarra clásica: ideal para comenzar')).toBeTruthy();
            expect(screen.getByText('Define el estilo de música que quieres tocar.')).toBeTruthy();
            expect(screen.getByText('Productos recomendados')).toBeTruthy();
            expect(screen.getByText('Sigue leyendo')).toBeTruthy();
        });

        it('un id inexistente muestra "Artículo no encontrado"', () => {
            renderConApp(<BlogDetalle />, { ruta: '/blogs/99', path: '/blogs/:id' });
            expect(screen.getByText('Artículo no encontrado')).toBeTruthy();
        });
    });

    describe('Mi cuenta (Cliente)', () => {
        const abrir = (usuario = clienteDemo) => renderConApp(<MiCuenta />, { usuario, ruta: '/mi-cuenta', path: '/mi-cuenta' });

        it('muestra los datos del cliente y sus compras con estado de pago y envío', () => {
            abrir();
            expect(screen.getByText('Hola, Cliente')).toBeTruthy();
            expect(screen.getByText('Orden #20260901')).toBeTruthy();
            expect(screen.getByText('Orden #20261002')).toBeTruthy();
            expect(screen.getByText('Despachado')).toBeTruthy();
            expect(screen.getByText(/2 pagadas/)).toBeTruthy();
        });

        it('un cliente sin compras ve el enlace al catálogo', () => {
            abrir({ ...clienteDemo, correo: 'nuevo@gmail.com' });
            expect(screen.getByText(/Aún no tienes compras/)).toBeTruthy();
        });

        it('valida los datos al editar y no guarda si hay errores', () => {
            abrir();
            fireEvent.click(screen.getByRole('button', { name: 'Editar' }));
            fireEvent.change(screen.getByLabelText('Nombre'), { target: { value: '' } });
            fireEvent.change(screen.getByLabelText(/^Teléfono/), { target: { value: 'abc' } });
            fireEvent.change(screen.getByLabelText('Dirección'), { target: { value: '' } });
            fireEvent.change(screen.getByLabelText('Apellidos'), { target: { value: '' } });
            fireEvent.click(screen.getByRole('button', { name: 'Guardar' }));
            expect(screen.getByText('El nombre es requerido.')).toBeTruthy();
            expect(screen.getByText('Los apellidos son requeridos.')).toBeTruthy();
            expect(screen.getByText('Teléfono no válido.')).toBeTruthy();
            expect(screen.getByText('La dirección es requerida.')).toBeTruthy();
            // Cancelar vuelve a la vista de solo lectura
            fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
            expect(screen.getByRole('button', { name: 'Editar' })).toBeTruthy();
        });

        it('guarda los cambios del perfil y muestra el aviso', () => {
            abrir();
            fireEvent.click(screen.getByRole('button', { name: 'Editar' }));
            fireEvent.change(screen.getByLabelText('Nombre'), { target: { value: 'Clienta' } });
            fireEvent.change(screen.getByLabelText(/^Teléfono/), { target: { value: '+56 9 8765 4321' } });
            fireEvent.click(screen.getByRole('button', { name: 'Guardar' }));
            expect(screen.getByText('Tus datos se guardaron correctamente.')).toBeTruthy();
            expect(screen.getByText('Hola, Clienta')).toBeTruthy();
            expect(JSON.parse(localStorage.getItem('da_sesion')).nombre).toBe('Clienta');
        });
    });
});

