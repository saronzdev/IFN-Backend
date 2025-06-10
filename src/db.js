import { createClient } from '@libsql/client'
import { TURSO_URL, TURSO_TOKEN } from './config.js'

export const turso = createClient({
  url: TURSO_URL,
  authToken: TURSO_TOKEN
})

export const initDatabase = async () => {
  return await turso.execute(`
    CREATE TABLE IF NOT EXISTS posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      date DATETIME NOT NULL,
      tags TEXT NOT NULL,
      author TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      body TEXT NOT NULL
    )
  `, [])
}