import { useState, useEffect } from 'react'
import { CustomToaster } from './components/CustomToaster'
import { LogOut, User } from 'lucide-react'
import Sidebar           from './components/Sidebar'
import StatsStrip        from './components/StatsStrip'
import SplashScreen      from './components/SplashScreen'
import Login             from './components/Login'
import ErrorBoundary     from './components/ErrorBoundary'
import Pedidos           from './components/Pedidos'
import { Clientes, Empleados, Servicios } from './components/Personas'
import { Insumos, Pagos } from './components/Inventario'
import QueryTool         from './components/QueryTool'
import Facturas          from './components/Facturas'
import HorariosEmpleados from './components/HorariosEmpleados'
import Reportes          from './components/Reportes'
import { useIsMobile }   from './hooks/useIsMobile'

export default function App() {
  const [tab, setTab]         = useState('pedidos')
  const [theme, setTheme]     = useState(() => localStorage.getItem('aquanova-theme') || 'dark')
  const [refresh, setRefresh] = useState(0)
  const [splash, setSplash]   = useState(true)
  const isMobile              = useIsMobile()
  const [usuario, setUsuario] = useState(() => {
    const u = localStorage.getItem('aquanova_user')
    return u ? JSON.parse(u) : null
  })

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('aquanova-theme', theme)
  }, [theme])

  // Verificar token al cargar
  useEffect(() => {
    const token = localStorage.getItem('aquanova_token')
    if (token && !usuario) {
      fetch('/api/auth/verify', { headers: { Authorization: `Bearer ${token}` } })
        .then(r => r.json())
        .then(data => {
          if (data.ok) setUsuario(data.datos)
          else { localStorage.removeItem('aquanova_token'); localStorage.removeItem('aquanova_user') }
        })
        .catch(() => { localStorage.removeItem('aquanova_token'); localStorage.removeItem('aquanova_user') })
    }
  }, [])

  // Sesión expirada via evento de useApi (sin reload completo)
  useEffect(() => {
    const handle = () => setUsuario(null)
    window.addEventListener('aquanova:unauthorized', handle)
    return () => window.removeEventListener('aquanova:unauthorized', handle)
  }, [])

  const handleLogin  = (data) => setUsuario({ nombre: data.nombre, email: data.email })
  const handleLogout = () => {
    localStorage.removeItem('aquanova_token')
    localStorage.removeItem('aquanova_user')
    setUsuario(null)
  }

  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark')
  const onRefresh   = () => setRefresh(r => r + 1)

  if (!usuario) {
    return (
      <>
        <CustomToaster />
        <Login onLogin={handleLogin} />
      </>
    )
  }

  const SECTIONS = {
    pedidos:   <Pedidos   onRefresh={onRefresh} />,
    clientes:  <Clientes  onRefresh={onRefresh} />,
    empleados: <Empleados onRefresh={onRefresh} />,
    horarios:  <HorariosEmpleados />,
    servicios: <Servicios />,
    insumos:   <Insumos   onRefresh={onRefresh} />,
    pagos:     <Pagos />,
    facturas:  <Facturas />,
    reportes:  <Reportes />,
    query:     <QueryTool />,
  }

  return (
    <>
      <CustomToaster />
      {splash && <SplashScreen onDone={() => setSplash(false)} />}

      <div style={{ display:'flex', minHeight:'100vh', flexDirection:isMobile?'column':'row', opacity:splash?0:1, transition:'opacity .5s', position:'relative', zIndex:1 }}>
        <Sidebar active={tab} onChange={setTab} theme={theme} onToggleTheme={toggleTheme} />

        <div style={{ flex:1, display:'flex', flexDirection:'column', minWidth:0 }}>

          {!isMobile && (
            <div style={{
              height: 46,
              background: 'var(--bg-elevated)',
              borderBottom: '1px solid var(--brd)',
              display: 'flex', alignItems: 'center',
              padding: '0 22px', gap: 16,
              position: 'sticky', top: 0, zIndex: 40,
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
            }}>
              <TopBarBreadcrumb active={tab} />
              <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 7,
                  padding: '4px 12px', borderRadius: 6,
                  background: 'var(--bg-raised)', border: '1px solid var(--brd)',
                }}>
                  <User size={11} color="var(--agua)" strokeWidth={2} />
                  <span style={{ fontSize: '0.7rem', color: 'var(--txt-secondary)', fontFamily: "'Inter',sans-serif", fontWeight: 500 }}>
                    {usuario.nombre}
                  </span>
                </div>
                <button onClick={handleLogout}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '4px 12px', borderRadius: 6,
                    border: '1px solid var(--danger-brd)',
                    background: 'var(--danger-dim)', color: 'var(--danger)',
                    cursor: 'pointer', fontSize: '0.7rem',
                    fontFamily: "'Inter', sans-serif",
                    letterSpacing: '.03em', transition: 'all .15s', fontWeight: 500,
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'var(--danger-brd)' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'var(--danger-dim)' }}
                >
                  <LogOut size={11} strokeWidth={2.5} /> Salir
                </button>
              </div>
            </div>
          )}

          <StatsStrip refresh={refresh} />

          <main style={{ padding:isMobile?'12px 12px 40px':'12px 22px 40px', flex:1 }}>
            <ErrorBoundary key={tab}>
              <div style={{ animation:'fadeUp .28s ease' }}>
                {SECTIONS[tab]}
              </div>
            </ErrorBoundary>
          </main>

          <footer style={{
            borderTop: '1px solid var(--brd)',
            padding: '7px 22px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            fontSize: '0.6rem', color: 'var(--txt-muted)',
            fontFamily: "'JetBrains Mono', monospace", letterSpacing: '.07em',
          }}>
            <span>AQUANOVA v12.1</span>
            <span>PostgreSQL · Node.js · React</span>
          </footer>
        </div>
      </div>
    </>
  )
}

