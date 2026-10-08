import React from 'react';
import { Row, Col, Card, Table, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import StatCard from '../../components/admin/StatCard';
import EstadoBadge from '../../components/comunes/EstadoBadge';
import { useAuth } from '../../context/AuthContext';
import { opcionesPorRol } from '../../components/admin/AdminLayout';
import { obtenerOrdenes } from '../../services/ordenesService';
import { obtenerProductos, esCritico } from '../../services/productosService';
import { obtenerUsuarios } from '../../services/usuariosService';
import { formatoCLP, formatoFecha } from '../../utils/formato';

const descripciones = {
    Dashboard: 'Visión general de las métricas del sistema.',
    'Órdenes': 'Seguimiento de las órdenes de compra.',
    Productos: 'Inventario y detalle de productos.',
    'Categorías': 'Organiza los productos por categoría.',
    Usuarios: 'Cuentas de usuario y sus roles.',
    Reportes: 'Informes de ventas e inventario.',
    Perfil: 'Tu información personal y cuenta.'
};

function Dashboard() {
    const { usuario } = useAuth();
    const esAdmin = usuario.tipoUsuario === 'Administrador';
    const ordenes = obtenerOrdenes();
    const pagadas = ordenes.filter(o => o.estado === 'Pagada');
    const productos = obtenerProductos();
    const criticos = productos.filter(esCritico);
    const usuarios = obtenerUsuarios();
    const ultimas = [...ordenes].sort((a, b) => new Date(b.fecha) - new Date(a.fecha)).slice(0, 5);

    return (
        <>
            <h1 className="fs-3 mb-0">Dashboard</h1>
            <p className="text-muted">¡Hola, {usuario.nombre}! Resumen de las actividades.</p>

            <Row xs={1} md={esAdmin ? 3 : 2} className="g-3 mb-4">
                <Col><StatCard titulo="Compras" valor={pagadas.length} detalle={`Ventas: ${formatoCLP(pagadas.reduce((s, o) => s + o.total, 0))}`} icono="bi-cart3" variante="primary" /></Col>
                <Col><StatCard titulo="Productos" valor={productos.length} detalle={`Inventario: ${productos.reduce((s, p) => s + p.stock, 0)} unidades`} icono="bi-box-seam" variante="success" /></Col>
                {esAdmin && <Col><StatCard titulo="Usuarios" valor={usuarios.length} detalle={`Clientes: ${usuarios.filter(u => u.tipoUsuario === 'Cliente').length}`} icono="bi-people" variante="warning" /></Col>}
            </Row>

            {criticos.length > 0 && (
                <Alert variant="warning">
                    <i className="bi bi-exclamation-triangle-fill me-2"></i>
                    Hay <strong>{criticos.length}</strong> productos con stock crítico o agotado. <Link to="/admin/productos/criticos">Revisar listado</Link>
                </Alert>
            )}

            <Row xs={2} md={3} xl={4} className="g-3 mb-4">
                {opcionesPorRol(usuario.tipoUsuario).map(op => (
                    <Col key={op.ruta}>
                        <Card as={Link} to={op.ruta} className="h-100 text-center text-decoration-none border-0 shadow-sm acceso-rapido">
                            <Card.Body>
                                <i className={`bi ${op.icono} fs-3 text-primary`}></i>
                                <div className="fw-semibold text-dark mt-1">{op.texto}</div>
                                <small className="text-muted d-none d-md-block">{descripciones[op.texto]}</small>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>

            <Card className="border-0 shadow-sm">
                <Card.Body>
                    <div className="d-flex justify-content-between mb-2">
                        <h2 className="fs-5 mb-0">Últimas órdenes</h2>
                        <Link to="/admin/ordenes">Ver todas</Link>
                    </div>
                    <Table responsive hover size="sm" className="align-middle mb-0">
                        <thead><tr><th>N° Orden</th><th>Fecha</th><th>Cliente</th><th>Total</th><th>Estado</th></tr></thead>
                        <tbody>
                            {ultimas.map(o => (
                                <tr key={o.numero}>
                                    <td><Link to={`/admin/ordenes/${o.numero}`}>#{o.numero}</Link></td>
                                    <td>{formatoFecha(o.fecha)}</td>
                                    <td>{o.cliente.nombre} {o.cliente.apellidos}</td>
                                    <td>{formatoCLP(o.total)}</td>
                                    <td><EstadoBadge estado={o.estado} /></td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </Card.Body>
            </Card>
        </>
    );
}

export default Dashboard;
