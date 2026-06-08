import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.join(__dirname, '..', '..', '.env') })

interface DbPoolConfig {
  max: number
  idleTimeoutMillis: number
}

interface ServerConfig {
  port: number
  nodeEnv: string
}

interface DbConfig {
  url: string | undefined
  pool: DbPoolConfig
}

interface GeojsonConfig {
  apiUrl: string | undefined
}

interface CorsConfig {
  origin: string | string[]
}

interface AppConfig {
  server: ServerConfig
  db: DbConfig
  geojson: GeojsonConfig
  cors: CorsConfig
}

const config: AppConfig = {
  server: {
    port: parseInt(process.env.PORT || '3001', 10),
    nodeEnv: process.env.NODE_ENV || 'development'
  },
  db: {
    url: process.env.DATABASE_URL,
    pool: {
      max: parseInt(process.env.DB_POOL_MAX || '10', 10),
      idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT || '30000', 10)
    }
  },
  geojson: {
    apiUrl: process.env.GEOJSON_API_URL
  },
  cors: {
    origin: process.env.CORS_ORIGIN
      ? process.env.CORS_ORIGIN.split(',').map(s => s.trim())
      : 'http://localhost:3000'
  }
}

export default config
