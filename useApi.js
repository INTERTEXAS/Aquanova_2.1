import { useState, useCallback, useRef, useEffect } from 'react'

const BASE = '/api'

export async function apiFetch(method, path, body = null, signal = null) {
  const token = localStorage.getItem('aquanova_token')
  const opts = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(signal ? { signal } : {}),
  }
  if (body) opts.body = JSON.stringify(body)
  const r = await fetch(BASE + path, opts)
  if (r.status === 401) {
    localStorage.removeItem('aquanova_token')
    localStorage.removeItem('aquanova_user')
    // Notificar a App sin forzar un reload completo
    window.dispatchEvent(new CustomEvent('aquanova:unauthorized'))
    return { ok: false, mensaje: '[SESIÓN] Sesión expirada' }
  }
  return r.json()
}

export function useApi() {
  const [loading, setLoading] = useState(false)
  const controllerRef = useRef(null)

  // Cancelar request en vuelo si el componente se desmonta
  useEffect(() => {
    return () => controllerRef.current?.abort()
  }, [])

  const call = useCallback(async (method, path, body = null) => {
    controllerRef.current?.abort()
    const controller = new AbortController()
    controllerRef.current = controller
    setLoading(true)
    try {
      return await apiFetch(method, path, body, controller.signal)
    } catch (e) {
      if (e.name === 'AbortError') return { ok: false, mensaje: 'Cancelado' }
      return { ok: false, mensaje: 'Error de conexión', error: e.message }
    } finally {
      setLoading(false)
    }
  }, [])

  return { call, loading }
}
