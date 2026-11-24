// Detalle de una boleta: datos del cliente, productos, totales, estado de envío
// (editable por Administrador y Vendedor) y código de barras con el código de la orden.
import React, { useState } from 'react';
import { Card, Row, Col, Table, Button, Modal, Alert } from 'react-bootstrap';
import { Link, useNavigate, useParams } from 'react-router-dom';
import EstadoBadge from '../../components/comunes/EstadoBadge';
import SelectEstadoEnvio from '../../components/admin/SelectEstadoEnvio';
import CodigoBarras from '../../components/comunes/CodigoBarras';
import { useAuth } from '../../context/AuthContext';
import { buscarOrden, eliminarOrden } from '../../services/ordenesService';
import { puede } from '../../utils/permisos';
import { useDatos, estaCargado } from '../../services/cache';
import Cargando from '../../components/comunes/Cargando';
import { formatoCLP, formatoFecha } from '../../utils/formato';
import logo from '../../assets/logo.png';

function Boleta() {
    const { numero } = useParams();
    const { usuario } = useAuth();
    const navigate = useNavigate();
    const [confirmar, setConfirmar] = useState(false);
    const [error, setError] = useState('');
    useDatos();
    const orden = buscarOrden(numero);

    const anular = async () => {
        try {
            await eliminarOrden(orden.numero, usuario);
            navigate('/admin/ordenes');
        } catch (e) {
            setError(e.message);
            setConfirmar(false);
        }
    };

    if (!orden && !estaCargado('ordenes')) return <Cargando />;
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
                    {puede(usuario, 'ordenes:eliminar') && orden.estadoEnvio !== 'Entregado' && (
                        <Button variant="outline-danger" onClick={() => setConfirmar(true)}><i className="bi bi-x-circle me-1"></i>Anular</Button>
                    )}
                    <Button onClick={() => window.print()}><i className="bi bi-printer me-1"></i>Imprimir</Button>
                </div>
            </div>
            {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}
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
                    {orden.estado === 'Pagada' && (
                        <div className="d-flex flex-wrap align-items-center gap-2 small mb-3">
                            <span className="text-muted text-uppercase">Estado del envío:</span>
                            <div><SelectEstadoEnvio orden={orden} usuario={usuario} /></div>
                        </div>
                    )}
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
                    <div className="text-center mt-4">
                        <CodigoBarras valor={orden.codigo} />
                    </div>
                </Card.Body>
            </Card>
            <Modal show={confirmar} onHide={() => setConfirmar(false)} centered>
                <Modal.Header closeButton><Modal.Title className="fs-5">Anular pedido</Modal.Title></Modal.Header>
                <Modal.Body>¿Anular el pedido <strong>N° {orden.numero}</strong>?{orden.estado === 'Pagada' && ' Las unidades vuelven al stock.'}</Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setConfirmar(false)}>Cancelar</Button>
                    <Button variant="danger" onClick={anular}>Anular pedido</Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}

export default Boleta;
