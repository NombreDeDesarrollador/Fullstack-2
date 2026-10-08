// Grilla responsiva de productos: 1 columna en celular, 2 en tablet, 3-4 en escritorio
import React from 'react';
import { Row, Col } from 'react-bootstrap';
import ProductCard from './ProductCard';

function ProductGrid({ productos, onAgregar, mensajeVacio = 'No se encontraron productos.' }) {
    if (!productos.length) {
        return <p className="text-center text-muted py-5" data-testid="sin-productos">{mensajeVacio}</p>;
    }
    return (
        <Row xs={1} sm={2} lg={3} xl={4} className="g-4">
            {productos.map(p => (
                <Col key={p.codigo}>
                    <ProductCard producto={p} onAgregar={onAgregar} />
                </Col>
            ))}
        </Row>
    );
}

export default ProductGrid;
