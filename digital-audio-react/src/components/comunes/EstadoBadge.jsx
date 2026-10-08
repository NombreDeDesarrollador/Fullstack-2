import React from 'react';
import { Badge } from 'react-bootstrap';

// Muestra el estado de una orden: verde si está pagada, rojo si fue rechazada
function EstadoBadge({ estado }) {
    const pagada = estado === 'Pagada';
    return (
        <Badge pill bg={pagada ? 'success' : 'danger'} className="fw-semibold">
            <i className={`bi ${pagada ? 'bi-check-circle' : 'bi-x-circle'} me-1`}></i>{estado}
        </Badge>
    );
}

export default EstadoBadge;
