import express from 'express'
import { init } from './loaders'
import config from './config'
import logger from './utils/logger'

async function start(): Promise<void> {
  const app = express()

  try {
    await init({ expressApp: app })
    app.listen(config.server.port, () => {
      logger.info(`Server running on port ${config.server.port} — ${config.server.nodeEnv}`)
    })
  } catch (err) {
    logger.error({ err }, 'Server failed to start')
    process.exit(1)
  }
}

start()
