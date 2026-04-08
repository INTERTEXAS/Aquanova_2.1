import express from 'express'
import pool from './db.js'
import { ok, err } from './utils.js'
import { roleMiddleware } from './roleMiddleware.js'

const router = express.Router()

// Restringir estrictamente a administradores
router.post('/', roleMiddleware('admin'), async (req, res) => {
  const { sql } = req.body
  if (!sql || !sql.trim().toUpperCase().startsWith('SELECT'))
    return err(res, '[SECURITY] Solo se permiten consultas SELECT')
  try {
    const r = await pool.query(sql)
    ok(res, { rows: r.rows, fields: r.fields.map(f => f.name), total: r.rowCount })
  } catch(e) { err(res, '[ERROR] en la consulta', e.message) }
})

export default router
