// Perfil del Administrador / Vendedor: datos y cambio de contraseña (diseño simple)
import React, { useState } from 'react';
import { Card, Form, Row, Col, Button, Alert } from 'react-bootstrap';
import FichaUsuario from './FichaUsuario';
import CampoFormulario from '../../components/comunes/CampoFormulario';
import { useAuth } from '../../context/AuthContext';

function Perfil() {
    const { usuario, actualizarPerfil } = useAuth();
    const [form, setForm] = useState({ nombre: usuario.nombre, apellidos: usuario.apellidos, telefono: usuario.telefono || '', direccion: usuario.direccion || '', clave: '', clave2: '' });
    const [errores, setErrores] = useState({});
    const [ok, setOk] = useState(false);

    const cambiar = campo => valor => setForm(prev => ({ ...prev, [campo]: valor }));

    const guardar = (e) => {
        e.preventDefault();
        const nuevos = {};
        if (!form.nombre) nuevos.nombre = 'El nombre es requerido.';
        if (!form.apellidos) nuevos.apellidos = 'Los apellidos son requeridos.';
        if (form.telefono && !/^\+?[\d\s]{8,15}$/.test(form.telefono)) nuevos.telefono = 'Teléfono no válido.';
        if (form.clave && (form.clave.length < 4 || form.clave.length > 10)) nuevos.clave = 'Debe tener entre 4 y 10 caracteres.';
        if (form.clave !== form.clave2) nuevos.clave2 = 'Las contraseñas no coinciden.';
        setErrores(nuevos);
        setOk(false);
        if (Object.keys(nuevos).length) return;
        const { clave2, ...cambios } = form;
        actualizarPerfil(cambios);
        setForm(prev => ({ ...prev, clave: '', clave2: '' }));
        setOk(true);
    };

    return (
        <div style={{ maxWidth: 760 }}>
            <h1 className="fs-3">Mi perfil</h1>
            <FichaUsuario usuario={usuario} />
            <Card className="border">
                <Card.Body>
                    <h2 className="fs-5">Editar datos</h2>
                    {ok && <Alert variant="success" className="py-2">Datos actualizados correctamente.</Alert>}
                    <Form onSubmit={guardar} noValidate>
                        <Row>
                            <Col md={6}><CampoFormulario id="nombre" label="Nombre" valor={form.nombre} onChange={cambiar('nombre')} error={errores.nombre} /></Col>
                            <Col md={6}><CampoFormulario id="apellidos" label="Apellidos" valor={form.apellidos} onChange={cambiar('apellidos')} error={errores.apellidos} /></Col>
                            <Col md={6}><CampoFormulario id="telefono" label="Teléfono" opcional valor={form.telefono} onChange={cambiar('telefono')} error={errores.telefono} /></Col>
                            <Col md={6}><CampoFormulario id="direccion" label="Dirección" valor={form.direccion} onChange={cambiar('direccion')} /></Col>
                            <Col md={6}><CampoFormulario id="clave" label="Nueva contraseña" tipo="password" opcional valor={form.clave} onChange={cambiar('clave')} error={errores.clave} /></Col>
                            <Col md={6}><CampoFormulario id="clave2" label="Confirmar contraseña" tipo="password" valor={form.clave2} onChange={cambiar('clave2')} error={errores.clave2} /></Col>
                        </Row>
                        <Button type="submit">Guardar cambios</Button>
                    </Form>
                </Card.Body>
            </Card>
        </div>
    );
}

export default Perfil;
