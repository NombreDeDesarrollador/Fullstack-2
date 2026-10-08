import React, { useState } from 'react';
import { Card, Table, Button, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { obtenerCategorias, obtenerProductos, eliminarCategoria, slugCategoria } from '../../services/productosService';

function CategoriasAdmin() {
    const [categorias, setCategorias] = useState(obtenerCategorias);
    const [error, setError] = useState('');
    const productos = obtenerProductos();

    const eliminar = (nombre) => {
        try {
            eliminarCategoria(nombre);
            setCategorias(obtenerCategorias());
            setError('');
        } catch (e) {
            setError(e.message);
        }
    };

    return (
        <>
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h1 className="fs-3 mb-0">Categorías</h1>
                <Link to="/admin/categorias/nueva" className="btn btn-primary"><i className="bi bi-plus-lg me-1"></i>Nueva categoría</Link>
            </div>
            {error && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>}
            <Card className="border-0 shadow-sm">
                <Card.Body>
                    <Table responsive hover className="align-middle mb-0">
                        <thead><tr><th>Categoría</th><th>Productos</th><th>Unidades</th><th className="text-end">Acciones</th></tr></thead>
                        <tbody>
                            {categorias.map(c => {
                                const lista = productos.filter(p => p.categoria === c);
                                return (
                                    <tr key={c}>
                                        <td className="fw-semibold">{c}</td>
                                        <td>{lista.length}</td>
                                        <td>{lista.reduce((s, p) => s + p.stock, 0)}</td>
                                        <td className="text-end text-nowrap">
                                            <Link to={`/categorias/${slugCategoria(c)}`} className="btn btn-sm btn-light" title="Ver en tienda"><i className="bi bi-eye"></i></Link>{' '}
                                            <Link to={`/admin/categorias/${encodeURIComponent(c)}/editar`} className="btn btn-sm btn-light text-primary" title="Editar"><i className="bi bi-pencil"></i></Link>{' '}
                                            <Button size="sm" variant="light" className="text-danger" disabled={lista.length > 0} title="Eliminar" onClick={() => eliminar(c)}><i className="bi bi-trash"></i></Button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </Table>
                </Card.Body>
            </Card>
        </>
    );
}

export default CategoriasAdmin;
