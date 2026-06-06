import { Request, Response } from 'express'
import asyncHandler from '../utils/asyncHandler'
import { sendSuccess } from '../utils/response'

function importHandler(importSvc: { runImport: () => Promise<Record<string, unknown>> }) {
  return {
    runImport: asyncHandler(async (_req: Request, res: Response) => {
      const result = await importSvc.runImport()
      sendSuccess(res, result)
    })
  }
}

export default importHandler
