import { Request, Response, NextFunction } from 'express'
import logger from '../utils/logger'
import AppError from '../utils/AppError'

function errorHandler(
  err: Error | AppError,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  const statusCode = err instanceof AppError ? err.statusCode : 500
  const code = err instanceof AppError ? err.code : 'INTERNAL_ERROR'
  const message = err instanceof AppError && err.isOperational
    ? err.message
    : 'Terjadi kesalahan server'

  logger.error({ err, statusCode, method: req.method, url: req.originalUrl })

  res.status(statusCode).json({
    success: false,
    error: { code, message }
  })
}

export default errorHandler
