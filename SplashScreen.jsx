import { useEffect, useState } from 'react'

export default function SplashScreen({ onDone }) {
  const [progress, setProgress] = useState(0)
  const [step, setStep]         = useState(0)

  const steps = [
    'Verificando entorno...',
    'Conectando a PostgreSQL...',
    'Cargando módulos...',
    'Inicializando interfaz...',
    'Listo',
  ]

  useEffect(() => {
    const timeline = [
      { p:18, s:0, t:300  },
      { p:42, s:1, t:700  },
      { p:68, s:2, t:1100 },
      { p:88, s:3, t:1500 },
      { p:100,s:4, t:1900 },
    ]
    timeline.forEach(({ p, s, t }) => setTimeout(() => { setProgress(p); setStep(s) }, t))
    setTimeout(onDone, 2400)
  }, [])

  return (
    <div style={{
      position:'fixed', inset:0, zIndex:9999,
      background:'#050710',
      display:'flex', flexDirection:'column',
      alignItems:'center', justifyContent:'center', gap:44,
    }}>
      {/* Grid */}
      <div style={{
        position:'absolute', inset:0, opacity:.035,
        backgroundImage:`linear-gradient(rgba(34,211,238,.6) 1px, transparent 1px), linear-gradient(90deg, rgba(34,211,238,.6) 1px, transparent 1px)`,
        backgroundSize:'44px 44px',
        mask:'radial-gradient(ellipse 60% 60% at 50% 50%, black, transparent)',
        pointerEvents:'none',
      }} />

      {/* Orbe central */}
      <div style={{ position:'absolute', width:320, height:320, borderRadius:'50%', background:'radial-gradient(circle, rgba(34,211,238,0.05) 0%, transparent 70%)', pointerEvents:'none' }} />

      {/* Logo + texto */}
      <div style={{ position:'relative', zIndex:1, textAlign:'center' }}>
        {/* Logo con anillos */}
        <div style={{ position:'relative', display:'inline-block', marginBottom:28 }}>
          <img src="/img/logo.png" alt="" style={{ width:80, height:80, borderRadius:18, objectFit:'cover', display:'block' }} />
          {[1,2].map(i => (
            <div key={i} style={{
              position:'absolute',
              inset: -(i*10),
              borderRadius: 18 + i*10,
              border: `1px solid rgba(34,211,238,${.25 - i*.1})`,
              animation: `pulse-ring ${1.4 + i*.4}s ease infinite`,
              animationDelay: `${i*.2}s`,
            }} />
          ))}
        </div>

        <div style={{ fontFamily:"'Inter',sans-serif", fontWeight:800, fontSize:'2.2rem', color:'#fff', letterSpacing:'-.02em', lineHeight:1 }}>
          AQUA<span style={{ color:'#22d3ee' }}>NOVA</span>
        </div>
        <div style={{ marginTop:6, fontSize:'0.58rem', color:'rgba(255,255,255,.2)', letterSpacing:'.22em', fontFamily:"'JetBrains Mono',monospace" }}>
          SISTEMA DE GESTIÓN · LAVANDERÍA
        </div>
      </div>

      {/* Progress */}
      <div style={{ position:'relative', zIndex:1, width:280 }}>
        {/* Tanque de agua (Progress Bar) */}
        <div style={{ 
          height:12, background:'rgba(255,255,255,.03)', borderRadius:20, 
          overflow:'hidden', marginBottom:14, border:'1px solid rgba(34,211,238,.1)',
          position:'relative'
        }}>
          {/* Capa de Agua */}
          <div style={{
            height:'100%', borderRadius:20,
            background:'linear-gradient(180deg, #22d3ee, #0ea5e9)',
            width:`${progress}%`,
            transition:'width .45s cubic-bezier(.4,0,.2,1)',
            boxShadow:'0 0 15px rgba(34,211,238,.3)',
            position:'relative',
            overflow:'hidden'
          }}>
            {/* Onda Animada */}
            <div className="water-wave" style={{
              position:'absolute', top:-15, right:-20, width: progress > 0 ? 60 : 0, height:60,
              background:'rgba(255,255,255,0.2)', borderRadius:'40%',
              animation:'wave-spin 2s linear infinite'
            }} />
          </div>
        </div>

        {/* Info row */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <span style={{ fontSize:'0.55rem', color:'var(--txt-muted)', fontFamily:"'JetBrains Mono',monospace", letterSpacing:'.1em', textTransform:'uppercase' }}>
            {steps[step]}
          </span>
          <span style={{ fontSize:'0.65rem', color:'var(--agua)', fontFamily:"'JetBrains Mono',monospace", fontWeight:600 }}>
            {progress}%
          </span>
        </div>
      </div>

      <style>{`
        @keyframes pulse-ring {
          0%,100%{opacity:.2;transform:scale(1)}
          50%{opacity:.4;transform:scale(1.05)}
        }
        @keyframes wave-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .water-wave { opacity: ${progress === 100 ? 0 : 1}; transition: opacity 0.5s; }
      `}</style>
    </div>
  )
}
