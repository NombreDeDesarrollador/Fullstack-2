/* --- js/producto.js --- */

// 1. Base de datos simulada (Diccionario de productos)
const baseDeDatos = {
    "GA001": {
        nombre: "Guitarra Acústica Folk",
        marca: "Yamaha",
        precio: "$149.990",
        desc: "Sonido cálido y definido, perfecta para fingerpicking y composiciones íntimas.",
        img: "https://www.blupointmusic.cl/wp-content/uploads/2020/07/guitare-classique-yamaha-cg122ms.png"
    },
    "GA002": {
        nombre: "Guitarra Acústica Dreadnought",
        marca: "Fender",
        precio: "$189.990",
        desc: "Gran proyección acústica y graves profundos gracias a su clásico cuerpo dreadnought.",
        img: "https://www.fender.com/cdn-cgi/image/format=auto,resize=height=auto,width=500/https://images.ctfassets.net/mdpgzc1lmx9t/BYKt7UMe776XlKhhQGmT5/ea9e727a02dbff4ddccfdf72ec50d0ca/dreadnought_body_plp_tile_v2.png"
    },
    "GA003": {  }
    // Puedes ir agregando el resto de los productos aquí con el mismo formato
};

// 2. Lógica de renderizado (Se ejecuta cuando el HTML está listo)
document.addEventListener("DOMContentLoaded", () => {
    
    // Leer la URL para saber qué producto cargar (ej: producto.html?id=GA001)
    const parametrosURL = new URLSearchParams(window.location.search);
    const idProducto = parametrosURL.get('id');

    // Buscar el producto en la base de datos
    const producto = baseDeDatos[idProducto];

    const contenedorProducto = document.getElementById('contenedor-producto');
    const mensajeError = document.getElementById('mensaje-error');

    // Si el producto existe, inyectamos los datos en el HTML
    if (producto) {
        document.getElementById('prod-codigo').textContent = idProducto;
        document.getElementById('prod-nombre').textContent = producto.nombre;
        document.getElementById('prod-marca').textContent = producto.marca;
        document.getElementById('prod-precio').textContent = producto.precio;
        document.getElementById('prod-desc').textContent = producto.desc;
        document.getElementById('prod-img').src = producto.img;
        
        // Cambiar dinámicamente el título de la pestaña del navegador
        document.title = `${producto.nombre} - Digital Sounds`;
    } else {
        // Si no hay ID o el producto no existe, mostramos el mensaje de error
        if(contenedorProducto) contenedorProducto.style.display = 'none';
        if(mensajeError) mensajeError.style.display = 'block';
    }
});