import { useState, useEffect, useRef } from 'react'
import { toast as sileo } from "./CustomToaster"
import { ClipboardList, Plus, Save, Pencil, X, Check, PackageCheck } from 'lucide-react'
import { useApi, apiFetch } from '../hooks/useApi'
import { Card, CardTitle, PageTitle, Badge, Btn, BtnRow, FormGrid, Field, Input, Select, Table } from './UI'

// ── Reloj en tiempo real ──────────────────────────────────────
function AutoClock() {
  const [now, setNow] = useState(new Date())
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  const hhmm = now.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: false })
  const ss = now.toLocaleTimeString('es-MX', { second: '2-digit' })
  const date = now.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      fontFamily: "'JetBrains Mono', monospace",
      letterSpacing: '.02em',
    }}>
      {/* Indicador de pulso (Sistema Vivo) */}
      <div style={{ position: 'relative', width: 6, height: 6 }}>
        <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'var(--agua)', animation: 'pulse-ring 2s infinite' }} />
        <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'var(--agua)', border: '1px solid var(--bg-base)' }} />
      </div>

      {/* Hora Principal */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 2 }}>
        <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--txt-primary)' }}>{hhmm}</span>
        <span style={{ fontSize: '0.65rem', fontWeight: 500, color: 'var(--agua)', opacity: 0.8 }}>:{ss}</span>
      </div>

      {/* Separador */}
      <div style={{ width: 1, height: 12, background: 'var(--brd-med)' }} />

      {/* Fecha */}
      <span style={{ fontSize: '0.62rem', fontWeight: 500, color: 'var(--txt-muted)', textTransform: 'uppercase' }}>
        {date}
      </span>
    </div>
  )
}

// ── Modal inventario ──────────────────────────────────────────
function ModalInventario({ pedidoId, insumos, onConfirm, onSkip }) {
  const [usos, setUsos] = useState(
    insumos.map(i => ({ id_insumo:i.id_insumo, nombre:i.nombre, unidad_medida:i.unidad_medida, cantidad_medida:'' }))
  )
  const setU = (idx, v) => setUsos(u => u.map((x,i) => i===idx ? {...x, cantidad_medida:v} : x))
  return (
    <div style={{ position:'fixed',inset:0,zIndex:9000,background:'rgba(0,0,0,0.75)',backdropFilter:'blur(4px)',display:'flex',alignItems:'center',justifyContent:'center',padding:20 }}>
      <div style={{ background:'var(--bg-surface)',border:'1px solid var(--brd-med)',borderRadius:14,padding:28,width:'100%',maxWidth:480,maxHeight:'80vh',overflowY:'auto',boxShadow:'var(--shadow-lg)' }}>
        <div style={{ display:'flex',alignItems:'center',gap:10,marginBottom:20 }}>
          <PackageCheck size={18} color="var(--ambar)" strokeWidth={2} />
          <div>
            <div style={{ fontFamily:"'Inter',sans-serif",fontWeight:700,fontSize:'0.9rem',color:'var(--txt-primary)' }}>Pedido #{pedidoId} entregado</div>
            <div style={{ fontSize:'0.65rem',color:'var(--txt-muted)',marginTop:2 }}>Registra los insumos utilizados para descontar del inventario</div>
          </div>
        </div>
        <div style={{ display:'flex',flexDirection:'column',gap:8,marginBottom:20 }}>
          {usos.map((u,i) => (
            <div key={u.id_insumo} style={{ display:'flex',alignItems:'center',gap:10,padding:'10px 14px',background:'var(--bg-elevated)',borderRadius:8,border:'1px solid var(--brd)' }}>
              <div style={{ flex:1,fontSize:'0.8rem',color:'var(--txt-primary)',fontWeight:500 }}>{u.nombre}</div>
              <Input type="number" placeholder="0" step="0.01" value={u.cantidad_medida} onChange={e=>setU(i,e.target.value)} style={{ width:90,height:32,padding:'0 8px',fontSize:'0.78rem' }} />
              <span style={{ fontSize:'0.68rem',color:'var(--txt-muted)',minWidth:30,fontFamily:"'JetBrains Mono',monospace" }}>{u.unidad_medida}</span>
            </div>
          ))}
        </div>
        <div style={{ display:'flex',gap:8 }}>
          <Btn variant="success" onClick={() => onConfirm(usos)} style={{ flex:1 }}><Check size={12} strokeWidth={2.5} />Confirmar y descontar</Btn>
          <Btn variant="ghost" onClick={onSkip}>Omitir</Btn>
        </div>
      </div>
    </div>
  )
}

