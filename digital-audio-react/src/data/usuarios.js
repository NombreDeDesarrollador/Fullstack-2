// =====================================================================
// DATOS DE PRUEBA: USUARIOS
// Desde la EV3 la aplicación ya NO usa este archivo: los datos reales viven en
// MySQL y se piden a los microservicios Spring Boot. Se conserva solo como
// datos iniciales del backend falso de las pruebas (src/pruebas/servidorFalso.js).
// =====================================================================

export const usuariosIniciales = [
    {
        run: '156782343', nombre: 'Administrador', apellidos: 'Sistema', correo: 'admin@duoc.cl', clave: 'admin1',
        telefono: '', region: 'Región de Valparaíso', comuna: 'Viña del Mar', direccion: 'Casa Matriz Digital Audio', tipoUsuario: 'Administrador'
    },
    {
        run: '172345670', nombre: 'Vendedor', apellidos: 'Tienda', correo: 'vendedor@duoc.cl', clave: 'venta1',
        telefono: '', region: 'Región de Valparaíso', comuna: 'Viña del Mar', direccion: 'Tienda Digital Audio', tipoUsuario: 'Vendedor'
    },
    {
        run: '187654327', nombre: 'Cliente', apellidos: 'Demo', correo: 'cliente@gmail.com', clave: 'cliente1',
        telefono: '', region: 'Región de Valparaíso', comuna: 'Viña del Mar', direccion: 'Av. Siempre Viva 123', tipoUsuario: 'Cliente'
    }
];

export const tiposUsuario = ['Administrador', 'Vendedor', 'Cliente'];
