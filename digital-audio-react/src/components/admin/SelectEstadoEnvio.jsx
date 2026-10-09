// Selector para cambiar el estado de envío de una orden (Administrador y Vendedor).
// Props: orden, usuario (sesión) y onCambio(ordenActualizada).
// Solo ofrece el estado actual y los siguientes, así no se puede retroceder.
// Si el usuario no tiene permiso o la orden fue rechazada, solo muestra el badge.
import React, { useState } from 'react';
import { Form } from 'react-bootstrap';
import EstadoEnvioBadge from '../comunes/EstadoEnvioBadge';
import { cambiarEstadoEnvio, siguientesEstadosEnvio } from '../../services/ordenesService';
import { puede } from '../../utils/permisos';

function SelectEstadoEnvio({ orden, usuario, onCambio }) {
    const [error, setError] = useState('');
    const opciones = siguientesEstadosEnvio(orden);

    if (!puede(usuario, 'ordenes:estado') || opciones.length <= 1) {
        return <EstadoEnvioBadge estado={orden.estadoEnvio} />;
    }

    const cambiar = (e) => {
        try {
            const actualizada = cambiarEstadoEnvio(orden.numero, e.target.value, usuario);
            setError('');
            onCambio(actualizada);
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <>
            <Form.Select size="sm" value={orden.estadoEnvio} onChange={cambiar} isInvalid={!!error}
                aria-label={`Estado de envío de la orden ${orden.numero}`} style={{ minWidth: 150 }}>
                {opciones.map(op => <option key={op} value={op}>{op}</option>)}
            </Form.Select>
            {error && <div className="invalid-feedback d-block">{error}</div>}
        </>
    );
}

export default SelectEstadoEnvio;
