// Estructura común de todas las páginas públicas: Header + contenido + Footer
import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

function TiendaLayout() {
    const { pathname } = useLocation();
    useEffect(() => { window.scrollTo(0, 0); }, [pathname]);

    return (
        <div className="d-flex flex-column min-vh-100 fondo-tienda">
            <Header />
            <main className="flex-grow-1 py-4">
                <Outlet />
            </main>
            <Footer />
        </div>
    );
}

export default TiendaLayout;
