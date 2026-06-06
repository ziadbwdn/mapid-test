import { Pool } from 'pg'
import config from './index'
import logger from '../utils/logger'

const pool = new Pool({
  connectionString: config.db.url,
  ...config.db.pool
})

pool.on('error', (err: Error) => {
  logger.error({ err }, 'Unexpected database pool error')
})

export default pool
