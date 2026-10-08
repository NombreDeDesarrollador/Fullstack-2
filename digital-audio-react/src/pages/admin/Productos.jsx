import React, { useState } from 'react';
import { Card, Table, Form, Button, Badge, Modal, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { obtenerProductos, eliminarProducto, buscarProductos, esCritico } from '../../services/productosService';
import { formatoCLP } from '../../utils/formato';

export function BadgeStock({ producto }) {
    if (producto.stock === 0) return <Badge bg="danger">Sin stock</Badge>;
    if (esCritico(producto)) return <Badge bg="warning" text="dark">{producto.stock} (crítico)</Badge>;
    return <span>{producto.stock}</span>;
}

function Productos() {
    const { usuario } = useAuth();
    const esAdmin = usuario.tipoUsuario === 'Administrador';
    const [productos, setProductos] = useState(obtenerProductos);
    const [texto, setTexto] = useState('');
    const [aEliminar, setAEliminar] = useState(null);

    const confirmarEliminar = () => {
        eliminarProducto(aEliminar.codigo);
        setProductos(obtenerProductos());
        setAEliminar(null);
    };

    const lista = buscarProductos(texto, productos);

    return (
        <>
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
                <h1 className="fs-3 mb-0">Productos</h1>
                <div className="d-flex flex-wrap gap-2">
                    <Link to="/admin/productos/criticos" className="btn btn-outline-warning"><i className="bi bi-exclamation-triangle me-1"></i>Críticos</Link>
                    {esAdmin && <Link to="/admin/reportes" className="btn btn-outline-secondary"><i className="bi bi-bar-chart me-1"></i>Reportes</Link>}
                    {esAdmin && <Link to="/admin/productos/nuevo" className="btn btn-primary"><i className="bi bi-plus-lg me-1"></i>Nuevo producto</Link>}
                </div>
            </div>
            <Row className="mb-3"><Col md={6}>
                <Form.Control type="search" placeholder="Buscar por nombre o marca" value={texto} onChange={e => setTexto(e.target.value)} aria-label="Buscar producto" />
            </Col></Row>
            <Card className="border-0 shadow-sm">
                <Card.Body>
                    <Table responsive hover size="sm" className="align-middle mb-0">
                        <thead><tr><th>Código</th><th>Nombre</th><th>Categoría</th><th>Precio</th><th>Stock</th><th className="text-end">Acciones</th></tr></thead>
                        <tbody>
                            {lista.map(p => (
                                <tr key={p.codigo}>
                                    <td>{p.codigo}</td>
                                    <td>{p.nombre}</td>
                                    <td>{p.categoria}</td>
                                    <td>{formatoCLP(p.precio)}</td>
                                    <td><BadgeStock producto={p} /></td>
                                    <td className="text-end text-nowrap">
                                        <Link to={`/admin/productos/${p.codigo}`} className="btn btn-sm btn-light" title="Ver"><i className="bi bi-eye"></i></Link>{' '}
                                        {esAdmin && <>
                                            <Link to={`/admin/productos/${p.codigo}/editar`} className="btn btn-sm btn-light text-primary" title="Editar"><i className="bi bi-pencil"></i></Link>{' '}
                                            <Button size="sm" variant="light" className="text-danger" title="Eliminar" onClick={() => setAEliminar(p)}><i className="bi bi-trash"></i></Button>
                                        </>}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </Card.Body>
            </Card>

            <Modal show={!!aEliminar} onHide={() => setAEliminar(null)} centered>
                <Modal.Header closeButton><Modal.Title className="fs-5">Eliminar producto</Modal.Title></Modal.Header>
                <Modal.Body>¿Seguro que deseas eliminar <strong>{aEliminar?.nombre}</strong>? Esta acción no se puede deshacer.</Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setAEliminar(null)}>Cancelar</Button>
                    <Button variant="danger" onClick={confirmarEliminar}>Eliminar</Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}

export default Productos;
