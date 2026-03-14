# Parking — Sistema de Gestión de Estacionamiento

Sistema web para gestión de tickets, espacios y vehículos en un estacionamiento.

## Tecnologías

| Capa       | Tecnología                  |
|------------|-----------------------------|
| Frontend   | React 18 + Vite + CSS puro  |
| Backend    | Node.js + Express           |
| Base datos | SQLite (better-sqlite3)     |

## Estructura del Proyecto

```
parking-system/
├── client/                  # Frontend React + Vite
│   ├── src/
│   │   ├── context/         # AppContext (estado global)
│   │   ├── components/      # Sidebar, Topbar
│   │   ├── pages/           # Dashboard, RegisterEntry, ActiveTickets, TicketHistory, Spaces
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css        # Design system completo
│   └── vite.config.js       # Proxy → :3001
├── server/                  # Backend Express (pendiente)
│   └── package.json
└── package.json             # Monorepo scripts
```

## Instalación y arranque

### 1. Instalar dependencias

```bash
# Instalar todo
npm run install:all

# O individualmente
cd client && npm install
cd ../server && npm install
```

### 2. Arrancar solo el frontend

```bash
cd client
npm run dev
# → http://localhost:5173
```

### 3. Arrancar ambos (cuando el backend esté listo)

```bash
npm run dev
```

## Módulos del sistema

### Frontend (✅ Completado)

- **Dashboard** — Métricas generales, vista de espacios y tickets activos recientes
- **Registrar Entrada** — Formulario con validación de placa, tipo de vehículo y asignación de espacio
- **Tickets Activos** — Lista en tiempo real con registro de salida y cálculo de costo
- **Historial** — Todos los tickets con filtros y modal de detalle
- **Espacios** — CRUD completo, vista grid y tabla, control de estados

### Backend (🔜 Próximo paso)

Endpoints previstos:

```
GET    /api/spaces          → listar espacios
POST   /api/spaces          → crear espacio
PUT    /api/spaces/:id      → actualizar espacio
DELETE /api/spaces/:id      → eliminar espacio

GET    /api/tickets         → listar todos los tickets
POST   /api/tickets/entry   → registrar entrada
PUT    /api/tickets/:id/exit → registrar salida
```

## Reglas de negocio

- Un vehículo no puede tener más de un ticket activo simultáneamente
- Un espacio ocupado no puede asignarse a otro vehículo
- Un espacio ocupado no puede eliminarse ni editarse
- El costo se calcula por horas completas (mínimo 1 hora)
- Tarifas: Automóvil RD$50/h · Motocicleta RD$30/h · Camioneta RD$60/h

## API — Contrato de respuesta esperado

```json
// Espacio
{ "id": 1, "code": "A-01", "type": "standard", "floor": "1", "status": "available", "notes": "" }

// Ticket
{
  "id": 1,
  "plate": "A123BC",
  "vehicleType": "car",
  "vehicleDesc": "Toyota Corolla",
  "spaceId": 3,
  "spaceCode": "A-03",
  "entryTime": "2025-03-13T10:00:00.000Z",
  "exitTime": null,
  "status": "active",
  "totalCost": null
}
```
