import { Request, Response } from 'express'
import asyncHandler from '../utils/asyncHandler'
import { sendSuccess } from '../utils/response'

function kpiHandler(kpiSvc: { getKPI: () => Promise<Record<string, unknown> | null> }) {
  return {
    getKPI: asyncHandler(async (_req: Request, res: Response) => {
      const kpi = await kpiSvc.getKPI()
      sendSuccess(res, kpi)
    })
  }
}

export default kpiHandler
