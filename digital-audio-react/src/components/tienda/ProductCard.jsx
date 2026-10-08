// Tarjeta de producto reutilizable (catálogo, categorías, ofertas, inicio).
// Props: producto (datos) y onAgregar (función que agrega al carrito y devuelve true/false).
// Estado propio: "agregado" para dar feedback visual al hacer clic.
import React, { useState } from 'react';
import { Card, Button, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import PrecioProducto from './PrecioProducto';

function ProductCard({ producto, onAgregar }) {
    const [estado, setEstado] = useState('normal'); // normal | agregado | sinStock
    const agotado = producto.stock === 0;

    const manejarClick = () => {
        const ok = onAgregar(producto);
        setEstado(ok ? 'agregado' : 'sinStock');
        setTimeout(() => setEstado('normal'), 1200);
    };

    return (
        <Card className="h-100 tarjeta-producto border-0 shadow-sm">
            <Link to={`/producto/${producto.codigo}`} className="text-decoration-none text-reset">
                <div className="tarjeta-producto-imagen">
                    <Card.Img variant="top" src={producto.imagen} alt={producto.nombre} loading="lazy" />
                </div>
            </Link>
            <Card.Body className="d-flex flex-column text-center">
                <div className="mb-1">
                    <Badge bg="light" text="secondary" className="border">{producto.codigo}</Badge>
                </div>
                <small className="text-uppercase text-muted fw-semibold">{producto.marca}</small>
                <Card.Title as="h3" className="fs-6 my-2">
                    <Link to={`/producto/${producto.codigo}`} className="text-decoration-none text-dark">{producto.nombre}</Link>
                </Card.Title>
                <div className="mb-3"><PrecioProducto producto={producto} /></div>
                <Button
                    className="mt-auto"
                    variant={estado === 'agregado' ? 'success' : estado === 'sinStock' ? 'warning' : 'dark'}
                    disabled={agotado}
                    onClick={manejarClick}
                >
                    {agotado ? 'Sin stock'
                        : estado === 'agregado' ? <><i className="bi bi-check-lg me-1"></i>Agregado</>
                        : estado === 'sinStock' ? 'Sin más unidades'
                        : <><i className="bi bi-cart-plus me-1"></i>Añadir al carrito</>}
                </Button>
            </Card.Body>
        </Card>
    );
}

export default ProductCard;
