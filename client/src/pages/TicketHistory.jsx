import { useEffect, useState } from 'react'
import { useApp } from '../context/AppContext'

export default function TicketHistory() {
  const { tickets, fetchTickets } = useApp()
  const [search, setSearch]         = useState('')
  const [filterStatus, setFilter]   = useState('all')
  const [detail, setDetail]         = useState(null)

  useEffect(() => { fetchTickets() }, [])

  const filtered = tickets.filter(t => {
    const matchSearch = !search || t.plate?.toLowerCase().includes(search.toLowerCase()) || String(t.id).includes(search)
    const matchStatus = filterStatus === 'all' || t.status === filterStatus
    return matchSearch && matchStatus
  })

  const totalRevenue = tickets.filter(t => t.status === 'closed').reduce((a, t) => a + (t.totalCost || 0), 0)

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div>
          <h1 className="page-title">Historial</h1>
          <p className="page-subtitle">{tickets.length} tickets registrados en total</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-muted)', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 2 }}>Ingresos Totales</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 800, color: 'var(--accent)' }}>${totalRevenue.toFixed(2)}</div>
        </div>
      </div>

      <div className="filters-row">
        <div className="search-input-wrap" style={{ maxWidth: 320 }}>
          <SearchIcon className="search-icon" />
          <input className="form-input" value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por placa o ticket #..." />
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {[{ val: 'all', label: 'Todos' }, { val: 'active', label: 'Activos' }, { val: 'closed', label: 'Cerrados' }].map(f => (
            <button key={f.val} className={`btn btn-sm ${filterStatus === f.val ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFilter(f.val)}>{f.label}</button>
          ))}
        </div>
        <span style={{ marginLeft: 'auto', fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--text-muted)' }}>{filtered.length} resultado(s)</span>
      </div>

      {filtered.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <HistoryIcon className="empty-icon" />
            <p className="empty-title">{search || filterStatus !== 'all' ? 'Sin resultados' : 'Historial vacío'}</p>
            <p className="empty-desc">{search || filterStatus !== 'all' ? 'Intenta con otros filtros.' : 'Aún no hay tickets registrados.'}</p>
          </div>
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Ticket #</th><th>Placa</th><th>Tipo</th><th>Espacio</th><th>Entrada</th><th>Salida</th><th>Duración</th><th>Total</th><th>Estado</th><th></th></tr>
            </thead>
            <tbody>
              {filtered.map(t => (
                <tr key={t.id}>
                  <td><span className="mono" style={{ color: 'var(--text-muted)' }}>#{String(t.id).padStart(6,'0')}</span></td>
                  <td><span className="mono" style={{ color: 'var(--accent)', fontWeight: 600 }}>{t.plate}</span></td>
                  <td><span style={{ fontSize: '0.78rem', textTransform: 'capitalize', color: 'var(--text-secondary)' }}>{t.vehicleType}</span></td>
                  <td><span className="badge badge-blue">#{t.spaceNumber}</span></td>
                  <td><span className="mono">{fmtDt(t.entryTime)}</span></td>
                  <td><span className="mono" style={{ color: 'var(--text-muted)' }}>{t.exitTime ? fmtDt(t.exitTime) : '—'}</span></td>
                  <td><span className="mono">{t.exitTime ? duration(t.entryTime, t.exitTime) : <span style={{ color: 'var(--accent)' }}>{elapsed(t.entryTime)}</span>}</span></td>
                  <td><span className="mono">{t.totalCost ? `$${t.totalCost.toFixed(2)}` : '—'}</span></td>
                  <td>
                    {t.status === 'active'
                      ? <span className="badge badge-green"><span className="badge-dot" />Activo</span>
                      : <span className="badge badge-gray"><span className="badge-dot" />Cerrado</span>}
                  </td>
                  <td><button className="btn btn-secondary btn-sm" onClick={() => setDetail(t)}><EyeIcon /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {detail && (
        <div className="modal-overlay" onClick={() => setDetail(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">Ticket #{String(detail.id).padStart(6,'0')}</span>
              <button className="modal-close" onClick={() => setDetail(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="ticket-receipt">
                <div className="ticket-receipt-title">Parking — COMPROBANTE</div>
                <div className="receipt-row"><span className="key">TICKET #</span><span className="val">{String(detail.id).padStart(6,'0')}</span></div>
                <div className="receipt-row"><span className="key">PLACA</span><span className="val" style={{ color: 'var(--accent)', fontSize: '1rem' }}>{detail.plate}</span></div>
                <div className="receipt-row"><span className="key">TIPO</span><span className="val" style={{ textTransform: 'capitalize' }}>{detail.vehicleType}</span></div>
                {detail.vehicleDesc && <div className="receipt-row"><span className="key">DESCRIPCIÓN</span><span className="val">{detail.vehicleDesc}</span></div>}
                <div className="receipt-row"><span className="key">ESPACIO</span><span className="val">#{detail.spaceNumber}</span></div>
                <div className="receipt-row"><span className="key">ENTRADA</span><span className="val">{fmtDt(detail.entryTime)}</span></div>
                <div className="receipt-row"><span className="key">SALIDA</span><span className="val">{detail.exitTime ? fmtDt(detail.exitTime) : <span className="badge badge-green" style={{ fontSize: '0.6rem' }}>EN CURSO</span>}</span></div>
                <div className="receipt-row"><span className="key">DURACIÓN</span><span className="val">{detail.exitTime ? duration(detail.entryTime, detail.exitTime) : elapsed(detail.entryTime)}</span></div>
                <div className="receipt-row total"><span className="key">TOTAL</span><span className="val">{detail.totalCost ? `$${detail.totalCost.toFixed(2)}` : '—'}</span></div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setDetail(null)}>Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const fmtDt    = iso => iso ? new Date(iso).toLocaleString('es-DO', { day:'2-digit', month:'2-digit', year:'2-digit', hour:'2-digit', minute:'2-digit' }) : '—'
const duration = (a, b) => { const m=Math.floor((new Date(b)-new Date(a))/60000); const h=Math.floor(m/60); return h>0?`${h}h ${m%60}m`:`${m}m` }
const elapsed  = iso => { const d=Math.floor((Date.now()-new Date(iso))/60000); return d<60?`${d}m`:`${Math.floor(d/60)}h ${d%60}m` }

function SearchIcon({ className }) { return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg> }
function HistoryIcon({ className }) { return <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 8v4l3 3"/><path d="M3.05 11a9 9 0 1 0 .5-4.5"/><path d="M3 3v4h4"/></svg> }
function EyeIcon() { return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg> }
