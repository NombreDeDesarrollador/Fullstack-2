// Registro de clientes con validación de RUN, correo, contraseñas y región/comuna
import React, { useState } from 'react';
import { Container, Card, Form, Button, Row, Col, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import CampoFormulario from '../../components/comunes/CampoFormulario';
import SelectRegionComuna from '../../components/comunes/SelectRegionComuna';
import { validarUsuario, esValido, limpiarRun } from '../../utils/validaciones';
import { crearUsuario } from '../../services/usuariosService';

const vacio = { run: '', nombre: '', apellidos: '', correo: '', correo2: '', clave: '', clave2: '', telefono: '', region: '', comuna: '', direccion: '' };

function Registro() {
    const navigate = useNavigate();
    const [datos, setDatos] = useState(vacio);
    const [errores, setErrores] = useState({});
    const [exito, setExito] = useState(false);

    const cambiar = (campo, valor) => setDatos(prev => ({ ...prev, [campo]: valor }));

    const enviar = (e) => {
        e.preventDefault();
        const limpios = { ...datos, run: limpiarRun(datos.run), correo: datos.correo.trim(), correo2: datos.correo2.trim() };
        const nuevosErrores = validarUsuario(limpios, { confirmar: true });
        setErrores(nuevosErrores);
        if (!esValido(nuevosErrores)) return;
        try {
            const { correo2, clave2, ...usuario } = limpios;
            crearUsuario({ ...usuario, tipoUsuario: 'Cliente' });
            setExito(true);
            setTimeout(() => navigate('/login'), 1500);
        } catch (error) {
            setErrores({ [error.message.includes('RUN') ? 'run' : 'correo']: error.message });
        }
    };

    return (
        <Container style={{ maxWidth: 760 }}>
            <Card className="border-0 shadow-sm">
                <Card.Body className="p-4 p-md-5">
                    <h1 className="fs-3 mb-1">Crear cuenta</h1>
                    <p className="text-muted">Regístrate para comprar más rápido y ver tus pedidos.</p>
                    {exito && <Alert variant="success">¡Registro exitoso! Redirigiendo al inicio de sesión...</Alert>}
                    <Form onSubmit={enviar} noValidate>
                        <Row>
                            <Col md={6}><CampoFormulario id="run" label="RUN" requerido valor={datos.run} onChange={v => cambiar('run', v)} error={errores.run} placeholder="19011029K" ayuda="Ej: 19.011.029-K o 19011029K" /></Col>
                            <Col md={6}><CampoFormulario id="telefono" label="Teléfono" tipo="tel" opcional valor={datos.telefono} onChange={v => cambiar('telefono', v)} error={errores.telefono} /></Col>
                            <Col md={6}><CampoFormulario id="nombre" label="Nombre" requerido valor={datos.nombre} onChange={v => cambiar('nombre', v)} error={errores.nombre} /></Col>
                            <Col md={6}><CampoFormulario id="apellidos" label="Apellidos" requerido valor={datos.apellidos} onChange={v => cambiar('apellidos', v)} error={errores.apellidos} /></Col>
                            <Col md={6}><CampoFormulario id="correo" label="Correo" tipo="email" requerido valor={datos.correo} onChange={v => cambiar('correo', v)} error={errores.correo} /></Col>
                            <Col md={6}><CampoFormulario id="correo2" label="Confirmar correo" tipo="email" requerido valor={datos.correo2} onChange={v => cambiar('correo2', v)} error={errores.correo2} /></Col>
                            <Col md={6}><CampoFormulario id="clave" label="Contraseña" tipo="password" requerido valor={datos.clave} onChange={v => cambiar('clave', v)} error={errores.clave} ayuda="Entre 4 y 10 caracteres" /></Col>
                            <Col md={6}><CampoFormulario id="clave2" label="Confirmar contraseña" tipo="password" requerido valor={datos.clave2} onChange={v => cambiar('clave2', v)} error={errores.clave2} /></Col>
                        </Row>
                        <SelectRegionComuna region={datos.region} comuna={datos.comuna} onChange={cambiar} errores={errores} />
                        <CampoFormulario id="direccion" label="Dirección" requerido valor={datos.direccion} onChange={v => cambiar('direccion', v)} error={errores.direccion} />
                        <Button type="submit" className="w-100" disabled={exito}>Registrarme</Button>
                    </Form>
                    <p className="text-center small mt-3 mb-0">¿Ya tienes una cuenta? <Link to="/login">Inicia sesión</Link></p>
                </Card.Body>
            </Card>
        </Container>
    );
}

export default Registro;
