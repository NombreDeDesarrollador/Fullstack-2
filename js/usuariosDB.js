

const usuariosIniciales = [
    
    {
        run: '222222222',
        nombre: 'Vendedor',
        apellidos: 'Tienda',
        correo: 'vendedor@duoc.cl',
        clave: 'venta1',
        telefono: '',
        region: '',
        comuna: '',
        direccion: 'Tienda Digital Sounds',
        tipoUsuario: 'Vendedor'
    },
    {
        run: '333333333',
        nombre: 'Cliente',
        apellidos: 'Demo',
        correo: 'cliente@gmail.com',
        clave: 'cliente1',
        telefono: '',
        region: '',
        comuna: '',
        direccion: 'Av. Siempre Viva 123',
        tipoUsuario: 'Cliente'
    },
    {
        run: '444444444',
        nombre: 'Administrador',
        apellidos: 'Sistema',
        correo: 'admin@duoc.cl',
        clave: 'admin1',
        telefono: '',
        region: '',
        comuna: '',
        direccion: 'Casa Matriz Digital Sounds',
        tipoUsuario: 'Administrador'
    },
    {
        run: '555555555',
        nombre: 'Vendedor',
        apellidos: 'Tienda',
        correo: 'vendedor@duoc.cl',
        clave: 'venta1',
        telefono: '',
        region: '',
        comuna: '',
        direccion: 'Tienda Digital Sounds',
        tipoUsuario: 'Vendedor'
    }
];
    
function inicializarUsuarios() {
    if (!localStorage.getItem('usuarios')) {
        localStorage.setItem('usuarios', JSON.stringify(usuariosIniciales));
    }
}

function obtenerUsuarios() {
    inicializarUsuarios();
    return JSON.parse(localStorage.getItem('usuarios') || '[]');
}

function guardarUsuarios(lista) {
    localStorage.setItem('usuarios', JSON.stringify(lista));
}

function buscarUsuarioPorRun(run) {
    return obtenerUsuarios().find(u => u.run === run);
}

function buscarUsuarioPorCorreo(correo) {
    return obtenerUsuarios().find(u => u.correo === correo);
}

inicializarUsuarios();