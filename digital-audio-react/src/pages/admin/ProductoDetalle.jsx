import React from 'react';
import { Card, Row, Col, Badge } from 'react-bootstrap';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { BadgeStock } from './Productos';
import { obtenerProducto, descuentoProducto, precioFinal } from '../../services/productosService';
import { obtenerOrdenes } from '../../services/ordenesService';
import { formatoCLP } from '../../utils/formato';

function ProductoDetalleAdmin() {
    const { codigo } = useParams();
    const { usuario } = useAuth();
    const producto = obtenerProducto(codigo);

    if (!producto) return <div className="text-center py-5"><p>El producto no existe.</p><Link to="/admin/productos" className="btn btn-primary">Ver productos</Link></div>;

    let vendidas = 0, ingresos = 0;
    obtenerOrdenes().filter(o => o.estado === 'Pagada').forEach(o => o.items.filter(i => i.codigo === codigo).forEach(i => {
        vendidas += i.cantidad; ingresos += i.cantidad * i.precio;
    }));
    const descuento = descuentoProducto(producto);

    const datos = [
        ['Marca', producto.marca], ['Categoría', producto.categoria], ['Precio', formatoCLP(producto.precio)],
        ['Oferta', descuento ? `-${descuento}% → ${formatoCLP(precioFinal(producto))}` : 'No'],
        ['Stock', <BadgeStock producto={producto} />], ['Stock crítico', producto.stockCritico],
        ['Unidades vendidas', vendidas], ['Ingresos generados', formatoCLP(ingresos)]
    ];

    return (
        <>
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
                <h1 className="fs-3 mb-0">{producto.nombre}</h1>
                <div className="d-flex gap-2">
                    <Link to="/admin/productos" className="btn btn-outline-secondary">Volver</Link>
                    {usuario.tipoUsuario === 'Administrador' && <Link to={`/admin/productos/${codigo}/editar`} className="btn btn-primary"><i className="bi bi-pencil me-1"></i>Editar producto</Link>}
                </div>
            </div>
            <Card className="border-0 shadow-sm">
                <Card.Body className="p-4">
                    <Row className="g-4">
                        <Col md={4} className="bg-light rounded-3 d-flex align-items-center justify-content-center p-3">
                            <img src={producto.imagen} alt={producto.nombre} className="img-fluid" style={{ maxHeight: 280 }} />
                        </Col>
                        <Col md={8}>
                            <Badge bg="light" text="secondary" className="border">{producto.codigo}</Badge>
                            <p className="text-muted mt-2">{producto.descripcion || 'Sin descripción.'}</p>
                            <Row xs={1} sm={2} className="g-2">
                                {datos.map(([label, valor]) => (
                                    <Col key={label} className="border-bottom pb-2">
                                        <small className="text-muted text-uppercase d-block">{label}</small>
                                        <span className="fw-semibold">{valor}</span>
                                    </Col>
                                ))}
                            </Row>
                            <Link to={`/producto/${codigo}`} className="d-inline-block mt-3">Ver en la tienda <i className="bi bi-box-arrow-up-right"></i></Link>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>
        </>
    );
}

export default ProductoDetalleAdmin;
