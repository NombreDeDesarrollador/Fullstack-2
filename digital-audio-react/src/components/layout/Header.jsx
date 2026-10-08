// Header de la tienda: barra de promociones, logo, buscador, cuenta, carrito y menú.
// Si hay sesión, en vez de "Iniciar sesión" muestra el nombre del usuario y lo lleva
// a su lugar según el rol (Cliente -> Mi cuenta, Admin/Vendedor -> Panel).
import React from 'react';
import { Navbar, Nav, Container, NavDropdown, Badge } from 'react-bootstrap';
import { Link, NavLink, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCarrito } from '../../context/CartContext';
import BuscadorHeader from './BuscadorHeader';
import logo from '../../assets/logo.png';

export const enlacesMenu = [
    { ruta: '/', texto: 'Inicio' },
    { ruta: '/catalogo', texto: 'Catálogo' },
    { ruta: '/categorias', texto: 'Categorías' },
    { ruta: '/ofertas', texto: 'Ofertas' },
    { ruta: '/blogs', texto: 'Blog' },
    { ruta: '/nosotros', texto: 'Nosotros' },
    { ruta: '/contacto', texto: 'Contacto' }
];

function MenuCuenta() {
    const { usuario, logout, esPersonal } = useAuth();
    const navigate = useNavigate();

    if (!usuario) {
        return (
            <div className="d-flex gap-2">
                <Link to="/login" className="btn btn-outline-primary btn-sm">Iniciar sesión</Link>
                <Link to="/registro" className="btn btn-primary btn-sm d-none d-sm-inline-block">Crear cuenta</Link>
            </div>
        );
    }

    const primerNombre = (usuario.nombre || usuario.correo).split(' ')[0];
    const salir = () => { logout(); navigate('/'); };

    return (
        <NavDropdown
            align="end"
            id="menu-cuenta"
            title={<span className="fw-semibold"><i className={`bi ${esPersonal ? 'bi-speedometer2' : 'bi-person-check'} me-1`}></i>{primerNombre}</span>}
        >
            <NavDropdown.Header>{usuario.tipoUsuario}</NavDropdown.Header>
            {esPersonal ? (
                <>
                    <NavDropdown.Item as={Link} to="/admin">Ir al panel</NavDropdown.Item>
                    <NavDropdown.Item as={Link} to="/admin/perfil">Mi perfil</NavDropdown.Item>
                </>
            ) : (
                <>
                    <NavDropdown.Item as={Link} to="/mi-cuenta">Mi perfil</NavDropdown.Item>
                    <NavDropdown.Item as={Link} to="/mi-cuenta#compras">Mis compras</NavDropdown.Item>
                </>
            )}
            <NavDropdown.Divider />
            <NavDropdown.Item onClick={salir}><i className="bi bi-box-arrow-right me-1"></i>Cerrar sesión</NavDropdown.Item>
        </NavDropdown>
    );
}

function Header() {
    const { cantidad, total } = useCarrito();
    const navigate = useNavigate();
    const [params] = useSearchParams();

    const buscar = (texto) => navigate(texto ? `/catalogo?buscar=${encodeURIComponent(texto)}` : '/catalogo');

    return (
        <header>
            <div className="barra-promo small py-2 px-3 d-flex flex-wrap justify-content-center justify-content-md-between gap-2">
                <span>Envío gratis <strong>en compras sobre $50.000</strong></span>
                <span className="d-none d-md-inline">12 cuotas <strong>sin interés con Webpay</strong></span>
                <span className="d-none d-lg-inline">Retira <strong>en tienda · gratis</strong></span>
            </div>

            <Navbar expand="lg" bg="white" className="border-bottom shadow-sm py-2" sticky="top">
                <Container fluid="xl">
                    <Navbar.Brand as={Link} to="/" className="me-lg-4">
                        <img src={logo} alt="Digital Audio" className="logo-header" />
                    </Navbar.Brand>

                    <div className="d-flex align-items-center gap-2 order-lg-last">
                        <MenuCuenta />
                        <Link to="/carrito" className="btn btn-dark btn-sm position-relative" aria-label="Ver carrito">
                            <i className="bi bi-cart3"></i>
                            <span className="d-none d-md-inline ms-1">{total > 0 ? `$${total.toLocaleString('es-CL')}` : 'Carrito'}</span>
                            <Badge bg="primary" pill className="position-absolute top-0 start-100 translate-middle" data-testid="badge-carrito">
                                {cantidad}
                            </Badge>
                        </Link>
                        <Navbar.Toggle aria-controls="menu-principal" className="ms-1" />
                    </div>

                    <Navbar.Collapse id="menu-principal">
                        <div className="flex-grow-1 my-2 my-lg-0 me-lg-3">
                            <BuscadorHeader key={params.get('buscar') || ''} valorInicial={params.get('buscar') || ''} onBuscar={buscar} />
                        </div>
                    </Navbar.Collapse>
                </Container>
            </Navbar>

            <Nav className="menu-tienda justify-content-center flex-nowrap overflow-auto">
                {enlacesMenu.map(e => (
                    <Nav.Link key={e.ruta} as={NavLink} to={e.ruta} end={e.ruta === '/'}>{e.texto}</Nav.Link>
                ))}
            </Nav>
        </header>
    );
}

export default Header;
