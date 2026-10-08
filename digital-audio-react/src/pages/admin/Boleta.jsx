import React from 'react';
import { Card, Row, Col, Table, Button } from 'react-bootstrap';
import { Link, useParams } from 'react-router-dom';
import EstadoBadge from '../../components/comunes/EstadoBadge';
import { buscarOrden } from '../../services/ordenesService';
import { formatoCLP, formatoFecha } from '../../utils/formato';
import logo from '../../assets/logo.png';

function Boleta() {
    const { numero } = useParams();
    const orden = buscarOrden(numero);

    if (!orden) {
        return <div className="text-center py-5"><p>No se encontró la boleta.</p><Link to="/admin/ordenes" className="btn btn-primary">Ver órdenes</Link></div>;
    }
    const neto = Math.round(orden.total / 1.19);
    const d = orden.direccion;

    return (
        <>
            <div className="d-flex justify-content-between align-items-center mb-3 no-imprimir">
                <h1 className="fs-3 mb-0">Detalle de boleta</h1>
                <div className="d-flex gap-2">
                    <Link to="/admin/ordenes" className="btn btn-outline-secondary">Volver</Link>
                    <Button onClick={() => window.print()}><i className="bi bi-printer me-1"></i>Imprimir</Button>
                </div>
            </div>
            <Card className="border-0 shadow-sm" style={{ maxWidth: 900 }}>
                <Card.Body className="p-4">
                    <div className="d-flex flex-wrap justify-content-between gap-3 border-bottom pb-3 mb-3">
                        <div className="d-flex align-items-center gap-3">
                            <img src={logo} alt="Digital Audio" style={{ height: 34 }} />
                            <div className="small"><strong>Digital Audio SpA</strong><br />RUT 76.123.456-7<br />Av. Libertad 123, Viña del Mar</div>
                        </div>
                        <div className="border border-2 border-danger text-danger rounded-3 px-3 py-2 text-center fw-bold">
                            BOLETA ELECTRÓNICA<br /><span className="fs-5">N° {orden.numero}</span><br /><EstadoBadge estado={orden.estado} />
                        </div>
                    </div>
                    <Row className="small mb-3 g-3">
                        <Col md={4}><div className="text-muted text-uppercase">Cliente</div>{orden.cliente.nombre} {orden.cliente.apellidos}<br />{orden.cliente.correo}</Col>
                        <Col md={4}><div className="text-muted text-uppercase">Entrega</div>{d.calle}{d.departamento ? `, ${d.departamento}` : ''}<br />{d.comuna}, {d.region}</Col>
                        <Col md={4}><div className="text-muted text-uppercase">Compra</div>Fecha: {formatoFecha(orden.fecha)}<br />Código: {orden.codigo}<br />Pago: {orden.medioPago || 'Webpay'}</Col>
                    </Row>
                    <Table responsive size="sm">
                        <thead><tr><th>Código</th><th>Producto</th><th>Precio</th><th>Cant.</th><th className="text-end">Subtotal</th></tr></thead>
                        <tbody>
                            {orden.items.map(i => (
                                <tr key={i.codigo}><td>{i.codigo}</td><td>{i.nombre}</td><td>{formatoCLP(i.precio)}</td><td>{i.cantidad}</td><td className="text-end">{formatoCLP(i.precio * i.cantidad)}</td></tr>
                            ))}
                        </tbody>
                    </Table>
                    <div className="ms-auto" style={{ maxWidth: 280 }}>
                        <div className="d-flex justify-content-between"><span>Neto</span><span>{formatoCLP(neto)}</span></div>
                        <div className="d-flex justify-content-between"><span>IVA (19%)</span><span>{formatoCLP(orden.total - neto)}</span></div>
                        <div className="d-flex justify-content-between fs-5 fw-bold border-top mt-1 pt-1"><span>Total</span><span>{formatoCLP(orden.total)}</span></div>
                    </div>
                    {orden.estado !== 'Pagada' && <p className="text-danger small mt-3 mb-0">Pago rechazado: {orden.motivo}</p>}
                </Card.Body>
            </Card>
        </>
    );
}

export default Boleta;
