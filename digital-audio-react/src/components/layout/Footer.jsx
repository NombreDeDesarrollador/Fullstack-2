import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';

function Footer() {
    return (
        <footer className="footer-tienda mt-5 pt-5 pb-3">
            <Container>
                <Row className="g-4">
                    <Col md={5}>
                        <h2 className="fs-5 text-white">Digital Audio</h2>
                        <p className="small mb-0">Instrumentos musicales, equipos de audio y accesorios. 11 años acompañando a músicos en Viña del Mar.</p>
                    </Col>
                    <Col xs={6} md={3}>
                        <h3 className="fs-6 text-white">Tienda</h3>
                        <ul className="list-unstyled small">
                            <li><Link to="/catalogo">Catálogo</Link></li>
                            <li><Link to="/ofertas">Ofertas</Link></li>
                            <li><Link to="/blogs">Blog</Link></li>
                        </ul>
                    </Col>
                    <Col xs={6} md={4}>
                        <h3 className="fs-6 text-white">Contacto</h3>
                        <p className="small mb-1"><i className="bi bi-geo-alt me-1"></i>Av. Libertad 123, Viña del Mar</p>
                        <p className="small mb-1"><i className="bi bi-telephone me-1"></i>+56 9 1234 5678</p>
                    </Col>
                </Row>
                <hr className="border-secondary" />
                <p className="text-center small mb-0">&copy; 2026 Digital Audio — Todos los derechos reservados</p>
            </Container>
        </footer>
    );
}

export default Footer;
