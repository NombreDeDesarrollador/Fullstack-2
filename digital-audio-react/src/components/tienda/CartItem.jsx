// Fila del carrito con controles +/- y eliminar. No tiene estado propio:
// recibe el item y avisa los cambios al padre mediante props (onCambiarCantidad, onEliminar).
import React from 'react';
import { Row, Col, Button, ButtonGroup } from 'react-bootstrap';
import { formatoCLP } from '../../utils/formato';

function CartItem({ item, onCambiarCantidad, onEliminar }) {
    return (
        <Row className="align-items-center g-3 py-3 border-bottom" data-testid="item-carrito">
            <Col xs={3} md={2}>
                <img src={item.imagen} alt={item.nombre} className="img-fluid rounded bg-white p-1 border" />
            </Col>
            <Col xs={9} md={5}>
                <h2 className="fs-6 mb-1">{item.nombre}</h2>
                <small className="text-muted">{formatoCLP(item.precio)} c/u</small>
            </Col>
            <Col xs={6} md={2}>
                <ButtonGroup size="sm" aria-label={`Cantidad de ${item.nombre}`}>
                    <Button variant="outline-secondary" onClick={() => onCambiarCantidad(item.codigo, -1)} aria-label="Quitar una unidad">−</Button>
                    <Button variant="light" disabled className="text-dark fw-bold" data-testid="cantidad">{item.cantidad}</Button>
                    <Button variant="outline-secondary" onClick={() => onCambiarCantidad(item.codigo, 1)}
                        disabled={item.cantidad >= item.stock} aria-label="Agregar una unidad">+</Button>
                </ButtonGroup>
            </Col>
            <Col xs={6} md={3} className="text-end">
                <div className="fw-bold">{formatoCLP(item.precio * item.cantidad)}</div>
                <Button variant="link" size="sm" className="text-danger p-0" onClick={() => onEliminar(item.codigo)}>
                    <i className="bi bi-trash3 me-1"></i>Eliminar
                </Button>
            </Col>
        </Row>
    );
}

export default CartItem;
