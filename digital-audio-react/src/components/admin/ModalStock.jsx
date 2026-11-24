// Modal para actualizar el stock de un producto (solo Administrador).
// Props: producto (o null para ocultarlo), usuario (sesión), onCerrar, onGuardado(productoActualizado).
// Estado propio: el valor que se escribe y el mensaje de error.
// La validación del permiso se hace en el servicio actualizarStock() y de nuevo en el backend (PATCH /productos/{codigo}/stock).
// El padre le pasa key={producto.codigo} para que el estado se reinicie con cada producto.
import React, { useState } from 'react';
import { Modal, Form, Button } from 'react-bootstrap';
import { actualizarStock } from '../../services/productosService';

function ModalStock({ producto, usuario, onCerrar, onGuardado }) {
    const [valor, setValor] = useState(producto ? String(producto.stock) : '');
    const [error, setError] = useState('');
    const [guardando, setGuardando] = useState(false);

    const guardar = async (e) => {
        e.preventDefault();
        setGuardando(true);
        try {
            const actualizado = await actualizarStock(producto.codigo, valor, usuario);
            onGuardado(actualizado);
        } catch (err) {
            setError(err.message);
            setGuardando(false);
        }
    };

    return (
        <Modal show={!!producto} onHide={onCerrar} centered>
            <Form onSubmit={guardar} noValidate>
                <Modal.Header closeButton><Modal.Title className="fs-5">Actualizar stock</Modal.Title></Modal.Header>
                <Modal.Body>
                    <p className="mb-2"><strong>{producto?.nombre}</strong> <small className="text-muted">({producto?.codigo})</small></p>
                    <p className="small text-muted">Stock actual: {producto?.stock} · Stock crítico: {producto?.stockCritico || 0}</p>
                    <Form.Group controlId="nuevo-stock">
                        <Form.Label>Nuevo stock</Form.Label>
                        <Form.Control type="number" min="0" step="1" value={valor} isInvalid={!!error}
                            onChange={e => setValor(e.target.value)} autoFocus />
                        <Form.Control.Feedback type="invalid">{error}</Form.Control.Feedback>
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={onCerrar}>Cancelar</Button>
                    <Button type="submit" variant="primary" disabled={guardando}>Guardar stock</Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
}

export default ModalStock;
