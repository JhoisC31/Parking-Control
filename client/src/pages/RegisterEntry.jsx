import { useEffect, useState } from 'react'
import { useApp } from '../context/AppContext'

const VEHICLE_TYPES = [
  { value: 'automovil',        label: 'Automóvil',       rate: 50 },
  { value: 'motocicleta', label: 'Motocicleta',      rate: 30 },
  { value: 'camioneta',      label: 'Camioneta / SUV',  rate: 60 },
]

export default function RegisterEntry() {
  const { availability, fetchAvailability, registerEntry } = useApp()
  const [form, setForm]       = useState({ plate: '', vehicleType: 'automovil', vehicleDesc: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)
  const [success, setSuccess] = useState(null)

  useEffect(() => { fetchAvailability() }, [])

  const handleChange = e => { setForm(p => ({ ...p, [e.target.name]: e.target.value })); setError(null) }

  const handleSubmit = async e => {
    e.preventDefault()
    setError(null); setSuccess(null)
    if (!form.plate.trim()) return setError('La placa del vehículo es requerida.')
    if (!/^[A-Z0-9\-]{4,10}$/i.test(form.plate.trim())) return setError('Formato de placa inválido. Ej: A-12345.')
    if (availability.available <= 0) return setError('No hay espacios disponibles en este momento.')
    try {
      setLoading(true)
      const ticket = await registerEntry({
        plate:       form.plate.trim().toUpperCase(),
        vehicleType: form.vehicleType,
        vehicleDesc: form.vehicleDesc.trim(),
      })
      setSuccess(ticket)
      setForm({ plate: '', vehicleType: 'automovil', vehicleDesc: '' })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const selectedRate = VEHICLE_TYPES.find(t => t.value === form.vehicleType)?.rate || 50

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div>
          <h1 className="page-title">Registrar Entrada</h1>
          <p className="page-subtitle">El espacio se asigna automáticamente</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 24, alignItems: 'start' }}>

        <div className="card">
          <div className="card-header">
            <span className="card-title">Datos del Vehículo</span>
            <span className={`badge ${availability.available > 0 ? 'badge-green' : 'badge-red'}`}>
              <span className="badge-dot" />
              {availability.available} espacios libres
            </span>
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="form-grid form-grid-2" style={{ marginBottom: 16 }}>
                <div className="form-group">
                  <label className="form-label">Placa del Vehículo *</label>
                  <input
                    className="form-input"
                    name="plate"
                    value={form.plate}
                    onChange={handleChange}
                    placeholder="A-12345"
                    style={{ fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '1rem' }}
                    maxLength={10}
                    autoFocus
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Tipo de Vehículo *</label>
                  <select className="form-select" name="vehicleType" value={form.vehicleType} onChange={handleChange}>
                    {VEHICLE_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 24 }}>
                <label className="form-label">Descripción (opcional)</label>
                <input className="form-input" name="vehicleDesc" value={form.vehicleDesc} onChange={handleChange} placeholder="Descripcion del Vehiculo" />
              </div>

              {availability.available <= 0 && (
                <div className="alert alert-error" style={{ marginBottom: 16 }}>
                  <WarnIcon /> El estacionamiento está lleno. No hay espacios disponibles.
                </div>
              )}

              {error && (
                <div className="alert alert-error" style={{ marginBottom: 16 }}>
                  <WarnIcon /> {error}
                </div>
              )}

              <div style={{ display: 'flex', gap: 10 }}>
                <button type="submit" className="btn btn-primary btn-lg" disabled={loading || availability.available <= 0} style={{ flex: 1 }}>
                  {loading ? 'Registrando...' : 'Registrar Entrada'}
                </button>
                <button type="button" className="btn btn-secondary btn-lg" onClick={() => { setForm({ plate: '', vehicleType: 'automovil', vehicleDesc: '' }); setError(null); setSuccess(null) }}>
                  Limpiar
                </button>
              </div>
            </form>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {success && (
            <div className="card" style={{ border: '1px solid rgba(34,197,94,0.3)' }}>
              <div className="card-header" style={{ borderColor: 'rgba(34,197,94,0.15)' }}>
                <span className="card-title" style={{ color: 'var(--green)' }}>✓ Ticket Generado</span>
                <button className="btn btn-secondary btn-sm" onClick={() => setSuccess(null)}>Cerrar</button>
              </div>
              <div className="card-body">
                <div className="ticket-receipt">
                  <div className="ticket-receipt-title">PARKCTL — TICKET DE ENTRADA</div>
                  <div className="receipt-row"><span className="key">TICKET #</span><span className="val">{String(success.id).padStart(6,'0')}</span></div>
                  <div className="receipt-row"><span className="key">PLACA</span><span className="val" style={{ color: 'var(--accent)' }}>{success.plate}</span></div>
                  <div className="receipt-row"><span className="key">ESPACIO</span><span className="val">#{success.spaceNumber}</span></div>
                  <div className="receipt-row"><span className="key">TIPO</span><span className="val" style={{ textTransform: 'capitalize' }}>{success.vehicleType}</span></div>
                  <div className="receipt-row"><span className="key">ENTRADA</span><span className="val">{new Date(success.entryTime).toLocaleString('es-DO')}</span></div>
                  <div className="receipt-row" style={{ borderTop: '1px dashed var(--border-base)', marginTop: 8, paddingTop: 8 }}>
                    <span className="key">ESTADO</span>
                    <span className="badge badge-green"><span className="badge-dot" />ACTIVO</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="card">
            <div className="card-header"><span className="card-title">Tarifas</span></div>
            <div className="card-body">
              {VEHICLE_TYPES.map(t => (
                <div key={t.value} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 10px', background: t.value === form.vehicleType ? 'var(--accent-subtle)' : 'var(--bg-elevated)', borderRadius: 5, marginBottom: 6, border: t.value === form.vehicleType ? '1px solid var(--accent-dim)' : '1px solid transparent' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{t.label}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--accent)' }}>RD${t.rate}.00 / hora</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="card-header"><span className="card-title">Disponibilidad</span></div>
            <div className="card-body" style={{ display: 'flex', gap: 10 }}>
              <div style={{ flex: 1, textAlign: 'center', padding: 12, background: 'var(--green-dim)', borderRadius: 6, border: '1px solid rgba(34,197,94,0.2)' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 800, color: 'var(--green)' }}>{availability.available}</div>
                <div style={{ fontSize: '0.68rem', color: 'var(--green)', opacity: 0.7 }}>LIBRES</div>
              </div>
              <div style={{ flex: 1, textAlign: 'center', padding: 12, background: 'var(--red-dim)', borderRadius: 6, border: '1px solid rgba(239,68,68,0.2)' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 800, color: 'var(--red)' }}>{availability.occupied}</div>
                <div style={{ fontSize: '0.68rem', color: 'var(--red)', opacity: 0.7 }}>OCUPADOS</div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

function WarnIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0 }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
}
