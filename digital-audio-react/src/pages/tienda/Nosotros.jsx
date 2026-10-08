import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import bannerEstudio from '../../assets/banner-estudio.jpg';

function Nosotros() {
    return (
        <Container>
            <Row className="g-4 align-items-center bg-white rounded-4 shadow-sm p-3 p-md-5 mx-0 mb-4">
                <Col lg={6}>
                    <h1 className="fs-2">Bienvenidos a Digital Audio</h1>
                    <p>Somos una tienda especializada en instrumentos musicales, equipos de sonido y accesorios para músicos, ubicada en el corazón de Viña del Mar, Región de Valparaíso.</p>
                    <p>Con <strong>11 años de trayectoria</strong>, somos el punto de encuentro para artistas emergentes y músicos profesionales. La tienda es atendida por su dueño y un equipo de vendedores expertos.</p>
                    <p className="mb-0">Además ofrecemos un servicio especializado de <strong>reparación de instrumentos de cuerda</strong>.</p>
                </Col>
                <Col lg={6}><img src={bannerEstudio} alt="Interior de la tienda" className="img-fluid rounded-3" /></Col>
            </Row>

            <section className="bg-white rounded-4 shadow-sm p-3 p-md-5">
                <h2 className="fs-3">Nuestra ubicación</h2>
                <p>Visítanos para probar tus instrumentos y retirar tus pedidos presencialmente.</p>
                <div className="ratio ratio-21x9 mb-3 rounded-3 overflow-hidden">
                    <iframe title="Mapa de la tienda" loading="lazy"
                        src="https://www.google.com/maps?q=Plaza+Vergara+Viña+del+Mar&output=embed"></iframe>
                </div>
                <Row className="small g-2">
                    <Col md={4}><i className="bi bi-geo-alt-fill text-primary me-1"></i>Av. Libertad 123, Viña del Mar</Col>
                    <Col md={4}><i className="bi bi-clock-fill text-primary me-1"></i>Lunes a viernes, 10:00 a 19:00 hrs</Col>
                    <Col md={4}><i className="bi bi-telephone-fill text-primary me-1"></i>+56 9 1234 5678</Col>
                </Row>
            </section>
        </Container>
    );
}

export default Nosotros;
