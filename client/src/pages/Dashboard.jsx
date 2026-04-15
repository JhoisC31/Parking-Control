import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'

export default function Dashboard() {
  const { tickets, activeTickets, availability, fetchTickets, fetchAvailability } = useApp()
  const navigate = useNavigate()

  useEffect(() => { fetchTickets(); fetchAvailability() }, [])

  const closedToday = tickets.filter(t => {
    if (t.status !== 'closed' || !t.exitTime) return false
    return new Date(t.exitTime).toDateString() === new Date().toDateString()
  })

  const totalRevenue = closedToday.reduce((a, t) => a + (t.totalCost || 0), 0)
  const recentActive = activeTickets.slice(0, 5)

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Resumen operativo del estacionamiento</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/entry')}>
          <PlusIcon /> Registrar Entrada
        </button>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card green">
          <div className="stat-label">Espacios Disponibles</div>
          <div className="stat-value">{availability.available}</div>
          <div className="stat-detail">de {availability.total} espacios totales</div>
        </div>
        <div className="stat-card blue">
          <div className="stat-label">Vehículos Activos</div>
          <div className="stat-value">{activeTickets.length}</div>
          <div className="stat-detail">actualmente estacionados</div>
        </div>
        <div className="stat-card yellow">
          <div className="stat-label">Salidas Hoy</div>
          <div className="stat-value">{closedToday.length}</div>
          <div className="stat-detail">tickets cerrados hoy</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Ingresos Hoy</div>
          <div className="stat-value">RD${totalRevenue.toFixed(2)}</div>
          <div className="stat-detail">recaudado en el día</div>
        </div>
      </div>

      {/* Occupancy bar + recent tickets */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

        <div className="card">
          <div className="card-header">
            <span className="card-title">Tickets Activos Recientes</span>
            <button className="btn btn-secondary btn-sm" onClick={() => navigate('/active')}>Ver todos</button>
          </div>
          {recentActive.length === 0 ? (
            <div className="empty-state" style={{ padding: '40px 20px' }}>
              <CarIcon className="empty-icon" />
              <p className="empty-title">Sin vehículos</p>
              <p className="empty-desc">No hay vehículos estacionados actualmente</p>
            </div>
          ) : (
            <div className="table-wrap" style={{ border: 'none', borderRadius: 0 }}>
              <table>
                <thead>
                  <tr><th>Placa</th><th>Espacio</th><th>Entrada</th><th>Tiempo</th></tr>
                </thead>
                <tbody>
                  {recentActive.map(t => (
                    <tr key={t.id}>
                      <td><span className="mono" style={{ color: 'var(--accent)' }}>{t.plate}</span></td>
                      <td><span className="badge badge-blue">#{t.spaceNumber}</span></td>
                      <td><span className="mono">{fmtTime(t.entryTime)}</span></td>
                      <td><span className="mono text-accent">{elapsed(t.entryTime)}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title">Ocupación del Estacionamiento</span>
          </div>
          <div className="card-body">
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-muted)' }}>OCUPACIÓN</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-primary)' }}>
                  {availability.occupied}/{availability.total}
                </span>
              </div>
              <div style={{ height: 8, background: 'var(--bg-elevated)', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: `${(availability.occupied / availability.total) * 100}%`,
                  background: availability.occupied / availability.total > 0.8 ? 'var(--red)' : 'var(--accent)',
                  borderRadius: 4,
                  transition: 'width 0.5s ease',
                }} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              {[
                { label: 'Disponibles', val: availability.available, color: 'var(--green)' },
                { label: 'Ocupados',    val: availability.occupied,  color: 'var(--red)'   },
              ].map(s => (
                <div key={s.label} style={{ flex: 1, padding: '14px', background: 'var(--bg-elevated)', borderRadius: 6, textAlign: 'center' }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 800, color: s.color }}>{s.val}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>{s.label}</div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 16, padding: '10px 14px', background: 'var(--bg-elevated)', borderRadius: 6 }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-muted)', letterSpacing: '0.1em', marginBottom: 4 }}>CAPACIDAD TOTAL</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>{availability.total} espacios</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

function fmtTime(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleTimeString('es-DO', { hour: '2-digit', minute: '2-digit' })
}

function elapsed(iso) {
  const diff = Math.floor((Date.now() - new Date(iso)) / 60000)
  if (diff < 60) return `${diff}m`
  return `${Math.floor(diff/60)}h ${diff%60}m`
}

function PlusIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
}
function CarIcon({ className }) {
  return <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M5 17H3a2 2 0 01-2-2V9a2 2 0 012-2h16a2 2 0 012 2v6a2 2 0 01-2 2h-2"/><rect x="5" y="13" width="14" height="8" rx="1"/><path d="M5 9l2-4h10l2 4"/><circle cx="7.5" cy="17.5" r="1.5"/><circle cx="16.5" cy="17.5" r="1.5"/></svg>
}
