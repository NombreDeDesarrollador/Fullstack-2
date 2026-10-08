// Tabla con los productos de un carrito u orden (imagen, nombre, precio, cantidad, subtotal)
import React from 'react';
import { Table } from 'react-bootstrap';
import { formatoCLP } from '../../utils/formato';

function ResumenOrden({ items, mostrarImagen = true }) {
    return (
        <Table responsive size="sm" className="align-middle mb-0">
            <thead className="table-light">
                <tr>
                    {mostrarImagen && <th>Imagen</th>}
                    <th>Nombre</th>
                    <th>Precio</th>
                    <th>Cantidad</th>
                    <th className="text-end">Subtotal</th>
                </tr>
            </thead>
            <tbody>
                {items.map(item => (
                    <tr key={item.codigo}>
                        {mostrarImagen && (
                            <td><img src={item.imagen} alt={item.nombre} className="miniatura" /></td>
                        )}
                        <td>{item.nombre}</td>
                        <td>{formatoCLP(item.precio)}</td>
                        <td>{item.cantidad}</td>
                        <td className="text-end">{formatoCLP(item.precio * item.cantidad)}</td>
                    </tr>
                ))}
            </tbody>
        </Table>
    );
}

export default ResumenOrden;
