import { useState, useEffect } from 'react'
import { toast as sileo } from "./CustomToaster"
import { Package, CreditCard, Plus, Save, AlertTriangle, CheckCircle, Pencil, Trash2, X, Check } from 'lucide-react'
import { useApi, apiFetch } from '../hooks/useApi'
import { Card, CardTitle, PageTitle, Badge, Btn, BtnRow, FormGrid, Field, Input, Select, Table } from './UI'

// ── Helpers de botones ────────────────────────────────────────
const btnStyle = (bg, brd, color) => ({
  width:26, height:26, borderRadius:4, border:`1px solid ${brd}`,
  background:bg, color, cursor:'pointer', display:'grid', placeItems:'center', transition:'all .12s',
})
const hoverCyan   = e => { e.currentTarget.style.borderColor='var(--agua-brd)'; e.currentTarget.style.color='var(--agua)'; e.currentTarget.style.background='var(--agua-dim)' }
const hoverDanger = e => { e.currentTarget.style.borderColor='var(--danger-brd)'; e.currentTarget.style.color='var(--danger)'; e.currentTarget.style.background='var(--danger-dim)' }
const unhover     = e => { e.currentTarget.style.borderColor='var(--brd)'; e.currentTarget.style.color='var(--txt-secondary)'; e.currentTarget.style.background='transparent' }

// ── EditInput ─────────────────────────────────────────────────
const EditInput = ({ value, onChange, placeholder, type='text', style: xs }) => (
  <input type={type} value={value||''} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
    style={{ height:30, padding:'0 8px', borderRadius:4, border:'1px solid var(--brd)', background:'var(--bg-elevated)', color:'var(--txt-primary)', fontFamily:"'Inter',sans-serif", fontSize:'0.76rem', outline:'none', transition:'border-color .15s', width:'100%', ...xs }}
    onFocus={e=>{ e.target.style.borderColor='var(--agua)'; e.target.style.boxShadow='0 0 0 2px var(--agua-dim)' }}
    onBlur={e=>{ e.target.style.borderColor='var(--brd)'; e.target.style.boxShadow='none' }}
  />
)

