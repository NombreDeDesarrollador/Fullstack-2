// Checkout (paso de pago): resumen del carrito + datos del cliente + despacho o retiro en tienda.
// Requiere sesión de Cliente (los datos se completan con los de su cuenta).
// Se envían a ms-pedidos solo los códigos y cantidades: el backend calcula precios,
// descuenta el stock y responde si el pedido quedó Pagada o Rechazada.
import React, { useState } from 'react';
import { Container, Card, Form, Row, Col, Button, Badge, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import CampoFormulario from '../../components/comunes/CampoFormulario';
import SelectRegionComuna from '../../components/comunes/SelectRegionComuna';
import ResumenOrden from '../../components/comunes/ResumenOrden';
import { useCarrito } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { validarCheckout, esValido } from '../../utils/validaciones';
import { crearOrden, TIPOS_ENTREGA } from '../../services/ordenesService';
import { cargarProductos } from '../../services/productosService';
import { formatoCLP } from '../../utils/formato';

export function PasosCompra({ paso, error = false }) {
    const pasos = ['Carrito', 'Datos de envío', error ? 'Pago rechazado' : 'Confirmación'];
    return (
        <div className="d-flex justify-content-center flex-wrap gap-2 mb-4">
            {pasos.map((texto, i) => (
                <Badge key={texto} pill className="px-3 py-2"
                    bg={error && i === 2 ? 'danger' : i < paso ? 'success' : i === paso ? 'primary' : 'secondary'}>
                    {texto}
                </Badge>
            ))}
        </div>
    );
}

function Checkout() {
    const { items, total, vaciar } = useCarrito();
    const { usuario } = useAuth();
    const navigate = useNavigate();
    const [datos, setDatos] = useState({
        nombre: usuario?.nombre || '', apellidos: usuario?.apellidos || '', correo: usuario?.correo || '',
        calle: usuario?.direccion || '', departamento: '', region: usuario?.region || '', comuna: usuario?.comuna || '',
        indicaciones: '', medioPago: 'Webpay', tipoEntrega: TIPOS_ENTREGA[0]
    });
    const [simularError, setSimularError] = useState(false);
    const [errores, setErrores] = useState({});
    const [enviando, setEnviando] = useState(false);
    const [errorGeneral, setErrorGeneral] = useState('');
    const esRetiro = datos.tipoEntrega === TIPOS_ENTREGA[1];

    const cambiar = (campo, valor) => setDatos(prev => ({ ...prev, [campo]: valor }));

    if (items.length === 0) {
        return (
            <Container className="text-center py-5">
                <i className="bi bi-cart3 display-4 text-primary"></i>
                <h1 className="fs-3 mt-2">Tu carrito está vacío</h1>
                <Link to="/catalogo" className="btn btn-primary">Ir al catálogo</Link>
            </Container>
        );
    }

    const pagar = async (e) => {
        e.preventDefault();
        // Con retiro en tienda no se pide dirección
        const nuevosErrores = validarCheckout(esRetiro ? { ...datos, calle: '-', region: '-', comuna: '-' } : datos);
        setErrores(nuevosErrores);
        setErrorGeneral('');
        if (!esValido(nuevosErrores)) return;

        setEnviando(true);
        try {
            const orden = await crearOrden({
                cliente: { nombre: datos.nombre, apellidos: datos.apellidos },
                direccion: esRetiro ? null : { calle: datos.calle, departamento: datos.departamento, region: datos.region, comuna: datos.comuna, indicaciones: datos.indicaciones },
                tipoEntrega: datos.tipoEntrega,
                medioPago: datos.medioPago,
                items: items.map(({ codigo, cantidad }) => ({ codigo, cantidad })),
                simularRechazo: simularError
            });
            cargarProductos().catch(() => {}); // el stock cambió en el backend: refrescar el catálogo
            if (orden.estado === 'Pagada') {
                vaciar();
                navigate(`/compra/exito/${orden.numero}`);
            } else {
                navigate(`/compra/error/${orden.numero}`); // el carrito se mantiene para reintentar
            }
        } catch (error) {
            setErrorGeneral(error.message);
            setEnviando(false);
        }
    };

    return (
        <Container style={{ maxWidth: 900 }}>
            <PasosCompra paso={1} />
            <Card className="border-0 shadow-sm">
                <Card.Body className="p-3 p-md-5">
                    <div className="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-3">
                        <div>
                            <h1 className="fs-3 mb-0">Carrito de compra</h1>
                            <small className="text-muted">Revisa tus productos y completa la información.</small>
                        </div>
                        <div className="bg-primary text-white rounded-3 px-3 py-2">Total a pagar: <strong>{formatoCLP(total)}</strong></div>
                    </div>
                    <ResumenOrden items={items} />

                    {errorGeneral && <Alert variant="danger" className="mt-3">{errorGeneral}</Alert>}
                    <Form onSubmit={pagar} noValidate className="mt-4">
                        <h2 className="fs-5">Información del cliente</h2>
                        {usuario && <p className="small text-success"><i className="bi bi-person-check me-1"></i>Datos completados con tu cuenta.</p>}
                        <Row>
                            <Col md={6}><CampoFormulario id="nombre" label="Nombre" requerido valor={datos.nombre} onChange={v => cambiar('nombre', v)} error={errores.nombre} /></Col>
                            <Col md={6}><CampoFormulario id="apellidos" label="Apellidos" requerido valor={datos.apellidos} onChange={v => cambiar('apellidos', v)} error={errores.apellidos} /></Col>
                            <Col md={6}><CampoFormulario id="correo" label="Correo" tipo="email" requerido valor={datos.correo} onChange={v => cambiar('correo', v)} error={errores.correo} disabled ayuda="El pedido queda asociado a tu cuenta." /></Col>
                        </Row>

                        <h2 className="fs-5 mt-2">Entrega</h2>
                        <div className="d-flex flex-wrap gap-3 mb-3">
                            {TIPOS_ENTREGA.map(tipo => (
                                <Form.Check key={tipo} type="radio" id={`entrega-${tipo}`} name="tipoEntrega" label={tipo}
                                    checked={datos.tipoEntrega === tipo} onChange={() => cambiar('tipoEntrega', tipo)}
                                    className="border rounded-3 px-5 py-2 bg-light" />
                            ))}
                        </div>
                        {esRetiro ? (
                            <Alert variant="info" className="small">
                                <i className="bi bi-shop me-1"></i>Retira tu pedido en nuestra tienda: <strong>Av. Libertad 123, Viña del Mar</strong>.
                                Te avisaremos cuando esté listo.
                            </Alert>
                        ) : (<>
                        <Row>
                            <Col md={6}><CampoFormulario id="calle" label="Calle" requerido valor={datos.calle} onChange={v => cambiar('calle', v)} error={errores.calle} placeholder="Ej: Los Crisantemos 123" /></Col>
                            <Col md={6}><CampoFormulario id="departamento" label="Departamento" opcional valor={datos.departamento} onChange={v => cambiar('departamento', v)} placeholder="Ej: 603" /></Col>
                        </Row>
                        <SelectRegionComuna region={datos.region} comuna={datos.comuna} onChange={cambiar} errores={errores} />
                        <CampoFormulario id="indicaciones" label="Indicaciones para la entrega" opcional as="textarea" rows={2}
                            valor={datos.indicaciones} onChange={v => cambiar('indicaciones', v)} placeholder="Ej: Entre calles, color del edificio, no tiene timbre." />
                        </>)}

                        <h2 className="fs-5 mt-2">Medio de pago</h2>
                        <div className="d-flex flex-wrap gap-3 mb-2">
                            {['Webpay', 'Transferencia'].map(medio => (
                                <Form.Check key={medio} type="radio" id={`medio-${medio}`} name="medioPago" label={medio}
                                    checked={datos.medioPago === medio} onChange={() => cambiar('medioPago', medio)}
                                    className="border rounded-3 px-5 py-2 bg-light" />
                            ))}
                        </div>
                        <Form.Check type="checkbox" id="simular-error" className="small text-warning-emphasis"
                            label="Simular pago rechazado (solo para demostración)"
                            checked={simularError} onChange={e => setSimularError(e.target.checked)} />

                        <div className="d-flex flex-column-reverse flex-md-row justify-content-between gap-2 mt-4">
                            <Link to="/carrito" className="btn btn-outline-secondary"><i className="bi bi-arrow-left me-1"></i>Volver al carrito</Link>
                            <Button type="submit" variant="success" size="lg" disabled={enviando}><i className="bi bi-lock-fill me-2"></i>{enviando ? 'Procesando pago...' : `Pagar ahora ${formatoCLP(total)}`}</Button>
                        </div>
                    </Form>
                </Card.Body>
            </Card>
        </Container>
    );
}

export default Checkout;
