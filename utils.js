export const ok  = (res, data, msg = 'Operación exitosa') => res.json({ ok: true, mensaje: msg, datos: data })
export const err = (res, msg = 'Error', e = '')           => res.status(500).json({ ok: false, mensaje: msg, error: e })

const num    = (v, allowNull = true) => { 
  if (v===''||v===null||v===undefined) return allowNull?null:0; 
  const n=parseFloat(v); 
  return isNaN(n)?null:n 
}

export const numPos = (v) => { 
  const n=num(v,false); 
  return (n!==null&&n>=0)?n:0 
}
