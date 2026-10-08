// Inicio de sesión: valida el formulario y, según el rol, redirige a la tienda o al panel
import React, { useState } from 'react';
import { Container, Card, Form, Button, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import CampoFormulario from '../../components/comunes/CampoFormulario';
import { useAuth } from '../../context/AuthContext';
import { validarLogin, esValido } from '../../utils/validaciones';

function Login() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [correo, setCorreo] = useState('');
    const [clave, setClave] = useState('');
    const [errores, setErrores] = useState({});
    const [errorGeneral, setErrorGeneral] = useState('');

    const enviar = (e) => {
        e.preventDefault();
        const nuevosErrores = validarLogin({ correo: correo.trim(), clave });
        setErrores(nuevosErrores);
        setErrorGeneral('');
        if (!esValido(nuevosErrores)) return;

        const usuario = login(correo.trim(), clave);
        if (!usuario) {
            setErrorGeneral('Correo o contraseña incorrectos.');
            return;
        }
        navigate(usuario.tipoUsuario === 'Cliente' ? '/' : '/admin');
    };

    return (
        <Container style={{ maxWidth: 460 }}>
            <Card className="border-0 shadow-sm">
                <Card.Body className="p-4 p-md-5">
                    <h1 className="fs-3 text-center mb-4">Iniciar sesión</h1>
                    {errorGeneral && <Alert variant="danger" data-testid="error-login">{errorGeneral}</Alert>}
                    <Form onSubmit={enviar} noValidate>
                        <CampoFormulario id="correo" label="Correo" tipo="email" valor={correo} onChange={setCorreo} error={errores.correo} placeholder="nombre@gmail.com" />
                        <CampoFormulario id="clave" label="Contraseña" tipo="password" valor={clave} onChange={setClave} error={errores.clave} />
                        <Button type="submit" className="w-100">Ingresar</Button>
                    </Form>
                    <p className="text-center small mt-3 mb-0">¿No tienes cuenta? <Link to="/registro">Regístrate</Link></p>
                    <Alert variant="light" className="small mt-3 mb-0 border">
                        <strong>Usuarios de prueba:</strong><br />
                        cliente@gmail.com / cliente1<br />
                        vendedor@duoc.cl / venta1<br />
                        admin@duoc.cl / admin1
                    </Alert>
                </Card.Body>
            </Card>
        </Container>
    );
}

export default Login;
