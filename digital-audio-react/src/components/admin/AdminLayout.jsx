// Layout del panel: menú lateral (offcanvas en celular) + contenido.
// Cada opción indica qué roles pueden verla: el Vendedor solo ve sus acciones.
import React, { useState } from 'react';
import { Nav, Offcanvas, Button, Container } from 'react-bootstrap';
import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import logo from '../../assets/logo.png';

export const menuAdmin = [
    { ruta: '/admin', texto: 'Dashboard', icono: 'bi-grid-1x2', roles: ['Administrador', 'Vendedor'], end: true },
    { ruta: '/admin/ordenes', texto: 'Órdenes', icono: 'bi-receipt', roles: ['Administrador', 'Vendedor'] },
    { ruta: '/admin/productos', texto: 'Productos', icono: 'bi-box-seam', roles: ['Administrador', 'Vendedor'] },
    { ruta: '/admin/categorias', texto: 'Categorías', icono: 'bi-tags', roles: ['Administrador'] },
    { ruta: '/admin/usuarios', texto: 'Usuarios', icono: 'bi-people', roles: ['Administrador'] },
    { ruta: '/admin/reportes', texto: 'Reportes', icono: 'bi-bar-chart-line', roles: ['Administrador'] },
    { ruta: '/admin/perfil', texto: 'Perfil', icono: 'bi-person-circle', roles: ['Administrador', 'Vendedor'] }
];

export function opcionesPorRol(rol) {
    return menuAdmin.filter(op => op.roles.includes(rol));
}

function MenuLateral({ usuario, onNavegar, onSalir }) {
    return (
        <div className="d-flex flex-column h-100">
            <Link to="/" className="admin-logo d-block px-3 pb-3 mb-2 border-bottom border-secondary">
                <img src={logo} alt="Digital Audio" />
            </Link>
            <Nav className="flex-column flex-grow-1 admin-nav">
                {opcionesPorRol(usuario.tipoUsuario).map(op => (
                    <Nav.Link key={op.ruta} as={NavLink} to={op.ruta} end={op.end} onClick={onNavegar}>
                        <i className={`bi ${op.icono} me-2`}></i>{op.texto}
                    </Nav.Link>
                ))}
                <Nav.Link as={Link} to="/" onClick={onNavegar}><i className="bi bi-shop me-2"></i>Ver tienda</Nav.Link>
            </Nav>
            <div className="px-3 pt-3 border-top border-secondary">
                <Link to="/admin/perfil" className="d-block text-white text-decoration-none fw-semibold" onClick={onNavegar}>
                    {usuario.nombre} {usuario.apellidos}
                </Link>
                <small className="text-secondary d-block mb-2">{usuario.tipoUsuario}</small>
                <Button variant="outline-light" size="sm" className="w-100" onClick={onSalir}>
                    <i className="bi bi-box-arrow-right me-1"></i>Cerrar sesión
                </Button>
            </div>
        </div>
    );
}

function AdminLayout() {
    const { usuario, logout } = useAuth();
    const navigate = useNavigate();
    const [menuAbierto, setMenuAbierto] = useState(false);

    const salir = () => { logout(); navigate('/login'); };

    return (
        <div className="admin-wrapper">
            <aside className="admin-sidebar d-none d-lg-flex">
                <MenuLateral usuario={usuario} onSalir={salir} />
            </aside>

            <div className="flex-grow-1 min-w-0">
                <div className="d-lg-none bg-dark text-white d-flex align-items-center justify-content-between px-3 py-2">
                    <Button variant="outline-light" size="sm" onClick={() => setMenuAbierto(true)} aria-label="Abrir menú">
                        <i className="bi bi-list"></i>
                    </Button>
                    <span className="fw-semibold">Panel {usuario.tipoUsuario}</span>
                    <span></span>
                </div>
                <Offcanvas show={menuAbierto} onHide={() => setMenuAbierto(false)} className="bg-dark text-white" style={{ width: 260 }}>
                    <Offcanvas.Body className="py-4 px-0">
                        <MenuLateral usuario={usuario} onNavegar={() => setMenuAbierto(false)} onSalir={salir} />
                    </Offcanvas.Body>
                </Offcanvas>

                <Container fluid className="admin-contenido py-4 px-3 px-md-4">
                    <Outlet />
                </Container>
            </div>
        </div>
    );
}

export default AdminLayout;
