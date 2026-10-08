// =====================================================================
// CHECKOUT (checkout.html)
// Paso de pago: muestra el resumen del carrito, pide datos del cliente
// y dirección de entrega. Si hay sesión iniciada, los datos se completan
// automáticamente. Al pagar se crea la orden (js/ordenesDB.js) y se
// redirige a compra-exitosa.html o compra-error.html.
// =====================================================================

function marcarErrorCheckout(campo, mensaje) {
    document.getElementById(campo).classList.add('is-invalid');
    document.getElementById('err-' + campo).textContent = mensaje;
}

function limpiarErroresCheckout() {
    ['nombre', 'apellidos', 'correo', 'calle', 'region', 'comuna'].forEach(campo => {
        document.getElementById(campo).classList.remove('is-invalid');
        document.getElementById('err-' + campo).textContent = '';
    });
}

function totalCarrito(carrito) {
    return carrito.reduce((suma, item) => suma + item.price * item.quantity, 0);
}

function renderizarResumenCheckout() {
    const carrito = getCarrito();

    if (carrito.length === 0) {
        document.getElementById('checkout-contenido').hidden = true;
        document.getElementById('checkout-vacio').hidden = false;
        return false;
    }

    document.getElementById('checkout-items').innerHTML = carrito.map(item => `
        <tr>
            <td><img class="miniatura-compra" src="${escaparHTML(item.image)}" alt="${escaparHTML(item.name)}"></td>
            <td>${escaparHTML(item.name)}</td>
            <td>${formatCLP(item.price)}</td>
            <td>${item.quantity}</td>
            <td>${formatCLP(item.price * item.quantity)}</td>
        </tr>
    `).join('');

    const total = formatCLP(totalCarrito(carrito));
    document.getElementById('checkout-total-badge').textContent = total;
    document.getElementById('checkout-total-boton').textContent = total;
    return true;
}

// Si el usuario inició sesión, completa sus datos automáticamente
function autocompletarDatosUsuario() {
    let usuario = null;
    try { usuario = JSON.parse(localStorage.getItem('usuarioActivo')); } catch (e) { usuario = null; }
    if (!usuario) return;

    document.getElementById('nombre').value = usuario.nombre || '';
    document.getElementById('apellidos').value = usuario.apellidos || '';
    document.getElementById('correo').value = usuario.correo || '';
    document.getElementById('calle').value = usuario.direccion || '';

    const selectRegion = document.getElementById('region');
    if (usuario.region) {
        selectRegion.value = usuario.region;
        selectRegion.dispatchEvent(new Event('change')); // carga las comunas (js/regiones.js)
        document.getElementById('comuna').value = usuario.comuna || '';
    }

    document.getElementById('aviso-sesion').innerHTML =
        `· <i class="bi bi-person-check"></i> Datos completados con tu cuenta (${escaparHTML(usuario.correo)})`;
}

function validarCheckout() {
    limpiarErroresCheckout();
    let valido = true;

    const nombre = document.getElementById('nombre').value.trim();
    const apellidos = document.getElementById('apellidos').value.trim();
    const correo = document.getElementById('correo').value.trim();
    const calle = document.getElementById('calle').value.trim();
    const region = document.getElementById('region').value;
    const comuna = document.getElementById('comuna').value;

    if (!nombre) { marcarErrorCheckout('nombre', 'El nombre es requerido.'); valido = false; }
    if (!apellidos) { marcarErrorCheckout('apellidos', 'Los apellidos son requeridos.'); valido = false; }
    if (!correo) { marcarErrorCheckout('correo', 'El correo es requerido.'); valido = false; }
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) { marcarErrorCheckout('correo', 'Ingresa un correo válido.'); valido = false; }
    if (!calle) { marcarErrorCheckout('calle', 'La calle es requerida.'); valido = false; }
    if (!region) { marcarErrorCheckout('region', 'Selecciona una región.'); valido = false; }
    if (!comuna) { marcarErrorCheckout('comuna', 'Selecciona una comuna.'); valido = false; }

    return valido;
}

// Descuenta el stock en el carrito (stocks) y en la base de productos (admin)
function descontarStock(carrito) {
    const productos = obtenerProductos();
    carrito.forEach(item => {
        const disponible = getStock(item.id, item.stock);
        saveStock(item.id, disponible - item.quantity);
        const producto = productos.find(p => p.codigo === item.id);
        if (producto) producto.stock = Math.max(0, producto.stock - item.quantity);
    });
    guardarProductos(productos);
}

function procesarPago(evento) {
    evento.preventDefault();
    if (!validarCheckout()) {
        const primerError = document.querySelector('#form-checkout .is-invalid');
        if (primerError) primerError.focus();
        return;
    }

    const carrito = getCarrito();
    if (carrito.length === 0) return;

    const sinStock = carrito.find(item => item.quantity > getStock(item.id, item.stock));
    const simularError = document.getElementById('simular-error').checked;

    let motivo = '';
    if (sinStock) motivo = 'Stock insuficiente para ' + sinStock.name + '.';
    else if (simularError) motivo = 'El medio de pago fue rechazado por el banco emisor.';

    const orden = crearOrden({
        estado: motivo ? 'Rechazada' : 'Pagada',
        motivo,
        medioPago: document.querySelector('input[name="medio-pago"]:checked').value,
        cliente: {
            nombre: document.getElementById('nombre').value.trim(),
            apellidos: document.getElementById('apellidos').value.trim(),
            correo: document.getElementById('correo').value.trim()
        },
        direccion: {
            calle: document.getElementById('calle').value.trim(),
            departamento: document.getElementById('departamento').value.trim(),
            region: document.getElementById('region').value,
            comuna: document.getElementById('comuna').value,
            indicaciones: document.getElementById('indicaciones').value.trim()
        },
        items: carrito.map(item => ({
            codigo: item.id,
            nombre: item.name,
            precio: item.price,
            cantidad: item.quantity,
            imagen: item.image
        }))
    });

    if (orden.estado === 'Pagada') {
        descontarStock(carrito);
        saveCarrito([]);
        window.location.href = 'compra-exitosa.html?orden=' + orden.numero;
    } else {
        // El carrito se mantiene para poder reintentar el pago
        window.location.href = 'compra-error.html?orden=' + orden.numero;
    }
}

document.addEventListener('DOMContentLoaded', function () {
    if (!renderizarResumenCheckout()) return;
    autocompletarDatosUsuario();
    document.getElementById('form-checkout').addEventListener('submit', procesarPago);
});
