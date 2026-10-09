// Mi cuenta (Cliente): perfil editable y listado de sus compras. Diseño simple.
import React, { useState } from 'react';
import { Container, Card, Button, Form, Row, Col, ListGroup, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import CampoFormulario from '../../components/comunes/CampoFormulario';
import EstadoBadge from '../../components/comunes/EstadoBadge';
import EstadoEnvioBadge from '../../components/comunes/EstadoEnvioBadge';
import { useAuth } from '../../context/AuthContext';
import { ordenesPorCorreo, cantidadUnidades } from '../../services/ordenesService';
import { formatoCLP, formatoFecha } from '../../utils/formato';

function FilaDato({ label, valor }) {
    return (
        <div className="d-flex flex-column flex-sm-row py-2 border-top">
            <span className="text-muted small" style={{ width: 120 }}>{label}</span>
            <span>{valor || '-'}</span>
        </div>
    );
}

function MiCuenta() {
    const { usuario, actualizarPerfil, logout } = useAuth();
    const navigate = useNavigate();
    const [editando, setEditando] = useState(false);
    const [form, setForm] = useState({});
    const [errores, setErrores] = useState({});
    const [aviso, setAviso] = useState('');
    const compras = ordenesPorCorreo(usuario.correo);
    const pagadas = compras.filter(o => o.estado === 'Pagada');

    const abrirEdicion = () => {
        setForm({ nombre: usuario.nombre, apellidos: usuario.apellidos, telefono: usuario.telefono || '', direccion: usuario.direccion || '' });
        setErrores({});
        setAviso('');
        setEditando(true);
    };

    const guardarCambios = (e) => {
        e.preventDefault();
        const nuevos = {};
        if (!form.nombre) nuevos.nombre = 'El nombre es requerido.';
        if (!form.apellidos) nuevos.apellidos = 'Los apellidos son requeridos.';
        if (form.telefono && !/^\+?[\d\s]{8,15}$/.test(form.telefono)) nuevos.telefono = 'Teléfono no válido.';
        if (!form.direccion) nuevos.direccion = 'La dirección es requerida.';
        setErrores(nuevos);
        if (Object.keys(nuevos).length) return;
        actualizarPerfil(form);
        setEditando(false);
        setAviso('Tus datos se guardaron correctamente.');
    };

    return (
        <Container style={{ maxWidth: 760 }}>
            <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
                <div>
                    <h1 className="fs-2 mb-0">Hola, {usuario.nombre}</h1>
                    <small className="text-muted">Aquí puedes revisar tus datos y tus compras.</small>
                </div>
                <Button variant="outline-secondary" onClick={() => { logout(); navigate('/'); }}>Cerrar sesión</Button>
            </div>

            <Card className="border mb-3">
                <Card.Body>
                    <div className="d-flex justify-content-between align-items-baseline mb-2">
                        <h2 className="fs-5 mb-0">Mi perfil</h2>
                        {!editando && <Button variant="link" className="p-0" onClick={abrirEdicion}>Editar</Button>}
                    </div>
                    {aviso && <Alert variant="success" className="py-2">{aviso}</Alert>}
                    {editando ? (
                        <Form onSubmit={guardarCambios} noValidate>
                            <Row>
                                <Col sm={6}><CampoFormulario id="nombre" label="Nombre" valor={form.nombre} onChange={v => setForm({ ...form, nombre: v })} error={errores.nombre} /></Col>
                                <Col sm={6}><CampoFormulario id="apellidos" label="Apellidos" valor={form.apellidos} onChange={v => setForm({ ...form, apellidos: v })} error={errores.apellidos} /></Col>
                                <Col sm={6}><CampoFormulario id="telefono" label="Teléfono" opcional valor={form.telefono} onChange={v => setForm({ ...form, telefono: v })} error={errores.telefono} /></Col>
                                <Col sm={6}><CampoFormulario id="direccion" label="Dirección" valor={form.direccion} onChange={v => setForm({ ...form, direccion: v })} error={errores.direccion} /></Col>
                            </Row>
                            <div className="d-flex justify-content-end gap-2">
                                <Button variant="outline-secondary" onClick={() => setEditando(false)}>Cancelar</Button>
                                <Button type="submit">Guardar</Button>
                            </div>
                        </Form>
                    ) : (
                        <>
                            <FilaDato label="Nombre" valor={`${usuario.nombre} ${usuario.apellidos}`} />
                            <FilaDato label="Correo" valor={usuario.correo} />
                            <FilaDato label="RUN" valor={usuario.run} />
                            <FilaDato label="Teléfono" valor={usuario.telefono} />
                            <FilaDato label="Dirección" valor={[usuario.direccion, usuario.comuna, usuario.region].filter(Boolean).join(', ')} />
                        </>
                    )}
                </Card.Body>
            </Card>

            <Card className="border" id="compras">
                <Card.Body>
                    <div className="d-flex justify-content-between align-items-baseline mb-2">
                        <h2 className="fs-5 mb-0">Mis compras</h2>
                        {pagadas.length > 0 && <small className="text-muted">{pagadas.length} pagadas · {formatoCLP(pagadas.reduce((s, o) => s + o.total, 0))}</small>}
                    </div>
                    {compras.length === 0 ? (
                        <p className="text-muted mb-0">Aún no tienes compras. <Link to="/catalogo">Ir al catálogo</Link></p>
                    ) : (
                        <ListGroup variant="flush">
                            {compras.map(o => (
                                <ListGroup.Item key={o.numero} className="px-0 d-flex flex-wrap justify-content-between align-items-center gap-2">
                                    <div>
                                        <strong>Orden #{o.numero}</strong>
                                        <small className="d-block text-muted">{formatoFecha(o.fecha)} · {cantidadUnidades(o)} productos</small>
                                    </div>
                                    <div className="d-flex align-items-center gap-3">
                                        <EstadoBadge estado={o.estado} />
                                        {o.estadoEnvio && <EstadoEnvioBadge estado={o.estadoEnvio} />}
                                        <strong>{formatoCLP(o.total)}</strong>
                                        <Link to={`/compra/${o.estado === 'Pagada' ? 'exito' : 'error'}/${o.numero}`}>Ver detalle</Link>
                                    </div>
                                </ListGroup.Item>
                            ))}
                        </ListGroup>
                    )}
                </Card.Body>
            </Card>
        </Container>
    );
}

export default MiCuenta;
