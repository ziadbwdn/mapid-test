import { Pool } from 'pg'
import analyticsRepository from '../repositories/analyticsRepository'

function kpiService(pool: Pool) {
  const analyticsRepo = analyticsRepository(pool)

  async function getKPI(): Promise<Record<string, unknown> | null> {
    const result = await analyticsRepo.getKPI()
    return result as unknown as Record<string, unknown> | null
  }

  return { getKPI }
}

export default kpiService
