import { Request, Response } from 'express'
import asyncHandler from '../utils/asyncHandler'
import { sendSuccess } from '../utils/response'

interface AnalyticsService {
  getCategoryDistribution: () => Promise<unknown>
  getSegmentDistribution: () => Promise<unknown>
  getCostDistribution: () => Promise<unknown>
  getHealthReport: () => Promise<unknown>
  getHealthQuadrant: () => Promise<unknown>
  getProfitByCategory: () => Promise<unknown>
  getMaintenanceHitlist: () => Promise<unknown>
  getBoxplotData: () => Promise<unknown>
}

function analyticsHandler(analyticsSvc: AnalyticsService) {
  return {
    getCategoryDistribution: asyncHandler(async (_req: Request, res: Response) => {
      const data = await analyticsSvc.getCategoryDistribution()
      sendSuccess(res, data)
    }),

    getSegmentDistribution: asyncHandler(async (_req: Request, res: Response) => {
      const data = await analyticsSvc.getSegmentDistribution()
      sendSuccess(res, data)
    }),

    getCostDistribution: asyncHandler(async (_req: Request, res: Response) => {
      const data = await analyticsSvc.getCostDistribution()
      sendSuccess(res, data)
    }),

    getHealthReport: asyncHandler(async (_req: Request, res: Response) => {
      const data = await analyticsSvc.getHealthReport()
      sendSuccess(res, data)
    }),

    getHealthQuadrant: asyncHandler(async (_req: Request, res: Response) => {
      const data = await analyticsSvc.getHealthQuadrant()
      sendSuccess(res, data)
    }),

    getProfitByCategory: asyncHandler(async (_req: Request, res: Response) => {
      const data = await analyticsSvc.getProfitByCategory()
      sendSuccess(res, data)
    }),

    getMaintenanceHitlist: asyncHandler(async (_req: Request, res: Response) => {
      const data = await analyticsSvc.getMaintenanceHitlist()
      sendSuccess(res, data)
    }),

    getBoxplotData: asyncHandler(async (_req: Request, res: Response) => {
      const data = await analyticsSvc.getBoxplotData()
      sendSuccess(res, data)
    })
  }
}

export default analyticsHandler
