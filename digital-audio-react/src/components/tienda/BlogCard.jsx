import React from 'react';
import { Card, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { formatoFechaLarga } from '../../utils/formato';

// Tarjeta horizontal de un artículo del blog (se apila en celular)
function BlogCard({ blog }) {
    return (
        <Card className="border-0 shadow-sm overflow-hidden">
            <Row className="g-0">
                <Col md={5}>
                    <Link to={`/blogs/${blog.id}`}>
                        <img src={blog.imagen} alt={blog.titulo} className="img-fluid w-100 h-100 object-fit-cover blog-card-imagen" />
                    </Link>
                </Col>
                <Col md={7}>
                    <Card.Body className="p-4 d-flex flex-column h-100">
                        <small className="text-primary fw-bold">{blog.categoria}</small>
                        <Card.Title as="h2" className="fs-4 mt-1">
                            <Link to={`/blogs/${blog.id}`} className="text-dark text-decoration-none">{blog.titulo}</Link>
                        </Card.Title>
                        <small className="text-muted mb-2">
                            <i className="bi bi-calendar3 me-1"></i>{formatoFechaLarga(blog.fecha)} · {blog.lectura} de lectura
                        </small>
                        <Card.Text>{blog.resumen}</Card.Text>
                        <Link to={`/blogs/${blog.id}`} className="btn btn-primary align-self-start mt-auto">
                            Leer artículo <i className="bi bi-arrow-right"></i>
                        </Link>
                    </Card.Body>
                </Col>
            </Row>
        </Card>
    );
}

export default BlogCard;
