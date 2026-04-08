import { useState, useEffect } from 'react'
import { toast as sileo } from "./CustomToaster"
import { Users, UserCheck, Sparkles, Plus, Save, Pencil, Trash2, X, Check, UserX, UserCheck as UserCheckIcon, Eye, EyeOff } from 'lucide-react'
import { useApi, apiFetch } from '../hooks/useApi'
import { Card, CardTitle, PageTitle, Badge, Btn, BtnRow, FormGrid, Field, Input, Table } from './UI'

// ── Hook CRUD genérico ────────────────────────────────────────
function useCRUD(endpoint) {
  const { call, loading } = useApi()
  const [data, setData] = useState([])
  const [editId, setEditId] = useState(null)
  const [editForm, setEditForm] = useState({})
  const [deleteId, setDeleteId] = useState(null)

  const load = async (params = '') => {
    const r = await apiFetch('GET', `${endpoint}${params}`)
    setData(r.datos || [])
  }
  useEffect(() => { load() }, [])

  const startEdit   = (id, fields) => { setEditId(id); setEditForm(fields) }
  const cancelEdit  = () => { setEditId(null); setEditForm({}) }
  const saveEdit    = async (id, msg) => {
    const r = await call('PUT', `${endpoint}/${id}`, editForm)
    if (r.ok) { sileo.success({ title: msg || 'Actualizado' }); cancelEdit(); load() }
    else sileo.error({ title: r.mensaje, description: r.error })
  }
  const confirmDelete  = id => setDeleteId(id)
  const cancelDelete   = ()  => setDeleteId(null)
  const doDelete = async (id, msg) => {
    const r = await call('DELETE', `${endpoint}/${id}`)
    if (r.ok) { sileo.success({ title: msg || 'Eliminado' }); setDeleteId(null); load() }
    else sileo.error({ title: r.mensaje, description: r.error })
  }

  return { data, load, loading, call, editId, editForm, setEditForm, startEdit, cancelEdit, saveEdit, deleteId, confirmDelete, cancelDelete, doDelete }
}

// ── Botones de acción ─────────────────────────────────────────
function ActionBtns({ isEditing, onEdit, onSave, onCancel, onDelete, isConfirmingDelete, onConfirmDelete, onCancelDelete, extraBtn }) {
  if (isConfirmingDelete) return (
    <div style={{ display:'flex', gap:4, alignItems:'center' }}>
      <span style={{ fontSize:'0.58rem', color:'var(--danger)', fontFamily:"'JetBrains Mono',monospace", whiteSpace:'nowrap' }}>¿Confirmar?</span>
      <button onClick={onConfirmDelete} style={btnStyle('var(--success-dim)','var(--success-brd)','var(--success)')}><Check size={11} strokeWidth={2.5} /></button>
      <button onClick={onCancelDelete}  style={btnStyle('transparent','var(--brd)','var(--txt-secondary)')}><X size={11} strokeWidth={2.5} /></button>
    </div>
  )
  if (isEditing) return (
    <div style={{ display:'flex', gap:4 }}>
      <button onClick={onSave}   style={btnStyle('var(--success-dim)','var(--success-brd)','var(--success)')}><Check size={11} strokeWidth={2.5} /></button>
      <button onClick={onCancel} style={btnStyle('transparent','var(--brd)','var(--txt-secondary)')}><X size={11} strokeWidth={2.5} /></button>
    </div>
  )
  return (
    <div style={{ display:'flex', gap:4 }}>
      <button onClick={onEdit}   style={btnStyle('transparent','var(--brd)','var(--txt-secondary)')} onMouseEnter={hoverCyan}   onMouseLeave={unhover}><Pencil size={11} strokeWidth={2} /></button>
      {extraBtn}
      {onDelete && <button onClick={onDelete} style={btnStyle('transparent','var(--brd)','var(--txt-secondary)')} onMouseEnter={hoverDanger} onMouseLeave={unhover}><Trash2 size={11} strokeWidth={2} /></button>}
    </div>
  )
}

