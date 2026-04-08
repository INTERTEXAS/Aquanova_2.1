import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import pool from './db.js'
import { ok, err } from './utils.js'

const router = express.Router()
const JWT_SECRET = process.env.JWT_SECRET

// Middleware JWT (local para uso en rutas de auth si se requiere)
export const authMiddleware = (req, res, next) => {
  const header = req.headers.authorization
  if (!header || !header.startsWith('Bearer '))
    return res.status(401).json({ ok:false, mensaje:'[UNAUTHORIZED] No autorizado — inicia sesión' })
  try {
    const token = header.split(' ')[1]
    req.usuario = jwt.verify(token, JWT_SECRET)
    next()
  } catch(e) {
    return res.status(401).json({ ok:false, mensaje:'[JWT] Token inválido o expirado' })
  }
}

router.post('/login', async (req, res) => {
  const { email, password } = req.body
  if (!email||!password) return res.status(400).json({ ok:false, mensaje:'[AUTH] Email y contraseña requeridos' })
  try {
    const r = await pool.query('SELECT * FROM usuarios WHERE email=$1 AND activo=true', [email])
    if (!r.rowCount) return res.status(401).json({ ok:false, mensaje:'[AUTH] Credenciales incorrectas' })
    const usuario = r.rows[0]
    if (!bcrypt.compareSync(password, usuario.password))
      return res.status(401).json({ ok:false, mensaje:'[AUTH] Credenciales incorrectas' })
    const token = jwt.sign(
      { id:usuario.id_usuario, email:usuario.email, nombre:usuario.nombre, rol:usuario.rol },
      JWT_SECRET, { expiresIn:'8h' }
    )
    ok(res, { token, nombre:usuario.nombre, email:usuario.email, rol:usuario.rol }, '[OK] Bienvenido')
  } catch(e) { err(res, '[ERROR] al iniciar sesión', e.message) }
})

router.get('/verify', authMiddleware, (req, res) => {
  ok(res, req.usuario, '[OK] Token válido')
})

export default router
