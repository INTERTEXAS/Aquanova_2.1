import express from 'express'
import pool from './db.js'
import { ok, err } from './utils.js'

const router = express.Router()

router.get('/ingresos', async (req, res) => {
  const { desde, hasta } = req.query
  const d = desde || new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()
  const h = hasta || new Date().toISOString()
  try {
    const r = await pool.query(`
      SELECT DATE(pg.fecha_pago) AS fecha,
        COUNT(*) AS pagos, SUM(pg.monto) AS total,
        SUM(CASE WHEN pg.forma_pago='Efectivo'       THEN pg.monto ELSE 0 END) AS efectivo,
        SUM(CASE WHEN pg.forma_pago='Tarjeta'        THEN pg.monto ELSE 0 END) AS tarjeta,
        SUM(CASE WHEN pg.forma_pago='Transferencia'  THEN pg.monto ELSE 0 END) AS transferencia
      FROM pagos pg
      WHERE pg.fecha_pago BETWEEN $1 AND $2
      GROUP BY DATE(pg.fecha_pago)
      ORDER BY fecha DESC
    `, [d, h])
    ok(res, r.rows)
  } catch(e) { err(res, '[ERROR] en reporte de ingresos', e.message) }
})

router.get('/estados', async (req, res) => {
  const { desde, hasta } = req.query
  const d = desde || new Date(Date.now() - 30*24*60*60*1000).toISOString()
  const h = hasta || new Date().toISOString()
  try {
    const r = await pool.query(`
      SELECT estado_pedido, COUNT(*) AS total, SUM(total_cobrar) AS monto_total
      FROM pedidos WHERE created_at BETWEEN $1 AND $2
      GROUP BY estado_pedido ORDER BY total DESC
    `, [d, h])
    ok(res, r.rows)
  } catch(e) { err(res, '[ERROR] en reporte de estados', e.message) }
})

router.get('/stats', async (req, res) => {
  try {
    const [pedidos, clientes, empleados, alertas, facturas, horarios] = await Promise.all([
      pool.query('SELECT COUNT(*) FROM pedidos'),
      pool.query('SELECT COUNT(*) FROM clientes WHERE activo=true'),
      pool.query('SELECT COUNT(*) FROM empleados'),
      pool.query('SELECT COUNT(*) FROM inv_insumos WHERE cantidad_stock <= stock_minimo'),
      pool.query("SELECT COUNT(*) FROM facturas WHERE estado IN ('Pendiente','Emitida')"),
      pool.query(`SELECT COUNT(*) FROM horarios_empleados WHERE dia_semana = TRIM(TO_CHAR(NOW() AT TIME ZONE 'America/Mexico_City', 'Day'))`)
    ])
    ok(res, {
      pedidos:   parseInt(pedidos.rows[0].count),
      clientes:  parseInt(clientes.rows[0].count),
      empleados: parseInt(empleados.rows[0].count),
      alertas:   parseInt(alertas.rows[0].count),
      facturas:  parseInt(facturas.rows[0].count),
      horarios:  parseInt(horarios.rows[0].count),
    })
  } catch(e) { err(res, '[ERROR] al obtener stats', e.message) }
})

export default router
