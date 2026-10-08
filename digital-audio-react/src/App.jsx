// Rutas de la aplicación (react-router-dom).
// La tienda usa TiendaLayout; el panel usa AdminLayout protegido por rol.
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import TiendaLayout from './components/layout/TiendaLayout';
import AdminLayout from './components/admin/AdminLayout';
import RutaProtegida from './components/comunes/RutaProtegida';

import Home from './pages/tienda/Home';
import Catalogo from './pages/tienda/Catalogo';
import ProductoDetalle from './pages/tienda/ProductoDetalle';
import Categorias from './pages/tienda/Categorias';
import Ofertas from './pages/tienda/Ofertas';
import Blogs from './pages/tienda/Blogs';
import BlogDetalle from './pages/tienda/BlogDetalle';
import Nosotros from './pages/tienda/Nosotros';
import Contacto from './pages/tienda/Contacto';
import Login from './pages/tienda/Login';
import Registro from './pages/tienda/Registro';
import Carrito from './pages/tienda/Carrito';
import Checkout from './pages/tienda/Checkout';
import CompraResultado from './pages/tienda/CompraResultado';
import MiCuenta from './pages/tienda/MiCuenta';
import NoEncontrado from './pages/tienda/NoEncontrado';

import Dashboard from './pages/admin/Dashboard';
import Ordenes from './pages/admin/Ordenes';
import Boleta from './pages/admin/Boleta';
import Productos from './pages/admin/Productos';
import ProductoDetalleAdmin from './pages/admin/ProductoDetalle';
import ProductoForm from './pages/admin/ProductoForm';
import ProductosCriticos from './pages/admin/ProductosCriticos';
import CategoriasAdmin from './pages/admin/Categorias';
import CategoriaForm from './pages/admin/CategoriaForm';
import Usuarios from './pages/admin/Usuarios';
import UsuarioDetalle from './pages/admin/UsuarioDetalle';
import UsuarioForm from './pages/admin/UsuarioForm';
import Reportes from './pages/admin/Reportes';
import Perfil from './pages/admin/Perfil';

const PERSONAL = ['Administrador', 'Vendedor'];
const SOLO_ADMIN = ['Administrador'];

const soloAdmin = (elemento) => <RutaProtegida roles={SOLO_ADMIN}>{elemento}</RutaProtegida>;

function App() {
    return (
        <Routes>
            <Route element={<TiendaLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/catalogo" element={<Catalogo />} />
                <Route path="/producto/:codigo" element={<ProductoDetalle />} />
                <Route path="/categorias" element={<Categorias />} />
                <Route path="/categorias/:slug" element={<Categorias />} />
                <Route path="/ofertas" element={<Ofertas />} />
                <Route path="/blogs" element={<Blogs />} />
                <Route path="/blogs/:id" element={<BlogDetalle />} />
                <Route path="/nosotros" element={<Nosotros />} />
                <Route path="/contacto" element={<Contacto />} />
                <Route path="/login" element={<Login />} />
                <Route path="/registro" element={<Registro />} />
                <Route path="/carrito" element={<Carrito />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/compra/exito/:numero" element={<CompraResultado exito />} />
                <Route path="/compra/error/:numero" element={<CompraResultado exito={false} />} />
                <Route path="/mi-cuenta" element={<RutaProtegida roles={['Cliente']}><MiCuenta /></RutaProtegida>} />
                <Route path="*" element={<NoEncontrado />} />
            </Route>

            <Route path="/admin" element={<RutaProtegida roles={PERSONAL}><AdminLayout /></RutaProtegida>}>
                <Route index element={<Dashboard />} />
                <Route path="ordenes" element={<Ordenes />} />
                <Route path="ordenes/:numero" element={<Boleta />} />
                <Route path="productos" element={<Productos />} />
                <Route path="productos/criticos" element={<ProductosCriticos />} />
                <Route path="productos/nuevo" element={soloAdmin(<ProductoForm />)} />
                <Route path="productos/:codigo" element={<ProductoDetalleAdmin />} />
                <Route path="productos/:codigo/editar" element={soloAdmin(<ProductoForm />)} />
                <Route path="categorias" element={soloAdmin(<CategoriasAdmin />)} />
                <Route path="categorias/nueva" element={soloAdmin(<CategoriaForm />)} />
                <Route path="categorias/:nombre/editar" element={soloAdmin(<CategoriaForm />)} />
                <Route path="usuarios" element={soloAdmin(<Usuarios />)} />
                <Route path="usuarios/nuevo" element={soloAdmin(<UsuarioForm />)} />
                <Route path="usuarios/:run" element={soloAdmin(<UsuarioDetalle />)} />
                <Route path="usuarios/:run/editar" element={soloAdmin(<UsuarioForm />)} />
                <Route path="reportes" element={soloAdmin(<Reportes />)} />
                <Route path="perfil" element={<Perfil />} />
            </Route>
        </Routes>
    );
}

export default App;
