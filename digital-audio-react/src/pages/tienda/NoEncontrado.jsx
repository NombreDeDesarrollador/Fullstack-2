import React from 'react';
import { Container } from 'react-bootstrap';
import { Link } from 'react-router-dom';

function NoEncontrado() {
    return (
        <Container className="text-center py-5">
            <h1 className="display-4">404</h1>
            <p>La página que buscas no existe.</p>
            <Link to="/" className="btn btn-primary">Volver al inicio</Link>
        </Container>
    );
}

export default NoEncontrado;
