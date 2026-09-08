// =====================================================================
// FORMULARIO NUEVO / EDITAR PRODUCTO (panel administrador)
// Reglas de negocio según la pauta:
//  - Código: requerido, texto, mínimo 3 caracteres, sin límite máximo.
//  - Nombre: requerido, máx 100.
//  - Descripción: opcional, máx 500.
//  - Precio: requerido, mínimo 0 (permite decimales, 0 = producto FREE).
//  - Stock: requerido, mínimo 0, solo enteros.
//  - Stock crítico: opcional, mínimo 0, solo enteros.
//  - Categoría: requerida (select).
//  - Imagen: opcional.
// =====================================================================

let modoEdicion = false;

function marcarErrorProducto(campo, mensaje) {
    const input = document.getElementById(campo);
    if (input) input.classList.add('is-invalid');
    const error = document.getElementById('err-' + campo);
    if (error) error.textContent = mensaje;
}

function limpiarErroresProducto(campos) {
    campos.forEach(campo => {
        const input = document.getElementById(campo);
        if (input) input.classList.remove('is-invalid');
        const error = document.getElementById('err-' + campo);
        if (error) error.textContent = '';
    });
}

function poblarCategorias(categoriaSeleccionada) {
    const select = document.getElementById('categoria');
    select.innerHTML = '<option value="">-- Seleccione la categoría --</option>' +
        categoriasDisponibles.map(c => `<option value="${c}">${c}</option>`).join('');
    if (categoriaSeleccionada) select.value = categoriaSeleccionada;
}

function cargarProductoParaEditar(codigo) {
    const producto = buscarProductoPorCodigo(codigo);
    if (!producto) return;

    modoEdicion = true;
    document.getElementById('titulo-pagina').textContent = 'Editar Producto - Panel Administrador';
    document.getElementById('titulo-form').textContent = 'Editar Producto: ' + producto.codigo;

    document.getElementById('codigo-original').value = producto.codigo;
    document.getElementById('codigo').value = producto.codigo;
    document.getElementById('codigo').disabled = true; // el código no se edita, es la llave del producto
    document.getElementById('nombre').value = producto.nombre;
    document.getElementById('descripcion').value = producto.descripcion || '';
    document.getElementById('marca').value = producto.marca || '';
    poblarCategorias(producto.categoria);
    document.getElementById('precio').value = producto.precio;
    document.getElementById('stock').value = producto.stock;
    document.getElementById('stockCritico').value = producto.stockCritico ?? '';
    document.getElementById('imagen').value = producto.imagen || '';
}

function guardarFormularioProducto() {
    const campos = ['codigo', 'nombre', 'descripcion', 'precio', 'stock', 'stockCritico', 'categoria'];
    limpiarErroresProducto(campos);

    const codigo = document.getElementById('codigo').value.trim();
    const nombre = document.getElementById('nombre').value.trim();
    const descripcion = document.getElementById('descripcion').value.trim();
    const marca = document.getElementById('marca').value.trim();
    const categoria = document.getElementById('categoria').value;
    const precioStr = document.getElementById('precio').value;
    const stockStr = document.getElementById('stock').value;
    const stockCriticoStr = document.getElementById('stockCritico').value;
    const imagen = document.getElementById('imagen').value.trim();
    const resultado = document.getElementById('resultado-producto');

    const precio = parseFloat(precioStr);
    const stock = parseInt(stockStr, 10);
    const stockCritico = stockCriticoStr === '' ? null : parseInt(stockCriticoStr, 10);

    let valido = true;

    if (!codigo) { marcarErrorProducto('codigo', 'El código es requerido.'); valido = false; }
    else if (codigo.length < 3) { marcarErrorProducto('codigo', 'Mínimo 3 caracteres.'); valido = false; }

    if (!nombre) { marcarErrorProducto('nombre', 'El nombre es requerido.'); valido = false; }
    else if (nombre.length > 100) { marcarErrorProducto('nombre', 'Máximo 100 caracteres.'); valido = false; }

    if (descripcion.length > 500) { marcarErrorProducto('descripcion', 'Máximo 500 caracteres.'); valido = false; }

    if (precioStr === '' || isNaN(precio)) { marcarErrorProducto('precio', 'El precio es requerido.'); valido = false; }
    else if (precio < 0) { marcarErrorProducto('precio', 'El precio no puede ser negativo (0 = producto gratis).'); valido = false; }

    if (stockStr === '' || isNaN(stock)) { marcarErrorProducto('stock', 'El stock es requerido.'); valido = false; }
    else if (stock < 0) { marcarErrorProducto('stock', 'El stock no puede ser negativo.'); valido = false; }
    else if (!Number.isInteger(Number(stockStr))) { marcarErrorProducto('stock', 'El stock debe ser un número entero.'); valido = false; }

    if (stockCriticoStr !== '') {
        if (stockCritico < 0) { marcarErrorProducto('stockCritico', 'No puede ser negativo.'); valido = false; }
        else if (!Number.isInteger(Number(stockCriticoStr))) { marcarErrorProducto('stockCritico', 'Debe ser un número entero.'); valido = false; }
    }

    if (!categoria) { marcarErrorProducto('categoria', 'Selecciona una categoría.'); valido = false; }

    // Validar que el código no esté repetido (el formulario solo crea productos nuevos)
    const existe = obtenerProductos().some(p => p.codigo.toLowerCase() === codigo.toLowerCase());
    if (existe) { marcarErrorProducto('codigo', 'Ya existe un producto con ese código.'); valido = false; }

    if (!valido) {
        resultado.textContent = 'Revisa los campos marcados en rojo.';
        resultado.style.color = '#e0453d';
        return false;
    }

    const productos = obtenerProductos();
    const productoData = {
        codigo, nombre, descripcion, marca, categoria,
        precio, stock,
        stockCritico: stockCritico === null ? 0 : stockCritico,
        imagen: imagen || 'https://via.placeholder.com/300x200?text=Sin+imagen'
    };

    if (modoEdicion) {
        const codigoOriginal = document.getElementById('codigo-original').value;
        const indice = productos.findIndex(p => p.codigo === codigoOriginal);
        productos[indice] = productoData;
    } else {
        productos.push(productoData);
    }

    guardarProductos(productos);

    resultado.textContent = modoEdicion ? 'Producto actualizado correctamente.' : 'Producto creado correctamente.';
    resultado.style.color = '#2e9e5b';
    setTimeout(() => window.location.href = 'productos.html', 1000);
    return true;
}

const usuario = requireRole(['Administrador']);
if (usuario) {
    iniciarLayoutAdmin(usuario);
    poblarCategorias();

    // Ya no se permite modificar productos existentes: si alguien llega
    // con ?codigo= en la URL, se le devuelve al listado.
    const params = new URLSearchParams(window.location.search);
    if (params.get('codigo')) {
        window.location.href = 'productos.html';
    }
}