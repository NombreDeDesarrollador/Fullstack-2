// Precio del producto: si está en oferta muestra el precio anterior tachado y el % de descuento
import React from 'react';
import { Badge } from 'react-bootstrap';
import { descuentoProducto, precioFinal } from '../../services/productosService';
import { formatoCLP } from '../../utils/formato';

function PrecioProducto({ producto, grande = false }) {
    const descuento = descuentoProducto(producto);
    const clasePrecio = grande ? 'fs-2 fw-bold' : 'fs-5 fw-bold';

    if (!descuento) {
        return <span className={`${clasePrecio} text-dark`} data-testid="precio">{formatoCLP(producto.precio)}</span>;
    }
    return (
        <span className="d-inline-flex flex-wrap align-items-center gap-2" data-testid="precio">
            <span className={`${clasePrecio} text-danger`}>{formatoCLP(precioFinal(producto))}</span>
            <small className="text-muted text-decoration-line-through">{formatoCLP(producto.precio)}</small>
            <Badge bg="danger">-{descuento}%</Badge>
        </span>
    );
}

export default PrecioProducto;