// ── Panel checkboxes de servicios ─────────────────────────────
function PanelServicios({ servicios, seleccionados, onToggle, total }) {
  return (
    <div style={{ gridColumn:'1/-1',background:'var(--bg-elevated)',border:'1px solid var(--brd)',borderRadius:8,overflow:'hidden' }}>
      <div style={{ padding:'10px 14px',borderBottom:'1px solid var(--brd)',display:'flex',justifyContent:'space-between',alignItems:'center' }}>
        <span style={{ fontSize:'0.65rem',color:'var(--txt-muted)',letterSpacing:'.08em',textTransform:'uppercase',fontFamily:"'JetBrains Mono',monospace" }}>Selecciona los servicios</span>
        <span style={{ fontFamily:"'Inter',sans-serif",fontWeight:800,fontSize:'1rem',color: total>0?'var(--agua)':'var(--txt-muted)' }}>
          Total: ${total.toFixed(2)}
        </span>
      </div>
      <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fill, minmax(160px,1fr))',gap:1,background:'var(--brd)' }}>
        {servicios.map(s => {
          const sel = seleccionados.includes(s.id_servicio)
          return (
            <button key={s.id_servicio} onClick={() => onToggle(s)}
              style={{ padding:'12px 14px',background:sel?'var(--agua-dim)':'var(--bg-surface)',border:'none',borderLeft:`2px solid ${sel?'var(--agua)':'transparent'}`,cursor:'pointer',textAlign:'left',transition:'all .12s',display:'flex',flexDirection:'column',gap:4 }}
              onMouseEnter={e=>{ if(!sel) e.currentTarget.style.background='var(--bg-hover)' }}
              onMouseLeave={e=>{ if(!sel) e.currentTarget.style.background='var(--bg-surface)' }}
            >
              <div style={{ display:'flex',alignItems:'center',gap:6 }}>
                <div style={{ width:14,height:14,borderRadius:3,border:`1.5px solid ${sel?'var(--agua)':'var(--brd-med)'}`,background:sel?'var(--agua)':'transparent',display:'grid',placeItems:'center',flexShrink:0,transition:'all .12s' }}>
                  {sel && <Check size={9} color="var(--bg-base)" strokeWidth={3} />}
                </div>
                <span style={{ fontSize:'0.78rem',fontWeight:sel?600:400,color:sel?'var(--agua)':'var(--txt-primary)' }}>{s.nom_servicio}</span>
              </div>
              <span style={{ fontSize:'0.68rem',color:sel?'var(--agua)':'var(--txt-muted)',fontFamily:"'JetBrains Mono',monospace",marginLeft:20 }}>${parseFloat(s.costo).toFixed(2)}</span>
            </button>
          )
        })}
      </div>
      {servicios.length === 0 && (
        <div style={{ padding:24,textAlign:'center',fontSize:'0.75rem',color:'var(--txt-muted)' }}>
          No hay servicios en el catálogo. Agrégalos primero en Servicios.
        </div>
      )}
    </div>
  )
}

