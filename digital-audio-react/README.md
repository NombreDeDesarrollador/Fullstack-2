# Digital Audio — Tienda online en React 🎸

Proyecto de **DSY1104 Desarrollo FullStack II – Evaluación Parcial 2**.
Migración de la tienda de instrumentos (HTML/CSS/JS) a **React**, con **React Bootstrap** para el diseño responsivo y **Jasmine + Karma** para las pruebas unitarias.

## 🚀 Cómo ejecutar

```bash
npm install          # instala dependencias
npm start            # abre http://localhost:3000
npm test             # ejecuta las pruebas con Karma + Jasmine (Chrome Headless) y genera la cobertura
npm run build        # versión de producción en /build
```

Informe de cobertura: abrir `coverage/html/index.html` después de `npm test`.

## 👤 Usuarios de prueba

| Rol           | Correo            | Clave    | Accede a |
|---------------|-------------------|----------|----------|
| Cliente       | cliente@gmail.com | cliente1 | Tienda, Mi cuenta (perfil y compras) |
| Vendedor      | vendedor@duoc.cl  | venta1   | Panel: Dashboard, Órdenes (cambiar estado de envío), Productos (ver y actualizar stock), Perfil |
| Administrador | admin@duoc.cl     | admin1   | Panel completo |

## 🗂️ Estructura

```
src/
├── data/                 # Fuente de datos simulada (productos, usuarios, órdenes, blogs, regiones)
├── services/             # Funciones CRUD sobre los datos + persistencia en localStorage
├── utils/                # Validaciones de formularios y formatos (funciones puras)
├── context/              # Estado global: AuthContext (sesión) y CartContext + carritoReducer
├── components/
│   ├── layout/           # Header (Navbar), BuscadorHeader, Footer, TiendaLayout
│   ├── tienda/           # ProductCard, ProductGrid, PrecioProducto, CartItem, BlogCard
│   ├── comunes/          # CampoFormulario, SelectRegionComuna, ResumenOrden, EstadoBadge, RutaProtegida
│   └── admin/            # AdminLayout (menú por rol), StatCard, BarrasReporte
├── pages/
│   ├── tienda/           # Home, Catálogo, Producto, Categorías, Ofertas, Blog, Nosotros, Contacto,
│   │                     # Login, Registro, Carrito, Checkout, CompraResultado, MiCuenta
│   └── admin/            # Dashboard, Órdenes, Boleta, Productos (CRUD, detalle, críticos),
│                         # Categorías, Usuarios (CRUD, detalle + historial), Reportes, Perfil
├── App.jsx               # Rutas (react-router-dom)
└── index.js              # Bootstrap + proveedores de contexto
test/                     # Pruebas Jasmine (*.spec.js) ejecutadas por Karma
karma.conf.js             # Configuración de Karma + webpack + cobertura
```

## 🧭 Rutas principales

| Tienda | Panel (/admin) |
|---|---|
| `/` Inicio · `/catalogo` · `/producto/:codigo` | `/admin` Dashboard |
| `/categorias/:slug` · `/ofertas` | `/admin/ordenes` · `/admin/ordenes/:numero` (boleta) |
| `/blogs` · `/blogs/:id` · `/nosotros` · `/contacto` | `/admin/productos` · `/nuevo` · `/:codigo` · `/:codigo/editar` · `/criticos` |
| `/login` · `/registro` · `/mi-cuenta` | `/admin/categorias` · `/admin/usuarios` (+ historial de compras) |
| `/carrito` · `/checkout` · `/compra/exito/:n` · `/compra/error/:n` | `/admin/reportes` · `/admin/perfil` |

## 🧪 Pruebas unitarias

| Archivo | Qué verifica |
|---|---|
| `01-validaciones` | RUN, login, registro, producto y checkout (lógica pura) |
| `02-carritoReducer` | Estado del carrito: agregar, límite de stock, cantidades, totales |
| `03-servicios` | CRUD de productos, categorías, órdenes y usuarios |
| `04-mocks-storage` | **Mocks** de `localStorage` con `spyOn` para aislar la persistencia |
| `05-ProductCard` | Renderizado con props, renderizado condicional, estado y evento `onClick` |
| `06-CartItem` | Eventos hacia el padre (`onCambiarCantidad`, `onEliminar`) |
| `07-CampoFormulario` | Cambio de estado al escribir, error condicional, StatCard y EstadoBadge |
| `08-Login` | Validación, error de credenciales y redirección por rol |
| `09-Header` | Nombre del usuario según sesión, badge del carrito, buscador, rutas protegidas |
| `10-Contacto` | Formulario controlado: errores y limpieza tras enviar |
| `11-flujo-compra` | Carrito → Checkout → pago exitoso / rechazado → resultado |
| `12-admin` | Reportes, filtros, menú por rol y permisos del Vendedor |
| `13-mejoras-panel` | RUN (módulo 11, desde 1-9), permisos por rol, stock del Vendedor, orden por criticidad, estados de envío y código de barras |

## 🔐 Reglas de negocio del panel

- **Permisos por rol** (`src/utils/permisos.js`): el Administrador crea, edita y elimina productos; el Vendedor solo actualiza stock. Ambos cambian el estado de envío de los pedidos. Los servicios validan el permiso, no solo los botones.
- **Productos ordenados por criticidad**: primero los agotados, luego los que están bajo su stock crítico y al final el resto.
- **Estados de envío**: En preparación → Despachado → Entregado. No se puede retroceder ni despachar una orden rechazada. El cliente ve el estado en *Mi cuenta*.
- **Código de barras** (Code 39 en SVG, sin librerías) en la boleta y en el detalle del producto.
- **RUN**: acepta `19.011.029-K` o `19011029K`; desde `1-9` hasta `99.999.999-K`, DV 0-9 o K y validación módulo 11.

## 🛠️ Tecnologías

React 18 · React Router 6 · React Bootstrap 2 / Bootstrap 5 · Bootstrap Icons · Jasmine · Karma · karma-webpack · Babel · Istanbul (cobertura) · Testing Library
