export const roleMiddleware = (role) => (req, res, next) => {
  if (!req.usuario) {
    return res.status(401).json({ ok: false, mensaje: '[AUTH] No autenticado' })
  }
  
  if (req.usuario.rol !== role) {
    return res.status(403).json({ ok: false, mensaje: `[FORBIDDEN] Se requiere rol: ${role}` })
  }
  
  next()
}
