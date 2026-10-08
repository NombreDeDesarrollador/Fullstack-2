// Catálogo con filtros: búsqueda (?buscar=), categoría y orden.
// Los filtros son estado del componente; la lista se recalcula en cada render.
import React, { useState } from 'react';
import { Container, Row, Col, Form } from 'react-bootstrap';
import { useSearchParams } from 'react-router-dom';
import ProductGrid from '../../components/tienda/ProductGrid';
import { useCarrito } from '../../context/CartContext';
import { obtenerCategorias, buscarProductos, precioFinal } from '../../services/productosService';

export function ordenarProductos(productos, orden) {
    const copia = [...productos];
    if (orden === 'precio-asc') copia.sort((a, b) => precioFinal(a) - precioFinal(b));
    if (orden === 'precio-desc') copia.sort((a, b) => precioFinal(b) - precioFinal(a));
    if (orden === 'nombre') copia.sort((a, b) => a.nombre.localeCompare(b.nombre));
    return copia;
}

function Catalogo() {
    const { agregar } = useCarrito();
    const [params] = useSearchParams();
    const busqueda = params.get('buscar') || '';
    const [categoria, setCategoria] = useState('');
    const [orden, setOrden] = useState('relevancia');

    const filtrados = ordenarProductos(
        buscarProductos(busqueda).filter(p => !categoria || p.categoria === categoria),
        orden
    );

    return (
        <Container>
            <h1 className="fs-2 mb-1">Catálogo de productos</h1>
            <p className="text-muted">
                {busqueda ? <>Resultados para "<strong>{busqueda}</strong>": </> : null}
                {filtrados.length} producto{filtrados.length === 1 ? '' : 's'}
            </p>

            <Row className="g-2 mb-4 bg-white rounded-3 shadow-sm p-3 mx-0">
                <Col sm={6} md={4}>
                    <Form.Label htmlFor="filtro-categoria" className="small fw-semibold">Categoría</Form.Label>
                    <Form.Select id="filtro-categoria" value={categoria} onChange={e => setCategoria(e.target.value)}>
                        <option value="">Todas</option>
                        {obtenerCategorias().map(c => <option key={c} value={c}>{c}</option>)}
                    </Form.Select>
                </Col>
                <Col sm={6} md={4}>
                    <Form.Label htmlFor="filtro-orden" className="small fw-semibold">Ordenar por</Form.Label>
                    <Form.Select id="filtro-orden" value={orden} onChange={e => setOrden(e.target.value)}>
                        <option value="relevancia">Relevancia</option>
                        <option value="precio-asc">Menor precio</option>
                        <option value="precio-desc">Mayor precio</option>
                        <option value="nombre">Nombre (A-Z)</option>
                    </Form.Select>
                </Col>
            </Row>

            <ProductGrid productos={filtrados} onAgregar={agregar} />
        </Container>
    );
}

export default Catalogo;
