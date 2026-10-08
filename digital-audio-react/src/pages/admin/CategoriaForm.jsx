import React, { useState } from 'react';
import { Card, Form, Button, Alert } from 'react-bootstrap';
import { Link, useNavigate, useParams } from 'react-router-dom';
import CampoFormulario from '../../components/comunes/CampoFormulario';
import { crearCategoria, renombrarCategoria } from '../../services/productosService';

function CategoriaForm() {
    const { nombre: original } = useParams();
    const navigate = useNavigate();
    const [nombre, setNombre] = useState(original || '');
    const [error, setError] = useState('');
    const [ok, setOk] = useState(false);

    const guardar = (e) => {
        e.preventDefault();
        const valor = nombre.trim();
        if (!valor) return setError('El nombre es requerido.');
        if (valor.length > 50) return setError('Máximo 50 caracteres.');
        try {
            if (original) renombrarCategoria(original, valor);
            else crearCategoria(valor);
            setError('');
            setOk(true);
            setTimeout(() => navigate('/admin/categorias'), 700);
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <>
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h1 className="fs-3 mb-0">{original ? `Editar categoría: ${original}` : 'Nueva categoría'}</h1>
                <Link to="/admin/categorias" className="btn btn-outline-secondary">Volver</Link>
            </div>
            <Card className="border-0 shadow-sm" style={{ maxWidth: 560 }}>
                <Card.Body className="p-4">
                    {ok && <Alert variant="success">Categoría guardada correctamente.</Alert>}
                    <Form onSubmit={guardar} noValidate>
                        <CampoFormulario id="nombre" label="Nombre de la categoría" requerido valor={nombre} onChange={setNombre} error={error} maxLength={50}
                            ayuda={original ? 'Al renombrarla, sus productos se moverán al nuevo nombre.' : undefined} />
                        <Button type="submit">Guardar categoría</Button>
                    </Form>
                </Card.Body>
            </Card>
        </>
    );
}

export default CategoriaForm;
