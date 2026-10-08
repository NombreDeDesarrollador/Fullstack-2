// =====================================================================
// BASE DE DATOS DE ÓRDENES / BOLETAS
// Igual que productos y usuarios, las órdenes viven en localStorage.
// Se crean desde checkout.html y se revisan en el panel admin
// (admin/ordenes.html, admin/boleta.html, historial de compras).
// Requiere js/baseDeDatos.js cargado antes.
// =====================================================================

const ordenesIniciales = [
    {
        numero: 20260901, codigo: 'ORDER20260901', fecha: '2026-09-01T12:30:00', estado: 'Pagada',
        cliente: { nombre: 'Cliente', apellidos: 'Demo', correo: 'cliente@gmail.com' },
        direccion: { calle: 'Av. Siempre Viva 123', departamento: '', region: 'Región de Valparaíso', comuna: 'Viña del Mar', indicaciones: '' },
        items: [
            { codigo: 'GE001', nombre: 'Guitarra Eléctrica Stratocaster', precio: 175992, cantidad: 1 },
            { codigo: 'AC001', nombre: 'Cuerdas Guitarra Eléctrica 09-42', precio: 8990, cantidad: 2 }
        ]
    },
    {
        numero: 20260912, codigo: 'ORDER20260912', fecha: '2026-09-12T18:05:00', estado: 'Pagada',
        cliente: { nombre: 'Camila', apellidos: 'Rojas Soto', correo: 'camila.rojas@gmail.com' },
        direccion: { calle: 'Los Aromos 455', departamento: 'Depto 302', region: 'Región Metropolitana de Santiago', comuna: 'Ñuñoa', indicaciones: 'Dejar en conserjería.' },
        items: [
            { codigo: 'ES001', nombre: 'Interfaz de Audio 2x2 USB', precio: 143991, cantidad: 1 },
            { codigo: 'ES002', nombre: 'Auriculares de Estudio', precio: 59990, cantidad: 1 },
            { codigo: 'MI003', nombre: 'Micrófono Condensador', precio: 118992, cantidad: 1 }
        ]
    },
    {
        numero: 20260920, codigo: 'ORDER20260920', fecha: '2026-09-20T10:15:00', estado: 'Rechazada',
        cliente: { nombre: 'Diego', apellidos: 'Muñoz', correo: 'diego.munoz@duoc.cl' },
        direccion: { calle: 'Calle Prat 89', departamento: '', region: 'Región del Biobío', comuna: 'Concepción', indicaciones: '' },
        items: [
            { codigo: 'BT001', nombre: 'Batería Acústica 5 piezas', precio: 549990, cantidad: 1 }
        ]
    },
    {
        numero: 20261002, codigo: 'ORDER20261002', fecha: '2026-10-02T16:40:00', estado: 'Pagada',
        cliente: { nombre: 'Cliente', apellidos: 'Demo', correo: 'cliente@gmail.com' },
        direccion: { calle: 'Av. Siempre Viva 123', departamento: '', region: 'Región de Valparaíso', comuna: 'Viña del Mar', indicaciones: 'Llamar antes de llegar.' },
        items: [
            { codigo: 'PE002', nombre: 'Pedal Reverb', precio: 90993, cantidad: 1 },
            { codigo: 'PE004', nombre: 'Pedal Tuner Cromático', precio: 89990, cantidad: 1 },
            { codigo: 'AC007', nombre: 'Cable Instrumento 3m', precio: 15992, cantidad: 3 }
        ]
    },
    {
        numero: 20261005, codigo: 'ORDER20261005', fecha: '2026-10-05T11:20:00', estado: 'Pagada',
        cliente: { nombre: 'Valentina', apellidos: 'Pérez', correo: 'vale.perez@gmail.com' },
        direccion: { calle: 'Av. Alemania 1020', departamento: '', region: 'Región de la Araucanía', comuna: 'Temuco', indicaciones: '' },
        items: [
            { codigo: 'TC001', nombre: 'Teclado Digital 61 teclas', precio: 152991, cantidad: 1 },
            { codigo: 'AM001', nombre: 'Amplificador Guitarra 15W', precio: 109990, cantidad: 1 }
        ]
    }
];

// Total de una orden a partir de sus ítems
function totalOrden(orden) {
    return orden.items.reduce((suma, item) => suma + item.precio * item.cantidad, 0);
}

function inicializarOrdenes() {
    if (!localStorage.getItem('ordenes')) {
        const conTotal = ordenesIniciales.map(o => ({ ...o, total: totalOrden(o) }));
        localStorage.setItem('ordenes', JSON.stringify(conTotal));
    }
}

function obtenerOrdenes() {
    inicializarOrdenes();
    let ordenes;
    try { ordenes = JSON.parse(localStorage.getItem('ordenes')); } catch (e) { ordenes = []; }
    return Array.isArray(ordenes) ? ordenes : [];
}

function guardarOrdenes(lista) {
    localStorage.setItem('ordenes', JSON.stringify(lista));
}

function buscarOrdenPorNumero(numero) {
    return obtenerOrdenes().find(o => String(o.numero) === String(numero));
}

function ordenesPorCorreo(correo) {
    const c = String(correo || '').toLowerCase();
    return obtenerOrdenes().filter(o => o.cliente && String(o.cliente.correo).toLowerCase() === c);
}

// Crea una orden nueva con número correlativo y la guarda. Devuelve la orden.
function crearOrden(datos) {
    const ordenes = obtenerOrdenes();
    const ultimo = ordenes.reduce((max, o) => Math.max(max, Number(o.numero) || 0), 0);
    const numero = ultimo + 1;
    const orden = {
        numero,
        codigo: 'ORDER' + numero,
        fecha: new Date().toISOString(),
        ...datos // estado, cliente, direccion, items, medioPago, motivo
    };
    orden.total = totalOrden(orden);
    ordenes.push(orden);
    guardarOrdenes(ordenes);
    return orden;
}

function formatoFecha(fechaISO) {
    const fecha = new Date(fechaISO);
    if (isNaN(fecha)) return '-';
    return fecha.toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit', year: 'numeric' }) +
        ' ' + fecha.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });
}

inicializarOrdenes();