// ── INSUMOS con CRUD completo ─────────────────────────────────
export function Insumos({ onRefresh }) {
  const { call, loading } = useApi()
  const [data, setData]     = useState([])
  const [editId, setEditId] = useState(null)
  const [editForm, setEditForm] = useState({})
  const [deleteId, setDeleteId] = useState(null)
  const [form, setForm] = useState({
    nombre:'', tipo_insumo:'', cantidad_stock:'',
    unidad_medida:'kg', stock_minimo:'', precio_compra:''
  })

  const load = async () => { const r = await apiFetch('GET','/insumos'); setData(r.datos||[]) }
  useEffect(() => { load() }, [])
  const set = (k,v) => setForm(f=>({...f,[k]:v}))

  // CREATE
  const guardar = async () => {
    if (!form.nombre||!form.cantidad_stock) { sileo.error({ title:'Nombre y cantidad son obligatorios' }); return }
    const r = await call('POST','/insumos', form)
    if (r.ok) {
      sileo.success({ title:r.mensaje, description:`"${form.nombre}" registrado` })
      setForm({ nombre:'', tipo_insumo:'', cantidad_stock:'', unidad_medida:'kg', stock_minimo:'', precio_compra:'' })
      load(); onRefresh()
    } else sileo.error({ title:r.mensaje, description:r.error })
  }

  // UPDATE
  const startEdit = i => {
    setEditId(i.id_insumo)
    setEditForm({
      nombre: i.nombre, tipo_insumo: i.tipo_insumo||'',
      cantidad_stock: i.cantidad_stock, unidad_medida: i.unidad_medida,
      stock_minimo: i.stock_minimo, precio_compra: i.precio_compra||'',
    })
  }
  const cancelEdit = () => { setEditId(null); setEditForm({}) }
  const saveEdit = async id => {
    const r = await call('PUT', `/insumos/${id}`, editForm)
    if (r.ok) { sileo.success({ title:'Insumo actualizado' }); cancelEdit(); load(); onRefresh() }
    else sileo.error({ title:r.mensaje, description:r.error })
  }

  // DELETE
  const doDelete = async id => {
    const r = await call('DELETE', `/insumos/${id}`)
    if (r.ok) { sileo.success({ title:'Insumo eliminado' }); setDeleteId(null); load(); onRefresh() }
    else sileo.error({ title:r.mensaje, description:r.error })
  }

  const UNIDADES = ['kg','g','L','ml','pza']

  const rows = data.map(i => {
    const isEditing  = editId === i.id_insumo
    const isDeleting = deleteId === i.id_insumo
    return [
      <Badge type="cyan">#{i.id_insumo}</Badge>,

      // Nombre
      isEditing
        ? <EditInput value={editForm.nombre} onChange={v=>setEditForm(f=>({...f,nombre:v}))} placeholder="Nombre" />
        : <strong>{i.nombre}</strong>,

      // Tipo
      isEditing
        ? <EditInput value={editForm.tipo_insumo} onChange={v=>setEditForm(f=>({...f,tipo_insumo:v}))} placeholder="Tipo" />
        : i.tipo_insumo||'—',

      // Stock
      isEditing
        ? <EditInput type="number" value={editForm.cantidad_stock} onChange={v=>setEditForm(f=>({...f,cantidad_stock:v}))} style={{ width:80 }} />
        : <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:'0.78rem' }}>{i.cantidad_stock}</span>,

      // Unidad
      isEditing
        ? <select value={editForm.unidad_medida} onChange={e=>setEditForm(f=>({...f,unidad_medida:e.target.value}))}
            style={{ height:30, padding:'0 6px', borderRadius:4, border:'1px solid var(--brd)', background:'var(--bg-elevated)', color:'var(--txt-primary)', fontSize:'0.76rem', outline:'none', width:70 }}>
            {UNIDADES.map(u=><option key={u}>{u}</option>)}
          </select>
        : i.unidad_medida,

      // Mínimo
      isEditing
        ? <EditInput type="number" value={editForm.stock_minimo} onChange={v=>setEditForm(f=>({...f,stock_minimo:v}))} style={{ width:80 }} />
        : i.stock_minimo,

      // Estado alerta
      i.alerta_stock
        ? <span style={{ display:'inline-flex', alignItems:'center', gap:4, color:'var(--danger)', fontSize:'0.72rem' }}><AlertTriangle size={11} strokeWidth={2} />Bajo</span>
        : <span style={{ display:'inline-flex', alignItems:'center', gap:4, color:'var(--success)', fontSize:'0.72rem' }}><CheckCircle size={11} strokeWidth={2} />OK</span>,

      // Fecha registro
      <span style={{ fontSize:'0.72rem', color:'var(--txt-secondary)', fontFamily:"'JetBrains Mono',monospace" }}>
        {i.fecha_compra ? new Date(i.fecha_compra).toLocaleDateString('es-MX') : '—'}
      </span>,

      // Precio
      isEditing
        ? <EditInput type="number" value={editForm.precio_compra} onChange={v=>setEditForm(f=>({...f,precio_compra:v}))} style={{ width:90 }} />
        : `$${parseFloat(i.precio_compra||0).toFixed(2)}`,

      // Acciones
      isEditing
        ? <div style={{ display:'flex', gap:4 }}>
            <button onClick={() => saveEdit(i.id_insumo)} style={btnStyle('var(--success-dim)','var(--success-brd)','var(--success)')}><Check size={11} strokeWidth={2.5} /></button>
            <button onClick={cancelEdit} style={btnStyle('transparent','var(--brd)','var(--txt-secondary)')}><X size={11} strokeWidth={2.5} /></button>
          </div>
        : isDeleting
          ? <div style={{ display:'flex', gap:4, alignItems:'center' }}>
              <span style={{ fontSize:'0.58rem', color:'var(--danger)', fontFamily:"'JetBrains Mono',monospace", whiteSpace:'nowrap' }}>¿Eliminar?</span>
              <button onClick={() => doDelete(i.id_insumo)} style={btnStyle('var(--success-dim)','var(--success-brd)','var(--success)')}><Check size={11} strokeWidth={2.5} /></button>
              <button onClick={() => setDeleteId(null)} style={btnStyle('transparent','var(--brd)','var(--txt-secondary)')}><X size={11} strokeWidth={2.5} /></button>
            </div>
          : <div style={{ display:'flex', gap:4 }}>
              <button onClick={() => startEdit(i)} title="Editar"
                style={btnStyle('transparent','var(--brd)','var(--txt-secondary)')}
                onMouseEnter={hoverCyan} onMouseLeave={unhover}>
                <Pencil size={11} strokeWidth={2} />
              </button>
              <button onClick={() => setDeleteId(i.id_insumo)} title="Eliminar"
                style={btnStyle('transparent','var(--brd)','var(--txt-secondary)')}
                onMouseEnter={hoverDanger} onMouseLeave={unhover}>
                <Trash2 size={11} strokeWidth={2} />
              </button>
            </div>,
    ]
  })

  return (
    <div>
      <PageTitle subtitle="control de stock">Inventario</PageTitle>
      <Card accent="#fb923c">
        <CardTitle icon={<Plus size={13} color="#fb923c" strokeWidth={2.5} />} accent="#fb923c">Nuevo insumo</CardTitle>
        <FormGrid>
          <Field label="Nombre"><Input placeholder="Detergente Ariel" value={form.nombre} onChange={e=>set('nombre',e.target.value)} /></Field>
          <Field label="Tipo"><Input placeholder="Detergente" value={form.tipo_insumo} onChange={e=>set('tipo_insumo',e.target.value)} /></Field>
          <Field label="Cantidad en stock"><Input type="number" placeholder="0.00" step="0.01" value={form.cantidad_stock} onChange={e=>set('cantidad_stock',e.target.value)} /></Field>
          <Field label="Unidad de medida">
            <Select value={form.unidad_medida} onChange={e=>set('unidad_medida',e.target.value)}>
              {UNIDADES.map(u=><option key={u}>{u}</option>)}
            </Select>
          </Field>
          <Field label="Stock mínimo"><Input type="number" placeholder="0.00" step="0.01" value={form.stock_minimo} onChange={e=>set('stock_minimo',e.target.value)} /></Field>
          <Field label="Precio de compra"><Input type="number" placeholder="0.00" step="0.01" value={form.precio_compra} onChange={e=>set('precio_compra',e.target.value)} /></Field>
          <Field label="Fecha de registro — automática">
            <div style={{ height:36, padding:'0 12px', background:'var(--bg-elevated)', border:'1px solid var(--brd)', borderRadius:5, display:'flex', alignItems:'center', fontSize:'0.78rem', color:'var(--agua)', fontFamily:"'JetBrains Mono',monospace" }}>
              {new Date().toLocaleDateString('es-MX', { day:'2-digit', month:'2-digit', year:'numeric' })}
            </div>
          </Field>
        </FormGrid>
        <BtnRow>
          <Btn variant="success" onClick={guardar} disabled={loading}>
            <Save size={12} strokeWidth={2} />Guardar insumo
          </Btn>
        </BtnRow>
      </Card>

      <Card>
        <CardTitle icon={<Package size={13} color="#fb923c" strokeWidth={2} />} accent="#fb923c">Inventario actual</CardTitle>
        {editId && (
          <div style={{ marginBottom:10, padding:'6px 12px', background:'var(--agua-dim)', border:'1px solid var(--agua-brd)', borderRadius:5, fontSize:'0.68rem', color:'var(--agua)', fontFamily:"'JetBrains Mono',monospace" }}>
            Editando insumo #{editId} — modifica los campos y presiona el check para guardar
          </div>
        )}
        <Table
          columns={['#','Nombre','Tipo','Stock','Unidad','Mínimo','Estado','Fecha registro','Precio','Acciones']}
          rows={rows}
          emptyMsg="Sin insumos registrados"
        />
      </Card>
    </div>
  )
}

