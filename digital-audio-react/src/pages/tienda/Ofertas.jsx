import React, { useState } from 'react';
import { Container, Row, Col, Form } from 'react-bootstrap';
import ProductGrid from '../../components/tienda/ProductGrid';
import { useCarrito } from '../../context/CartContext';
import { productosEnOferta, descuentoProducto, precioFinal } from '../../services/productosService';

function Ofertas() {
    const { agregar } = useCarrito();
    const [orden, setOrden] = useState('descuento');
    const ofertas = productosEnOferta();
    const maximo = Math.max(0, ...ofertas.map(descuentoProducto));

    const lista = [...ofertas].sort((a, b) =>
        orden === 'descuento' ? descuentoProducto(b) - descuentoProducto(a)
            : orden === 'precio-asc' ? precioFinal(a) - precioFinal(b)
            : precioFinal(b) - precioFinal(a));

    return (
        <Container>
            <div className="banner-ofertas rounded-4 p-4 p-md-5 mb-4 text-white d-flex justify-content-between align-items-center">
                <div>
                    <small className="fw-bold text-warning">SOLO POR TIEMPO LIMITADO</small>
                    <h1 className="fw-bold">Ofertas de temporada</h1>
                    <p className="mb-0">Descuentos de hasta <strong className="text-warning">{maximo}%</strong> en productos seleccionados.</p>
                </div>
                <i className="bi bi-tags-fill display-1 d-none d-md-block opacity-75"></i>
            </div>

            <Row className="align-items-end mb-4 g-2">
                <Col xs={12} sm={6} md={4}>
                    <Form.Label htmlFor="orden-ofertas" className="small fw-semibold">Ordenar por</Form.Label>
                    <Form.Select id="orden-ofertas" value={orden} onChange={e => setOrden(e.target.value)}>
                        <option value="descuento">Mayor descuento</option>
                        <option value="precio-asc">Menor precio</option>
                        <option value="precio-desc">Mayor precio</option>
                    </Form.Select>
                </Col>
                <Col className="text-sm-end text-muted">{lista.length} productos en oferta</Col>
            </Row>

            <ProductGrid productos={lista} onAgregar={agregar} mensajeVacio="No hay ofertas por ahora." />
        </Container>
    );
}

export default Ofertas;
