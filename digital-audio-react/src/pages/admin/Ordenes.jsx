import React, { useState } from 'react';
import { Card, Table, Form, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import EstadoBadge from '../../components/comunes/EstadoBadge';
import { obtenerOrdenes, cantidadUnidades } from '../../services/ordenesService';
import { formatoCLP, formatoFecha } from '../../utils/formato';

// Filtro puro (exportado para probarlo): texto por n°, cliente o correo + estado
export function filtrarOrdenes(ordenes, texto, estado) {
    const t = texto.trim().toLowerCase();
    return ordenes.filter(o =>
        (!estado || o.estado === estado) &&
        (!t || String(o.numero).includes(t) ||
            `${o.cliente.nombre} ${o.cliente.apellidos}`.toLowerCase().includes(t) ||
            o.cliente.correo.toLowerCase().includes(t)));
}

function Ordenes() {
    const [texto, setTexto] = useState('');
    const [estado, setEstado] = useState('');
    const todas = obtenerOrdenes();
    const lista = filtrarOrdenes(todas, texto, estado).sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    const pagadas = todas.filter(o => o.estado === 'Pagada');

    return (
        <>
            <h1 className="fs-3">Órdenes / Boletas</h1>
            <Row xs={2} md={4} className="g-3 mb-3">
                {[
                    ['Total órdenes', todas.length],
                    ['Pagadas', pagadas.length],
                    ['Rechazadas', todas.length - pagadas.length],
                    ['Monto vendido', formatoCLP(pagadas.reduce((s, o) => s + o.total, 0))]
                ].map(([t, v]) => (
                    <Col key={t}><Card className="border-0 shadow-sm"><Card.Body className="py-2"><small className="text-muted">{t}</small><div className="fs-5 fw-bold">{v}</div></Card.Body></Card></Col>
                ))}
            </Row>
            <Row className="g-2 mb-3">
                <Col md={6}><Form.Control type="search" placeholder="Buscar por N°, cliente o correo" value={texto} onChange={e => setTexto(e.target.value)} aria-label="Buscar orden" /></Col>
                <Col md={3}>
                    <Form.Select value={estado} onChange={e => setEstado(e.target.value)} aria-label="Filtrar por estado">
                        <option value="">Todos los estados</option>
                        <option value="Pagada">Pagada</option>
                        <option value="Rechazada">Rechazada</option>
                    </Form.Select>
                </Col>
            </Row>
            <Card className="border-0 shadow-sm">
                <Card.Body>
                    <Table responsive hover className="align-middle mb-0">
                        <thead><tr><th>N° Orden</th><th>Fecha</th><th>Cliente</th><th>Unidades</th><th>Total</th><th>Estado</th><th></th></tr></thead>
                        <tbody>
                            {lista.length === 0 && <tr><td colSpan={7} className="text-center text-muted py-4">No se encontraron órdenes.</td></tr>}
                            {lista.map(o => (
                                <tr key={o.numero}>
                                    <td className="fw-bold">#{o.numero}</td>
                                    <td>{formatoFecha(o.fecha)}</td>
                                    <td>{o.cliente.nombre} {o.cliente.apellidos}<br /><small className="text-muted">{o.cliente.correo}</small></td>
                                    <td>{cantidadUnidades(o)}</td>
                                    <td>{formatoCLP(o.total)}</td>
                                    <td><EstadoBadge estado={o.estado} /></td>
                                    <td><Link to={`/admin/ordenes/${o.numero}`} className="btn btn-sm btn-outline-secondary"><i className="bi bi-eye me-1"></i>Boleta</Link></td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </Card.Body>
            </Card>
        </>
    );
}

export default Ordenes;
