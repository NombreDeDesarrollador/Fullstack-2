function buscarProducto() {
    var input = document.getElementById('buscarProducto');
    var resultado = document.getElementById('resultado-busqueda');

    if (input.value.trim() === '') {
        input.style.borderColor = 'red';
        resultado.innerHTML = 'Escribe algo para buscar';
        resultado.style.color = 'red';
        return;
    }

    input.style.borderColor = '';
    resultado.innerHTML = 'Buscando: "' + input.value.trim() + '"...';
    resultado.style.color = 'green';
}

// Referencia al contenedor en el HTML
const contenedorCatalogo = document.getElementById('contenedor-catalogo');

// Formateador de pesos chilenos
const formateadorPesos = new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0
});

if (contenedorCatalogo) {
    const categorias = {};

    for (const codigo in baseDeDatos) {
        const producto = baseDeDatos[codigo];
        if (!categorias[producto.categoria]) categorias[producto.categoria] = [];
        categorias[producto.categoria].push({ codigo, producto });
    }

    contenedorCatalogo.innerHTML = Object.entries(categorias).map(([categoria, productos]) => `
        <section class="categoria-bloque">
            <h2>${categoria}</h2>
            <div class="galeria-catalogo">
                ${productos.map(({ codigo, producto }) => `
                    <a href="producto.html?id=${codigo}" class="enlace-tarjeta">
                        <div class="producto-card">
                            <img src="${producto.img}" alt="${producto.nombre}">
                            <span class="codigo">${codigo}</span>
                            <h4>${producto.nombre}</h4>
                            <p><strong>Marca:</strong> ${producto.marca}</p>
                            <p class="desc">${producto.descripcion}</p>
                            <p><strong>${formateadorPesos.format(producto.precio)}</strong></p>
                        </div>
                    </a>
                `).join('')}
            </div>
        </section>
    `).join('');
}