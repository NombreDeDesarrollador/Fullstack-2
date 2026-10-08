import React from 'react';
import { Container } from 'react-bootstrap';
import BlogCard from '../../components/tienda/BlogCard';
import { blogs } from '../../data/blogs';

function Blogs() {
    return (
        <Container style={{ maxWidth: 1000 }}>
            <div className="text-center mb-4">
                <small className="text-primary fw-bold">NOTICIAS Y CONSEJOS</small>
                <h1 className="fs-2">Blog Digital Audio</h1>
                <p className="text-muted">Guías y recomendaciones para músicos de todos los niveles.</p>
            </div>
            <div className="d-flex flex-column gap-4">
                {blogs.map(b => <BlogCard key={b.id} blog={b} />)}
            </div>
        </Container>
    );
}

export default Blogs;