const btnStyle = (bg, brd, color) => ({
  width:26, height:26, borderRadius:4, border:`1px solid ${brd}`,
  background:bg, color, cursor:'pointer', display:'grid', placeItems:'center', transition:'all .12s',
})
const hoverCyan   = e => { e.currentTarget.style.borderColor='var(--agua-brd)'; e.currentTarget.style.color='var(--agua)'; e.currentTarget.style.background='var(--agua-dim)' }
const hoverDanger = e => { e.currentTarget.style.borderColor='var(--danger-brd)'; e.currentTarget.style.color='var(--danger)'; e.currentTarget.style.background='var(--danger-dim)' }
const hoverGold   = e => { e.currentTarget.style.borderColor='var(--ambar-brd)'; e.currentTarget.style.color='var(--ambar)'; e.currentTarget.style.background='var(--ambar-dim)' }
const unhover     = e => { e.currentTarget.style.borderColor='var(--brd)'; e.currentTarget.style.color='var(--txt-secondary)'; e.currentTarget.style.background='transparent' }

// ── EditInput ─────────────────────────────────────────────────
const EditInput = ({ value, onChange, placeholder, type='text', style: xs }) => (
  <input type={type} value={value||''} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
    style={{ height:30, padding:'0 8px', borderRadius:4, border:'1px solid var(--brd)', background:'var(--bg-elevated)', color:'var(--txt-primary)', fontFamily:"'Inter',sans-serif", fontSize:'0.76rem', outline:'none', transition:'border-color .15s', width:'100%', ...xs }}
    onFocus={e=>{ e.target.style.borderColor='var(--agua)'; e.target.style.boxShadow='0 0 0 2px var(--agua-dim)' }}
    onBlur={e=>{ e.target.style.borderColor='var(--brd)'; e.target.style.boxShadow='none' }}
  />
)