// ── PAGOS — con selector de pedidos y monto automático ────────
export function Pagos() {
  const { call, loading } = useApi()
  const [data, setData]     = useState([])
  const [pedidos, setPedidos] = useState([])
  const [form, setForm]     = useState({ id_pedido:'', monto:'', forma_pago:'Efectivo', tipo_tarjeta:'', referencia_transferencia:'' })

  const load = async () => {
    const [rp, rpd] = await Promise.all([apiFetch('GET','/pagos'), apiFetch('GET','/pedidos')])
    setData(rp.datos||[])
    setPedidos(rpd.datos||[])
  }
  useEffect(() => { load() }, [])

  const set = (k,v) => setForm(f => {
    const n = {...f,[k]:v}
    if (k==='forma_pago') { n.tipo_tarjeta=''; n.referencia_transferencia='' }
    return n
  })

  const onPedidoChange = id_pedido => {
    const pedido = pedidos.find(p => String(p.id_pedido) === String(id_pedido))
    setForm(f => ({ ...f, id_pedido, monto: pedido ? parseFloat(pedido.total_cobrar||0).toFixed(2) : '' }))
  }

  const esTarjeta       = form.forma_pago === 'Tarjeta'
  const esTransferencia = form.forma_pago === 'Transferencia'
  const pedidosSinPago  = pedidos.filter(p => !p.tiene_pago)
  const pedidoSel       = pedidos.find(p => String(p.id_pedido) === String(form.id_pedido))

  const guardar = async () => {
    if (!form.id_pedido) { sileo.error({ title:'Selecciona un pedido' }); return }
    if (!form.monto||parseFloat(form.monto)<=0) { sileo.error({ title:'El monto debe ser mayor a cero' }); return }
    if (esTarjeta&&!form.tipo_tarjeta) { sileo.error({ title:'Selecciona el tipo de tarjeta' }); return }
    if (esTransferencia&&!form.referencia_transferencia) { sileo.error({ title:'Ingresa la referencia de transferencia' }); return }
    const r = await call('POST','/pagos',form)
    if (r.ok) {
      sileo.success({ title:r.mensaje, description:`$${parseFloat(form.monto).toFixed(2)} registrado` })
      setForm({ id_pedido:'', monto:'', forma_pago:'Efectivo', tipo_tarjeta:'', referencia_transferencia:'' })
      load()
    } else sileo.error({ title:r.mensaje, description:r.error })
  }

  const tipoBadge = p => {
    if (p.forma_pago==='Tarjeta')       return <Badge type="cyan">{p.tipo_tarjeta||'Tarjeta'}</Badge>
    if (p.forma_pago==='Transferencia') return <Badge type="yellow">Transferencia</Badge>
    return <Badge type="ok">Efectivo</Badge>
  }

  const rows = data.map(p=>[
    <Badge type="cyan">#{p.id_pago}</Badge>,
    <strong>{p.cliente}</strong>,
    <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:'0.78rem' }}>${parseFloat(p.monto||0).toFixed(2)}</span>,
    tipoBadge(p),
    p.referencia_transferencia
      ? <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:'0.72rem', color:'var(--agua)' }}>{p.referencia_transferencia}</span>
      : p.tipo_tarjeta||'—',
    new Date(p.fecha_pago).toLocaleString('es-MX'),
  ])

  return (
    <div>
      <PageTitle subtitle="registro de cobros">Pagos</PageTitle>
      <Card accent="#f472b6">
        <CardTitle icon={<Plus size={13} color="#f472b6" strokeWidth={2.5} />} accent="#f472b6">Registrar pago</CardTitle>
        <FormGrid>
          <Field label="Pedido a cobrar">
            <Select value={form.id_pedido} onChange={e=>onPedidoChange(e.target.value)}>
              <option value="">Seleccionar pedido...</option>
              {pedidosSinPago.map(p=>(
                <option key={p.id_pedido} value={p.id_pedido}>
                  #{p.id_pedido} — {p.cliente} · ${parseFloat(p.total_cobrar||0).toFixed(2)}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Monto">
            <Input type="number" placeholder="0.00" step="0.01" value={form.monto} onChange={e=>set('monto',e.target.value)} />
          </Field>
          <Field label="Forma de pago">
            <Select value={form.forma_pago} onChange={e=>set('forma_pago',e.target.value)}>
              <option>Efectivo</option>
              <option>Tarjeta</option>
              <option>Transferencia</option>
            </Select>
          </Field>
          {esTarjeta && (
            <Field label="Tipo de tarjeta">
              <Select value={form.tipo_tarjeta} onChange={e=>set('tipo_tarjeta',e.target.value)}>
                <option value="">Seleccionar...</option>
                <option value="VISA">VISA</option>
                <option value="Mastercard">Mastercard</option>
                <option value="AMEX">AMEX</option>
              </Select>
            </Field>
          )}
          {esTransferencia && (
            <Field label="Referencia de transferencia">
              <Input placeholder="REF-20260320-001" value={form.referencia_transferencia} onChange={e=>set('referencia_transferencia',e.target.value)} />
            </Field>
          )}
        </FormGrid>

        {pedidoSel && (
          <div style={{ marginBottom:14, padding:'10px 14px', borderRadius:6, background:'var(--agua-dim)', border:'1px solid var(--agua-brd)', fontSize:'0.76rem', color:'var(--txt-primary)', display:'flex', alignItems:'center', gap:16, flexWrap:'wrap' }}>
            <div><span style={{ color:'var(--txt-muted)', fontSize:'0.62rem', fontFamily:"'JetBrains Mono',monospace" }}>PEDIDO </span><strong>#{pedidoSel.id_pedido}</strong></div>
            <div><span style={{ color:'var(--txt-muted)', fontSize:'0.62rem', fontFamily:"'JetBrains Mono',monospace" }}>CLIENTE </span><strong>{pedidoSel.cliente}</strong></div>
            <div><span style={{ color:'var(--txt-muted)', fontSize:'0.62rem', fontFamily:"'JetBrains Mono',monospace" }}>TOTAL </span><strong style={{ color:'var(--agua)', fontFamily:"'JetBrains Mono',monospace" }}>${parseFloat(pedidoSel.total_cobrar||0).toFixed(2)}</strong></div>
            <div><span style={{ color:'var(--txt-muted)', fontSize:'0.62rem', fontFamily:"'JetBrains Mono',monospace" }}>ESTADO </span>
              <Badge type={{ 'Entregado':'ok','En proceso':'warn','Listo':'cyan','Pendiente':'err' }[pedidoSel.estado_pedido]||'cyan'}>{pedidoSel.estado_pedido}</Badge>
            </div>
          </div>
        )}

        {(esTarjeta||esTransferencia) && (
          <div style={{ marginBottom:14, padding:'8px 12px', borderRadius:5, background:esTarjeta?'var(--agua-dim)':'var(--ambar-dim)', border:`1px solid ${esTarjeta?'var(--agua-brd)':'var(--ambar-brd)'}`, fontSize:'0.72rem', color:'var(--txt-secondary)', display:'flex', alignItems:'center', gap:8 }}>
            <CreditCard size={12} strokeWidth={1.8} color={esTarjeta?'var(--agua)':'var(--ambar)'} />
            {esTarjeta ? 'Selecciona VISA, Mastercard o AMEX para completar el registro.' : 'Ingresa el número de referencia del comprobante de transferencia del cliente.'}
          </div>
        )}

        <BtnRow>
          <Btn variant="success" onClick={guardar} disabled={loading||!form.id_pedido}>
            <Save size={12} strokeWidth={2} />Registrar pago
          </Btn>
        </BtnRow>
      </Card>

      <Card>
        <CardTitle icon={<CreditCard size={13} color="#f472b6" strokeWidth={2} />} accent="#f472b6">Historial de pagos</CardTitle>
        <Table columns={['#','Cliente','Monto','Tipo de pago','Referencia / Tarjeta','Fecha']} rows={rows} emptyMsg="Sin pagos registrados" />
      </Card>
    </div>
  )
}
