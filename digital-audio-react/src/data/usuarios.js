// =====================================================================
// FUENTE DE DATOS SIMULADA: USUARIOS
// Roles: Administrador (acceso total), Vendedor (productos y órdenes)
// y Cliente (tienda, perfil y compras). CRUD en src/services/usuariosService.js
// =====================================================================

export const usuariosIniciales = [
    {
        run: '444444444', nombre: 'Administrador', apellidos: 'Sistema', correo: 'admin@duoc.cl', clave: 'admin1',
        telefono: '', region: 'Región de Valparaíso', comuna: 'Viña del Mar', direccion: 'Casa Matriz Digital Audio', tipoUsuario: 'Administrador'
    },
    {
        run: '222222222', nombre: 'Vendedor', apellidos: 'Tienda', correo: 'vendedor@duoc.cl', clave: 'venta1',
        telefono: '', region: 'Región de Valparaíso', comuna: 'Viña del Mar', direccion: 'Tienda Digital Audio', tipoUsuario: 'Vendedor'
    },
    {
        run: '333333333', nombre: 'Cliente', apellidos: 'Demo', correo: 'cliente@gmail.com', clave: 'cliente1',
        telefono: '', region: 'Región de Valparaíso', comuna: 'Viña del Mar', direccion: 'Av. Siempre Viva 123', tipoUsuario: 'Cliente'
    }
];

export const tiposUsuario = ['Administrador', 'Vendedor', 'Cliente'];
