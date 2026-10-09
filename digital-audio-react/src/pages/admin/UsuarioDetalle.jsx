// Mostrar usuario + historial de compras
import React from 'react';
import { Card, Table } from 'react-bootstrap';
import { Link, useParams } from 'react-router-dom';
import FichaUsuario from './FichaUsuario';
import EstadoBadge from '../../components/comunes/EstadoBadge';
import EstadoEnvioBadge from '../../components/comunes/EstadoEnvioBadge';
import { buscarUsuarioPorRun } from '../../services/usuariosService';
import { ordenesPorCorreo } from '../../services/ordenesService';
import { formatoCLP, formatoFecha } from '../../utils/formato';

function UsuarioDetalle() {
    const { run } = useParams();
    const usuario = buscarUsuarioPorRun(run);
    if (!usuario) return <div className="text-center py-5"><p>El usuario no existe.</p><Link to="/admin/usuarios" className="btn btn-primary">Ver usuarios</Link></div>;

    const historial = ordenesPorCorreo(usuario.correo);
    const gastado = historial.filter(o => o.estado === 'Pagada').reduce((s, o) => s + o.total, 0);

    return (
        <div style={{ maxWidth: 900 }}>
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h1 className="fs-3 mb-0">Detalle de usuario</h1>
                <Link to="/admin/usuarios" className="btn btn-outline-secondary">Volver</Link>
            </div>
            <FichaUsuario usuario={usuario} acciones={<Link to={`/admin/usuarios/${run}/editar`}>Editar</Link>} />
            <Card className="border">
                <Card.Body>
                    <div className="d-flex flex-wrap justify-content-between mb-2">
                        <h2 className="fs-5 mb-0">Historial de compras</h2>
                        <small className="text-muted">{historial.length} compras · Total gastado {formatoCLP(gastado)}</small>
                    </div>
                    {historial.length === 0 ? <p className="text-muted mb-0">Este usuario aún no registra compras.</p> : (
                        <Table responsive size="sm" className="align-middle mb-0">
                            <thead><tr><th>N°</th><th>Fecha</th><th>Productos</th><th>Total</th><th>Estado</th><th></th></tr></thead>
                            <tbody>
                                {historial.map(o => (
                                    <tr key={o.numero}>
                                        <td>#{o.numero}</td>
                                        <td>{formatoFecha(o.fecha)}</td>
                                        <td className="small">{o.items.map(i => `${i.nombre} x${i.cantidad}`).join(', ')}</td>
                                        <td>{formatoCLP(o.total)}</td>
                                        <td><EstadoBadge estado={o.estado} /> <EstadoEnvioBadge estado={o.estadoEnvio} /></td>
                                        <td><Link to={`/admin/ordenes/${o.numero}`}>Boleta</Link></td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    )}
                </Card.Body>
            </Card>
        </div>
    );
}

export default UsuarioDetalle;
