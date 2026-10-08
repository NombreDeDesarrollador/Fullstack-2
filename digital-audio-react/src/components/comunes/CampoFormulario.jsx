// Campo de formulario reutilizable (label + input + mensaje de error) con React Bootstrap
import React from 'react';
import { Form } from 'react-bootstrap';

function CampoFormulario({ id, label, tipo = 'text', valor, onChange, error, requerido = false, opcional = false, ayuda, as, children, ...resto }) {
    return (
        <Form.Group className="mb-3" controlId={id}>
            <Form.Label className="fw-semibold small mb-1">
                {label}
                {requerido && <span className="text-danger ms-1">*</span>}
                {opcional && <span className="text-muted fw-normal ms-1">(opcional)</span>}
            </Form.Label>
            {as === 'select' ? (
                <Form.Select value={valor} onChange={e => onChange(e.target.value)} isInvalid={!!error} {...resto}>
                    {children}
                </Form.Select>
            ) : (
                <Form.Control
                    type={tipo}
                    as={as}
                    value={valor}
                    onChange={e => onChange(e.target.value)}
                    isInvalid={!!error}
                    {...resto}
                />
            )}
            {ayuda && !error && <Form.Text muted>{ayuda}</Form.Text>}
            <Form.Control.Feedback type="invalid">{error}</Form.Control.Feedback>
        </Form.Group>
    );
}

export default CampoFormulario;
