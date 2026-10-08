// Nuevo / editar producto. Si la URL trae :codigo, el formulario entra en modo edición.
import React, { useState } from 'react';
import { Card, Form, Row, Col, Button, Alert } from 'react-bootstrap';
import { Link, useNavigate, useParams } from 'react-router-dom';
import CampoFormulario from '../../components/comunes/CampoFormulario';
import { validarProducto, esValido } from '../../utils/validaciones';
import { obtenerProducto, obtenerCategorias, crearProducto, actualizarProducto } from '../../services/productosService';

const vacio = { codigo: '', nombre: '', descripcion: '', marca: '', categoria: '', precio: '', stock: '', stockCritico: '', imagen: '' };

function ProductoForm() {
    const { codigo } = useParams();
    const navigate = useNavigate();
    const existente = codigo ? obtenerProducto(codigo) : null;
    const edicion = !!existente;
    const [datos, setDatos] = useState(existente ? { ...vacio, ...existente } : vacio);
    const [errores, setErrores] = useState({});
    const [mensaje, setMensaje] = useState(null);

    const cambiar = campo => valor => setDatos(prev => ({ ...prev, [campo]: valor }));

    const guardar = (e) => {
        e.preventDefault();
        const nuevosErrores = validarProducto({ ...datos, codigo: String(datos.codigo).trim(), nombre: datos.nombre.trim() });
        setErrores(nuevosErrores);
        if (!esValido(nuevosErrores)) return;

        const producto = {
            ...datos,
            codigo: String(datos.codigo).trim(),
            nombre: datos.nombre.trim(),
            precio: Number(datos.precio),
            stock: Number(datos.stock),
            stockCritico: datos.stockCritico === '' ? 0 : Number(datos.stockCritico)
        };
        try {
            if (edicion) actualizarProducto(codigo, producto);
            else crearProducto(producto);
            setMensaje({ tipo: 'success', texto: edicion ? 'Producto actualizado correctamente.' : 'Producto creado correctamente.' });
            setTimeout(() => navigate('/admin/productos'), 800);
        } catch (error) {
            setErrores({ codigo: error.message });
        }
    };

    return (
        <>
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h1 className="fs-3 mb-0">{edicion ? `Editar producto: ${codigo}` : 'Nuevo producto'}</h1>
                <Link to="/admin/productos" className="btn btn-outline-secondary">Volver</Link>
            </div>
            <Card className="border-0 shadow-sm" style={{ maxWidth: 760 }}>
                <Card.Body className="p-4">
                    {mensaje && <Alert variant={mensaje.tipo}>{mensaje.texto}</Alert>}
                    <Form onSubmit={guardar} noValidate>
                        <Row>
                            <Col md={4}><CampoFormulario id="codigo" label="Código" requerido valor={datos.codigo} onChange={cambiar('codigo')} error={errores.codigo} disabled={edicion} placeholder="GE006" /></Col>
                            <Col md={8}><CampoFormulario id="nombre" label="Nombre" requerido valor={datos.nombre} onChange={cambiar('nombre')} error={errores.nombre} /></Col>
                        </Row>
                        <CampoFormulario id="descripcion" label="Descripción" opcional as="textarea" rows={3} valor={datos.descripcion} onChange={cambiar('descripcion')} error={errores.descripcion} />
                        <Row>
                            <Col md={6}><CampoFormulario id="marca" label="Marca" valor={datos.marca} onChange={cambiar('marca')} /></Col>
                            <Col md={6}>
                                <CampoFormulario id="categoria" label="Categoría" as="select" requerido valor={datos.categoria} onChange={cambiar('categoria')} error={errores.categoria}>
                                    <option value="">-- Seleccione --</option>
                                    {obtenerCategorias().map(c => <option key={c} value={c}>{c}</option>)}
                                </CampoFormulario>
                            </Col>
                            <Col md={4}><CampoFormulario id="precio" label="Precio (CLP)" tipo="number" requerido min="0" valor={datos.precio} onChange={cambiar('precio')} error={errores.precio} /></Col>
                            <Col md={4}><CampoFormulario id="stock" label="Stock" tipo="number" requerido min="0" valor={datos.stock} onChange={cambiar('stock')} error={errores.stock} /></Col>
                            <Col md={4}><CampoFormulario id="stockCritico" label="Stock crítico" tipo="number" opcional min="0" valor={datos.stockCritico} onChange={cambiar('stockCritico')} error={errores.stockCritico} /></Col>
                        </Row>
                        <CampoFormulario id="imagen" label="URL de imagen" opcional valor={datos.imagen} onChange={cambiar('imagen')} placeholder="https://..." />
                        <Button type="submit"><i className="bi bi-check-lg me-1"></i>Guardar producto</Button>
                    </Form>
                </Card.Body>
            </Card>
        </>
    );
}

export default ProductoForm;
