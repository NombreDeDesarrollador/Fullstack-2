# Digital Audio — Tienda online en React 🎸

Proyecto de **DSY1104 Desarrollo FullStack II** — caso **Sonido Vivo**.
- **EV2:** migración de la tienda a **React** + **React Bootstrap**, pruebas con **Jest** y **Jasmine + Karma**.
- **EV3:** integración con el backend de **microservicios Spring Boot** (repositorio `sonido-vivo-backend`): API REST, autenticación **JWT con roles**, sesión persistente y restricciones de acceso por rol.

## 🚀 Cómo ejecutar

1. Levanta el backend (ver README de `sonido-vivo-backend`: `docker compose up --build`).
2. Configura las URLs de la API y arranca React:

```bash
cp .env.example .env   # URLs de ms-usuarios, ms-productos y ms-pedidos
npm install
npm start              # http://localhost:3000
npm run build          # versión de producción en /build (o: docker build -t sonido-vivo-front .)

# Pruebas (no necesitan el backend: usan un backend falso en memoria)
CI=true npm test -- --coverage --watchAll=false   # Jest + React Testing Library
npm run test:karma                                # Jasmine + Karma (Chrome Headless)
```

- Informe de cobertura de Jest: `coverage/lcov-report/index.html`.
- Informe de Karma: `coverage-karma/html/index.html`.
- Pruebas de Jest: `src/pruebas/*.test.js`. Pruebas de Jasmine: `test/*.spec.js` (las de servicios y vistas se generan desde las de Jest).

## 🔌 Integración con el backend (EV3)

| Archivo | Qué hace |
|---|---|
| `src/services/api.js` | Cliente `fetch` hacia los 3 microservicios. Agrega `Authorization: Bearer`, renueva el token vencido con el refresh token y convierte los errores JSON del backend en mensajes. |
| `src/services/sesion.js` | Guarda `accessToken`, `refreshToken` y usuario en `localStorage` (la sesión sobrevive a recargar la página). Lee la expiración del JWT. |
| `src/services/cache.js` | Caché en memoria de lo que responde la API + hook `useDatos()` para redibujar las vistas cuando llegan datos. |
| `src/components/comunes/SincronizarDatos.jsx` | Pide los datos según el rol: catálogo (todos), pedidos propios (Cliente), todos los pedidos (Vendedor/Admin) y usuarios (Admin). |
| `src/context/AuthContext.jsx` | Login/registro contra ms-usuarios, valida la sesión guardada con `/auth/me`, cierra sesión si el token deja de ser válido o si se cierra en otra pestaña. El logout revoca el refresh token en el backend (`POST /auth/logout`). |
| `src/components/comunes/RutaProtegida.jsx` + `src/utils/permisos.js` | Restricciones por rol en rutas, menús y botones. El backend vuelve a validar todo (401/403). |
| `src/pruebas/servidorFalso.js` | Backend falso (mock de `fetch`) con las mismas rutas y reglas, para las pruebas. |

**Flujo de una compra:** Checkout envía `POST /api/v1/pedidos` con solo códigos y cantidades → ms-pedidos pide a ms-productos los precios oficiales y descuenta el stock en una transacción → responde el pedido `Pagada` o `Rechazada` (con motivo) → React redirige a la página de resultado y recarga el catálogo con el stock nuevo.

## 👤 Usuarios de prueba

| Rol           | Correo            | Clave    | Accede a |
|---------------|-------------------|----------|----------|
| Cliente       | cliente@gmail.com | cliente1 | Tienda, Mi cuenta (perfil y compras) |
| Vendedor      | vendedor@duoc.cl  | venta1   | Panel de solo lectura: Dashboard, Órdenes y Productos (lista y detalle), Perfil |
| Administrador | admin@duoc.cl     | admin1   | Panel completo |

## 🗂️ Estructura

```
src/
├── data/                 # Blogs y regiones (productos/usuarios/órdenes quedan solo como datos de prueba)
├── services/             # api.js (fetch + JWT), sesion.js, cache.js y servicios por microservicio
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
src/pruebas/              # Pruebas Jest + React Testing Library (*.test.js) para el informe de cobertura
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
| `14-formularios-vistas` | Registro (validación, selects dependientes, RUN repetido, redirección), filtros del Catálogo, ProductoForm y UsuarioForm (crear, editar, validar) |
| `13-mejoras-panel` | RUN (módulo 11, desde 1-9), permisos por rol (Vendedor solo lectura), stock, orden por criticidad, estados de envío y código de barras |

## 🔐 Reglas de negocio del panel

- **Permisos por rol** (`src/utils/permisos.js`): el Administrador crea, edita y elimina productos, actualiza stock y cambia el estado de envío. El Vendedor **solo visualiza** productos y órdenes (Anexo 1 de la pauta). Los servicios validan el permiso, no solo los botones, y el backend responde 403 si alguien fuerza la petición.
- **Productos ordenados por criticidad**: primero los agotados, luego los que están bajo su stock crítico y al final el resto.
- **Estados de envío**: En preparación → Despachado → Entregado. No se puede retroceder ni despachar una orden rechazada. El cliente ve el estado en *Mi cuenta*.
- **Código de barras** (Code 39 en SVG, sin librerías) en la boleta y en el detalle del producto.
- **RUN**: acepta `19.011.029-K` o `19011029K`; desde `1-9` hasta `99.999.999-K`, DV 0-9 o K y validación módulo 11.

## 🛠️ Tecnologías

React 18 · React Router 6 · React Bootstrap 2 / Bootstrap 5 · Bootstrap Icons · Jasmine · Karma · karma-webpack · Babel · Istanbul (cobertura) · Testing Library
