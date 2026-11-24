// =====================================================================
// PRODUCTOS Y CATEGORÍAS  (microservicio ms-productos)
//   Lectura  -> funciones síncronas que leen la caché (obtenerProductos, obtenerProducto...)
//   Carga    -> cargarProductos() / cargarCategorias() piden los datos a la API
//   Escritura-> funciones async que llaman a la API y luego recargan la caché
// =====================================================================
import { api } from './api';
import { obtener, establecer } from './cache';
import { exigirPermiso } from '../utils/permisos';

// ---------- Carga desde la API ----------
export async function cargarProductos() {
    const productos = await api('productos', '/productos', { auth: false });
    establecer('productos', productos);
    return productos;
}

export async function cargarCategorias() {
    const categorias = await api('productos', '/categorias', { auth: false });
    establecer('categorias', categorias);
    return categorias;
}

export async function recargarCatalogo() {
    await Promise.all([cargarProductos(), cargarCategorias()]);
}

// ---------- Leer (desde la caché) ----------
export function obtenerProductos() {
    return obtener('productos');
}

export function obtenerProducto(codigo) {
    const c = String(codigo || '').toUpperCase();
    return obtenerProductos().find(p => p.codigo.toUpperCase() === c) || null;
}

// ---------- Crear / actualizar / eliminar (Administrador) ----------
function cuerpoProducto(p) {
    return {
        codigo: p.codigo, nombre: p.nombre, marca: p.marca || '', categoria: p.categoria,
        precio: Number(p.precio), stock: Number(p.stock), stockCritico: Number(p.stockCritico || 0),
        descuento: Number(p.descuento || 0), descripcion: p.descripcion || '', imagen: p.imagen || ''
    };
}

export async function crearProducto(producto) {
    const creado = await api('productos', '/productos', { method: 'POST', body: cuerpoProducto(producto) });
    await recargarCatalogo();
    return creado;
}

// "cambios" puede traer solo algunos campos: se completan con el producto actual
export async function actualizarProducto(codigo, cambios) {
    const actual = obtenerProducto(codigo) || {};
    const actualizado = await api('productos', `/productos/${encodeURIComponent(codigo)}`, {
        method: 'PUT', body: cuerpoProducto({ ...actual, ...cambios, codigo })
    });
    await recargarCatalogo();
    return actualizado;
}

// Actualiza SOLO el stock. Lo pueden usar Administrador y Vendedor.
// Se valida en el navegador (para mostrar el error al tiro) y de nuevo en el backend.
export async function actualizarStock(codigo, nuevoStock, usuario) {
    exigirPermiso(usuario, 'productos:stock');
    const stock = Number(nuevoStock);
    if (nuevoStock === '' || nuevoStock === null || !Number.isInteger(stock) || stock < 0) {
        throw new Error('El stock debe ser un número entero mayor o igual a 0.');
    }
    const actualizado = await api('productos', `/productos/${encodeURIComponent(codigo)}/stock`, { method: 'PATCH', body: { stock } });
    await cargarProductos();
    return actualizado;
}

export async function eliminarProducto(codigo) {
    await api('productos', `/productos/${encodeURIComponent(codigo)}`, { method: 'DELETE' });
    await recargarCatalogo();
    return true;
}

// ---------- Reglas de negocio (se usan para mostrar datos) ----------
export function esCritico(producto) {
    return producto.stock === 0 || producto.stock <= (producto.stockCritico || 0);
}

export function productosCriticos() {
    return ordenarPorCriticidad(obtenerProductos().filter(esCritico));
}

// Nivel de urgencia: 0 = agotado, 1 = bajo el stock crítico, 2 = normal
export function nivelCriticidad(producto) {
    if (producto.stock === 0) return 0;
    return esCritico(producto) ? 1 : 2;
}

// Ordena del más crítico al menos crítico, sin modificar la lista original.
export function ordenarPorCriticidad(productos) {
    return [...productos].sort((a, b) =>
        nivelCriticidad(a) - nivelCriticidad(b) ||
        (a.stock - (a.stockCritico || 0)) - (b.stock - (b.stockCritico || 0)) ||
        a.nombre.localeCompare(b.nombre));
}

// El % de descuento viene del backend (campo "descuento" del producto)
export function descuentoProducto(producto) {
    return Number(producto && producto.descuento) || 0;
}

export function precioFinal(producto) {
    if (producto && typeof producto.precioFinal === 'number') return producto.precioFinal;
    const descuento = descuentoProducto(producto);
    return descuento ? Math.round(producto.precio * (100 - descuento) / 100) : producto.precio;
}

export function productosEnOferta() {
    return obtenerProductos().filter(p => descuentoProducto(p) > 0);
}

export function buscarProductos(texto, productos = obtenerProductos()) {
    const termino = normalizar(texto || '').trim();
    if (!termino) return productos;
    return productos.filter(p => normalizar(p.nombre).includes(termino) || normalizar(p.marca || '').includes(termino));
}

export function normalizar(texto) {
    return String(texto).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

// ---------- Categorías ----------
export function slugCategoria(nombre) {
    return normalizar(nombre).replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

// Nombres de las categorías (en el orden del backend)
export function obtenerCategorias() {
    return obtener('categorias').map(c => c.nombre);
}

function buscarCategoria(nombre) {
    const categoria = obtener('categorias').find(c => c.nombre === nombre);
    if (!categoria) throw new Error('Categoría no encontrada.');
    return categoria;
}

export function categoriaPorSlug(slug) {
    return obtenerCategorias().find(c => slugCategoria(c) === slug) || null;
}

export async function crearCategoria(nombre) {
    await api('productos', '/categorias', { method: 'POST', body: { nombre } });
    await cargarCategorias();
}

// La relación producto-categoría es por id, así que los productos "se mueven" solos
export async function renombrarCategoria(anterior, nuevo) {
    const { id } = buscarCategoria(anterior);
    await api('productos', `/categorias/${id}`, { method: 'PUT', body: { nombre: nuevo } });
    await recargarCatalogo();
}

export async function eliminarCategoria(nombre) {
    if (obtenerProductos().some(p => p.categoria === nombre)) {
        throw new Error('No se puede eliminar una categoría que tiene productos.');
    }
    const { id } = buscarCategoria(nombre);
    await api('productos', `/categorias/${id}`, { method: 'DELETE' });
    await cargarCategorias();
}
