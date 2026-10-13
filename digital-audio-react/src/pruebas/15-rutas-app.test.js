// Rutas de la aplicación completa (App.jsx): cada URL muestra su vista
// y las rutas protegidas redirigen según el rol. Cubre los layouts de tienda y panel.
import { screen, fireEvent } from '@testing-library/react';
import { renderApp, clienteDemo, adminDemo, vendedorDemo } from './helpers';

describe('Rutas de App.jsx', () => {
    beforeEach(() => localStorage.clear());

    it.each([
        ['/', 'Ofertas destacadas'],
        ['/catalogo', 'Catálogo'],
        ['/ofertas', 'Ofertas de temporada'],
        ['/categorias', 'Elige una categoría para ver sus productos.'],
        ['/blogs', 'Blog Digital Audio'],
        ['/nosotros', 'Bienvenidos a Digital Audio'],
        ['/contacto', 'Contacto'],
        ['/login', 'Iniciar sesión'],
        ['/registro', 'Crear cuenta'],
        ['/carrito', 'Tu carrito está vacío'],
        ['/una-ruta-que-no-existe', '404']
    ])('la ruta %s muestra su vista dentro del layout de la tienda', (ruta, texto) => {
        renderApp(ruta);
        expect(screen.getAllByText(texto).length).toBeGreaterThan(0);
        // El TiendaLayout siempre incluye el footer
        expect(screen.getByText(/Todos los derechos reservados/)).toBeTruthy();
    });

    it('sin sesión, /mi-cuenta y /admin redirigen a /login', () => {
        const { unmount } = renderApp('/mi-cuenta');
        expect(screen.getByTestId('ubicacion').textContent).toBe('/login');
        unmount();
        renderApp('/admin');
        expect(screen.getByTestId('ubicacion').textContent).toBe('/login');
    });

    it('un Cliente que entra a /admin vuelve al inicio de la tienda', () => {
        renderApp('/admin', clienteDemo);
        expect(screen.getByTestId('ubicacion').textContent).toBe('/');
    });

    it('un Vendedor no puede abrir rutas solo para Administrador (usuarios, reportes, categorías)', () => {
        ['/admin/usuarios', '/admin/reportes', '/admin/categorias', '/admin/productos/nuevo'].forEach(ruta => {
            const { unmount } = renderApp(ruta, vendedorDemo);
            expect(screen.getByTestId('ubicacion').textContent).toBe('/admin');
            unmount();
        });
    });

    it('el Administrador entra al panel y ve todas las opciones del menú lateral', () => {
        renderApp('/admin', adminDemo);
        expect(screen.getByRole('heading', { name: 'Dashboard' })).toBeTruthy();
        ['Órdenes', 'Productos', 'Categorías', 'Usuarios', 'Reportes', 'Perfil'].forEach(texto =>
            expect(screen.getAllByText(texto).length).toBeGreaterThan(0));
        expect(screen.getByText('Panel Administrador')).toBeTruthy();
    });

    it('el menú lateral del Vendedor oculta las opciones de administración', () => {
        renderApp('/admin', vendedorDemo);
        expect(screen.queryByText('Usuarios')).toBeNull();
        expect(screen.queryByText('Reportes')).toBeNull();
        expect(screen.getAllByText('Órdenes').length).toBeGreaterThan(0);
    });

    it('el botón "Abrir menú" despliega el menú en celular y navegar lo cierra', async () => {
        renderApp('/admin', adminDemo);
        fireEvent.click(screen.getByLabelText('Abrir menú'));
        // Con el offcanvas abierto hay dos menús: el lateral y el móvil
        const enlacesOrdenes = await screen.findAllByRole('link', { name: /Órdenes/ });
        expect(enlacesOrdenes.length).toBeGreaterThan(1);
        fireEvent.click(enlacesOrdenes[enlacesOrdenes.length - 1]);
        expect(screen.getByTestId('ubicacion').textContent).toBe('/admin/ordenes');
    });

    it('"Cerrar sesión" en el panel elimina la sesión y lleva a /login', () => {
        localStorage.setItem('da_sesion', JSON.stringify(adminDemo));
        renderApp('/admin/perfil', adminDemo);
        fireEvent.click(screen.getAllByRole('button', { name: /Cerrar sesión/ })[0]);
        expect(screen.getByTestId('ubicacion').textContent).toBe('/login');
        expect(localStorage.getItem('da_sesion')).toBeNull();
    });
});
