import express from 'express'
import pool from './db.js'
import { ok, err } from './utils.js'

const router = express.Router()

router.get('/', async (req, res) => {
  try {
    const r = await pool.query(`
      SELECT h.*, e.nombre_empleado
      FROM horarios_empleados h
      JOIN empleados e ON h.id_empleado = e.id_empleado
      ORDER BY e.nombre_empleado,
        CASE h.dia_semana
          WHEN 'Lunes' THEN 1 WHEN 'Martes' THEN 2 WHEN 'Miércoles' THEN 3
          WHEN 'Jueves' THEN 4 WHEN 'Viernes' THEN 5 WHEN 'Sábado' THEN 6
          WHEN 'Domingo' THEN 7 END
    `)
    ok(res, r.rows)
  } catch(e) { err(res, '[ERROR] al consultar horarios', e.message) }
})

router.post('/', async (req, res) => {
  const { id_empleado, dia_semana, hora_entrada, hora_salida, turno } = req.body
  if (!id_empleado || !dia_semana || !hora_entrada || !hora_salida)
    return err(res, '[ERROR] Datos incompletos')
  try {
    const r = await pool.query(
      `INSERT INTO horarios_empleados (id_empleado,dia_semana,hora_entrada,hora_salida,turno)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [id_empleado, dia_semana, hora_entrada, hora_salida, turno || 'Matutino']
    )
    ok(res, r.rows[0], '[OK] Horario guardado')
  } catch(e) { err(res, '[ERROR] al guardar horario', e.message) }
})

router.put('/:id', async (req, res) => {
  const { dia_semana, hora_entrada, hora_salida, turno } = req.body
  if (!dia_semana || !hora_entrada || !hora_salida)
    return err(res, '[ERROR] Datos incompletos')
  try {
    const r = await pool.query(
      `UPDATE horarios_empleados
       SET dia_semana=$1, hora_entrada=$2, hora_salida=$3, turno=$4
       WHERE id_horario=$5 RETURNING *`,
      [dia_semana, hora_entrada, hora_salida, turno || 'Matutino', req.params.id]
    )
    if (!r.rowCount) return err(res, '[ERROR] Horario no encontrado')
    ok(res, r.rows[0], '[OK] Horario actualizado')
  } catch(e) { err(res, '[ERROR] al actualizar horario', e.message) }
})

router.delete('/:id', async (req, res) => {
  try {
    const r = await pool.query('DELETE FROM horarios_empleados WHERE id_horario=$1 RETURNING *', [req.params.id])
    if (!r.rowCount) return err(res, '[ERROR] Horario no encontrado')
    ok(res, r.rows[0], '[OK] Horario eliminado')
  } catch(e) { err(res, '[ERROR] al eliminar horario', e.message) }
})

export default router
