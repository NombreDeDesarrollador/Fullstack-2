// Indicador de carga mientras llegan los datos del backend
import React from 'react';
import { Spinner } from 'react-bootstrap';

function Cargando({ texto = 'Cargando...' }) {
    return (
        <div className="text-center py-5 text-muted" role="status">
            <Spinner animation="border" size="sm" className="me-2" />
            {texto}
        </div>
    );
}

export default Cargando;
