import express from 'express'
import pool from './db.js'
import { ok, err, numPos } from './utils.js'

const router = express.Router()

router.get('/', async (req, res) => {
  try {
    const r = await pool.query(`
      SELECT pg.*, COALESCE(c.nombre,'Cliente eliminado') AS cliente
      FROM pagos pg
      JOIN pedidos  p ON pg.id_pedido = p.id_pedido
      LEFT JOIN clientes c ON p.id_cliente = c.id_cliente
      ORDER BY pg.fecha_pago DESC
    `)
    ok(res, r.rows)
  } catch(e) { err(res, '[ERROR] al consultar pagos', e.message) }
})

router.get('/pedido/:id', async (req, res) => {
  try {
    const r = await pool.query('SELECT * FROM pagos WHERE id_pedido=$1', [req.params.id])
    ok(res, r.rows)
  } catch(e) { err(res, '[ERROR] al consultar pago', e.message) }
})

router.post('/', async (req, res) => {
  const { id_pedido, monto, forma_pago, tipo_tarjeta, referencia_transferencia } = req.body
  if (!id_pedido || !monto) return err(res, '[ERROR] ID de pedido y monto son obligatorios')
  if (numPos(monto) <= 0) return err(res, '[ERROR] El monto debe ser mayor a cero')

  try {
    const dupCheck = await pool.query('SELECT id_pago FROM pagos WHERE id_pedido=$1', [id_pedido])
    if (dupCheck.rowCount > 0) return err(res, '[ERROR] Este pedido ya tiene un pago registrado')

    const r = await pool.query(
      `INSERT INTO pagos (id_pedido,monto,forma_pago,tipo_tarjeta,referencia_transferencia)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [id_pedido, numPos(monto), forma_pago,
       forma_pago === 'Tarjeta' ? tipo_tarjeta : null,
       forma_pago === 'Transferencia' ? referencia_transferencia : null]
    )
    ok(res, r.rows[0], '[OK] Pago registrado')
  } catch(e) { err(res, '[ERROR] al registrar pago', e.message) }
})

export default router