function TopBarBreadcrumb({ active }) {
  const [connected, setConnected] = useState(false)
  const [time, setTime] = useState(new Date())
  const LABELS = {
    pedidos:'Pedidos', clientes:'Clientes', empleados:'Empleados',
    horarios:'Horarios', servicios:'Servicios', insumos:'Inventario',
    pagos:'Pagos', facturas:'Facturas', reportes:'Reportes', query:'Query'
  }

  useEffect(() => {
    fetch('/api/reportes/stats', { headers: { Authorization: `Bearer ${localStorage.getItem('aquanova_token')}` } })
      .then(r => r.json()).then(d => setConnected(d.ok)).catch(() => setConnected(false))
  }, [])

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
      {/* Breadcrumb */}
      <span style={{ fontSize: '0.72rem', color: 'var(--txt-muted)', fontFamily: "'Inter', sans-serif", fontWeight: 400 }}>
        Aquanova
      </span>
      <span style={{ color: 'var(--brd-med)', fontSize: '0.8rem', lineHeight: 1 }}>/</span>
      <span style={{ fontSize: '0.8rem', color: 'var(--txt-primary)', fontFamily: "'Inter', sans-serif", fontWeight: 600 }}>
        {LABELS[active]}
      </span>

      {/* Clock */}
      <div style={{ marginLeft: 14, fontSize: '0.7rem', color: 'var(--txt-muted)', fontFamily: "'JetBrains Mono', monospace", letterSpacing: '.04em' }}>
        {time.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
      </div>

      {/* DB status */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 5,
        fontSize: '0.68rem', padding: '3px 10px', borderRadius: 5,
        border: `1px solid ${connected ? 'var(--success-brd)' : 'var(--danger-brd)'}`,
        background: connected ? 'var(--success-dim)' : 'var(--danger-dim)',
        color: connected ? 'var(--success)' : 'var(--danger)',
        fontFamily: "'JetBrains Mono', monospace", letterSpacing: '.04em',
      }}>
        <div style={{ width: 5, height: 5, borderRadius: '50%', background: connected ? 'var(--success)' : 'var(--danger)', flexShrink: 0 }} />
        {connected ? 'DB online' : 'Sin conexión'}
      </div>
    </div>
  )
}
