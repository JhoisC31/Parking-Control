const sqlite3 = require('sqlite3').verbose()
const path    = require('path')

const DB_PATH = path.join(__dirname, 'parking.db')

const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) { console.error('Error abriendo base de datos:', err.message); process.exit(1) }
  console.log('  Base de datos conectada:', DB_PATH)
})

db.serialize(() => {
  db.run('PRAGMA journal_mode = WAL')

  db.run(`
    CREATE TABLE IF NOT EXISTS tickets (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      plate        TEXT    NOT NULL COLLATE NOCASE,
      vehicle_type TEXT    NOT NULL DEFAULT 'automovil',
      vehicle_desc TEXT,
      space_number INTEGER NOT NULL,
      entry_time   TEXT    NOT NULL,
      exit_time    TEXT,
      status       TEXT    NOT NULL DEFAULT 'active',
      total_cost   REAL,
      created_at   TEXT    NOT NULL DEFAULT (datetime('now'))
    )
  `)
})

// Promise wrappers
db.query    = (sql, params = []) => new Promise((res, rej) => db.all(sql, params, (e, rows) => e ? rej(e) : res(rows)))
db.queryOne = (sql, params = []) => new Promise((res, rej) => db.get(sql, params, (e, row) => e ? rej(e) : res(row || null)))
db.run2     = (sql, params = []) => new Promise((res, rej) => db.run(sql, params, function(e) { e ? rej(e) : res({ lastID: this.lastID }) }))

module.exports = db