// ══ CLIENTES — con baja lógica ════════════════════════════════
export function Clientes({ onRefresh }) {
  const { call, loading, editId, editForm, setEditForm, startEdit, cancelEdit, saveEdit } = useCRUD('/clientes')

  const [clientes, setClientes]       = useState([])
  const [mostrarTodos, setMostrarTodos] = useState(false)
  const [form, setForm] = useState({ nombre:'', telefono:'', email:'', direccion:'' })

  const loadClientes = async () => {
    const r = await apiFetch('GET', `/clientes${mostrarTodos ? '?todos=true' : ''}`)
    setClientes(r.datos || [])
  }

  useEffect(() => { loadClientes() }, [mostrarTodos])

  const set = (k,v) => setForm(f=>({...f,[k]:v}))

  // CREATE
  const guardar = async () => {
    if (!form.nombre) { sileo.error({ title:'El nombre es obligatorio' }); return }
    const r = await call('POST','/clientes',form)
    if (r.ok) {
      sileo.success({ title:r.mensaje, description:`ID #${r.datos.id_cliente}` })
      setForm({nombre:'',telefono:'',email:'',direccion:''})
      loadClientes(); onRefresh()
    } else sileo.error({ title:r.mensaje, description:r.error })
  }

  // UPDATE edición
  const guardarEdicion = async (id) => {
    const r = await call('PUT', `/clientes/${id}`, editForm)
    if (r.ok) { sileo.success({ title:'Cliente actualizado' }); cancelEdit(); loadClientes() }
    else sileo.error({ title:r.mensaje, description:r.error })
  }

  // BAJA / REACTIVACIÓN lógica
  const toggleActivo = async (cliente) => {
    const nuevoEstado = !cliente.activo
    const r = await call('PATCH', `/clientes/${cliente.id_cliente}/estado`, { activo: nuevoEstado })
    if (r.ok) {
      sileo.success({ title: nuevoEstado ? 'Cliente reactivado' : 'Cliente desactivado', description: cliente.nombre })
      loadClientes(); onRefresh()
    } else sileo.error({ title:r.mensaje, description:r.error })
  }

  const rows = clientes.map(c => {
    const isEditing = editId === c.id_cliente
    const inactivo  = !c.activo

    return [
      // ID con indicador de estado
      <div style={{ display:'flex', alignItems:'center', gap:6 }}>
        <Badge type={inactivo ? 'err' : 'cyan'}>#{c.id_cliente}</Badge>
        {inactivo && <span style={{ fontSize:'0.55rem', color:'var(--danger)', fontFamily:"'JetBrains Mono',monospace", letterSpacing:'.06em' }}>INACTIVO</span>}
      </div>,

      // Nombre
      isEditing
        ? <EditInput value={editForm.nombre} onChange={v=>setEditForm(f=>({...f,nombre:v}))} />
        : <span style={{ color: inactivo ? 'var(--txt-muted)' : 'var(--txt-primary)', textDecoration: inactivo ? 'line-through' : 'none', fontWeight:500 }}>{c.nombre}</span>,

      // Teléfono
      isEditing
        ? <EditInput value={editForm.telefono} onChange={v=>setEditForm(f=>({...f,telefono:v}))} placeholder="Teléfono" />
        : <span style={{ color: inactivo ? 'var(--txt-muted)' : 'inherit' }}>{c.telefono||'—'}</span>,

      // Email
      isEditing
        ? <EditInput type="email" value={editForm.email} onChange={v=>setEditForm(f=>({...f,email:v}))} placeholder="Correo" />
        : <span style={{ color: inactivo ? 'var(--txt-muted)' : 'inherit' }}>{c.email||'—'}</span>,

      // Dirección
      isEditing
        ? <EditInput value={editForm.direccion} onChange={v=>setEditForm(f=>({...f,direccion:v}))} placeholder="Dirección" />
        : <span style={{ color: inactivo ? 'var(--txt-muted)' : 'inherit' }}>{c.direccion||'—'}</span>,

      // Acciones
      isEditing
        ? <div style={{ display:'flex', gap:4 }}>
            <button onClick={() => guardarEdicion(c.id_cliente)} style={btnStyle('var(--success-dim)','var(--success-brd)','var(--success)')}><Check size={11} strokeWidth={2.5} /></button>
            <button onClick={cancelEdit} style={btnStyle('transparent','var(--brd)','var(--txt-secondary)')}><X size={11} strokeWidth={2.5} /></button>
          </div>
        : <div style={{ display:'flex', gap:4 }}>
            {/* Editar — solo si está activo */}
            {!inactivo && (
              <button onClick={() => startEdit(c.id_cliente, { nombre:c.nombre, telefono:c.telefono||'', email:c.email||'', direccion:c.direccion||'' })}
                style={btnStyle('transparent','var(--brd)','var(--txt-secondary)')} title="Editar"
                onMouseEnter={hoverCyan} onMouseLeave={unhover}>
                <Pencil size={11} strokeWidth={2} />
              </button>
            )}
            {/* Toggle activo/inactivo */}
            <button
              onClick={() => toggleActivo(c)}
              title={inactivo ? 'Reactivar cliente' : 'Desactivar cliente'}
              style={btnStyle(
                inactivo ? 'var(--success-dim)' : 'var(--danger-dim)',
                inactivo ? 'var(--success-brd)' : 'var(--danger-brd)',
                inactivo ? 'var(--success)'     : 'var(--danger)',
              )}>
              {inactivo ? <UserCheckIcon size={11} strokeWidth={2} /> : <UserX size={11} strokeWidth={2} />}
            </button>
          </div>,
    ]
  })

  return (
    <div>
      <PageTitle subtitle="registro de clientes">Clientes</PageTitle>

      {/* Form nuevo cliente */}
      <Card accent="var(--ambar)">
        <CardTitle icon={<Plus size={13} color="var(--ambar)" strokeWidth={2.5} />} accent="var(--ambar)">Nuevo cliente</CardTitle>
        <FormGrid>
          <Field label="Nombre completo"><Input placeholder="Ana Torres" value={form.nombre} onChange={e=>set('nombre',e.target.value)} /></Field>
          <Field label="Teléfono"><Input placeholder="9811234567" value={form.telefono} onChange={e=>set('telefono',e.target.value)} /></Field>
          <Field label="Correo electrónico"><Input type="email" placeholder="correo@ejemplo.com" value={form.email} onChange={e=>set('email',e.target.value)} /></Field>
          <Field label="Dirección"><Input placeholder="Calle, número, colonia" value={form.direccion} onChange={e=>set('direccion',e.target.value)} /></Field>
        </FormGrid>
        <BtnRow>
          <Btn variant="success" onClick={guardar} disabled={loading}><Save size={12} strokeWidth={2} />Guardar cliente</Btn>
        </BtnRow>
      </Card>

      {/* Lista */}
      <Card>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16, paddingBottom:14, borderBottom:'1px solid var(--brd)' }}>
          <span style={{ fontFamily:"'Inter',sans-serif", fontWeight:600, fontSize:'0.72rem', color:'var(--txt-secondary)', letterSpacing:'.12em', textTransform:'uppercase' }}>
            Lista de clientes
          </span>
          {/* Toggle mostrar inactivos */}
          <button
            onClick={() => setMostrarTodos(v => !v)}
            style={{
              display:'flex', alignItems:'center', gap:6,
              padding:'4px 10px', borderRadius:4, border:'1px solid var(--brd)',
              background: mostrarTodos ? 'var(--agua-dim)' : 'transparent',
              color: mostrarTodos ? 'var(--agua)' : 'var(--txt-muted)',
              cursor:'pointer', fontSize:'0.65rem', fontFamily:"'JetBrains Mono',monospace",
              letterSpacing:'.06em', transition:'all .15s',
            }}
          >
            {mostrarTodos ? <Eye size={11} strokeWidth={2} /> : <EyeOff size={11} strokeWidth={2} />}
            {mostrarTodos ? 'Ocultar inactivos' : 'Ver inactivos'}
          </button>
        </div>

        {/* Leyenda si hay inactivos visibles */}
        {mostrarTodos && clientes.some(c => !c.activo) && (
          <div style={{ marginBottom:10, padding:'6px 12px', borderRadius:5, background:'var(--danger-dim)', border:'1px solid var(--danger-brd)', fontSize:'0.65rem', color:'var(--danger)', fontFamily:"'JetBrains Mono',monospace", display:'flex', alignItems:'center', gap:8 }}>
            <UserX size={12} strokeWidth={2} />
            Los clientes tachados están desactivados. Sus pedidos se conservan intactos.
          </div>
        )}

        <Table
          columns={['#','Nombre','Teléfono','Correo','Dirección','Acciones']}
          rows={rows}
          emptyMsg="Sin clientes registrados"
        />
      </Card>
    </div>
  )
}

