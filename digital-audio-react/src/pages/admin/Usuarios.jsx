import React, { useState } from 'react';
import { Card, Table, Button, Modal, Form, Row, Col, Badge, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { obtenerUsuarios, eliminarUsuario, cambiarEstadoUsuario } from '../../services/usuariosService';
import { useDatos } from '../../services/cache';

function Usuarios() {
    const { usuario: actual } = useAuth();
    useDatos(); // los usuarios vienen de ms-usuarios (solo Administrador)
    const usuarios = obtenerUsuarios();
    const [rol, setRol] = useState('');
    const [aEliminar, setAEliminar] = useState(null);
    const [error, setError] = useState('');

    const confirmar = async () => {
        try {
            await eliminarUsuario(aEliminar.run);
            setError('');
        } catch (e) {
            setError(e.message);
        }
        setAEliminar(null);
    };

    // Desactivar = el usuario no puede iniciar sesión, pero se conserva su historial de compras
    const alternarEstado = async (u) => {
        try {
            await cambiarEstadoUsuario(u.run, !u.activo);
            setError('');
        } catch (e) {
            setError(e.message);
        }
    };

    const lista = usuarios.filter(u => !rol || u.tipoUsuario === rol);

    return (
        <>
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h1 className="fs-3 mb-0">Usuarios</h1>
                <Link to="/admin/usuarios/nuevo" className="btn btn-primary"><i className="bi bi-plus-lg me-1"></i>Nuevo usuario</Link>
            </div>
            {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}
            <Row className="mb-3"><Col sm={6} md={3}>
                <Form.Select value={rol} onChange={e => setRol(e.target.value)} aria-label="Filtrar por rol">
                    <option value="">Todos los roles</option>
                    <option>Administrador</option><option>Vendedor</option><option>Cliente</option>
                </Form.Select>
            </Col></Row>
            <Card className="border-0 shadow-sm">
                <Card.Body>
                    <Table responsive hover className="align-middle mb-0">
                        <thead><tr><th>RUN</th><th>Nombre</th><th>Correo</th><th>Rol</th><th>Estado</th><th className="text-end">Acciones</th></tr></thead>
                        <tbody>
                            {lista.map(u => (
                                <tr key={u.run}>
                                    <td>{u.run}</td>
                                    <td>{u.nombre} {u.apellidos}</td>
                                    <td>{u.correo}</td>
                                    <td>{u.tipoUsuario}</td>
                                    <td>{u.activo === false ? <Badge bg="secondary">Inactivo</Badge> : <Badge bg="success">Activo</Badge>}</td>
                                    <td className="text-end text-nowrap">
                                        <Button size="sm" variant="light" className={u.activo === false ? 'text-success' : 'text-warning'} disabled={u.run === actual.run}
                                            title={u.activo === false ? 'Activar' : 'Desactivar'} aria-label={`${u.activo === false ? 'Activar' : 'Desactivar'} a ${u.nombre}`}
                                            onClick={() => alternarEstado(u)}><i className={`bi ${u.activo === false ? 'bi-person-check' : 'bi-person-slash'}`}></i></Button>{' '}
                                        <Link to={`/admin/usuarios/${u.run}`} className="btn btn-sm btn-light" title="Ver y ver historial"><i className="bi bi-eye"></i></Link>{' '}
                                        <Link to={`/admin/usuarios/${u.run}/editar`} className="btn btn-sm btn-light text-primary" title="Editar"><i className="bi bi-pencil"></i></Link>{' '}
                                        <Button size="sm" variant="light" className="text-danger" title="Eliminar" disabled={u.run === actual.run} onClick={() => setAEliminar(u)}><i className="bi bi-trash"></i></Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </Card.Body>
            </Card>
            <Modal show={!!aEliminar} onHide={() => setAEliminar(null)} centered>
                <Modal.Header closeButton><Modal.Title className="fs-5">Eliminar usuario</Modal.Title></Modal.Header>
                <Modal.Body>¿Eliminar a <strong>{aEliminar?.nombre} {aEliminar?.apellidos}</strong>?</Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setAEliminar(null)}>Cancelar</Button>
                    <Button variant="danger" onClick={confirmar}>Eliminar</Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}

export default Usuarios;
