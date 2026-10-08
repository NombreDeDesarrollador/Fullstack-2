// Tarjeta de indicador (Dashboard y Reportes). Personalizable por props.
import React from 'react';
import { Card } from 'react-bootstrap';

function StatCard({ titulo, valor, detalle, icono, variante = 'primary' }) {
    const textoOscuro = variante === 'warning';
    return (
        <Card bg={variante} text={textoOscuro ? 'dark' : 'white'} className="border-0 shadow-sm h-100">
            <Card.Body className="d-flex align-items-center gap-3">
                {icono && <i className={`bi ${icono} display-6 opacity-75`}></i>}
                <div className="min-w-0">
                    <div className="fw-semibold small">{titulo}</div>
                    <div className="fs-3 fw-bold lh-sm text-break" data-testid="stat-valor">{valor}</div>
                    {detalle && <small className="opacity-75">{detalle}</small>}
                </div>
            </Card.Body>
        </Card>
    );
}

export default StatCard;
