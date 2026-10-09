// Listado de productos del panel (Administrador y Vendedor).
// Se muestra ordenado del más crítico al menos crítico.
// Los botones dependen del rol (utils/permisos): el Administrador crea, edita y elimina;
// el Vendedor solo puede ver y actualizar el stock.
import React, { useState } from 'react';
import { Card, Table, Form, Button, Badge, Modal, Row, Col, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ModalStock from '../../components/admin/ModalStock';
import { obtenerProductos, eliminarProducto, buscarProductos, esCritico, ordenarPorCriticidad } from '../../services/productosService';
import { puede } from '../../utils/permisos';
import { formatoCLP } from '../../utils/formato';

export function BadgeStock({ producto }) {
    if (producto.stock === 0) return <Badge bg="danger">Sin stock</Badge>;
    if (esCritico(producto)) return <Badge bg="warning" text="dark">{producto.stock} (crítico)</Badge>;
    return <span>{producto.stock}</span>;
}

function Productos() {
    const { usuario } = useAuth();
    const esAdmin = usuario.tipoUsuario === 'Administrador';
    const puedeEditar = puede(usuario, 'productos:editar');
    const puedeEliminar = puede(usuario, 'productos:eliminar');
    const puedeStock = puede(usuario, 'productos:stock');
    const [productos, setProductos] = useState(obtenerProductos);
    const [texto, setTexto] = useState('');
    const [aEliminar, setAEliminar] = useState(null);
    const [aStock, setAStock] = useState(null);      // producto cuyo stock se está editando
    const [aviso, setAviso] = useState('');

    const confirmarEliminar = () => {
        eliminarProducto(aEliminar.codigo);
        setProductos(obtenerProductos());
        setAEliminar(null);
    };

    const stockGuardado = (actualizado) => {
        setProductos(obtenerProductos());
        setAStock(null);
        setAviso(`Stock de ${actualizado.nombre} actualizado a ${actualizado.stock} unidades.`);
    };

    const lista = ordenarPorCriticidad(buscarProductos(texto, productos));

    return (
        <>
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
                <h1 className="fs-3 mb-0">Productos</h1>
                <div className="d-flex flex-wrap gap-2">
                    <Link to="/admin/productos/criticos" className="btn btn-outline-warning"><i className="bi bi-exclamation-triangle me-1"></i>Críticos</Link>
                    {esAdmin && <Link to="/admin/reportes" className="btn btn-outline-secondary"><i className="bi bi-bar-chart me-1"></i>Reportes</Link>}
                    {puede(usuario, 'productos:crear') && <Link to="/admin/productos/nuevo" className="btn btn-primary"><i className="bi bi-plus-lg me-1"></i>Nuevo producto</Link>}
                </div>
            </div>
            {aviso && <Alert variant="success" dismissible onClose={() => setAviso('')}>{aviso}</Alert>}
            <p className="small text-muted mb-2"><i className="bi bi-sort-down me-1"></i>Ordenado del más crítico al menos crítico.</p>
            <Row className="mb-3"><Col md={6}>
                <Form.Control type="search" placeholder="Buscar por nombre o marca" value={texto} onChange={e => setTexto(e.target.value)} aria-label="Buscar producto" />
            </Col></Row>
            <Card className="border-0 shadow-sm">
                <Card.Body>
                    <Table responsive hover size="sm" className="align-middle mb-0">
                        <thead><tr><th>Código</th><th>Nombre</th><th>Categoría</th><th>Precio</th><th>Stock</th><th className="text-end">Acciones</th></tr></thead>
                        <tbody>
                            {lista.map(p => (
                                <tr key={p.codigo} data-testid="fila-producto" className={p.stock === 0 ? 'table-danger' : esCritico(p) ? 'table-warning' : ''}>
                                    <td>{p.codigo}</td>
                                    <td>{p.nombre}</td>
                                    <td>{p.categoria}</td>
                                    <td>{formatoCLP(p.precio)}</td>
                                    <td><BadgeStock producto={p} /></td>
                                    <td className="text-end text-nowrap">
                                        <Link to={`/admin/productos/${p.codigo}`} className="btn btn-sm btn-light" title="Ver"><i className="bi bi-eye"></i></Link>{' '}
                                        {puedeStock && <><Button size="sm" variant="light" className="text-success" title="Actualizar stock" aria-label={`Actualizar stock de ${p.nombre}`} onClick={() => setAStock(p)}><i className="bi bi-box-arrow-in-down"></i></Button>{' '}</>}
                                        {puedeEditar && <><Link to={`/admin/productos/${p.codigo}/editar`} className="btn btn-sm btn-light text-primary" title="Editar"><i className="bi bi-pencil"></i></Link>{' '}</>}
                                        {puedeEliminar && <Button size="sm" variant="light" className="text-danger" title="Eliminar" onClick={() => setAEliminar(p)}><i className="bi bi-trash"></i></Button>}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </Card.Body>
            </Card>

            <ModalStock key={aStock ? aStock.codigo : 'cerrado'} producto={aStock} usuario={usuario}
                onCerrar={() => setAStock(null)} onGuardado={stockGuardado} />

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
