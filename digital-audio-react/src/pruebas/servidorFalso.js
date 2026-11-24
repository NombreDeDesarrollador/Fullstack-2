// =====================================================================
// BACKEND FALSO PARA LAS PRUEBAS (mock de fetch)
// Simula los 3 microservicios en memoria con las mismas rutas, códigos HTTP y
// reglas principales que el backend Spring Boot. Así las pruebas de React no
// necesitan tener el backend encendido y siempre parten con los mismos datos.
// =====================================================================
import { productosIniciales, categoriasIniciales, ofertasIniciales } from '../data/productos';
import { usuariosIniciales } from '../data/usuarios';
import { ordenesIniciales } from '../data/ordenes';
import { establecer, limpiar } from '../services/cache';
import { guardarSesion } from '../services/sesion';

const ESTADOS_ENVIO = ['En preparación', 'Despachado', 'Entregado'];
const copiar = (x) => JSON.parse(JSON.stringify(x));

let db;

// ---------------------------------------------------------------- tokens falsos (sin firma)
function base64url(obj) {
    return btoa(unescape(encodeURIComponent(JSON.stringify(obj)))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function tokenFalso(usuario, tipo = 'access', segundos = 900) {
    const payload = {
        sub: usuario.correo, run: usuario.run, nombre: usuario.nombre, rol: usuario.tipoUsuario, tipo,
        exp: Math.floor(Date.now() / 1000) + segundos
    };
    return `${base64url({ alg: 'none' })}.${base64url(payload)}.firma`;
}

// Deja guardada una sesión válida (como si el usuario hubiera hecho login)
export function iniciarSesionFalsa(usuario) {
    if (!usuario) return;
    guardarSesion({ accessToken: tokenFalso(usuario), refreshToken: tokenFalso(usuario, 'refresh', 86400), usuario: publico(usuario) });
}

function leerToken(headers) {
    const auth = headers && headers.Authorization;
    if (!auth) return null;
    try {
        const payload = JSON.parse(decodeURIComponent(escape(atob(auth.slice(7).split('.')[1].replace(/-/g, '+').replace(/_/g, '/')))));
        if (payload.tipo !== 'access' || payload.exp * 1000 < Date.now()) return null;
        return payload;
    } catch (e) {
        return null;
    }
}

// ---------------------------------------------------------------- formatos de salida
function publico(u) {
    const { clave, ...resto } = u;
    return { activo: true, telefono: '', ...resto };
}

function productoDTO(p) {
    const descuento = p.descuento || 0;
    const precioFinal = descuento ? Math.round(p.precio * (100 - descuento) / 100) : p.precio;
    return { stockCritico: 0, descripcion: '', imagen: '', marca: '', ...p, descuento, precioFinal, critico: p.stock === 0 || p.stock <= (p.stockCritico || 0) };
}

function categoriasDTO() {
    return db.categorias.map(c => ({ ...c, cantidadProductos: db.productos.filter(p => p.categoria === c.nombre).length }));
}

function respuestaAuth(u) {
    return { accessToken: tokenFalso(u), refreshToken: tokenFalso(u, 'refresh', 86400), tipo: 'Bearer', expiraEnSegundos: 900, usuario: publico(u) };
}

const totalItems = (items) => items.reduce((s, i) => s + i.precio * i.cantidad, 0);

// ---------------------------------------------------------------- estado inicial
export function reiniciarServidor() {
    db = {
        productos: productosIniciales.map(p => ({ ...p, descuento: ofertasIniciales[p.codigo] || 0 })),
        categorias: categoriasIniciales.map((nombre, i) => ({ id: i + 1, nombre })),
        usuarios: copiar(usuariosIniciales).map(u => ({ activo: true, ...u })),
        ordenes: copiar(ordenesIniciales).map(o => ({
            tipoEntrega: 'Despacho a domicilio', motivo: '', ...o,
            estadoEnvio: o.estado === 'Pagada' ? (o.estadoEnvio || ESTADOS_ENVIO[0]) : null,
            total: totalItems(o.items)
        })),
        siguienteNumero: 100001
    };
}

// Carga la caché del frontend con los datos del servidor falso (como si SincronizarDatos ya hubiera terminado)
export function precargarCache() {
    limpiar();
    establecer('productos', db.productos.map(productoDTO));
    establecer('categorias', categoriasDTO());
    establecer('ordenes', copiar(db.ordenes));
    establecer('usuarios', db.usuarios.map(publico));
}

export function datosServidor() {
    return db;
}

// ---------------------------------------------------------------- router de rutas
const error = (status, mensaje, errores) => ({ status, body: { status, mensaje, errores } });
const ok = (body, status = 200) => ({ status, body });

function manejar(servicio, metodo, ruta, body, yo) {
    const esPersonal = yo && ['Administrador', 'Vendedor'].includes(yo.rol);
    const esAdmin = yo && yo.rol === 'Administrador';
    let m;

    // ----------------------------- ms-usuarios
    if (servicio === 'usuarios') {
        if (metodo === 'POST' && ruta === '/auth/login') {
            const u = db.usuarios.find(x => x.correo.toLowerCase() === String(body.correo).toLowerCase());
            if (!u || u.clave !== body.clave) return error(401, 'Correo o contraseña incorrectos.');
            if (!u.activo) return error(403, 'Tu cuenta está desactivada. Contacta al administrador.');
            return ok(respuestaAuth(u));
        }
        if (metodo === 'POST' && ruta === '/auth/registro') {
            if (db.usuarios.some(x => x.run === body.run)) return error(409, 'Ya existe un usuario con ese RUN.');
            if (db.usuarios.some(x => x.correo.toLowerCase() === body.correo.toLowerCase())) return error(409, 'Ya existe un usuario con ese correo.');
            const nuevo = { ...body, tipoUsuario: 'Cliente', activo: true };
            db.usuarios.push(nuevo);
            return ok(respuestaAuth(nuevo), 201);
        }
        if (metodo === 'POST' && ruta === '/auth/logout') {
            db.tokensRevocados = [...(db.tokensRevocados || []), body.refreshToken];
            return ok(null, 204);
        }
        if (metodo === 'POST' && ruta === '/auth/refresh') {
            return error(401, 'La sesión expiró. Vuelve a iniciar sesión.');
        }
        if (!yo) return error(401, 'Debes iniciar sesión para acceder a este recurso.');
        const propio = db.usuarios.find(x => x.correo === yo.sub);
        if (metodo === 'GET' && (ruta === '/auth/me' || ruta === '/usuarios/me')) return propio ? ok(publico(propio)) : error(404, 'Usuario no encontrado.');
        if (metodo === 'PUT' && ruta === '/usuarios/me') {
            const { clave, ...datos } = body;
            Object.assign(propio, datos, clave ? { clave } : {});
            return ok(publico(propio));
        }
        if (!esAdmin) return error(403, 'No tienes permisos para acceder a este recurso.');
        if (metodo === 'GET' && ruta === '/usuarios') return ok(db.usuarios.map(publico));
        if (metodo === 'POST' && ruta === '/usuarios') {
            if (db.usuarios.some(x => x.run === body.run)) return error(409, 'Ya existe un usuario con ese RUN.');
            if (db.usuarios.some(x => x.correo.toLowerCase() === body.correo.toLowerCase())) return error(409, 'Ya existe un usuario con ese correo.');
            db.usuarios.push({ ...body });
            return ok(publico(body), 201);
        }
        if ((m = ruta.match(/^\/usuarios\/([^/]+)(\/estado)?$/))) {
            const u = db.usuarios.find(x => x.run === decodeURIComponent(m[1]));
            if (!u) return error(404, 'Usuario no encontrado.');
            const esElMismo = u.correo === yo.sub;
            if (metodo === 'GET') return ok(publico(u));
            if (metodo === 'PATCH' && m[2]) {
                if (esElMismo && !body.activo) return error(409, 'No puedes desactivar tu propia cuenta.');
                u.activo = body.activo;
                return ok(publico(u));
            }
            if (metodo === 'PUT') {
                const { clave, ...datos } = body;
                Object.assign(u, datos, clave ? { clave } : {});
                return ok(publico(u));
            }
            if (metodo === 'DELETE') {
                if (esElMismo) return error(409, 'No puedes eliminar tu propia cuenta.');
                db.usuarios = db.usuarios.filter(x => x !== u);
                return ok(null, 204);
            }
        }
    }

    // ----------------------------- ms-productos
    if (servicio === 'productos') {
        if (metodo === 'GET' && ruta === '/productos') return ok(db.productos.map(productoDTO));
        if (metodo === 'GET' && ruta === '/categorias') return ok(categoriasDTO());
        if ((m = ruta.match(/^\/productos\/([^/]+)$/)) && metodo === 'GET') {
            const p = db.productos.find(x => x.codigo === decodeURIComponent(m[1]).toUpperCase());
            return p ? ok(productoDTO(p)) : error(404, 'Producto no encontrado.');
        }
        if (!yo) return error(401, 'Debes iniciar sesión para acceder a este recurso.');
        if ((m = ruta.match(/^\/productos\/([^/]+)\/stock$/)) && metodo === 'PATCH') {
            if (!esAdmin) return error(403, 'No tienes permisos para acceder a este recurso.');
            const p = db.productos.find(x => x.codigo === decodeURIComponent(m[1]));
            if (!p) return error(404, 'Producto no encontrado.');
            p.stock = body.stock;
            return ok(productoDTO(p));
        }
        if (!esAdmin) return error(403, 'No tienes permisos para acceder a este recurso.');
        if (metodo === 'POST' && ruta === '/productos') {
            const codigo = body.codigo.toUpperCase();
            if (db.productos.some(x => x.codigo === codigo)) return error(409, 'Ya existe un producto con ese código.');
            const nuevo = { ...body, codigo };
            db.productos.push(nuevo);
            return ok(productoDTO(nuevo), 201);
        }
        if ((m = ruta.match(/^\/productos\/([^/]+)$/))) {
            const p = db.productos.find(x => x.codigo === decodeURIComponent(m[1]));
            if (!p) return error(404, 'Producto no encontrado.');
            if (metodo === 'PUT') { Object.assign(p, body, { codigo: p.codigo }); return ok(productoDTO(p)); }
            if (metodo === 'DELETE') { db.productos = db.productos.filter(x => x !== p); return ok(null, 204); }
        }
        if (metodo === 'POST' && ruta === '/categorias') {
            if (db.categorias.some(c => c.nombre.toLowerCase() === body.nombre.toLowerCase())) return error(409, 'Ya existe una categoría con ese nombre.');
            const nueva = { id: Math.max(0, ...db.categorias.map(c => c.id)) + 1, nombre: body.nombre };
            db.categorias.push(nueva);
            return ok({ ...nueva, cantidadProductos: 0 }, 201);
        }
        if ((m = ruta.match(/^\/categorias\/(\d+)$/))) {
            const c = db.categorias.find(x => x.id === Number(m[1]));
            if (!c) return error(404, 'Categoría no encontrada.');
            if (metodo === 'PUT') {
                if (db.categorias.some(x => x !== c && x.nombre.toLowerCase() === body.nombre.toLowerCase())) return error(409, 'Ya existe una categoría con ese nombre.');
                db.productos.filter(p => p.categoria === c.nombre).forEach(p => { p.categoria = body.nombre; });
                c.nombre = body.nombre;
                return ok(c);
            }
            if (metodo === 'DELETE') {
                if (db.productos.some(p => p.categoria === c.nombre)) return error(409, 'No se puede eliminar una categoría que tiene productos.');
                db.categorias = db.categorias.filter(x => x !== c);
                return ok(null, 204);
            }
        }
    }

    // ----------------------------- ms-pedidos
    if (servicio === 'pedidos') {
        if (!yo) return error(401, 'Debes iniciar sesión para acceder a este recurso.');
        if (metodo === 'GET' && ruta === '/pedidos/mios') return ok(db.ordenes.filter(o => o.cliente.correo.toLowerCase() === yo.sub.toLowerCase()));
        if (metodo === 'GET' && ruta === '/pedidos') return esPersonal ? ok(db.ordenes) : error(403, 'No tienes permisos para acceder a este recurso.');
        if (metodo === 'POST' && ruta === '/pedidos') {
            if (yo.rol !== 'Cliente') return error(403, 'No tienes permisos para acceder a este recurso.');
            const items = body.items.map(i => {
                const p = db.productos.find(x => x.codigo === i.codigo);
                return { codigo: p.codigo, nombre: p.nombre, precio: productoDTO(p).precioFinal, cantidad: i.cantidad };
            });
            const sinStock = items.find(i => db.productos.find(p => p.codigo === i.codigo).stock < i.cantidad);
            const motivo = body.simularRechazo ? 'El medio de pago fue rechazado por el banco emisor.'
                : sinStock ? `Stock insuficiente para ${sinStock.nombre}.` : '';
            if (!motivo) items.forEach(i => { db.productos.find(p => p.codigo === i.codigo).stock -= i.cantidad; });
            const numero = db.siguienteNumero++;
            const orden = {
                numero, codigo: 'ORDER' + numero, fecha: new Date().toISOString(), estado: motivo ? 'Rechazada' : 'Pagada',
                estadoEnvio: motivo ? null : ESTADOS_ENVIO[0], motivo, medioPago: body.medioPago, tipoEntrega: body.tipoEntrega,
                cliente: { run: yo.run, nombre: body.cliente.nombre, apellidos: body.cliente.apellidos, correo: yo.sub },
                direccion: body.direccion || { calle: 'Av. Libertad 123', departamento: '', region: 'Región de Valparaíso', comuna: 'Viña del Mar', indicaciones: 'Retiro en tienda' },
                items, total: totalItems(items)
            };
            db.ordenes.push(orden);
            return ok(orden, 201);
        }
        if ((m = ruta.match(/^\/pedidos\/(\d+)(\/estado-envio)?$/))) {
            const o = db.ordenes.find(x => String(x.numero) === m[1]);
            if (!o) return error(404, 'Pedido no encontrado.');
            if (metodo === 'GET') {
                return esPersonal || o.cliente.correo === yo.sub ? ok(o) : error(403, 'No puedes ver pedidos de otros clientes.');
            }
            if (metodo === 'PATCH' && m[2]) {
                if (!esAdmin) return error(403, 'No tienes permisos para acceder a este recurso.');
                if (o.estado !== 'Pagada') return error(409, 'Solo se pueden despachar órdenes pagadas.');
                if (ESTADOS_ENVIO.indexOf(body.estadoEnvio) < ESTADOS_ENVIO.indexOf(o.estadoEnvio)) return error(409, 'No se puede volver a un estado anterior.');
                o.estadoEnvio = body.estadoEnvio;
                return ok(o);
            }
            if (metodo === 'DELETE') {
                if (!esAdmin) return error(403, 'No tienes permisos para acceder a este recurso.');
                if (o.estadoEnvio === 'Entregado') return error(409, 'No se puede eliminar un pedido que ya fue entregado.');
                db.ordenes = db.ordenes.filter(x => x !== o);
                return ok(null, 204);
            }
        }
    }
    return error(404, 'La ruta solicitada no existe.');
}

// fetch falso: "http://localhost:8082/api/v1/productos" -> servicio productos, ruta /productos
const PUERTOS = { 8081: 'usuarios', 8082: 'productos', 8083: 'pedidos' };

export async function fetchFalso(url, opciones = {}) {
    const { port, pathname } = new URL(url);
    const servicio = PUERTOS[port];
    const ruta = pathname.replace(/^\/api\/v1/, '');
    const body = opciones.body ? JSON.parse(opciones.body) : null;
    const { status, body: respuesta } = manejar(servicio, opciones.method || 'GET', ruta, body, leerToken(opciones.headers));
    return {
        ok: status >= 200 && status < 300,
        status,
        text: async () => (respuesta === null || respuesta === undefined ? '' : JSON.stringify(respuesta))
    };
}

// Se llama antes de cada prueba (Jest: src/setupTests.js · Karma: test/00-configuracion.spec.js).
// fetch queda como espía para poder revisar qué peticiones hizo la app.
export function instalarServidorFalso() {
    reiniciarServidor();
    precargarCache();
    /* global jasmine */
    const espia = typeof jest !== 'undefined' ? jest.fn(fetchFalso) : jasmine.createSpy('fetch').and.callFake(fetchFalso);
    window.fetch = espia;
    if (typeof global !== 'undefined') global.fetch = espia;
}

// Prepara un escenario de prueba: modifica los datos del servidor y recarga la caché
export function prepararDatos(modificar) {
    modificar(db);
    precargarCache();
}
