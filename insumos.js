import express from 'express'
import pool from './db.js'
import { ok, err, numPos } from './utils.js'

const router = express.Router()

router.get('/', async (req, res) => {
  try {
    const r = await pool.query(`
      SELECT *, CASE WHEN cantidad_stock <= stock_minimo THEN true ELSE false END AS alerta_stock
      FROM inv_insumos ORDER BY nombre
    `)
    ok(res, r.rows)
  } catch(e) { err(res, '[ERROR] al consultar insumos', e.message) }
})

router.post('/', async (req, res) => {
  const { nombre, tipo_insumo, cantidad_stock, unidad_medida, stock_minimo, precio_compra } = req.body
  if (!nombre || !cantidad_stock) return err(res, '[ERROR] Nombre y cantidad son obligatorios')
  try {
    const r = await pool.query(
      `INSERT INTO inv_insumos (nombre,tipo_insumo,cantidad_stock,unidad_medida,stock_minimo,precio_compra)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [nombre, tipo_insumo || null, numPos(cantidad_stock), unidad_medida || 'pza',
       numPos(stock_minimo), numPos(precio_compra)]
    )
    ok(res, r.rows[0], '[OK] Insumo guardado')
  } catch(e) { err(res, '[ERROR] al guardar insumo', e.message) }
})

router.put('/:id', async (req, res) => {
  const { nombre, tipo_insumo, cantidad_stock, unidad_medida, stock_minimo, precio_compra } = req.body
  try {
    const r = await pool.query(
      `UPDATE inv_insumos SET nombre=$1,tipo_insumo=$2,cantidad_stock=$3,unidad_medida=$4,
       stock_minimo=$5,precio_compra=$6 WHERE id_insumo=$7 RETURNING *`,
      [nombre, tipo_insumo || null, numPos(cantidad_stock), unidad_medida,
       numPos(stock_minimo), numPos(precio_compra), req.params.id]
    )
    if (!r.rowCount) return err(res, '[ERROR] Insumo no encontrado')
    ok(res, r.rows[0], '[OK] Insumo actualizado')
  } catch(e) { err(res, '[ERROR] al actualizar insumo', e.message) }
})

router.delete('/:id', async (req, res) => {
  try {
    const r = await pool.query('DELETE FROM inv_insumos WHERE id_insumo=$1 RETURNING *', [req.params.id])
    if (!r.rowCount) return err(res, '[ERROR] Insumo no encontrado')
    ok(res, r.rows[0], '[OK] Insumo eliminado')
  } catch(e) { err(res, '[ERROR] al eliminar insumo', e.message) }
})

// Endpoints de uso de inventario ligados a pedidos
router.get('/uso/:id_pedido', async (req, res) => {
  try {
    const r = await pool.query(`
      SELECT ui.*, i.nombre AS insumo, i.unidad_medida
      FROM uso_inventario ui
      JOIN inv_insumos i ON ui.id_insumo = i.id_insumo
      WHERE ui.id_pedido = $1
    `, [req.params.id_pedido])
    ok(res, r.rows)
  } catch(e) { err(res, '[ERROR] al consultar uso de inventario', e.message) }
})

router.post('/uso', async (req, res) => {
  const { id_pedido, usos } = req.body
  if (!id_pedido || !usos || usos.length === 0) return err(res, '[ERROR] Datos incompletos')

  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    for (const u of usos) {
      if (!u.cantidad_medida || parseFloat(u.cantidad_medida) <= 0) continue
      await client.query(
        `INSERT INTO uso_inventario (id_pedido, id_insumo, cantidad_medida, unidad_medida, fecha)
         VALUES ($1,$2,$3,$4,NOW())`,
        [id_pedido, u.id_insumo, parseFloat(u.cantidad_medida), u.unidad_medida]
      )
      await client.query(
        'UPDATE inv_insumos SET cantidad_stock = cantidad_stock - $1 WHERE id_insumo = $2',
        [parseFloat(u.cantidad_medida), u.id_insumo]
      )
    }
    await client.query('UPDATE pedidos SET inventario_descontado = true WHERE id_pedido = $1', [id_pedido])
    await client.query('COMMIT')
    ok(res, null, '[OK] Inventario registrado y descontado')
  } catch(e) {
    await client.query('ROLLBACK')
    err(res, '[ERROR] al registrar uso de inventario', e.message)
  } finally {
    client.release()
  }
})

export default router
