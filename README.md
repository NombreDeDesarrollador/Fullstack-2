[README.md](https://github.com/user-attachments/files/31961060/README.md)
# Digital Audio 🎸

Sitio web de e-commerce para una tienda de instrumentos musicales, desarrollado como proyecto **Fullstack** con HTML, CSS y JavaScript puro (sin frameworks ni backend).

## 📋 Descripción

Digital Audio es una tienda en línea de instrumentos y accesorios musicales (guitarras, bajos, baterías, teclados, amplificadores, micrófonos, pedales de efectos y accesorios). El sitio simula el flujo completo de un e-commerce: registro/login de usuarios, catálogo con búsqueda, ficha de producto, carrito de compras y contacto.

## ✨ Funcionalidades

- **Catálogo de productos** filtrable por categoría, con buscador integrado en el header.
- **Ficha de producto** con detalle, precio y stock.
- **Carrito de compras** persistente en `localStorage`, con control de stock por producto.
- **Registro de usuarios** con validaciones de formulario, incluyendo validación de RUN chileno (dígito verificador) y selección dinámica de región/comuna.
- **Login** con distintos roles de usuario: `Cliente`, `Vendedor` y `Administrador`.
- **Formulario de contacto** con validaciones.
- **Diseño responsive** basado en Bootstrap 5.

## 🗂️ Estructura del proyecto

```
Fullstack-2-Develop/
├── index.html              # Punto de entrada
├── proyecto.html           # Página principal / home de la tienda
├── catalogo.html           # Listado y búsqueda de productos
├── producto.html           # Detalle de un producto
├── carrito.html            # Carrito de compras
├── login.html              # Inicio de sesión
├── registro.html           # Registro de nuevos usuarios
├── contacto.html           # Formulario de contacto
├── sobreNosotros.html      # Página "Sobre nosotros"
├── css/
│   ├── style.css           # Estilos generales del sitio
│   └── stylelogin.css      # Estilos específicos de login/registro
├── js/
│   ├── baseDeDatos.js      # Catálogo de productos (datos en memoria)
│   ├── usuariosDB.js       # Usuarios de ejemplo (cliente, vendedor, admin)
│   ├── catalogo.js         # Lógica de listado y filtrado de productos
│   ├── producto.js         # Lógica de la ficha de producto
│   ├── carrito.js          # Lógica del carrito de compras (localStorage)
│   ├── busqueda.js         # Buscador de productos
│   ├── login.js            # Validación de inicio de sesión
│   ├── registro.js         # Validación del formulario de registro
│   ├── validaciones.js     # Validación de RUN chileno
│   ├── regiones.js         # Datos de regiones y comunas de Chile
│   └── contacto.js         # Validación del formulario de contacto
└── img/                    # Imágenes del sitio
```

## 🚀 Cómo ejecutar el proyecto

Al ser un proyecto **100% frontend** (HTML/CSS/JS, sin servidor ni base de datos real), no requiere instalación de dependencias.

1. Clona el repositorio:
   ```bash
   git clone <URL-del-repositorio>
   ```
2. Abre la carpeta del proyecto y ejecuta `index.html` (o `proyecto.html`) directamente en tu navegador, o usa una extensión como **Live Server** en VS Code para evitar problemas de rutas.

## 🛠️ Tecnologías utilizadas

- HTML5
- CSS3
- JavaScript (Vanilla)
- [Bootstrap 5.3](https://getbootstrap.com/) (vía CDN)
- `localStorage` del navegador para persistencia del carrito y stock

## 👤 Usuarios de prueba

| Rol           | Correo             | Clave    |
|---------------|---------------------|----------|
| Cliente       | cliente@gmail.com   | cliente1 |
| Vendedor      | vendedor@duoc.cl    | venta1   |
| Administrador | admin@duoc.cl       | admin1   |

> ⚠️ Estos datos son solo de demostración y no representan un sistema de autenticación real ni seguro.

## 📌 Notas

- Los datos de productos y usuarios se almacenan directamente en archivos JavaScript (`baseDeDatos.js` y `usuariosDB.js`), no hay conexión a una base de datos real.
- El carrito y los stocks se guardan en el `localStorage` del navegador, por lo que los cambios son locales a cada usuario/navegador.

## 📄 Licencia

Este proyecto fue desarrollado con fines educativos.
