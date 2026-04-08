import express from 'express'
import pool from './db.js'
import { ok, err, numPos } from './utils.js'

const router = express.Router()

router.get('/', async (req, res) => {
  try { const r = await pool.query('SELECT * FROM servicios ORDER BY costo'); ok(res, r.rows) }
  catch(e) { err(res, '[ERROR] al consultar servicios', e.message) }
})

router.post('/', async (req, res) => {
  const { nom_servicio, costo } = req.body
  if (!nom_servicio || !costo) return err(res, '[ERROR] Nombre y costo son obligatorios')
  try {
    const r = await pool.query(
      'INSERT INTO servicios (nom_servicio,costo) VALUES ($1,$2) RETURNING *',
      [nom_servicio, numPos(costo)]
    )
    ok(res, r.rows[0], '[OK] Servicio guardado')
  } catch(e) { err(res, '[ERROR] al guardar servicio', e.message) }
})

router.put('/:id', async (req, res) => {
  const { nom_servicio, costo } = req.body
  try {
    const r = await pool.query(
      'UPDATE servicios SET nom_servicio=$1,costo=$2 WHERE id_servicio=$3 RETURNING *',
      [nom_servicio, numPos(costo), req.params.id]
    )
    if (!r.rowCount) return err(res, '[ERROR] Servicio no encontrado')
    ok(res, r.rows[0], '[OK] Servicio actualizado')
  } catch(e) { err(res, '[ERROR] al actualizar servicio', e.message) }
})

router.delete('/:id', async (req, res) => {
  try {
    const r = await pool.query('DELETE FROM servicios WHERE id_servicio=$1 RETURNING *', [req.params.id])
    if (!r.rowCount) return err(res, '[ERROR] Servicio no encontrado')
    ok(res, r.rows[0], '[OK] Servicio eliminado')
  } catch(e) { err(res, '[ERROR] al eliminar servicio', e.message) }
})

export default router
