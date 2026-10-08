// Ficha simple de un usuario (se usa en Detalle de usuario y en Perfil)
import React from 'react';
import { Card } from 'react-bootstrap';

function FichaUsuario({ usuario, acciones }) {
    const filas = [
        ['Correo', usuario.correo], ['RUN', usuario.run], ['Teléfono', usuario.telefono],
        ['Dirección', [usuario.direccion, usuario.comuna, usuario.region].filter(Boolean).join(', ')]
    ];
    return (
        <Card className="border mb-3">
            <Card.Body>
                <div className="d-flex justify-content-between align-items-baseline mb-2">
                    <h2 className="fs-5 mb-0">{usuario.nombre} {usuario.apellidos} <small className="text-muted fw-normal fs-6">· {usuario.tipoUsuario}</small></h2>
                    {acciones}
                </div>
                {filas.map(([label, valor]) => (
                    <div key={label} className="d-flex flex-column flex-sm-row py-2 border-top">
                        <span className="text-muted small" style={{ width: 120 }}>{label}</span>
                        <span>{valor || '-'}</span>
                    </div>
                ))}
            </Card.Body>
        </Card>
    );
}

export default FichaUsuario;
