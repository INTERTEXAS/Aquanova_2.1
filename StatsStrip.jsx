import { useEffect, useState, useRef } from 'react'
import { ClipboardList, Users, UserCheck, AlertTriangle, FileText, Clock } from 'lucide-react'
import { apiFetch } from '../hooks/useApi'
import { useIsMobile } from '../hooks/useIsMobile'

const STATS = [
  { key:'pedidos',   label:'Pedidos',            Icon:ClipboardList, color:'#22d3ee', bg:'rgba(34,211,238,.08)',  brd:'rgba(34,211,238,.18)' },
  { key:'clientes',  label:'Clientes activos',   Icon:Users,         color:'#f59e0b', bg:'rgba(245,158,11,.08)',  brd:'rgba(245,158,11,.18)' },
  { key:'empleados', label:'Empleados',          Icon:UserCheck,     color:'#34d399', bg:'rgba(52,211,153,.08)',  brd:'rgba(52,211,153,.18)' },
  { key:'alertas',   label:'Alertas stock',      Icon:AlertTriangle, color:'#f43f5e', bg:'rgba(244,63,94,.08)',   brd:'rgba(244,63,94,.18)'  },
  { key:'facturas',  label:'Facturas pendientes',Icon:FileText,      color:'#818cf8', bg:'rgba(129,140,248,.08)', brd:'rgba(129,140,248,.18)' },
  { key:'horarios',  label:'Horarios hoy',       Icon:Clock,         color:'#a78bfa', bg:'rgba(167,139,250,.08)', brd:'rgba(167,139,250,.18)' },
]

const AUTO_REFRESH_MS = 60_000

function Num({ value }) {
  const [n, setN] = useState(0)
  const p = useRef(0)
  useEffect(() => {
    if (typeof value !== 'number') return
    const s = p.current, e = value, d = 600, t0 = performance.now()
    const tick = now => {
      const prog = Math.min((now - t0) / d, 1)
      const ease = 1 - Math.pow(1 - prog, 3)
      setN(Math.round(s + (e - s) * ease))
      if (prog < 1) requestAnimationFrame(tick)
      else p.current = e
    }
    requestAnimationFrame(tick)
  }, [value])
  return <span style={{ animation:'countUp .3s ease' }}>{typeof value === 'number' ? n : '—'}</span>
}

