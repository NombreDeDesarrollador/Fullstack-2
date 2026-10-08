import React from 'react';
import { Container, Card, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import CartItem from '../../components/tienda/CartItem';
import { useCarrito } from '../../context/CartContext';
import { formatoCLP } from '../../utils/formato';

function Carrito() {
    const { items, total, cambiarCantidad, eliminar, vaciar } = useCarrito();
    const navigate = useNavigate();

    return (
        <Container style={{ maxWidth: 920 }}>
            <Card className="border-0 shadow-sm">
                <Card.Body className="p-3 p-md-5">
                    <div className="d-flex justify-content-between align-items-center border-bottom pb-3">
                        <div>
                            <small className="text-primary fw-bold">DIGITAL AUDIO</small>
                            <h1 className="fs-2 mb-0">Tu carrito de compras</h1>
                        </div>
                        <i className="bi bi-bag-heart display-5 text-primary"></i>
                    </div>

                    {items.length === 0 ? (
                        <div className="text-center py-5" data-testid="carrito-vacio">
                            <i className="bi bi-cart3 display-4 text-primary"></i>
                            <h2 className="fs-4 mt-2">Tu carrito está vacío</h2>
                            <p className="text-muted">Agrega instrumentos o accesorios para verlos aquí.</p>
                            <Link to="/catalogo" className="btn btn-primary">Ir al catálogo</Link>
                        </div>
                    ) : (
                        <>
                            {items.map(item => (
                                <CartItem key={item.codigo} item={item} onCambiarCantidad={cambiarCantidad} onEliminar={eliminar} />
                            ))}
                            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 pt-4">
                                <div>
                                    <span className="text-muted d-block">Total de tu pedido</span>
                                    <strong className="fs-2" data-testid="total-carrito">{formatoCLP(total)}</strong>
                                </div>
                                <div className="d-grid d-md-flex gap-2">
                                    <Button variant="outline-secondary" onClick={vaciar}><i className="bi bi-trash3 me-1"></i>Vaciar carrito</Button>
                                    <Button size="lg" onClick={() => navigate('/checkout')}><i className="bi bi-credit-card me-2"></i>Ir a pagar</Button>
                                </div>
                            </div>
                        </>
                    )}
                </Card.Body>
            </Card>
        </Container>
    );
}

export default Carrito;
