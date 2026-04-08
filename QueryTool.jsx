import { useState } from 'react'
import { toast as sileo } from "./CustomToaster"
import { Search, Play, Trash2, Zap } from 'lucide-react'
import { apiFetch } from '../hooks/useApi'
import { Card, CardTitle, PageTitle, Btn, BtnRow, Table } from './UI'

const QUICK = [
  { label:'Pedidos + clientes',    sql:`SELECT p.id_pedido, c.nombre AS cliente, e.nombre_empleado AS empleado, p.total_cobrar, p.estado_pedido FROM pedidos p JOIN clientes c ON p.id_cliente=c.id_cliente JOIN empleados e ON p.id_empleado=e.id_empleado ORDER BY p.id_pedido DESC;` },
  { label:'Stock de insumos',      sql:`SELECT nombre, cantidad_stock, unidad_medida, stock_minimo, CASE WHEN cantidad_stock <= stock_minimo THEN 'BAJO' ELSE 'OK' END AS estado FROM inv_insumos ORDER BY nombre;` },
  { label:'Ventas por empleado',   sql:`SELECT e.nombre_empleado, COUNT(p.id_pedido) AS pedidos, SUM(p.total_cobrar) AS total FROM pedidos p JOIN empleados e ON p.id_empleado=e.id_empleado GROUP BY e.nombre_empleado ORDER BY total DESC;` },
  { label:'Historial de pagos',    sql:`SELECT pg.id_pago, c.nombre, pg.monto, pg.forma_pago, pg.tipo_tarjeta, pg.referencia_transferencia, pg.fecha_pago FROM pagos pg JOIN pedidos p ON pg.id_pedido=p.id_pedido JOIN clientes c ON p.id_cliente=c.id_cliente ORDER BY pg.fecha_pago DESC;` },
  { label:'Servicios por precio',  sql:`SELECT * FROM servicios ORDER BY costo ASC;` },
  { label:'Clientes recientes',    sql:`SELECT * FROM clientes ORDER BY fecha_registro DESC;` },
  { label:'Facturas',              sql:`SELECT f.id_factura, f.serie_factura, f.num_factura, c.nombre AS cliente, f.subtotal, f.impuesto, f.total, f.estado, f.rfc_cliente, f.razon_social, f.fecha_emision FROM facturas f JOIN pedidos p ON f.id_pedido=p.id_pedido LEFT JOIN clientes c ON f.id_cliente=c.id_cliente ORDER BY f.fecha_emision DESC;` },
]

export default function QueryTool() {
  const [sql, setSql]         = useState('')
  const [result, setResult]   = useState(null)
  const [error, setError]     = useState(null)
  const [running, setRunning] = useState(false)

  const ejecutar = async () => {
    if (!sql.trim()) { sileo.error({ title:'Escribe una consulta SQL primero' }); return }
    setRunning(true); setResult(null); setError(null)
    const r = await apiFetch('POST', '/query', { sql })
    setRunning(false)
    if (r.ok) { setResult(r.datos); sileo.success({ title:'Consulta completada', description:`${r.datos.total} fila(s)` }) }
    else { setError(r.error||r.mensaje); sileo.error({ title:'Error en la consulta', description:r.error }) }
  }

  return (
    <div>
      <PageTitle subtitle="consultas sql directas">Query Tool</PageTitle>
      <Card>
        <CardTitle icon={<Search size={13} color="var(--agua)" strokeWidth={2} />}>Editor SQL</CardTitle>

        <div style={{ marginBottom:14 }}>
          <label style={{ display:'block', marginBottom:6, fontSize:'0.58rem', color:'var(--txt-muted)', letterSpacing:'.1em', textTransform:'uppercase', fontFamily:"'JetBrains Mono',monospace" }}>
            Consulta · Solo SELECT permitido · Ctrl+Enter para ejecutar
          </label>
          <textarea
            value={sql}
            onChange={e => setSql(e.target.value)}
            onKeyDown={e => { if (e.ctrlKey && e.key === 'Enter') ejecutar() }}
            placeholder="SELECT * FROM clientes;"
            style={{
              width:'100%', minHeight:110, resize:'vertical',
              background:'var(--bg-base)',
              border:'1px solid var(--brd)',
              borderRadius:6, padding:'12px 14px',
              fontFamily:"'JetBrains Mono',monospace", fontSize:'0.8rem',
              color:'var(--agua)', lineHeight:1.8,
              outline:'none', transition:'border-color .15s',
              caretColor:'var(--agua)',
            }}
            onFocus={e => { e.target.style.borderColor='var(--agua)'; e.target.style.boxShadow='0 0 0 2px var(--agua-dim)' }}
            onBlur={e => { e.target.style.borderColor='var(--brd)'; e.target.style.boxShadow='none' }}
          />
        </div>

        <BtnRow style={{ marginBottom:16 }}>
          <Btn variant="primary" onClick={ejecutar} disabled={running}>
            <Play size={11} strokeWidth={2.5} />
            {running ? 'Ejecutando...' : 'Ejecutar'}
          </Btn>
          <Btn variant="ghost" onClick={() => { setSql(''); setResult(null); setError(null) }}>
            <Trash2 size={11} strokeWidth={2} /> Limpiar
          </Btn>
        </BtnRow>

        {/* Quick queries */}
        <div style={{ borderTop:'1px solid var(--brd)', paddingTop:14 }}>
          <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:10 }}>
            <Zap size={11} color="var(--ambar)" strokeWidth={2} />
            <span style={{ fontSize:'0.58rem', color:'var(--txt-muted)', letterSpacing:'.1em', textTransform:'uppercase', fontFamily:"'JetBrains Mono',monospace" }}>Consultas rápidas</span>
          </div>
          <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
            {QUICK.map(q => (
              <button key={q.label} onClick={() => setSql(q.sql)}
                style={{ padding:'4px 10px', borderRadius:4, border:'1px solid var(--brd)', background:'var(--bg-raised)', color:'var(--txt-secondary)', fontSize:'0.68rem', cursor:'pointer', fontFamily:"'Inter',monospace", transition:'all .12s' }}
                onMouseEnter={e => { e.target.style.borderColor='var(--agua-brd)'; e.target.style.color='var(--agua)'; e.target.style.background='var(--agua-dim)' }}
                onMouseLeave={e => { e.target.style.borderColor='var(--brd)'; e.target.style.color='var(--txt-secondary)'; e.target.style.background='var(--bg-raised)' }}
              >
                {q.label}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div style={{ marginTop:14, padding:'10px 14px', background:'var(--danger-dim)', border:'1px solid var(--danger-brd)', borderRadius:6, color:'var(--danger)', fontSize:'0.76rem', fontFamily:"'JetBrains Mono',monospace" }}>
            Error: {error}
          </div>
        )}

        {result && result.rows.length > 0 && (
          <div style={{ marginTop:14 }}>
            <div style={{ marginBottom:8, fontSize:'0.6rem', color:'var(--txt-muted)', fontFamily:"'JetBrains Mono',monospace", letterSpacing:'.06em' }}>
              {result.total} FILA(S) ENCONTRADA(S)
            </div>
            <Table columns={result.fields} rows={result.rows.map(row => result.fields.map(f => String(row[f] ?? '—')))} />
          </div>
        )}
      </Card>
    </div>
  )
}
