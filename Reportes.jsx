import { useState, useEffect } from 'react'
import { BarChart3, TrendingUp, Users, UserCheck, AlertTriangle, CreditCard, Download, RefreshCw, Calendar } from 'lucide-react'
import { apiFetch } from '../hooks/useApi'
import { Card, CardTitle, PageTitle, Badge, Btn, BtnRow, Field, Input, Select, Table } from './UI'

// ── Filtros de fecha ──────────────────────────────────────────
const hoy = () => new Date().toISOString().split('T')[0]
const hace = (dias) => new Date(Date.now() - dias*24*60*60*1000).toISOString().split('T')[0]
const inicioMes = () => { const d = new Date(); d.setDate(1); return d.toISOString().split('T')[0] }
const inicioAnio = () => `${new Date().getFullYear()}-01-01`

const ACCESOS_RAPIDOS = [
  { label:'Hoy',       desde: hoy(),        hasta: hoy() },
  { label:'7 días',    desde: hace(7),       hasta: hoy() },
  { label:'Este mes',  desde: inicioMes(),   hasta: hoy() },
  { label:'Este año',  desde: inicioAnio(),  hasta: hoy() },
]

function FiltroFechas({ desde, hasta, onDesde, onHasta, onAcceso }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:10, flexWrap:'wrap', marginBottom:16, padding:'10px 14px', background:'var(--bg-elevated)', borderRadius:8, border:'1px solid var(--brd)' }}>
      <Calendar size={13} color="var(--txt-muted)" strokeWidth={1.8} />
      <div style={{ display:'flex', gap:6 }}>
        {ACCESOS_RAPIDOS.map(a => (
          <button key={a.label} onClick={() => onAcceso(a.desde, a.hasta)}
            style={{ padding:'3px 10px', borderRadius:4, border:'1px solid var(--brd)', background:'transparent', color:'var(--txt-secondary)', fontSize:'0.68rem', cursor:'pointer', fontFamily:"'Inter',monospace", transition:'all .12s' }}
            onMouseEnter={e=>{e.currentTarget.style.borderColor='var(--agua-brd)';e.currentTarget.style.color='var(--agua)';e.currentTarget.style.background='var(--agua-dim)'}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--brd)';e.currentTarget.style.color='var(--txt-secondary)';e.currentTarget.style.background='transparent'}}>
            {a.label}
          </button>
        ))}
      </div>
      <div style={{ display:'flex', alignItems:'center', gap:6, marginLeft:'auto' }}>
        <Field label="Desde">
          <Input type="date" value={desde} onChange={e=>onDesde(e.target.value)} style={{ height:28,fontSize:'0.75rem',width:130 }} />
        </Field>
        <Field label="Hasta">
          <Input type="date" value={hasta} onChange={e=>onHasta(e.target.value)} style={{ height:28,fontSize:'0.75rem',width:130 }} />
        </Field>
      </div>
    </div>
  )
}

