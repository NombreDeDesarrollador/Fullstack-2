// Formulario de contacto controlado: cada campo vive en el estado del componente
import React, { useState } from 'react';
import { Container, Form, Button, Alert, Card } from 'react-bootstrap';
import CampoFormulario from '../../components/comunes/CampoFormulario';
import { validarContacto, esValido } from '../../utils/validaciones';

const vacio = { nombre: '', correo: '', comentario: '' };

function Contacto() {
    const [datos, setDatos] = useState(vacio);
    const [errores, setErrores] = useState({});
    const [enviado, setEnviado] = useState(false);

    const cambiar = campo => valor => setDatos({ ...datos, [campo]: valor });

    const enviar = (e) => {
        e.preventDefault();
        const nuevosErrores = validarContacto(datos);
        setErrores(nuevosErrores);
        if (esValido(nuevosErrores)) {
            setEnviado(true);
            setDatos(vacio);
        }
    };

    return (
        <Container style={{ maxWidth: 680 }}>
            <Card className="border-0 shadow-sm">
                <Card.Body className="p-4 p-md-5">
                    <h1 className="fs-2">Contáctanos</h1>
                    <p className="text-muted">¿Tienes dudas sobre un producto o tu compra? Escríbenos.</p>
                    {enviado && <Alert variant="success" onClose={() => setEnviado(false)} dismissible>¡Gracias! Tu mensaje fue enviado.</Alert>}
                    <Form onSubmit={enviar} noValidate>
                        <CampoFormulario id="nombre" label="Nombre completo" requerido valor={datos.nombre} onChange={cambiar('nombre')} error={errores.nombre} maxLength={100} />
                        <CampoFormulario id="correo" label="Correo" tipo="email" opcional valor={datos.correo} onChange={cambiar('correo')} error={errores.correo}
                            ayuda="Dominios permitidos: @duoc.cl, @profesor.duoc.cl, @gmail.com" />
                        <CampoFormulario id="comentario" label="Comentario" as="textarea" rows={4} requerido valor={datos.comentario}
                            onChange={cambiar('comentario')} error={errores.comentario} maxLength={500} />
                        <Button type="submit" className="w-100">Enviar mensaje</Button>
                    </Form>
                </Card.Body>
            </Card>
        </Container>
    );
}

export default Contacto;
