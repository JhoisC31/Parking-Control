import { useLocation, useNavigate } from 'react-router-dom'

const NAV = [
  {
    section: 'OPERACIONES',
    items: [
      { path: '/',        label: 'Dashboard',         icon: GridIcon   },
      { path: '/entry',   label: 'Registrar Entrada', icon: EntryIcon  },
      { path: '/active',  label: 'Tickets Activos',   icon: ActiveIcon },
    ]
  },
  {
    section: 'HISTORIAL',
    items: [
      { path: '/history', label: 'Historial',         icon: HistoryIcon },
    ]
  }
]

export default function Sidebar() {
  const location = useLocation()
  const navigate = useNavigate()

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-text">Parking Control</div>
        <div className="logo-sub">Sistema de Gestión De Tickets</div>
      </div>

      <nav className="sidebar-nav">
        {NAV.map(section => (
          <div key={section.section}>
            <div className="nav-section-label">{section.section}</div>
            {section.items.map(item => {
              const Icon     = item.icon
              const isActive = location.pathname === item.path
              return (
                <button
                  key={item.path}
                  className={`nav-item ${isActive ? 'active' : ''}`}
                  onClick={() => navigate(item.path)}
                >
                  <Icon className="nav-icon" />
                  {item.label}
                </button>
              )
            })}
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="status-dot">
          <div className="dot" />
          SISTEMA ACTIVO
        </div>
      </div>
    </aside>
  )
}

function GridIcon({ className }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
}
function EntryIcon({ className }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
}
function ActiveIcon({ className }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="12" y2="17"/></svg>
}
function HistoryIcon({ className }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 8v4l3 3"/><path d="M3.05 11a9 9 0 1 0 .5-4.5"/><path d="M3 3v4h4"/></svg>
}
