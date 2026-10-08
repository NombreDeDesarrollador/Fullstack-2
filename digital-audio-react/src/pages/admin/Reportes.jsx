import React from 'react';
import { Row, Col, Card, Table, Button } from 'react-bootstrap';
import StatCard from '../../components/admin/StatCard';
import BarrasReporte from '../../components/admin/BarrasReporte';
import { obtenerOrdenes, cantidadUnidades } from '../../services/ordenesService';
import { obtenerProductos, obtenerCategorias } from '../../services/productosService';
import { formatoCLP } from '../../utils/formato';

// Cálculo puro de los indicadores (exportado para probarlo)
export function calcularReporte(ordenes, productos) {
    const pagadas = ordenes.filter(o => o.estado === 'Pagada');
    const ventas = pagadas.reduce((s, o) => s + o.total, 0);
    const porCategoria = {};
    const porProducto = {};
    const porMes = {};
    pagadas.forEach(o => {
        const mes = o.fecha.slice(0, 7);
        porMes[mes] = (porMes[mes] || 0) + o.total;
        o.items.forEach(i => {
            const categoria = productos.find(p => p.codigo === i.codigo)?.categoria || 'Otros';
            porCategoria[categoria] = (porCategoria[categoria] || 0) + i.precio * i.cantidad;
            porProducto[i.codigo] = porProducto[i.codigo] || { nombre: i.nombre, unidades: 0, ingresos: 0 };
            porProducto[i.codigo].unidades += i.cantidad;
            porProducto[i.codigo].ingresos += i.precio * i.cantidad;
        });
    });
    return {
        ventas,
        cantidadPagadas: pagadas.length,
        ticketPromedio: pagadas.length ? Math.round(ventas / pagadas.length) : 0,
        unidades: pagadas.reduce((s, o) => s + cantidadUnidades(o), 0),
        porCategoria: Object.entries(porCategoria).map(([etiqueta, valor]) => ({ etiqueta, valor })).sort((a, b) => b.valor - a.valor),
        porMes: Object.keys(porMes).sort().map(m => ({ etiqueta: m, valor: porMes[m] })),
        topProductos: Object.values(porProducto).sort((a, b) => b.unidades - a.unidades || b.ingresos - a.ingresos).slice(0, 5)
    };
}

function nombreMes(clave) {
    const texto = new Date(clave + '-15T12:00:00').toLocaleDateString('es-CL', { month: 'long', year: 'numeric' });
    return texto.charAt(0).toUpperCase() + texto.slice(1);
}

function Reportes() {
    const productos = obtenerProductos();
    const r = calcularReporte(obtenerOrdenes(), productos);

    return (
        <>
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h1 className="fs-3 mb-0">Reportes</h1>
                <Button variant="outline-secondary" className="no-imprimir" onClick={() => window.print()}><i className="bi bi-printer me-1"></i>Imprimir</Button>
            </div>
            <Row xs={1} sm={2} xl={4} className="g-3 mb-4">
                <Col><StatCard titulo="Ventas totales" valor={formatoCLP(r.ventas)} icono="bi-cash-stack" variante="primary" /></Col>
                <Col><StatCard titulo="Órdenes pagadas" valor={r.cantidadPagadas} icono="bi-bag-check" variante="success" /></Col>
                <Col><StatCard titulo="Ticket promedio" valor={formatoCLP(r.ticketPromedio)} icono="bi-receipt" variante="warning" /></Col>
                <Col><StatCard titulo="Unidades vendidas" valor={r.unidades} icono="bi-boxes" variante="info" /></Col>
            </Row>
            <Row className="g-3 mb-3">
                <Col lg={6}><Card className="border-0 shadow-sm h-100"><Card.Body><h2 className="fs-5">Ventas por categoría</h2><BarrasReporte datos={r.porCategoria} formato={formatoCLP} /></Card.Body></Card></Col>
                <Col lg={6}><Card className="border-0 shadow-sm h-100"><Card.Body><h2 className="fs-5">Ventas por mes</h2><BarrasReporte datos={r.porMes.map(m => ({ ...m, etiqueta: nombreMes(m.etiqueta) }))} formato={formatoCLP} /></Card.Body></Card></Col>
            </Row>
            <Row className="g-3">
                <Col lg={6}>
                    <Card className="border-0 shadow-sm h-100"><Card.Body>
                        <h2 className="fs-5">Productos más vendidos</h2>
                        <Table size="sm" responsive className="mb-0">
                            <thead><tr><th>#</th><th>Producto</th><th>Unid.</th><th>Ingresos</th></tr></thead>
                            <tbody>{r.topProductos.map((p, i) => <tr key={p.nombre}><td>{i + 1}</td><td>{p.nombre}</td><td>{p.unidades}</td><td>{formatoCLP(p.ingresos)}</td></tr>)}</tbody>
                        </Table>
                    </Card.Body></Card>
                </Col>
                <Col lg={6}>
                    <Card className="border-0 shadow-sm h-100"><Card.Body>
                        <h2 className="fs-5">Inventario por categoría</h2>
                        <Table size="sm" responsive className="mb-0">
                            <thead><tr><th>Categoría</th><th>Prod.</th><th>Unid.</th><th>Valorizado</th></tr></thead>
                            <tbody>
                                {obtenerCategorias().map(c => {
                                    const lista = productos.filter(p => p.categoria === c);
                                    return <tr key={c}><td>{c}</td><td>{lista.length}</td><td>{lista.reduce((s, p) => s + p.stock, 0)}</td><td>{formatoCLP(lista.reduce((s, p) => s + p.stock * p.precio, 0))}</td></tr>;
                                })}
                            </tbody>
                        </Table>
                    </Card.Body></Card>
                </Col>
            </Row>
        </>
    );
}

export default Reportes;
