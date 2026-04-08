import express from 'express'
import pool from './db.js'
import { ok, err, numPos } from './utils.js'

const router = express.Router()

router.get('/', async (req, res) => {
  try {
    const r = await pool.query(`
      SELECT f.*, p.total_cobrar AS monto_pedido,
        COALESCE(c.nombre,'Cliente eliminado') AS nombre_cliente
      FROM facturas f
      JOIN pedidos  p ON f.id_pedido  = p.id_pedido
      LEFT JOIN clientes c ON f.id_cliente = c.id_cliente
      ORDER BY f.fecha_emision DESC
    `)
    ok(res, r.rows)
  } catch(e) { err(res, '[ERROR] al consultar facturas', e.message) }
})

router.post('/', async (req, res) => {
  const { id_pedido, id_cliente, serie_factura, num_factura, estado,
          subtotal, impuesto, total, rfc_cliente, razon_social,
          tipo_persona, giro_fiscal, uso_cfdi, metodo_impresion,
          url_pdf, correo_envio, notas } = req.body
  if (!id_pedido || !id_cliente) return err(res, '[ERROR] Pedido y cliente son obligatorios')

  try {
    const dupCheck = await pool.query('SELECT id_factura FROM facturas WHERE id_pedido=$1', [id_pedido])
    if (dupCheck.rowCount > 0) return err(res, '[ERROR] Este pedido ya tiene una factura generada')

    const r = await pool.query(
      `INSERT INTO facturas (id_pedido,id_cliente,serie_factura,num_factura,estado,
        subtotal,impuesto,total,rfc_cliente,razon_social,tipo_persona,giro_fiscal,
        uso_cfdi,metodo_impresion,url_pdf,correo_envio,notas)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17) RETURNING *`,
      [id_pedido, id_cliente, serie_factura || null, num_factura || null,
       estado || 'Pendiente', numPos(subtotal), numPos(impuesto), numPos(total),
       rfc_cliente || null, razon_social || null, tipo_persona || null,
       giro_fiscal || null, uso_cfdi || null, metodo_impresion || null,
       url_pdf || null, correo_envio || null, notas || null]
    )
    ok(res, r.rows[0], '[OK] Factura generada')
  } catch(e) { err(res, '[ERROR] al generar factura', e.message) }
})

router.put('/:id', async (req, res) => {
  const { estado, rfc_cliente, razon_social, tipo_persona, giro_fiscal,
          uso_cfdi, metodo_impresion, url_pdf, correo_envio, notas,
          subtotal, impuesto, total, serie_factura, num_factura } = req.body
  try {
    const r = await pool.query(
      `UPDATE facturas SET estado=$1,rfc_cliente=$2,razon_social=$3,tipo_persona=$4,
        giro_fiscal=$5,uso_cfdi=$6,metodo_impresion=$7,url_pdf=$8,correo_envio=$9,
        notas=$10,subtotal=$11,impuesto=$12,total=$13,serie_factura=$14,num_factura=$15
       WHERE id_factura=$16 RETURNING *`,
      [estado, rfc_cliente || null, razon_social || null, tipo_persona || null,
       giro_fiscal || null, uso_cfdi || null, metodo_impresion || null,
       url_pdf || null, correo_envio || null, notas || null,
       numPos(subtotal), numPos(impuesto), numPos(total),
       serie_factura || null, num_factura || null, req.params.id]
    )
    if (!r.rowCount) return err(res, '[ERROR] Factura no encontrada')
    ok(res, r.rows[0], '[OK] Factura actualizada')
  } catch(e) { err(res, '[ERROR] al actualizar factura', e.message) }
})

router.delete('/:id', async (req, res) => {
  try {
    const r = await pool.query('DELETE FROM facturas WHERE id_factura=$1 RETURNING *', [req.params.id])
    if (!r.rowCount) return err(res, '[ERROR] Factura no encontrada')
    ok(res, r.rows[0], '[OK] Factura eliminada')
  } catch(e) { err(res, '[ERROR] al eliminar factura', e.message) }
})

export default router
