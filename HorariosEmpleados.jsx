import { useState, useEffect } from 'react'
import { toast as sileo } from "./CustomToaster"
import { Clock, Plus, Save, Pencil, Trash2, X, Check } from 'lucide-react'
import { useApi, apiFetch } from '../hooks/useApi'
import { Card, CardTitle, PageTitle, Badge, Btn, BtnRow, FormGrid, Field, Input, Select, Table } from './UI'

const DIAS = ['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo']
const TURNOS = ['Matutino','Vespertino','Nocturno','Mixto']
const TURNO_COLOR = { 'Matutino':'cyan','Vespertino':'yellow','Nocturno':'err','Mixto':'ok' }

export default function HorariosEmpleados() {
  const { call, loading } = useApi()
  const [data, setData]         = useState([])
  const [empleados, setEmpleados] = useState([])
  const [editId, setEditId]     = useState(null)
  const [editForm, setEditForm] = useState({})
  const [deleteId, setDeleteId] = useState(null)
  const [filtroEmp, setFiltroEmp] = useState('')
  const [form, setForm] = useState({ id_empleado:'', dia_semana:'Lunes', hora_entrada:'', hora_salida:'', turno:'Matutino' })

  const load = async () => {
    const [rh, re] = await Promise.all([apiFetch('GET','/horarios'), apiFetch('GET','/empleados')])
    setData(rh.datos||[]); setEmpleados(re.datos||[])
  }
  useEffect(() => { load() }, [])
  const set = (k,v) => setForm(f=>({...f,[k]:v}))

  // Calcular horas trabajadas
  const calcHoras = (entrada, salida) => {
    if (!entrada || !salida) return '—'
    const [he, me] = entrada.split(':').map(Number)
    const [hs, ms] = salida.split(':').map(Number)
    let mins = (hs * 60 + ms) - (he * 60 + me)
    if (mins < 0) mins += 24 * 60
    const h = Math.floor(mins / 60), m = mins % 60
    return `${h}h ${m > 0 ? m + 'm' : ''}`
  }

  const guardar = async () => {
    if (!form.id_empleado || !form.hora_entrada || !form.hora_salida)
      { sileo.error({ title:'Empleado, entrada y salida son obligatorios' }); return }
    const r = await call('POST','/horarios',form)
    if (r.ok) { sileo.success({ title:r.mensaje }); setForm({id_empleado:'',dia_semana:'Lunes',hora_entrada:'',hora_salida:'',turno:'Matutino'}); load() }
    else sileo.error({ title:r.mensaje, description:r.error })
  }

  const saveEdit = async (id) => {
    const r = await call('PUT',`/horarios/${id}`,editForm)
    if (r.ok) { sileo.success({ title:'Horario actualizado' }); setEditId(null); load() }
    else sileo.error({ title:r.mensaje, description:r.error })
  }

  const doDelete = async (id) => {
    const r = await call('DELETE',`/horarios/${id}`)
    if (r.ok) { sileo.success({ title:'Horario eliminado' }); setDeleteId(null); load() }
    else sileo.error({ title:r.mensaje, description:r.error })
  }

  const datosFiltrados = filtroEmp
    ? data.filter(h => String(h.id_empleado) === filtroEmp)
    : data

  const rows = datosFiltrados.map(h => {
    const isEditing  = editId === h.id_horario
    const isDeleting = deleteId === h.id_horario
    return [
      <Badge type="cyan">#{h.id_horario}</Badge>,
      <strong style={{ fontSize:'0.8rem' }}>{h.nombre_empleado}</strong>,

      isEditing
        ? <Select value={editForm.dia_semana} onChange={e=>setEditForm(ef=>({...ef,dia_semana:e.target.value}))} style={{ height:28,fontSize:'0.7rem',width:110 }}>
            {DIAS.map(d=><option key={d}>{d}</option>)}
          </Select>
        : <span style={{ fontSize:'0.78rem' }}>{h.dia_semana}</span>,

      isEditing
        ? <Input type="time" value={editForm.hora_entrada} onChange={e=>setEditForm(ef=>({...ef,hora_entrada:e.target.value}))} style={{ height:28,width:90,fontSize:'0.78rem' }} />
        : <span style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:'0.78rem' }}>{h.hora_entrada}</span>,

      isEditing
        ? <Input type="time" value={editForm.hora_salida} onChange={e=>setEditForm(ef=>({...ef,hora_salida:e.target.value}))} style={{ height:28,width:90,fontSize:'0.78rem' }} />
        : <span style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:'0.78rem' }}>{h.hora_salida}</span>,

      <span style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:'0.72rem',color:'var(--agua)' }}>
        {calcHoras(h.hora_entrada, h.hora_salida)}
      </span>,

      isEditing
        ? <Select value={editForm.turno} onChange={e=>setEditForm(ef=>({...ef,turno:e.target.value}))} style={{ height:28,fontSize:'0.7rem',width:110 }}>
            {TURNOS.map(t=><option key={t}>{t}</option>)}
          </Select>
        : <Badge type={TURNO_COLOR[h.turno]||'cyan'}>{h.turno}</Badge>,

      isEditing
        ? <div style={{ display:'flex',gap:4 }}>
            <button onClick={() => saveEdit(h.id_horario)} style={{ width:26,height:26,borderRadius:4,border:'1px solid var(--success-brd)',background:'var(--success-dim)',color:'var(--success)',cursor:'pointer',display:'grid',placeItems:'center' }}><Check size={11} strokeWidth={2.5} /></button>
            <button onClick={() => setEditId(null)} style={{ width:26,height:26,borderRadius:4,border:'1px solid var(--brd)',background:'transparent',color:'var(--txt-secondary)',cursor:'pointer',display:'grid',placeItems:'center' }}><X size={11} strokeWidth={2.5} /></button>
          </div>
        : isDeleting
          ? <div style={{ display:'flex',gap:4,alignItems:'center' }}>
              <span style={{ fontSize:'0.58rem',color:'var(--danger)',fontFamily:"'JetBrains Mono',monospace" }}>¿Eliminar?</span>
              <button onClick={() => doDelete(h.id_horario)} style={{ width:26,height:26,borderRadius:4,border:'1px solid var(--success-brd)',background:'var(--success-dim)',color:'var(--success)',cursor:'pointer',display:'grid',placeItems:'center' }}><Check size={11} strokeWidth={2.5} /></button>
              <button onClick={() => setDeleteId(null)} style={{ width:26,height:26,borderRadius:4,border:'1px solid var(--brd)',background:'transparent',color:'var(--txt-secondary)',cursor:'pointer',display:'grid',placeItems:'center' }}><X size={11} strokeWidth={2.5} /></button>
            </div>
          : <div style={{ display:'flex',gap:4 }}>
              <button onClick={() => { setEditId(h.id_horario); setEditForm({ dia_semana:h.dia_semana,hora_entrada:h.hora_entrada,hora_salida:h.hora_salida,turno:h.turno }) }}
                style={{ width:26,height:26,borderRadius:4,border:'1px solid var(--brd)',background:'transparent',color:'var(--txt-secondary)',cursor:'pointer',display:'grid',placeItems:'center',transition:'all .12s' }}
                onMouseEnter={e=>{e.currentTarget.style.borderColor='var(--agua-brd)';e.currentTarget.style.color='var(--agua)';e.currentTarget.style.background='var(--agua-dim)'}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--brd)';e.currentTarget.style.color='var(--txt-secondary)';e.currentTarget.style.background='transparent'}}>
                <Pencil size={11} strokeWidth={2} />
              </button>
              <button onClick={() => setDeleteId(h.id_horario)}
                style={{ width:26,height:26,borderRadius:4,border:'1px solid var(--brd)',background:'transparent',color:'var(--txt-secondary)',cursor:'pointer',display:'grid',placeItems:'center',transition:'all .12s' }}
                onMouseEnter={e=>{e.currentTarget.style.borderColor='var(--danger-brd)';e.currentTarget.style.color='var(--danger)';e.currentTarget.style.background='var(--danger-dim)'}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--brd)';e.currentTarget.style.color='var(--txt-secondary)';e.currentTarget.style.background='transparent'}}>
                <Trash2 size={11} strokeWidth={2} />
              </button>
            </div>,
    ]
  })

  return (
    <div>
      <PageTitle subtitle="registro de turnos">Horarios de Empleados</PageTitle>

      <Card accent="var(--success)">
        <CardTitle icon={<Plus size={13} color="var(--success)" strokeWidth={2.5} />} accent="var(--success)">Nuevo horario</CardTitle>
        <FormGrid>
          <Field label="Empleado">
            <Select value={form.id_empleado} onChange={e=>set('id_empleado',e.target.value)}>
              <option value="">Seleccionar...</option>
              {empleados.map(e=><option key={e.id_empleado} value={e.id_empleado}>{e.nombre_empleado}</option>)}
            </Select>
          </Field>
          <Field label="Día de la semana">
            <Select value={form.dia_semana} onChange={e=>set('dia_semana',e.target.value)}>
              {DIAS.map(d=><option key={d}>{d}</option>)}
            </Select>
          </Field>
          <Field label="Hora de entrada"><Input type="time" value={form.hora_entrada} onChange={e=>set('hora_entrada',e.target.value)} /></Field>
          <Field label="Hora de salida"><Input type="time" value={form.hora_salida} onChange={e=>set('hora_salida',e.target.value)} /></Field>
          <Field label="Turno">
            <Select value={form.turno} onChange={e=>set('turno',e.target.value)}>
              {TURNOS.map(t=><option key={t}>{t}</option>)}
            </Select>
          </Field>
        </FormGrid>
        {form.hora_entrada && form.hora_salida && (
          <div style={{ marginBottom:12, padding:'6px 12px', borderRadius:5, background:'var(--agua-dim)', border:'1px solid var(--agua-brd)', fontSize:'0.68rem', color:'var(--agua)', fontFamily:"'JetBrains Mono',monospace" }}>
            Duración del turno: {calcHoras(form.hora_entrada, form.hora_salida)}
          </div>
        )}
        <BtnRow><Btn variant="success" onClick={guardar} disabled={loading}><Save size={12} strokeWidth={2} />Guardar horario</Btn></BtnRow>
      </Card>

      <Card>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16, paddingBottom:14, borderBottom:'1px solid var(--brd)' }}>
          <span style={{ fontFamily:"'Inter',sans-serif", fontWeight:600, fontSize:'0.72rem', color:'var(--txt-secondary)', letterSpacing:'.12em', textTransform:'uppercase' }}>
            Horarios registrados
          </span>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <span style={{ fontSize:'0.6rem', color:'var(--txt-muted)', fontFamily:"'JetBrains Mono',monospace" }}>Filtrar:</span>
            <Select value={filtroEmp} onChange={e=>setFiltroEmp(e.target.value)} style={{ height:28, fontSize:'0.72rem', width:160 }}>
              <option value="">Todos los empleados</option>
              {empleados.map(e=><option key={e.id_empleado} value={e.id_empleado}>{e.nombre_empleado}</option>)}
            </Select>
          </div>
        </div>
        <Table
          columns={['#','Empleado','Día','Entrada','Salida','Duración','Turno','Acciones']}
          rows={rows}
          emptyMsg="Sin horarios registrados"
        />
      </Card>
    </div>
  )
}
