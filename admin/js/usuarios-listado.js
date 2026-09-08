// =====================================================================
// LISTADO DE USUARIOS (panel administrador)
// Solo accesible para el rol Administrador.
// =====================================================================

function renderizarTablaUsuarios() {
    const usuarios = obtenerUsuarios();
    const tbody = document.getElementById('tabla-usuarios-body');

    if (usuarios.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:#888;">Aún no hay usuarios registrados.</td></tr>';
        return;
    }

    tbody.innerHTML = usuarios.map(u => `
        <tr>
            <td>${u.run || '-'}</td>
            <td>${u.nombre}</td>
            <td>${u.apellidos || '-'}</td>
            <td>${u.correo}</td>
            <td>${u.tipoUsuario}</td>
            <td>
                <div class="acciones-tabla">
                    <a href="usuario-form.html?run=${encodeURIComponent(u.run)}" class="accion-editar" title="Editar"><i class="bi bi-pencil"></i></a>
                    <button class="accion-eliminar" onclick="eliminarUsuario('${u.run}')"><i class="bi bi-trash"></i> Eliminar</button>
                </div>
            </td>
        </tr>
    `).join('');
}

function eliminarUsuario(run) {
    if (!confirm('¿Seguro que deseas eliminar este usuario?')) return;
    const usuarios = obtenerUsuarios().filter(u => u.run !== run);
    guardarUsuarios(usuarios);
    renderizarTablaUsuarios();
}

const usuario = requireRole(['Administrador']);
if (usuario) {
    iniciarLayoutAdmin(usuario);
    renderizarTablaUsuarios();
}