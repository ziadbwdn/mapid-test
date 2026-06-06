import { Express } from 'express'
import { Pool } from 'pg'
import expressLoader from './expressLoader'
import dbLoader from './dbLoader'

async function init({ expressApp }: { expressApp: Express }): Promise<Pool> {
  const pool = await dbLoader()
  await expressLoader({ app: expressApp, pool })
  return pool
}

export { init }
