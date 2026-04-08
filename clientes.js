import express from 'express'
import pool from './db.js'
import { ok, err } from './utils.js'

const router = express.Router()

router.get('/', async (req, res) => {
  try {
    const todos = req.query.todos === 'true'
    const q = todos
      ? 'SELECT * FROM clientes ORDER BY activo DESC, id_cliente'
      : 'SELECT * FROM clientes WHERE activo = true ORDER BY id_cliente'
    const r = await pool.query(q)
    ok(res, r.rows)
  } catch(e) { err(res, '[ERROR] al consultar clientes', e.message) }
})

router.post('/', async (req, res) => {
  const { nombre, telefono, email, direccion } = req.body
  if (!nombre) return err(res, '[ERROR] El nombre es obligatorio')
  try {
    const r = await pool.query(
      'INSERT INTO clientes (nombre,telefono,email,direccion,activo) VALUES ($1,$2,$3,$4,true) RETURNING *',
      [nombre, telefono || null, email || null, direccion || null]
    )
    ok(res, r.rows[0], '[OK] Cliente guardado')
  } catch(e) { err(res, '[ERROR] al guardar cliente', e.message) }
})

router.put('/:id', async (req, res) => {
  const { nombre, telefono, email, direccion } = req.body
  try {
    const r = await pool.query(
      'UPDATE clientes SET nombre=$1,telefono=$2,email=$3,direccion=$4 WHERE id_cliente=$5 RETURNING *',
      [nombre, telefono || null, email || null, direccion || null, req.params.id]
    )
    if (!r.rowCount) return err(res, '[ERROR] Cliente no encontrado')
    ok(res, r.rows[0], '[OK] Cliente actualizado')
  } catch(e) { err(res, '[ERROR] al actualizar cliente', e.message) }
})

router.patch('/:id/estado', async (req, res) => {
  const { activo } = req.body
  try {
    const r = await pool.query(
      'UPDATE clientes SET activo=$1 WHERE id_cliente=$2 RETURNING *',
      [activo, req.params.id]
    )
    if (!r.rowCount) return err(res, '[ERROR] Cliente no encontrado')
    ok(res, r.rows[0], activo ? '[OK] Cliente reactivado' : '[OK] Cliente desactivado')
  } catch(e) { err(res, '[ERROR] al cambiar estado', e.message) }
})

export default router
