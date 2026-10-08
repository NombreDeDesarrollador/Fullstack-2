

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
    let guardados;
    try { guardados = JSON.parse(localStorage.getItem('usuarios')); } catch (e) { guardados = null; }
    if (!Array.isArray(guardados)) guardados = [];
    guardados = guardados.filter(u => u && typeof u === 'object');

    // Garantiza que los usuarios de ejemplo (admin, vendedor, cliente) siempre existan,
    // aunque el navegador tenga datos viejos de otra versión del proyecto.
    let cambios = !localStorage.getItem('usuarios');
    usuariosIniciales.forEach(base => {
        const existente = guardados.find(u => u.correo === base.correo);
        if (!existente) {
            guardados.push(base);
            cambios = true;
        } else if (existente.clave !== base.clave || existente.tipoUsuario !== base.tipoUsuario) {
            existente.clave = base.clave;
            existente.tipoUsuario = base.tipoUsuario;
            cambios = true;
        }
    });
    if (cambios) localStorage.setItem('usuarios', JSON.stringify(guardados));
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