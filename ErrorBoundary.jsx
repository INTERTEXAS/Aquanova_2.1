import { Component } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary]', error, info.componentStack)
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{
          minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'var(--bg-base)', padding: 24,
        }}>
          <div style={{
            maxWidth: 480, width: '100%', textAlign: 'center',
            background: 'var(--bg-surface)', border: '1px solid var(--danger-brd)',
            borderTop: '2px solid var(--danger)', borderRadius: '0 0 12px 12px',
            padding: '36px 28px', boxShadow: 'var(--shadow-lg)',
            animation: 'fadeUp .4s ease',
          }}>
            <div style={{ width: 44, height: 44, borderRadius: 10, background: 'var(--danger-dim)', border: '1px solid var(--danger-brd)', display: 'grid', placeItems: 'center', margin: '0 auto 16px' }}>
              <AlertTriangle size={20} color="var(--danger)" strokeWidth={2} />
            </div>
            <div style={{ fontFamily: "'Inter', sans-serif", fontWeight: 800, fontSize: '1.1rem', color: 'var(--txt-primary)', marginBottom: 8 }}>
              Algo salió mal
            </div>
            <div style={{ fontSize: '0.74rem', color: 'var(--txt-secondary)', marginBottom: 6, fontFamily: "'Inter', sans-serif", lineHeight: 1.5 }}>
              {this.state.error.message}
            </div>
            <div style={{ fontSize: '0.6rem', color: 'var(--txt-muted)', fontFamily: "'JetBrains Mono', monospace", letterSpacing: '.06em', marginBottom: 24 }}>
              Revisa la consola para más detalles
            </div>
            <button
              onClick={() => this.setState({ error: null })}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '8px 20px', borderRadius: 6,
                border: '1px solid var(--agua-brd)',
                background: 'var(--agua-dim)', color: 'var(--agua)',
                cursor: 'pointer', fontFamily: "'JetBrains Mono', monospace",
                fontSize: '0.7rem', letterSpacing: '.06em',
                marginRight: 8,
              }}
            >
              <RefreshCw size={12} strokeWidth={2} /> Reintentar
            </button>
            <button
              onClick={() => window.location.reload()}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '8px 20px', borderRadius: 6,
                border: '1px solid var(--brd)',
                background: 'transparent', color: 'var(--txt-secondary)',
                cursor: 'pointer', fontFamily: "'JetBrains Mono', monospace",
                fontSize: '0.7rem', letterSpacing: '.06em',
              }}
            >
              Recargar página
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