export default function Pedidos({ onRefresh }) {
  const { call, loading } = useApi()
  const [pedidos, setPedidos]     = useState([])
  const [clientes, setClientes]   = useState([])
  const [empleados, setEmpleados] = useState([])
  const [servicios, setServicios] = useState([])
  const [insumos, setInsumos]     = useState([])
  const [form, setForm]           = useState({ id_cliente:'', id_empleado:'', estado_pedido:'Pendiente' })
  const [selServicios, setSelServicios] = useState([])
  const [editId, setEditId]       = useState(null)
  const [editForm, setEditForm]   = useState({})
  const [modalInv, setModalInv]   = useState(null)

  const load = async () => {
    const [rp,rc,re,rs,ri] = await Promise.all([
      apiFetch('GET','/pedidos'), apiFetch('GET','/clientes'),
      apiFetch('GET','/empleados'), apiFetch('GET','/servicios'),
      apiFetch('GET','/insumos'),
    ])
    setPedidos(rp.datos||[]); setClientes(rc.datos||[])
    setEmpleados(re.datos||[]); setServicios(rs.datos||[])
    setInsumos(ri.datos||[])
  }
  useEffect(() => { load() }, [])
  const set = (k,v) => setForm(f=>({...f,[k]:v}))

  const totalSeleccionado = servicios
    .filter(s => selServicios.includes(s.id_servicio))
    .reduce((sum,s) => sum + parseFloat(s.costo||0), 0)

  const toggleServicio = s => setSelServicios(prev =>
    prev.includes(s.id_servicio) ? prev.filter(id=>id!==s.id_servicio) : [...prev, s.id_servicio]
  )

  // CREATE — fecha_recibida la asigna el servidor con NOW()
  const guardar = async () => {
    if (!form.id_cliente||!form.id_empleado) { sileo.error({ title:'Cliente y empleado son obligatorios' }); return }
    if (selServicios.length===0) { sileo.error({ title:'Selecciona al menos un servicio' }); return }
    const serviciosSeleccionados = servicios.filter(s => selServicios.includes(s.id_servicio))
    const r = await call('POST','/pedidos',{ ...form, servicios:serviciosSeleccionados })
    if (r.ok) {
      sileo.success({ title:r.mensaje, description:`Pedido #${r.datos.id_pedido} · $${totalSeleccionado.toFixed(2)}` })
      setForm({ id_cliente:'', id_empleado:'', estado_pedido:'Pendiente' })
      setSelServicios([])
      load(); onRefresh()
    } else sileo.error({ title:r.mensaje, description:r.error })
  }

  // UPDATE
  const startEdit = p => { setEditId(p.id_pedido); setEditForm({ estado_pedido:p.estado_pedido, total_cobrar:p.total_cobrar }) }
  const cancelEdit = () => { setEditId(null); setEditForm({}) }
  const saveEdit = async id => {
    const r = await call('PUT',`/pedidos/${id}`,editForm)
    if (r.ok) {
      sileo.success({ title:'Pedido actualizado' })
      cancelEdit()
      if (r.datos?.mostrar_modal_inventario) setModalInv({ pedidoId:id })
      load(); onRefresh()
    } else sileo.error({ title:r.mensaje, description:r.error })
  }

  const confirmarInventario = async usos => {
    const usosConCantidad = usos.filter(u => parseFloat(u.cantidad_medida)>0)
    if (usosConCantidad.length===0) { setModalInv(null); return }
    const r = await call('POST','/uso_inventario',{ id_pedido:modalInv.pedidoId, usos:usosConCantidad })
    if (r.ok) { sileo.success({ title:'Inventario descontado', description:`Pedido #${modalInv.pedidoId}` }); load() }
    else sileo.error({ title:r.mensaje, description:r.error })
    setModalInv(null)
  }

  const ESTADOS  = ['Pendiente','En proceso','Listo','Entregado','Cancelado']
  const badgeMap = { 'Entregado':'ok','En proceso':'warn','Listo':'cyan','Pendiente':'err','Cancelado':'err' }

  const rows = pedidos.map(p => {
    const isEditing = editId === p.id_pedido
    return [
      <Badge type="cyan">#{p.id_pedido}</Badge>,
      <span style={{ fontWeight:500 }}>{p.cliente}</span>,
      <span style={{ color:'var(--txt-secondary)',fontSize:'0.76rem' }}>{p.empleado}</span>,
      <span style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:'0.78rem' }}>${parseFloat(p.total_cobrar||0).toFixed(2)}</span>,

      // Estado editable
      isEditing
        ? <Select value={editForm.estado_pedido} onChange={e=>setEditForm(f=>({...f,estado_pedido:e.target.value}))} style={{ height:30,fontSize:'0.72rem',width:130 }}>
            {ESTADOS.map(s=><option key={s}>{s}</option>)}
          </Select>
        : <Badge type={p.estado_pedido==='Cancelado'?'err':badgeMap[p.estado_pedido]||'cyan'}>{p.estado_pedido}</Badge>,

      // Badge pagado
      p.tiene_pago
        ? <Badge type="ok">Pagado</Badge>
        : <Badge type="err">Sin pagar</Badge>,

      // Fecha recibida — siempre automática desde created_at
      <span style={{ fontSize:'0.72rem',color:'var(--txt-secondary)',fontFamily:"'JetBrains Mono',monospace" }}>
        {p.created_at ? new Date(p.created_at).toLocaleString('es-MX',{day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'}) : '—'}
      </span>,

      // Acciones
      isEditing
        ? <div style={{ display:'flex',gap:4 }}>
            <button onClick={() => saveEdit(p.id_pedido)} style={{ width:26,height:26,borderRadius:4,border:'1px solid var(--success-brd)',background:'var(--success-dim)',color:'var(--success)',cursor:'pointer',display:'grid',placeItems:'center' }}><Check size={11} strokeWidth={2.5} /></button>
            <button onClick={cancelEdit} style={{ width:26,height:26,borderRadius:4,border:'1px solid var(--brd)',background:'transparent',color:'var(--txt-secondary)',cursor:'pointer',display:'grid',placeItems:'center' }}><X size={11} strokeWidth={2.5} /></button>
          </div>
        : <button onClick={() => startEdit(p)} style={{ width:26,height:26,borderRadius:4,border:'1px solid var(--brd)',background:'transparent',color:'var(--txt-secondary)',cursor:'pointer',display:'grid',placeItems:'center',transition:'all .12s' }}
            onMouseEnter={e=>{ e.currentTarget.style.borderColor='var(--agua-brd)';e.currentTarget.style.color='var(--agua)';e.currentTarget.style.background='var(--agua-dim)' }}
            onMouseLeave={e=>{ e.currentTarget.style.borderColor='var(--brd)';e.currentTarget.style.color='var(--txt-secondary)';e.currentTarget.style.background='transparent' }}>
            <Pencil size={11} strokeWidth={2} />
          </button>,
    ]
  })

  return (
    <div>
      {modalInv && <ModalInventario pedidoId={modalInv.pedidoId} insumos={insumos} onConfirm={confirmarInventario} onSkip={() => setModalInv(null)} />}

      <PageTitle subtitle="gestión de órdenes">Pedidos</PageTitle>

      <Card accent="var(--agua)">
        <CardTitle icon={<Plus size={13} color="var(--agua)" strokeWidth={2.5} />} accent="var(--agua)">Nuevo pedido</CardTitle>
        <FormGrid>
          <Field label="Cliente">
            <Select value={form.id_cliente} onChange={e=>set('id_cliente',e.target.value)}>
              <option value="">Seleccionar...</option>
              {clientes.map(c=><option key={c.id_cliente} value={c.id_cliente}>{c.nombre}</option>)}
            </Select>
          </Field>
          <Field label="Empleado">
            <Select value={form.id_empleado} onChange={e=>set('id_empleado',e.target.value)}>
              <option value="">Seleccionar...</option>
              {empleados.map(e=><option key={e.id_empleado} value={e.id_empleado}>{e.nombre_empleado}</option>)}
            </Select>
          </Field>
          <Field label="Estado">
            <Select value={form.estado_pedido} onChange={e=>set('estado_pedido',e.target.value)}>
              {ESTADOS.filter(s=>s!=='Cancelado').map(s=><option key={s}>{s}</option>)}
            </Select>
          </Field>
          {/* Fecha recibida — automática, solo muestra el reloj */}
          <Field label="Fecha recibida — automática">
            <div style={{ height:36,padding:'0 12px',background:'var(--bg-elevated)',border:'1px solid var(--brd)',borderRadius:5,display:'flex',alignItems:'center' }}>
              <AutoClock />
            </div>
          </Field>
          <PanelServicios servicios={servicios} seleccionados={selServicios} onToggle={toggleServicio} total={totalSeleccionado} />
        </FormGrid>
        <BtnRow>
          <Btn variant="success" onClick={guardar} disabled={loading||selServicios.length===0}>
            <Save size={12} strokeWidth={2} />
            Guardar pedido {selServicios.length>0 && `· $${totalSeleccionado.toFixed(2)}`}
          </Btn>
          {selServicios.length>0 && <Btn variant="ghost" onClick={()=>setSelServicios([])}><X size={12} strokeWidth={2} />Limpiar</Btn>}
        </BtnRow>
      </Card>

      <Card>
        <CardTitle icon={<ClipboardList size={13} color="var(--agua)" strokeWidth={2} />}>Lista de pedidos</CardTitle>
        {editId && (
          <div style={{ marginBottom:10,padding:'6px 12px',background:'var(--agua-dim)',border:'1px solid var(--agua-brd)',borderRadius:5,fontSize:'0.68rem',color:'var(--agua)',fontFamily:"'JetBrains Mono',monospace" }}>
            Editando pedido #{editId} — cambia el estado y presiona el check para guardar
          </div>
        )}
        <Table
          columns={['#','Cliente','Empleado','Total','Estado','Pago','Fecha recibida','Acciones']}
          rows={rows}
          emptyMsg="Sin pedidos registrados"
        />
      </Card>
    </div>
  )
}
