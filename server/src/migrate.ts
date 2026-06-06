import fs from 'fs'
import path from 'path'
import { Pool } from 'pg'
import dotenv from 'dotenv'

dotenv.config({ path: path.join(__dirname, '..', '.env') })

async function migrate(): Promise<void> {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL })
  const migrationDir = path.join(__dirname, 'migrations')

  const files = fs.readdirSync(migrationDir)
    .filter(f => f.endsWith('.sql'))
    .sort()

  const client = await pool.connect()

  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS _migrations (
        id SERIAL PRIMARY KEY,
        filename VARCHAR(255) NOT NULL UNIQUE,
        executed_at TIMESTAMPTZ DEFAULT NOW()
      )
    `)

    for (const file of files) {
      const { rows } = await client.query('SELECT id FROM _migrations WHERE filename = $1', [file])

      if (rows.length > 0) {
        console.log(`[SKIP] ${file} — already executed`)
        continue
      }

      const sql = fs.readFileSync(path.join(migrationDir, file), 'utf-8')
      console.log(`[RUN]  ${file}`)

      await client.query('BEGIN')
      try {
        await client.query(sql)
        await client.query('INSERT INTO _migrations (filename) VALUES ($1)', [file])
        await client.query('COMMIT')
        console.log(`[DONE] ${file}`)
      } catch (err) {
        await client.query('ROLLBACK')
        const message = err instanceof Error ? err.message : String(err)
        console.error(`[FAIL] ${file}: ${message}`)
        throw err
      }
    }

    console.log('\nAll migrations completed successfully.')
  } finally {
    client.release()
    await pool.end()
  }
}

migrate().catch((err: Error) => {
  console.error('Migration failed:', err.message)
  process.exit(1)
})