// ══ EMPLEADOS ═════════════════════════════════════════════════
export function Empleados({ onRefresh }) {
  const crud = useCRUD('/empleados')
  const [form, setForm] = useState({ nombre_empleado:'', puesto:'', departamento:'', salario:'' })
  const set = (k,v) => setForm(f=>({...f,[k]:v}))

  const guardar = async () => {
    if (!form.nombre_empleado||!form.puesto) { sileo.error({ title:'Nombre y puesto son obligatorios' }); return }
    const r = await crud.call('POST','/empleados',form)
    if (r.ok) {
      sileo.success({ title:r.mensaje, description:`ID #${r.datos.id_empleado}` })
      setForm({nombre_empleado:'',puesto:'',departamento:'',salario:''})
      crud.load(); onRefresh()
    } else sileo.error({ title:r.mensaje, description:r.error })
  }

  const rows = crud.data.map(e => {
    const isEditing  = crud.editId === e.id_empleado
    const isDeleting = crud.deleteId === e.id_empleado
    return [
      <Badge type="ok">#{e.id_empleado}</Badge>,
      isEditing ? <EditInput value={crud.editForm.nombre_empleado||''} onChange={v=>crud.setEditForm(f=>({...f,nombre_empleado:v}))} /> : <strong>{e.nombre_empleado}</strong>,
      isEditing ? <EditInput value={crud.editForm.puesto||''} onChange={v=>crud.setEditForm(f=>({...f,puesto:v}))} placeholder="Puesto" /> : e.puesto,
      isEditing ? <EditInput value={crud.editForm.departamento||''} onChange={v=>crud.setEditForm(f=>({...f,departamento:v}))} placeholder="Departamento" /> : e.departamento||'—',
      isEditing
        ? <EditInput type="number" value={crud.editForm.salario||''} onChange={v=>crud.setEditForm(f=>({...f,salario:v}))} style={{width:100}} />
        : <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:'0.78rem'}}>${parseFloat(e.salario||0).toFixed(2)}</span>,
      <ActionBtns
        isEditing={isEditing} isConfirmingDelete={isDeleting}
        onEdit={() => crud.startEdit(e.id_empleado, { nombre_empleado:e.nombre_empleado, puesto:e.puesto, departamento:e.departamento||'', salario:e.salario })}
        onSave={() => crud.saveEdit(e.id_empleado, `Empleado #${e.id_empleado} actualizado`)}
        onCancel={crud.cancelEdit}
        onDelete={() => crud.confirmDelete(e.id_empleado)}
        onConfirmDelete={() => crud.doDelete(e.id_empleado, `Empleado eliminado`)}
        onCancelDelete={crud.cancelDelete}
      />
    ]
  })

  return (
    <div>
      <PageTitle subtitle="personal y nómina">Empleados</PageTitle>
      <Card accent="var(--success)">
        <CardTitle icon={<Plus size={13} color="var(--success)" strokeWidth={2.5} />} accent="var(--success)">Nuevo empleado</CardTitle>
        <FormGrid>
          <Field label="Nombre completo"><Input placeholder="María González" value={form.nombre_empleado} onChange={e=>set('nombre_empleado',e.target.value)} /></Field>
          <Field label="Puesto"><Input placeholder="Operador" value={form.puesto} onChange={e=>set('puesto',e.target.value)} /></Field>
          <Field label="Departamento"><Input placeholder="Lavado" value={form.departamento} onChange={e=>set('departamento',e.target.value)} /></Field>
          <Field label="Salario"><Input type="number" placeholder="0.00" step="0.01" value={form.salario} onChange={e=>set('salario',e.target.value)} /></Field>
        </FormGrid>
        <BtnRow><Btn variant="success" onClick={guardar} disabled={crud.loading}><Save size={12} strokeWidth={2} />Guardar empleado</Btn></BtnRow>
      </Card>
      <Card>
        <CardTitle icon={<UserCheck size={13} color="var(--success)" strokeWidth={2} />} accent="var(--success)">Lista de empleados</CardTitle>
        <Table columns={['#','Nombre','Puesto','Departamento','Salario','Acciones']} rows={rows} emptyMsg="Sin empleados registrados" />
      </Card>
    </div>
  )
}