export default function StatsStrip({ refresh }) {
  const [counts, setCounts] = useState({ pedidos:null,clientes:null,empleados:null,alertas:null,facturas:null,horarios:null })
  const isMobile = useIsMobile(640)

  const fetchStats = () => {
    apiFetch('GET', '/reportes/stats').then(r => {
      if (r.ok) setCounts(r.datos)
    }).catch(() => {
      Promise.all([
        apiFetch('GET','/pedidos'), apiFetch('GET','/clientes'),
        apiFetch('GET','/empleados'), apiFetch('GET','/insumos'),
      ]).then(([rp,rc,re,ri]) => setCounts({
        pedidos:   rp.datos?.length ?? 0,
        clientes:  rc.datos?.length ?? 0,
        empleados: re.datos?.length ?? 0,
        alertas:   (ri.datos||[]).filter(i=>i.alerta_stock).length,
        facturas:  0, horarios: 0,
      }))
    })
  }

  useEffect(() => {
    fetchStats()
  }, [refresh])

  useEffect(() => {
    const id = setInterval(fetchStats, AUTO_REFRESH_MS)
    return () => clearInterval(id)
  }, [])

  // Layout Bento Grid: define qué celdas ocupan más espacio
  const BENTO_LAYOUT = [
    { key:'pedidos',   cols:isMobile?2:2, rows:1 }, // Más grande
    { key:'clientes',  cols:1, rows:1 },
    { key:'empleados', cols:1, rows:1 },
    { key:'alertas',   cols:isMobile?2:1, rows:1 },
    { key:'facturas',  cols:1, rows:1 },
    { key:'horarios',  cols:1, rows:1 },
  ]

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(6, 1fr)',
      gridAutoRows: 'minmax(80px, auto)',
      gap: 10, padding: '14px 22px',
      position: 'relative', zIndex: 1,
    }}>
      {BENTO_LAYOUT.map((item, i) => {
        const cfg = STATS.find(s => s.key === item.key)
        if (!cfg) return null
        const isAlert = item.key === 'alertas' && counts.alertas > 0

        return (
          <div key={item.key} style={{
            gridColumn: `span ${item.cols}`,
            gridRow: `span ${item.rows}`,
            background:'var(--bg-glass)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            border:`1px solid ${isAlert ? 'var(--danger-brd)' : 'var(--brd)'}`,
            borderTop: `2px solid ${isAlert ? cfg.color : cfg.color}`,
            borderRadius: 12,
            padding:'14px 16px',
            display:'flex', flexDirection:'column', justifyContent:'space-between',
            animation:`fadeUp .5s cubic-bezier(0.16, 1, 0.3, 1) ${i*.05}s both`,
            transition:'all .3s cubic-bezier(0.4, 0, 0.2, 1)',
            position:'relative', overflow:'hidden',
            boxShadow: isAlert ? '0 0 25px rgba(244,114,182,0.15)' : 'var(--shadow-sm), var(--glass-inset)',
          }}
            onMouseEnter={e => { 
              e.currentTarget.style.borderColor='var(--agua-brd)';
              e.currentTarget.style.transform='translateY(-3px)';
              e.currentTarget.style.boxShadow= isAlert ? '0 15px 35px rgba(244,114,182,0.2)' : 'var(--shadow-lg), 0 0 0 1px var(--agua-brd), 0 0 20px var(--agua-glow)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor= isAlert ? 'var(--danger-brd)' : 'var(--brd)';
              e.currentTarget.style.transform='translateY(0)';
              e.currentTarget.style.boxShadow= isAlert ? '0 0 25px rgba(244,114,182,0.15)' : 'var(--shadow-sm), var(--glass-inset)';
            }}
          >
            {/* Decoración técnica en el fondo */}
            <div style={{ position:'absolute', top:-10, right:-10, padding:10, opacity:0.04, pointerEvents:'none' }}>
              <cfg.Icon size={100} strokeWidth={1} />
            </div>

            <div style={{ display:'flex',alignItems:'flex-start',justifyContent:'space-between', position:'relative', zIndex:1 }}>
              <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
                <span style={{ fontSize:'0.58rem',color:'var(--txt-muted)',letterSpacing:'.15em',textTransform:'uppercase',fontFamily:"'JetBrains Mono',monospace", fontWeight:600 }}>
                  {cfg.label}
                </span>
                <div style={{ fontFamily:"'Poppins',sans-serif",fontWeight:700,fontSize: item.cols > 1 ? '2rem' : '1.65rem',lineHeight:1,color: isAlert ? 'var(--danger)' : 'var(--txt-primary)', letterSpacing:'-0.04em' }}>
                  <Num value={counts[item.key]} />
                </div>
              </div>
              <div style={{ width:32,height:32,borderRadius:8,background:cfg.bg,border:`1px solid ${cfg.brd}`,display:'grid',placeItems:'center',flexShrink:0 }}>
                <cfg.Icon size={14} color={cfg.color} strokeWidth={2.2} />
              </div>
            </div>

            {/* Línea de progreso o detalle sutil al pie */}
            <div style={{ marginTop:14, height:3, background:'var(--brd)', borderRadius:2, overflow:'hidden', position:'relative', zIndex:1 }}>
              <div style={{ height:'100%', width: counts[item.key] > 0 ? '65%' : '0%', background: `linear-gradient(90deg, ${isAlert ? 'var(--danger)' : 'var(--agua)'}, transparent)`, opacity:0.6, transition:'width 1.2s cubic-bezier(0.16, 1, 0.3, 1)' }} />
            </div>
          </div>
        )
      })}
    </div>
  )
}
