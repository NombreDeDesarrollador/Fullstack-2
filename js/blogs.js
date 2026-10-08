// =====================================================================
// BLOGS (blogs.html y blog-detalle.html?id=)
// Los artículos viven en este arreglo, igual que los productos en
// js/baseDeDatos.js. El listado y el detalle se arman desde aquí.
// =====================================================================

const blogs = [
    {
        id: 1,
        titulo: 'Cómo elegir tu primera guitarra: acústica, clásica o eléctrica',
        categoria: 'GUÍA PARA PRINCIPIANTES',
        autor: 'Equipo Digital Audio',
        fecha: '2026-09-18',
        lectura: '5 min',
        imagen: 'img/images.jpg',
        resumen: 'Si estás empezando, la elección de tu primera guitarra puede marcar la diferencia entre seguir practicando o dejarla en un rincón. Te explicamos qué mirar antes de comprar.',
        contenido: [
            { tipo: 'p', texto: 'Elegir la primera guitarra es una de las decisiones más emocionantes para cualquier músico. Pero con tantas opciones en el mercado, es fácil sentirse perdido. En esta guía te contamos las diferencias principales para que tomes una decisión informada.' },
            { tipo: 'h2', texto: 'Guitarra clásica: ideal para comenzar' },
            { tipo: 'p', texto: 'Las guitarras clásicas usan cuerdas de nylon, que son más suaves para los dedos. Son perfectas para niños y para quienes quieren aprender música folclórica, bossa nova o clásica. Su mástil es más ancho, lo que ayuda a separar bien los dedos.' },
            { tipo: 'h2', texto: 'Guitarra acústica: para cantar y acompañar' },
            { tipo: 'p', texto: 'Con cuerdas de acero, la guitarra acústica tiene un sonido más brillante y con mayor volumen. Es la favorita para acompañar canciones de pop, rock o folk alrededor de una fogata. Al principio puede doler un poco más la yema de los dedos, pero se supera en pocas semanas.' },
            { tipo: 'h2', texto: 'Guitarra eléctrica: versatilidad total' },
            { tipo: 'p', texto: 'Si te gusta el rock, el blues o el metal, una eléctrica es el camino. Sus cuerdas son más delgadas y fáciles de presionar, pero necesitarás un amplificador. Un combo de 15W es más que suficiente para practicar en casa.' },
            { tipo: 'lista', items: ['Define el estilo de música que quieres tocar.', 'Considera tu presupuesto total (incluye funda, afinador y cuerdas).', 'Prueba el instrumento en tienda: la comodidad es clave.', 'Pide que revisen la altura de las cuerdas (acción).'] },
            { tipo: 'p', texto: 'En nuestra tienda de Viña del Mar puedes probar todos los modelos y recibir asesoría personalizada sin costo.' }
        ],
        productosRelacionados: ['GA003', 'GA001', 'GE001']
    },
    {
        id: 2,
        titulo: 'Arma tu home studio: lo esencial para grabar en casa',
        categoria: 'ESTUDIO Y GRABACIÓN',
        autor: 'Equipo Digital Audio',
        fecha: '2026-10-01',
        lectura: '6 min',
        imagen: 'img/imagen menu.jpg',
        resumen: 'No necesitas un gran presupuesto para grabar maquetas con calidad profesional. Estos son los equipos básicos para empezar tu propio estudio en casa.',
        contenido: [
            { tipo: 'p', texto: 'Hoy en día cualquier músico puede grabar sus canciones desde su habitación. La clave está en elegir bien unos pocos equipos y aprender a sacarles el máximo provecho.' },
            { tipo: 'h2', texto: '1. Interfaz de audio' },
            { tipo: 'p', texto: 'Es el corazón del home studio: convierte la señal de tus micrófonos e instrumentos en audio digital. Una interfaz 2x2 USB te permite grabar voz y guitarra al mismo tiempo con muy buena calidad.' },
            { tipo: 'h2', texto: '2. Micrófono de condensador' },
            { tipo: 'p', texto: 'Para voces y guitarras acústicas, un micrófono de condensador captura todos los detalles. Acompáñalo de un pop filter para evitar los golpes de aire en las letras "p" y "b".' },
            { tipo: 'h2', texto: '3. Audífonos y monitores' },
            { tipo: 'p', texto: 'Los audífonos cerrados son ideales para grabar sin que se filtre el sonido. Para mezclar, los monitores de estudio con respuesta plana te mostrarán la verdad sobre tu música.' },
            { tipo: 'lista', items: ['Interfaz de audio 2x2 USB', 'Micrófono de condensador + pop filter', 'Audífonos de estudio cerrados', 'Par de monitores de 5"', 'Cables balanceados de buena calidad'] },
            { tipo: 'p', texto: 'Con este equipo básico ya puedes grabar, editar y mezclar tus propias canciones. ¡Lo demás es práctica!' }
        ],
        productosRelacionados: ['ES001', 'MI003', 'ES002']
    }
];

