# Aquanova — Sistema de Gestión de Lavandería

Sistema integral para la gestión operativa de una lavandería: pedidos, clientes, empleados, inventario, pagos y facturación.

## Tecnologías

| Capa | Tecnología |
|------|-----------|
| Frontend | React 18 + Vite 5 |
| Estilos | CSS Variables (tema propio) + Lucide React |
| Backend | Node.js + Express 4 |
| Base de datos | PostgreSQL + pg pool |
| Auth | JWT + BCryptJS |
| Tunnel público | slim.sh |

## Estructura del proyecto

```
aquanova_2/
├── src/
│   ├── components/
│   │   ├── UI.jsx              # Biblioteca de componentes (Card, Btn, Table, etc.)
│   │   ├── Sidebar.jsx         # Navegación lateral colapsable
│   │   ├── StatsStrip.jsx      # Panel de métricas (bento grid)
│   │   ├── SplashScreen.jsx    # Pantalla de carga inicial
│   │   ├── Login.jsx           # Autenticación
│   │   ├── Pedidos.jsx         # Módulo de pedidos
│   │   ├── Personas.jsx        # Clientes, Empleados, Servicios
│   │   ├── Inventario.jsx      # Insumos y Pagos
│   │   ├── Facturas.jsx        # Facturación
│   │   ├── HorariosEmpleados.jsx # Turnos y horarios
│   │   ├── Reportes.jsx        # Reportes y estadísticas
│   │   ├── QueryTool.jsx       # Consultas SQL directas
│   │   ├── CustomToaster.jsx   # Notificaciones
│   │   └── ErrorBoundary.jsx   # Manejo de errores
│   ├── hooks/
│   │   ├── useApi.js           # Wrapper de fetch con auth JWT
│   │   └── useIsMobile.js      # Detección de pantalla móvil
│   ├── index.css               # Sistema de diseño (variables CSS, temas)
│   ├── App.jsx                 # Componente raíz + layout principal
│   └── main.jsx                # Punto de entrada React
├── routes/
│   ├── db.js                   # Pool de conexión PostgreSQL
│   ├── utils.js                # Helpers (ok, err)
│   ├── auth.js                 # Login + verificación JWT
│   ├── roleMiddleware.js       # Control de acceso por rol
│   ├── clientes.js
│   ├── empleados.js
│   ├── pedidos.js
│   ├── servicios.js
│   ├── insumos.js
│   ├── pagos.js
│   ├── facturas.js
│   ├── horarios.js
│   ├── reportes.js
│   └── query.js
├── docs/
│   └── sql/                    # Scripts SQL históricos
├── public/
│   └── img/                    # Imágenes y logo
├── server.js                   # Entrada del servidor Express
├── iniciar.command             # Lanzador con doble clic (macOS)
├── package.json
└── .env                        # Variables de entorno (no subir a git)
```

## Instalación y uso

### Inicio rápido (macOS)

Doble clic en `iniciar.command`. El script hace todo automáticamente:
- Libera puertos 3000 y 5173
- Instala dependencias si es la primera vez
- Arranca el servidor Express y Vite
- Abre el navegador en `http://localhost:5173`
- Genera un link público con slim.sh para compartir

### Manual

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar entorno (ver sección siguiente)

# 3. Iniciar backend
node server.js

# 4. Iniciar frontend (en otra terminal)
npm run dev
```

## Variables de entorno

Crea un archivo `.env` en la raíz con:

```env
DATABASE_URL=postgresql://usuario:contraseña@host:5432/nombre_db
JWT_SECRET=tu_secreto_seguro_aqui
PORT=3000
```

## API — Rutas principales

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/auth/login` | Iniciar sesión |
| GET | `/api/auth/verify` | Verificar token |
| GET/POST | `/api/clientes` | Gestión de clientes |
| GET/POST | `/api/empleados` | Gestión de empleados |
| GET/POST/PUT/DELETE | `/api/pedidos/:id` | CRUD pedidos |
| GET/POST/PUT/DELETE | `/api/horarios/:id` | CRUD horarios |
| GET/POST | `/api/insumos` | Inventario |
| GET/POST | `/api/pagos` | Registro de pagos |
| GET/POST | `/api/facturas` | Facturación |
| GET | `/api/reportes/stats` | Métricas del dashboard |
| POST | `/api/query` | Consultas SQL (admin) |

## Sistema de diseño

La app usa un sistema de tokens CSS en `src/index.css` con dos temas:

- **Dark** (predeterminado): Midnight Ocean — fondos azul marino, acento cyan
- **Light**: Linen & Tide — base lino cálido, texto charcoal, acento cerulean

El tema se alterna desde el botón en la barra lateral y se persiste en `localStorage`.

## Seguridad

- `helmet` — headers HTTP seguros
- `express-rate-limit` — protección contra fuerza bruta
- `bcryptjs` — hash de contraseñas
- JWT — autenticación stateless con expiración
- `roleMiddleware` — control de acceso por rol (admin / usuario)

---

© 2026 Aquanova — Gestión de Lavandería
