// =====================================================================
// REPORTES (admin/reportes.html)
// Calcula indicadores de ventas e inventario a partir de las órdenes
// pagadas (js/ordenesDB.js) y los productos (js/baseDeDatos.js).
// Los gráficos son barras hechas con CSS (sin librerías externas).
// =====================================================================

function barrasHTML(datos, formato) {
    const maximo = Math.max(...datos.map(d => d.valor), 1);
    return datos.map(d => `
        <div class="barra-fila">
            <span class="barra-etiqueta">${escaparHTML(d.etiqueta)}</span>
            <div class="barra-pista"><div class="barra-relleno" style="width:${Math.max(2, d.valor / maximo * 100)}%"></div></div>
            <span class="barra-valor">${formato(d.valor)}</span>
        </div>`).join('') || '<p class="texto-suave">Sin datos.</p>';
}

const usuario = requireRole(['Administrador']);
if (usuario) {
    iniciarLayoutAdmin(usuario);

    const productos = obtenerProductos();
    const pagadas = obtenerOrdenes().filter(o => o.estado === 'Pagada');
    const ventas = pagadas.reduce((s, o) => s + o.total, 0);
    const unidades = pagadas.reduce((s, o) => s + cantidadItems(o), 0);

    document.getElementById('kpis-reportes').innerHTML = `
        <div class="stat-card azul"><i class="bi bi-cash-stack"></i><div><span class="stat-titulo">Ventas totales</span><span class="stat-valor">${formatoPesos(ventas)}</span></div></div>
        <div class="stat-card verde"><i class="bi bi-bag-check"></i><div><span class="stat-titulo">Órdenes pagadas</span><span class="stat-valor">${pagadas.length}</span></div></div>
        <div class="stat-card amarillo"><i class="bi bi-receipt-cutoff"></i><div><span class="stat-titulo">Ticket promedio</span><span class="stat-valor">${formatoPesos(pagadas.length ? Math.round(ventas / pagadas.length) : 0)}</span></div></div>
        <div class="stat-card morado"><i class="bi bi-boxes"></i><div><span class="stat-titulo">Unidades vendidas</span><span class="stat-valor">${unidades}</span></div></div>
    `;

    // Ventas por categoría y por producto
    const porCategoria = {}, porProducto = {};
    pagadas.forEach(o => o.items.forEach(item => {
        const producto = productos.find(p => p.codigo === item.codigo);
        const categoria = producto ? producto.categoria : 'Otros';
        const monto = item.precio * item.cantidad;
        porCategoria[categoria] = (porCategoria[categoria] || 0) + monto;
        if (!porProducto[item.codigo]) porProducto[item.codigo] = { nombre: item.nombre, unidades: 0, ingresos: 0 };
        porProducto[item.codigo].unidades += item.cantidad;
        porProducto[item.codigo].ingresos += monto;
    }));

    document.getElementById('reporte-categorias').innerHTML = barrasHTML(
        Object.entries(porCategoria).map(([etiqueta, valor]) => ({ etiqueta, valor })).sort((a, b) => b.valor - a.valor),
        formatoPesos);

    // Ventas por mes (últimos meses con ventas)
    const porMes = {};
    pagadas.forEach(o => {
        const fecha = new Date(o.fecha);
        const clave = fecha.getFullYear() + '-' + String(fecha.getMonth() + 1).padStart(2, '0');
        porMes[clave] = (porMes[clave] || 0) + o.total;
    });
    document.getElementById('reporte-meses').innerHTML = barrasHTML(
        Object.keys(porMes).sort().map(clave => {
            const texto = new Date(clave + '-15T12:00:00').toLocaleDateString('es-CL', { month: 'long', year: 'numeric' });
            return { etiqueta: texto.charAt(0).toUpperCase() + texto.slice(1), valor: porMes[clave] };
        }), formatoPesos);

    const top = Object.values(porProducto).sort((a, b) => b.unidades - a.unidades || b.ingresos - a.ingresos).slice(0, 5);
    document.getElementById('reporte-top-productos').innerHTML = top.length
        ? top.map((p, i) => `<tr><td>${i + 1}</td><td>${escaparHTML(p.nombre)}</td><td>${p.unidades}</td><td>${formatoPesos(p.ingresos)}</td></tr>`).join('')
        : '<tr><td colspan="4" class="celda-vacia">Aún no hay ventas.</td></tr>';

    // Inventario valorizado por categoría
    document.getElementById('reporte-inventario').innerHTML = obtenerCategorias().map(categoria => {
        const lista = productos.filter(p => p.categoria === categoria);
        const unidadesStock = lista.reduce((s, p) => s + p.stock, 0);
        const valor = lista.reduce((s, p) => s + p.stock * p.precio, 0);
        return `<tr><td>${escaparHTML(categoria)}</td><td>${lista.length}</td><td>${unidadesStock}</td><td>${formatoPesos(valor)}</td></tr>`;
    }).join('');
}
