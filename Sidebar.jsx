import {
  ClipboardList, Users, UserCheck, Sparkles,
  Package, CreditCard, Search, FileText, Clock, BarChart3,
  ChevronLeft, ChevronRight, Moon, Sun, Menu, X
} from 'lucide-react'
import { useState } from 'react'
import { useIsMobile } from '../hooks/useIsMobile'

const GROUPS = [
  {
    label: 'Operaciones',
    tabs: [
      { id:'pedidos',   label:'Pedidos',    Icon:ClipboardList },
      { id:'clientes',  label:'Clientes',   Icon:Users         },
      { id:'empleados', label:'Empleados',  Icon:UserCheck     },
      { id:'horarios',  label:'Horarios',   Icon:Clock         },
    ]
  },
  {
    label: 'Catálogo',
    tabs: [
      { id:'servicios', label:'Servicios',  Icon:Sparkles },
      { id:'insumos',   label:'Inventario', Icon:Package  },
    ]
  },
  {
    label: 'Finanzas',
    tabs: [
      { id:'pagos',     label:'Pagos',    Icon:CreditCard },
      { id:'facturas',  label:'Facturas', Icon:FileText   },
      { id:'reportes',  label:'Reportes', Icon:BarChart3  },
      { id:'query',     label:'Query',    Icon:Search     },
    ]
  },
]

