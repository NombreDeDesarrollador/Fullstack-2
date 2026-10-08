// Un solo componente para "compra exitosa" y "pago con error".
// La prop `exito` decide el título, colores y acciones (personalización por props).
import React, { useState } from 'react';
import { Container, Card, Row, Col, Form, Button, Alert } from 'react-bootstrap';
import { Link, useParams } from 'react-router-dom';
import ResumenOrden from '../../components/comunes/ResumenOrden';
import { PasosCompra } from './Checkout';
import { buscarOrden } from '../../services/ordenesService';
import { obtenerProducto } from '../../services/productosService';
import { formatoCLP } from '../../utils/formato';

function Dato({ label, valor, md = 6 }) {
    return (
        <Col md={md} className="mb-3">
            <Form.Label className="small fw-semibold mb-1">{label}</Form.Label>
            <Form.Control value={valor || ''} readOnly plaintext={false} disabled />
        </Col>
    );
}

function CompraResultado({ exito }) {
    const { numero } = useParams();
    const [emailEnviado, setEmailEnviado] = useState(false);
    const orden = buscarOrden(numero);

    if (!orden) {
        return (
            <Container className="text-center py-5">
                <h1 className="fs-3">Orden no encontrada</h1>
                <Link to="/" className="btn btn-primary">Volver al inicio</Link>
            </Container>
        );
    }

    const items = orden.items.map(i => ({ ...i, imagen: i.imagen || obtenerProducto(i.codigo)?.imagen }));
    const d = orden.direccion;

    return (
        <Container style={{ maxWidth: 900 }}>
            <PasosCompra paso={exito ? 3 : 2} error={!exito} />
            <Card className={`border-0 shadow-sm border-top border-5 ${exito ? 'border-success' : 'border-danger'}`}>
                <Card.Body className="p-3 p-md-5">
                    <div className="d-flex flex-wrap justify-content-between gap-2">
                        <h1 className="fs-3">
                            <i className={`bi ${exito ? 'bi-check-circle text-success' : 'bi-x-circle text-danger'} me-2`}></i>
                            {exito ? 'Se ha realizado la compra.' : 'No se pudo realizar el pago.'} nro #{orden.numero}
                        </h1>
                        <small className="text-muted">Código orden: <strong>{orden.codigo}</strong></small>
                    </div>
                    <p className="text-muted">
                        {exito ? 'Gracias por tu compra. Te enviaremos un correo con el seguimiento del despacho.'
                            : <><strong>Motivo:</strong> {orden.motivo} Tu carrito sigue guardado.</>}
                    </p>

                    {!exito && (
                        <div className="text-center mb-4">
                            <Link to="/checkout" className="btn btn-success btn-lg"><i className="bi bi-arrow-repeat me-2"></i>VOLVER A REALIZAR EL PAGO</Link>
                        </div>
                    )}

                    <Row>
                        <Dato md={4} label="Nombre" valor={orden.cliente.nombre} />
                        <Dato md={4} label="Apellidos" valor={orden.cliente.apellidos} />
                        <Dato md={4} label="Correo" valor={orden.cliente.correo} />
                    </Row>
                    <h2 className="fs-5">Dirección de entrega de los productos</h2>
                    <Row>
                        <Dato label="Calle" valor={d.calle} />
                        <Dato label="Departamento" valor={d.departamento} />
                        <Dato label="Región" valor={d.region} />
                        <Dato label="Comuna" valor={d.comuna} />
                        <Dato md={12} label="Indicaciones para la entrega" valor={d.indicaciones} />
                    </Row>

                    <ResumenOrden items={items} />
                    <div className="border rounded-3 text-center fs-5 p-3 mt-3 bg-white">
                        Total {exito ? 'pagado' : 'a pagar'}: <strong>{formatoCLP(orden.total)}</strong>
                    </div>

                    {exito && (
                        <>
                            <div className="d-flex flex-wrap justify-content-center gap-2 mt-4 no-imprimir">
                                <Button variant="danger" onClick={() => window.print()}><i className="bi bi-file-earmark-pdf me-1"></i>Imprimir boleta en PDF</Button>
                                <Button variant="success" onClick={() => setEmailEnviado(true)}><i className="bi bi-envelope me-1"></i>Enviar boleta por email</Button>
                                <Link to="/catalogo" className="btn btn-outline-secondary">Seguir comprando</Link>
                            </div>
                            {emailEnviado && <Alert variant="success" className="mt-3 text-center">La boleta fue enviada a <strong>{orden.cliente.correo}</strong></Alert>}
                        </>
                    )}
                </Card.Body>
            </Card>
        </Container>
    );
}

export default CompraResultado;
