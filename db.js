import pkg from 'pg'
const { Pool } = pkg

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
})

// Verificar conexión inicial
pool.connect((err, client, release) => {
  if (err) {
    console.error('[ERROR] Fallo al conectar a PostgreSQL:', err.message)
  } else {
    console.log('[OK] Conexión establecida con la base de datos')
    release()
  }
})

export default pool
