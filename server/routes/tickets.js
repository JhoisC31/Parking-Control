const express = require('express')
const router  = express.Router()
const db      = require('../db')

const RATES = { automovil: 50, motocicleta: 30, camioneta: 70 }
const MAX_SPACES = 10 // Total parking capacity

function fmt(row) {
  if (!row) return null
  return {
    id:          row.id,
    plate:       row.plate,
    vehicleType: row.vehicle_type,
    vehicleDesc: row.vehicle_desc || '',
    spaceNumber: row.space_number,
    entryTime:   row.entry_time,
    exitTime:    row.exit_time || null,
    status:      row.status,
    totalCost:   row.total_cost !== null && row.total_cost !== undefined ? row.total_cost : null,
    createdAt:   row.created_at,
  }
}

// GET /api/tickets
router.get('/', async (req, res) => {
  try {
    const rows = await db.query('SELECT * FROM tickets ORDER BY id DESC')
    res.json(rows.map(fmt))
  } catch (err) { res.status(500).json({ message: err.message }) }
})

// GET /api/tickets/active
router.get('/active', async (req, res) => {
  try {
    const rows = await db.query("SELECT * FROM tickets WHERE status = 'active' ORDER BY entry_time ASC")
    res.json(rows.map(fmt))
  } catch (err) { res.status(500).json({ message: err.message }) }
})

// GET /api/tickets/availability  — how many spaces are free
router.get('/availability', async (req, res) => {
  try {
    const { cnt } = await db.queryOne("SELECT COUNT(*) as cnt FROM tickets WHERE status = 'active'")
    res.json({ total: MAX_SPACES, occupied: cnt, available: MAX_SPACES - cnt })
  } catch (err) { res.status(500).json({ message: err.message }) }
})

// GET /api/tickets/:id
router.get('/:id', async (req, res) => {
  try {
    const row = await db.queryOne('SELECT * FROM tickets WHERE id = ?', [req.params.id])
    if (!row) return res.status(404).json({ message: 'Ticket no encontrado.' })
    res.json(fmt(row))
  } catch (err) { res.status(500).json({ message: err.message }) }
})

// POST /api/tickets/entry
router.post('/entry', async (req, res) => {
  try {
    const { plate, vehicleType = 'automovil', vehicleDesc } = req.body

    if (!plate || !plate.trim())
      return res.status(400).json({ message: 'La placa del vehículo es requerida.' })

    const plateClean = plate.trim().toUpperCase()
    if (!/^[A-Z0-9\-]{4,10}$/.test(plateClean))
      return res.status(400).json({ message: 'Formato de placa inválido. Ej: A123-BC.' })

    if (!['automovil', 'motocicleta', 'camioneta'].includes(vehicleType))
      return res.status(400).json({ message: 'Tipo de vehículo inválido.' })

    // Regla 1: vehículo no puede tener más de un ticket activo
    const active = await db.queryOne(
      "SELECT id FROM tickets WHERE plate = ? AND status = 'active'", [plateClean]
    )
    if (active)
      return res.status(409).json({
        message: `El vehículo ${plateClean} ya tiene un ticket activo (#${String(active.id).padStart(6,'0')}). Registra la salida primero.`
      })

    // Regla 2: verificar capacidad
    const { cnt } = await db.queryOne("SELECT COUNT(*) as cnt FROM tickets WHERE status = 'active'")
    if (cnt >= MAX_SPACES)
      return res.status(409).json({ message: 'El estacionamiento está lleno. No hay espacios disponibles.' })

    // Asignar el número de espacio más bajo disponible
    const activeSpots = await db.query("SELECT space_number FROM tickets WHERE status = 'active'")
    const takenSpots  = new Set(activeSpots.map(r => r.space_number))
    let spaceNumber = 1
    while (takenSpots.has(spaceNumber)) spaceNumber++

    const entryTime = new Date().toISOString()
    const { lastID } = await db.run2(
      'INSERT INTO tickets (plate, vehicle_type, vehicle_desc, space_number, entry_time) VALUES (?, ?, ?, ?, ?)',
      [plateClean, vehicleType, vehicleDesc || null, spaceNumber, entryTime]
    )

    const ticket = await db.queryOne('SELECT * FROM tickets WHERE id = ?', [lastID])
    res.status(201).json(fmt(ticket))
  } catch (err) { res.status(500).json({ message: err.message }) }
})

// PUT /api/tickets/:id/exit
router.put('/:id/exit', async (req, res) => {
  try {
    const ticket = await db.queryOne('SELECT * FROM tickets WHERE id = ?', [req.params.id])
    if (!ticket) return res.status(404).json({ message: 'Ticket no encontrado.' })
    if (ticket.status === 'closed') return res.status(409).json({ message: 'Este ticket ya fue cerrado.' })

    const exitTime  = new Date().toISOString()
    const diffHours = (new Date(exitTime) - new Date(ticket.entry_time)) / (1000 * 60 * 60)
    const hours     = Math.max(1, Math.ceil(diffHours))
    const rate      = RATES[ticket.vehicle_type] || RATES.automovil
    const totalCost = hours * rate

    await db.run2(
      "UPDATE tickets SET exit_time = ?, status = 'closed', total_cost = ? WHERE id = ?",
      [exitTime, totalCost, ticket.id]
    )

    const updated = await db.queryOne('SELECT * FROM tickets WHERE id = ?', [ticket.id])
    res.json(fmt(updated))
  } catch (err) { res.status(500).json({ message: err.message }) }
})

module.exports = router
