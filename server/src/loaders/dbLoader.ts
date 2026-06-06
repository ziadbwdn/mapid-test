import { Pool } from 'pg'
import pool from '../config/database'
import logger from '../utils/logger'

async function dbLoader(): Promise<Pool> {
  try {
    const client = await pool.connect()
    const result = await client.query('SELECT NOW() AS current_time')
    client.release()
    logger.info(`Database connected — server time: ${result.rows[0].current_time}`)
    return pool
  } catch (err) {
    logger.error({ err }, 'Database connection failed')
    throw err
  }
}

export default dbLoader
