// Inicio de sesión: valida el formulario, envía las credenciales a ms-usuarios (JWT)
// y, según el rol, redirige a la tienda, al panel o a la página que se quería abrir.
import React, { useState } from 'react';
import { Container, Card, Form, Button, Alert } from 'react-bootstrap';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import CampoFormulario from '../../components/comunes/CampoFormulario';
import { useAuth } from '../../context/AuthContext';
import { validarLogin, esValido } from '../../utils/validaciones';

function Login() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [enviando, setEnviando] = useState(false);
    const [correo, setCorreo] = useState('');
    const [clave, setClave] = useState('');
    const [errores, setErrores] = useState({});
    const [errorGeneral, setErrorGeneral] = useState('');

    const enviar = async (e) => {
        e.preventDefault();
        const nuevosErrores = validarLogin({ correo: correo.trim(), clave });
        setErrores(nuevosErrores);
        setErrorGeneral('');
        if (!esValido(nuevosErrores)) return;

        setEnviando(true);
        try {
            const usuario = await login(correo.trim(), clave);
            const desde = location.state && location.state.desde;
            const esCliente = usuario.tipoUsuario === 'Cliente';
            // Vuelve a la página que pedía sesión (ej: /checkout) si corresponde a su rol
            if (desde && (esCliente ? !desde.startsWith('/admin') : desde.startsWith('/admin'))) navigate(desde);
            else navigate(esCliente ? '/' : '/admin');
        } catch (error) {
            setErrorGeneral(error.message);
            setEnviando(false);
        }
    };

    return (
        <Container style={{ maxWidth: 460 }}>
            <Card className="border-0 shadow-sm">
                <Card.Body className="p-4 p-md-5">
                    <h1 className="fs-3 text-center mb-4">Iniciar sesión</h1>
                    {location.state && location.state.desde && !errorGeneral && (
                        <Alert variant="info" className="small py-2">Inicia sesión para continuar.</Alert>
                    )}
                    {errorGeneral && <Alert variant="danger" data-testid="error-login">{errorGeneral}</Alert>}
                    <Form onSubmit={enviar} noValidate>
                        <CampoFormulario id="correo" label="Correo" tipo="email" valor={correo} onChange={setCorreo} error={errores.correo} placeholder="nombre@gmail.com" />
                        <CampoFormulario id="clave" label="Contraseña" tipo="password" valor={clave} onChange={setClave} error={errores.clave} />
                        <Button type="submit" className="w-100" disabled={enviando}>{enviando ? 'Ingresando...' : 'Ingresar'}</Button>
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