function formatoFechaBlog(fechaISO) {
    const fecha = new Date(fechaISO + 'T12:00:00');
    return fecha.toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' });
}

function crearTarjetaBlog(blog) {
    return `
        <article class="tarjeta-blog">
            <a href="blog-detalle.html?id=${blog.id}" class="tarjeta-blog-imagen">
                <img src="${blog.imagen}" alt="${blog.titulo}">
            </a>
            <div class="tarjeta-blog-texto">
                <p class="etiqueta-seccion">${blog.categoria}</p>
                <h2><a href="blog-detalle.html?id=${blog.id}">${blog.titulo}</a></h2>
                <p class="blog-meta"><i class="bi bi-calendar3"></i> ${formatoFechaBlog(blog.fecha)} · <i class="bi bi-clock"></i> ${blog.lectura} de lectura</p>
                <p>${blog.resumen}</p>
                <a href="blog-detalle.html?id=${blog.id}" class="btn-leer">Leer artículo <i class="bi bi-arrow-right"></i></a>
            </div>
        </article>
    `;
}

function renderizarListaBlogs() {
    const lista = document.getElementById('lista-blogs');
    if (lista) lista.innerHTML = blogs.map(crearTarjetaBlog).join('');
}

function renderizarDetalleBlog() {
    const articulo = document.getElementById('blog-detalle');
    if (!articulo) return;

    const id = Number(new URLSearchParams(window.location.search).get('id'));
    const blog = blogs.find(b => b.id === id);

    if (!blog) {
        articulo.style.display = 'none';
        document.querySelector('.blog-otros').style.display = 'none';
        document.getElementById('mensaje-error').style.display = 'block';
        return;
    }

    document.title = blog.titulo + ' - Digital Audio';
    document.getElementById('blog-categoria').textContent = blog.categoria;
    document.getElementById('blog-titulo').textContent = blog.titulo;
    document.getElementById('blog-meta').innerHTML =
        `<i class="bi bi-person"></i> ${blog.autor} · <i class="bi bi-calendar3"></i> ${formatoFechaBlog(blog.fecha)} · <i class="bi bi-clock"></i> ${blog.lectura} de lectura`;
    document.getElementById('blog-imagen').src = blog.imagen;
    document.getElementById('blog-imagen').alt = blog.titulo;

    let html = blog.contenido.map(bloque => {
        if (bloque.tipo === 'h2') return `<h2>${bloque.texto}</h2>`;
        if (bloque.tipo === 'lista') return `<ul>${bloque.items.map(i => `<li>${i}</li>`).join('')}</ul>`;
        return `<p>${bloque.texto}</p>`;
    }).join('');

    // Productos mencionados en el artículo (enlazan al detalle de producto)
    const relacionados = blog.productosRelacionados.map(buscarProductoPorCodigo).filter(Boolean);
    if (relacionados.length) {
        html += `
            <h2>Productos recomendados</h2>
            <div class="productos-relacionados">
                ${relacionados.map(p => `
                    <a href="producto.html?codigo=${p.codigo}" class="producto-relacionado">
                        <img src="${p.imagen}" alt="${p.nombre}">
                        <span>${p.nombre}</span>
                        <strong>${precioFinal(p).toLocaleString('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 })}</strong>
                    </a>`).join('')}
            </div>`;
    }
    document.getElementById('blog-contenido').innerHTML = html;

    document.getElementById('blog-otros').innerHTML =
        blogs.filter(b => b.id !== blog.id).map(crearTarjetaBlog).join('');
}

document.addEventListener('DOMContentLoaded', function () {
    renderizarListaBlogs();
    renderizarDetalleBlog();
});
