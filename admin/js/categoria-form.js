// =====================================================================
// NUEVA / EDITAR CATEGORÍA (admin/categoria-form.html[?nombre=])
// Reglas: nombre requerido, máx 50 caracteres y sin repetir.
// Al renombrar, los productos de la categoría se actualizan.
// =====================================================================

function guardarFormularioCategoria(evento) {
    evento.preventDefault();
    const input = document.getElementById('nombre');
    const error = document.getElementById('err-nombre');
    const resultado = document.getElementById('resultado-categoria');
    const original = document.getElementById('nombre-original').value;
    const nombre = input.value.trim();

    input.classList.remove('is-invalid');
    error.textContent = '';

    let mensaje = '';
    if (!nombre) mensaje = 'El nombre es requerido.';
    else if (nombre.length > 50) mensaje = 'Máximo 50 caracteres.';
    else if (obtenerCategorias().some(c => c.toLowerCase() === nombre.toLowerCase() && c !== original)) mensaje = 'Ya existe una categoría con ese nombre.';

    if (mensaje) {
        input.classList.add('is-invalid');
        error.textContent = mensaje;
        resultado.textContent = 'Revisa el campo marcado en rojo.';
        resultado.style.color = '#e0453d';
        return;
    }

    const categorias = obtenerCategorias();
    if (original) {
        categorias[categorias.indexOf(original)] = nombre;
        const productos = obtenerProductos();
        productos.forEach(p => { if (p.categoria === original) p.categoria = nombre; });
        guardarProductos(productos);
    } else {
        categorias.push(nombre);
    }
    guardarCategorias(categorias);

    resultado.textContent = original ? 'Categoría actualizada correctamente.' : 'Categoría creada correctamente.';
    resultado.style.color = '#2e9e5b';
    setTimeout(() => window.location.href = 'categorias.html', 900);
}

const usuario = requireRole(['Administrador']);
if (usuario) {
    iniciarLayoutAdmin(usuario);

    const nombre = new URLSearchParams(window.location.search).get('nombre');
    if (nombre && obtenerCategorias().includes(nombre)) {
        document.title = 'Editar Categoría - Panel Administrador';
        document.getElementById('titulo-form').textContent = 'Editar Categoría: ' + nombre;
        document.getElementById('nombre-original').value = nombre;
        document.getElementById('nombre').value = nombre;
        document.getElementById('aviso-edicion').hidden = false;
    }
    document.getElementById('form-categoria').addEventListener('submit', guardarFormularioCategoria);
}
