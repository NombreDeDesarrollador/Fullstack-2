import React, { useState } from 'react';
import { Card, Form, Row, Col, Button, Alert } from 'react-bootstrap';
import { Link, useNavigate, useParams } from 'react-router-dom';
import CampoFormulario from '../../components/comunes/CampoFormulario';
import SelectRegionComuna from '../../components/comunes/SelectRegionComuna';
import { validarUsuario, esValido } from '../../utils/validaciones';
import { buscarUsuarioPorRun, buscarUsuarioPorCorreo, crearUsuario, actualizarUsuario } from '../../services/usuariosService';
import { tiposUsuario } from '../../data/usuarios';

const vacio = { run: '', nombre: '', apellidos: '', correo: '', clave: '', telefono: '', region: '', comuna: '', direccion: '', tipoUsuario: 'Cliente' };

function UsuarioForm() {
    const { run } = useParams();
    const navigate = useNavigate();
    const existente = run ? buscarUsuarioPorRun(run) : null;
    const edicion = !!existente;
    const [datos, setDatos] = useState(existente ? { ...vacio, ...existente, clave: '' } : vacio);
    const [errores, setErrores] = useState({});
    const [ok, setOk] = useState(false);

    const cambiar = (campo, valor) => setDatos(prev => ({ ...prev, [campo]: valor }));

    const guardar = (e) => {
        e.preventDefault();
        const limpios = { ...datos, run: datos.run.trim().toUpperCase(), correo: datos.correo.trim() };
        const nuevos = validarUsuario(limpios, { edicion });
        const otro = buscarUsuarioPorCorreo(limpios.correo);
        if (!nuevos.correo && otro && otro.run !== run) nuevos.correo = 'Ya existe un usuario con ese correo.';
        setErrores(nuevos);
        if (!esValido(nuevos)) return;
        try {
            if (edicion) actualizarUsuario(run, limpios);
            else crearUsuario(limpios);
            setOk(true);
            setTimeout(() => navigate('/admin/usuarios'), 800);
        } catch (err) {
            setErrores({ run: err.message });
        }
    };

    return (
        <>
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h1 className="fs-3 mb-0">{edicion ? `Editar usuario: ${existente.nombre}` : 'Nuevo usuario'}</h1>
                <Link to="/admin/usuarios" className="btn btn-outline-secondary">Volver</Link>
            </div>
            <Card className="border-0 shadow-sm" style={{ maxWidth: 760 }}>
                <Card.Body className="p-4">
                    {ok && <Alert variant="success">Usuario guardado correctamente.</Alert>}
                    <Form onSubmit={guardar} noValidate>
                        <Row>
                            <Col md={6}><CampoFormulario id="run" label="RUN" requerido disabled={edicion} valor={datos.run} onChange={v => cambiar('run', v)} error={errores.run} ayuda="Sin puntos ni guion" /></Col>
                            <Col md={6}>
                                <CampoFormulario id="tipoUsuario" label="Tipo de usuario" as="select" requerido valor={datos.tipoUsuario} onChange={v => cambiar('tipoUsuario', v)}>
                                    {tiposUsuario.map(t => <option key={t}>{t}</option>)}
                                </CampoFormulario>
                            </Col>
                            <Col md={6}><CampoFormulario id="nombre" label="Nombre" requerido valor={datos.nombre} onChange={v => cambiar('nombre', v)} error={errores.nombre} /></Col>
                            <Col md={6}><CampoFormulario id="apellidos" label="Apellidos" requerido valor={datos.apellidos} onChange={v => cambiar('apellidos', v)} error={errores.apellidos} /></Col>
                            <Col md={6}><CampoFormulario id="correo" label="Correo" tipo="email" requerido valor={datos.correo} onChange={v => cambiar('correo', v)} error={errores.correo} /></Col>
                            <Col md={6}><CampoFormulario id="clave" label="Contraseña" tipo="password" requerido={!edicion} valor={datos.clave} onChange={v => cambiar('clave', v)} error={errores.clave}
                                ayuda={edicion ? 'Déjala en blanco para mantener la actual' : 'Entre 4 y 10 caracteres'} /></Col>
                        </Row>
                        <SelectRegionComuna region={datos.region} comuna={datos.comuna} onChange={cambiar} errores={errores} />
                        <CampoFormulario id="direccion" label="Dirección" requerido valor={datos.direccion} onChange={v => cambiar('direccion', v)} error={errores.direccion} />
                        <Button type="submit"><i className="bi bi-check-lg me-1"></i>Guardar usuario</Button>
                    </Form>
                </Card.Body>
            </Card>
        </>
    );
}

export default UsuarioForm;
