// =====================================================================
// LISTADO DE CATEGORÍAS (admin/categorias.html)
// =====================================================================

function renderizarTablaCategorias() {
    const productos = obtenerProductos();
    const tbody = document.getElementById('tabla-categorias-body');

    tbody.innerHTML = obtenerCategorias().map(categoria => {
        const lista = productos.filter(p => p.categoria === categoria);
        const stock = lista.reduce((s, p) => s + p.stock, 0);
        const nombreURL = encodeURIComponent(categoria);
        return `
            <tr>
                <td><strong>${escaparHTML(categoria)}</strong></td>
                <td>${lista.length}</td>
                <td>${stock}</td>
                <td>
                    <div class="acciones-tabla">
                        <a href="../categorias.html?cat=${slugCategoria(categoria)}" class="accion-ver" target="_blank" title="Ver en la tienda"><i class="bi bi-eye"></i></a>
                        <a href="categoria-form.html?nombre=${nombreURL}" class="accion-editar" title="Editar"><i class="bi bi-pencil"></i></a>
                        <button class="accion-eliminar" data-categoria="${escaparHTML(categoria)}" ${lista.length ? 'disabled title="No se puede eliminar: tiene productos"' : ''}><i class="bi bi-trash"></i> Eliminar</button>
                    </div>
                </td>
            </tr>`;
    }).join('');
}

const usuario = requireRole(['Administrador']);
if (usuario) {
    iniciarLayoutAdmin(usuario);
    renderizarTablaCategorias();

    document.getElementById('tabla-categorias-body').addEventListener('click', function (e) {
        const boton = e.target.closest('.accion-eliminar');
        if (!boton || boton.disabled) return;
        const categoria = boton.dataset.categoria;
        if (!confirm('¿Eliminar la categoría "' + categoria + '"?')) return;
        guardarCategorias(obtenerCategorias().filter(c => c !== categoria));
        renderizarTablaCategorias();
    });
}
