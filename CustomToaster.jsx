import React, { useState, useEffect } from 'react'
import { CheckCircle, AlertCircle, X, Info } from 'lucide-react'

// Sistema de eventos mejorado
let listeners = []
export const toast = {
  success: (data) => listeners.forEach(l => l({ type: 'success', ...data })),
  error: (data) => listeners.forEach(l => l({ type: 'error', ...data })),
  info: (data) => listeners.forEach(l => l({ type: 'info', ...data }))
}

export function CustomToaster() {
  const [notifs, setNotifs] = useState([])

  useEffect(() => {
    const handler = (n) => {
      const id = Date.now()
      setNotifs(prev => [...prev, { id, isClosing: false, ...n }])
      
      // Iniciar cierre automático
      setTimeout(() => startClosing(id), 4500)
    }
    listeners.push(handler)
    return () => { listeners = listeners.filter(l => l !== handler) }
  }, [])

  const startClosing = (id) => {
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, isClosing: true } : n))
    setTimeout(() => remove(id), 400) // Tiempo para la animación de salida
  }

  const remove = (id) => setNotifs(prev => prev.filter(x => x.id !== id))

  return (
    <div style={{
      position: 'fixed', top: 24, right: 24, zIndex: 999999,
      display: 'flex', flexDirection: 'column', gap: 10,
      pointerEvents: 'none', maxWidth: 380, width: '100%'
    }}>
      {notifs.map((n) => (
        <div key={n.id} style={{
          pointerEvents: 'auto',
          background: 'rgba(12, 28, 48, 0.72)',
          backdropFilter: 'blur(16px) saturate(160%)',
          WebkitBackdropFilter: 'blur(16px) saturate(160%)',
          border: `1px solid ${n.type === 'success' ? 'rgba(16, 217, 160, 0.25)' : 'rgba(244, 63, 94, 0.25)'}`,
          borderLeft: `5px solid ${n.type === 'success' ? '#10d9a0' : '#f43f5e'}`,
          borderRadius: 12,
          padding: '16px 20px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.5), inset 0 1px 1px rgba(255,255,255,0.06)',
          display: 'flex', gap: 14, alignItems: 'flex-start',
          animation: n.isClosing 
            ? 'toastExit 0.4s cubic-bezier(0.4, 0, 1, 1) forwards'
            : 'toastEnter 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) both',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Brillo líquido animado (Shimmer) */}
          <div className="shimmer-effect" style={{
            position: 'absolute', top: 0, left: '-100%', width: '100%', height: '100%',
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent)',
            animation: 'shimmerSweep 3s infinite',
            pointerEvents: 'none'
          }} />

          <div style={{ flexShrink: 0, marginTop: 2, filter: 'drop-shadow(0 0 8px currentColor)', color: n.type === 'success' ? '#10d9a0' : '#f43f5e' }}>
            {n.type === 'success' 
              ? <CheckCircle size={20} strokeWidth={2.5} /> 
              : <AlertCircle size={20} strokeWidth={2.5} />
            }
          </div>
          
          <div style={{ flex: 1 }}>
            <div style={{ 
              color: '#fff', fontWeight: 700, fontFamily: 'Poppins', 
              fontSize: '0.88rem', letterSpacing: '-0.01em', marginBottom: 2,
              textShadow: '0 2px 4px rgba(0,0,0,0.2)'
            }}>
              {n.title}
            </div>
            {n.description && (
              <div style={{ 
                color: 'rgba(224, 242, 254, 0.8)', fontSize: '0.74rem', 
                fontFamily: 'Inter', lineHeight: 1.5 
              }}>
                {n.description}
              </div>
            )}
          </div>

          <button onClick={() => startClosing(n.id)} style={{
            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', 
            color: 'rgba(255,255,255,0.4)', borderRadius: '50%',
            cursor: 'pointer', width: 22, height: 22, display: 'grid', placeItems: 'center',
            marginLeft: 4, transition: 'all 0.2s'
          }}
          onMouseEnter={e => { e.currentTarget.style.background='rgba(255,255,255,0.1)'; e.currentTarget.style.color='#fff' }}
          onMouseLeave={e => { e.currentTarget.style.background='rgba(255,255,255,0.03)'; e.currentTarget.style.color='rgba(255,255,255,0.4)' }}
          >
            <X size={12} />
          </button>
        </div>
      ))}
      <style>{`
        @keyframes toastEnter {
          from { opacity: 0; transform: translateX(80px) scale(0.8) rotate(2deg); }
          to   { opacity: 1; transform: translateX(0) scale(1) rotate(0deg); }
        }
        @keyframes toastExit {
          from { opacity: 1; transform: translateX(0) scale(1); }
          to   { opacity: 0; transform: translateX(40px) scale(0.9) blur(4px); }
        }
        @keyframes shimmerSweep {
          0% { left: -100%; }
          30% { left: 100%; }
          100% { left: 100%; }
        }
      `}</style>
    </div>
  )
}