// ══ SERVICIOS ═════════════════════════════════════════════════
export function Servicios() {
  const crud = useCRUD('/servicios')
  const [form, setForm] = useState({ nom_servicio:'', costo:'' })

  const guardar = async () => {
    if (!form.nom_servicio||!form.costo) { sileo.error({ title:'Nombre y costo son obligatorios' }); return }
    const r = await crud.call('POST','/servicios',form)
    if (r.ok) { sileo.success({ title:r.mensaje }); setForm({nom_servicio:'',costo:''}); crud.load() }
    else sileo.error({ title:r.mensaje, description:r.error })
  }

  const rows = crud.data.map(s => {
    const isEditing  = crud.editId === s.id_servicio
    const isDeleting = crud.deleteId === s.id_servicio
    return [
      <Badge type="cyan">#{s.id_servicio}</Badge>,
      isEditing ? <EditInput value={crud.editForm.nom_servicio||''} onChange={v=>crud.setEditForm(f=>({...f,nom_servicio:v}))} placeholder="Nombre servicio" /> : <strong>{s.nom_servicio}</strong>,
      isEditing ? <EditInput type="number" value={crud.editForm.costo||''} onChange={v=>crud.setEditForm(f=>({...f,costo:v}))} style={{width:100}} /> : <Badge type="yellow">${parseFloat(s.costo||0).toFixed(2)}</Badge>,
      <ActionBtns
        isEditing={isEditing} isConfirmingDelete={isDeleting}
        onEdit={() => crud.startEdit(s.id_servicio, { nom_servicio:s.nom_servicio, costo:s.costo })}
        onSave={() => crud.saveEdit(s.id_servicio, 'Servicio actualizado')}
        onCancel={crud.cancelEdit}
        onDelete={() => crud.confirmDelete(s.id_servicio)}
        onConfirmDelete={() => crud.doDelete(s.id_servicio, 'Servicio eliminado')}
        onCancelDelete={crud.cancelDelete}
      />
    ]
  })

  return (
    <div>
      <PageTitle subtitle="catálogo de servicios">Servicios</PageTitle>
      <Card accent="#a78bfa">
        <CardTitle icon={<Plus size={13} color="#a78bfa" strokeWidth={2.5} />} accent="#a78bfa">Nuevo servicio</CardTitle>
        <FormGrid>
          <Field label="Nombre del servicio"><Input placeholder="Lavado Express" value={form.nom_servicio} onChange={e=>setForm(f=>({...f,nom_servicio:e.target.value}))} /></Field>
          <Field label="Costo"><Input type="number" placeholder="0.00" step="0.01" value={form.costo} onChange={e=>setForm(f=>({...f,costo:e.target.value}))} /></Field>
        </FormGrid>
        <BtnRow><Btn variant="success" onClick={guardar} disabled={crud.loading}><Save size={12} strokeWidth={2} />Guardar servicio</Btn></BtnRow>
      </Card>
      <Card>
        <CardTitle icon={<Sparkles size={13} color="#a78bfa" strokeWidth={2} />} accent="#a78bfa">Catálogo de servicios</CardTitle>
        <Table columns={['#','Servicio','Precio','Acciones']} rows={rows} emptyMsg="Sin servicios registrados" />
      </Card>
    </div>
  )
}
