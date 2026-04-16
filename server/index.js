const express = require('express')
const cors    = require('cors')
const tickets = require('./routes/tickets')

const app  = express()
const PORT = process.env.PORT || 3001

app.use(cors({ origin: 'http://localhost:5173' }))
app.use(express.json())

app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.path}`)
  next()
})

app.use('/api/tickets', tickets)

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.use((req, res) => res.status(404).json({ message: `Ruta no encontrada: ${req.method} ${req.path}` }))

app.use((err, req, res, next) => {
  console.error('[ERROR]', err.message)
  res.status(500).json({ message: err.message || 'Error interno del servidor.' })
})

app.listen(PORT, () => {
  console.log(`\n  Parking Control  Server corriendo`)
  console.log(`  http://localhost:${PORT}/api/health\n`)
})
