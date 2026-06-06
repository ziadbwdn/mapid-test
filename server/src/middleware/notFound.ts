import { Request, Response, NextFunction } from 'express'
import AppError from '../utils/AppError'

function notFound(req: Request, _res: Response, next: NextFunction): void {
  next(new AppError(404, 'NOT_FOUND', `Route ${req.originalUrl} tidak ditemukan`))
}

export default notFound
