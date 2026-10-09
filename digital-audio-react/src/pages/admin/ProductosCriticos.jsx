// Listado de productos críticos (agotados o bajo su stock crítico), del más urgente al menos urgente.
// Administrador y Vendedor pueden reponer stock directamente desde aquí.
import React, { useState } from 'react';
import { Card, Table, Badge, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ModalStock from '../../components/admin/ModalStock';
import { productosCriticos } from '../../services/productosService';
import { puede } from '../../utils/permisos';

function ProductosCriticos() {
    const { usuario } = useAuth();
    const [criticos, setCriticos] = useState(productosCriticos);
    const [aStock, setAStock] = useState(null);
    const stockGuardado = () => { setCriticos(productosCriticos()); setAStock(null); };
    const agotados = criticos.filter(p => p.stock === 0).length;

    return (
        <>
            <div className="d-flex justify-content-between align-items-center mb-1">
                <h1 className="fs-3 mb-0">Productos críticos</h1>
                <Link to="/admin/productos" className="btn btn-outline-secondary">Volver</Link>
            </div>
            <p className="text-muted">{criticos.length} productos · {agotados} agotados · {criticos.length - agotados} bajo el stock crítico</p>
            <Card className="border-0 shadow-sm">
                <Card.Body>
                    <Table responsive hover size="sm" className="align-middle mb-0">
                        <thead><tr><th>Código</th><th>Nombre</th><th>Categoría</th><th>Stock</th><th>Crítico</th><th>Estado</th><th></th></tr></thead>
                        <tbody>
                            {criticos.length === 0 && <tr><td colSpan={7} className="text-center text-muted py-4">No hay productos críticos.</td></tr>}
                            {criticos.map(p => (
                                <tr key={p.codigo}>
                                    <td>{p.codigo}</td><td>{p.nombre}</td><td>{p.categoria}</td><td>{p.stock}</td><td>{p.stockCritico}</td>
                                    <td>{p.stock === 0 ? <Badge bg="danger">Agotado</Badge> : <Badge bg="warning" text="dark">Reponer</Badge>}</td>
                                    <td className="text-end">
                                        <Link to={`/admin/productos/${p.codigo}`} className="btn btn-sm btn-light"><i className="bi bi-eye"></i></Link>{' '}
                                        {puede(usuario, 'productos:stock') && <><Button size="sm" variant="light" className="text-success" title="Reponer stock" onClick={() => setAStock(p)}><i className="bi bi-box-arrow-in-down"></i></Button>{' '}</>}
                                        {puede(usuario, 'productos:editar') && <Link to={`/admin/productos/${p.codigo}/editar`} className="btn btn-sm btn-light text-primary"><i className="bi bi-pencil"></i></Link>}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </Card.Body>
            </Card>
            <ModalStock key={aStock ? aStock.codigo : 'cerrado'} producto={aStock} usuario={usuario}
                onCerrar={() => setAStock(null)} onGuardado={stockGuardado} />
        </>
    );
}

export default ProductosCriticos;
