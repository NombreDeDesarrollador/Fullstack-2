// Vista Categorías: tarjetas por categoría y productos de la seleccionada (/categorias/:slug)
import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { Link, useParams } from 'react-router-dom';
import ProductGrid from '../../components/tienda/ProductGrid';
import { useCarrito } from '../../context/CartContext';
import { obtenerCategorias, obtenerProductos, slugCategoria } from '../../services/productosService';

function Categorias() {
    const { slug } = useParams();
    const { agregar } = useCarrito();
    const categorias = obtenerCategorias();
    const productos = obtenerProductos();
    const actual = categorias.find(c => slugCategoria(c) === slug) || categorias[0];
    const deCategoria = productos.filter(p => p.categoria === actual);

    return (
        <Container>
            <div className="text-center mb-4">
                <h1 className="fs-2 mb-1">Categorías</h1>
                <p className="text-muted">Elige una categoría para ver sus productos.</p>
            </div>

            <Row xs={2} sm={3} md={4} lg={5} className="g-3 mb-5">
                {categorias.map(cat => {
                    const lista = productos.filter(p => p.categoria === cat);
                    const activa = cat === actual;
                    return (
                        <Col key={cat}>
                            <Card as={Link} to={`/categorias/${slugCategoria(cat)}`}
                                className={`tarjeta-categoria h-100 text-center text-decoration-none p-3 shadow-sm ${activa ? 'border-primary border-2' : 'border-0'}`}
                                aria-current={activa ? 'true' : undefined}>
                                {lista[0] ? <Card.Img src={lista[0].imagen} alt={cat} className="tarjeta-categoria-imagen" />
                                    : <i className="bi bi-tag display-5 text-primary"></i>}
                                <Card.Body className="p-2 pb-0">
                                    <div className="fw-semibold text-dark small">{cat}</div>
                                    <small className="text-muted">{lista.length} productos</small>
                                </Card.Body>
                            </Card>
                        </Col>
                    );
                })}
            </Row>

            <div className="d-flex justify-content-between align-items-baseline border-bottom pb-2 mb-4">
                <h2 className="fs-3 mb-0">{actual}</h2>
                <span className="text-muted">{deCategoria.length} productos</span>
            </div>
            <ProductGrid productos={deCategoria} onAgregar={agregar} mensajeVacio="Aún no hay productos en esta categoría." />
        </Container>
    );
}

export default Categorias;
