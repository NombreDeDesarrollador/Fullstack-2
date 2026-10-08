import React, { useState } from 'react';
import { Container, Row, Col, Button, Badge, Alert, Breadcrumb } from 'react-bootstrap';
import { Link, useParams } from 'react-router-dom';
import PrecioProducto from '../../components/tienda/PrecioProducto';
import ProductGrid from '../../components/tienda/ProductGrid';
import { useCarrito } from '../../context/CartContext';
import { obtenerProducto, obtenerProductos, esCritico, slugCategoria } from '../../services/productosService';

function ProductoDetalle() {
    const { codigo } = useParams();
    const { agregar } = useCarrito();
    const [mensaje, setMensaje] = useState(null);
    const producto = obtenerProducto(codigo);

    if (!producto) {
        return (
            <Container className="text-center py-5">
                <h1 className="fs-3">Producto no encontrado</h1>
                <p>El producto que buscas no existe en nuestro catálogo.</p>
                <Link to="/catalogo" className="btn btn-primary">Volver al catálogo</Link>
            </Container>
        );
    }

    const relacionados = obtenerProductos().filter(p => p.categoria === producto.categoria && p.codigo !== producto.codigo).slice(0, 4);

    const manejarAgregar = () => {
        const ok = agregar(producto);
        setMensaje(ok
            ? { tipo: 'success', texto: `"${producto.nombre}" fue añadido al carrito.` }
            : { tipo: 'warning', texto: 'No hay más unidades disponibles de este producto.' });
    };

    return (
        <Container>
            <Breadcrumb>
                <Breadcrumb.Item linkAs={Link} linkProps={{ to: '/' }}>Inicio</Breadcrumb.Item>
                <Breadcrumb.Item linkAs={Link} linkProps={{ to: `/categorias/${slugCategoria(producto.categoria)}` }}>{producto.categoria}</Breadcrumb.Item>
                <Breadcrumb.Item active>{producto.nombre}</Breadcrumb.Item>
            </Breadcrumb>

            <Row className="g-4 bg-white rounded-4 shadow-sm p-3 p-md-4 mx-0 mb-5">
                <Col md={6} className="d-flex align-items-center justify-content-center bg-light rounded-3 p-4">
                    <img src={producto.imagen} alt={producto.nombre} className="img-fluid detalle-imagen" />
                </Col>
                <Col md={6}>
                    <Badge bg="light" text="secondary" className="border mb-2">{producto.codigo}</Badge>
                    <h1 className="fs-2">{producto.nombre}</h1>
                    <p className="text-muted">Marca: <strong>{producto.marca}</strong></p>
                    <div className="mb-3"><PrecioProducto producto={producto} grande /></div>
                    {producto.stock === 0
                        ? <Badge bg="danger" className="mb-3">Sin stock</Badge>
                        : esCritico(producto)
                            ? <Badge bg="warning" text="dark" className="mb-3">¡Últimas unidades! ({producto.stock})</Badge>
                            : <Badge bg="success" className="mb-3">En stock</Badge>}
                    <h2 className="fs-6 fw-bold border-start border-3 border-dark ps-2">Descripción</h2>
                    <p>{producto.descripcion}</p>
                    {mensaje && <Alert variant={mensaje.tipo} onClose={() => setMensaje(null)} dismissible>{mensaje.texto}</Alert>}
                    <div className="d-grid d-sm-flex gap-2">
                        <Button size="lg" onClick={manejarAgregar} disabled={producto.stock === 0}>
                            <i className="bi bi-cart-plus me-2"></i>Añadir al carrito
                        </Button>
                        <Link to="/carrito" className="btn btn-outline-dark btn-lg">Ver carrito</Link>
                    </div>
                </Col>
            </Row>

            {relacionados.length > 0 && (
                <section>
                    <h2 className="fs-4 mb-3">También te puede interesar</h2>
                    <ProductGrid productos={relacionados} onAgregar={agregar} />
                </section>
            )}
        </Container>
    );
}

export default ProductoDetalle;
