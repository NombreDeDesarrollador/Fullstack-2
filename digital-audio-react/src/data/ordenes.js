// =====================================================================
// FUENTE DE DATOS SIMULADA: ÓRDENES / BOLETAS DE EJEMPLO
// CRUD en src/services/ordenesService.js
// estado: pago (Pagada / Rechazada) · estadoEnvio: En preparación -> Despachado -> Entregado
// =====================================================================

export const ordenesIniciales = [
    {
        numero: 20260901, codigo: 'ORDER20260901', fecha: '2026-09-01T12:30:00', estado: 'Pagada', estadoEnvio: 'Entregado', medioPago: 'Webpay',
        cliente: { nombre: 'Cliente', apellidos: 'Demo', correo: 'cliente@gmail.com' },
        direccion: { calle: 'Av. Siempre Viva 123', departamento: '', region: 'Región de Valparaíso', comuna: 'Viña del Mar', indicaciones: '' },
        items: [
            { codigo: 'GE001', nombre: 'Guitarra Eléctrica Stratocaster', precio: 175992, cantidad: 1 },
            { codigo: 'AC001', nombre: 'Cuerdas Guitarra Eléctrica 09-42', precio: 8990, cantidad: 2 }
        ]
    },
    {
        numero: 20260912, codigo: 'ORDER20260912', fecha: '2026-09-12T18:05:00', estado: 'Pagada', estadoEnvio: 'Entregado', medioPago: 'Webpay',
        cliente: { nombre: 'Camila', apellidos: 'Rojas Soto', correo: 'camila.rojas@gmail.com' },
        direccion: { calle: 'Los Aromos 455', departamento: 'Depto 302', region: 'Región Metropolitana de Santiago', comuna: 'Ñuñoa', indicaciones: 'Dejar en conserjería.' },
        items: [
            { codigo: 'ES001', nombre: 'Interfaz de Audio 2x2 USB', precio: 143991, cantidad: 1 },
            { codigo: 'ES002', nombre: 'Auriculares de Estudio', precio: 59990, cantidad: 1 },
            { codigo: 'MI003', nombre: 'Micrófono Condensador', precio: 118992, cantidad: 1 }
        ]
    },
    {
        numero: 20260920, codigo: 'ORDER20260920', fecha: '2026-09-20T10:15:00', estado: 'Rechazada', medioPago: 'Webpay',
        motivo: 'El medio de pago fue rechazado por el banco emisor.',
        cliente: { nombre: 'Diego', apellidos: 'Muñoz', correo: 'diego.munoz@duoc.cl' },
        direccion: { calle: 'Calle Prat 89', departamento: '', region: 'Región del Biobío', comuna: 'Concepción', indicaciones: '' },
        items: [
            { codigo: 'BT001', nombre: 'Batería Acústica 5 piezas', precio: 549990, cantidad: 1 }
        ]
    },
    {
        numero: 20261002, codigo: 'ORDER20261002', fecha: '2026-10-02T16:40:00', estado: 'Pagada', estadoEnvio: 'Despachado', medioPago: 'Transferencia',
        cliente: { nombre: 'Cliente', apellidos: 'Demo', correo: 'cliente@gmail.com' },
        direccion: { calle: 'Av. Siempre Viva 123', departamento: '', region: 'Región de Valparaíso', comuna: 'Viña del Mar', indicaciones: 'Llamar antes de llegar.' },
        items: [
            { codigo: 'PE002', nombre: 'Pedal Reverb', precio: 90993, cantidad: 1 },
            { codigo: 'PE004', nombre: 'Pedal Tuner Cromático', precio: 89990, cantidad: 1 },
            { codigo: 'AC007', nombre: 'Cable Instrumento 3m', precio: 15992, cantidad: 3 }
        ]
    },
    {
        numero: 20261005, codigo: 'ORDER20261005', fecha: '2026-10-05T11:20:00', estado: 'Pagada', estadoEnvio: 'En preparación', medioPago: 'Webpay',
        cliente: { nombre: 'Valentina', apellidos: 'Pérez', correo: 'vale.perez@gmail.com' },
        direccion: { calle: 'Av. Alemania 1020', departamento: '', region: 'Región de la Araucanía', comuna: 'Temuco', indicaciones: '' },
        items: [
            { codigo: 'TC001', nombre: 'Teclado Digital 61 teclas', precio: 152991, cantidad: 1 },
            { codigo: 'AM001', nombre: 'Amplificador Guitarra 15W', precio: 109990, cantidad: 1 }
        ]
    }
];