// ── Exportar a CSV ────────────────────────────────────────────
function exportCSV(data, filename) {
  if (!data || data.length === 0) return
  const headers = Object.keys(data[0])
  const rows = data.map(r => headers.map(h => `"${r[h] ?? ''}"`).join(','))
  const csv  = [headers.join(','), ...rows].join('\n')
  const blob = new Blob([csv], { type:'text/csv;charset=utf-8;' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href = url; a.download = `${filename}.csv`; a.click()
  URL.revokeObjectURL(url)
}

// ── Tarjeta de reporte ────────────────────────────────────────
function ReporteCard({ titulo, icon, color, endpoint, columns, mapRow, filename, defaultDesde, defaultHasta, sinFiltro }) {
  const [data, setData]   = useState([])
  const [desde, setDesde] = useState(defaultDesde || inicioMes())
  const [hasta, setHasta] = useState(defaultHasta || hoy())
  const [cargando, setCargando] = useState(false)

  const cargar = async (d = desde, h = hasta) => {
    setCargando(true)
    const params = sinFiltro ? '' : `?desde=${d}&hasta=${h}`
    const r = await apiFetch('GET', `${endpoint}${params}`)
    setData(r.datos || [])
    setCargando(false)
  }

  useEffect(() => { cargar() }, [])

  const setAcceso = (d, h) => { setDesde(d); setHasta(h); cargar(d, h) }

  const rows = data.map(mapRow)

  return (
    <Card accent={color}>
      <CardTitle icon={icon} accent={color}>{titulo}</CardTitle>

      {!sinFiltro && (
        <FiltroFechas
          desde={desde} hasta={hasta}
          onDesde={v => setDesde(v)}
          onHasta={v => setHasta(v)}
          onAcceso={setAcceso}
        />
      )}

      <BtnRow style={{ marginBottom:12 }}>
        <Btn variant="primary" onClick={() => cargar()} disabled={cargando}>
          <RefreshCw size={11} strokeWidth={2} style={{ animation: cargando ? 'spin .8s linear infinite' : 'none' }} />
          {cargando ? 'Cargando...' : 'Actualizar'}
        </Btn>
        <Btn variant="ghost" onClick={() => exportCSV(data, filename)} disabled={data.length === 0}>
          <Download size={11} strokeWidth={2} /> Exportar CSV
        </Btn>
        <span style={{ fontSize:'0.6rem', color:'var(--txt-muted)', fontFamily:"'JetBrains Mono',monospace", marginLeft:'auto' }}>
          {data.length} registro(s)
        </span>
      </BtnRow>

      <Table columns={columns} rows={rows} emptyMsg="Sin datos para el período seleccionado" />
    </Card>
  )
}

export default function Reportes() {
  return (
    <div>
      <PageTitle subtitle="análisis y métricas">Reportes</PageTitle>

      <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>

      {/* 1. Ingresos por período */}
      <ReporteCard
        titulo="Ingresos por período"
        icon={<TrendingUp size={13} color="var(--agua)" strokeWidth={2} />}
        color="var(--agua)"
        endpoint="/reportes/ingresos"
        filename="ingresos"
        columns={['Fecha','Pagos','Total','Efectivo','Tarjeta','Transferencia']}
        mapRow={r => [
          <span style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:'0.76rem' }}>{r.fecha}</span>,
          <Badge type="cyan">{r.pagos}</Badge>,
          <strong style={{ fontFamily:"'JetBrains Mono',monospace",color:'var(--agua)' }}>${parseFloat(r.total||0).toFixed(2)}</strong>,
          <span style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:'0.74rem' }}>${parseFloat(r.efectivo||0).toFixed(2)}</span>,
          <span style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:'0.74rem' }}>${parseFloat(r.tarjeta||0).toFixed(2)}</span>,
          <span style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:'0.74rem' }}>${parseFloat(r.transferencia||0).toFixed(2)}</span>,
        ]}
      />

      {/* 2. Pedidos por estado */}
      <ReporteCard
        titulo="Pedidos por estado"
        icon={<BarChart3 size={13} color="var(--ambar)" strokeWidth={2} />}
        color="var(--ambar)"
        endpoint="/reportes/estados"
        filename="estados_pedidos"
        defaultDesde={hace(30)}
        columns={['Estado','Total pedidos','Monto total']}
        mapRow={r => [
          <Badge type={{ 'Entregado':'ok','En proceso':'warn','Listo':'cyan','Pendiente':'err','Cancelado':'err' }[r.estado_pedido]||'cyan'}>
            {r.estado_pedido}
          </Badge>,
          <span style={{ fontFamily:"'JetBrains Mono',monospace" }}>{r.total}</span>,
          <span style={{ fontFamily:"'JetBrains Mono',monospace",color:'var(--ambar)' }}>${parseFloat(r.monto_total||0).toFixed(2)}</span>,
        ]}
      />

      {/* 3. Clientes frecuentes */}
      <ReporteCard
        titulo="Clientes frecuentes — Top 10"
        icon={<Users size={13} color="#a78bfa" strokeWidth={2} />}
        color="#a78bfa"
        endpoint="/reportes/clientes-frecuentes"
        filename="clientes_frecuentes"
        defaultDesde={hace(90)}
        columns={['Cliente','Pedidos','Gasto total','Último pedido']}
        mapRow={r => [
          <strong>{r.nombre}</strong>,
          <Badge type="cyan">{r.total_pedidos}</Badge>,
          <strong style={{ fontFamily:"'JetBrains Mono',monospace",color:'var(--success)' }}>${parseFloat(r.gasto_total||0).toFixed(2)}</strong>,
          <span style={{ fontSize:'0.72rem',color:'var(--txt-secondary)' }}>
            {r.ultimo_pedido ? new Date(r.ultimo_pedido).toLocaleDateString('es-MX') : '—'}
          </span>,
        ]}
      />

      {/* 4. Rendimiento por empleado */}
      <ReporteCard
        titulo="Rendimiento por empleado"
        icon={<UserCheck size={13} color="var(--success)" strokeWidth={2} />}
        color="var(--success)"
        endpoint="/reportes/empleados"
        filename="rendimiento_empleados"
        defaultDesde={hace(30)}
        columns={['Empleado','Pedidos','Entregados','Cancelados','Monto generado']}
        mapRow={r => [
          <strong>{r.nombre_empleado}</strong>,
          <Badge type="cyan">{r.pedidos_atendidos||0}</Badge>,
          <Badge type="ok">{r.entregados||0}</Badge>,
          <Badge type="err">{r.cancelados||0}</Badge>,
          <strong style={{ fontFamily:"'JetBrains Mono',monospace",color:'var(--success)' }}>${parseFloat(r.monto_generado||0).toFixed(2)}</strong>,
        ]}
      />

      {/* 5. Stock bajo */}
      <ReporteCard
        titulo="Alertas de stock bajo"
        icon={<AlertTriangle size={13} color="var(--danger)" strokeWidth={2} />}
        color="var(--danger)"
        endpoint="/reportes/stock-bajo"
        filename="stock_bajo"
        sinFiltro
        columns={['Insumo','Tipo','Stock actual','Mínimo','Faltante','Unidad','Precio compra']}
        mapRow={r => [
          <strong>{r.nombre}</strong>,
          r.tipo_insumo || '—',
          <span style={{ color:'var(--danger)',fontFamily:"'JetBrains Mono',monospace",fontWeight:700 }}>{r.cantidad_stock}</span>,
          <span style={{ fontFamily:"'JetBrains Mono',monospace" }}>{r.stock_minimo}</span>,
          <Badge type="err">{r.cantidad_faltante}</Badge>,
          r.unidad_medida,
          <span style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:'0.74rem' }}>${parseFloat(r.precio_compra||0).toFixed(2)}</span>,
        ]}
      />

      {/* 6. Pagos por forma */}
      <ReporteCard
        titulo="Desglose de pagos por forma"
        icon={<CreditCard size={13} color="#f472b6" strokeWidth={2} />}
        color="#f472b6"
        endpoint="/reportes/pagos-forma"
        filename="pagos_forma"
        columns={['Forma de pago','Cantidad','Total','Promedio','Mínimo','Máximo']}
        mapRow={r => [
          <Badge type={{ 'Efectivo':'ok','Tarjeta':'cyan','Transferencia':'yellow' }[r.forma_pago]||'cyan'}>{r.forma_pago}</Badge>,
          <Badge type="cyan">{r.cantidad}</Badge>,
          <strong style={{ fontFamily:"'JetBrains Mono',monospace",color:'var(--success)' }}>${parseFloat(r.total||0).toFixed(2)}</strong>,
          <span style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:'0.74rem' }}>${parseFloat(r.promedio||0).toFixed(2)}</span>,
          <span style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:'0.74rem' }}>${parseFloat(r.minimo||0).toFixed(2)}</span>,
          <span style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:'0.74rem' }}>${parseFloat(r.maximo||0).toFixed(2)}</span>,
        ]}
      />
    </div>
  )
}
