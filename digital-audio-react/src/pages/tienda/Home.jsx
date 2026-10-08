import React from 'react';
import { Container, Carousel, Row, Col, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import ProductGrid from '../../components/tienda/ProductGrid';
import { useCarrito } from '../../context/CartContext';
import { obtenerCategorias, obtenerProductos, productosEnOferta, slugCategoria, descuentoProducto } from '../../services/productosService';
import bannerInstrumentos from '../../assets/banner-instrumentos.jpg';
import bannerEstudio from '../../assets/banner-estudio.jpg';

function Home() {
    const { agregar } = useCarrito();
    const productos = obtenerProductos();
    const categorias = obtenerCategorias();
    const destacados = productosEnOferta().sort((a, b) => descuentoProducto(b) - descuentoProducto(a)).slice(0, 4);

    return (
        <>
            <Container fluid="xl">
                <Carousel className="carrusel-inicio rounded-4 overflow-hidden shadow-sm mb-5">
                    <Carousel.Item>
                        <img className="d-block w-100" src={bannerInstrumentos} alt="Guitarras, bajos y baterías" />
                        <Carousel.Caption className="text-start">
                            <h2 className="fw-bold">Encuentra tu sonido</h2>
                            <p className="d-none d-sm-block">Guitarras, bajos, baterías y teclados de las mejores marcas.</p>
                            <Link to="/catalogo" className="btn btn-primary">Ver catálogo</Link>
                        </Carousel.Caption>
                    </Carousel.Item>
                    <Carousel.Item>
                        <img className="d-block w-100" src={bannerEstudio} alt="Equipos de estudio y grabación" />
                        <Carousel.Caption className="text-start">
                            <h2 className="fw-bold">Ofertas de temporada</h2>
                            <p className="d-none d-sm-block">Hasta 30% de descuento en productos seleccionados.</p>
                            <Link to="/ofertas" className="btn btn-warning">Ver ofertas</Link>
                        </Carousel.Caption>
                    </Carousel.Item>
                </Carousel>
            </Container>

            <Container>
                <section className="mb-5">
                    <div className="d-flex justify-content-between align-items-baseline mb-3">
                        <h2 className="fs-3 mb-0">Categorías</h2>
                        <Link to="/categorias">Ver todas</Link>
                    </div>
                    <Row xs={2} md={3} lg={5} className="g-3">
                        {categorias.slice(0, 10).map(cat => {
                            const primero = productos.find(p => p.categoria === cat);
                            return (
                                <Col key={cat}>
                                    <Card as={Link} to={`/categorias/${slugCategoria(cat)}`} className="tarjeta-categoria h-100 border-0 shadow-sm text-decoration-none text-center p-3">
                                        {primero && <Card.Img src={primero.imagen} alt={cat} className="tarjeta-categoria-imagen" />}
                                        <Card.Body className="p-2 pb-0"><span className="fw-semibold text-dark small">{cat}</span></Card.Body>
                                    </Card>
                                </Col>
                            );
                        })}
                    </Row>
                </section>

                <section className="mb-5">
                    <div className="d-flex justify-content-between align-items-baseline mb-3">
                        <h2 className="fs-3 mb-0">Ofertas destacadas</h2>
                        <Link to="/ofertas">Ver ofertas</Link>
                    </div>
                    <ProductGrid productos={destacados} onAgregar={agregar} />
                </section>

                <section className="bg-white rounded-4 shadow-sm p-4 p-md-5 text-center">
                    <h2 className="fs-3">¿Por qué Digital Audio?</h2>
                    <Row className="g-4 mt-1">
                        {[
                            ['bi-truck', 'Envío gratis', 'En compras sobre $50.000 a todo Chile.'],
                            ['bi-credit-card', '12 cuotas sin interés', 'Paga con Webpay de forma segura.'],
                            ['bi-tools', 'Servicio técnico', 'Reparación de instrumentos de cuerda.']
                        ].map(([icono, titulo, texto]) => (
                            <Col md={4} key={titulo}>
                                <i className={`bi ${icono} fs-1 text-primary`}></i>
                                <h3 className="fs-5 mt-2">{titulo}</h3>
                                <p className="text-muted mb-0">{texto}</p>
                            </Col>
                        ))}
                    </Row>
                </section>
            </Container>
        </>
    );
}

export default Home;
