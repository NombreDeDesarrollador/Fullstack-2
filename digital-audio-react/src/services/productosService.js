// =====================================================================
// CRUD DE PRODUCTOS Y CATEGORÍAS (fuente de datos: src/data/productos.js)
// =====================================================================
import { productosIniciales, categoriasIniciales, ofertasIniciales } from '../data/productos';
import { leer, guardar } from './storage';

const CLAVE_PRODUCTOS = 'da_productos';
const CLAVE_CATEGORIAS = 'da_categorias';

// ---------- Leer ----------
export function obtenerProductos() {
    const guardados = leer(CLAVE_PRODUCTOS, null);
    if (Array.isArray(guardados)) return guardados;
    guardar(CLAVE_PRODUCTOS, productosIniciales);
    return productosIniciales.map(p => ({ ...p }));
}

export function obtenerProducto(codigo) {
    return obtenerProductos().find(p => p.codigo === codigo) || null;
}

// ---------- Crear ----------
export function crearProducto(producto) {
    const productos = obtenerProductos();
    if (productos.some(p => p.codigo.toLowerCase() === producto.codigo.toLowerCase())) {
        throw new Error('Ya existe un producto con ese código.');
    }
    const nuevo = { stockCritico: 0, descripcion: '', imagen: '', ...producto };
    guardar(CLAVE_PRODUCTOS, [...productos, nuevo]);
    return nuevo;
}

// ---------- Actualizar ----------
export function actualizarProducto(codigo, cambios) {
    let actualizado = null;
    const productos = obtenerProductos().map(p => {
        if (p.codigo !== codigo) return p;
        actualizado = { ...p, ...cambios, codigo };
        return actualizado;
    });
    if (!actualizado) throw new Error('Producto no encontrado.');
    guardar(CLAVE_PRODUCTOS, productos);
    return actualizado;
}

// ---------- Eliminar ----------
export function eliminarProducto(codigo) {
    const productos = obtenerProductos();
    const restantes = productos.filter(p => p.codigo !== codigo);
    guardar(CLAVE_PRODUCTOS, restantes);
    return restantes.length < productos.length;
}

// Descuenta del stock las unidades compradas (al pagar una orden)
export function descontarStock(items) {
    const productos = obtenerProductos().map(p => {
        const item = items.find(i => i.codigo === p.codigo);
        return item ? { ...p, stock: Math.max(0, p.stock - item.cantidad) } : p;
    });
    guardar(CLAVE_PRODUCTOS, productos);
}

// ---------- Reglas de negocio ----------
export function esCritico(producto) {
    return producto.stock === 0 || producto.stock <= (producto.stockCritico || 0);
}

export function productosCriticos() {
    return obtenerProductos().filter(esCritico);
}

export function descuentoProducto(producto) {
    return ofertasIniciales[producto.codigo] || 0;
}

export function precioFinal(producto) {
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
    return String(texto).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

// ---------- Categorías ----------
export function slugCategoria(nombre) {
    return normalizar(nombre).replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export function obtenerCategorias() {
    const guardadas = leer(CLAVE_CATEGORIAS, null);
    if (Array.isArray(guardadas) && guardadas.length) return guardadas;
    guardar(CLAVE_CATEGORIAS, categoriasIniciales);
    return [...categoriasIniciales];
}

export function categoriaPorSlug(slug) {
    return obtenerCategorias().find(c => slugCategoria(c) === slug) || null;
}

export function crearCategoria(nombre) {
    const categorias = obtenerCategorias();
    if (categorias.some(c => c.toLowerCase() === nombre.toLowerCase())) {
        throw new Error('Ya existe una categoría con ese nombre.');
    }
    guardar(CLAVE_CATEGORIAS, [...categorias, nombre]);
}

// Al renombrar, los productos de la categoría se mueven al nuevo nombre
export function renombrarCategoria(anterior, nuevo) {
    const categorias = obtenerCategorias();
    if (categorias.some(c => c.toLowerCase() === nuevo.toLowerCase() && c !== anterior)) {
        throw new Error('Ya existe una categoría con ese nombre.');
    }
    guardar(CLAVE_CATEGORIAS, categorias.map(c => (c === anterior ? nuevo : c)));
    guardar(CLAVE_PRODUCTOS, obtenerProductos().map(p => (p.categoria === anterior ? { ...p, categoria: nuevo } : p)));
}

export function eliminarCategoria(nombre) {
    if (obtenerProductos().some(p => p.categoria === nombre)) {
        throw new Error('No se puede eliminar una categoría que tiene productos.');
    }
    guardar(CLAVE_CATEGORIAS, obtenerCategorias().filter(c => c !== nombre));
}
