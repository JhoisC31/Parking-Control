import { useState, useEffect } from 'react'

const PAGE_TITLES = {
  '/':        ['PANEL',      'Dashboard general del sistema'],
  '/entry':   ['ENTRADA',    'Registro de ingreso de vehículos'],
  '/active':  ['ACTIVOS',    'Vehículos actualmente estacionados'],
  '/history': ['HISTORIAL',  'Registro completo de tickets'],
  '/spaces':  ['ESPACIOS',   'Administración de espacios de estacionamiento'],
}

export default function Topbar({ pathname }) {
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const [title, sub] = PAGE_TITLES[pathname] || ['MÓDULO', '']

  const fmt = (n) => String(n).padStart(2, '0')
  const timeStr = `${fmt(time.getHours())}:${fmt(time.getMinutes())}:${fmt(time.getSeconds())}`
  const dateStr = time.toLocaleDateString('es-DO', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()

  return (
    <header className="topbar">
      <div>
        <div className="topbar-title">
          Parking Control / <span>{title}</span>
        </div>
        {sub && <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: 2, fontFamily: 'var(--font-mono)', letterSpacing: '0.05em' }}>{sub}</div>}
      </div>

      <div className="topbar-right">
        <div className="time-display">{dateStr} &nbsp;|&nbsp; {timeStr}</div>
      </div>
    </header>
  )
}
