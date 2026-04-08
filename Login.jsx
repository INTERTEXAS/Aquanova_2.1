import { useState } from 'react'
import { Mail, Lock, LogIn, Eye, EyeOff } from 'lucide-react'

export default function Login({ onLogin }) {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')

  const handleLogin = async () => {
    if (!email || !password) { setError('Ingresa tu correo y contraseña'); return }
    setLoading(true); setError('')
    try {
      const r = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await r.json()
      if (data.ok) {
        localStorage.setItem('aquanova_token', data.datos.token)
        localStorage.setItem('aquanova_user', JSON.stringify({ nombre: data.datos.nombre, email: data.datos.email }))
        onLogin(data.datos)
      } else {
        setError(data.mensaje || 'Credenciales incorrectas')
      }
    } catch(e) {
      setError('Error de conexión con el servidor')
    }
    setLoading(false)
  }

  const onKey = e => { if (e.key === 'Enter') handleLogin() }

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg-base)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 20, position: 'relative', overflow: 'hidden',
    }}>
      {/* Grid background */}
      <div style={{
        position: 'absolute', inset: 0, opacity: .03,
        backgroundImage: `linear-gradient(rgba(34,211,238,.6) 1px, transparent 1px), linear-gradient(90deg, rgba(34,211,238,.6) 1px, transparent 1px)`,
        backgroundSize: '44px 44px',
        mask: 'radial-gradient(ellipse 70% 70% at 50% 50%, black, transparent)',
        pointerEvents: 'none',
      }} />

      {/* Orbe */}
      <div style={{ position:'absolute', width:500, height:500, borderRadius:'50%', background:'radial-gradient(circle, rgba(34,211,238,0.05) 0%, transparent 70%)', pointerEvents:'none' }} />

      {/* Card de login */}
      <div style={{
        width: '100%', maxWidth: 400, position: 'relative', zIndex: 1,
        background: 'var(--bg-surface)', border: '1px solid var(--brd)',
        borderTop: '2px solid var(--agua)', borderRadius: '0 0 16px 16px',
        padding: '36px 32px', boxShadow: 'var(--shadow-lg)',
        animation: 'fadeUp .4s ease',
      }}>
        {/* Logo + nombre */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ position: 'relative', display: 'inline-block', marginBottom: 18 }}>
            <img src="/img/logo.png" alt="Aquanova" style={{ width: 72, height: 72, borderRadius: 16, objectFit: 'cover', display: 'block' }} />
            <div style={{ position:'absolute', inset:-2, borderRadius:18, border:'1px solid var(--agua-brd)', pointerEvents:'none' }} />
          </div>
          <div style={{ fontFamily:"'Inter',sans-serif", fontWeight:800, fontSize:'1.5rem', color:'var(--txt-primary)', letterSpacing:'-.02em' }}>
            AQUA<span style={{ color:'var(--agua)' }}>NOVA</span>
          </div>
          <div style={{ fontSize:'0.6rem', color:'var(--txt-muted)', letterSpacing:'.18em', marginTop:4, fontFamily:"'JetBrains Mono',monospace" }}>
            PANEL DE ADMINISTRACIÓN
          </div>
        </div>

        {/* Campos */}
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>

          {/* Email */}
          <div style={{ display:'flex', flexDirection:'column', gap:5 }}>
            <label style={{ fontSize:'0.6rem', color:'var(--txt-muted)', letterSpacing:'.1em', textTransform:'uppercase', fontFamily:"'JetBrains Mono',monospace" }}>
              Correo electrónico
            </label>
            <div style={{ position:'relative' }}>
              <Mail size={14} color="var(--txt-muted)" strokeWidth={1.8} style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', pointerEvents:'none' }} />
              <input
                type="email" placeholder="correo@ejemplo.com"
                value={email} onChange={e=>setEmail(e.target.value)} onKeyDown={onKey}
                style={{ width:'100%', height:42, padding:'0 14px 0 38px', background:'var(--bg-elevated)', border:'1px solid var(--brd)', borderRadius:8, color:'var(--txt-primary)', fontFamily:"'Inter',sans-serif", fontSize:'0.84rem', outline:'none', transition:'border-color .15s, box-shadow .15s' }}
                onFocus={e=>{ e.target.style.borderColor='var(--agua)'; e.target.style.boxShadow='0 0 0 2px var(--agua-dim)' }}
                onBlur={e=>{ e.target.style.borderColor='var(--brd)'; e.target.style.boxShadow='none' }}
              />
            </div>
          </div>

          {/* Contraseña */}
          <div style={{ display:'flex', flexDirection:'column', gap:5 }}>
            <label style={{ fontSize:'0.6rem', color:'var(--txt-muted)', letterSpacing:'.1em', textTransform:'uppercase', fontFamily:"'JetBrains Mono',monospace" }}>
              Contraseña
            </label>
            <div style={{ position:'relative' }}>
              <Lock size={14} color="var(--txt-muted)" strokeWidth={1.8} style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', pointerEvents:'none' }} />
              <input
                type={showPass ? 'text' : 'password'} placeholder="••••••••"
                value={password} onChange={e=>setPassword(e.target.value)} onKeyDown={onKey}
                style={{ width:'100%', height:42, padding:'0 42px 0 38px', background:'var(--bg-elevated)', border:'1px solid var(--brd)', borderRadius:8, color:'var(--txt-primary)', fontFamily:"'Inter',sans-serif", fontSize:'0.84rem', outline:'none', transition:'border-color .15s, box-shadow .15s' }}
                onFocus={e=>{ e.target.style.borderColor='var(--agua)'; e.target.style.boxShadow='0 0 0 2px var(--agua-dim)' }}
                onBlur={e=>{ e.target.style.borderColor='var(--brd)'; e.target.style.boxShadow='none' }}
              />
              <button onClick={() => setShowPass(v=>!v)}
                style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'var(--txt-muted)', display:'grid', placeItems:'center', padding:0 }}>
                {showPass ? <EyeOff size={14} strokeWidth={1.8} /> : <Eye size={14} strokeWidth={1.8} />}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div style={{ padding:'8px 12px', borderRadius:6, background:'var(--danger-dim)', border:'1px solid var(--danger-brd)', fontSize:'0.74rem', color:'var(--danger)', fontFamily:"'Inter',sans-serif", animation:'fadeUp .2s ease' }}>
              {error}
            </div>
          )}

          {/* Botón login */}
          <button onClick={handleLogin} disabled={loading}
            style={{
              width:'100%', height:44, borderRadius:8, border:'1px solid var(--agua-brd)',
              background: loading ? 'var(--agua-dim)' : 'linear-gradient(135deg, rgba(34,211,238,0.15), rgba(34,211,238,0.05))',
              color: 'var(--agua)', cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily:"'Inter',sans-serif", fontSize:'0.82rem', fontWeight:700,
              letterSpacing:'.06em', display:'flex', alignItems:'center', justifyContent:'center',
              gap:8, transition:'all .2s', marginTop:4,
              opacity: loading ? .7 : 1,
            }}
            onMouseEnter={e=>{ if(!loading) { e.currentTarget.style.background='rgba(34,211,238,0.18)'; e.currentTarget.style.transform='translateY(-1px)' }}}
            onMouseLeave={e=>{ e.currentTarget.style.background='linear-gradient(135deg, rgba(34,211,238,0.15), rgba(34,211,238,0.05))'; e.currentTarget.style.transform='translateY(0)' }}
          >
            <LogIn size={15} strokeWidth={2} />
            {loading ? 'Verificando...' : 'Iniciar sesión'}
          </button>
        </div>

        {/* Footer */}
        <div style={{ textAlign:'center', marginTop:24, fontSize:'0.58rem', color:'var(--txt-muted)', fontFamily:"'JetBrains Mono',monospace", letterSpacing:'.08em' }}>
          AQUANOVA · SISTEMA DE GESTIÓN · 2026
        </div>
      </div>

      <style>{`@keyframes fadeUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }`}</style>
    </div>
  )
}
