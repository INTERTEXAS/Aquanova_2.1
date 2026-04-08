import { useState, useEffect } from 'react'
import { toast as sileo } from "./CustomToaster"
import { FileText, Plus, Save, Pencil, Trash2, X, Check } from 'lucide-react'
import { useApi, apiFetch } from '../hooks/useApi'
import { Card, CardTitle, PageTitle, Badge, Btn, BtnRow, FormGrid, Field, Input, Select, Table } from './UI'

const ESTADOS_FAC = ['Pendiente','Emitida','Pagada','Cancelada']
const TIPOS_PERSONA = ['Física','Moral']
const METODOS_IMP = ['PDF','Correo','Física','Ticket']

export default function Facturas() {
  const { call, loading } = useApi()
  const [data, setData]     = useState([])
  const [pedidos, setPedidos] = useState([])
  const [editId, setEditId] = useState(null)
  const [editForm, setEditForm] = useState({})
  const [deleteId, setDeleteId] = useState(null)
  const [form, setForm] = useState({
    id_pedido:'', id_cliente:'',
    serie_factura:'', num_factura:'', estado:'Pendiente',
    subtotal:'', impuesto:'', total:'',
    rfc_cliente:'', razon_social:'', tipo_persona:'Física',
    giro_fiscal:'', uso_cfdi:'',
    metodo_impresion:'PDF', url_pdf:'', correo_envio:'', notas:'',
  })

  const load = async () => {
    const [rf, rp] = await Promise.all([apiFetch('GET','/facturas'), apiFetch('GET','/pedidos')])
    setData(rf.datos||[]); setPedidos(rp.datos||[])
  }
  useEffect(() => { load() }, [])

  const set = (k,v) => setForm(f=>({...f,[k]:v}))

  // Auto-llenar cliente al seleccionar pedido
  const onPedidoChange = (id_pedido) => {
    const pedido = pedidos.find(p => String(p.id_pedido) === String(id_pedido))
    if (pedido) {
      setForm(f => ({
        ...f, id_pedido,
        id_cliente: pedido.id_cliente,
        subtotal: parseFloat(pedido.total_cobrar || 0).toFixed(2),
        impuesto: (parseFloat(pedido.total_cobrar || 0) * 0.16).toFixed(2),
        total: (parseFloat(pedido.total_cobrar || 0) * 1.16).toFixed(2),
      }))
    } else {
      set('id_pedido', id_pedido)
    }
  }

  // Recalcular total al cambiar subtotal
  const onSubtotalChange = (v) => {
    const s = parseFloat(v) || 0
    const imp = (s * 0.16).toFixed(2)
    const tot = (s * 1.16).toFixed(2)
    setForm(f => ({ ...f, subtotal: v, impuesto: imp, total: tot }))
  }

  const guardar = async () => {
    if (!form.id_pedido) { sileo.error({ title:'Selecciona el pedido' }); return }
    const r = await call('POST','/facturas',form)
    if (r.ok) {
      sileo.success({ title:r.mensaje, description:`Factura #${r.datos.id_factura} generada` })
      setForm({ id_pedido:'',id_cliente:'',serie_factura:'',num_factura:'',estado:'Pendiente',subtotal:'',impuesto:'',total:'',rfc_cliente:'',razon_social:'',tipo_persona:'Física',giro_fiscal:'',uso_cfdi:'',metodo_impresion:'PDF',url_pdf:'',correo_envio:'',notas:'' })
      load()
    } else sileo.error({ title:r.mensaje, description:r.error })
  }

  const saveEdit = async (id) => {
    const r = await call('PUT',`/facturas/${id}`, editForm)
    if (r.ok) { sileo.success({ title:'Factura actualizada' }); setEditId(null); load() }
    else sileo.error({ title:r.mensaje, description:r.error })
  }

  const doDelete = async (id) => {
    const r = await call('DELETE',`/facturas/${id}`)
    if (r.ok) { sileo.success({ title:'Factura eliminada' }); setDeleteId(null); load() }
    else sileo.error({ title:r.mensaje, description:r.error })
  }

  const estadoBadge = { 'Pendiente':'warn','Emitida':'cyan','Pagada':'ok','Cancelada':'err' }

  const rows = data.map(f => {
    const isEditing  = editId === f.id_factura
    const isDeleting = deleteId === f.id_factura
    return [
      <Badge type="cyan">#{f.id_factura}</Badge>,
      <span style={{ fontSize:'0.72rem', fontFamily:"'JetBrains Mono',monospace" }}>
        {f.serie_factura ? `${f.serie_factura}-` : ''}{f.num_factura || '—'}
      </span>,
      <strong style={{ fontSize:'0.8rem' }}>{f.nombre_cliente}</strong>,
      <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:'0.78rem' }}>${parseFloat(f.total||0).toFixed(2)}</span>,
      isEditing
        ? <Select value={editForm.estado} onChange={e=>setEditForm(ef=>({...ef,estado:e.target.value}))}
            style={{ height:28, fontSize:'0.7rem', width:110 }}>
            {ESTADOS_FAC.map(s=><option key={s}>{s}</option>)}
          </Select>
        : <Badge type={estadoBadge[f.estado]||'cyan'}>{f.estado}</Badge>,
      <span style={{ fontSize:'0.72rem', color:'var(--txt-secondary)' }}>
        {f.fecha_emision ? new Date(f.fecha_emision).toLocaleDateString('es-MX') : '—'}
      </span>,
      f.rfc_cliente || '—',
      isEditing
        ? <div style={{ display:'flex', gap:4 }}>
            <button onClick={() => saveEdit(f.id_factura)}
              style={{ width:26,height:26,borderRadius:4,border:'1px solid var(--success-brd)',background:'var(--success-dim)',color:'var(--success)',cursor:'pointer',display:'grid',placeItems:'center' }}>
              <Check size={11} strokeWidth={2.5} />
            </button>
            <button onClick={() => setEditId(null)}
              style={{ width:26,height:26,borderRadius:4,border:'1px solid var(--brd)',background:'transparent',color:'var(--txt-secondary)',cursor:'pointer',display:'grid',placeItems:'center' }}>
              <X size={11} strokeWidth={2.5} />
            </button>
          </div>
        : isDeleting
          ? <div style={{ display:'flex', gap:4, alignItems:'center' }}>
              <span style={{ fontSize:'0.58rem', color:'var(--danger)', fontFamily:"'JetBrains Mono',monospace" }}>¿Eliminar?</span>
              <button onClick={() => doDelete(f.id_factura)} style={{ width:26,height:26,borderRadius:4,border:'1px solid var(--success-brd)',background:'var(--success-dim)',color:'var(--success)',cursor:'pointer',display:'grid',placeItems:'center' }}><Check size={11} strokeWidth={2.5} /></button>
              <button onClick={() => setDeleteId(null)} style={{ width:26,height:26,borderRadius:4,border:'1px solid var(--brd)',background:'transparent',color:'var(--txt-secondary)',cursor:'pointer',display:'grid',placeItems:'center' }}><X size={11} strokeWidth={2.5} /></button>
            </div>
          : <div style={{ display:'flex', gap:4 }}>
              <button onClick={() => { setEditId(f.id_factura); setEditForm({ estado:f.estado, rfc_cliente:f.rfc_cliente||'', razon_social:f.razon_social||'', tipo_persona:f.tipo_persona||'Física', giro_fiscal:f.giro_fiscal||'', uso_cfdi:f.uso_cfdi||'', metodo_impresion:f.metodo_impresion||'PDF', url_pdf:f.url_pdf||'', correo_envio:f.correo_envio||'', notas:f.notas||'', subtotal:f.subtotal, impuesto:f.impuesto, total:f.total, serie_factura:f.serie_factura||'', num_factura:f.num_factura||'' }) }}
                style={{ width:26,height:26,borderRadius:4,border:'1px solid var(--brd)',background:'transparent',color:'var(--txt-secondary)',cursor:'pointer',display:'grid',placeItems:'center',transition:'all .12s' }}
                onMouseEnter={e=>{e.currentTarget.style.borderColor='var(--agua-brd)';e.currentTarget.style.color='var(--agua)';e.currentTarget.style.background='var(--agua-dim)'}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--brd)';e.currentTarget.style.color='var(--txt-secondary)';e.currentTarget.style.background='transparent'}}>
                <Pencil size={11} strokeWidth={2} />
              </button>
              <button onClick={() => setDeleteId(f.id_factura)}
                style={{ width:26,height:26,borderRadius:4,border:'1px solid var(--brd)',background:'transparent',color:'var(--txt-secondary)',cursor:'pointer',display:'grid',placeItems:'center',transition:'all .12s' }}
                onMouseEnter={e=>{e.currentTarget.style.borderColor='var(--danger-brd)';e.currentTarget.style.color='var(--danger)';e.currentTarget.style.background='var(--danger-dim)'}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--brd)';e.currentTarget.style.color='var(--txt-secondary)';e.currentTarget.style.background='transparent'}}>
                <Trash2 size={11} strokeWidth={2} />
              </button>
            </div>,
    ]
  })

  // Pedidos sin factura para el selector
  const pedidosSinFactura = pedidos.filter(p => !data.some(f => f.id_pedido === p.id_pedido))

  return (
    <div>
      <PageTitle subtitle="gestión de facturación">Facturas</PageTitle>

      <Card accent="var(--ambar)">
        <CardTitle icon={<Plus size={13} color="var(--ambar)" strokeWidth={2.5} />} accent="var(--ambar)">Nueva factura</CardTitle>

        {/* Sección 1 — Datos básicos */}
        <div style={{ marginBottom:14, fontSize:'0.6rem', color:'var(--txt-muted)', letterSpacing:'.1em', textTransform:'uppercase', fontFamily:"'JetBrains Mono',monospace" }}>Datos básicos</div>
        <FormGrid>
          <Field label="Pedido asociado">
            <Select value={form.id_pedido} onChange={e=>onPedidoChange(e.target.value)}>
              <option value="">Seleccionar pedido...</option>
              {pedidosSinFactura.map(p=><option key={p.id_pedido} value={p.id_pedido}>#{p.id_pedido} — {p.cliente} · ${parseFloat(p.total_cobrar||0).toFixed(2)}</option>)}
            </Select>
          </Field>
          <Field label="Serie"><Input placeholder="A" value={form.serie_factura} onChange={e=>set('serie_factura',e.target.value)} /></Field>
          <Field label="Número de factura"><Input placeholder="0001" value={form.num_factura} onChange={e=>set('num_factura',e.target.value)} /></Field>
          <Field label="Estado">
            <Select value={form.estado} onChange={e=>set('estado',e.target.value)}>
              {ESTADOS_FAC.map(s=><option key={s}>{s}</option>)}
            </Select>
          </Field>
        </FormGrid>

        {/* Sección 2 — Montos */}
        <div style={{ marginBottom:14, marginTop:4, fontSize:'0.6rem', color:'var(--txt-muted)', letterSpacing:'.1em', textTransform:'uppercase', fontFamily:"'JetBrains Mono',monospace" }}>Montos</div>
        <FormGrid>
          <Field label="Subtotal"><Input type="number" placeholder="0.00" step="0.01" value={form.subtotal} onChange={e=>onSubtotalChange(e.target.value)} /></Field>
          <Field label="Impuesto (IVA 16%)"><Input type="number" placeholder="0.00" step="0.01" value={form.impuesto} onChange={e=>set('impuesto',e.target.value)} /></Field>
          <Field label="Total"><Input type="number" placeholder="0.00" step="0.01" value={form.total} onChange={e=>set('total',e.target.value)} /></Field>
        </FormGrid>

        {/* Sección 3 — Datos fiscales */}
        <div style={{ marginBottom:14, marginTop:4, fontSize:'0.6rem', color:'var(--txt-muted)', letterSpacing:'.1em', textTransform:'uppercase', fontFamily:"'JetBrains Mono',monospace" }}>Datos fiscales</div>
        <FormGrid>
          <Field label="RFC"><Input placeholder="XXXX000000XXX" value={form.rfc_cliente} onChange={e=>set('rfc_cliente',e.target.value)} /></Field>
          <Field label="Razón social"><Input placeholder="Nombre o empresa" value={form.razon_social} onChange={e=>set('razon_social',e.target.value)} /></Field>
          <Field label="Tipo persona">
            <Select value={form.tipo_persona} onChange={e=>set('tipo_persona',e.target.value)}>
              {TIPOS_PERSONA.map(t=><option key={t}>{t}</option>)}
            </Select>
          </Field>
          <Field label="Giro fiscal"><Input placeholder="Ej: Servicios al por menor" value={form.giro_fiscal} onChange={e=>set('giro_fiscal',e.target.value)} /></Field>
          <Field label="Uso CFDI"><Input placeholder="Ej: G03 Gastos en general" value={form.uso_cfdi} onChange={e=>set('uso_cfdi',e.target.value)} /></Field>
        </FormGrid>

        {/* Sección 4 — Impresión */}
        <div style={{ marginBottom:14, marginTop:4, fontSize:'0.6rem', color:'var(--txt-muted)', letterSpacing:'.1em', textTransform:'uppercase', fontFamily:"'JetBrains Mono',monospace" }}>Impresión y envío</div>
        <FormGrid>
          <Field label="Método de impresión">
            <Select value={form.metodo_impresion} onChange={e=>set('metodo_impresion',e.target.value)}>
              {METODOS_IMP.map(m=><option key={m}>{m}</option>)}
            </Select>
          </Field>
          <Field label="URL del PDF"><Input placeholder="https://..." value={form.url_pdf} onChange={e=>set('url_pdf',e.target.value)} /></Field>
          <Field label="Correo de envío"><Input type="email" placeholder="cliente@correo.com" value={form.correo_envio} onChange={e=>set('correo_envio',e.target.value)} /></Field>
          <Field label="Notas"><Input placeholder="Observaciones..." value={form.notas} onChange={e=>set('notas',e.target.value)} /></Field>
        </FormGrid>

        <BtnRow>
          <Btn variant="success" onClick={guardar} disabled={loading || !form.id_pedido}>
            <Save size={12} strokeWidth={2} /> Generar factura
          </Btn>
        </BtnRow>
      </Card>

      <Card>
        <CardTitle icon={<FileText size={13} color="var(--ambar)" strokeWidth={2} />} accent="var(--ambar)">Historial de facturas</CardTitle>
        <Table
          columns={['#','Folio','Cliente','Total','Estado','Fecha','RFC','Acciones']}
          rows={rows}
          emptyMsg="Sin facturas registradas"
        />
      </Card>
    </div>
  )
}
