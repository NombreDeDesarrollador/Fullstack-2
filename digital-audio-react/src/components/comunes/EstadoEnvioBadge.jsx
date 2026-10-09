// Muestra el estado de envío de un pedido pagado: En preparación, Despachado o Entregado.
// Props: estado (texto). Si no hay estado (orden rechazada) no muestra nada.
import React from 'react';
import { Badge } from 'react-bootstrap';

const estilos = {
    'En preparación': { bg: 'secondary', icono: 'bi-box-seam' },
    Despachado: { bg: 'info', icono: 'bi-truck' },
    Entregado: { bg: 'success', icono: 'bi-house-check' }
};

function EstadoEnvioBadge({ estado }) {
    if (!estado) return <span className="text-muted small">—</span>;
    const { bg, icono } = estilos[estado] || estilos['En preparación'];
    return (
        <Badge bg={bg} className="fw-semibold" data-testid="estado-envio">
            <i className={`bi ${icono} me-1`}></i>{estado}
        </Badge>
    );
}

export default EstadoEnvioBadge;
