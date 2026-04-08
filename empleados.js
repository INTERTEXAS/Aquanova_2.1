import express from 'express'
import pool from './db.js'
import { ok, err, numPos } from './utils.js'
import { roleMiddleware } from './roleMiddleware.js'

const router = express.Router()

router.get('/', async (req, res) => {
  try { const r = await pool.query('SELECT * FROM empleados ORDER BY id_empleado'); ok(res, r.rows) }
  catch(e) { err(res, '[ERROR] al consultar empleados', e.message) }
})

router.post('/', async (req, res) => {
  const { nombre_empleado, puesto, departamento, salario } = req.body
  if (!nombre_empleado || !puesto) return err(res, '[ERROR] Nombre y puesto son obligatorios')
  try {
    const r = await pool.query(
      'INSERT INTO empleados (nombre_empleado,puesto,departamento,salario) VALUES ($1,$2,$3,$4) RETURNING *',
      [nombre_empleado, puesto, departamento || null, numPos(salario)]
    )
    ok(res, r.rows[0], '[OK] Empleado guardado')
  } catch(e) { err(res, '[ERROR] al guardar empleado', e.message) }
})

router.put('/:id', async (req, res) => {
  const { nombre_empleado, puesto, departamento, salario } = req.body
  try {
    const r = await pool.query(
      'UPDATE empleados SET nombre_empleado=$1,puesto=$2,departamento=$3,salario=$4 WHERE id_empleado=$5 RETURNING *',
      [nombre_empleado, puesto, departamento || null, numPos(salario), req.params.id]
    )
    if (!r.rowCount) return err(res, '[ERROR] Empleado no encontrado')
    ok(res, r.rows[0], '[OK] Empleado actualizado')
  } catch(e) { err(res, '[ERROR] al actualizar empleado', e.message) }
})

// Solo administradores pueden eliminar empleados físicamente
router.delete('/:id', roleMiddleware('admin'), async (req, res) => {
  try {
    const check = await pool.query('SELECT COUNT(*) FROM pedidos WHERE id_empleado=$1', [req.params.id])
    if (parseInt(check.rows[0].count) > 0)
      return err(res, '[ERROR] No se puede eliminar — el empleado tiene pedidos asociados. Desactívalo en su lugar.')
    const r = await pool.query('DELETE FROM empleados WHERE id_empleado=$1 RETURNING *', [req.params.id])
    if (!r.rowCount) return err(res, '[ERROR] Empleado no encontrado')
    ok(res, r.rows[0], '[OK] Empleado eliminado')
  } catch(e) { err(res, '[ERROR] al eliminar empleado', e.message) }
})

export default router
