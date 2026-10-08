import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { Link, useParams } from 'react-router-dom';
import BlogCard from '../../components/tienda/BlogCard';
import { blogs, buscarBlog } from '../../data/blogs';
import { obtenerProducto, precioFinal } from '../../services/productosService';
import { formatoCLP, formatoFechaLarga } from '../../utils/formato';

function BloqueContenido({ bloque }) {
    if (bloque.tipo === 'h2') return <h2 className="fs-4 mt-4 border-start border-4 border-primary ps-2">{bloque.texto}</h2>;
    if (bloque.tipo === 'lista') return <ul>{bloque.items.map(i => <li key={i}>{i}</li>)}</ul>;
    return <p>{bloque.texto}</p>;
}

function BlogDetalle() {
    const { id } = useParams();
    const blog = buscarBlog(id);

    if (!blog) {
        return (
            <Container className="text-center py-5">
                <h1 className="fs-3">Artículo no encontrado</h1>
                <Link to="/blogs" className="btn btn-primary">Ver todos los artículos</Link>
            </Container>
        );
    }

    const relacionados = blog.productosRelacionados.map(obtenerProducto).filter(Boolean);

    return (
        <Container style={{ maxWidth: 880 }}>
            <article className="bg-white rounded-4 shadow-sm p-4 p-md-5 mb-5">
                <Link to="/blogs" className="d-inline-block mb-3"><i className="bi bi-arrow-left me-1"></i>Volver al blog</Link>
                <small className="d-block text-primary fw-bold">{blog.categoria}</small>
                <h1 className="fs-2">{blog.titulo}</h1>
                <p className="text-muted small">{blog.autor} · {formatoFechaLarga(blog.fecha)} · {blog.lectura} de lectura</p>
                <img src={blog.imagen} alt={blog.titulo} className="img-fluid rounded-3 mb-4 w-100 blog-detalle-imagen" />
                <div className="lh-lg">{blog.contenido.map((b, i) => <BloqueContenido key={i} bloque={b} />)}</div>

                {relacionados.length > 0 && (
                    <>
                        <h2 className="fs-4 mt-4">Productos recomendados</h2>
                        <Row xs={1} sm={3} className="g-3">
                            {relacionados.map(p => (
                                <Col key={p.codigo}>
                                    <Card as={Link} to={`/producto/${p.codigo}`} className="h-100 text-center text-decoration-none p-2">
                                        <Card.Img src={p.imagen} alt={p.nombre} className="tarjeta-categoria-imagen" />
                                        <Card.Body className="p-2">
                                            <div className="small text-dark">{p.nombre}</div>
                                            <strong className="text-danger">{formatoCLP(precioFinal(p))}</strong>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            ))}
                        </Row>
                    </>
                )}
            </article>

            <h2 className="fs-4 mb-3">Sigue leyendo</h2>
            {blogs.filter(b => b.id !== blog.id).map(b => <BlogCard key={b.id} blog={b} />)}
        </Container>
    );
}

export default BlogDetalle;
