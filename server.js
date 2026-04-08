import 'dotenv/config'
import express from 'express'
import cors    from 'cors'
import helmet  from 'helmet'
import rateLimit from 'express-rate-limit'
import pool    from './routes/db.js'
import { createRequire } from 'module'
const require = createRequire(import.meta.url)
const bcrypt  = require('bcryptjs')

// Routers
import authRouter, { authMiddleware } from './routes/auth.js'
import empleadosRouter from './routes/empleados.js'
import clientesRouter  from './routes/clientes.js'
import pedidosRouter   from './routes/pedidos.js'
import serviciosRouter from './routes/servicios.js'
import insumosRouter   from './routes/insumos.js'
import pagosRouter     from './routes/pagos.js'
import facturasRouter  from './routes/facturas.js'
import horariosRouter  from './routes/horarios.js'
import reportesRouter  from './routes/reportes.js'
import queryRouter     from './routes/query.js'

const app  = express()
const PORT = process.env.PORT || 3000

// ── SEGURIDAD ──────────────────────────────────────────────
app.use(helmet())
app.use(cors())
app.use(express.json())

// Limitador para evitar fuerza bruta en Auth
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 10, // 10 intentos
  message: { ok: false, mensaje: '[SECURITY] Demasiados intentos, intenta más tarde' }
})

// ── INICIALIZACIÓN ADMIN ───────────────────────────────────
const initAdmin = async () => {
  const adminEmail = process.env.ADMIN_EMAIL
  const adminPass  = process.env.ADMIN_PASSWORD
  if (!adminEmail || !adminPass) return
  try {
    const exists = await pool.query("SELECT id_usuario FROM usuarios WHERE email = $1", [adminEmail])
    if (exists.rowCount === 0) {
      const hash = bcrypt.hashSync(adminPass, 10)
      await pool.query(
        "INSERT INTO usuarios (email, password, nombre, rol) VALUES ($1, $2, $3, $4)",
        [adminEmail, hash, 'Administrador', 'admin']
      )
      console.log('[OK] Usuario admin creado')
    }
  } catch(e) { console.error('[ERROR] initAdmin:', e.message) }
}
setTimeout(initAdmin, 2000)

// ── RUTAS PÚBLICAS ─────────────────────────────────────────
app.use('/api/auth', loginLimiter, authRouter)

// ── RUTAS PROTEGIDAS (Requieren JWT) ───────────────────────
app.use('/api', authMiddleware) // Guardia global para lo que sigue

app.use('/api/empleados', empleadosRouter)
app.use('/api/clientes',  clientesRouter)
app.use('/api/pedidos',   pedidosRouter)
app.use('/api/servicios', serviciosRouter)
app.use('/api/insumos',   insumosRouter)
app.use('/api/pagos',     pagosRouter)
app.use('/api/facturas',  facturasRouter)
app.use('/api/horarios',  horariosRouter)
app.use('/api/reportes',  reportesRouter)
app.use('/api/query',     queryRouter)

app.listen(PORT, () => {
  console.log(`[SERVER] Aquanova ejecutándose en el puerto ${PORT}`)
  console.log(`[SERVER] Modo: ${process.env.NODE_ENV || 'development'}`)
})
