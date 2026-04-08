import express from 'express'
import pool from './db.js'
import { ok, err, numPos } from './utils.js'

const router = express.Router()

router.get('/', async (req, res) => {
  try {
    const r = await pool.query(`
      SELECT p.*,
        COALESCE(c.nombre, 'Cliente eliminado') AS cliente,
        COALESCE(e.nombre_empleado, 'Empleado eliminado') AS empleado,
        EXISTS(SELECT 1 FROM pagos pg WHERE pg.id_pedido = p.id_pedido) AS tiene_pago
      FROM pedidos p
      LEFT JOIN clientes  c ON p.id_cliente  = c.id_cliente
      LEFT JOIN empleados e ON p.id_empleado = e.id_empleado
      ORDER BY p.id_pedido DESC
    `)
    ok(res, r.rows)
  } catch(e) { err(res, '[ERROR] al consultar pedidos', e.message) }
})

router.post('/', async (req, res) => {
  const { id_cliente, id_empleado, estado_pedido, fecha_entrega, servicios } = req.body
  if (!id_cliente || !id_empleado) return err(res, '[ERROR] Cliente y empleado son obligatorios')
  if (!servicios || servicios.length === 0) return err(res, '[ERROR] Selecciona al menos un servicio')

  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    const total = servicios.reduce((sum, s) => sum + parseFloat(s.costo || 0), 0)

    const pedidoR = await client.query(
      `INSERT INTO pedidos (id_cliente, id_empleado, total_cobrar, estado_pedido, fecha_entrega)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [id_cliente, id_empleado, total, estado_pedido || 'Pendiente', fecha_entrega || null]
    )
    const pedido = pedidoR.rows[0]

    for (const s of servicios) {
      await client.query(
        `INSERT INTO detalle_pedido (id_pedido, id_servicio, cantidad, subtotal)
         VALUES ($1,$2,$3,$4)`,
        [pedido.id_pedido, s.id_servicio, 1, parseFloat(s.costo || 0)]
      )
    }

    await client.query('COMMIT')
    ok(res, pedido, '[OK] Pedido guardado')
  } catch(e) {
    await client.query('ROLLBACK')
    err(res, '[ERROR] al guardar pedido', e.message)
  } finally {
    client.release()
  }
})

router.put('/:id', async (req, res) => {
  const { estado_pedido, total_cobrar, fecha_entrega } = req.body
  const id = req.params.id
  try {
    const prev = await pool.query('SELECT estado_pedido, inventario_descontado FROM pedidos WHERE id_pedido=$1', [id])
    if (!prev.rowCount) return err(res, '[ERROR] Pedido no encontrado')

    const estabaEntregado = prev.rows[0].inventario_descontado
    const ahoraEntregado  = estado_pedido === 'Entregado'
    const ahora_cancelado = estado_pedido === 'Cancelado'

    const r = await pool.query(
      'UPDATE pedidos SET estado_pedido=$1,total_cobrar=$2,fecha_entrega=$3 WHERE id_pedido=$4 RETURNING *',
      [estado_pedido, numPos(total_cobrar), fecha_entrega || null, id]
    )

    ok(res, {
      ...r.rows[0],
      mostrar_modal_inventario: ahoraEntregado && !estabaEntregado && !ahora_cancelado
    }, '[OK] Pedido actualizado')
  } catch(e) { err(res, '[ERROR] al actualizar pedido', e.message) }
})

router.get('/detalle/:id', async (req, res) => {
  try {
    const r = await pool.query(`
      SELECT dp.*, s.nom_servicio, s.costo
      FROM detalle_pedido dp
      JOIN servicios s ON dp.id_servicio = s.id_servicio
      WHERE dp.id_pedido = $1
    `, [req.params.id])
    ok(res, r.rows)
  } catch(e) { err(res, '[ERROR] al consultar detalle', e.message) }
})

export default router