export default function Sidebar({ active, onChange, theme, onToggleTheme }) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const isMobile = useIsMobile()

  const go = id => { onChange(id); setMobileOpen(false) }

  const NavItem = ({ id, label, Icon, mobile = false }) => {
    const on = active === id
    const col = collapsed && !mobile
    return (
      <button onClick={() => go(id)} title={col ? label : ''}
        style={{
          width: '100%',
          padding: col ? '8px 0' : '7px 10px',
          borderRadius: 6,
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 9,
          justifyContent: col ? 'center' : 'flex-start',
          background: on ? 'var(--agua-dim)' : 'transparent',
          color: on ? 'var(--agua)' : 'rgba(255,255,255,0.38)',
          transition: 'all .15s',
          position: 'relative',
          marginBottom: 1,
        }}
        onMouseEnter={e => { if (!on) { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'rgba(255,255,255,0.75)' }}}
        onMouseLeave={e => { if (!on) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.38)' }}}
      >
        {on && (
          <div style={{
            position: 'absolute', left: 0, top: '18%', bottom: '18%',
            width: 2.5, borderRadius: '0 3px 3px 0',
            background: 'var(--agua)',
            boxShadow: '0 0 6px var(--agua-glow)',
          }} />
        )}
        <div style={{
          width: 26, height: 26, borderRadius: 6,
          display: 'grid', placeItems: 'center', flexShrink: 0,
          background: on ? 'var(--agua-dim)' : 'transparent',
          border: on ? '1px solid var(--agua-brd)' : '1px solid transparent',
          transition: 'all .15s',
        }}>
          <Icon size={13} strokeWidth={on ? 2.2 : 1.7} />
        </div>
        {!col && (
          <span style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: '0.8rem',
            fontWeight: on ? 500 : 400,
            letterSpacing: '.01em',
          }}>
            {label}
          </span>
        )}
      </button>
    )
  }

  const SidebarBody = ({ mobile = false }) => {
    const col = collapsed && !mobile
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

        {/* Logo */}
        {!mobile && (
          <div style={{
            padding: col ? '16px 0' : '14px 14px',
            borderBottom: '1px solid rgba(255,255,255,.06)',
            display: 'flex', alignItems: 'center', gap: 10,
            justifyContent: col ? 'center' : 'flex-start',
            minHeight: 56,
          }}>
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <img src="/img/logo.png" alt="" style={{ width: 30, height: 30, borderRadius: 7, objectFit: 'cover', display: 'block' }} />
              <div style={{ position: 'absolute', inset: -1, borderRadius: 8, border: '1px solid var(--agua-brd)', pointerEvents: 'none' }} />
            </div>
            {!col && (
              <div>
                <div style={{
                  fontFamily: "'Inter', sans-serif", fontWeight: 800,
                  fontSize: '0.92rem', color: '#fff',
                  letterSpacing: '-.01em', lineHeight: 1.1,
                }}>
                  AQUA<span style={{ color: 'var(--agua)' }}>NOVA</span>
                </div>
                <div style={{ fontSize: '0.44rem', color: 'rgba(255,255,255,.18)', letterSpacing: '.16em', marginTop: 2 }}>
                  GESTIÓN LAVANDERÍA
                </div>
              </div>
            )}
          </div>
        )}

        {/* Nav */}
        <nav style={{ flex: 1, padding: '8px 8px', overflowY: 'auto' }}>
          {GROUPS.map(grp => (
            <div key={grp.label} style={{ marginBottom: 10 }}>
              {!col && !mobile && (
                <div style={{
                  padding: '0 10px 4px',
                  fontSize: '0.5rem',
                  color: 'rgba(255,255,255,.14)',
                  letterSpacing: '.18em',
                  fontFamily: "'JetBrains Mono', monospace",
                  textTransform: 'uppercase',
                }}>
                  {grp.label}
                </div>
              )}
              {grp.tabs.map(t => <NavItem key={t.id} {...t} mobile={mobile} />)}
            </div>
          ))}
        </nav>

        {/* Acciones inferiores */}
        <div style={{ padding: '4px 8px 10px', borderTop: '1px solid rgba(255,255,255,.05)', display: 'flex', flexDirection: 'column', gap: 2 }}>
          <button onClick={onToggleTheme}
            style={{
              width: '100%', padding: col ? '8px 0' : '7px 10px',
              borderRadius: 6, border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 9,
              justifyContent: col ? 'center' : 'flex-start',
              background: 'transparent', color: 'rgba(255,255,255,.28)',
              transition: 'all .15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,.05)'; e.currentTarget.style.color = 'rgba(255,255,255,.65)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,.28)' }}
          >
            <div style={{ width: 26, height: 26, borderRadius: 6, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
              {theme === 'dark' ? <Sun size={13} strokeWidth={1.6} /> : <Moon size={13} strokeWidth={1.6} />}
            </div>
            {!col && <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.78rem' }}>Cambiar tema</span>}
          </button>

          {!mobile && (
            <button onClick={() => setCollapsed(c => !c)}
              style={{
                width: '100%', padding: col ? '8px 0' : '7px 10px',
                borderRadius: 6, border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 9,
                justifyContent: col ? 'center' : 'flex-start',
                background: 'transparent', color: 'rgba(255,255,255,.28)',
                transition: 'all .15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,.05)'; e.currentTarget.style.color = 'rgba(255,255,255,.65)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,.28)' }}
            >
              <div style={{ width: 26, height: 26, borderRadius: 6, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                {collapsed ? <ChevronRight size={13} strokeWidth={2} /> : <ChevronLeft size={13} strokeWidth={2} />}
              </div>
              {!col && <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.78rem' }}>Colapsar</span>}
            </button>
          )}
        </div>
      </div>
    )
  }

  /* ── MOBILE ── */
  if (isMobile) return (
    <>
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        background: 'var(--sidebar-bg)',
        borderBottom: '1px solid rgba(255,255,255,.06)',
        height: 50,
        display: 'flex', alignItems: 'center',
        padding: '0 14px', gap: 10,
      }}>
        <button
          onClick={() => setMobileOpen(o => !o)}
          style={{
            width: 32, height: 32, borderRadius: 6,
            border: '1px solid var(--agua-brd)',
            background: 'var(--agua-dim)',
            color: 'var(--agua)',
            display: 'grid', placeItems: 'center',
            cursor: 'pointer', flexShrink: 0,
          }}
        >
          {mobileOpen ? <X size={14} /> : <Menu size={14} />}
        </button>
        <img src="/img/logo.png" alt="" style={{ width: 26, height: 26, borderRadius: 6, objectFit: 'cover', flexShrink: 0 }} />
        <div style={{ fontFamily: "'Inter', sans-serif", fontWeight: 800, fontSize: '0.88rem', color: '#fff' }}>
          AQUA<span style={{ color: 'var(--agua)' }}>NOVA</span>
        </div>
        <div style={{ marginLeft: 'auto' }}>
          <button
            onClick={onToggleTheme}
            style={{
              width: 30, height: 30, borderRadius: 6,
              border: '1px solid var(--agua-brd)',
              background: 'var(--agua-dim)',
              color: 'var(--agua)',
              display: 'grid', placeItems: 'center', cursor: 'pointer',
            }}
          >
            {theme === 'dark' ? <Sun size={13} /> : <Moon size={13} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          style={{ position: 'fixed', inset: 0, zIndex: 98, background: 'rgba(0,0,0,.65)', backdropFilter: 'blur(4px)' }}
        />
      )}
      <div style={{
        position: 'fixed', top: 50, left: 0, bottom: 0, width: 210, zIndex: 99,
        background: 'var(--sidebar-bg)',
        borderRight: '1px solid rgba(255,255,255,.05)',
        transform: mobileOpen ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform .22s cubic-bezier(.4,0,.2,1)',
        overflowY: 'auto',
      }}>
        <SidebarBody mobile />
      </div>
      <div style={{ height: 50, flexShrink: 0 }} />
    </>
  )

  return (
    <aside style={{
      width: collapsed ? 54 : 218,
      minHeight: '100vh', flexShrink: 0,
      background: 'var(--sidebar-bg)',
      borderRight: '1px solid rgba(255,255,255,.05)',
      position: 'sticky', top: 0, height: '100vh',
      transition: 'width .22s cubic-bezier(.4,0,.2,1)',
      overflow: 'hidden', zIndex: 50,
    }}>
      <SidebarBody />
    </aside>
  )
}
