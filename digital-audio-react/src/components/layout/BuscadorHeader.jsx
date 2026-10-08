// Buscador del header. Maneja su propio estado (texto) y avisa al padre con onBuscar.
import React, { useState } from 'react';
import { Form, InputGroup, Button } from 'react-bootstrap';

function BuscadorHeader({ valorInicial = '', onBuscar }) {
    const [texto, setTexto] = useState(valorInicial);

    const enviar = (e) => {
        e.preventDefault();
        onBuscar(texto.trim());
    };

    return (
        <Form onSubmit={enviar} role="search" className="buscador-header">
            <InputGroup>
                <Form.Control
                    type="search"
                    placeholder="Buscar guitarras, pedales, micrófonos..."
                    aria-label="Buscar productos"
                    value={texto}
                    onChange={e => setTexto(e.target.value)}
                />
                <Button type="submit" variant="primary" aria-label="Buscar"><i className="bi bi-search"></i></Button>
            </InputGroup>
        </Form>
    );
}

export default BuscadorHeader;
